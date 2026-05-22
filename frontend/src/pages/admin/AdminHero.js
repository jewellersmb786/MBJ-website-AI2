import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Wand2, Upload, ExternalLink, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.25)',
  color: '#fff', fontSize: '14px', outline: 'none', borderRadius: '6px',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', marginBottom: 6,
  color: 'rgba(212,175,55,0.8)', fontSize: 13, fontWeight: 500,
};

const sectionStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(212,175,55,0.12)',
  borderRadius: 10, padding: '20px 24px', marginBottom: 24,
};

function ImageUploadBox({ label, value, onChange, note }) {
  const [sizeKB, setSizeKB] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { compressImage, PRESET_HERO } = await import('../../utils/compressImage');
      const compressed = await compressImage(file, PRESET_HERO);
      const b64 = compressed.split(',')[1] || '';
      setSizeKB(Math.round((b64.length * 0.75) / 1024));
      onChange(compressed);
    } catch { toast.error('Image load failed'); }
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {note && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8 }}>{note}</div>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {value ? (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={value} alt={label}
              style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(212,175,55,0.2)' }}
            />
            <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '1px 5px', fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
              {sizeKB ? `${sizeKB}KB` : ''}
            </div>
          </div>
        ) : (
          <div style={{
            width: 120, height: 80, borderRadius: 6,
            border: '1px dashed rgba(212,175,55,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(212,175,55,0.4)', fontSize: 11,
          }}>No image</div>
        )}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: 6, padding: '7px 14px', color: 'rgba(212,175,55,0.9)', fontSize: 13,
        }}>
          <Upload size={14} /> Upload
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </label>
        {value && (
          <button
            onClick={() => { onChange(''); setSizeKB(null); }}
            style={{
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 6, padding: '7px 14px', color: 'rgba(220,38,38,0.8)', fontSize: 13, cursor: 'pointer',
            }}
          >Remove</button>
        )}
      </div>
    </div>
  );
}

