import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { schemesAPI, settingsAPI } from '../api';
import { Coins, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const fmtINR = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n || 0));

const EnrollModal = ({ scheme, whatsapp, onClose }) => {
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim()) { toast.error('Name is required'); return; }
    const digits = form.customer_phone.replace(/\D/g, '');
    if (digits.length < 10) { toast.error('Please enter a valid 10-digit phone number'); return; }
    setSubmitting(true);
    try {
      await schemesAPI.enroll({
        scheme_id: scheme.id,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setDone(true);
    } catch { toast.error('Error submitting. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const inpStyle = { width: '100%', padding: '11px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Coins size={28} color="#D4AF37" />
            </div>
            <h3 style={{ fontSize: '20px', color: '#D4AF37', fontFamily: 'Georgia, serif', marginBottom: '10px' }}>You're on the list!</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>Thank you! We'll contact you within 24 hours to complete your enrollment in <strong style={{ color: '#fff' }}>{scheme.name}</strong>.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: '20px', color: '#D4AF37', fontFamily: 'Georgia, serif', marginBottom: '6px' }}>Enroll in {scheme.name}</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>₹{fmtINR(scheme.monthly_amount)}/month · {scheme.duration_months} months</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Your Name *</label>
                <input type="text" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} style={inpStyle} placeholder="Enter your name" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Phone Number *</label>
                <input type="tel" value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} style={inpStyle} placeholder="+91 XXXXX XXXXX" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Email <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
                <input type="email" value={form.customer_email} onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))} style={inpStyle} placeholder="your@email.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Notes <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ ...inpStyle, resize: 'vertical' }} placeholder="Any questions or special requirements..." />
              </div>
              <button type="submit" disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: submitting ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
                <Send size={16} />
                {submitting ? 'Submitting...' : 'Submit Enrollment'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

const SchemesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [whatsapp, setWhatsapp] = useState('917019539776');

  useEffect(() => {
    Promise.all([
      schemesAPI.getAll(),
      settingsAPI.getPublic(),
    ]).then(([sRes, stRes]) => {
      setSchemes(sRes.data || []);
      const w = (stRes.data?.whatsapp || '').replace(/\D/g, '');
      if (w) setWhatsapp(w);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '0 32px', marginBottom: '64px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Coins size={26} color="#D4AF37" />
        </div>
        <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>MBJ Jewellers</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>Our Gold Saving Schemes</h1>
        <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto 20px' }} />
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          Flexible and affordable savings plans designed to make your dream jewellery purchase a reality.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading schemes...</div>
        ) : schemes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 32px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Schemes coming soon.</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginBottom: '28px' }}>Contact us for personalised plans.</p>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              Contact on WhatsApp
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' }}>
            {schemes.map((scheme, idx) => (
              <motion.div key={scheme.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {scheme.image && (
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <img src={scheme.image} alt={scheme.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)' }} />
                  </div>
                )}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#D4AF37', marginBottom: '8px' }}>{scheme.name}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '16px', flex: 1 }}>{scheme.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px', background: 'rgba(212,175,55,0.06)', borderRadius: '8px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monthly</p>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: '#D4AF37', fontVariantNumeric: 'tabular-nums' }}>₹{fmtINR(scheme.monthly_amount)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Duration</p>
                      <p style={{ fontSize: '16px', color: '#fff', fontWeight: 600 }}>{scheme.duration_months} months</p>
                    </div>
                  </div>
                  {scheme.benefits && (
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', lineHeight: 1.6, borderLeft: '2px solid rgba(212,175,55,0.3)', paddingLeft: '10px' }}>{scheme.benefits}</p>
                  )}
                  <button onClick={() => setSelected(scheme)}
                    style={{ width: '100%', padding: '12px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#B8960F'}
                    onMouseLeave={e => e.currentTarget.style.background = '#D4AF37'}
                  >Enroll Now</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <EnrollModal scheme={selected} whatsapp={whatsapp} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default SchemesPage;
