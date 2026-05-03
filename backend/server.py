import re
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
import base64

# Import models and utilities
from models import *
from pdf_generator import generate_catalogue_pdf
from utils import (
    verify_password, get_password_hash, create_access_token, verify_token,
    scrape_gold_rates, calculate_price, generate_order_number, generate_uuid
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'jewellers_mb')]

# Create the main app
app = FastAPI(title="Jewellers MB API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# AUTHENTICATION HELPERS
# ============================================================================

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return admin user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    admin = await db.admin_users.find_one({"id": admin_id}, {"_id": 0})
    if not admin or not admin.get("is_active"):
        raise HTTPException(status_code=401, detail="Admin not found or inactive")
    
    return admin

# ============================================================================
# INITIALIZATION - CREATE DEFAULT ADMIN & SETTINGS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database with default data"""
    # Create default admin if not exists
    admin_exists = await db.admin_users.find_one({"username": "admin"})
    if not admin_exists:
        default_admin = {
            "id": generate_uuid(),
            "username": "admin",
            "email": "jewellersmb786@gmail.com",
            "hashed_password": get_password_hash("admin123"),
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        await db.admin_users.insert_one(default_admin)
        logger.info("Default admin created: username='admin', password='admin123'")
    
    # Create default settings if not exists
    settings_exists = await db.settings.find_one({"id": "site_settings"})
    if not settings_exists:
        default_settings = {
            "id": "site_settings",
            "business_name": "Jewellers MB",
            "tagline": "Exquisite South Indian Nakshi & Antique Jewellery",
            "email": "jewellersmb786@gmail.com",
            "phone": "+917019539776",
            "whatsapp": "+917019539776",
            "instagram": "@jewellersmb",
            "gold_rate_url": "https://www.goodreturns.in/gold-rates/mysore.html",
            "k24_rate": 7200.0,
            "k22_rate": 6600.0,
            "k18_rate": 5400.0,
            "current_gold_rate": 6600.0,  # Kept for backward compatibility
            "advance_payment_percent": 30.0,
            "gst_percent": 3.0,
            "card_payment_charges_percent": 2.0,
            "rates_updated_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.settings.insert_one(default_settings)
        logger.info("Default settings created with k24_rate, k22_rate, k18_rate")
    else:
        # Ensure existing settings have the new rate fields
        update_fields = {}
        if "k24_rate" not in settings_exists:
            update_fields["k24_rate"] = 7200.0
        if "k22_rate" not in settings_exists:
            update_fields["k22_rate"] = 6600.0
        if "k18_rate" not in settings_exists:
            update_fields["k18_rate"] = 5400.0
        if "rates_updated_at" not in settings_exists:
            update_fields["rates_updated_at"] = datetime.utcnow()
        
        if update_fields:
            await db.settings.update_one(
                {"id": "site_settings"},
                {"$set": update_fields}
            )
            logger.info(f"Updated settings with new rate fields: {update_fields}")
    
    # Scrape and cache gold rates
    await update_gold_rates()

async def update_gold_rates():
    """Fetch and update gold rates"""
    try:
        settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
        gold_rate_url = settings.get("gold_rate_url", "https://www.goodreturns.in/gold-rates/mysore.html")
        
        rates = scrape_gold_rates(gold_rate_url)
        rates['last_updated'] = datetime.utcnow()
        rates['source'] = gold_rate_url
        
        await db.gold_rates.delete_many({})
        await db.gold_rates.insert_one(rates)
        logger.info(f"Gold rates updated: {rates}")
    except Exception as e:
        logger.error(f"Error updating gold rates: {str(e)}")

# ============================================================================
# PUBLIC APIs
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "Jewellers MB API", "version": "1.0"}

# Gold Rates
@api_router.get("/gold-rates", response_model=GoldRate)
async def get_gold_rates():
    """Get current gold rates"""
    rates = await db.gold_rates.find_one({}, {"_id": 0})
    
    if not rates:
        # Fetch new rates if not in cache
        await update_gold_rates()
        rates = await db.gold_rates.find_one({}, {"_id": 0})
    
    # Check if rates are older than 12 hours
    if rates:
        last_updated = rates.get('last_updated')
        if isinstance(last_updated, datetime):
            hours_old = (datetime.utcnow() - last_updated).total_seconds() / 3600
            if hours_old > 12:
                # Update rates in background
                await update_gold_rates()
                rates = await db.gold_rates.find_one({}, {"_id": 0})
    
    return rates

# Price Calculator
@api_router.post("/calculator", response_model=PriceResult)
async def calculate_jewellery_price(calc: PriceCalculation):
    """Calculate jewellery price"""
    # Get gold rate if not provided
    gold_rate = calc.gold_rate
    if not gold_rate:
        rates = await db.gold_rates.find_one({}, {"_id": 0})
        if calc.purity == "24k":
            gold_rate = rates.get('k24_rate', 7200)
        elif calc.purity == "18k":
            gold_rate = rates.get('k18_rate', 5400)
        else:  # default 22k
            gold_rate = rates.get('k22_rate', 6600)
    
    # Get GST from settings
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    gst_percent = settings.get('gst_percent', 3.0)
    
    final_price = calculate_price(
        calc.weight,
        calc.wastage_percent,
        calc.making_charges,
        calc.stone_charges,
        gold_rate,
        gst_percent
    )
    
    return {
        "final_price": final_price,
        "gold_rate_used": gold_rate,
        "purity": calc.purity
    }

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories(active_only: bool = True):
    """Get all categories"""
    query = {"is_active": True} if active_only else {}
    categories = await db.categories.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return categories

@api_router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: str):
    """Get single category"""
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

# Products
@api_router.get("/products", response_model=List[Product])
async def get_products(
    category_id: Optional[str] = None,
    subcategory: Optional[str] = None,
    stock_status: Optional[str] = None,
    featured_only: bool = False,
    active_only: bool = True,
    limit: int = 100
):
    """Get products with filters"""
    query = {}
    if active_only:
        query["is_active"] = True
    if category_id:
        query["category_id"] = category_id
    if subcategory:
        query["subcategory"] = subcategory
    if stock_status:
        query["stock_status"] = stock_status
    if featured_only:
        query["is_featured"] = True
    
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get single product"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Custom Order Inquiry
@api_router.post("/custom-order")
async def create_custom_order_inquiry(inquiry: CustomOrderInquiryCreate):
    """Submit custom order inquiry"""
    inquiry_data = inquiry.model_dump()
    inquiry_data['id'] = generate_uuid()
    inquiry_data['status'] = 'new'
    inquiry_data['created_at'] = datetime.utcnow()
    
    await db.custom_orders.insert_one(inquiry_data)
    return {"message": "Custom order inquiry submitted successfully", "id": inquiry_data['id']}

# Order Tracking (Public)
@api_router.get("/track/{order_id}")
async def track_order(order_id: str):
    """Track order by ID"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get customer info
    customer = await db.customers.find_one({"id": order['customer_id']}, {"_id": 0})
    
    # Get all orders for this customer
    customer_orders = await db.orders.find(
        {"customer_id": order['customer_id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {
        "customer": customer,
        "orders": customer_orders
    }

# Settings (Public)
@api_router.get("/settings/public")
async def get_public_settings():
    """Get public settings"""
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        return {}
    
    # Return only public fields including all gold rates
    return {
        "logo_url": settings.get("logo_url"),
        "hero_image_url": settings.get("hero_image_url"),
        "business_name": settings.get("business_name"),
        "tagline": settings.get("tagline"),
        "email": settings.get("email"),
        "phone": settings.get("phone"),
        "whatsapp": settings.get("whatsapp"),
        "instagram": settings.get("instagram"),
        "facebook": settings.get("facebook"),
        "youtube": settings.get("youtube"),
        "twitter": settings.get("twitter"),
        "address": settings.get("address"),
        "store_location": settings.get("store_location"),
        "about_heading": settings.get("about_heading"),
        "about_body": settings.get("about_body"),
        "k24_rate": settings.get("k24_rate", 15093.0),
        "k22_rate": settings.get("k22_rate", 13835.0),
        "k18_rate": settings.get("k18_rate", 11320.0),
        "current_gold_rate": settings.get("k22_rate", 13835.0),
        "rates_updated_at": settings.get("rates_updated_at", settings.get("updated_at")),
        "featured_category_ids": settings.get("featured_category_ids", [])
    }

# ============================================================================
# ADMIN APIs - Authentication
# ============================================================================

@api_router.post("/admin/login", response_model=Token)
async def admin_login(credentials: AdminLogin):
    """Admin login"""
    admin = await db.admin_users.find_one({"username": credentials.username}, {"_id": 0})
    
    if not admin or not verify_password(credentials.password, admin['hashed_password']):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    if not admin.get('is_active'):
        raise HTTPException(status_code=401, detail="Admin account is inactive")
    
    access_token = create_access_token(data={"sub": admin['id']})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/admin/me")
async def get_current_admin_info(admin = Depends(get_current_admin)):
    """Get current admin info"""
    return {
        "id": admin['id'],
        "username": admin['username'],
        "email": admin['email']
    }

# ============================================================================
# ADMIN APIs - Dashboard
# ============================================================================

@api_router.get("/admin/dashboard")
async def get_dashboard_stats(admin = Depends(get_current_admin)):
    """Get dashboard statistics"""
    total_products = await db.products.count_documents({"is_active": True})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    total_customers = await db.customers.count_documents({})
    custom_inquiries = await db.custom_orders.count_documents({"status": "new"})
    
    # Recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    # Calculate total revenue
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$paid_amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]['total'] if revenue_result else 0
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_customers": total_customers,
        "custom_inquiries": custom_inquiries,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders
    }

# ============================================================================
# ADMIN APIs - Categories
# ============================================================================

@api_router.post("/admin/categories")
async def create_category(category: CategoryCreate, admin = Depends(get_current_admin)):
    """Create new category"""
    category_data = category.model_dump()
    category_data['id'] = generate_uuid()
    category_data['slug'] = category.name.lower().replace(' ', '-')
    category_data['is_active'] = True
    category_data['created_at'] = datetime.utcnow()
    
    await db.categories.insert_one(category_data)
    return {"message": "Category created successfully", "id": category_data['id']}

@api_router.put("/admin/categories/{category_id}")
async def update_category(category_id: str, updates: dict, admin = Depends(get_current_admin)):
    """Update category"""
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category updated successfully"}

@api_router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str, admin = Depends(get_current_admin)):
    """Delete category"""
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# ============================================================================
# ADMIN APIs - Products
# ============================================================================

@api_router.post("/admin/products")
async def create_product(product: ProductCreate, admin = Depends(get_current_admin)):
    """Create new product"""
    product_data = product.model_dump()
    product_data['id'] = generate_uuid()
    product_data['is_active'] = True
    product_data['created_at'] = datetime.utcnow()
    product_data['updated_at'] = datetime.utcnow()
    
    await db.products.insert_one(product_data)
    return {"message": "Product created successfully", "id": product_data['id']}

@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, updates: ProductUpdate, admin = Depends(get_current_admin)):
    """Update product"""
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated successfully"}

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin = Depends(get_current_admin)):
    """Delete product (soft delete)"""
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ============================================================================
# ADMIN APIs - Orders
# ============================================================================

@api_router.get("/admin/orders")
async def get_all_orders(admin = Depends(get_current_admin), limit: int = 100):
    """Get all orders"""
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return orders

@api_router.post("/admin/orders")
async def create_order(order: OrderCreate, admin = Depends(get_current_admin)):
    """Create new order (manually by admin)"""
    order_data = order.model_dump()
    order_data['id'] = generate_uuid()
    order_data['order_number'] = generate_order_number()
    order_data['order_status'] = 'pending'
    order_data['payment_status'] = 'pending'
    order_data['paid_amount'] = 0.0
    order_data['created_at'] = datetime.utcnow()
    order_data['updated_at'] = datetime.utcnow()
    
    # Create or update customer
    if order_data.get('customer_id'):
        customer_id = order_data['customer_id']
    else:
        # Check if customer exists by phone
        existing_customer = await db.customers.find_one({"phone": order_data['customer_phone']})
        if existing_customer:
            customer_id = existing_customer['id']
        else:
            # Create new customer
            customer_id = generate_uuid()
            customer_data = {
                "id": customer_id,
                "name": order_data['customer_name'],
                "phone": order_data['customer_phone'],
                "email": order_data.get('customer_email'),
                "created_at": datetime.utcnow(),
                "total_orders": 0
            }
            await db.customers.insert_one(customer_data)
        
        order_data['customer_id'] = customer_id
    
    # Insert order
    await db.orders.insert_one(order_data)
    
    # Update customer order count
    await db.customers.update_one(
        {"id": customer_id},
        {"$inc": {"total_orders": 1}}
    )
    
    return {
        "message": "Order created successfully",
        "order_id": order_data['id'],
        "order_number": order_data['order_number'],
        "tracking_url": f"/track/{order_data['id']}"
    }

@api_router.put("/admin/orders/{order_id}")
async def update_order(order_id: str, updates: OrderUpdate, admin = Depends(get_current_admin)):
    """Update order"""
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order updated successfully"}

# ============================================================================
# ADMIN APIs - Customers
# ============================================================================

@api_router.get("/admin/customers")
async def get_all_customers(admin = Depends(get_current_admin)):
    """Get all customers"""
    customers = await db.customers.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return customers

@api_router.get("/admin/customers/{customer_id}")
async def get_customer_details(customer_id: str, admin = Depends(get_current_admin)):
    """Get customer details with order history"""
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    orders = await db.orders.find({"customer_id": customer_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return {
        "customer": customer,
        "orders": orders
    }

# ============================================================================
# ADMIN APIs - Custom Orders
# ============================================================================

@api_router.get("/admin/custom-orders")
async def get_custom_orders(admin = Depends(get_current_admin)):
    """Get all custom order inquiries"""
    inquiries = await db.custom_orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return inquiries

@api_router.put("/admin/custom-orders/{inquiry_id}")
async def update_custom_order_status(inquiry_id: str, status: str, admin = Depends(get_current_admin)):
    """Update custom order inquiry status"""
    result = await db.custom_orders.update_one(
        {"id": inquiry_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"message": "Status updated successfully"}

# ============================================================================
# ADMIN APIs - Settings
# ============================================================================

@api_router.get("/admin/settings")
async def get_settings(admin = Depends(get_current_admin)):
    """Get all settings"""
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    return settings

@api_router.put("/admin/settings")
async def update_settings(updates: SettingsUpdate, admin = Depends(get_current_admin)):
    """Update settings"""
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    # If any gold rate is updated, update rates_updated_at
    if any(k in update_data for k in ['k24_rate', 'k22_rate', 'k18_rate']):
        update_data['rates_updated_at'] = datetime.utcnow()
    
    result = await db.settings.update_one(
        {"id": "site_settings"},
        {"$set": update_data}
    )
    return {"message": "Settings updated successfully"}

@api_router.post("/admin/upload-logo")
async def upload_logo(file: UploadFile = File(...), admin = Depends(get_current_admin)):
    """Upload logo (convert to base64 for simplicity)"""
    contents = await file.read()
    base64_image = base64.b64encode(contents).decode('utf-8')
    logo_url = f"data:{file.content_type};base64,{base64_image}"
    
    await db.settings.update_one(
        {"id": "site_settings"},
        {"$set": {"logo_url": logo_url, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Logo uploaded successfully", "logo_url": logo_url}

@api_router.post("/admin/gold-rates/refresh")
async def refresh_gold_rates(admin = Depends(get_current_admin)):
    """Manually refresh gold rates"""
    await update_gold_rates()
    rates = await db.gold_rates.find_one({}, {"_id": 0})
    return {"message": "Gold rates refreshed successfully", "rates": rates}

# ============================================================================
# CATALOGUE SHARE APIs
# ============================================================================

@api_router.post("/catalogue/generate")
async def generate_catalogue(data: CatalogueShareCreate):
    """Generate a watermarked PDF catalogue and return a shareable link."""
    digits = re.sub(r"\D", "", data.customer_phone)
    if len(digits) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit phone number")

    if not data.product_ids:
        raise HTTPException(status_code=400, detail="No products selected")

    # Fetch products
    products = []
    for pid in data.product_ids:
        p = await db.products.find_one({"id": pid, "is_active": True}, {"_id": 0})
        if p:
            products.append(p)

    if not products:
        raise HTTPException(status_code=400, detail="None of the selected products are available")

    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    share_id = generate_uuid()
    now = datetime.utcnow()
    expires_at = now + timedelta(days=7)

    try:
        pdf_data = generate_catalogue_pdf(
            products, data.customer_name, data.customer_phone,
            share_id, settings, expires_at
        )
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        pdf_data = ""

    share_doc = {
        "id": share_id,
        "customer_name": data.customer_name,
        "customer_phone": data.customer_phone,
        "product_ids": data.product_ids,
        "filters_applied": data.filters_applied or {},
        "created_at": now,
        "expires_at": expires_at,
        "view_count": 0,
        "is_revoked": False,
        "pdf_data": pdf_data,
    }
    await db.catalogue_shares.insert_one(share_doc)

    return {"id": share_id, "view_url": f"/catalogue/{share_id}"}


@api_router.get("/catalogue/{share_id}")
async def view_catalogue(share_id: str):
    """Public endpoint — returns catalogue data for the viewer page."""
    share = await db.catalogue_shares.find_one({"id": share_id}, {"_id": 0})
    if not share:
        raise HTTPException(status_code=404, detail="Catalogue not found")
    if share.get("is_revoked"):
        raise HTTPException(status_code=410, detail="This catalogue has been revoked")
    if datetime.utcnow() > share.get("expires_at", datetime.utcnow()):
        raise HTTPException(status_code=410, detail="This catalogue link has expired")

    await db.catalogue_shares.update_one({"id": share_id}, {"$inc": {"view_count": 1}})

    products = []
    for pid in share.get("product_ids", []):
        p = await db.products.find_one({"id": pid}, {"_id": 0})
        if p:
            products.append(p)

    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    expires_at = share.get("expires_at")
    expires_str = expires_at.isoformat() if hasattr(expires_at, "isoformat") else str(expires_at)

    return {
        "share_id": share_id,
        "customer_name": share["customer_name"],
        "customer_phone": share["customer_phone"],
        "expires_at": expires_str,
        "view_count": share.get("view_count", 0) + 1,
        "products": products,
        "settings": {
            "whatsapp": settings.get("whatsapp", ""),
            "business_name": settings.get("business_name", "Jewellers MB"),
            "k22_rate": settings.get("k22_rate", 13835),
        },
    }


@api_router.get("/admin/catalogue-shares")
async def list_catalogue_shares(admin=Depends(get_current_admin)):
    """Admin: list all catalogue shares (excludes pdf_data)."""
    shares = await db.catalogue_shares.find(
        {}, {"_id": 0, "pdf_data": 0}
    ).sort("created_at", -1).to_list(200)
    result = []
    for s in shares:
        expires_at = s.get("expires_at")
        expires_str = expires_at.isoformat() if hasattr(expires_at, "isoformat") else str(expires_at)
        created_at = s.get("created_at")
        created_str = created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at)
        result.append({
            "id": s["id"],
            "customer_name": s.get("customer_name", ""),
            "customer_phone": s.get("customer_phone", ""),
            "product_count": len(s.get("product_ids", [])),
            "created_at": created_str,
            "expires_at": expires_str,
            "view_count": s.get("view_count", 0),
            "is_revoked": s.get("is_revoked", False),
        })
    return result


@api_router.put("/admin/catalogue-shares/{share_id}/revoke")
async def revoke_catalogue(share_id: str, admin=Depends(get_current_admin)):
    """Admin: revoke a catalogue link."""
    result = await db.catalogue_shares.update_one(
        {"id": share_id}, {"$set": {"is_revoked": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Catalogue not found")
    return {"message": "Catalogue revoked"}


@api_router.post("/admin/catalogue-shares/{share_id}/regenerate")
async def regenerate_catalogue(share_id: str, admin=Depends(get_current_admin)):
    """Admin: regenerate PDF and reset expiry for an existing catalogue."""
    share = await db.catalogue_shares.find_one({"id": share_id}, {"_id": 0})
    if not share:
        raise HTTPException(status_code=404, detail="Catalogue not found")

    products = []
    for pid in share.get("product_ids", []):
        p = await db.products.find_one({"id": pid}, {"_id": 0})
        if p:
            products.append(p)

    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}
    new_expires = datetime.utcnow() + timedelta(days=7)

    try:
        pdf_data = generate_catalogue_pdf(
            products, share["customer_name"], share["customer_phone"],
            share_id, settings, new_expires
        )
    except Exception as e:
        logger.error(f"PDF regeneration failed: {e}")
        pdf_data = share.get("pdf_data", "")

    await db.catalogue_shares.update_one(
        {"id": share_id},
        {"$set": {"pdf_data": pdf_data, "expires_at": new_expires, "is_revoked": False}},
    )
    return {"id": share_id, "view_url": f"/catalogue/{share_id}"}


# ============================================================================
# Include router and setup
# ============================================================================

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
