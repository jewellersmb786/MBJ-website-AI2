import re
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, File, UploadFile, Request
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
    
    # Seed default schemes if collection is empty
    try:
        from seed_data import seed_default_schemes, _migrate_scheme_types
        await seed_default_schemes(db, lambda: str(uuid.uuid4()))
        logger.info("Scheme seed check complete")
        await _migrate_scheme_types(db)
        logger.info("Scheme type migration complete")
    except Exception as e:
        logger.error(f"Scheme seeding/migration failed (non-fatal): {e}")

    # Seed default filter attributes per top-level category
    try:
        from seed_data import seed_default_filter_attributes
        await seed_default_filter_attributes(db, lambda: str(uuid.uuid4()))
        logger.info("Filter attribute seed check complete")
    except Exception as e:
        logger.error(f"Filter attribute seeding failed (non-fatal): {e}")

    # Seed default gemstones if collection is empty
    try:
        from seed_data import seed_default_gemstones
        await seed_default_gemstones(db, lambda: str(uuid.uuid4()))
        logger.info("Gemstone seed check complete")
    except Exception as e:
        logger.error(f"Gemstone seeding failed (non-fatal): {e}")

    # Seed default spiritual article types if collection is empty
    try:
        from seed_data import seed_default_article_types
        await seed_default_article_types(db, lambda: str(uuid.uuid4()))
        logger.info("Article type seed check complete")
    except Exception as e:
        logger.error(f"Article type seeding failed (non-fatal): {e}")

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

# ─── helper: collect all descendant IDs (including self) ────────────────────
async def _get_descendant_ids(root_id: str) -> list:
    all_cats = await db.categories.find({}, {"_id": 0, "id": 1, "parent_id": 1}).to_list(500)
    ids = {root_id}
    queue = [root_id]
    while queue:
        parent = queue.pop()
        for c in all_cats:
            if c.get("parent_id") == parent and c["id"] not in ids:
                ids.add(c["id"])
                queue.append(c["id"])
    return list(ids)

# ─── helper: resolve top-level ancestor ─────────────────────────────────────
async def _get_top_level_id(category_id: str) -> str:
    cat = await db.categories.find_one({"id": category_id}, {"_id": 0, "parent_id": 1})
    if not cat:
        return category_id
    if not cat.get("parent_id"):
        return category_id
    return await _get_top_level_id(cat["parent_id"])

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories(active_only: bool = True):
    query = {"is_active": True} if active_only else {}
    categories = await db.categories.find(query, {"_id": 0}).sort("order", 1).to_list(500)
    return categories

@api_router.get("/categories/{category_id}/descendants")
async def get_category_descendants(category_id: str):
    ids = await _get_descendant_ids(category_id)
    return {"category_id": category_id, "descendant_ids": ids}

@api_router.get("/categories/{category_id}/filter-attributes")
async def get_filter_attributes_public(category_id: str):
    """Return filter attributes with options pruned to only values used by actual products."""
    top_id = await _get_top_level_id(category_id)
    all_attrs = await db.filter_attributes.find(
        {"category_id": top_id, "is_active": True}, {"_id": 0}
    ).sort("display_order", 1).to_list(50)
    if not all_attrs:
        return []

    # Collect all descendant category IDs for this top-level
    desc_ids = await _get_descendant_ids(top_id)

    # Fetch attribute_values from all active products in those categories
    products = await db.products.find(
        {"category_id": {"$in": desc_ids}, "is_active": True},
        {"_id": 0, "attribute_values": 1}
    ).to_list(5000)

    # Build attr_name → set of values actually used
    used: dict = {}
    for p in products:
        for attr_name, val in (p.get("attribute_values") or {}).items():
            if val:
                used.setdefault(attr_name, set()).add(val)

    # Prune each attribute: keep only options present in product data
    result = []
    for attr in all_attrs:
        master_options = attr.get("options", [])
        product_vals = used.get(attr.get("name", ""), set())
        # Intersect, preserving master list order
        filtered_options = [opt for opt in master_options if opt in product_vals]
        if not filtered_options:
            continue  # attribute has no used options — hide entire section
        result.append({**attr, "options": filtered_options})
    return result

@api_router.get("/categories/{category_id}")
async def get_category(category_id: str):
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

