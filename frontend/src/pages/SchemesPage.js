import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { schemesAPI, schemeEnrollmentsAPI, settingsAPI } from '../api';
import { Coins, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, MessageCircle } from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtINR = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n || 0));

const fmtDateStr = (s) => {
  if (!s) return '—';
  try { return new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return s; }
};

const STATUS_COLORS = { new: '#fbbf24', active: '#60a5fa', completed: '#4ade80', cancelled: '#f87171' };

const fmtWAPhone = (phone) => {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length === 10) return '91' + d;
  if (d.length === 12 && d.startsWith('91')) return d;
  if (d.length === 11 && d.startsWith('0')) return '91' + d.slice(1);
  return d;
};

// ─── EnrollmentCard ──────────────────────────────────────────────────────────

const EnrollmentCard = ({ enrollment: e, whatsapp }) => {
  const [expanded, setExpanded] = useState(false);
  const isFixed = e.scheme_type === 'fixed_monthly';
  const npw = e.next_payment_window;
  const pct = e.completion_percent;
  const extraMonths = (e.expected_total_months || 0) - (e.original_total_months || 0);
  const lastPayment = (e.payments || []).slice(-1)[0];
  const customerPhone = fmtWAPhone(e.customer_phone || '');
  const waNum = customerPhone || fmtWAPhone(whatsapp);

  const waMsg = isFixed && npw && !npw.is_overdue
    ? `Hi, I'd like to pay my ${e.scheme_name} instalment for ${fmtDateStr(npw.start_date)} – ${fmtDateStr(npw.end_date)}. Please share UPI/payment details.`
    : `Hi, I'd like to enquire about my ${e.scheme_name || 'scheme'} enrollment.`;
  const waLink = `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;

  return (
    <div style={{ background: '#1a0710', border: `1px solid ${e.status === 'completed' ? 'rgba(74,222,128,0.25)' : 'rgba(212,175,55,0.18)'}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '14px' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '3px' }}>
              {isFixed ? 'Fixed Monthly' : 'Flexible'}
            </p>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', color: '#D4AF37' }}>{e.scheme_name || 'Gold Scheme'}</h3>
          </div>
          <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '20px', background: `${STATUS_COLORS[e.status] || '#888'}18`, color: STATUS_COLORS[e.status] || '#888', border: `1px solid ${STATUS_COLORS[e.status] || '#888'}44`, fontWeight: 700, flexShrink: 0 }}>
            {(e.status || 'new').toUpperCase()}
          </span>
        </div>

        {/* Summary line */}
        {isFixed ? (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            {e.start_date ? `Started ${fmtDateStr(e.start_date)}` : 'Not yet started'}
            {e.monthly_amount ? ` · Monthly: ₹${fmtINR(e.monthly_amount)}` : ''}
          </p>
        ) : (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            {lastPayment
              ? `Last payment ${fmtDateStr(lastPayment.payment_date)}${lastPayment.gold_rate_at_payment ? ` @ ₹${fmtINR(lastPayment.gold_rate_at_payment)}/g` : ''}`
              : 'No payments yet'}
          </p>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '0 20px 14px' }}>
        {isFixed ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                <strong style={{ color: '#fff' }}>{e.months_paid || 0}</strong> of{' '}
                <strong style={{ color: '#D4AF37' }}>{e.expected_total_months || e.original_total_months || '?'}</strong> months
              </span>
              {pct != null && <span style={{ fontSize: '13px', color: '#D4AF37', fontWeight: 700 }}>{pct}%</span>}
            </div>
            <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ height: '100%', background: e.status === 'completed' ? '#4ade80' : 'linear-gradient(90deg,#D4AF37,#FFD700)', borderRadius: '4px', width: `${Math.min(100, pct || 0)}%`, transition: 'width 0.5s' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Total paid: <strong style={{ color: '#fff' }}>₹{fmtINR(e.total_amount_paid)}</strong></p>
            {extraMonths > 0 && (
              <p style={{ fontSize: '12px', color: '#fbbf24', marginTop: '6px' }}>
                ⚠ Tenure extended by {extraMonths} month{extraMonths !== 1 ? 's' : ''} due to missed payment{extraMonths !== 1 ? 's' : ''}
              </p>
            )}
            {e.monthly_amount && e.original_total_months && (
              <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.55)', marginTop: '6px' }}>
                🎁 Total benefit on completion: ₹{fmtINR(e.monthly_amount * (e.original_total_months + 1))} ({e.original_total_months} + 1 bonus instalment)
              </p>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Total Paid</p>
              <p style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 700 }}>₹{fmtINR(e.total_amount_paid)}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Gold Accumulated</p>
              <p style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 700 }}>{(e.total_grams_accumulated || 0).toFixed(4)}g</p>
            </div>
          </div>
        )}
      </div>

      {/* Next payment / overdue */}
      {isFixed && e.status === 'active' && npw && (
        <div style={{ margin: '0 20px 14px', padding: '10px 14px', borderRadius: '10px', background: npw.is_overdue ? 'rgba(239,68,68,0.1)' : 'rgba(212,175,55,0.06)', border: `1px solid ${npw.is_overdue ? 'rgba(239,68,68,0.3)' : 'rgba(212,175,55,0.2)'}` }}>
          {npw.is_overdue ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} color="#f87171" />
              <span style={{ fontSize: '13px', color: '#f87171' }}>Payment window passed — please contact us to update your account.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} color="#D4AF37" />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                Next payment: <strong style={{ color: '#D4AF37' }}>{fmtDateStr(npw.start_date)} – {fmtDateStr(npw.end_date)}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setExpanded(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '12px', cursor: 'pointer' }}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide history' : 'View history'}
        </button>
        {e.status !== 'cancelled' && e.status !== 'completed' && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
            <MessageCircle size={13} />
            {isFixed ? 'Pay via WhatsApp' : 'Contact us'}
          </a>
        )}
      </div>

      {/* Expandable history */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="hist" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid rgba(212,175,55,0.1)', padding: '14px 20px' }}>
              {(e.payments || []).length === 0 ? (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>No payments recorded yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        {['Date', 'Amount', 'Method', isFixed ? 'Month #' : 'Rate/g', isFixed ? null : 'Grams'].filter(Boolean).map(h => (
                          <th key={h} style={{ padding: '5px 8px', fontSize: '10px', color: 'rgba(212,175,55,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...(e.payments || [])].reverse().map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '7px 8px', color: 'rgba(255,255,255,0.55)' }}>{fmtDateStr(p.payment_date)}</td>
                          <td style={{ padding: '7px 8px', color: '#D4AF37', fontWeight: 600 }}>₹{fmtINR(p.amount)}</td>
                          <td style={{ padding: '7px 8px', color: 'rgba(255,255,255,0.45)' }}>{p.method}</td>
                          {isFixed
                            ? <td style={{ padding: '7px 8px', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>{p.month_number || '—'}</td>
                            : <td style={{ padding: '7px 8px', color: 'rgba(255,255,255,0.45)' }}>{p.gold_rate_at_payment ? `₹${fmtINR(p.gold_rate_at_payment)}` : '—'}</td>}
                          {!isFixed && <td style={{ padding: '7px 8px', color: '#D4AF37' }}>{p.grams_credited ? `${p.grams_credited}g` : '—'}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── SchemesPage ─────────────────────────────────────────────────────────────

const SchemesPage = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsapp, setWhatsapp] = useState('917019539776');

  // Enrollment lookup state
  const [phone, setPhone] = useState('');
  const [enrollments, setEnrollments] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    Promise.all([schemesAPI.getAll(), settingsAPI.getPublic()])
      .then(([sRes, stRes]) => {
        setSchemes(sRes.data || []);
        const w = (stRes.data?.whatsapp || '').replace(/\D/g, '');
        if (w) setWhatsapp(w);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) return;
    setLookupLoading(true);
    try {
      const res = await schemeEnrollmentsAPI.getByPhone(phone.trim());
      setEnrollments(res.data || []);
    } catch {
      setEnrollments([]);
    } finally {
      setLookupLoading(false);
      setSearched(true);
    }
  };

  const inpStyle = {
    flex: 1, padding: '12px 16px', background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px',
    color: '#fff', fontSize: '15px', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>

      {/* ── Hero ── */}
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

      {/* ── Scheme Cards ── */}
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
                onClick={() => navigate(`/schemes/${scheme.id}`)}
                style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                {scheme.hero_image && (
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <img src={scheme.hero_image} alt={scheme.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)' }} />
                  </div>
                )}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#D4AF37', marginBottom: '4px' }}>{scheme.name}</h3>
                  {scheme.tagline && <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.6)', marginBottom: '10px', fontStyle: 'italic' }}>{scheme.tagline}</p>}
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '16px', flex: 1 }}>
                    {scheme.description.split(/\n\n+/)[0]}
                  </p>
                  {scheme.highlights?.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {scheme.highlights.slice(0, 3).map((h, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                          <CheckCircle2 size={14} color="#D4AF37" style={{ flexShrink: 0, marginTop: '2px' }} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button onClick={ev => { ev.stopPropagation(); navigate(`/schemes/${scheme.id}`); }}
                    style={{ width: '100%', padding: '12px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#B8960F'}
                    onMouseLeave={e => e.currentTarget.style.background = '#D4AF37'}
                  >{scheme.cta_button_text || 'Enroll Now'}</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div style={{ maxWidth: '1100px', margin: '72px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '56px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(212,175,55,0.15)' }} />
          <p style={{ fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.45)', whiteSpace: 'nowrap' }}>Already Enrolled?</p>
          <div style={{ flex: 1, height: '1px', background: 'rgba(212,175,55,0.15)' }} />
        </div>

        {/* Track section heading */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, color: '#fff', marginBottom: '10px' }}>Track Your Scheme</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto' }}>
            Enter the phone number you registered with to view your enrollment status, payment history, and upcoming dues.
          </p>
        </div>

        {/* Phone lookup form */}
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '10px', maxWidth: '520px', margin: '0 auto 48px' }}>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inpStyle} placeholder="+91 XXXXX XXXXX" />
          <button type="submit" disabled={lookupLoading || phone.replace(/\D/g, '').length < 10}
            style={{ padding: '12px 24px', background: lookupLoading ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: lookupLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
            {lookupLoading ? 'Searching...' : 'View My Schemes'}
          </button>
        </form>

        {/* Results */}
        <AnimatePresence>
          {searched && !lookupLoading && (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '680px', margin: '0 auto' }}>
              {!enrollments || enrollments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                  <Coins size={40} color="rgba(212,175,55,0.2)" style={{ marginBottom: '14px' }} />
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '17px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>No schemes found for this number.</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, marginBottom: '20px' }}>
                    If you've enrolled, please contact us to verify your registration. Make sure you use the same number you gave us.
                  </p>
                  <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi, I would like to check my scheme enrollment status.')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
                    <MessageCircle size={15} /> Contact us on WhatsApp
                  </a>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                    Found <strong style={{ color: '#D4AF37' }}>{enrollments.length}</strong> enrollment{enrollments.length !== 1 ? 's' : ''} for {phone}
                  </p>
                  {enrollments.map((enrollment, i) => (
                    <EnrollmentCard key={enrollment.id || i} enrollment={enrollment} whatsapp={whatsapp} />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SchemesPage;
