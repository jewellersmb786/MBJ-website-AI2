import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Edit2, Trash2, X, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const INQ_STATUS = ['new', 'contacted', 'completed', 'cancelled'];
const INQ_META = { new: '#fbbf24', contacted: '#60a5fa', completed: '#4ade80', cancelled: '#f87171' };

const sHead = { padding: '10px 14px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.12)' };
const sCell = { padding: '11px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle' };
const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return '—'; } };

const ItemModal = ({ item, fields, title, onClose, onSave }) => {
  const [form, setForm] = useState(item || {});
  const [saving, setSaving] = useState(false);

  const handleImg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { compressImage, PRESET_PRODUCT } = await import('../../utils/compressImage');
      const compressed = await compressImage(file, PRESET_PRODUCT);
      setForm(p => ({ ...p, image: compressed }));
    } catch { toast.error('Image upload failed'); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        style={{ background: '#111', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '520px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
        <h2 style={{ fontSize: '18px', color: '#D4AF37', marginBottom: '20px' }}>{item ? `Edit ${title}` : `Add ${title}`}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} placeholder={f.placeholder || ''} />
              ) : f.type === 'select' ? (
                <select value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value ? parseInt(e.target.value) : null }))} style={inputStyle}>
                  <option value="">— None —</option>
                  {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              ) : f.type === 'color' ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="color" value={form[f.key] || '#D4AF37'} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '48px', height: '36px', padding: '2px', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }} />
                  <input type="text" value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...inputStyle, flex: 1 }} placeholder="#D4AF37" />
                </div>
              ) : f.type === 'checkbox' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '4px' }}>
                  <input type="checkbox" checked={form[f.key] !== false} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))} style={{ accentColor: '#D4AF37', width: '15px', height: '15px' }} id={f.key} />
                  <label htmlFor={f.key} style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>Active</label>
                </div>
              ) : (
                <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? (e.target.value === '' ? '' : parseInt(e.target.value)) : e.target.value }))} style={inputStyle} placeholder={f.placeholder || ''} />
              )}
            </div>
          ))}
          {/* Image */}
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Image</label>
            {form.image ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={form.image} alt="preview" style={{ height: '80px', width: 'auto', objectFit: 'cover', borderRadius: '6px' }} />
                <button type="button" onClick={() => setForm(p => ({ ...p, image: '' }))}
                  style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={11} /></button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '2px dashed rgba(212,175,55,0.3)', borderRadius: '8px', cursor: 'pointer' }}>
                <Upload size={16} color="rgba(212,175,55,0.5)" />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Click to upload</span>
                <input type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: saving ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Save size={16} />{saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminSpiritual = () => {
  const [tab, setTab] = useState('gemstones');
  const [gemstones, setGemstones] = useState([]);
  const [articleTypes, setArticleTypes] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [gRes, aRes, iRes] = await Promise.all([
        adminAPI.gemstones.getAll(),
        adminAPI.spiritualArticleTypes.getAll(),
        adminAPI.spiritualInquiries.getAll(),
      ]);
      setGemstones(gRes.data || []);
      setArticleTypes(aRes.data || []);
      setInquiries(iRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const gemName = (id) => gemstones.find(g => g.id === id)?.name || '—';
  const artName = (id) => articleTypes.find(a => a.id === id)?.name || '—';

  const updateInqStatus = async (id, status) => {
    try {
      await adminAPI.spiritualInquiries.updateStatus(id, status);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch { toast.error('Error updating status'); }
  };

  const gemstoneFields = [
    { key: 'name', label: 'Name *' },
    { key: 'birth_month', label: 'Birth Month', type: 'select' },
    { key: 'color_hex', label: 'Color', type: 'color' },
    { key: 'properties', label: 'Spiritual Properties', type: 'textarea' },
    { key: 'display_order', label: 'Display Order', type: 'number' },
    ...(modal?.item ? [{ key: 'is_active', label: 'Active', type: 'checkbox' }] : []),
  ];
  const articleFields = [
    { key: 'name', label: 'Name *' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'display_order', label: 'Display Order', type: 'number' },
    ...(modal?.item ? [{ key: 'is_active', label: 'Active', type: 'checkbox' }] : []),
  ];

  const handleGemSave = async (form) => {
    if (!form.name?.trim()) { toast.error('Name is required'); return; }
    try {
      if (modal.item) await adminAPI.gemstones.update(modal.item.id, form);
      else await adminAPI.gemstones.create(form);
      toast.success(modal.item ? 'Gemstone updated' : 'Gemstone created');
      setModal(null); load();
    } catch { toast.error('Error saving'); }
  };

  const handleArtSave = async (form) => {
    if (!form.name?.trim()) { toast.error('Name is required'); return; }
    try {
      if (modal.item) await adminAPI.spiritualArticleTypes.update(modal.item.id, form);
      else await adminAPI.spiritualArticleTypes.create(form);
      toast.success(modal.item ? 'Article type updated' : 'Article type created');
      setModal(null); load();
    } catch { toast.error('Error saving'); }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    try {
      await adminAPI.spiritualInquiries.delete(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
      toast.success('Inquiry deleted');
    } catch (err) { toast.error(err?.response?.data?.detail || 'Error deleting inquiry'); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      if (type === 'gem') await adminAPI.gemstones.delete(id);
      else await adminAPI.spiritualArticleTypes.delete(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Error deleting'); }
  };

  const TABS = [['gemstones', 'Gemstones'], ['articles', 'Article Types'], ['inquiries', 'Inquiries']];

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#D4AF37', fontWeight: 600, margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} /> Spiritual
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{gemstones.length} gemstone(s) · {articleTypes.length} article type(s) · {inquiries.length} inquiry(ies)</p>
        </div>
        {tab !== 'inquiries' && (
          <button onClick={() => setModal({ type: tab, item: null })}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            <Plus size={16} /> Add {tab === 'gemstones' ? 'Gemstone' : 'Article Type'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${tab === k ? '#D4AF37' : 'rgba(255,255,255,0.12)'}`, background: tab === k ? 'rgba(212,175,55,0.1)' : 'transparent', color: tab === k ? '#D4AF37' : 'rgba(255,255,255,0.45)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading…</div>
      ) : tab === 'gemstones' ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          {gemstones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>No gemstones yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={sHead}>Image</th><th style={sHead}>Name</th><th style={sHead}>Month</th>
                <th style={sHead}>Color</th><th style={{ ...sHead, textAlign: 'center' }}>Active</th>
                <th style={{ ...sHead, width: '80px' }}></th>
              </tr></thead>
              <tbody>
                {gemstones.map((g, idx) => (
                  <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                    style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                    <td style={sCell}>
                      {g.image ? <img src={g.image} alt={g.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        : g.color_hex ? <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: g.color_hex }} />
                        : <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(212,175,55,0.08)' }} />}
                    </td>
                    <td style={{ ...sCell, color: '#fff', fontWeight: 500 }}>{g.name}</td>
                    <td style={sCell}>{g.birth_month ? MONTHS[g.birth_month - 1] : '—'}</td>
                    <td style={sCell}>{g.color_hex ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', background: g.color_hex }} /><span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{g.color_hex}</span></div> : '—'}</td>
                    <td style={{ ...sCell, textAlign: 'center' }}><span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: g.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)', color: g.is_active ? '#4ade80' : '#9ca3af' }}>{g.is_active ? 'Yes' : 'No'}</span></td>
                    <td style={sCell}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setModal({ type: 'gemstones', item: g })} style={{ padding: '5px 8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer' }}><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete('gem', g.id)} style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : tab === 'articles' ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          {articleTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>No article types yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={sHead}>Image</th><th style={sHead}>Name</th><th style={sHead}>Description</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Active</th><th style={{ ...sHead, width: '80px' }}></th>
              </tr></thead>
              <tbody>
                {articleTypes.map((at, idx) => (
                  <motion.tr key={at.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                    style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                    <td style={sCell}>
                      {at.image ? <img src={at.image} alt={at.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        : <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(212,175,55,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={16} color="rgba(212,175,55,0.3)" /></div>}
                    </td>
                    <td style={{ ...sCell, color: '#fff', fontWeight: 500 }}>{at.name}</td>
                    <td style={{ ...sCell, color: 'rgba(255,255,255,0.45)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{at.description || '—'}</td>
                    <td style={{ ...sCell, textAlign: 'center' }}><span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: at.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)', color: at.is_active ? '#4ade80' : '#9ca3af' }}>{at.is_active ? 'Yes' : 'No'}</span></td>
                    <td style={sCell}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setModal({ type: 'articles', item: at })} style={{ padding: '5px 8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer' }}><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete('art', at.id)} style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          {inquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>No inquiries yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <th style={sHead}>Ref</th><th style={sHead}>Customer</th><th style={sHead}>Phone</th>
                  <th style={sHead}>Gemstone</th><th style={sHead}>Article</th><th style={sHead}>Notes</th>
                  <th style={sHead}>Status</th><th style={sHead}>Date</th><th style={{ ...sHead, width: '48px' }}></th>
                </tr></thead>
                <tbody>
                  {inquiries.map((inq, idx) => (
                    <motion.tr key={inq.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                      <td style={{ ...sCell, color: '#D4AF37', fontSize: '12px' }}>{inq.reference_code || inq.id?.slice(0,8)}</td>
                      <td style={{ ...sCell, color: '#fff', fontWeight: 500 }}>{inq.customer_name}</td>
                      <td style={sCell}>{inq.customer_phone}</td>
                      <td style={sCell}>{gemName(inq.selected_gemstone_id)}</td>
                      <td style={sCell}>{artName(inq.selected_article_type_id)}</td>
                      <td style={{ ...sCell, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.45)' }}>{inq.notes || '—'}</td>
                      <td style={sCell}>
                        <select value={inq.status} onChange={e => updateInqStatus(inq.id, e.target.value)}
                          style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${INQ_META[inq.status] || '#D4AF37'}`, borderRadius: '6px', color: INQ_META[inq.status] || '#D4AF37', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                          {INQ_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ ...sCell, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fmtDate(inq.created_at)}</td>
                      <td style={sCell}>
                        <button onClick={() => handleDeleteInquiry(inq.id)}
                          style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <ItemModal
            item={modal.item}
            title={modal.type === 'gemstones' ? 'Gemstone' : 'Article Type'}
            fields={modal.type === 'gemstones' ? gemstoneFields : articleFields}
            onClose={() => setModal(null)}
            onSave={modal.type === 'gemstones' ? handleGemSave : handleArtSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSpiritual;
