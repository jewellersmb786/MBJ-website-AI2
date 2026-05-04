import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gemstonesAPI, spiritualArticleTypesAPI, spiritualInquiriesAPI } from '../api';
import { Sparkles, X, Send, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SpiritualPage = () => {
  const [gemstones, setGemstones] = useState([]);
  const [articleTypes, setArticleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [birthMonthFilter, setBirthMonthFilter] = useState(null);
  const [selectedGemstone, setSelectedGemstone] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState(null);

  useEffect(() => {
    Promise.all([gemstonesAPI.getAll(), spiritualArticleTypesAPI.getAll()])
      .then(([gRes, aRes]) => {
        setGemstones(gRes.data || []);
        setArticleTypes(aRes.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredGemstones = birthMonthFilter
    ? gemstones.filter(g => g.birth_month === birthMonthFilter || !g.birth_month)
    : gemstones;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim()) { toast.error('Name is required'); return; }
    const digits = form.customer_phone.replace(/\D/g, '');
    if (digits.length < 10) { toast.error('Please enter a valid phone number'); return; }
    setSubmitting(true);
    try {
      const res = await spiritualInquiriesAPI.create({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim() || undefined,
        selected_gemstone_id: selectedGemstone?.id || undefined,
        selected_article_type_id: selectedArticle?.id || undefined,
        notes: form.notes.trim() || undefined,
      });
      setSuccessRef(res.data?.reference_code || 'SPIRIT-NEW');
    } catch { toast.error('Error submitting inquiry. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const inpCls = { width: '100%', padding: '11px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  if (successRef) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 32px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Sparkles size={34} color="#D4AF37" />
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#D4AF37', marginBottom: '12px' }}>Inquiry Received!</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', marginBottom: '24px', lineHeight: 1.8 }}>
            Thank you! We'll craft a custom piece based on your selection. We'll contact you within 24 hours.
          </p>
          <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '16px 24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Your Reference</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.1em' }}>{successRef}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '0 32px', marginBottom: '64px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Sparkles size={26} color="#D4AF37" />
        </div>
        <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>MBJ Jewellers</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>Spiritual & Astrological Jewellery</h1>
        <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto 20px' }} />
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.8 }}>
          Choose your gemstone and article type, and let us craft a sacred piece that resonates with your energy and astrological alignment.
        </p>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading...</div>
        ) : (
          <>
            {/* Step 1 — Gemstones */}
            <div style={{ marginBottom: '52px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: selectedGemstone ? '#D4AF37' : 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: selectedGemstone ? '#000' : '#D4AF37', flexShrink: 0 }}>
                  {selectedGemstone ? <Check size={14} /> : '1'}
                </div>
                <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 600 }}>Choose Your Gemstone</h2>
              </div>

              {/* Birth month filter */}
              {gemstones.some(g => g.birth_month) && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <button onClick={() => setBirthMonthFilter(null)}
                    style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${birthMonthFilter === null ? '#D4AF37' : 'rgba(255,255,255,0.15)'}`, background: birthMonthFilter === null ? 'rgba(212,175,55,0.12)' : 'transparent', color: birthMonthFilter === null ? '#D4AF37' : 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer' }}>
                    All
                  </button>
                  {MONTHS.map((m, i) => (
                    <button key={i} onClick={() => setBirthMonthFilter(i + 1)}
                      style={{ padding: '5px 10px', borderRadius: '20px', border: `1px solid ${birthMonthFilter === i+1 ? '#D4AF37' : 'rgba(255,255,255,0.12)'}`, background: birthMonthFilter === i+1 ? 'rgba(212,175,55,0.12)' : 'transparent', color: birthMonthFilter === i+1 ? '#D4AF37' : 'rgba(255,255,255,0.35)', fontSize: '11px', cursor: 'pointer' }}>
                      {m}
                    </button>
                  ))}
                </div>
              )}

              {filteredGemstones.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: '14px' }}>Gemstones coming soon.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
                  {filteredGemstones.map(g => {
                    const active = selectedGemstone?.id === g.id;
                    return (
                      <motion.div key={g.id} whileHover={{ scale: 1.03 }} onClick={() => setSelectedGemstone(active ? null : g)}
                        style={{ cursor: 'pointer', background: active ? 'rgba(212,175,55,0.12)' : '#1a0f12', border: `2px solid ${active ? '#D4AF37' : 'rgba(212,175,55,0.15)'}`, borderRadius: '12px', overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}>
                        {active && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><Check size={12} color="#000" /></div>}
                        {g.image ? (
                          <img src={g.image} alt={g.name} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{ height: '100px', background: g.color_hex ? `${g.color_hex}22` : 'rgba(212,175,55,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {g.color_hex && <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: g.color_hex, opacity: 0.8 }} />}
                          </div>
                        )}
                        <div style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                            {g.color_hex && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: g.color_hex, flexShrink: 0 }} />}
                            <p style={{ fontSize: '13px', color: active ? '#D4AF37' : '#fff', fontWeight: 600, margin: 0 }}>{g.name}</p>
                          </div>
                          {g.birth_month && <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{MONTHS[g.birth_month - 1]}</p>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2 — Article Types */}
            <AnimatePresence>
              {(selectedGemstone || articleTypes.length > 0) && (
                <motion.div key="step2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '52px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: selectedArticle ? '#D4AF37' : 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: selectedArticle ? '#000' : '#D4AF37', flexShrink: 0 }}>
                      {selectedArticle ? <Check size={14} /> : '2'}
                    </div>
                    <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 600 }}>Choose Article Type</h2>
                  </div>
                  {articleTypes.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: '14px' }}>Article types coming soon.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                      {articleTypes.map(at => {
                        const active = selectedArticle?.id === at.id;
                        return (
                          <motion.div key={at.id} whileHover={{ scale: 1.03 }} onClick={() => setSelectedArticle(active ? null : at)}
                            style={{ cursor: 'pointer', background: active ? 'rgba(212,175,55,0.12)' : '#1a0f12', border: `2px solid ${active ? '#D4AF37' : 'rgba(212,175,55,0.15)'}`, borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                            {active && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><Check size={12} color="#000" /></div>}
                            {at.image ? (
                              <img src={at.image} alt={at.name} style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }} />
                            ) : (
                              <div style={{ height: '90px', background: 'rgba(212,175,55,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={28} color="rgba(212,175,55,0.3)" />
                              </div>
                            )}
                            <div style={{ padding: '10px' }}>
                              <p style={{ fontSize: '13px', color: active ? '#D4AF37' : '#fff', fontWeight: 600, margin: 0 }}>{at.name}</p>
                              {at.description && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '3px 0 0', lineHeight: 1.4 }}>{at.description}</p>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3 — Contact form */}
            <AnimatePresence>
              {(selectedGemstone && selectedArticle) && (
                <motion.div key="step3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#D4AF37', flexShrink: 0 }}>3</div>
                    <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 600 }}>Tell Us More</h2>
                  </div>

                  <div style={{ background: 'rgba(212,175,55,0.06)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                    <strong style={{ color: '#D4AF37' }}>{selectedGemstone.name}</strong> · <strong style={{ color: '#D4AF37' }}>{selectedArticle.name}</strong>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Your Name *</label>
                      <input type="text" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} style={inpCls} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Phone Number *</label>
                      <input type="tel" value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} style={inpCls} placeholder="+91 XXXXX XXXXX" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Email <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
                      <input type="email" value={form.customer_email} onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))} style={inpCls} placeholder="your@email.com" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Additional Notes <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
                      <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={inpCls} placeholder="Any special requirements..." />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" disabled={submitting}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px', background: submitting ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                        <Send size={18} />
                        {submitting ? 'Submitting...' : 'Submit Inquiry'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default SpiritualPage;
