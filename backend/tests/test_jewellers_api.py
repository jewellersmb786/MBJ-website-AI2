"""
Backend API Tests for Jewellers MB
Tests: Admin Auth, Categories, Products, Custom Orders, Collections Filtering
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


class TestHealthAndPublicAPIs:
    """Test public endpoints that don't require authentication"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root working: {data}")
    
    def test_gold_rates(self):
        """Test gold rates endpoint"""
        response = requests.get(f"{BASE_URL}/api/gold-rates")
        assert response.status_code == 200
        data = response.json()
        assert "k24_rate" in data
        assert "k22_rate" in data
        assert "k18_rate" in data
        print(f"✓ Gold rates: 24K={data['k24_rate']}, 22K={data['k22_rate']}, 18K={data['k18_rate']}")
    
    def test_public_settings(self):
        """Test public settings endpoint"""
        response = requests.get(f"{BASE_URL}/api/settings/public")
        assert response.status_code == 200
        data = response.json()
        assert "business_name" in data
        assert "whatsapp" in data
        print(f"✓ Public settings: {data.get('business_name')}")
    
    def test_categories_list(self):
        """Test categories listing"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Categories count: {len(data)}")
        return data
    
    def test_products_list(self):
        """Test products listing"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Products count: {len(data)}")
        return data


