import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, Coins, Package, MessageSquare, ArrowRight, LogOut } from 'lucide-react';
import { useUserPhone } from '../contexts/UserPhoneContext';
import { wishlistAPI, schemeEnrollmentsAPI, orderAPI, customOrderAPI } from '../api';
import toast from 'react-hot-toast';

const MyAccountPage = () => {
  const { phone, setPhone, clearPhone } = useUserPhone();
  const [inputPhone, setInputPhone] = useState('');
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phone) fetchCounts(phone);
  }, [phone]);

  const fetchCounts = async (ph) => {
    setLoading(true);
    const [wl, schemes, orders, customOrders] = await Promise.allSettled([
      wishlistAPI.get(ph),
      schemeEnrollmentsAPI.getByPhone(ph),
      orderAPI.trackByPhone(ph),
      customOrderAPI.getByPhone(ph),
    ]);
    setCounts({
      wishlist: wl.status === 'fulfilled' ? (wl.value.data?.product_ids?.length || 0) : 0,
      schemes:  schemes.status === 'fulfilled' ? (Array.isArray(schemes.value.data) ? schemes.value.data.filter(e => ['active','new'].includes(e.status)).length : 0) : 0,
      orders:   orders.status === 'fulfilled' ? (Array.isArray(orders.value.data) ? orders.value.data.length : 0) : 0,
      custom:   customOrders.status === 'fulfilled' ? (Array.isArray(customOrders.value.data) ? customOrders.value.data.length : 0) : 0,
    });
    setLoading(false);
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const digits = inputPhone.replace(/\D/g, '');
    if (digits.length < 10) { toast.error('Enter a valid 10-digit phone number'); return; }
    setPhone(digits);
  };

  // ── No phone ──────────────────────────────────────────────────────────────
  if (!phone) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <User size={32} color="#D4AF37" />
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#D4AF37', margin: '0 0 10px' }}>My Account</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0 0 28px', lineHeight: 1.7 }}>
            Enter your phone number to view your wishlist, orders, schemes and custom requests.
          </p>
          <form onSubmit={handlePhoneSubmit}>
            <input type="tel" value={inputPhone} onChange={e => setInputPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX" autoFocus
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
            <button type="submit"
              style={{ width: '100%', padding: '13px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              View My Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Has phone ─────────────────────────────────────────────────────────────
  const CARDS = [
    { label: 'My Wishlist',      icon: <Heart size={24} color="#D4AF37" fill="#D4AF37" />, countKey: 'wishlist', suffix: 'saved items',     link: '/wishlist',      cta: 'View Wishlist' },
    { label: 'My Schemes',       icon: <Coins size={24} color="#D4AF37" />,               countKey: 'schemes',  suffix: 'active enrollments', link: '/schemes',       cta: 'View Schemes' },
    { label: 'My Orders',        icon: <Package size={24} color="#D4AF37" />,             countKey: 'orders',   suffix: 'orders',             link: '/track-order',   cta: 'Track Orders' },
    { label: 'My Custom Orders', icon: <MessageSquare size={24} color="#D4AF37" />,       countKey: 'custom',   suffix: 'custom requests',    link: '/custom-order',  cta: 'New Custom Order' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 400, color: '#D4AF37', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={28} color="#D4AF37" /> My Account
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Linked to +{phone.slice(0, 5)}•••••
            </p>
          </div>
          <button onClick={() => { clearPhone(); setCounts(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            <LogOut size={15} /> Log out
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {CARDS.map(card => {
            const count = counts?.[card.countKey];
            return (
              <div key={card.label}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {card.icon}
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{card.label}</span>
                </div>
                <div>
                  {loading ? (
                    <div style={{ height: '40px', width: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                  ) : (
                    <p style={{ fontSize: '38px', color: '#D4AF37', fontFamily: 'Georgia, serif', fontWeight: 400, margin: '0 0 2px', lineHeight: 1 }}>
                      {count ?? '—'}
                    </p>
                  )}
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{card.suffix}</p>
                </div>
                <Link to={card.link}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(212,175,55,0.7)', textDecoration: 'none', letterSpacing: '0.06em', marginTop: 'auto', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,0.7)'}
                >
                  {card.cta} <ArrowRight size={12} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
};

export default MyAccountPage;