# Products
def _adapt_product(doc: dict) -> dict:
    """Read-time adapter: products with old `images` list get image_dummy/image_model set."""
    if doc.get("image_dummy") is None:
        imgs = doc.get("images") or []
        if imgs:
            doc["image_dummy"] = imgs[0]
            doc["image_model"] = imgs[1] if len(imgs) > 1 else None
    return doc


@api_router.get("/products", response_model=List[Product])
async def get_products(
    request: Request,
    category_id: Optional[str] = None,
    subcategory: Optional[str] = None,
    stock_status: Optional[str] = None,
    featured_only: bool = False,
    active_only: bool = True,
    weight_min: Optional[float] = None,
    weight_max: Optional[float] = None,
    purity: Optional[str] = None,
    name: Optional[str] = None,
    item_code: Optional[str] = None,
    limit: int = 1000
):
    """Get products with filters — supports category descendants + attribute_values filters."""
    _KNOWN = {"category_id","subcategory","stock_status","featured_only","active_only",
              "weight_min","weight_max","purity","name","item_code","limit"}
    attr_filters = {k: v for k, v in request.query_params.multi_items()
                    if k not in _KNOWN}

    query = {}
    if active_only:
        query["is_active"] = True
    if category_id:
        desc_ids = await _get_descendant_ids(category_id)
        query["category_id"] = {"$in": desc_ids}
    if subcategory:
        query["subcategory"] = subcategory
    if stock_status:
        query["stock_status"] = stock_status
    if featured_only:
        query["is_featured"] = True
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    if item_code:
        query["item_code"] = {"$regex": item_code, "$options": "i"}
    if weight_min is not None:
        query.setdefault("weight", {})["$gte"] = weight_min
    if weight_max is not None:
        query.setdefault("weight", {})["$lte"] = weight_max
    if purity:
        query["purity"] = purity

    # Attribute filters — OR within attribute, AND across attributes
    if attr_filters:
        # Collect multi-values per attribute key
        attr_map: dict = {}
        for k, v in attr_filters:
            attr_map.setdefault(k, []).append(v)
        for attr_name, values in attr_map.items():
            field = f"attribute_values.{attr_name}"
            query[field] = {"$in": values} if len(values) > 1 else values[0]

    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return [_adapt_product(p) for p in products]


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get single product"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _adapt_product(product)

# Custom Order Inquiry
@api_router.post("/custom-orders")
async def create_custom_order_inquiry(inquiry: CustomOrderInquiryCreate):
    """Submit custom order inquiry"""
    inquiry_data = inquiry.model_dump()
    uid = generate_uuid()
    inquiry_data['id'] = uid
    inquiry_data['reference_code'] = f"CUSTOM-{uid[:6].upper()}"
    inquiry_data['status'] = 'new'
    inquiry_data['status_history'] = [{"status": "new", "timestamp": datetime.utcnow().isoformat()}]
    inquiry_data['created_at'] = datetime.utcnow()

    await db.custom_orders.insert_one(inquiry_data)
    return {
        "message": "Custom order inquiry submitted successfully",
        "id": inquiry_data['id'],
        "reference_code": inquiry_data['reference_code']
    }

