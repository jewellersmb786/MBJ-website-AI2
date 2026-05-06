import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { schemesAPI } from '../api';
import { Coins, CheckCircle2, ChevronDown, ChevronUp, X, Send, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserPhone } from '../contexts/UserPhoneContext';

const inpStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(212,175,55,0.3)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const EnrollModal = ({ scheme, onClose }) => {
  const { phone: contextPhone } = useUserPhone();
  const isFixed = scheme.scheme_type === 'fixed_monthly';
  const minAmt = scheme.minimum_monthly_amount || 0;
  const [form, setForm] = useState({ customer_name: '', customer_phone: contextPhone || '', customer_email: '', notes: '', monthly_amount: minAmt ? String(minAmt) : '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim()) { toast.error('Name is required'); return; }
    const digits = form.customer_phone.replace(/\D/g, '');
    if (digits.length < 10) { toast.error('Please enter a valid 10-digit phone number'); return; }
    if (isFixed) {
      const amt = parseFloat(form.monthly_amount);
      if (!amt || amt <= 0) { toast.error('Monthly amount is required'); return; }
      if (minAmt && amt < minAmt) { toast.error(`Monthly amount must be at least ₹${minAmt}`); return; }
    }
    setSubmitting(true);
    try {
      await schemesAPI.enroll({
        scheme_id: scheme.id,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim() || undefined,
        notes: form.notes.trim() || undefined,
        monthly_amount: isFixed ? (parseFloat(form.monthly_amount) || undefined) : undefined,
      });
      setDone(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Error submitting. Please try again.');
    }
    finally { setSubmitting(false); }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        style={{ background: '#1a0710', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
          <X size={18} />
        </button>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Coins size={28} color="#D4AF37" />
            </div>
            <h3 style={{ fontSize: '20px', color: '#D4AF37', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '10px' }}>You're on the list!</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
              Thank you! We'll contact you within 24 hours to complete your enrollment in <strong style={{ color: '#fff' }}>{scheme.name}</strong>.
            </p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: '20px', color: '#D4AF37', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '4px' }}>Enroll in {scheme.name}</h3>
            {scheme.tagline && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px', fontStyle: 'italic' }}>{scheme.tagline}</p>}
            {!scheme.tagline && <div style={{ marginBottom: '20px' }} />}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Your Name *</label>
                <input type="text" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} style={inpStyle} placeholder="Enter your name" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Phone Number *</label>
                <input type="tel" value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} style={inpStyle} placeholder="+91 XXXXX XXXXX" required />
              </div>
              {isFixed && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                    Monthly Amount (₹) * {minAmt > 0 && <span style={{ color: 'rgba(255,255,255,0.3)' }}>— min ₹{minAmt}</span>}
                  </label>
                  <input type="number" min={minAmt || 1} value={form.monthly_amount} onChange={e => setForm(p => ({ ...p, monthly_amount: e.target.value }))} style={inpStyle} placeholder={minAmt ? `Min ₹${minAmt}` : 'Enter amount'} required />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Email <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
                <input type="email" value={form.customer_email} onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))} style={inpStyle} placeholder="your@email.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Notes <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ ...inpStyle, resize: 'vertical' }} placeholder="Any questions or special requirements..." />
              </div>
              <button
                type="submit" disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: submitting ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer', marginTop: '4px' }}
              >
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

const renderParagraphs = (text, style = {}) =>
  text.split(/\n\n+/).map((para, i) => (
    <p key={i} style={{ fontSize: '15px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.9, marginBottom: '16px', ...style }}>
      {para.trim()}
    </p>
  ));

const SchemeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    schemesAPI.getById(id)
      .then(res => setScheme(res.data))
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true);
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>Loading...</p>
      </div>
    );
  }

  if (notFound || !scheme) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <Coins size={48} color="rgba(212,175,55,0.3)" />
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: 'rgba(255,255,255,0.5)' }}>Scheme not found</h2>
        <Link to="/schemes" style={{ fontSize: '14px', color: '#D4AF37', textDecoration: 'underline' }}>← Back to Schemes</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a0710', color: '#fff' }}>
      {/* Hero */}
      <div style={{ position: 'relative', minHeight: '420px', display: 'flex', alignItems: 'flex-end' }}>
        {scheme.hero_image ? (
          <>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${scheme.hero_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,7,16,0.45) 0%, rgba(26,7,16,0.85) 60%, #1a0710 100%)' }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a0710 0%, #2a0f1e 100%)' }} />
        )}

        {/* Back button */}
        <button
          onClick={() => navigate('/schemes')}
          style={{ position: 'absolute', top: '110px', left: '24px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', padding: '7px 14px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
        >
          <ArrowLeft size={14} /> Schemes
        </button>

        <div style={{ position: 'relative', zIndex: 1, padding: '0 32px 52px', maxWidth: '800px', margin: '0 auto', width: '100%', paddingTop: '160px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>MBJ Jewellers</p>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 600, color: '#D4AF37', marginBottom: '10px', lineHeight: 1.2 }}>
            {scheme.name}
          </h1>
          {scheme.tagline && (
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,240,210,0.8)', fontStyle: 'italic', fontWeight: 400 }}>
              {scheme.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* Description */}
        <section style={{ marginBottom: '48px' }}>
          {renderParagraphs(scheme.description)}
        </section>

        {/* Highlights */}
        {scheme.highlights?.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#D4AF37', marginBottom: '20px', fontWeight: 500 }}>
              Key Highlights
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scheme.highlights.map((h, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={16} color="#D4AF37" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{h}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Terms collapsible */}
        {scheme.terms && (
          <section style={{ marginBottom: '48px' }}>
            <button
              onClick={() => setTermsOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', padding: '14px 18px', cursor: 'pointer', color: '#D4AF37', fontSize: '14px', fontWeight: 600 }}
            >
              Terms & Conditions
              {termsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <AnimatePresence initial={false}>
              {termsOpen && (
                <motion.div
                  key="terms"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '20px 18px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(212,175,55,0.12)', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
                    {renderParagraphs(scheme.terms, { fontSize: '13px', color: 'rgba(255,255,255,0.5)' })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setEnrollOpen(true)}
            style={{ padding: '16px 48px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', letterSpacing: '0.03em' }}
          >
            {scheme.cta_button_text || 'Enroll Now'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {enrollOpen && <EnrollModal scheme={scheme} onClose={() => setEnrollOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default SchemeDetailPage;
