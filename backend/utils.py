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

def extract_number(text: str) -> float:
    """Extract a float number from text like Rs.14,897 or 14897.00"""
    cleaned = re.sub(r'[₹,\s]', '', text)
    match = re.search(r'\d+\.?\d*', cleaned)
    if match:
        val = float(match.group())
        if 5000 < val < 100000:
            return val
    return 0.0

def scrape_from_goodreturns() -> dict:
    """Scrape from goodreturns.in Mysore page"""
    url = "https://www.goodreturns.in/gold-rates/mysore.html"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'Connection': 'keep-alive',
    }
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    rates = {'k24_rate': 0.0, 'k22_rate': 0.0, 'k18_rate': 0.0}

    for table in soup.find_all('table'):
        rows = table.find_all('tr')
        for row in rows:
            cells = row.find_all(['td', 'th'])
            row_text = row.get_text().lower()
            if 'gram' in row_text and '10 gram' not in row_text and '10gm' not in row_text:
                for i, cell in enumerate(cells):
                    cell_text = cell.get_text(strip=True).lower()
                    if '24' in cell_text and rates['k24_rate'] == 0.0:
                        for j in range(i+1, min(i+4, len(cells))):
                            val = extract_number(cells[j].get_text(strip=True))
                            if val > 0:
                                rates['k24_rate'] = val
                                break
                    elif '22' in cell_text and rates['k22_rate'] == 0.0:
                        for j in range(i+1, min(i+4, len(cells))):
                            val = extract_number(cells[j].get_text(strip=True))
                            if val > 0:
                                rates['k22_rate'] = val
                                break
                    elif '18' in cell_text and rates['k18_rate'] == 0.0:
                        for j in range(i+1, min(i+4, len(cells))):
                            val = extract_number(cells[j].get_text(strip=True))
                            if val > 0:
                                rates['k18_rate'] = val
                                break
    return rates

def scrape_from_ibja() -> dict:
    """Scrape from IBJA - Indian Bullion and Jewellers Association"""
    url = "https://ibjarates.com/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Referer': 'https://www.google.com/',
    }
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    rates = {'k24_rate': 0.0, 'k22_rate': 0.0, 'k18_rate': 0.0}

    for table in soup.find_all('table'):
        rows = table.find_all('tr')
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                row_text = row.get_text().lower()
                if '999' in row_text or '24k' in row_text:
                    for cell in cells[1:]:
                        val = extract_number(cell.get_text(strip=True))
                        if val > 50000:
                            rates['k24_rate'] = round(val / 10, 2)
                            break
                elif '916' in row_text or '22k' in row_text:
                    for cell in cells[1:]:
                        val = extract_number(cell.get_text(strip=True))
                        if val > 50000:
                            rates['k22_rate'] = round(val / 10, 2)
                            break
                elif '750' in row_text or '18k' in row_text:
                    for cell in cells[1:]:
                        val = extract_number(cell.get_text(strip=True))
                        if val > 50000:
                            rates['k18_rate'] = round(val / 10, 2)
                            break
    return rates

def scrape_gold_rates(url: str) -> dict:
    """
    Try multiple sources for gold rates.
    Falls back to correct current market rates if all scraping fails.
    """

    # Up-to-date fallback rates (April 2026 Mysore rates)
    FALLBACK_RATES = {
        'k24_rate': 15093.0,
        'k22_rate': 13835.0,
        'k18_rate': 11320.0
    }

    scrapers = [
        ('goodreturns', scrape_from_goodreturns),
        ('ibja', scrape_from_ibja),
    ]

    for source_name, scraper_func in scrapers:
        try:
            logger.info(f"Trying to scrape gold rates from {source_name}...")
            rates = scraper_func()

            if rates.get('k24_rate', 0) > 5000:
                if rates.get('k22_rate', 0) == 0:
                    rates['k22_rate'] = round(rates['k24_rate'] * 0.9167, 2)
                if rates.get('k18_rate', 0) == 0:
                    rates['k18_rate'] = round(rates['k24_rate'] * 0.75, 2)
                logger.info(f"Successfully scraped from {source_name}: {rates}")
                return rates
            else:
                logger.warning(f"{source_name} returned invalid rates: {rates}")

        except Exception as e:
            logger.error(f"Failed to scrape from {source_name}: {str(e)}")
            continue

    logger.warning("All scraping sources failed. Using fallback rates.")
    return FALLBACK_RATES


def calculate_price(weight: float, wastage_percent: float, making_charges: float,
                   stone_charges: float, gold_rate: float, gst_percent: float = 3.0) -> float:
    wastage_weight = weight * (wastage_percent / 100)
    total_weight = weight + wastage_weight
    gold_cost = total_weight * gold_rate
    subtotal = gold_cost + stone_charges + making_charges
    gst_amount = subtotal * (gst_percent / 100)
    final_price = subtotal + gst_amount
    return round(final_price, 2)

def generate_uuid() -> str:
    return str(uuid.uuid4())
