import React, { useState, useEffect } from 'react';
import { adminAPI, categoriesAPI } from '../../api';
import { Save, TrendingUp, Store, Share2, Image, FileText, Upload, X } from 'lucide-react';
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
    about_heading: '',
    about_body: '',
    featured_category_ids: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchSettings();
    categoriesAPI.getAll().then(r => setCategories(r.data)).catch(() => {});
  }, []);

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

  const handleHeroImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSettings(prev => ({ ...prev, hero_image_url: reader.result }));
    reader.readAsDataURL(file);
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
            <label style={labelStyle}>Hero Image</label>
            {settings.hero_image_url ? (
              <div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={settings.hero_image_url}
                    alt="Hero preview"
                    style={{ height: '140px', width: 'auto', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.25)', display: 'block' }}
                  />
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, hero_image_url: '' }))}
                    style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={13} />
                  </button>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: 'rgba(212,175,55,0.7)', cursor: 'pointer', textDecoration: 'underline' }}>
                  <Upload size={13} /> Replace image
                  <input type="file" accept="image/*" onChange={handleHeroImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
            ) : (
              <label
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '120px', border: '2px dashed rgba(212,175,55,0.3)', borderRadius: '8px', cursor: 'pointer', background: 'rgba(212,175,55,0.02)', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
              >
                <Upload size={22} color="rgba(212,175,55,0.45)" style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Click to upload hero image</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>JPG, PNG, WEBP · recommended 1920×1080</span>
                <input type="file" accept="image/*" onChange={handleHeroImageUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        {/* ── FEATURED CATEGORIES ── */}
        <div style={sectionStyle}>
          {sectionTitle(<Store size={20} />, 'Featured on Homepage', 'Up to 4 categories shown as Specialities tiles on the homepage')}
          {categories.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              No categories yet — create categories first in Manage Categories.
            </p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                {categories.map(cat => {
                  const selected = (settings.featured_category_ids || []).includes(cat.id);
                  const atMax = (settings.featured_category_ids || []).length >= 4 && !selected;
                  const position = (settings.featured_category_ids || []).indexOf(cat.id);
                  return (
                    <label
                      key={cat.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: selected ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', cursor: atMax ? 'not-allowed' : 'pointer', opacity: atMax ? 0.45 : 1, transition: 'all 0.2s' }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={atMax}
                        onChange={() => {
                          const current = settings.featured_category_ids || [];
                          const updated = selected
                            ? current.filter(id => id !== cat.id)
                            : [...current, cat.id];
                          setSettings(prev => ({ ...prev, featured_category_ids: updated }));
                        }}
                        style={{ accentColor: '#D4AF37', width: '15px', height: '15px', flexShrink: 0 }}
                      />
                      {cat.display_image ? (
                        <img src={cat.display_image} alt={cat.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', background: 'rgba(212,175,55,0.08)', borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '14px', color: 'rgba(212,175,55,0.4)', fontFamily: 'Georgia, serif' }}>{cat.name.charAt(0)}</span>
                        </div>
                      )}
                      <span style={{ fontSize: '13px', color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                      {selected && (
                        <span style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 600, flexShrink: 0 }}>#{position + 1}</span>
                      )}
                    </label>
                  );
                })}
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>
                {(settings.featured_category_ids || []).length}/4 selected · tiles appear in the order selected above
              </p>
            </>
          )}
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

        {/* ── ABOUT PAGE CONTENT ── */}
        <div style={sectionStyle}>
          {sectionTitle(<FileText size={20} />, 'About Page Content', 'Controls the heading and text shown on the public About page')}
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>About Page Heading</label>
              <input
                type="text" name="about_heading"
                value={settings.about_heading || ''}
                onChange={handleChange}
                placeholder="About Jewellers MB"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>About Page Body (one paragraph per line)</label>
              <textarea
                name="about_body"
                value={settings.about_body || ''}
                onChange={handleChange}
                rows={6}
                placeholder="At Jewellers MB, we celebrate..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>
          </div>
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
