import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Trash2, Check, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['pending', 'approved', 'rejected', 'all'];

const STATUS_BADGE = {
  pending:  { label: 'Pending',  bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  approved: { label: 'Approved', bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
};

const Stars = ({ rating, size = 14 }) => (
  <span style={{ letterSpacing: '-1px', fontSize: size }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= rating ? '#D4AF37' : 'rgba(255,255,255,0.15)' }}>★</span>
    ))}
  </span>
);

const StatusBadge = ({ status }) => {
  const m = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: m.bg, color: m.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{m.label}</span>
  );
};

const DetailModal = ({ item, onClose, onUpdate }) => {
  const [lightbox, setLightbox] = useState(null);
  const [busy, setBusy] = useState(false);

  const act = async (fn, msg) => {
    setBusy(true);
    try { await fn(); toast.success(msg); onUpdate(); onClose(); }
    catch { toast.error('Action failed'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '620px', position: 'relative' }}>

        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {item.customer_photo ? (
            <img src={item.customer_photo} alt={item.customer_name} onClick={() => setLightbox(item.customer_photo)}
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,175,55,0.4)', cursor: 'pointer', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '2px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#D4AF37' }}>{item.customer_name.charAt(0)}</span>
            </div>
          )}
          <div>
            <p style={{ fontSize: '17px', color: '#fff', fontWeight: 600, margin: '0 0 4px' }}>{item.customer_name}</p>
            <Stars rating={item.rating} size={16} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={item.status} />
            {item.is_featured && (
              <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', fontWeight: 600 }}>★ Featured</span>
            )}
          </div>
        </div>

        {/* Review text */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: 0 }}>{item.review_text}</p>
        </div>

        {/* Photos */}
        {(item.customer_photo || item.product_image) && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {item.customer_photo && (
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 6px' }}>Customer Photo</p>
                <img src={item.customer_photo} alt="Customer" onClick={() => setLightbox(item.customer_photo)}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(212,175,55,0.2)' }} />
              </div>
            )}
            {item.product_image && (
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 6px' }}>Item Photo</p>
                <img src={item.product_image} alt="Product" onClick={() => setLightbox(item.product_image)}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(212,175,55,0.2)' }} />
              </div>
            )}
          </div>
        )}

        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 20px' }}>Submitted {fmtDate(item.submitted_at)}{item.approved_at ? ` · Approved ${fmtDate(item.approved_at)}` : ''}</p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: '18px' }}>
          {item.status === 'pending' && (
            <>
              <button disabled={busy} onClick={() => act(() => adminAPI.testimonials.approve(item.id), 'Approved')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', color: '#4ade80', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <Check size={14} /> Approve
              </button>
              <button disabled={busy} onClick={() => act(() => adminAPI.testimonials.reject(item.id), 'Rejected')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          {item.status === 'approved' && (
            <>
              <button disabled={busy} onClick={() => act(() => adminAPI.testimonials.toggleFeatured(item.id, !item.is_featured), item.is_featured ? 'Removed from homepage' : 'Now featured on homepage')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: item.is_featured ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.08)', border: `1px solid ${item.is_featured ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.25)'}`, borderRadius: '8px', color: '#D4AF37', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <Star size={14} fill={item.is_featured ? '#D4AF37' : 'none'} /> {item.is_featured ? 'Unfeature' : 'Feature on homepage'}
              </button>
              <button disabled={busy} onClick={() => act(() => adminAPI.testimonials.reject(item.id), 'Moved to rejected')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '13px' }}>
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          {item.status === 'rejected' && (
            <button disabled={busy} onClick={() => act(() => adminAPI.testimonials.approve(item.id), 'Approved')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#4ade80', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <Check size={14} /> Approve
            </button>
          )}
          <button disabled={busy} onClick={() => {
            if (!window.confirm('Delete this review permanently?')) return;
            act(() => adminAPI.testimonials.delete(item.id), 'Deleted');
          }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '13px', marginLeft: 'auto' }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </motion.div>

      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
};

const AdminTestimonials = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [selected, setSelected] = useState(null);

  const reviewLink = `${window.location.origin}/share-review`;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.testimonials.getAll();
      setItems(res.data || []);
    } catch { toast.error('Failed to load testimonials'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    if (tab === 'all') return items;
    return items.filter(i => i.status === tab);
  }, [items, tab]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, all: items.length };
    items.forEach(i => { if (c[i.status] !== undefined) c[i.status]++; });
    return c;
  }, [items]);

  const sHead = { padding: '10px 14px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.12)', whiteSpace: 'nowrap' };
  const sCell = { padding: '12px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle' };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', color: '#D4AF37', fontWeight: 600, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={22} /> Testimonials
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '0 0 12px' }}>{items.length} total reviews</p>

        {/* Customer link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '8px', padding: '10px 14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Customer review link:</span>
          <code style={{ fontSize: '12px', color: '#D4AF37', background: 'rgba(212,175,55,0.08)', padding: '2px 8px', borderRadius: '4px' }}>{reviewLink}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(reviewLink); toast.success('Copied!'); }}
            style={{ padding: '5px 12px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', color: '#D4AF37', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
            Copy
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const active = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${active ? '#D4AF37' : 'rgba(255,255,255,0.12)'}`, background: active ? 'rgba(212,175,55,0.12)' : 'transparent', color: active ? '#D4AF37' : 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: active ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {t}
              {counts[t] > 0 && (
                <span style={{ fontSize: '11px', background: t === 'pending' ? '#fbbf24' : 'rgba(255,255,255,0.15)', color: t === 'pending' ? '#000' : 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '0 6px', fontWeight: 700 }}>{counts[t]}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.25)' }}>
          <Star size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>No {tab === 'all' ? '' : tab} reviews.</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <th style={sHead}>Customer</th>
                  <th style={sHead}>Rating</th>
                  <th style={sHead}>Review</th>
                  <th style={sHead}>Submitted</th>
                  <th style={sHead}>Status</th>
                  <th style={{ ...sHead, width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <motion.tr key={item.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    onClick={() => setSelected(item)}
                    style={{ borderBottom: '1px solid rgba(212,175,55,0.07)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={sCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.customer_photo ? (
                          <img src={item.customer_photo} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(212,175,55,0.3)', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#D4AF37' }}>{item.customer_name.charAt(0)}</span>
                          </div>
                        )}
                        <span style={{ fontWeight: 500, color: '#fff' }}>{item.customer_name}</span>
                      </div>
                    </td>
                    <td style={sCell}><Stars rating={item.rating} /></td>
                    <td style={{ ...sCell, color: 'rgba(255,255,255,0.55)', maxWidth: '300px' }}>
                      <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', whiteSpace: 'normal' }}>
                        {item.review_text}
                      </span>
                    </td>
                    <td style={{ ...sCell, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{fmtDate(item.submitted_at)}</td>
                    <td style={sCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <StatusBadge status={item.status} />
                        {item.is_featured && <span style={{ fontSize: '10px', color: '#D4AF37' }}>★</span>}
                      </div>
                    </td>
                    <td style={{ ...sCell, textAlign: 'right' }}>
                      <Eye size={14} color="rgba(212,175,55,0.5)" />
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
            item={selected}
            onClose={() => setSelected(null)}
            onUpdate={() => { fetchAll(); setSelected(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTestimonials;