# Order Tracking (Public) — by phone
@api_router.get("/track")
async def track_by_phone(phone: Optional[str] = None):
    """Track all orders for a phone number"""
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number required")
    digits = re.sub(r'\D', '', phone)
    if len(digits) < 6:
        raise HTTPException(status_code=400, detail="Invalid phone number")
    orders = await db.orders.find(
        {"customer_phone": {"$regex": digits[-10:]}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    return orders

# Order Tracking (Public) — by order ID
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
        "featured_category_ids": settings.get("featured_category_ids", []),
        # Homepage CMS
        "parallax_quote_image": settings.get("parallax_quote_image"),
        "parallax_quote_heading": settings.get("parallax_quote_heading", "Crafted with Devotion"),
        "parallax_quote_subtext": settings.get("parallax_quote_subtext"),
        "cta_banner_image": settings.get("cta_banner_image"),
        "cta_banner_heading": settings.get("cta_banner_heading", "Begin Your Journey"),
        "cta_banner_subtext": settings.get("cta_banner_subtext"),
        "cta_banner_button_text": settings.get("cta_banner_button_text", "Explore Collections"),
        "cta_banner_button_link": settings.get("cta_banner_button_link", "/collections"),
        "mbj_difference": settings.get("mbj_difference", [
            {"icon": "Sparkles", "title": "Authentic Nakshi Work", "description": "Traditional handcrafted Nakshi jewellery with intricate embossed detailing"},
            {"icon": "Award", "title": "BIS Hallmarked Gold", "description": "Certified purity and quality on every piece we craft"},
            {"icon": "Shield", "title": "Transparent Pricing", "description": "Live gold rates with detailed price breakdown — no hidden charges"},
        ]),
        "google_maps_review_url": settings.get("google_maps_review_url"),
        "google_review_rating": settings.get("google_review_rating"),
        "google_review_count": settings.get("google_review_count"),
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

@api_router.get("/admin/categories")
async def get_all_categories_admin(admin = Depends(get_current_admin)):
    return await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(500)

@api_router.post("/admin/categories")
async def create_category(category: CategoryCreate, admin = Depends(get_current_admin)):
    category_data = category.model_dump()
    category_data['id'] = generate_uuid()
    category_data['slug'] = category.name.lower().replace(' ', '-').replace(' ', '_')
    category_data['created_at'] = datetime.utcnow()
    await db.categories.insert_one(category_data)
    return {"message": "Category created successfully", "id": category_data['id']}

@api_router.put("/admin/categories/{category_id}")
async def update_category(category_id: str, updates: CategoryUpdate, admin = Depends(get_current_admin)):
    update_data = updates.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["slug"] = update_data["name"].lower().replace(' ', '-')
    result = await db.categories.update_one({"id": category_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category updated successfully"}

@api_router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str, admin = Depends(get_current_admin)):
    exists = await db.categories.find_one({"id": category_id})
    if not exists:
        raise HTTPException(status_code=404, detail="Category not found")
    children = await db.categories.count_documents({"parent_id": category_id})
    if children > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete — {children} subcategor{'ies' if children != 1 else 'y'} exist under it. Delete those first.")
    product_count = await db.products.count_documents({"category_id": category_id})
    if product_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete — {product_count} product{'s' if product_count != 1 else ''} reference it. Reassign those products first.")
    await db.categories.delete_one({"id": category_id})
    return {"message": "Category deleted successfully"}

# ============================================================================
# Filter Attribute Endpoints
# ============================================================================

@api_router.get("/admin/categories/{category_id}/filter-attributes", response_model=List[FilterAttribute])
async def get_filter_attributes_admin(category_id: str, admin = Depends(get_current_admin)):
    top_id = await _get_top_level_id(category_id)
    attrs = await db.filter_attributes.find({"category_id": top_id}, {"_id": 0}).sort("display_order", 1).to_list(50)
    return attrs

@api_router.post("/admin/filter-attributes")
async def create_filter_attribute(attr: FilterAttributeCreate, admin = Depends(get_current_admin)):
    data = attr.model_dump()
    data['id'] = generate_uuid()
    data['is_active'] = True
    data['created_at'] = datetime.utcnow()
    await db.filter_attributes.insert_one(data)
    return {"message": "Filter attribute created", "id": data['id']}

@api_router.put("/admin/filter-attributes/{attr_id}")
async def update_filter_attribute(attr_id: str, updates: FilterAttributeUpdate, admin = Depends(get_current_admin)):
    update_data = updates.model_dump(exclude_unset=True)
    result = await db.filter_attributes.update_one({"id": attr_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Filter attribute not found")
    return {"message": "Filter attribute updated"}

@api_router.delete("/admin/filter-attributes/{attr_id}")
async def delete_filter_attribute(attr_id: str, admin = Depends(get_current_admin)):
    result = await db.filter_attributes.delete_one({"id": attr_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Filter attribute not found")
    return {"message": "Filter attribute deleted"}

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

    # Auto-generate item_code if not provided
    if not product_data.get('item_code'):
        cat = await db.categories.find_one({"id": product_data['category_id']}, {"name": 1})
        letter = (cat['name'][0].upper() if cat and cat.get('name') else 'X')
        existing = await db.products.find(
            {"category_id": product_data['category_id']},
            {"item_code": 1}
        ).to_list(1000)
        max_num = 0
        for doc in existing:
            code = doc.get('item_code') or ''
            if code and code[0].upper() == letter:
                try:
                    max_num = max(max_num, int(code[1:]))
                except ValueError:
                    pass
        product_data['item_code'] = f"{letter}{max_num + 1}"

    await db.products.insert_one(product_data)
    return {"message": "Product created successfully", "id": product_data['id']}

@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, updates: ProductUpdate, admin = Depends(get_current_admin)):
    """Update product"""
    update_data = dict(updates.model_dump(exclude_unset=True))
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
    """Hard-delete product."""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
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
    history_entry = {"status": status, "timestamp": datetime.utcnow().isoformat()}
    result = await db.custom_orders.update_one(
        {"id": inquiry_id},
        {
            "$set": {"status": status},
            "$push": {"status_history": history_entry}
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"message": "Status updated successfully"}

@api_router.delete("/admin/custom-orders/{inquiry_id}")
async def delete_custom_order(inquiry_id: str, admin = Depends(get_current_admin)):
    result = await db.custom_orders.delete_one({"id": inquiry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Custom order not found")
    return {"message": "Custom order deleted"}

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
# PUBLIC APIs - Schemes
# ============================================================================

@api_router.get("/schemes")
async def get_schemes():
    schemes = await db.schemes.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
    return schemes

@api_router.get("/schemes/{scheme_id}")
async def get_scheme(scheme_id: str):
    scheme = await db.schemes.find_one({"id": scheme_id, "is_active": True}, {"_id": 0})
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme

async def _build_enrollment(enrollment: SchemeEnrollmentCreate, scheme: dict) -> dict:
    """Shared enrollment builder for both public and admin endpoints."""
    scheme_type = scheme.get('scheme_type', 'flexible')
    min_amount = scheme.get('minimum_monthly_amount') or 0
    if scheme_type == 'fixed_monthly':
        if not enrollment.monthly_amount:
            raise HTTPException(status_code=400, detail="Monthly amount is required for this scheme")
        if enrollment.monthly_amount < min_amount:
            raise HTTPException(status_code=400, detail=f"Monthly amount must be at least ₹{min_amount:.0f}")
        monthly_amount = enrollment.monthly_amount
    else:
        monthly_amount = None
    data = enrollment.model_dump()
    data['id'] = generate_uuid()
    data['status'] = 'new'
    data['created_at'] = datetime.utcnow()
    data['scheme_name'] = scheme.get('name', '')
    data['scheme_type'] = scheme_type
    data['monthly_amount'] = monthly_amount
    data['original_total_months'] = scheme.get('total_months')
    data['grace_days'] = scheme.get('grace_days')
    data['months_paid'] = 0
    data['forfeited_months'] = []
    data['payments'] = []
    data['total_amount_paid'] = 0.0
    data['total_grams_accumulated'] = 0.0
    data['start_date'] = None
    data['expected_total_months'] = None
    return data

@api_router.post("/scheme-enrollments")
async def create_scheme_enrollment(enrollment: SchemeEnrollmentCreate):
    scheme = await db.schemes.find_one({"id": enrollment.scheme_id}, {"_id": 0})
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    data = await _build_enrollment(enrollment, scheme)
    await db.scheme_enrollments.insert_one(data)
    return {"message": "Enrollment submitted successfully", "id": data['id']}

@api_router.get("/scheme-enrollments/by-phone/{phone}")
async def get_enrollments_by_phone(phone: str):
    from datetime import date as date_cls
    enrollments = await db.scheme_enrollments.find({"customer_phone": phone}, {"_id": 0}).to_list(50)
    today = date_cls.today()
    result = []
    for e in enrollments:
        scheme_type = e.get('scheme_type', 'flexible')
        npw = None
        if scheme_type == 'fixed_monthly' and e.get('status') == 'active':
            start_str = e.get('start_date')
            months_paid = e.get('months_paid', 0)
            grace = e.get('grace_days') or 5
            if start_str:
                try:
                    sd = date_cls.fromisoformat(start_str)
                    ws = sd + timedelta(days=months_paid * 30)
                    we = ws + timedelta(days=grace)
                    npw = {'start_date': ws.isoformat(), 'end_date': we.isoformat(), 'is_overdue': today > we}
                except Exception:
                    pass
        expected = e.get('expected_total_months')
        months_paid = e.get('months_paid', 0)
        completion_pct = round(months_paid / expected * 100, 1) if (scheme_type == 'fixed_monthly' and expected) else None
        safe_payments = [
            {k: p.get(k) for k in ('payment_date', 'amount', 'method', 'month_number', 'gold_rate_at_payment', 'grams_credited')}
            for p in e.get('payments', [])
        ]
        e['payments'] = safe_payments
        e['next_payment_window'] = npw
        e['completion_percent'] = completion_pct
        result.append(e)
    return result

# ============================================================================
# ADMIN APIs - Schemes
# ============================================================================

@api_router.get("/admin/schemes")
async def get_all_schemes(admin = Depends(get_current_admin)):
    return await db.schemes.find({}, {"_id": 0}).sort("display_order", 1).to_list(200)

@api_router.post("/admin/schemes")
async def create_scheme(scheme: SchemeCreate, admin = Depends(get_current_admin)):
    data = scheme.model_dump()
    data['id'] = generate_uuid()
    data['is_active'] = True
    data['created_at'] = datetime.utcnow()
    await db.schemes.insert_one(data)
    return {"message": "Scheme created", "id": data['id']}

@api_router.put("/admin/schemes/{scheme_id}")
async def update_scheme(scheme_id: str, updates: SchemeUpdate, admin = Depends(get_current_admin)):
    update_data = updates.model_dump(exclude_unset=True)
    result = await db.schemes.update_one({"id": scheme_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"message": "Scheme updated"}

@api_router.delete("/admin/schemes/{scheme_id}")
async def delete_scheme(scheme_id: str, admin = Depends(get_current_admin)):
    count = await db.scheme_enrollments.count_documents({"scheme_id": scheme_id})
    if count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete — {count} enrollment(s) exist for this scheme.")
    result = await db.schemes.delete_one({"id": scheme_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"message": "Scheme deleted"}

@api_router.post("/admin/scheme-enrollments")
async def admin_create_enrollment(enrollment: SchemeEnrollmentCreate, admin = Depends(get_current_admin)):
    scheme = await db.schemes.find_one({"id": enrollment.scheme_id}, {"_id": 0})
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    data = await _build_enrollment(enrollment, scheme)
    await db.scheme_enrollments.insert_one(data)
    updated = await db.scheme_enrollments.find_one({"id": data['id']}, {"_id": 0})
    return updated

@api_router.get("/admin/scheme-enrollments")
async def get_scheme_enrollments(admin = Depends(get_current_admin)):
    return await db.scheme_enrollments.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api_router.get("/admin/scheme-enrollments/{enrollment_id}")
async def get_scheme_enrollment(enrollment_id: str, admin = Depends(get_current_admin)):
    e = await db.scheme_enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    if not e:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return e

@api_router.delete("/admin/scheme-enrollments/{enrollment_id}")
async def delete_enrollment(enrollment_id: str, admin = Depends(get_current_admin)):
    result = await db.scheme_enrollments.delete_one({"id": enrollment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Enrollment deleted"}

@api_router.put("/admin/scheme-enrollments/{enrollment_id}/status")
async def update_enrollment_status(enrollment_id: str, status: str, admin = Depends(get_current_admin)):
    result = await db.scheme_enrollments.update_one({"id": enrollment_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Status updated"}

@api_router.post("/admin/scheme-enrollments/{enrollment_id}/payments")
async def log_payment(enrollment_id: str, payment: SchemePaymentCreate, admin = Depends(get_current_admin)):
    enrollment = await db.scheme_enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    scheme_type = enrollment.get('scheme_type', 'flexible')
    now = datetime.utcnow()
    payment_doc = {
        'id': generate_uuid(),
        'amount': payment.amount,
        'payment_date': payment.payment_date,
        'method': payment.method,
        'notes': payment.notes,
        'recorded_at': now,
        'gold_rate_at_payment': None,
        'grams_credited': None,
        'month_number': None,
    }
    inc_fields = {'months_paid': 1, 'total_amount_paid': payment.amount}
    set_fields = {}
    if scheme_type == 'flexible':
        settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
        gold_rate = (settings or {}).get('k22_rate') or (settings or {}).get('current_gold_rate', 0)
        grams = round(payment.amount / gold_rate, 4) if gold_rate else 0.0
        payment_doc['gold_rate_at_payment'] = gold_rate
        payment_doc['grams_credited'] = grams
        inc_fields['total_grams_accumulated'] = grams
    else:
        months_paid_now = enrollment.get('months_paid', 0)
        payment_doc['month_number'] = months_paid_now + 1
    if not enrollment.get('start_date'):
        set_fields['start_date'] = payment.payment_date
        orig = enrollment.get('original_total_months')
        if orig:
            set_fields['expected_total_months'] = orig
    if enrollment.get('status') == 'new':
        set_fields['status'] = 'active'
    months_after = enrollment.get('months_paid', 0) + 1
    expected = set_fields.get('expected_total_months') or enrollment.get('expected_total_months')
    if scheme_type == 'fixed_monthly' and expected and months_after >= expected:
        set_fields['status'] = 'completed'
        set_fields['completed_at'] = now
    update_op = {'$push': {'payments': payment_doc}, '$inc': inc_fields}
    if set_fields:
        update_op['$set'] = set_fields
    await db.scheme_enrollments.update_one({"id": enrollment_id}, update_op)
    updated = await db.scheme_enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    return updated

@api_router.post("/admin/scheme-enrollments/{enrollment_id}/forfeit-month")
async def forfeit_month(enrollment_id: str, body: ForfeitMonthBody, admin = Depends(get_current_admin)):
    enrollment = await db.scheme_enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if enrollment.get('scheme_type', 'flexible') != 'fixed_monthly':
        raise HTTPException(status_code=400, detail="Forfeit only applies to fixed_monthly schemes")
    await db.scheme_enrollments.update_one(
        {"id": enrollment_id},
        {"$push": {"forfeited_months": body.month_number}, "$inc": {"expected_total_months": 1}}
    )
    updated = await db.scheme_enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    return updated

# ============================================================================
# PUBLIC APIs - Spiritual
# ============================================================================

@api_router.get("/gemstones")
async def get_gemstones():
    return await db.gemstones.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)

@api_router.get("/spiritual-article-types")
async def get_spiritual_article_types():
    return await db.spiritual_article_types.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)

@api_router.post("/spiritual-inquiries")
async def create_spiritual_inquiry(inquiry: SpiritualInquiryCreate):
    data = inquiry.model_dump()
    uid = generate_uuid()
    data['id'] = uid
    data['reference_code'] = f"SPIRIT-{uid[:6].upper()}"
    data['status'] = 'new'
    data['created_at'] = datetime.utcnow()
    await db.spiritual_inquiries.insert_one(data)
    return {"message": "Inquiry submitted", "id": data['id'], "reference_code": data['reference_code']}

# ============================================================================
# ADMIN APIs - Spiritual
# ============================================================================

@api_router.get("/admin/gemstones")
async def get_all_gemstones(admin = Depends(get_current_admin)):
    return await db.gemstones.find({}, {"_id": 0}).sort("display_order", 1).to_list(200)

@api_router.post("/admin/gemstones")
async def create_gemstone(gemstone: GemstoneCreate, admin = Depends(get_current_admin)):
    data = gemstone.model_dump()
    data['id'] = generate_uuid()
    data['is_active'] = True
    data['created_at'] = datetime.utcnow()
    await db.gemstones.insert_one(data)
    return {"message": "Gemstone created", "id": data['id']}

@api_router.put("/admin/gemstones/{gemstone_id}")
async def update_gemstone(gemstone_id: str, updates: GemstoneUpdate, admin = Depends(get_current_admin)):
    update_data = updates.model_dump(exclude_unset=True)
    result = await db.gemstones.update_one({"id": gemstone_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Gemstone not found")
    return {"message": "Gemstone updated"}

@api_router.delete("/admin/gemstones/{gemstone_id}")
async def delete_gemstone(gemstone_id: str, admin = Depends(get_current_admin)):
    result = await db.gemstones.delete_one({"id": gemstone_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gemstone not found")
    return {"message": "Gemstone deleted"}

@api_router.get("/admin/spiritual-article-types")
async def get_all_spiritual_article_types(admin = Depends(get_current_admin)):
    return await db.spiritual_article_types.find({}, {"_id": 0}).sort("display_order", 1).to_list(200)

@api_router.post("/admin/spiritual-article-types")
async def create_spiritual_article_type(type_data: SpiritualArticleTypeCreate, admin = Depends(get_current_admin)):
    data = type_data.model_dump()
    data['id'] = generate_uuid()
    data['is_active'] = True
    data['created_at'] = datetime.utcnow()
    await db.spiritual_article_types.insert_one(data)
    return {"message": "Article type created", "id": data['id']}

@api_router.put("/admin/spiritual-article-types/{type_id}")
async def update_spiritual_article_type(type_id: str, updates: SpiritualArticleTypeUpdate, admin = Depends(get_current_admin)):
    update_data = updates.model_dump(exclude_unset=True)
    result = await db.spiritual_article_types.update_one({"id": type_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article type not found")
    return {"message": "Article type updated"}

@api_router.delete("/admin/spiritual-article-types/{type_id}")
async def delete_spiritual_article_type(type_id: str, admin = Depends(get_current_admin)):
    result = await db.spiritual_article_types.delete_one({"id": type_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article type not found")
    return {"message": "Article type deleted"}

@api_router.get("/admin/spiritual-inquiries")
async def get_spiritual_inquiries(admin = Depends(get_current_admin)):
    return await db.spiritual_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api_router.put("/admin/spiritual-inquiries/{inquiry_id}/status")
async def update_spiritual_inquiry_status(inquiry_id: str, status: str, admin = Depends(get_current_admin)):
    result = await db.spiritual_inquiries.update_one({"id": inquiry_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"message": "Status updated"}

@api_router.delete("/admin/spiritual-inquiries/{inquiry_id}")
async def delete_spiritual_inquiry(inquiry_id: str, admin = Depends(get_current_admin)):
    result = await db.spiritual_inquiries.delete_one({"id": inquiry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"message": "Inquiry deleted"}

# ============================================================================
# Testimonials
# ============================================================================

@api_router.post("/testimonials")
async def submit_testimonial(t: TestimonialCreate):
    if not t.customer_name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    if len(re.sub(r'\D', '', t.customer_phone)) < 10:
        raise HTTPException(status_code=400, detail="Valid 10-digit phone required")
    if not (1 <= t.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    if len(t.review_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Review must be at least 10 characters")
    uid = generate_uuid()
    data = t.model_dump()
    data['id'] = uid
    data['status'] = 'pending'
    data['is_featured'] = False
    data['submitted_at'] = datetime.utcnow()
    data['approved_at'] = None
    await db.testimonials.insert_one(data)
    return {"message": "Review submitted successfully", "id": uid}

@api_router.get("/testimonials/featured")
async def get_featured_testimonials():
    docs = await db.testimonials.find(
        {"status": "approved", "is_featured": True}, {"_id": 0, "customer_phone": 0}
    ).sort("approved_at", -1).to_list(12)
    return docs

@api_router.get("/testimonials")
async def get_approved_testimonials():
    docs = await db.testimonials.find(
        {"status": "approved"}, {"_id": 0, "customer_phone": 0}
    ).sort("approved_at", -1).to_list(50)
    return docs

@api_router.get("/admin/testimonials")
async def admin_get_testimonials(status: Optional[str] = None, admin = Depends(get_current_admin)):
    q = {}
    if status and status in ('pending', 'approved', 'rejected'):
        q['status'] = status
    return await db.testimonials.find(q, {"_id": 0}).sort("submitted_at", -1).to_list(500)

@api_router.put("/admin/testimonials/{tid}/approve")
async def approve_testimonial(tid: str, admin = Depends(get_current_admin)):
    result = await db.testimonials.update_one(
        {"id": tid}, {"$set": {"status": "approved", "approved_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Approved"}

@api_router.put("/admin/testimonials/{tid}/reject")
async def reject_testimonial(tid: str, admin = Depends(get_current_admin)):
    result = await db.testimonials.update_one({"id": tid}, {"$set": {"status": "rejected"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Rejected"}

@api_router.put("/admin/testimonials/{tid}/feature")
async def feature_testimonial(tid: str, body: ToggleFeaturedBody, admin = Depends(get_current_admin)):
    doc = await db.testimonials.find_one({"id": tid})
    if not doc:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    if doc.get("status") != "approved":
        raise HTTPException(status_code=400, detail="Only approved testimonials can be featured")
    await db.testimonials.update_one({"id": tid}, {"$set": {"is_featured": body.is_featured}})
    return {"message": "Updated"}

@api_router.delete("/admin/testimonials/{tid}")
async def delete_testimonial(tid: str, admin = Depends(get_current_admin)):
    result = await db.testimonials.delete_one({"id": tid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Deleted"}

# ============================================================================
# Festival Banners
# ============================================================================

@api_router.get("/festival-banner/active")
async def get_active_festival_banner():
    doc = await db.festival_banners.find_one({"is_active": True}, {"_id": 0})
    return doc

@api_router.get("/admin/festival-banners")
async def admin_get_festival_banners(admin = Depends(get_current_admin)):
    return await db.festival_banners.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

@api_router.post("/admin/festival-banners")
async def admin_create_festival_banner(banner: FestivalBannerCreate, admin = Depends(get_current_admin)):
    uid = generate_uuid()
    data = banner.model_dump()
    data['id'] = uid
    data['is_active'] = False
    data['created_at'] = datetime.utcnow()
    await db.festival_banners.insert_one(data)
    del data['_id']
    return data

@api_router.put("/admin/festival-banners/{bid}")
async def admin_update_festival_banner(bid: str, updates: FestivalBannerUpdate, admin = Depends(get_current_admin)):
    update_data = updates.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    if update_data.get("is_active"):
        await db.festival_banners.update_many({"id": {"$ne": bid}}, {"$set": {"is_active": False}})
    result = await db.festival_banners.update_one({"id": bid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Updated"}

@api_router.delete("/admin/festival-banners/{bid}")
async def admin_delete_festival_banner(bid: str, admin = Depends(get_current_admin)):
    result = await db.festival_banners.delete_one({"id": bid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Deleted"}

# ============================================================================
# Wishlist
# ============================================================================

@api_router.get("/wishlist/{phone}")
async def get_wishlist(phone: str):
    phone_clean = re.sub(r'\D', '', phone)
    wl = await db.wishlists.find_one({"customer_phone": phone_clean}, {"_id": 0})
    if not wl:
        return {"customer_phone": phone_clean, "product_ids": [], "products": []}
    product_ids = wl.get("product_ids", [])
    products = []
    for pid in product_ids:
        p = await db.products.find_one(
            {"id": pid, "is_active": True},
            {"_id": 0, "id": 1, "name": 1, "item_code": 1, "weight": 1, "purity": 1,
             "image_dummy": 1, "image_model": 1, "category_id": 1, "stock_status": 1}
        )
        if p:
            products.append(p)
    return {**wl, "products": products}

@api_router.post("/wishlist/add")
async def add_to_wishlist(body: WishlistAddItem):
    phone_clean = re.sub(r'\D', '', body.customer_phone)
    now = datetime.utcnow()
    wl = await db.wishlists.find_one({"customer_phone": phone_clean})
    if not wl:
        uid = generate_uuid()
        await db.wishlists.insert_one({
            "id": uid, "customer_phone": phone_clean,
            "product_ids": [body.product_id], "created_at": now, "updated_at": now
        })
    elif body.product_id not in wl.get("product_ids", []):
        await db.wishlists.update_one(
            {"customer_phone": phone_clean},
            {"$push": {"product_ids": body.product_id}, "$set": {"updated_at": now}}
        )
    updated = await db.wishlists.find_one({"customer_phone": phone_clean}, {"_id": 0})
    return updated

@api_router.post("/wishlist/remove")
async def remove_from_wishlist(body: WishlistRemoveItem):
    phone_clean = re.sub(r'\D', '', body.customer_phone)
    now = datetime.utcnow()
    await db.wishlists.update_one(
        {"customer_phone": phone_clean},
        {"$pull": {"product_ids": body.product_id}, "$set": {"updated_at": now}}
    )
    updated = await db.wishlists.find_one({"customer_phone": phone_clean}, {"_id": 0})
    if not updated:
        return {"customer_phone": phone_clean, "product_ids": []}
    return updated

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
