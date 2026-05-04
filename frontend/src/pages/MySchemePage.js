import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { schemeEnrollmentsAPI, settingsAPI } from '../api';
import { Coins, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, MessageCircle } from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtINR = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n || 0));

const fmtDateStr = (s) => {
  if (!s) return '—';
  try {
    return new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return s; }
};

const STATUS_COLORS = { new: '#fbbf24', active: '#60a5fa', completed: '#4ade80', cancelled: '#f87171' };

// ─── EnrollmentCard ──────────────────────────────────────────────────────────

const EnrollmentCard = ({ enrollment, whatsapp }) => {
  const [expanded, setExpanded] = useState(false);
  const e = enrollment;
  const isFixed = e.scheme_type === 'fixed_monthly';
  const npw = e.next_payment_window;
  const pct = e.completion_percent;
  const forfeited = e.forfeited_months || [];
  const extraMonths = (e.expected_total_months || 0) - (e.original_total_months || 0);
  const lastPayment = (e.payments || []).slice(-1)[0];

  const waNum = (whatsapp || '917019539776').replace(/\D/g, '');
  const waMsg = isFixed && npw && !npw.is_overdue
    ? `Hi, I'd like to pay my ${e.scheme_name} instalment for ${fmtDateStr(npw.start_date)} – ${fmtDateStr(npw.end_date)}. Please share UPI/payment details.`
    : `Hi, I'd like to enquire about my ${e.scheme_name || 'scheme'} enrollment.`;
  const waLink = `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#1a0710', border: `1px solid ${e.status === 'completed' ? 'rgba(74,222,128,0.25)' : 'rgba(212,175,55,0.18)'}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>

      {/* Card header */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
              {isFixed ? 'Fixed Monthly' : 'Flexible'}
            </p>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#D4AF37', marginBottom: '0' }}>{e.scheme_name || 'Gold Scheme'}</h3>
          </div>
          <span style={{ fontSize: '11px', padding: '3px 12px', borderRadius: '20px', background: `${STATUS_COLORS[e.status] || '#888'}18`, color: STATUS_COLORS[e.status] || '#888', border: `1px solid ${STATUS_COLORS[e.status] || '#888'}44`, fontWeight: 700, flexShrink: 0 }}>
            {e.status.toUpperCase()}
          </span>
        </div>

        {/* Summary line */}
        {isFixed ? (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>
            {e.start_date ? `Started ${fmtDateStr(e.start_date)}` : 'Not yet started'}
            {e.monthly_amount ? ` · ₹${fmtINR(e.monthly_amount)}/month` : ''}
          </p>
        ) : (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>
            {lastPayment ? `Last payment ${fmtDateStr(lastPayment.payment_date)}${lastPayment.gold_rate_at_payment ? ` @ ₹${fmtINR(lastPayment.gold_rate_at_payment)}/g` : ''}` : 'No payments yet'}
          </p>
        )}
      </div>

      {/* Progress / totals */}
      <div style={{ padding: '0 20px 16px' }}>
        {isFixed ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                <strong style={{ color: '#fff' }}>{e.months_paid || 0}</strong> of{' '}
                <strong style={{ color: '#D4AF37' }}>{e.expected_total_months || e.original_total_months || '?'}</strong> months paid
              </span>
              {pct != null && <span style={{ fontSize: '13px', color: '#D4AF37', fontWeight: 700 }}>{pct}%</span>}
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ height: '100%', background: e.status === 'completed' ? '#4ade80' : 'linear-gradient(90deg,#D4AF37,#FFD700)', borderRadius: '4px', width: `${Math.min(100, pct || 0)}%`, transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Total paid: <strong style={{ color: '#fff' }}>₹{fmtINR(e.total_amount_paid)}</strong></span>
            </div>
            {extraMonths > 0 && (
              <p style={{ fontSize: '12px', color: '#fbbf24', marginTop: '8px' }}>
                ⚠ Tenure extended by {extraMonths} month{extraMonths !== 1 ? 's' : ''} due to missed payment{extraMonths !== 1 ? 's' : ''}
              </p>
            )}
            {e.scheme_name === 'Gold Harvest Scheme' && e.monthly_amount && e.original_total_months && (
              <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.6)', marginTop: '8px' }}>
                🎁 On completion you receive ₹{fmtINR(e.monthly_amount * (e.original_total_months + 1))} total benefit ({e.original_total_months} + 1 bonus instalment)
              </p>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Total Paid</p>
              <p style={{ fontSize: '20px', color: '#D4AF37', fontWeight: 700 }}>₹{fmtINR(e.total_amount_paid)}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Gold Accumulated</p>
              <p style={{ fontSize: '20px', color: '#D4AF37', fontWeight: 700 }}>{(e.total_grams_accumulated || 0).toFixed(4)}g</p>
            </div>
          </div>
        )}
      </div>

      {/* Next payment / overdue banner */}
      {isFixed && e.status === 'active' && npw && (
        <div style={{ margin: '0 20px 16px', padding: '12px 14px', borderRadius: '10px', background: npw.is_overdue ? 'rgba(239,68,68,0.1)' : 'rgba(212,175,55,0.07)', border: `1px solid ${npw.is_overdue ? 'rgba(239,68,68,0.3)' : 'rgba(212,175,55,0.25)'}` }}>
          {npw.is_overdue ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} color="#f87171" />
              <span style={{ fontSize: '13px', color: '#f87171' }}>Payment window passed — please contact us to update your account.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={15} color="#D4AF37" />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                Next payment due:{' '}
                <strong style={{ color: '#D4AF37' }}>{fmtDateStr(npw.start_date)} – {fmtDateStr(npw.end_date)}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setExpanded(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer' }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide history' : 'View payment history'}
        </button>
        {e.status !== 'cancelled' && e.status !== 'completed' && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            <MessageCircle size={14} />
            {isFixed ? 'Pay this month via WhatsApp' : 'Contact us on WhatsApp'}
          </a>
        )}
      </div>

      {/* Expandable payment history */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="hist" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid rgba(212,175,55,0.1)', padding: '16px 20px' }}>
              {(e.payments || []).length === 0 ? (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>No payments recorded yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr>
                        {['Date', 'Amount', 'Method', isFixed ? 'Month #' : 'Rate/g', isFixed ? null : 'Grams'].filter(Boolean).map(h => (
                          <th key={h} style={{ padding: '6px 10px', fontSize: '10px', color: 'rgba(212,175,55,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...(e.payments || [])].reverse().map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.6)' }}>{fmtDateStr(p.payment_date)}</td>
                          <td style={{ padding: '8px 10px', color: '#D4AF37', fontWeight: 600 }}>₹{fmtINR(p.amount)}</td>
                          <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.5)' }}>{p.method}</td>
                          {isFixed
                            ? <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{p.month_number || '—'}</td>
                            : <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.5)' }}>{p.gold_rate_at_payment ? `₹${fmtINR(p.gold_rate_at_payment)}` : '—'}</td>}
                          {!isFixed && <td style={{ padding: '8px 10px', color: '#D4AF37' }}>{p.grams_credited ? `${p.grams_credited}g` : '—'}</td>}
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
    </motion.div>
  );
};

// ─── MySchemePage ────────────────────────────────────────────────────────────

const MySchemePage = () => {
  const [phone, setPhone] = useState('');
  const [enrollments, setEnrollments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState('917019539776');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return;
    setLoading(true);
    try {
      const [enRes, stRes] = await Promise.all([
        schemeEnrollmentsAPI.getByPhone(phone.trim()),
        settingsAPI.getPublic(),
      ]);
      setEnrollments(enRes.data || []);
      const w = (stRes.data?.whatsapp || '').replace(/\D/g, '');
      if (w) setWhatsapp(w);
      setSearched(true);
    } catch {
      setEnrollments([]);
      setSearched(true);
    } finally { setLoading(false); }
  };

  const inpStyle = {
    width: '100%', padding: '14px 18px', background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(212,175,55,0.35)', borderRadius: '12px',
    color: '#fff', fontSize: '16px', outline: 'none', boxSizing: 'border-box',
    letterSpacing: '0.04em',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '0 32px', marginBottom: '56px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Coins size={26} color="#D4AF37" />
        </div>
        <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>MBJ Jewellers</p>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 500, color: '#fff', marginBottom: '12px' }}>Track Your Schemes</h1>
        <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.8 }}>
          Enter the phone number you registered with to view your enrollment status, payment history, and upcoming dues.
        </p>
      </div>

      {/* Search form */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 24px 48px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inpStyle}
            placeholder="+91 XXXXX XXXXX"
          />
          <button type="submit" disabled={loading || phone.replace(/\D/g,'').length < 10}
            style={{ padding: '14px', background: loading ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            {loading ? 'Searching...' : 'View My Schemes'}
          </button>
        </form>
      </div>

      {/* Results */}
      <AnimatePresence>
        {searched && !loading && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
            {enrollments === null || enrollments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                <Coins size={44} color="rgba(212,175,55,0.2)" style={{ marginBottom: '16px' }} />
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>No schemes found for this number.</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, marginBottom: '24px' }}>
                  If you've enrolled in a scheme, please contact us to verify your registration. Make sure you use the same number you gave us.
                </p>
                <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi, I would like to check my scheme enrollment status.')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                  <MessageCircle size={16} /> Contact us on WhatsApp
                </a>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
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
  );
};

export default MySchemePage;
