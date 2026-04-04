from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
import requests
from bs4 import BeautifulSoup
import logging
import uuid
import re

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jewellers_mb_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_order_number() -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_suffix = str(uuid.uuid4())[:4].upper()
    return f"JMB{timestamp}{random_suffix}"

def scrape_gold_rates(url: str) -> dict:
    """
    Scrape gold rates from goodreturns.in Mysore page.
    Falls back to correct current market rates if scraping fails.
    """

    # Current fallback rates (updated April 2026 — update these monthly if scraping fails)
    FALLBACK_RATES = {
        'k24_rate': 14897.0,
        'k22_rate': 13655.0,
        'k18_rate': 11173.0
    }

    def extract_number(text: str) -> float:
        """Extract a float number from a string like ₹14,897 or 14897.00"""
        cleaned = re.sub(r'[₹,\s]', '', text)
        match = re.search(r'\d+\.?\d*', cleaned)
        if match:
            return float(match.group())
        return 0.0

    # Try multiple user agents to bypass 403 blocks
    headers_list = [
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-IN,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.google.com/',
            'Connection': 'keep-alive',
        },
        {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-IN,en;q=0.5',
            'Referer': 'https://www.google.com/',
        }
    ]

    for headers in headers_list:
        try:
            response = requests.get(
                url,
                headers=headers,
                timeout=15,
                allow_redirects=True
            )

            if response.status_code != 200:
                logger.warning(f"Got status {response.status_code} from {url}")
                continue

            soup = BeautifulSoup(response.content, 'html.parser')
            rates = {'k24_rate': 0.0, 'k22_rate': 0.0, 'k18_rate': 0.0}

            # Strategy 1: Look for table rows with gold purity info
            tables = soup.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 2:
                        row_text = row.get_text().lower()
                        # Look for per gram rates (not per 10 gram)
                        if '1 gram' in row_text or 'per gram' in row_text or ('gram' in row_text and '10' not in row_text):
                            for i, cell in enumerate(cells):
                                cell_text = cell.get_text(strip=True).lower()
                                if '24' in cell_text:
                                    # Next cell should have rate
                                    for j in range(i+1, min(i+3, len(cells))):
                                        val = extract_number(cells[j].get_text(strip=True))
                                        if 5000 < val < 50000:
                                            rates['k24_rate'] = val
                                elif '22' in cell_text:
                                    for j in range(i+1, min(i+3, len(cells))):
                                        val = extract_number(cells[j].get_text(strip=True))
                                        if 5000 < val < 50000:
                                            rates['k22_rate'] = val
                                elif '18' in cell_text:
                                    for j in range(i+1, min(i+3, len(cells))):
                                        val = extract_number(cells[j].get_text(strip=True))
                                        if 5000 < val < 50000:
                                            rates['k18_rate'] = val

            # Strategy 2: Look for elements with specific class names
            if rates['k24_rate'] == 0.0:
                for elem in soup.find_all(['span', 'div', 'td', 'p']):
                    text = elem.get_text(strip=True)
                    val = extract_number(text)
                    if 5000 < val < 50000:
                        parent_text = ''
                        if elem.parent:
                            parent_text = elem.parent.get_text().lower()
                        combined = (text + parent_text).lower()
                        if '24' in combined and rates['k24_rate'] == 0.0:
                            rates['k24_rate'] = val
                        elif '22' in combined and rates['k22_rate'] == 0.0:
                            rates['k22_rate'] = val
                        elif '18' in combined and rates['k18_rate'] == 0.0:
                            rates['k18_rate'] = val

            # Validate — rates should be in reasonable range for 2024-2026
            if rates['k24_rate'] > 5000:
                # Calculate missing rates from 24k
                if rates['k22_rate'] == 0.0:
                    rates['k22_rate'] = round(rates['k24_rate'] * 0.9167, 2)
                if rates['k18_rate'] == 0.0:
                    rates['k18_rate'] = round(rates['k24_rate'] * 0.75, 2)

                logger.info(f"Successfully scraped gold rates: {rates}")
                return rates

        except Exception as e:
            logger.error(f"Scraping attempt failed: {str(e)}")
            continue

    # All attempts failed — use up-to-date fallback
    logger.warning("All scraping attempts failed. Using fallback rates.")
    return FALLBACK_RATES


def calculate_price(weight: float, wastage_percent: float, making_charges: float,
                   stone_charges: float, gold_rate: float, gst_percent: float = 3.0) -> float:
    """
    Calculate final jewellery price
    Formula: (((weight + wastage%) × gold rate) + stone charges + making charges) + GST%
    """
    wastage_weight = weight * (wastage_percent / 100)
    total_weight = weight + wastage_weight
    gold_cost = total_weight * gold_rate
    subtotal = gold_cost + stone_charges + making_charges
    gst_amount = subtotal * (gst_percent / 100)
    final_price = subtotal + gst_amount
    return round(final_price, 2)

def generate_uuid() -> str:
    return str(uuid.uuid4())
