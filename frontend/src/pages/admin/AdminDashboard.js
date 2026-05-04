import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { motion } from 'framer-motion';
import { TrendingUp, Package, ShoppingCart, Users, DollarSign, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.dashboard.getStats();
      setStats(response.data);
    } catch {
      // silently handled — dashboard shows empty state
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gold text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.total_products || 0,
      icon: <Package size={32} />,
      color: 'from-gold/20 to-gold/10',
      link: '/admin/products'
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: <ShoppingCart size={32} />,
      color: 'from-maroon/20 to-maroon/10',
      link: '/admin/orders'
    },
    {
      title: 'Customers',
      value: stats?.total_customers || 0,
      icon: <Users size={32} />,
      color: 'from-blue-500/20 to-blue-500/10',
      link: '/admin/customers'
    },
    {
      title: 'Revenue',
      value: `₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`,
      icon: <DollarSign size={32} />,
      color: 'from-green-500/20 to-green-500/10'
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-playfair font-bold gold-text mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your jewellery store</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={card.link || '#'} className={card.link ? 'cursor-pointer' : ''}>
              <div className={`glass-gold rounded-2xl p-6 hover-glow`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-gold`}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gold">{card.value}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/admin/products" className="block">
              <button className="w-full bg-gold/20 hover:bg-gold/30 text-gold py-3 rounded-xl font-semibold transition-all text-left px-4">
                + Add New Product
              </button>
            </Link>
            <Link to="/admin/categories" className="block">
              <button className="w-full bg-gold/20 hover:bg-gold/30 text-gold py-3 rounded-xl font-semibold transition-all text-left px-4">
                + Create Category
              </button>
            </Link>
            <Link to="/admin/orders" className="block">
              <button className="w-full bg-gold/20 hover:bg-gold/30 text-gold py-3 rounded-xl font-semibold transition-all text-left px-4">
                + Create Manual Order
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gold mb-4">Pending Orders</h3>
          {stats?.pending_orders > 0 ? (
            <div className="flex items-center space-x-3 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <AlertCircle className="text-orange-500" size={24} />
              <div>
                <p className="text-orange-500 font-semibold">{stats.pending_orders} orders pending</p>
                <p className="text-sm text-gray-400">Requires your attention</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No pending orders</p>
          )}
        </motion.div>
      </div>

      {/* Recent Orders */}
      {stats?.recent_orders && stats.recent_orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {stats.recent_orders.map((order) => (
              <div key={order.id} className="glass-gold rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gold">{order.order_number}</p>
                  <p className="text-sm text-gray-400">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">₹{order.total_amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 capitalize">{order.order_status}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Custom Orders Inquiries */}
      {stats?.custom_inquiries > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 mt-6"
        >
          <h3 className="text-xl font-bold text-gold mb-4">Custom Order Inquiries</h3>
          <div className="flex items-center space-x-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <TrendingUp className="text-blue-500" size={24} />
            <div>
              <p className="text-blue-500 font-semibold">{stats.custom_inquiries} new inquiries</p>
              <p className="text-sm text-gray-400">Check custom orders section</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