function DotSection({ num, form, setForm, products }) {
  const prefix = `dot${num}_`;
  const set = (key, val) => setForm(p => ({ ...p, [`${prefix}${key}`]: val }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'end' }}>
      <div>
        <label style={labelStyle}>Label</label>
        <input
          style={inputStyle}
          value={form[`${prefix}label`] || ''}
          onChange={e => set('label', e.target.value)}
          placeholder="e.g. Lakshmi Haram"
        />
      </div>
      <div>
        <label style={labelStyle}>Meta</label>
        <input
          style={inputStyle}
          value={form[`${prefix}meta`] || ''}
          onChange={e => set('meta', e.target.value)}
          placeholder="e.g. Bridal · 22K"
        />
      </div>
      <div>
        <label style={labelStyle}>Linked Product (optional)</label>
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={form[`${prefix}product_id`] || ''}
          onChange={e => set('product_id', e.target.value || null)}
        >
          <option value="">— /collections (default) —</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.item_code || p.id.slice(0, 6)})</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function AdminHero() {
  const [form, setForm] = useState({
    tagline_main: '', tagline_sub: '',
    piece1_image: '', piece2_image: '', model_image: '',
    dot1_product_id: null, dot1_label: '', dot1_meta: '',
    dot2_product_id: null, dot2_label: '', dot2_meta: '',
    dot3_product_id: null, dot3_label: '', dot3_meta: '',
    is_active: true,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      adminAPI.hero.get(),
      adminAPI.products.getAll(),
    ]).then(([heroRes, prodRes]) => {
      if (heroRes.status === 'fulfilled') {
        const h = heroRes.value.data;
        setForm({
          tagline_main: h.tagline_main || '',
          tagline_sub: h.tagline_sub || '',
          piece1_image: h.piece1_image || '',
          piece2_image: h.piece2_image || '',
          model_image: h.model_image || '',
          dot1_product_id: h.dot1_product_id || null,
          dot1_label: h.dot1_label || '',
          dot1_meta: h.dot1_meta || '',
          dot2_product_id: h.dot2_product_id || null,
          dot2_label: h.dot2_label || '',
          dot2_meta: h.dot2_meta || '',
          dot3_product_id: h.dot3_product_id || null,
          dot3_label: h.dot3_label || '',
          dot3_meta: h.dot3_meta || '',
          is_active: h.is_active !== false,
        });
      }
      if (prodRes.status === 'fulfilled') {
        setProducts(prodRes.value.data || []);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      // Send empty string as null for image fields
      ['piece1_image', 'piece2_image', 'model_image'].forEach(k => {
        if (!payload[k]) payload[k] = null;
      });
      await adminAPI.hero.update(payload);
      toast.success('Hero content saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'rgba(212,175,55,0.6)', padding: 40, textAlign: 'center' }}>Loading hero settings…</div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Wand2 size={24} style={{ color: '#D4AF37' }} />
          <div>
            <h1 style={{ color: '#D4AF37', fontSize: 22, fontWeight: 700, margin: 0 }}>Hero Section</h1>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>
              Cinematic scroll-driven homepage hero
            </div>
          </div>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'rgba(212,175,55,0.7)', fontSize: 13,
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={14} /> Preview homepage
        </a>
      </div>

      {/* Active toggle */}
      <div style={{ ...sectionStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 600 }}>Hero Section Active</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>
            When disabled, the homepage skips the cinematic hero entirely.
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div
            onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
            style={{
              width: 48, height: 26, borderRadius: 13,
              background: form.is_active ? '#D4AF37' : 'rgba(255,255,255,0.1)',
              position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: form.is_active ? 25 : 3,
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s',
            }} />
          </div>
          <span style={{ color: form.is_active ? '#D4AF37' : 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            {form.is_active ? 'Active' : 'Hidden'}
          </span>
        </label>
      </div>

      {/* Taglines */}
      <div style={sectionStyle}>
        <div style={{ color: '#D4AF37', fontWeight: 600, marginBottom: 16 }}>Taglines</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Main Tagline</label>
            <input
              style={inputStyle}
              value={form.tagline_main}
              onChange={e => setForm(p => ({ ...p, tagline_main: e.target.value }))}
              placeholder="Crafted with Devotion"
            />
          </div>
          <div>
            <label style={labelStyle}>Sub Tagline</label>
            <input
              style={inputStyle}
              value={form.tagline_sub}
              onChange={e => setForm(p => ({ ...p, tagline_sub: e.target.value }))}
              placeholder="Heritage. Artistry. Intimacy."
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div style={sectionStyle}>
        <div style={{ color: '#D4AF37', fontWeight: 600, marginBottom: 6 }}>Images</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>
          Three scroll phases: jewellery piece 1 → jewellery piece 2 slides in → model photo fades in.
          All three are optional; if none are uploaded, the hero shows a compact tagline-only version.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          <ImageUploadBox
            label="Jewellery Piece 1 (Phase 1)"
            value={form.piece1_image}
            onChange={v => setForm(p => ({ ...p, piece1_image: v }))}
            note="Shown first. Transparent PNG recommended (jewellery on white removed background)."
          />
          <ImageUploadBox
            label="Jewellery Piece 2 (Phase 2)"
            value={form.piece2_image}
            onChange={v => setForm(p => ({ ...p, piece2_image: v }))}
            note="Slides in from the right as the user scrolls."
          />
          <ImageUploadBox
            label="Model Photo (Phase 3)"
            value={form.model_image}
            onChange={v => setForm(p => ({ ...p, model_image: v }))}
            note="Full-bleed photo. Pulse dots appear over this image. Vertical portrait works best."
          />
        </div>
      </div>

      {/* Pulse dots */}
      <div style={sectionStyle}>
        <div style={{ color: '#D4AF37', fontWeight: 600, marginBottom: 6 }}>Pulse Dots</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>
          Gold pulsing dots appear over the model photo. Each shows a label, meta line, and links to a product or /collections.
        </div>
        {[1, 2, 3].map(n => (
          <div key={n} style={{ marginBottom: n < 3 ? 20 : 0 }}>
            <div style={{ color: 'rgba(212,175,55,0.6)', fontSize: 12, fontWeight: 600, marginBottom: 10, letterSpacing: '0.05em' }}>
              DOT {n}
            </div>
            <DotSection num={n} form={form} setForm={setForm} products={products} />
          </div>
        ))}
      </div>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: saving ? 'rgba(212,175,55,0.4)' : '#D4AF37',
            color: '#000', border: 'none', borderRadius: 8,
            padding: '12px 28px', fontSize: 15, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save Hero Content'}
        </button>
      </div>
    </div>
  );
}
