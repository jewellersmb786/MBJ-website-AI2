import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Phone, Mail, Calendar, MessageSquare, Search, X, ChevronDown, ChevronUp, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['new', 'contacted', 'quote_sent', 'in_progress', 'completed', 'cancelled'];

const STATUS_META = {
  new:         { label: 'New',         bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  contacted:   { label: 'Contacted',   bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  quote_sent:  { label: 'Quote Sent',  bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  in_progress: { label: 'In Progress', bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
  completed:   { label: 'Completed',   bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  cancelled:   { label: 'Cancelled',   bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
};
const fmtDateShort = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.new;
  return (
    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: m.bg, color: m.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
};

const DetailModal = ({ order, onClose, onStatusChange }) => {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const save = async () => {
    if (status === order.status) { onClose(); return; }
    setSaving(true);
    try {
      await adminAPI.customOrders.updateStatus(order.id, status);
      toast.success('Status updated');
      onStatusChange(order.id, status);
      onClose();
    } catch { toast.error('Failed to update status'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        style={{ background: '#111', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '680px', position: 'relative' }}>

        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', color: '#D4AF37', fontFamily: 'Georgia, serif', margin: 0 }}>
              {order.reference_code || order.id?.slice(0, 8)}
            </h2>
            <StatusBadge status={order.status} />
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Submitted {fmtDate(order.created_at)}</p>
        </div>

        {/* Customer info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Name', value: order.name },
            { label: 'Phone', value: order.phone },
            { label: 'Email', value: order.email },
            { label: 'Jewellery Type', value: order.jewellery_type },
            { label: 'Weight Req.', value: order.weight_requirement != null ? `${order.weight_requirement}g` : null },
            { label: 'Occasion', value: order.occasion },
            { label: 'Completion By', value: order.preferred_completion_date },
            ...(order.budget_range ? [{ label: 'Budget', value: order.budget_range }] : []),
            ...(order.preferred_metal ? [{ label: 'Metal', value: order.preferred_metal }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 3px' }}>{label}</p>
              {value ? (
                <p style={{ fontSize: '13px', color: '#fff', margin: 0 }}>{value}</p>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0, fontStyle: 'italic' }}>Not specified</p>
              )}
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 8px' }}>Requirements</p>
          {order.description ? (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', margin: 0, lineHeight: 1.6 }}>{order.description}</p>
          ) : (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', margin: 0 }}>Not specified</p>
          )}
        </div>

        {/* Reference images */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 10px' }}>
            Reference Images{order.reference_images?.length > 0 ? ` (${order.reference_images.length})` : ''}
          </p>
          {order.reference_images?.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {order.reference_images.map((img, i) => (
                <img key={i} src={img} alt={`Ref ${i+1}`} onClick={() => setLightbox(img)}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.25)', cursor: 'pointer' }} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', margin: 0 }}>None uploaded</p>
          )}
        </div>

        {/* Instagram URL */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 6px' }}>Instagram Reference</p>
          {order.instagram_url ? (
            <div>
              <a href={order.instagram_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '13px', color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>View on Instagram</a>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '3px 0 0', wordBreak: 'break-all' }}>{order.instagram_url}</p>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', margin: 0 }}>Not specified</p>
          )}
        </div>

        {/* Status history */}
        {order.status_history?.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={11} /> Status History
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[...order.status_history].reverse().map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <StatusBadge status={h.status} />
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>{fmtDate(h.changed_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status change */}
        <div style={{ borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ flex: 1, minWidth: '160px', padding: '9px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
          </select>
          <a href={`https://wa.me/${order.phone?.replace(/\D/g,'')}?text=Hi ${encodeURIComponent(order.name)}, regarding your custom order request for ${encodeURIComponent(order.jewellery_type || 'jewellery')}...`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            WhatsApp
          </a>
          <button onClick={save} disabled={saving}
            style={{ padding: '9px 20px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </motion.div>

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Reference" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
};

const AdminCustomOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await adminAPI.customOrders.getAll();
      setOrders(res.data || []);
    } catch { toast.error('Error loading custom orders'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this custom order permanently?')) return;
    try {
      await adminAPI.customOrders.delete(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Custom order deleted');
    } catch (err) { toast.error(err?.response?.data?.detail || 'Error deleting order'); }
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(o =>
      (o.name || '').toLowerCase().includes(q) ||
      (o.phone || '').includes(q) ||
      (o.reference_code || '').toLowerCase().includes(q)
    );
    return list;
  }, [orders, search, statusFilter]);

  const sHead = { padding: '10px 14px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.12)', whiteSpace: 'nowrap' };
  const sCell = { padding: '12px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle' };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#D4AF37', fontWeight: 600, margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={22} /> Custom Orders
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{orders.length} total</p>
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
          <Search size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.5)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, reference…"
            style={{ width: '100%', paddingLeft: '32px', padding: '9px 12px 9px 32px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', ...STATUS_OPTIONS].map(s => {
            const active = statusFilter === s;
            const m = STATUS_META[s];
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${active ? (m?.color || '#D4AF37') : 'rgba(255,255,255,0.12)'}`, background: active ? (m?.bg || 'rgba(212,175,55,0.12)') : 'transparent', color: active ? (m?.color || '#D4AF37') : 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {s === 'all' ? 'All' : (m?.label || s)}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
          <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>
            {search || statusFilter !== 'all' ? 'No matching orders.' : 'No custom order requests yet.'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <th style={sHead}>Reference</th>
                  <th style={sHead}>Customer</th>
                  <th style={sHead}>Type</th>
                  <th style={sHead}>Budget</th>
                  <th style={sHead}>Metal</th>
                  <th style={sHead}>Status</th>
                  <th style={sHead}>Submitted</th>
                  <th style={{ ...sHead, width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, idx) => (
                  <motion.tr key={order.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    onClick={() => setSelected(order)}
                    style={{ borderBottom: '1px solid rgba(212,175,55,0.07)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...sCell, color: '#D4AF37', fontFamily: 'Georgia, serif', fontWeight: 500 }}>
                      {order.reference_code || order.id?.slice(0, 8)}
                    </td>
                    <td style={sCell}>
                      <div style={{ fontWeight: 500, color: '#fff' }}>{order.name}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={10} />{order.phone}
                      </div>
                    </td>
                    <td style={{ ...sCell, color: 'rgba(255,255,255,0.6)' }}>{order.jewellery_type || '—'}</td>
                    <td style={sCell}>
                      {order.budget_range
                        ? <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>{order.budget_range}</span>
                        : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td style={{ ...sCell, color: 'rgba(255,255,255,0.55)' }}>{order.preferred_metal || '—'}</td>
                    <td style={sCell}><StatusBadge status={order.status} /></td>
                    <td style={{ ...sCell, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{fmtDateShort(order.created_at)}</td>
                    <td style={{ ...sCell, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                        {order.reference_images?.length > 0 && (
                          <span style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)' }}>📷{order.reference_images.length}</span>
                        )}
                        <button onClick={e => handleDelete(e, order.id)}
                          style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <DetailModal
            order={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomOrders;
