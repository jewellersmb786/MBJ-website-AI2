import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI, productsAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ShoppingCart, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LIST = ['pending', 'confirmed', 'in_making', 'ready', 'delivered', 'cancelled'];

const STATUS_STYLE = {
  pending:   { bg: 'rgba(251,191,36,0.18)', color: '#fbbf24', label: 'Pending' },
  confirmed: { bg: 'rgba(59,130,246,0.18)', color: '#60a5fa', label: 'Confirmed' },
  in_making: { bg: 'rgba(251,146,60,0.18)', color: '#fb923c', label: 'In Making' },
  ready:     { bg: 'rgba(168,85,247,0.18)', color: '#c084fc', label: 'Ready' },
  delivered: { bg: 'rgba(34,197,94,0.18)', color: '#4ade80', label: 'Delivered' },
  cancelled: { bg: 'rgba(239,68,68,0.18)', color: '#f87171', label: 'Cancelled' },
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
};
const fmtINR = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n || 0));

const sCell = { padding: '13px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle' };
const sHead = { padding: '11px 14px', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.12)' };

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || { bg: 'rgba(255,255,255,0.1)', color: '#fff', label: status };
  return <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await adminAPI.orders.getAll();
      setOrders(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
    productsAPI.getAll({ limit: 500 }).then(res => {
      const map = {};
      (res.data || []).forEach(p => { map[p.id] = p; });
      setProductMap(map);
    }).catch(() => {});
  }, []);

  const displayed = useMemo(() => {
    let list = filterStatus === 'all' ? orders : orders.filter(o => o.order_status === filterStatus);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(o =>
      (o.customer_phone || '').includes(q) ||
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q)
    );
    return list;
  }, [orders, filterStatus, search]);

  const openOrder = (order) => { setSelectedOrder(order); setEditStatus(order.order_status); };

  const saveStatus = async () => {
    if (!selectedOrder || editStatus === selectedOrder.order_status) return;
    setSaving(true);
    try {
      const extra = editStatus === 'delivered' ? { delivery_date: new Date().toISOString().slice(0, 10) } : {};
      await adminAPI.orders.updateStatus(selectedOrder.id, editStatus, extra);
      toast.success('Status updated');
      setSelectedOrder(prev => ({ ...prev, order_status: editStatus }));
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: '#D4AF37', fontWeight: 600, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingCart size={24} /> Orders
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{orders.length} total</p>
      </div>

      {/* Status filter chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {['all', ...STATUS_LIST].map(s => {
          const st = s === 'all' ? null : STATUS_STYLE[s];
          const active = filterStatus === s;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{ padding: '5px 14px', borderRadius: '20px', border: `1px solid ${active ? (st?.color || '#D4AF37') : 'rgba(212,175,55,0.2)'}`, background: active ? (st?.bg || 'rgba(212,175,55,0.15)') : 'transparent', color: active ? (st?.color || '#D4AF37') : 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}
            >{s === 'all' ? 'All' : (STATUS_STYLE[s]?.label || s)}</button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '14px', maxWidth: '360px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.5)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, order ID…"
          style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading orders…</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
          <ShoppingCart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>No orders yet. Orders appear here once placed.</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={sHead}>Order #</th>
                <th style={sHead}>Customer</th>
                <th style={sHead}>Phone</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Items</th>
                <th style={{ ...sHead, textAlign: 'right' }}>Total</th>
                <th style={sHead}>Status</th>
                <th style={sHead}>Date</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((order, idx) => (
                <motion.tr key={order.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.025, 0.3) }}
                  style={{ borderBottom: '1px solid rgba(212,175,55,0.07)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => openOrder(order)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...sCell, color: '#D4AF37', fontWeight: 600, fontFamily: 'monospace' }}>{order.order_number || order.id?.slice(0, 8)}</td>
                  <td style={{ ...sCell, color: '#fff' }}>{order.customer_name}</td>
                  <td style={sCell}>{order.customer_phone}</td>
                  <td style={{ ...sCell, textAlign: 'center' }}>{(order.items || []).length}</td>
                  <td style={{ ...sCell, textAlign: 'right', color: '#D4AF37', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>₹{fmtINR(order.total_amount)}</td>
                  <td style={sCell}><StatusBadge status={order.order_status} /></td>
                  <td style={sCell}>{fmtDate(order.created_at)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}
          >
            <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
              style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', padding: '28px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#D4AF37', margin: '0 0 3px' }}>
                    {selectedOrder.order_number || selectedOrder.id?.slice(0, 8)}
                  </h2>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{fmtDate(selectedOrder.created_at)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              {/* Customer */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 6px' }}>Customer</p>
                <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500, margin: '0 0 2px' }}>{selectedOrder.customer_name}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>{selectedOrder.customer_phone}{selectedOrder.customer_email ? ` · ${selectedOrder.customer_email}` : ''}</p>
              </div>

              {/* Items */}
              {(selectedOrder.items || []).length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 8px' }}>Items</p>
                  {selectedOrder.items.map((item, i) => {
                    const prod = productMap[item.product_id];
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '6px' }}>
                        {(prod?.image_dummy || prod?.image_model) && (
                          <img src={prod.image_dummy || prod.image_model} alt={item.product_name}
                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', color: '#fff', margin: '0 0 2px', fontWeight: 500 }}>{item.product_name}</p>
                          {prod?.item_code && <span style={{ fontSize: '10px', padding: '1px 6px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '4px', color: 'rgba(212,175,55,0.75)' }}>{prod.item_code}</span>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 2px' }}>×{item.quantity}</p>
                          <p style={{ fontSize: '13px', color: '#D4AF37', fontWeight: 600, margin: 0, fontVariantNumeric: 'tabular-nums' }}>₹{fmtINR(item.calculated_price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '14px', color: '#D4AF37', fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>₹{fmtINR(selectedOrder.total_amount)}</span>
              </div>

              {/* Status update */}
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 10px' }}>Update Status</p>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {STATUS_LIST.map(s => {
                    const st = STATUS_STYLE[s];
                    const active = editStatus === s;
                    return (
                      <button key={s} onClick={() => setEditStatus(s)}
                        style={{ padding: '5px 13px', borderRadius: '20px', border: `1px solid ${active ? st.color : 'rgba(255,255,255,0.15)'}`, background: active ? st.bg : 'transparent', color: active ? st.color : 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}
                      >{st.label}</button>
                    );
                  })}
                </div>
                <button onClick={saveStatus} disabled={saving || editStatus === selectedOrder.order_status}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: (saving || editStatus === selectedOrder.order_status) ? 'rgba(212,175,55,0.4)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: (saving || editStatus === selectedOrder.order_status) ? 'not-allowed' : 'pointer' }}
                >
                  <Save size={14} />{saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
