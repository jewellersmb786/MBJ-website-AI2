from datetime import datetime

# ============================================================================
# Default schemes seeder — called from server.py startup_event via import
# ============================================================================

DEFAULT_SCHEMES = [
    {
        "name": "Gold Savings Plan",
        "scheme_type": "flexible",
        "minimum_monthly_amount": None,
        "total_months": None,
        "grace_days": None,
        "tagline": "Save daily, lock today's rate, buy when you're ready",
        "description": (
            "Our Gold Savings Plan allows you to buy gold in grams at your convenience by paying any amount based on the daily gold rate, "
            "and the equivalent gold weight will be securely added to your account.\n\n"
            "We ensure complete transparency by booking your gold immediately at the same day's rate, so your savings are protected from future price increases.\n\n"
            "When you decide to purchase jewellery, your accumulated gold weight will be adjusted against the total jewellery requirement. "
            "Since jewellery involves craftsmanship, a standard wastage percentage (typically around 8–10%, depending on design) is applied on the final jewellery weight.\n\n"
            "For example, if you choose a 10g design and have already accumulated 8g, you only need to pay for the remaining 2g plus the applicable wastage and making charges. "
            "Stone charges (if any) and GST will be added as per billing.\n\n"
            "This plan gives you the flexibility to save gradually, lock your gold value over time, and convert it into jewellery whenever you're ready, "
            "while ensuring fair and standard pricing as followed across the jewellery industry."
        ),
        "highlights": [
            "Buy gold in grams at today's rate, anytime",
            "Your gold weight is locked the moment you pay — protected from price hikes",
            "Use accumulated gold against any future jewellery purchase",
            "Standard 8–10% wastage on jewellery as per industry norms",
            "Complete flexibility — no fixed duration or monthly commitment",
        ],
        "terms": (
            "Standard wastage of 8–10% applies on the final jewellery weight at the time of purchase. "
            "Stone charges (if any) and GST will be added as per the billing at the time of conversion. "
            "Plan is non-transferable."
        ),
        "cta_button_text": "Start Saving",
        "is_active": True,
        "display_order": 1,
    },
    {
        "name": "Gold Harvest Scheme",
        "scheme_type": "fixed_monthly",
        "minimum_monthly_amount": 1000.0,
        "total_months": 12,
        "grace_days": 5,
        "tagline": "Pay 12, get 13 — our way of saying thank you",
        "description": (
            "The Gold Harvest Scheme is a fixed monthly savings plan designed for customers who want a structured path to their next jewellery purchase.\n\n"
            "You pay a fixed amount every month for 12 months. At the end of the 12th month, you become eligible to purchase any jewellery from our collection.\n\n"
            "As a thank-you for your commitment, we contribute one bonus instalment from our side. "
            "So if you've paid ₹1,000 per month for 12 months (totalling ₹12,000), you can use up to ₹13,000 worth of jewellery — "
            "getting one full month's instalment as a bonus benefit from us.\n\n"
            "This scheme is ideal for those planning a milestone purchase — wedding jewellery, festive buys, or simply a long-awaited piece — "
            "and prefer the discipline of a monthly commitment.\n\n"
            "The bonus is exclusive to this plan and cannot be combined with other discounts or offers."
        ),
        "highlights": [
            "Fixed monthly contribution for 12 months",
            "We add 1 bonus instalment as a thank-you — your 13th month is on us",
            "Use the full amount toward any jewellery purchase from our collection",
            "Standard wastage and making charges apply as per the chosen design",
            "Perfect for planned purchases like wedding or festive jewellery",
        ],
        "terms": (
            "The bonus instalment is added only on completion of all 12 monthly instalments. "
            "Discontinuing midway forfeits the bonus benefit. "
            "The accumulated amount can be used toward any jewellery from our collection, subject to standard making, wastage, and GST charges. "
            "Cannot be combined with other offers or discounts."
        ),
        "cta_button_text": "Enroll Now",
        "is_active": True,
        "display_order": 2,
    },
]


