from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_MAKING = "in_making"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    ADVANCE_PAID = "advance_paid"
    FULL_PAID = "full_paid"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    WHATSAPP = "whatsapp"

class StockStatus(str, Enum):
    IN_STOCK = "in_stock"
    MADE_TO_ORDER = "made_to_order"
    OUT_OF_STOCK = "out_of_stock"

class GoldPurity(str, Enum):
    K24 = "24k"
    K22 = "22k"
    K18 = "18k"

# Category Models
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    slug: str
    display_image: Optional[str] = None
    subcategories: List[str] = []  # ["men", "women"] or empty
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    display_image: Optional[str] = None
    subcategories: List[str] = []
    order: int = 0

# Product Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    category_id: str
    subcategory: Optional[str] = None  # "men" or "women" or None
    images: List[str] = []
    description: Optional[str] = None
    weight: float  # in grams
    wastage_percent: float = 0.0
    making_charges: float = 0.0
    stone_charges: float = 0.0
    purity: GoldPurity = GoldPurity.K22
    stock_status: StockStatus = StockStatus.IN_STOCK
    is_featured: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    category_id: str
    subcategory: Optional[str] = None
    images: List[str] = []
    description: Optional[str] = None
    weight: float
    wastage_percent: float = 0.0
    making_charges: float = 0.0
    stone_charges: float = 0.0
    purity: str = "22k"
    stock_status: str = "in_stock"
    is_featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    subcategory: Optional[str] = None
    images: Optional[List[str]] = None
    description: Optional[str] = None
    weight: Optional[float] = None
    wastage_percent: Optional[float] = None
    making_charges: Optional[float] = None
    stone_charges: Optional[float] = None
    purity: Optional[str] = None
    stock_status: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

# Customer Models
class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    email: Optional[str] = None
    phone: str
    dob: Optional[str] = None
    address: Optional[str] = None
    shipping_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    total_orders: int = 0
    notes: Optional[str] = None

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str
    dob: Optional[str] = None
    address: Optional[str] = None
    shipping_address: Optional[str] = None
    notes: Optional[str] = None

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int = 1
    calculated_price: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    order_number: str  # Human readable order number
    customer_id: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    items: List[OrderItem] = []
    total_amount: float
    advance_amount: float = 0.0
    paid_amount: float = 0.0
    order_status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: PaymentMethod = PaymentMethod.WHATSAPP
    delivery_date: Optional[str] = None
    is_custom_order: bool = False
    custom_order_details: Optional[str] = None
    notes: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    items: List[OrderItem] = []
    total_amount: float
    advance_amount: float = 0.0
    payment_method: str = "whatsapp"
    delivery_date: Optional[str] = None
    is_custom_order: bool = False
    custom_order_details: Optional[str] = None
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None
    delivery_date: Optional[str] = None
    notes: Optional[str] = None
    paid_amount: Optional[float] = None

# Custom Order Inquiry
class CustomOrderInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    jewellery_type: str
    description: str
    approximate_weight: Optional[float] = None
    estimated_price: Optional[float] = None
    reference_images: List[str] = []
    status: str = "new"  # new, contacted, converted, closed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CustomOrderInquiryCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    jewellery_type: str
    description: str
    approximate_weight: Optional[float] = None
    estimated_price: Optional[float] = None
    reference_images: List[str] = []

# Gold Rate Models
class GoldRate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    k24_rate: float
    k22_rate: float
    k18_rate: float
    source: str = "goodreturns.in"
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# Calculator Models
class PriceCalculation(BaseModel):
    weight: float
    wastage_percent: float
    making_charges: float
    stone_charges: float
    purity: str = "22k"
    gold_rate: Optional[float] = None

class PriceResult(BaseModel):
    final_price: float
    gold_rate_used: float
    purity: str

# Settings Models
class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = "site_settings"
    logo_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    business_name: str = "Jewellers MB"
    tagline: str = "Exquisite South Indian Nakshi & Antique Jewellery"
    email: str = "jewellersmb786@gmail.com"
    phone: str = "+917019539776"
    whatsapp: str = "+917019539776"
    instagram: Optional[str] = "@jewellersmb"
    facebook: Optional[str] = None
    youtube: Optional[str] = None
    twitter: Optional[str] = None
    address: Optional[str] = None
    store_location: Optional[str] = None
    about_heading: Optional[str] = None
    about_body: Optional[str] = None
    gold_rate_url: str = "https://www.goodreturns.in/gold-rates/mysore.html"
    k24_rate: float = 15093.0
    k22_rate: float = 13835.0
    k18_rate: float = 11320.0
    current_gold_rate: float = 13835.0
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    advance_payment_percent: float = 30.0
    gst_percent: float = 3.0
    card_payment_charges_percent: float = 2.0
    rates_updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SettingsUpdate(BaseModel):
    logo_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    business_name: Optional[str] = None
    tagline: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None
    twitter: Optional[str] = None
    address: Optional[str] = None
    store_location: Optional[str] = None
    about_heading: Optional[str] = None
    about_body: Optional[str] = None
    gold_rate_url: Optional[str] = None
    k24_rate: Optional[float] = None
    k22_rate: Optional[float] = None
    k18_rate: Optional[float] = None
    current_gold_rate: Optional[float] = None
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    advance_payment_percent: Optional[float] = None
    gst_percent: Optional[float] = None
    card_payment_charges_percent: Optional[float] = None

# Admin Models
class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    username: str
    email: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
