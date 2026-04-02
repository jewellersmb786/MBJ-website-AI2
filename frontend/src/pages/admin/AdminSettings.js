import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { motion } from 'framer-motion';
import { Save, Upload, TrendingUp } from 'lucide-react';
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
    current_gold_rate: 6600,
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
    setSettings({
      ...settings,
      [name]: name === 'current_gold_rate' ? parseFloat(value) : value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.settings.update(settings);
      toast.success('Settings saved! Gold rate updated globally.');
      fetchSettings(); // Refresh to confirm
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
        <p className="text-gray-400">Manage your store configuration</p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Live Gold Rate - PRIORITY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#D4AF37]/10 to-[#800020]/10 border-2 border-[#D4AF37] rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-[#D4AF37]" />
            <div>
              <h2 className="text-2xl font-bold text-[#D4AF37]">Live Gold Rate (22K)</h2>
              <p className="text-sm text-gray-400">This rate is used globally in calculator and product pricing</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Current Gold Rate (₹ per gram) *
            </label>
            <input
              type="number"
              name="current_gold_rate"
              value={settings.current_gold_rate}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-6 py-4 bg-black/50 border border-[#D4AF37]/50 rounded-xl text-[#D4AF37] font-bold text-2xl focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="6600"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Updates immediately across calculator and all product pages
            </p>
          </div>
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
              <label className="block text-sm font-semibold text-gray-300 mb-2">Instagram Handle</label>
              <input
                type="text"
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                placeholder="@jewellersmb"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-black/50 border border-[#D4AF37]/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-[#D4AF37] mb-6">Branding</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Logo URL</label>
            <input
              type="url"
              name="logo_url"
              value={settings.logo_url || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="https://example.com/logo.png"
            />
            {settings.logo_url && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Current Logo:</p>
                <img src={settings.logo_url} alt="Logo" className="h-20 w-auto" />
              </div>
            )}
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
