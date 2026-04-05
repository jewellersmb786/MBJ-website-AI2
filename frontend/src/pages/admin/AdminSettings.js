import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Save, TrendingUp, Store, Share2, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    business_name: '',
    tagline: '',
    email: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    youtube: '',
    twitter: '',
    address: '',
    store_location: '',
    hero_image_url: '',
    logo_url: '',
    k24_rate: 15093,
    k22_rate: 13835,
    k18_rate: 11320,
    gst_percent: 3.0,
    advance_payment_percent: 30.0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminAPI.settings.get();
      setSettings(prev => ({ ...prev, ...res.data }));
    } catch (e) {
      toast.error('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isNum = ['k24_rate','k22_rate','k18_rate','gst_percent','advance_payment_percent'].includes(name);
    setSettings(prev => ({ ...prev, [name]: isNum ? parseFloat(value) || 0 : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.settings.update(settings);
      toast.success('Settings saved successfully!');
      fetchSettings();
    } catch (e) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(212,175,55,0.25)',
    color: '#fff', fontSize: '14px',
    outline: 'none', borderRadius: '6px',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', fontSize: '12px',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)', marginBottom: '6px',
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '10px', padding: '24px', marginBottom: '24px',
  };

  const sectionTitle = (icon, title, subtitle) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ color: '#D4AF37' }}>{icon}</div>
      <div>
        <h3 style={{ fontSize: '16px', color: '#D4AF37', fontWeight: 600, margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
    </div>
  );

  if (loading) return <div style={{ color: '#D4AF37', padding: '40px' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', color: '#D4AF37', fontWeight: 600, margin: '0 0 6px' }}>Site Settings</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Manage all website settings, gold rates and social media links</p>
      </div>

      <form onSubmit={handleSave}>

        {/* ── GOLD RATES ── */}
        <div style={{ ...sectionStyle, border: '1px solid rgba(212,175,55,0.5)', background: 'rgba(212,175,55,0.04)' }}>
          {sectionTitle(<TrendingUp size={22} />, 'Gold Rates', 'Update daily — these rates are used everywhere on the website and in the calculator')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { key: 'k24_rate', label: '24K Rate (₹/gram)' },
              { key: 'k22_rate', label: '22K Rate (₹/gram) — used in calculator' },
              { key: 'k18_rate', label: '18K Rate (₹/gram)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="number" name={key}
                  value={settings[key]} onChange={handleChange}
                  step="0.01" min="0"
                  style={{ ...inputStyle, color: '#D4AF37', fontSize: '18px', fontWeight: 600 }}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '12px', textAlign: 'center' }}>
            Rates are saved permanently until you change them again
          </p>
        </div>

        {/* ── HERO IMAGE ── */}
        <div style={sectionStyle}>
          {sectionTitle(<Image size={20} />, 'Hero Image', 'The main banner image on the homepage')}
          <div>
            <label style={labelStyle}>Hero Image URL</label>
            <input
              type="url" name="hero_image_url"
              value={settings.hero_image_url || ''}
              onChange={handleChange}
              placeholder="https://i.ibb.co/... paste your image URL here"
              style={inputStyle}
            />
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
              Upload your image to imgbb.com and paste the direct link here
            </p>
            {settings.hero_image_url && (
              <img
                src={settings.hero_image_url}
                alt="Hero preview"
                style={{ marginTop: '12px', height: '120px', width: 'auto', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.2)' }}
              />
            )}
          </div>
        </div>

        {/* ── BUSINESS INFO ── */}
        <div style={sectionStyle}>
          {sectionTitle(<Store size={20} />, 'Business Information', '')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { key: 'business_name', label: 'Business Name', type: 'text' },
              { key: 'tagline', label: 'Tagline', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'phone', label: 'Phone', type: 'tel' },
              { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel' },
              { key: 'address', label: 'Address', type: 'text' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type={type} name={key}
                  value={settings[key] || ''}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Store Location (shown in footer)</label>
              <textarea
                name="store_location"
                value={settings.store_location || ''}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. 123 Sayyaji Rao Road, Devaraja Market, Mysore - 570001, Karnataka"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>
          </div>
        </div>

        {/* ── SOCIAL MEDIA ── */}
        <div style={sectionStyle}>
          {sectionTitle(<Share2 size={20} />, 'Social Media Links', 'Once saved, these links become active on the website')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yourpage' },
              { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
              { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/yourchannel' },
              { key: 'twitter', label: 'Twitter / X URL', placeholder: 'https://twitter.com/yourhandle' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="url" name={key}
                  value={settings[key] || ''}
                  onChange={handleChange}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
            Icons appear in the top bar. They become clickable links once you save a URL here.
          </p>
        </div>

        {/* ── SAVE BUTTON ── */}
        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%', padding: '16px',
            background: saving ? 'rgba(212,175,55,0.5)' : '#D4AF37',
            color: '#000', border: 'none', borderRadius: '6px',
            fontSize: '14px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'all 0.2s',
          }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