async def seed_default_schemes(db, generate_uuid):
    count = await db.schemes.count_documents({})
    if count > 0:
        return
    now = datetime.utcnow()
    docs = [{**scheme, "id": generate_uuid(), "created_at": now} for scheme in DEFAULT_SCHEMES]
    await db.schemes.insert_many(docs)


DEFAULT_GEMSTONES = [
    {"name": "Ruby",                   "birth_month": 7,    "color_hex": "#C70039", "properties": "Symbolizes passion, vitality, and courage. Believed to attract prosperity and protect against misfortune. Worn for confidence and leadership.", "display_order": 1},
    {"name": "Emerald",                "birth_month": 5,    "color_hex": "#2E7D32", "properties": "Stone of harmony, love, and renewal. Said to enhance intuition and bring emotional balance. Associated with growth and wisdom.", "display_order": 2},
    {"name": "Sapphire",               "birth_month": 9,    "color_hex": "#1E40AF", "properties": "Represents truth, sincerity, and inner peace. Believed to bring focus, mental clarity, and protection from negativity.", "display_order": 3},
    {"name": "Pearl",                  "birth_month": 6,    "color_hex": "#F8F8FF", "properties": "Symbolizes purity, calm, and emotional balance. Worn to soothe the mind and enhance feminine energy. Associated with the moon.", "display_order": 4},
    {"name": "Yellow Sapphire (Pukhraj)", "birth_month": 11, "color_hex": "#FBC02D", "properties": "Brings wisdom, prosperity, and good fortune. Highly valued in Vedic astrology for Jupiter's blessings — wealth, marriage, and knowledge.", "display_order": 5},
    {"name": "Coral (Moonga)",          "birth_month": 3,    "color_hex": "#FF6F61", "properties": "Believed to enhance courage and vitality. Associated with Mars — gives strength, removes obstacles, and protects from harm.", "display_order": 6},
    {"name": "Diamond",                "birth_month": 4,    "color_hex": "#E0F7FA", "properties": "Symbol of eternal love, strength, and clarity. Believed to enhance personal power, attract abundance, and bring success in relationships.", "display_order": 7},
    {"name": "Cat's Eye (Lehsunia)",   "birth_month": None, "color_hex": "#8B6F47", "properties": "Protects against the evil eye and hidden enemies. Believed to bring sudden wealth and stability. Associated with Ketu in Vedic astrology.", "display_order": 8},
    {"name": "Hessonite (Gomed)",      "birth_month": None, "color_hex": "#B3541E", "properties": "Said to remove confusion and bring success in legal matters and competitions. Associated with Rahu — helps overcome obstacles and bad luck.", "display_order": 9},
]

DEFAULT_ARTICLE_TYPES = [
    {"name": "Ring",             "description": "Worn on the finger associated with the planet of the gemstone. Suitable for daily wear and offers continuous benefit.", "display_order": 1},
    {"name": "Pendant",          "description": "Worn close to the heart, allowing direct contact with the body. Versatile and elegant — suits both daily and special occasions.", "display_order": 2},
    {"name": "Bracelet",         "description": "Worn on the wrist for steady, gentle astrological influence. Can hold multiple stones if combined remedies are needed.", "display_order": 3},
    {"name": "Anklet (Payal)",   "description": "Traditional choice in South Indian jewellery. Offers grounding energy and is often worn for protection and stability.", "display_order": 4},
    {"name": "Earrings",         "description": "Studs or drops set with gemstones. Worn for subtle astrological benefit, especially associated with the head and mind.", "display_order": 5},
]


async def seed_default_gemstones(db, generate_uuid):
    count = await db.gemstones.count_documents({})
    if count > 0:
        return
    now = datetime.utcnow()
    docs = [{**g, "id": generate_uuid(), "is_active": True, "image": None, "created_at": now} for g in DEFAULT_GEMSTONES]
    await db.gemstones.insert_many(docs)


