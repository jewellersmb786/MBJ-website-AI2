import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { wishlistAPI } from '../api';
import { useUserPhone } from '../contexts/UserPhoneContext';

// Module-level cache — all WishlistButtons on the same page share one fetch
let _wlCache = null; // { phone: string, ids: Set<string> }

const WishlistButton = ({ productId, size = 20 }) => {
  const { phone: contextPhone, setPhone: savePhone } = useUserPhone();
  const [savedPhone, setSavedPhone] = useState(contextPhone);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalPhone, setModalPhone] = useState('');

  useEffect(() => {
    if (contextPhone !== savedPhone) setSavedPhone(contextPhone);
  }, [contextPhone]); // sync if user logs in elsewhere

  useEffect(() => {
    if (!savedPhone) return;
    let active = true;
    (async () => {
      try {
        if (_wlCache && _wlCache.phone === savedPhone) {
          if (active) setInWishlist(_wlCache.ids.has(productId));
          return;
        }
        const res = await wishlistAPI.get(savedPhone);
        const ids = new Set(res.data?.product_ids || []);
        _wlCache = { phone: savedPhone, ids };
        if (active) setInWishlist(ids.has(productId));
      } catch {}
    })();
    return () => { active = false; };
  }, [savedPhone, productId]);

  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!savedPhone) { setShowModal(true); return; }
    if (loading) return;
    setLoading(true);
    try {
      if (inWishlist) {
        await wishlistAPI.remove(savedPhone, productId);
        if (_wlCache && _wlCache.phone === savedPhone) _wlCache.ids.delete(productId);
        setInWishlist(false);
      } else {
        await wishlistAPI.add(savedPhone, productId);
        if (_wlCache && _wlCache.phone === savedPhone) _wlCache.ids.add(productId);
        setInWishlist(true);
      }
    } catch {}
    setLoading(false);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const digits = modalPhone.replace(/\D/g, '');
    if (digits.length < 10) return;
    savePhone(digits);
    _wlCache = null;
    setShowModal(false);
    setLoading(true);
    try {
      await wishlistAPI.add(digits, productId);
      const res = await wishlistAPI.get(digits);
      _wlCache = { phone: digits, ids: new Set(res.data?.product_ids || []) };
      setInWishlist(true);
    } catch {}
    setSavedPhone(digits);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        style={{
          background: inWishlist ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.55)',
          border: `1px solid ${inWishlist ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: '50%',
          width: `${size + 16}px`, height: `${size + 16}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
          padding: 0, flexShrink: 0,
        }}
      >
        <Heart size={size} color={inWishlist ? '#D4AF37' : 'rgba(255,255,255,0.7)'}
          fill={inWishlist ? '#D4AF37' : 'none'} />
      </button>

      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: '#1a0710', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '32px', maxWidth: '360px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Heart size={32} color="#D4AF37" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', color: '#D4AF37', fontFamily: 'Georgia, serif', margin: '0 0 8px' }}>Save to Wishlist</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                Enter your phone to save items and retrieve them anytime.
              </p>
            </div>
            <form onSubmit={handleModalSubmit}>
              <input
                type="tel" placeholder="+91 XXXXX XXXXX"
                value={modalPhone} onChange={e => setModalPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
                autoFocus
              />
              <button
                type="submit"
                disabled={modalPhone.replace(/\D/g, '').length < 10}
                style={{ width: '100%', padding: '11px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: modalPhone.replace(/\D/g, '').length < 10 ? 0.5 : 1 }}
              >
                Save & Add to Wishlist
              </button>
            </form>
            <button
              onClick={() => setShowModal(false)}
              style={{ width: '100%', padding: '9px', marginTop: '8px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer' }}
            >Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default WishlistButton;
