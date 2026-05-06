import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI, settingsAPI } from '../api';
import { motion } from 'framer-motion';
import { Search, Package } from 'lucide-react';
import { useUserPhone } from '../contexts/UserPhoneContext';

const STEPS = [
  { key: 'pending',   label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_making', label: 'In Making' },
  { key: 'ready',     label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
];
const STATUS_IDX = { pending: 0, confirmed: 1, in_making: 2, ready: 3, delivered: 4 };

const fmtDate = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return ''; }
};
const fmtINR = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n || 0));

const OrderCard = ({ order, whatsapp }) => {
  const idx = STATUS_IDX[order.order_status] ?? 0;
  const cancelled = order.order_status === 'cancelled';
  const waMsg = encodeURIComponent(`Hi, I'd like to ask about Order #${order.order_number || order.id?.slice(0, 8)}`);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', margin: '0 0 3px' }}>Order</p>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#D4AF37', margin: 0 }}>{order.order_number || order.id?.slice(0, 8)}</h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Placed {fmtDate(order.created_at)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px' }}>Total</p>
          <p style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 700, margin: 0, fontVariantNumeric: 'tabular-nums' }}>₹{fmtINR(order.total_amount)}</p>
        </div>
      </div>

      {cancelled ? (
        <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#f87171', margin: 0, fontWeight: 600 }}>Order Cancelled</p>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', marginBottom: '20px', overflowX: 'auto' }}>
          {STEPS.map((step, i) => {
            const done = i < idx;
            const current = i === idx;
            return (
              <React.Fragment key={step.key}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '64px' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0,
                    background: done ? '#D4AF37' : current ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${done || current ? '#D4AF37' : 'rgba(255,255,255,0.15)'}`,
                    color: done ? '#000' : current ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                    animation: current ? 'stepPulse 2s ease-in-out infinite' : 'none',
                  }}>{done ? '✓' : i + 1}</div>
                  <p style={{ fontSize: '9px', textAlign: 'center', color: done || current ? '#D4AF37' : 'rgba(255,255,255,0.28)', margin: '5px 0 0', lineHeight: 1.2 }}>{step.label}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: done ? '#D4AF37' : 'rgba(255,255,255,0.1)', minWidth: '10px', marginTop: '13px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {(order.items || []).length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>Items</p>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{item.product_name}</span>
              <span style={{ fontSize: '13px', color: 'rgba(212,175,55,0.7)', fontVariantNumeric: 'tabular-nums' }}>₹{fmtINR(item.calculated_price)}</span>
            </div>
          ))}
        </div>
      )}

      {order.delivery_date && (
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px' }}>
          Expected delivery: <span style={{ color: '#D4AF37' }}>{fmtDate(order.delivery_date)}</span>
        </p>
      )}

      <a href={`https://wa.me/${whatsapp}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 16px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
      >
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        Contact about this order
      </a>
    </motion.div>
  );
};

const TrackOrderPage = () => {
  const { orderId: paramOrderId } = useParams();
  const { phone: contextPhone } = useUserPhone();
  const [tab, setTab] = useState(paramOrderId ? 'id' : 'phone');
  const [phone, setPhone] = useState(contextPhone || '');
  const [orderId, setOrderId] = useState(paramOrderId || '');
  const autoTriggered = useRef(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsapp, setWhatsapp] = useState('917019539776');

  useEffect(() => {
    settingsAPI.getPublic().then(r => {
      const w = (r.data?.whatsapp || '').replace(/\D/g, '');
      if (w) setWhatsapp(w);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (paramOrderId) { doSearch(); return; }
    if (contextPhone && !autoTriggered.current) {
      autoTriggered.current = true;
      doSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramOrderId]);

  const doSearch = async () => {
    setError(''); setResults(null);
    if (tab === 'phone' && !phone.trim()) { setError('Please enter your phone number.'); return; }
    if (tab === 'id' && !orderId.trim()) { setError('Please enter your order ID.'); return; }
    setLoading(true);
    try {
      if (tab === 'phone') {
        const res = await orderAPI.trackByPhone(phone.trim());
        setResults(Array.isArray(res.data) ? res.data : [res.data].filter(Boolean));
      } else {
        const res = await orderAPI.track(orderId.trim());
        setResults([res.data]);
      }
    } catch (e) {
      setResults([]);
      if (e?.response?.status === 404) setError('No order found for that ID.');
      else setError('Could not find orders. Please check your details or contact us.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '660px', margin: '0 auto', padding: '0 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Package size={24} color="#D4AF37" />
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 400, color: '#fff', margin: '0 0 12px' }}>Track Your Order</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>Enter your phone number or order ID to check your order status</p>
        </div>

        <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '3px', marginBottom: '24px' }}>
          {[['phone', 'Phone Number'], ['id', 'Order ID']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setResults(null); setError(''); }}
              style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? '#D4AF37' : 'transparent', color: tab === key ? '#000' : 'rgba(212,175,55,0.6)' }}
            >{label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: error ? '8px' : '28px' }}>
          <input
            value={tab === 'phone' ? phone : orderId}
            onChange={e => tab === 'phone' ? setPhone(e.target.value) : setOrderId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder={tab === 'phone' ? 'Your phone number' : 'Your order ID'}
            style={{ flex: 1, padding: '12px 16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '8px', color: '#fff', fontSize: '15px', outline: 'none' }}
          />
          <button onClick={doSearch} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '12px 18px', background: loading ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <Search size={15} />{loading ? 'Searching…' : 'Track'}
          </button>
        </div>

        {error && <p style={{ fontSize: '13px', color: '#f87171', marginBottom: '20px' }}>{error}</p>}

        {results !== null && (
          results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '12px' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '17px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>No orders found</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Please check your phone number or order ID, or contact us directly.</p>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
              >Contact us on WhatsApp</a>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
                {results.length} order{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map(order => <OrderCard key={order.id} order={order} whatsapp={whatsapp} />)}
            </div>
          )
        )}
      </div>
      <style>{`@keyframes stepPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,0.4)}50%{box-shadow:0 0 0 7px rgba(212,175,55,0)}}`}</style>
    </div>
  );
};

export default TrackOrderPage;
