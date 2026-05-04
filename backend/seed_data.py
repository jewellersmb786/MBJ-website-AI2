from datetime import datetime

# ============================================================================
# Default schemes seeder — called from server.py startup_event via import
# ============================================================================

DEFAULT_SCHEMES = [
    {
        "name": "Gold Savings Plan",
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
