import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, X, Upload, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
};

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.25)',
  color: '#fff', fontSize: '14px', outline: 'none', borderRadius: '6px',
  boxSizing: 'border-box',
};

const BannerModal = ({ banner, onClose, onSaved }) => {
  const isEdit = Boolean(banner?.id);
  const [form, setForm] = useState({
    title: banner?.title || '',
    image: banner?.image || '',
    image_mobile: banner?.image_mobile || '',
    click_link: banner?.click_link || '',
    is_active: banner?.is_active || false,
  });
  const [saving, setSaving] = useState(false);
  const [compressedSizes, setCompressedSizes] = useState({});

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { compressImage, PRESET_BANNER_DESKTOP, PRESET_BANNER_MOBILE } = await import('../../utils/compressImage');
      const preset = field === 'image_mobile' ? PRESET_BANNER_MOBILE : PRESET_BANNER_DESKTOP;
      const compressed = await compressImage(file, preset);
      const base64Data = compressed.split(',')[1] || '';
      const sizeKB = Math.round((base64Data.length * 0.75) / 1024);
      setForm(p => ({ ...p, [field]: compressed }));
      setCompressedSizes(p => ({ ...p, [field]: sizeKB }));
    } catch { toast.error('Failed to load image'); }
  };

  const handleSave = async () => {
    if (!form.image) { toast.error('Desktop image is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title || undefined,
        image: form.image,
        image_mobile: form.image_mobile || undefined,
        click_link: form.click_link || undefined,
        is_active: form.is_active,
      };
      if (isEdit) {
        await adminAPI.festivalBanners.update(banner.id, payload);
        toast.success('Banner updated');
      } else {
        await adminAPI.festivalBanners.create(payload);
        toast.success('Banner created');
      }
      onSaved();
      onClose();
    } catch { toast.error('Failed to save banner'); }
    finally { setSaving(false); }
  };

  const ImageField = ({ field, label, required }) => (
    <div>
      <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>
        {label}{required && ' *'}
      </label>
      {form[field] ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={form[field]} alt={label} style={{ height: '80px', width: 'auto', maxWidth: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.25)', display: 'block' }} />
          <button type="button" onClick={() => setForm(p => ({ ...p, [field]: '' }))}
            style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={11} />
          </button>
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(212,175,55,0.6)', cursor: 'pointer', textDecoration: 'underline' }}>
              <Upload size={11} /> Replace
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, field)} style={{ display: 'none' }} />
            </label>
            {compressedSizes[field] && <span style={{ fontSize: '11px', color: 'rgba(34,197,94,0.7)' }}>Compressed to {compressedSizes[field]} KB</span>}
          </div>
        </div>
      ) : (
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80px', border: '2px dashed rgba(212,175,55,0.25)', borderRadius: '8px', cursor: 'pointer', gap: '6px', transition: 'border-color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'}
        >
          <Upload size={16} color="rgba(212,175,55,0.45)" />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Click to upload</span>
          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, field)} style={{ display: 'none' }} />
        </label>
      )}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>

        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
        <h2 style={{ fontSize: '18px', color: '#D4AF37', margin: '0 0 24px', fontFamily: 'Georgia, serif' }}>{isEdit ? 'Edit Banner' : 'Add Banner'}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>Internal Title / Label</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Diwali 2025 Promo" style={inputStyle} />
          </div>

          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: '0 0 12px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '6px', padding: '8px 12px' }}>
            Recommended: 1920×600px (desktop), 800×1000px (mobile). Larger images will be auto-resized.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <ImageField field="image" label="Desktop Image" required />
            <ImageField field="image_mobile" label="Mobile Image (optional)" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>Click Link (optional)</label>
            <input type="url" value={form.click_link} onChange={e => setForm(p => ({ ...p, click_link: e.target.value }))}
              placeholder="https://... or /collections" style={inputStyle} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              style={{ accentColor: '#D4AF37', width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px', color: '#fff' }}>Set as Active (shows on homepage)</span>
          </label>

          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            Only one banner can be active at a time. Activating this banner will deactivate any other active banner.
          </p>

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, padding: '12px', background: saving ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Banner')}
            </button>
            <button onClick={onClose}
              style={{ padding: '12px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | banner object

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.festivalBanners.getAll();
      setBanners(res.data || []);
    } catch { toast.error('Failed to load banners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleToggleActive = async (banner) => {
    const newVal = !banner.is_active;
    try {
      await adminAPI.festivalBanners.update(banner.id, { is_active: newVal });
      toast.success(newVal ? 'Banner activated' : 'Banner deactivated');
      fetchBanners();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner permanently?')) return;
    try {
      await adminAPI.festivalBanners.delete(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#D4AF37', fontWeight: 600, margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Megaphone size={22} /> Festival Banners
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Full-width homepage banners for promotions & festivals</p>
        </div>
        <button onClick={() => setModal('new')}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '8px', padding: '10px 16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Only one banner can be active at a time. Activating a new banner automatically deactivates the previous one.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
      ) : banners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.25)' }}>
          <Megaphone size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>No banners yet. Add your first banner.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {banners.map(banner => (
            <motion.div key={banner.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: `1px solid ${banner.is_active ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.1)'}`, borderRadius: '12px', padding: '16px', transition: 'border-color 0.2s' }}>

              {/* Image preview */}
              <div style={{ width: '100%', aspectRatio: '16/5', overflow: 'hidden', borderRadius: '6px', background: '#0a0a0a' }}>
                <img src={banner.image} alt={banner.title || 'Banner'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>

              {/* Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '15px', color: '#fff', fontWeight: 600, margin: 0 }}>{banner.title || 'Untitled banner'}</p>
                  <span style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '20px', background: banner.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', color: banner.is_active ? '#4ade80' : 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {banner.image_mobile && <span style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', background: 'rgba(212,175,55,0.06)', padding: '2px 7px', borderRadius: '20px' }}>Mobile img ✓</span>}
                </div>
                {banner.click_link && (
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '360px' }}>
                    → {banner.click_link}
                  </p>
                )}
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>Added {fmtDate(banner.created_at)}</p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <button onClick={() => handleToggleActive(banner)}
                  style={{ padding: '7px 14px', background: banner.is_active ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)', border: `1px solid ${banner.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: '7px', color: banner.is_active ? '#f87171' : '#4ade80', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {banner.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setModal(banner)}
                    style={{ padding: '6px 10px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '6px', color: '#D4AF37', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(banner.id)}
                    style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <BannerModal
            banner={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={fetchBanners}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBanners;
