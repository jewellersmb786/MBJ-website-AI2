import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Users, Phone, ShoppingBag, Package } from 'lucide-react';

const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
};

const sCell = { padding: '14px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle' };
const sHead = { padding: '12px 16px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.12)' };

const STATUS_COLORS = {
  new: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  contacted: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  quote_sent: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  in_progress: { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
  completed: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  converted: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  closed: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
};

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedData, setExpandedData] = useState({});
  const [expandLoading, setExpandLoading] = useState(null);

  useEffect(() => {
    Promise.all([
      adminAPI.customers.getAll(),
      adminAPI.customOrders.getAll(),
    ]).then(([custRes, coRes]) => {
      setCustomers(custRes.data || []);
      setCustomOrders(coRes.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  const getCustomOrders = (phone) => customOrders.filter(co => co.phone === phone);

  const toggleExpand = async (customerId) => {
    if (expandedId === customerId) { setExpandedId(null); return; }
    setExpandedId(customerId);
    if (!expandedData[customerId]) {
      setExpandLoading(customerId);
      try {
        const res = await adminAPI.customers.getById(customerId);
        setExpandedData(prev => ({ ...prev, [customerId]: res.data }));
      } catch { /* ignore */ }
      finally { setExpandLoading(null); }
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#D4AF37', fontWeight: 600, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} /> Customers
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{customers.length} total</p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '380px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.5)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone…"
          style={{ width: '100%', paddingLeft: '36px', padding: '10px 12px 10px 36px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
          <Users size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>
            {search ? 'No customers match your search.' : 'No customers yet. Customers are created automatically when they submit a custom order or place an order.'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={sHead}>Name</th>
                <th style={sHead}>Phone</th>
                <th style={sHead}>Email</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Orders</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Custom Inqs</th>
                <th style={sHead}>Joined</th>
                <th style={{ ...sHead, width: '36px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, idx) => {
                const customCount = getCustomOrders(customer.phone).length;
                const isExpanded = expandedId === customer.id;
                const detail = expandedData[customer.id];
                return (
                  <React.Fragment key={customer.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                      style={{ borderBottom: '1px solid rgba(212,175,55,0.07)', cursor: 'pointer', background: isExpanded ? 'rgba(212,175,55,0.04)' : 'transparent', transition: 'background 0.15s' }}
                      onClick={() => toggleExpand(customer.id)}
                    >
                      <td style={{ ...sCell, color: '#fff', fontWeight: 500 }}>{customer.name || '—'}</td>
                      <td style={sCell}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={11} color="rgba(212,175,55,0.4)" />{customer.phone}
                        </div>
                      </td>
                      <td style={{ ...sCell, color: 'rgba(255,255,255,0.45)' }}>{customer.email || '—'}</td>
                      <td style={{ ...sCell, textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#D4AF37', fontWeight: 600 }}>
                          <ShoppingBag size={11} />{customer.total_orders || 0}
                        </span>
                      </td>
                      <td style={{ ...sCell, textAlign: 'center' }}>
                        {customCount > 0
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'rgba(212,175,55,0.7)' }}><Package size={11} />{customCount}</span>
                          : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                      </td>
                      <td style={sCell}>{fmtDate(customer.created_at)}</td>
                      <td style={{ ...sCell, textAlign: 'center' }}>
                        {isExpanded ? <ChevronUp size={14} color="#D4AF37" /> : <ChevronDown size={14} color="rgba(212,175,55,0.4)" />}
                      </td>
                    </motion.tr>

                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                              <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                  <h4 style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.55)', margin: '0 0 10px' }}>Regular Orders</h4>
                                  {expandLoading === customer.id ? (
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
                                  ) : detail?.orders?.length > 0 ? detail.orders.map(o => {
                                    const sc = STATUS_COLORS[o.order_status] || STATUS_COLORS.new;
                                    return (
                                      <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', marginBottom: '6px' }}>
                                        <div>
                                          <span style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>{o.order_number || o.id?.slice(0,8)}</span>
                                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginLeft: '8px' }}>{fmtDate(o.created_at)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontSize: '12px', color: '#D4AF37' }}>₹{(o.total_amount || 0).toLocaleString('en-IN')}</span>
                                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: sc.bg, color: sc.color }}>{o.order_status}</span>
                                        </div>
                                      </div>
                                    );
                                  }) : <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>No regular orders yet.</p>}
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.55)', margin: '0 0 10px' }}>Custom Inquiries</h4>
                                  {getCustomOrders(customer.phone).length > 0 ? getCustomOrders(customer.phone).map(co => {
                                    const sc = STATUS_COLORS[co.status] || STATUS_COLORS.new;
                                    return (
                                      <div key={co.id} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', marginBottom: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontSize: '12px', color: '#fff' }}>{co.reference_code || co.jewellery_type}</span>
                                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: sc.bg, color: sc.color }}>{co.status}</span>
                                        </div>
                                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '3px 0 0' }}>{fmtDate(co.created_at)}</p>
                                      </div>
                                    );
                                  }) : <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>No custom inquiries.</p>}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
