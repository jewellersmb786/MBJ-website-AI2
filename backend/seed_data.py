import requests
import sys

# Default categories for Jewellers MB
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
    {"name": "Maang Tikka", "subcategories": ["women"], "order": 12}
]

# Login to get admin token
login_data = {
    "username": "admin",
    "password": "admin123"
}

response = requests.post("http://localhost:8001/api/admin/login", json=login_data)
if response.status_code != 200:
    print(f"Login failed: {response.text}")
    sys.exit(1)

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create categories
for cat in categories:
    response = requests.post(
        "http://localhost:8001/api/admin/categories",
        json=cat,
        headers=headers
    )
    if response.status_code == 200:
        print(f"✓ Created category: {cat['name']}")
    else:
        print(f"✗ Failed to create {cat['name']}: {response.text}")

print("\n✅ Default categories created successfully!")