class TestAdminAuthentication:
    """Test admin login and authentication"""
    
    def test_admin_login_success(self):
        """Test successful admin login"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        print(f"✓ Admin login successful, token received")
        return data["access_token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "wronguser",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print(f"✓ Invalid credentials rejected correctly")
    
    def test_admin_me_with_token(self):
        """Test getting admin info with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get admin info
        response = requests.get(f"{BASE_URL}/api/admin/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == ADMIN_USERNAME
        print(f"✓ Admin info retrieved: {data['username']}")
    
    def test_admin_me_without_token(self):
        """Test accessing admin endpoint without token"""
        response = requests.get(f"{BASE_URL}/api/admin/me")
        assert response.status_code in [401, 403]
        print(f"✓ Unauthorized access rejected correctly")


class TestAdminCategories:
    """Test admin category management"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_create_category(self, auth_token):
        """Test creating a new category"""
        category_data = {
            "name": f"TEST_Category_{uuid.uuid4().hex[:6]}",
            "subcategories": ["men", "women"],
            "order": 99
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/categories",
            json=category_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Category created: {data['id']}")
        return data["id"]
    
    def test_get_categories_after_create(self, auth_token):
        """Test that created category appears in list"""
        # Create a category first
        category_name = f"TEST_Category_{uuid.uuid4().hex[:6]}"
        create_response = requests.post(
            f"{BASE_URL}/api/admin/categories",
            json={"name": category_name, "order": 99},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        category_id = create_response.json()["id"]
        
        # Get all categories
        response = requests.get(f"{BASE_URL}/api/categories?active_only=false")
        assert response.status_code == 200
        categories = response.json()
        
        # Verify our category exists
        found = any(c["id"] == category_id for c in categories)
        assert found, f"Created category {category_id} not found in list"
        print(f"✓ Category {category_id} found in list")


class TestAdminProducts:
    """Test admin product management - Category-based product linking"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def test_category(self, auth_token):
        """Create a test category for products"""
        category_data = {
            "name": f"TEST_ProductCategory_{uuid.uuid4().hex[:6]}",
            "subcategories": [],
            "order": 99
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/categories",
            json=category_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        return response.json()["id"]
    
    def test_create_product_with_all_fields(self, auth_token, test_category):
        """Test creating product with weight, purity, stone charges"""
        product_data = {
            "name": f"TEST_Product_{uuid.uuid4().hex[:6]}",
            "category_id": test_category,
            "weight": 25.5,
            "purity": "22k",
            "wastage_percent": 8.0,
            "making_charges": 500.0,
            "stone_charges": 1500.0,
            "stock_status": "in_stock",
            "is_featured": True,
            "description": "Test product description",
            "images": []
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/products",
            json=product_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Product created with all fields: {data['id']}")
        
        # Verify product data by fetching it
        get_response = requests.get(f"{BASE_URL}/api/products/{data['id']}")
        assert get_response.status_code == 200
        product = get_response.json()
        assert product["weight"] == 25.5
        assert product["purity"] == "22k"
        assert product["stone_charges"] == 1500.0
        print(f"✓ Product data verified: weight={product['weight']}g, purity={product['purity']}")
        return data["id"]
    
    def test_get_products_by_category(self, auth_token, test_category):
        """Test filtering products by category_id"""
        # Create a product in the test category
        product_data = {
            "name": f"TEST_CatProduct_{uuid.uuid4().hex[:6]}",
            "category_id": test_category,
            "weight": 15.0,
            "purity": "24k"
        }
        requests.post(
            f"{BASE_URL}/api/admin/products",
            json=product_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Get products filtered by category
        response = requests.get(f"{BASE_URL}/api/products?category_id={test_category}")
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list)
        
        # All returned products should be in our category
        for p in products:
            assert p["category_id"] == test_category
        print(f"✓ Products filtered by category: {len(products)} products found")
    
    def test_update_product(self, auth_token, test_category):
        """Test updating a product"""
        # Create product first
        create_response = requests.post(
            f"{BASE_URL}/api/admin/products",
            json={
                "name": f"TEST_UpdateProduct_{uuid.uuid4().hex[:6]}",
                "category_id": test_category,
                "weight": 10.0,
                "purity": "22k"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        product_id = create_response.json()["id"]
        
        # Update product
        update_response = requests.put(
            f"{BASE_URL}/api/admin/products/{product_id}",
            json={"weight": 20.0, "purity": "18k", "stone_charges": 2000.0},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert update_response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        product = get_response.json()
        assert product["weight"] == 20.0
        assert product["purity"] == "18k"
        assert product["stone_charges"] == 2000.0
        print(f"✓ Product updated successfully")
    
    def test_delete_product(self, auth_token, test_category):
        """Test soft-deleting a product"""
        # Create product
        create_response = requests.post(
            f"{BASE_URL}/api/admin/products",
            json={
                "name": f"TEST_DeleteProduct_{uuid.uuid4().hex[:6]}",
                "category_id": test_category,
                "weight": 5.0
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        product_id = create_response.json()["id"]
        
        # Delete product
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert delete_response.status_code == 200
        print(f"✓ Product deleted (soft delete)")


class TestCollectionsFiltering:
    """Test Collections page filtering - Weight range and Purity filters"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def setup_test_products(self, auth_token):
        """Create test products with different weights and purities"""
        # Create a test category
        cat_response = requests.post(
            f"{BASE_URL}/api/admin/categories",
            json={"name": f"TEST_FilterCategory_{uuid.uuid4().hex[:6]}", "order": 99},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        category_id = cat_response.json()["id"]
        
        # Create products with different weights and purities
        products = [
            {"name": "TEST_Light_24K", "weight": 10.0, "purity": "24k"},
            {"name": "TEST_Medium_22K", "weight": 50.0, "purity": "22k"},
            {"name": "TEST_Heavy_18K", "weight": 150.0, "purity": "18k"},
            {"name": "TEST_Light_22K", "weight": 15.0, "purity": "22k"},
        ]
        
        created_ids = []
        for p in products:
            p["category_id"] = category_id
            response = requests.post(
                f"{BASE_URL}/api/admin/products",
                json=p,
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            created_ids.append(response.json()["id"])
        
        return {"category_id": category_id, "product_ids": created_ids}
    
    def test_products_have_weight_and_purity(self, setup_test_products):
        """Verify products have weight and purity fields for filtering"""
        category_id = setup_test_products["category_id"]
        
        response = requests.get(f"{BASE_URL}/api/products?category_id={category_id}")
        assert response.status_code == 200
        products = response.json()
        
        for product in products:
            assert "weight" in product, f"Product {product['name']} missing weight"
            assert "purity" in product, f"Product {product['name']} missing purity"
            assert isinstance(product["weight"], (int, float))
            assert product["purity"] in ["24k", "22k", "18k"]
        
        print(f"✓ All {len(products)} products have weight and purity fields")


class TestCustomOrders:
    """Test Custom Order submission and admin management"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_submit_custom_order(self):
        """Test submitting a custom order inquiry"""
        order_data = {
            "name": f"TEST_Customer_{uuid.uuid4().hex[:6]}",
            "phone": "+919876543210",
            "email": "test@example.com",
            "jewellery_type": "Nakshi Necklace",
            "description": "Custom design with temple motifs",
            "reference_images": []
        }
        response = requests.post(f"{BASE_URL}/api/custom-order", json=order_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Custom order submitted: {data['id']}")
        return data["id"]
    
    def test_admin_get_custom_orders(self, auth_token):
        """Test admin can view custom orders"""
        # First submit a custom order
        order_data = {
            "name": f"TEST_AdminView_{uuid.uuid4().hex[:6]}",
            "phone": "+919876543211",
            "jewellery_type": "Antique Haram",
            "description": "Test order for admin view"
        }
        submit_response = requests.post(f"{BASE_URL}/api/custom-order", json=order_data)
        order_id = submit_response.json()["id"]
        
        # Admin gets all custom orders
        response = requests.get(
            f"{BASE_URL}/api/admin/custom-orders",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        orders = response.json()
        assert isinstance(orders, list)
        
        # Verify our order is in the list
        found = any(o["id"] == order_id for o in orders)
        assert found, f"Custom order {order_id} not found in admin list"
        print(f"✓ Admin can view custom orders: {len(orders)} orders found")
    
    def test_admin_update_custom_order_status(self, auth_token):
        """Test admin can update custom order status"""
        # Submit a custom order
        order_data = {
            "name": f"TEST_StatusUpdate_{uuid.uuid4().hex[:6]}",
            "phone": "+919876543212",
            "jewellery_type": "Gold Bangles",
            "description": "Test status update"
        }
        submit_response = requests.post(f"{BASE_URL}/api/custom-order", json=order_data)
        order_id = submit_response.json()["id"]
        
        # Update status to "contacted"
        update_response = requests.put(
            f"{BASE_URL}/api/admin/custom-orders/{order_id}?status=contacted",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert update_response.status_code == 200
        print(f"✓ Custom order status updated to 'contacted'")
        
        # Verify status change
        orders_response = requests.get(
            f"{BASE_URL}/api/admin/custom-orders",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        orders = orders_response.json()
        order = next((o for o in orders if o["id"] == order_id), None)
        assert order is not None
        assert order["status"] == "contacted"
        print(f"✓ Status change verified")


class TestPriceCalculator:
    """Test price calculator endpoint"""
    
    def test_calculate_price(self):
        """Test price calculation"""
        calc_data = {
            "weight": 25.0,
            "wastage_percent": 8.0,
            "making_charges": 500.0,
            "stone_charges": 1500.0,
            "purity": "22k"
        }
        response = requests.post(f"{BASE_URL}/api/calculator", json=calc_data)
        assert response.status_code == 200
        data = response.json()
        assert "final_price" in data
        assert "gold_rate_used" in data
        assert data["purity"] == "22k"
        print(f"✓ Price calculated: ₹{data['final_price']:.2f} (gold rate: ₹{data['gold_rate_used']})")


class TestAdminDashboard:
    """Test admin dashboard endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_dashboard_stats(self, auth_token):
        """Test dashboard statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_products" in data
        assert "total_orders" in data
        assert "custom_inquiries" in data
        print(f"✓ Dashboard stats: {data['total_products']} products, {data['custom_inquiries']} custom inquiries")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