async def seed_default_article_types(db, generate_uuid):
    count = await db.spiritual_article_types.count_documents({})
    if count > 0:
        return
    now = datetime.utcnow()
    docs = [{**a, "id": generate_uuid(), "is_active": True, "image": None, "created_at": now} for a in DEFAULT_ARTICLE_TYPES]
    await db.spiritual_article_types.insert_many(docs)


async def _migrate_scheme_types(db):
    """Idempotent: backfills scheme_type and renames monthly_amount→minimum_monthly_amount on schemes."""
    # 1. Backfill missing scheme_type
    await db.schemes.update_many(
        {"scheme_type": {"$in": [None, ""]}},
        {"$set": {"scheme_type": "flexible"}}
    )

    # 2. Rename monthly_amount → minimum_monthly_amount on scheme documents (old field name)
    old_schemes = await db.schemes.find(
        {"monthly_amount": {"$exists": True}, "minimum_monthly_amount": {"$exists": False}},
        {"_id": 0, "id": 1, "monthly_amount": 1}
    ).to_list(100)
    for s in old_schemes:
        await db.schemes.update_one(
            {"id": s["id"]},
            {"$set": {"minimum_monthly_amount": s.get("monthly_amount")}, "$unset": {"monthly_amount": ""}}
        )

    # 3. Ensure Gold Harvest has correct fixed_monthly fields
    await db.schemes.update_one(
        {"name": "Gold Harvest Scheme", "minimum_monthly_amount": {"$in": [None, 0]}},
        {"$set": {"scheme_type": "fixed_monthly", "minimum_monthly_amount": 1000.0, "total_months": 12, "grace_days": 5}}
    )
    await db.schemes.update_one(
        {"name": "Gold Harvest Scheme", "total_months": {"$in": [None]}},
        {"$set": {"scheme_type": "fixed_monthly", "minimum_monthly_amount": 1000.0, "total_months": 12, "grace_days": 5}}
    )

    # 4. Backfill monthly_amount on existing fixed_monthly enrollments that are missing it
    fixed_schemes = await db.schemes.find(
        {"scheme_type": "fixed_monthly"},
        {"_id": 0, "id": 1, "minimum_monthly_amount": 1}
    ).to_list(50)
    for s in fixed_schemes:
        min_amt = s.get("minimum_monthly_amount") or 1000.0
        await db.scheme_enrollments.update_many(
            {"scheme_id": s["id"], "monthly_amount": {"$in": [None]}, "scheme_type": "fixed_monthly"},
            {"$set": {"monthly_amount": min_amt}}
        )


# ============================================================================
# One-time category seeder — run directly: python seed_data.py
# ============================================================================

if __name__ == "__main__":
    import requests
    import sys

    categories = [
        {"name": "Bridal Collections", "subcategories": ["women"], "order": 1},
        {"name": "Nakshi Jewellery", "subcategories": ["women"], "order": 2},
        {"name": "Antique Collections", "subcategories": ["women"], "order": 3},
        {"name": "Haram", "subcategories": ["women"], "order": 4},
        {"name": "Necklaces", "subcategories": ["men", "women"], "order": 5},
        {"name": "Bangles", "subcategories": ["women"], "order": 6},
        {"name": "Earrings", "subcategories": ["women"], "order": 7},
        {"name": "Pendants", "subcategories": ["men", "women"], "order": 8},
        {"name": "Chains", "subcategories": ["men", "women"], "order": 9},
        {"name": "Bracelets", "subcategories": ["men", "women"], "order": 10},
        {"name": "Kadas", "subcategories": ["women"], "order": 11},
        {"name": "Maang Tikka", "subcategories": ["women"], "order": 12},
    ]

    response = requests.post(
        "http://localhost:8001/api/admin/login",
        json={"username": "admin", "password": "admin123"},
    )
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        sys.exit(1)

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    for cat in categories:
        r = requests.post("http://localhost:8001/api/admin/categories", json=cat, headers=headers)
        if r.status_code == 200:
            print(f"✓ Created category: {cat['name']}")
        else:
            print(f"✗ Failed to create {cat['name']}: {r.text}")

    print("\n✅ Default categories created successfully!")
