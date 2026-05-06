import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminProvider } from './AdminContext';

// Pages
import HomePage from './pages/HomePage';
import CollectionsPage from './pages/CollectionsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CalculatorPage from './pages/CalculatorPage';
import CustomOrderPage from './pages/CustomOrderPage';
import TrackOrderPage from './pages/TrackOrderPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import SpiritualPage from './pages/SpiritualPage';
import ShareReviewPage from './pages/ShareReviewPage';
import WishlistPage from './pages/WishlistPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCustomOrders from './pages/admin/AdminCustomOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSchemes from './pages/admin/AdminSchemes';
import AdminSpiritual from './pages/admin/AdminSpiritual';
import AdminFilterAttributes from './pages/admin/AdminFilterAttributes';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminBanners from './pages/admin/AdminBanners';
import MyAccountPage from './pages/MyAccountPage';

// Layout
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import { UserPhoneProvider } from './contexts/UserPhoneContext';

function App() {
  return (
    <AdminProvider>
      <UserPhoneProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="custom-order" element={<CustomOrderPage />} />
            <Route path="track/:orderId" element={<TrackOrderPage />} />
            <Route path="track-order" element={<TrackOrderPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="schemes" element={<SchemesPage />} />
            <Route path="schemes/:id" element={<SchemeDetailPage />} />
            <Route path="spiritual" element={<SpiritualPage />} />
            <Route path="share-review" element={<ShareReviewPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="my-account" element={<MyAccountPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="custom-orders" element={<AdminCustomOrders />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="schemes" element={<AdminSchemes />} />
            <Route path="spiritual" element={<AdminSpiritual />} />
            <Route path="filter-attributes" element={<AdminFilterAttributes />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="banners" element={<AdminBanners />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </UserPhoneProvider>
    </AdminProvider>
  );
}

export default App;
