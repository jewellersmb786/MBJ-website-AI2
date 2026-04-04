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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jewellers_mb_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

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
    Scrapes goodreturns.in Mysore page and extracts rates from the summary sentence:
    "Today's gold price in Mysore stands at ₹15,093 per gram for 24 karat gold..."
    Returns None if scraping fails so server keeps last known good rates.
    """
    try:
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
        full_text = soup.get_text()

        # Target exact sentence:
        # "Today's gold price in Mysore stands at ₹15,093 per gram for 24 karat gold"
        match_24 = re.search(r'₹([\d,]+)\s*per\s*gram\s*for\s*24\s*karat', full_text, re.IGNORECASE)
        match_22 = re.search(r'₹([\d,]+)\s*per\s*gram\s*for\s*22\s*karat', full_text, re.IGNORECASE)
        match_18 = re.search(r'₹([\d,]+)\s*per\s*gram\s*for\s*18\s*karat', full_text, re.IGNORECASE)

        rates = {
            'k24_rate': float(match_24.group(1).replace(',', '')) if match_24 else 0.0,
            'k22_rate': float(match_22.group(1).replace(',', '')) if match_22 else 0.0,
            'k18_rate': float(match_18.group(1).replace(',', '')) if match_18 else 0.0,
        }

        # Validate — 24K must be a realistic value
        if rates['k24_rate'] > 5000:
            if rates['k22_rate'] == 0.0:
                rates['k22_rate'] = round(rates['k24_rate'] * 0.9167, 2)
            if rates['k18_rate'] == 0.0:
                rates['k18_rate'] = round(rates['k24_rate'] * 0.75, 2)
            logger.info(f"Successfully scraped gold rates: {rates}")
            return rates

        logger.warning("Rates not found in page — will keep last known good rates")
        return None

    except Exception as e:
        logger.error(f"Error scraping gold rates: {str(e)}")
        return None


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
