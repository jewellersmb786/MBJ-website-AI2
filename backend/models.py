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
    subcategories: List[str] = []
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    slug: str
    display_image: Optional[str] = None
    subcategories: List[str] = []
    order: int = 0
    is_active: bool = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    display_image: Optional[str] = None
    subcategories: Optional[List[str]] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

# Product Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    category_id: str
    subcategory: Optional[str] = None
    images: List[str] = []
    weight: float
    purity: str = "22k"
    making_charges: float = 0.0
    stone_charges: float = 0.0
    wastage_percent: float = 0.0
    stock_status: StockStatus = StockStatus.IN_STOCK
    is_featured: bool = False
    is_active: bool = True
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    category_id: str
    subcategory: Optional[str] = None
    images: List[str] = []
    weight: float
    purity: str = "22k"
    making_charges: float = 0.0
    stone_charges: float = 0.0
    wastage_percent: float = 0.0
    stock_status: StockStatus = StockStatus.IN_STOCK
    is_featured: bool = False
    is_active: bool = True
    tags: List[str] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    subcategory: Optional[str] = None
    images: Optional[List[str]] = None
    weight: Optional[float] = None
    purity: Optional[str] = None
    making_charges: Optional[float] = None
    stone_charges: Optional[float] = None
    wastage_percent: Optional[float] = None
    stock_status: Optional[StockStatus] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    weight: float
    purity: str
    gold_rate: float
    making_charges: float
    stone_charges: float
    wastage_percent: float
    quantity: int = 1
    unit_price: float
    total_price: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    order_number: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    items: List[OrderItem] = []
    total_amount: float
    advance_amount: float = 0.0
    balance_amount: float = 0.0
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: PaymentMethod = PaymentMethod.OFFLINE
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    items: List[OrderItem]
    total_amount: float
    advance_amount: float = 0.0
    payment_method: PaymentMethod = PaymentMethod.OFFLINE
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    advance_amount: Optional[float] = None
    notes: Optional[str] = None

# Custom Order Models
class CustomOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    description: str
    reference_images: List[str] = []
    budget: Optional[float] = None
    purity: str = "22k"
    status: OrderStatus = OrderStatus.PENDING
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CustomOrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    description: str
    reference_images: List[str] = []
    budget: Optional[float] = None
    purity: str = "22k"

# Customer Models
class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    total_orders: int = 0
    total_spent: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Gold Rate Models
class GoldRate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    k24_rate: float
    k22_rate: float
    k18_rate: float
    source: Optional[str] = None
    last_updated: Optional[datetime] = None

class CalculatorInput(BaseModel):
    weight: float
    wastage_percent: float = 0.0
    making_charges: float = 0.0
    stone_charges: float = 0.0
    gold_rate: Optional[float] = None
    purity: str = "22k"
    gst_percent: float = 3.0

# Settings Models
class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    logo_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    business_name: str = "Jewellers MB"
    tagline: str = "Nakshi & Antique Jewellery"
    email: str = "jewellersmb786@gmail.com"
    phone: str = "+917019539776"
    whatsapp: str = "+917019539776"
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None
    twitter: Optional[str] = None
    address: Optional[str] = None
    store_location: Optional[str] = None
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

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
