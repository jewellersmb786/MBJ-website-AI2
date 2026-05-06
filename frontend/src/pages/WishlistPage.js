import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, X, ArrowRight } from 'lucide-react';
import { wishlistAPI } from '../api';
import toast from 'react-hot-toast';
import { useUserPhone } from '../contexts/UserPhoneContext';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { phone, setPhone, clearPhone } = useUserPhone();
  const [inputPhone, setInputPhone] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(null);

  const fetchWishlist = useCallback(async (ph) => {
    if (!ph) return;
    setLoading(true);
    try {
      const res = await wishlistAPI.get(ph);
      setProducts(res.data?.products || []);
    } catch {
      toast.error('Could not load wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (phone) fetchWishlist(phone);
  }, [phone, fetchWishlist]);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const digits = inputPhone.replace(/\D/g, '');
    if (digits.length < 10) { toast.error('Enter a valid 10-digit phone number'); return; }
    setPhone(digits);
    setInputPhone('');
  };

  const handleRemove = async (productId) => {
    if (!phone || removing) return;
    setRemoving(productId);
    try {
      await wishlistAPI.remove(phone, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setRemoving(null);
    }
  };

  const handleSwitchPhone = () => {
    clearPhone();
    setProducts([]);
  };

  const getImage = (p) => p.image_dummy || p.image_model || null;

  // ── No phone yet ──────────────────────────────────────────────────────────
  if (!phone) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <Heart size={48} color="rgba(212,175,55,0.4)" style={{ marginBottom: '24px' }} />
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#D4AF37', margin: '0 0 10px' }}>My Wishlist</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0 0 28px', lineHeight: 1.7 }}>
            Enter your phone number to view your saved items.
          </p>
          <form onSubmit={handlePhoneSubmit}>
            <input type="tel" value={inputPhone} onChange={e => setInputPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX" autoFocus
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
            <button type="submit"
              style={{ width: '100%', padding: '12px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              View Wishlist
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Has phone ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 400, color: '#D4AF37', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Heart size={28} color="#D4AF37" fill="#D4AF37" /> My Wishlist
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Saved for +{phone.slice(0, 5)}•••••
              <button onClick={handleSwitchPhone}
                style={{ marginLeft: '10px', fontSize: '12px', color: 'rgba(212,175,55,0.6)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                Switch phone
              </button>
            </p>
          </div>
          <Link to="/collections"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37', textDecoration: 'none', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '8px', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Browse Collections <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', aspectRatio: '4/5', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Heart size={56} color="rgba(212,175,55,0.2)" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>Your wishlist is empty</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', margin: '0 0 24px' }}>
              Browse our collections to start saving items you love.
            </p>
            <Link to="/collections"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#D4AF37', color: '#000', textDecoration: 'none', fontSize: '13px', fontWeight: 700, borderRadius: '8px' }}>
              Explore Collections <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.map(p => {
              const img = getImage(p);
              return (
                <div key={p.id} style={{ position: 'relative', background: '#1a0f12', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.25s, transform 0.25s', cursor: 'pointer' }}
                  onClick={() => navigate(`/product/${p.id}`)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ aspectRatio: '4/5', overflow: 'hidden', background: '#120808', position: 'relative' }}>
                    {img ? (
                      <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: '52px', color: 'rgba(212,175,55,0.14)' }}>{p.name.charAt(0)}</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, #1a0f12 0%, transparent 100%)', pointerEvents: 'none' }} />
                    {p.item_code && (
                      <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,7,16,0.85)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '4px', padding: '2px 7px', fontSize: '10px', color: '#D4AF37', fontWeight: 600 }}>
                        {p.item_code}
                      </div>
                    )}
                    {/* Remove button */}
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(p.id); }}
                      disabled={removing === p.id}
                      style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(239,68,68,0.85)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', opacity: removing === p.id ? 0.5 : 1 }}
                      title="Remove from wishlist"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <div style={{ padding: '12px 14px 16px' }}>
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 400, color: '#D4AF37', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'rgba(212,175,55,0.5)' }}>
                      <span>{p.weight} g</span>
                      <span>{p.purity?.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default WishlistPage;
