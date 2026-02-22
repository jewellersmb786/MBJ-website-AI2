from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
import requests
from bs4 import BeautifulSoup
import logging
import uuid

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jewellers_mb_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify a JWT token and return the payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_order_number() -> str:
    """Generate a human-readable order number"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_suffix = str(uuid.uuid4())[:4].upper()
    return f"JMB{timestamp}{random_suffix}"

def scrape_gold_rates(url: str) -> dict:
    """
    Scrape gold rates from goodreturns.in
    Returns dict with k24_rate, k22_rate, k18_rate
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the table with gold rates
        # Structure: Look for table with gold rates per gram
        rates = {
            'k24_rate': 0.0,
            'k22_rate': 0.0,
            'k18_rate': 0.0
        }
        
        # Try to find the rates in the table
        # The website has a table with rates for different purities
        tables = soup.find_all('table')
        
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    purity_cell = cells[0].get_text(strip=True).lower()
                    
                    # Look for "per gram" or "1 gram" rates
                    if 'gram' in purity_cell or '1 g' in purity_cell:
                        rate_text = cells[1].get_text(strip=True)
                        # Extract number from text (remove ₹, commas, etc.)
                        rate_text = rate_text.replace('₹', '').replace(',', '').strip()
                        
                        try:
                            rate = float(rate_text)
                            
                            if '24' in purity_cell:
                                rates['k24_rate'] = rate
                            elif '22' in purity_cell:
                                rates['k22_rate'] = rate
                            elif '18' in purity_cell:
                                rates['k18_rate'] = rate
                        except ValueError:
                            continue
        
        # Fallback: if rates are not found, try alternative structure
        if rates['k24_rate'] == 0.0 or rates['k22_rate'] == 0.0:
            # Look for divs or spans with rate information
            rate_elements = soup.find_all(['div', 'span', 'td'], class_=lambda x: x and 'rate' in x.lower())
            
            for elem in rate_elements:
                text = elem.get_text(strip=True)
                if '24 k' in text.lower() or '24k' in text.lower():
                    # Extract number
                    numbers = ''.join(c for c in text if c.isdigit() or c == '.')
                    try:
                        rates['k24_rate'] = float(numbers) if numbers else 0.0
                    except:
                        pass
        
        # If we still don't have rates, use default fallback values
        if rates['k24_rate'] == 0.0:
            logger.warning("Could not scrape gold rates, using fallback values")
            rates = {
                'k24_rate': 7200.0,
                'k22_rate': 6600.0,
                'k18_rate': 5400.0
            }
        else:
            # Calculate other rates if only 24k is found
            if rates['k22_rate'] == 0.0:
                rates['k22_rate'] = rates['k24_rate'] * 0.916
            if rates['k18_rate'] == 0.0:
                rates['k18_rate'] = rates['k24_rate'] * 0.75
        
        logger.info(f"Scraped gold rates: {rates}")
        return rates
        
    except Exception as e:
        logger.error(f"Error scraping gold rates: {str(e)}")
        # Return fallback rates
        return {
            'k24_rate': 7200.0,
            'k22_rate': 6600.0,
            'k18_rate': 5400.0
        }

def calculate_price(weight: float, wastage_percent: float, making_charges: float, 
                   stone_charges: float, gold_rate: float, gst_percent: float = 3.0) -> float:
    """
    Calculate final jewellery price
    Formula: (((weight + wastage%) × gold rate) + stone charges + making charges) + GST%
    """
    # Calculate wastage weight
    wastage_weight = weight * (wastage_percent / 100)
    total_weight = weight + wastage_weight
    
    # Calculate gold cost
    gold_cost = total_weight * gold_rate
    
    # Add stone and making charges
    subtotal = gold_cost + stone_charges + making_charges
    
    # Add GST
    gst_amount = subtotal * (gst_percent / 100)
    final_price = subtotal + gst_amount
    
    return round(final_price, 2)

def generate_uuid() -> str:
    """Generate a UUID string"""
    return str(uuid.uuid4())
