import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Plus, Edit2, Trash2, X, Save, Upload, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const fmtINR = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return '—'; } };

const ENROLL_STATUS = ['new', 'contacted', 'enrolled', 'cancelled'];
const ENROLL_META = { new: '#fbbf24', contacted: '#60a5fa', enrolled: '#4ade80', cancelled: '#f87171' };

const sHead = { padding: '10px 14px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.12)' };
const sCell = { padding: '12px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle' };
const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

const EMPTY_FORM = { name: '', description: '', duration_months: 12, monthly_amount: '', benefits: '', image: '', display_order: 0 };

const SchemeModal = ({ scheme, onClose, onSave }) => {
  const [form, setForm] = useState(scheme ? { name: scheme.name, description: scheme.description, duration_months: scheme.duration_months, monthly_amount: scheme.monthly_amount, benefits: scheme.benefits || '', image: scheme.image || '', display_order: scheme.display_order || 0, is_active: scheme.is_active } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(p => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.monthly_amount) { toast.error('Monthly amount is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, duration_months: parseInt(form.duration_months) || 12, monthly_amount: parseFloat(form.monthly_amount) || 0, display_order: parseInt(form.display_order) || 0 };
      if (scheme) await adminAPI.schemes.update(scheme.id, payload);
      else await adminAPI.schemes.create(payload);
      toast.success(scheme ? 'Scheme updated' : 'Scheme created');
      onSave();
    } catch { toast.error('Error saving scheme'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        style={{ background: '#111', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '560px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
        <h2 style={{ fontSize: '18px', color: '#D4AF37', marginBottom: '20px' }}>{scheme ? 'Edit Scheme' : 'Add Scheme'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Description *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Duration (months) *</label>
              <input type="number" min="1" value={form.duration_months} onChange={e => setForm(p => ({ ...p, duration_months: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Monthly Amount (₹) *</label>
              <input type="number" min="0" value={form.monthly_amount} onChange={e => setForm(p => ({ ...p, monthly_amount: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Benefits / Terms (optional)</label>
            <textarea value={form.benefits} onChange={e => setForm(p => ({ ...p, benefits: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: e.target.value }))} style={inputStyle} />
            </div>
            {scheme && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: '#D4AF37', width: '15px', height: '15px' }} id="act" />
                <label htmlFor="act" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>Active</label>
              </div>
            )}
          </div>
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
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: saving ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Save size={16} />{saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminSchemes = () => {
  const [tab, setTab] = useState('schemes');
  const [schemes, setSchemes] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, eRes] = await Promise.all([adminAPI.schemes.getAll(), adminAPI.schemeEnrollments.getAll()]);
      setSchemes(sRes.data || []);
      setEnrollments(eRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheme?')) return;
    try {
      await adminAPI.schemes.delete(id);
      toast.success('Scheme deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Error deleting scheme', { duration: 7000 });
    }
  };

  const updateEnrollStatus = async (id, status) => {
    try {
      await adminAPI.schemeEnrollments.updateStatus(id, status);
      setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    } catch { toast.error('Error updating status'); }
  };

  const schemeName = (id) => schemes.find(s => s.id === id)?.name || id?.slice(0, 8) || '—';

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#D4AF37', fontWeight: 600, margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins size={22} /> Schemes
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{schemes.length} scheme(s) · {enrollments.length} enrollment(s)</p>
        </div>
        {tab === 'schemes' && (
          <button onClick={() => setModal('new')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            <Plus size={16} /> Add Scheme
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {[['schemes', 'Schemes'], ['enrollments', 'Enrollments']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '8px 18px', borderRadius: '20px', border: `1px solid ${tab === k ? '#D4AF37' : 'rgba(255,255,255,0.12)'}`, background: tab === k ? 'rgba(212,175,55,0.1)' : 'transparent', color: tab === k ? '#D4AF37' : 'rgba(255,255,255,0.45)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading…</div>
      ) : tab === 'schemes' ? (
        schemes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
            <Coins size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>No schemes yet. Add your first scheme.</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={sHead}>Image</th>
                <th style={sHead}>Name</th>
                <th style={sHead}>Duration</th>
                <th style={sHead}>Monthly</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Status</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Order</th>
                <th style={{ ...sHead, width: '80px' }}></th>
              </tr></thead>
              <tbody>
                {schemes.map((scheme, idx) => (
                  <motion.tr key={scheme.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                    style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                    <td style={sCell}>
                      {scheme.image ? <img src={scheme.image} alt={scheme.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }} /> : <div style={{ width: '44px', height: '44px', background: 'rgba(212,175,55,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Coins size={18} color="rgba(212,175,55,0.4)" /></div>}
                    </td>
                    <td style={{ ...sCell, color: '#fff', fontWeight: 500 }}>{scheme.name}</td>
                    <td style={sCell}>{scheme.duration_months} months</td>
                    <td style={{ ...sCell, color: '#D4AF37', fontVariantNumeric: 'tabular-nums' }}>₹{fmtINR(scheme.monthly_amount)}</td>
                    <td style={{ ...sCell, textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', background: scheme.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)', color: scheme.is_active ? '#4ade80' : '#9ca3af', fontWeight: 600 }}>
                        {scheme.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ ...sCell, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>{scheme.display_order}</td>
                    <td style={sCell}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setModal(scheme)} style={{ padding: '5px 8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer' }}><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(scheme.id)} style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        enrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
            <Users size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>No enrollments yet.</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <th style={sHead}>Scheme</th>
                  <th style={sHead}>Customer</th>
                  <th style={sHead}>Phone</th>
                  <th style={sHead}>Email</th>
                  <th style={sHead}>Notes</th>
                  <th style={sHead}>Status</th>
                  <th style={sHead}>Date</th>
                </tr></thead>
                <tbody>
                  {enrollments.map((e, idx) => (
                    <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                      <td style={{ ...sCell, color: '#D4AF37' }}>{schemeName(e.scheme_id)}</td>
                      <td style={{ ...sCell, color: '#fff', fontWeight: 500 }}>{e.customer_name}</td>
                      <td style={sCell}>{e.customer_phone}</td>
                      <td style={{ ...sCell, color: 'rgba(255,255,255,0.45)' }}>{e.customer_email || '—'}</td>
                      <td style={{ ...sCell, maxWidth: '180px', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.notes || '—'}</td>
                      <td style={sCell}>
                        <select value={e.status} onChange={ev => updateEnrollStatus(e.id, ev.target.value)}
                          style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${ENROLL_META[e.status] || '#D4AF37'}`, borderRadius: '6px', color: ENROLL_META[e.status] || '#D4AF37', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                          {ENROLL_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ ...sCell, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fmtDate(e.created_at)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      <AnimatePresence>
        {modal && (
          <SchemeModal
            scheme={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSchemes;
