import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, FolderTree } from 'lucide-react';

const AdminLayout = () => {
  const { admin, loading, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !admin && location.pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [admin, loading, location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold text-xl">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/categories', label: 'Categories', icon: <FolderTree size={20} /> },
    { to: '/admin/products', label: 'Products', icon: <Package size={20} /> },
    { to: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
    { to: '/admin/customers', label: 'Customers', icon: <Users size={20} /> },
    { to: '/admin/custom-orders', label: 'Custom Orders', icon: <Package size={20} /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-gold/10 z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-3 mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/6lie68ha_openart-fabf0c3b-095b-4c9f-ba55-7fb5f24a5ff2.png" 
              alt="MB Jewellers" 
              className="h-12 w-auto"
            />
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gold text-black font-semibold'
                      : 'text-gray-400 hover:bg-gold/10 hover:text-gold'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full mt-8"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        <header className="glass border-b border-gold/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-playfair font-bold gold-text">Admin Panel</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Welcome, {admin.username}</span>
              <Link to="/" className="text-gold hover:text-gold-light text-sm">
                View Site →
              </Link>
            </div>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
