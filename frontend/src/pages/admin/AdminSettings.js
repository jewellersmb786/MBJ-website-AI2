import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { motion } from 'framer-motion';
import { Save, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    business_name: '',
    tagline: '',
    email: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    address: '',
    k24_rate: 7200,
    k22_rate: 6600,
    k18_rate: 5400,
    logo_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.settings.get();
      setSettings(response.data);
    } catch (error) {
      toast.error('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isRate = ['k24_rate', 'k22_rate', 'k18_rate'].includes(name);
    setSettings({
      ...settings,
      [name]: isRate ? parseFloat(value) : value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.settings.update(settings);
      toast.success('Settings saved! Gold rates updated globally.');
      fetchSettings();
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[#D4AF37] text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-playfair font-bold text-[#D4AF37] mb-2">Site Settings</h1>
        <p className="text-gray-400">Manage gold rates and store configuration</p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Live Gold Rates - All Three */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#D4AF37]/10 to-[#800020]/10 border-2 border-[#D4AF37] rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-[#D4AF37]" />
            <div>
              <h2 className="text-2xl font-bold text-[#D4AF37]">Live Gold Rates</h2>
              <p className="text-sm text-gray-400">These rates are displayed on homepage and used in calculations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 24K Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                24K Gold Rate (₹/g) *
              </label>
              <input
                type="number"
                name="k24_rate"
                value={settings.k24_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/50 rounded-xl text-[#D4AF37] font-bold text-xl focus:ring-2 focus:ring-[#D4AF37]"
                required
              />
            </div>

            {/* 22K Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                22K Gold Rate (₹/g) * <span className="text-xs text-gray-500">(Used in Calculator)</span>
              </label>
              <input
                type="number"
                name="k22_rate"
                value={settings.k22_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/50 rounded-xl text-[#D4AF37] font-bold text-xl focus:ring-2 focus:ring-[#D4AF37]"
                required
              />
            </div>

            {/* 18K Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                18K Gold Rate (₹/g) *
              </label>
              <input
                type="number"
                name="k18_rate"
                value={settings.k18_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/50 rounded-xl text-[#D4AF37] font-bold text-xl focus:ring-2 focus:ring-[#D4AF37]"
                required
              />
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Updates immediately across homepage and calculator • 22K rate is primary for South Indian jewellery
          </p>
        </motion.div>

        {/* Business Details */}
        <div className="bg-black/50 border border-[#D4AF37]/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-[#D4AF37] mb-6">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={settings.business_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                value={settings.whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Instagram</label>
              <input
                type="text"
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                placeholder="@jewellersmb"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#D4AF37] hover:bg-[#B8960F] text-black py-4 rounded-full font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <Save size={20} />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
