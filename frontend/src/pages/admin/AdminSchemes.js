import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, Plus, Edit2, Trash2, X, Save, Upload, Users,
  ChevronRight, AlertTriangle, CheckCircle2, MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtINR = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return '—'; } };
const fmtDateStr = (s) => { if (!s) return '—'; try { return new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return s; } };

const fmtWAPhone = (phone) => {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length === 10) return '91' + d;
  if (d.length === 12 && d.startsWith('91')) return d;
  if (d.length === 11 && d.startsWith('0')) return '91' + d.slice(1);
  return d || '917019539776';
};

const computeNextWindow = (e) => {
  if (e.scheme_type !== 'fixed_monthly' || e.status !== 'active' || !e.start_date) return null;
  try {
    const sd = new Date(e.start_date + 'T00:00:00');
    const paid = e.months_paid || 0;
    const grace = e.grace_days || 5;
    const ws = new Date(sd.getTime() + paid * 30 * 86400000);
    const we = new Date(ws.getTime() + grace * 86400000);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return { start_date: ws.toISOString().split('T')[0], end_date: we.toISOString().split('T')[0], is_overdue: today > we };
  } catch { return null; }
};

// ─── WhatsApp template builder ───────────────────────────────────────────────

const buildWALink = (e, template) => {
  const phone = fmtWAPhone(e.customer_phone);
  const name = e.customer_name || 'valued customer';
  const scheme = e.scheme_name || 'our scheme';
  const isFixed = e.scheme_type === 'fixed_monthly';
  const monthlyAmt = e.monthly_amount || 0;
  const npw = computeNextWindow(e);
  const lastPay = (e.payments || []).slice(-1)[0];

  let msg = '';
  if (template === 'welcome') {
    const details = isFixed
      ? `You've committed to ₹${fmtINR(monthlyAmt)}/month for ${e.original_total_months || '?'} months. Your first instalment is now due. Reply when you're ready to pay.`
      : `You can make payments anytime to accumulate gold at the day's rate. Reply when you'd like to make your first contribution.`;
    msg = `Hi ${name}, welcome to Jewellers MB's *${scheme}*! 🌟 Your enrollment is confirmed.\n\n${details}\n\nWe'll keep you updated. Thank you for choosing us!`;
  } else if (template === 'reminder') {
    const windowStr = npw
      ? (npw.is_overdue ? '— please note the payment window has passed' : `between *${fmtDateStr(npw.start_date)}* and *${fmtDateStr(npw.end_date)}*`)
      : '';
    msg = `Hi ${name}, your *${scheme}* instalment of ₹${fmtINR(monthlyAmt)} for month ${(e.months_paid || 0) + 1} is due ${windowStr}.\n\nPlease share your UPI/payment confirmation once paid.\n\nThank you!`;
  } else if (template === 'received') {
    const extra = isFixed
      ? `Month *${lastPay?.month_number || '?'}* of *${e.expected_total_months || '?'}* marked as paid. Months remaining: *${Math.max(0, (e.expected_total_months || 0) - (e.months_paid || 0))}*.`
      : `Gold credited: *${lastPay?.grams_credited || 0}g* at ₹${fmtINR(lastPay?.gold_rate_at_payment)}/g. Total accumulated: *${(e.total_grams_accumulated || 0).toFixed(4)}g*.`;
    msg = `Hi ${name}, we've received ₹${fmtINR(lastPay?.amount || 0)} for your *${scheme}*. ${extra}\n\nThank you!`;
  } else if (template === 'complete') {
    const extra = isFixed
      ? `Total paid: ₹${fmtINR(e.total_amount_paid)}. You can now redeem ₹${fmtINR(e.total_amount_paid + monthlyAmt)} (with our 1 bonus instalment) toward any jewellery from our collection.`
      : `Total paid: ₹${fmtINR(e.total_amount_paid)}. Gold accumulated: ${(e.total_grams_accumulated || 0).toFixed(4)}g. You can apply this toward any jewellery purchase.`;
    msg = `Hi ${name}, congratulations! 🎉 You've completed your *${scheme}*.\n\n${extra}\n\nVisit us or reply to redeem. Thank you for your trust!`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
};

// ─── styles ──────────────────────────────────────────────────────────────────

const sHead = { padding: '10px 14px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.12)' };
const sCell = { padding: '12px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle' };
const inp = { width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const ENROLL_STATUS = ['new', 'active', 'completed', 'cancelled'];
const ENROLL_COLORS = { new: '#fbbf24', active: '#60a5fa', completed: '#4ade80', cancelled: '#f87171' };
const PAYMENT_METHODS = ['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'Other'];

// ─── WAButton ────────────────────────────────────────────────────────────────

const WAButton = ({ label, href, style = {} }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '6px', color: '#4ade80', fontSize: '12px', fontWeight: 600, textDecoration: 'none', ...style }}>
    <MessageSquare size={11} /> {label}
  </a>
);

// ─── SchemeModal ─────────────────────────────────────────────────────────────

const EMPTY_SCHEME_FORM = {
  name: '', tagline: '', description: '', highlights: '', terms: '',
  cta_button_text: 'Enroll Now', hero_image: '', display_order: 0,
  scheme_type: 'flexible', minimum_monthly_amount: '', total_months: 12, grace_days: 5,
};

const SchemeModal = ({ scheme, onClose, onSave }) => {
  const [form, setForm] = useState(scheme ? {
    name: scheme.name,
    tagline: scheme.tagline || '',
    description: scheme.description,
    highlights: (scheme.highlights || []).join('\n'),
    terms: scheme.terms || '',
    cta_button_text: scheme.cta_button_text || 'Enroll Now',
    hero_image: scheme.hero_image || '',
    display_order: scheme.display_order || 0,
    is_active: scheme.is_active,
    scheme_type: scheme.scheme_type || 'flexible',
    minimum_monthly_amount: scheme.minimum_monthly_amount || '',
    total_months: scheme.total_months || 12,
    grace_days: scheme.grace_days ?? 5,
  } : EMPTY_SCHEME_FORM);
  const [saving, setSaving] = useState(false);
  const isFixed = form.scheme_type === 'fixed_monthly';

  const handleImg = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const { compressImage, PRESET_PRODUCT } = await import('../../utils/compressImage');
      const compressed = await compressImage(file, PRESET_PRODUCT);
      setForm(p => ({ ...p, hero_image: compressed }));
    } catch { toast.error('Image upload failed'); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    setSaving(true);
    try {
      const highlights = form.highlights.split('\n').map(s => s.trim()).filter(Boolean);
      const payload = {
        name: form.name.trim(), tagline: form.tagline.trim() || undefined,
        description: form.description.trim(), highlights,
        terms: form.terms.trim() || undefined,
        cta_button_text: form.cta_button_text.trim() || 'Enroll Now',
        hero_image: form.hero_image || undefined, display_order: parseInt(form.display_order) || 0,
        scheme_type: form.scheme_type,
        minimum_monthly_amount: isFixed ? (parseFloat(form.minimum_monthly_amount) || null) : null,
        total_months: isFixed ? (parseInt(form.total_months) || null) : null,
        grace_days: isFixed ? (parseInt(form.grace_days) || 5) : null,
      };
      if (scheme) await adminAPI.schemes.update(scheme.id, { ...payload, is_active: form.is_active });
      else await adminAPI.schemes.create(payload);
      toast.success(scheme ? 'Scheme updated' : 'Scheme created');
      onSave();
    } catch { toast.error('Error saving scheme'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        style={{ background: '#111', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '560px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
        <h2 style={{ fontSize: '18px', color: '#D4AF37', marginBottom: '20px' }}>{scheme ? 'Edit Scheme' : 'Add Scheme'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Name *</label><input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp} /></div>
          <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Tagline</label><input type="text" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} style={inp} placeholder="e.g. Save smart. Buy gold." /></div>
          <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Description *</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} /></div>
          <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Highlights (one per line)</label><textarea value={form.highlights} onChange={e => setForm(p => ({ ...p, highlights: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} /></div>
          <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Terms & Conditions</label><textarea value={form.terms} onChange={e => setForm(p => ({ ...p, terms: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} /></div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Scheme Type</label>
            <select value={form.scheme_type} onChange={e => setForm(p => ({ ...p, scheme_type: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
              <option value="flexible">Flexible (pay anytime)</option>
              <option value="fixed_monthly">Fixed Monthly (instalment plan)</option>
            </select>
          </div>
          {isFixed && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', padding: '14px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '8px' }}>
              <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Min Monthly (₹)</label><input type="number" min="0" value={form.minimum_monthly_amount} onChange={e => setForm(p => ({ ...p, minimum_monthly_amount: e.target.value }))} style={inp} placeholder="1000" /></div>
              <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Total Months</label><input type="number" min="1" value={form.total_months} onChange={e => setForm(p => ({ ...p, total_months: e.target.value }))} style={inp} /></div>
              <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Grace Days</label><input type="number" min="0" value={form.grace_days} onChange={e => setForm(p => ({ ...p, grace_days: e.target.value }))} style={inp} /></div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>CTA Button Text</label><input type="text" value={form.cta_button_text} onChange={e => setForm(p => ({ ...p, cta_button_text: e.target.value }))} style={inp} /></div>
            <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Display Order</label><input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: e.target.value }))} style={inp} /></div>
          </div>
          {scheme && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: '#D4AF37', width: '15px', height: '15px' }} id="act" />
              <label htmlFor="act" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>Active</label>
            </div>
          )}
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Hero Image</label>
            {form.hero_image ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={form.hero_image} alt="preview" style={{ height: '80px', width: 'auto', objectFit: 'cover', borderRadius: '6px' }} />
                <button type="button" onClick={() => setForm(p => ({ ...p, hero_image: '' }))} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={11} /></button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '2px dashed rgba(212,175,55,0.3)', borderRadius: '8px', cursor: 'pointer' }}>
                <Upload size={16} color="rgba(212,175,55,0.5)" /><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Click to upload</span>
                <input type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: saving ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Save size={16} />{saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── EnrollCustomerModal ──────────────────────────────────────────────────────

const EnrollCustomerModal = ({ schemes, onClose, onSave }) => {
  const [form, setForm] = useState({ scheme_id: '', customer_name: '', customer_phone: '', customer_email: '', notes: '', monthly_amount: '' });
  const [saving, setSaving] = useState(false);
  const selectedScheme = schemes.find(s => s.id === form.scheme_id);
  const isFixed = selectedScheme?.scheme_type === 'fixed_monthly';
  const minAmt = selectedScheme?.minimum_monthly_amount || 0;

  const handleSave = async () => {
    if (!form.scheme_id) { toast.error('Select a scheme'); return; }
    if (!form.customer_name.trim()) { toast.error('Customer name is required'); return; }
    if (form.customer_phone.replace(/\D/g, '').length < 10) { toast.error('Valid phone number required'); return; }
    if (isFixed) {
      const amt = parseFloat(form.monthly_amount);
      if (!amt || amt <= 0) { toast.error('Monthly amount is required'); return; }
      if (minAmt && amt < minAmt) { toast.error(`Monthly amount must be at least ₹${minAmt}`); return; }
    }
    setSaving(true);
    try {
      await adminAPI.schemeEnrollments.create({
        scheme_id: form.scheme_id,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim() || undefined,
        notes: form.notes.trim() || undefined,
        monthly_amount: isFixed ? (parseFloat(form.monthly_amount) || undefined) : undefined,
      });
      toast.success('Customer enrolled successfully');
      onSave();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Error enrolling customer'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        style={{ background: '#111', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '480px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
        <h2 style={{ fontSize: '18px', color: '#D4AF37', marginBottom: '20px' }}>Enroll Customer</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Scheme *</label>
            <select value={form.scheme_id} onChange={e => setForm(p => ({ ...p, scheme_id: e.target.value, monthly_amount: '' }))} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">— Select scheme —</option>
              {schemes.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name} ({s.scheme_type === 'fixed_monthly' ? 'Fixed Monthly' : 'Flexible'})</option>)}
            </select>
          </div>
          {isFixed && (
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>
                Monthly Amount (₹) * {minAmt > 0 && <span style={{ color: 'rgba(255,255,255,0.3)' }}>— min ₹{fmtINR(minAmt)}</span>}
              </label>
              <input type="number" min={minAmt || 1} value={form.monthly_amount} onChange={e => setForm(p => ({ ...p, monthly_amount: e.target.value }))} style={inp} placeholder={minAmt ? `Min ₹${fmtINR(minAmt)}` : 'Enter amount'} />
            </div>
          )}
          <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Customer Name *</label><input type="text" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} style={inp} placeholder="Full name" /></div>
          <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Phone Number *</label><input type="tel" value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} style={inp} placeholder="+91 XXXXX XXXXX" /></div>
          <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Email (optional)</label><input type="email" value={form.customer_email} onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))} style={inp} placeholder="customer@email.com" /></div>
          <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Notes (optional)</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} /></div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: saving ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Enrolling...' : 'Enroll Customer'}
            </button>
            <button onClick={onClose} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── EnrollmentManageModal ────────────────────────────────────────────────────

const EnrollmentManageModal = ({ enrollment: initial, onClose, onRefresh }) => {
  const [enrollment, setEnrollment] = useState(initial);
  const [activeTab, setActiveTab] = useState('payments');
  const [payForm, setPayForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: 'Cash', notes: '' });
  const [payLoading, setPayLoading] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: initial.status });
  const [statusSaving, setStatusSaving] = useState(false);
  const [forfeitForm, setForfeitForm] = useState({ month_number: '', reason: '' });
  const [forfeitLoading, setForfeitLoading] = useState(false);

  const isFixed = enrollment.scheme_type === 'fixed_monthly';
  const npw = computeNextWindow(enrollment);
  const lastPay = (enrollment.payments || []).slice(-1)[0];
  const tenureExtended = (enrollment.expected_total_months || 0) > (enrollment.original_total_months || 0);

  const refresh = useCallback(async () => {
    try { const r = await adminAPI.schemeEnrollments.getById(enrollment.id); setEnrollment(r.data); onRefresh(); } catch {}
  }, [enrollment.id, onRefresh]);

  const handleLogPayment = async () => {
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!payForm.payment_date) { toast.error('Select a payment date'); return; }
    setPayLoading(true);
    try {
      const r = await adminAPI.schemeEnrollments.logPayment(enrollment.id, { amount: parseFloat(payForm.amount), payment_date: payForm.payment_date, method: payForm.method, notes: payForm.notes || undefined });
      setEnrollment(r.data);
      setPayForm(p => ({ ...p, amount: '', notes: '' }));
      toast.success('Payment logged');
      onRefresh();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Error logging payment'); }
    finally { setPayLoading(false); }
  };

  const handleStatusSave = async () => {
    setStatusSaving(true);
    try { await adminAPI.schemeEnrollments.updateStatus(enrollment.id, statusForm.status); setEnrollment(p => ({ ...p, status: statusForm.status })); toast.success('Status updated'); onRefresh(); }
    catch { toast.error('Error updating status'); }
    finally { setStatusSaving(false); }
  };

  const handleForfeit = async () => {
    const mn = parseInt(forfeitForm.month_number);
    if (!mn || mn < 1) { toast.error('Enter a valid month number'); return; }
    setForfeitLoading(true);
    try {
      const r = await adminAPI.schemeEnrollments.forfeitMonth(enrollment.id, { month_number: mn, reason: forfeitForm.reason || undefined });
      setEnrollment(r.data); setForfeitForm({ month_number: '', reason: '' }); toast.success(`Month ${mn} forfeited`); onRefresh();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Error'); }
    finally { setForfeitLoading(false); }
  };

  const tabBtn = (key, label) => (
    <button onClick={() => setActiveTab(key)} style={{ padding: '7px 14px', borderRadius: '20px', border: `1px solid ${activeTab === key ? '#D4AF37' : 'rgba(255,255,255,0.12)'}`, background: activeTab === key ? 'rgba(212,175,55,0.1)' : 'transparent', color: activeTab === key ? '#D4AF37' : 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
      {label}
    </button>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        style={{ background: '#0f0a10', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', width: '100%', maxWidth: '680px', position: 'relative', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '22px 24px 14px', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
          <p style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>{isFixed ? 'Fixed Monthly' : 'Flexible'} Scheme</p>
          <h3 style={{ fontSize: '17px', color: '#D4AF37', marginBottom: '2px' }}>{enrollment.scheme_name || '—'}</h3>
          <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{enrollment.customer_name}<span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}> · {enrollment.customer_phone}</span></p>
          {enrollment.customer_email && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{enrollment.customer_email}</p>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', background: `${ENROLL_COLORS[enrollment.status] || '#888'}22`, color: ENROLL_COLORS[enrollment.status] || '#888', border: `1px solid ${ENROLL_COLORS[enrollment.status] || '#888'}55`, fontWeight: 600 }}>{enrollment.status}</span>
            {enrollment.start_date && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Started {fmtDateStr(enrollment.start_date)}</span>}
          </div>
        </div>

        {/* Progress / summary */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
          {isFixed ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                  Paid <strong style={{ color: '#fff' }}>{enrollment.months_paid || 0}</strong> of <strong style={{ color: '#D4AF37' }}>{enrollment.expected_total_months || enrollment.original_total_months || '?'}</strong> months
                </span>
                {tenureExtended && <span style={{ fontSize: '11px', color: '#fbbf24' }}>+{(enrollment.expected_total_months - enrollment.original_total_months)} extended</span>}
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg,#D4AF37,#FFD700)', width: `${Math.min(100, ((enrollment.months_paid || 0) / (enrollment.expected_total_months || 1)) * 100)}%`, transition: 'width 0.4s' }} />
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Total paid: <strong style={{ color: '#fff' }}>₹{fmtINR(enrollment.total_amount_paid)}</strong></span>
                {enrollment.monthly_amount && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Monthly commitment: <strong style={{ color: '#D4AF37' }}>₹{fmtINR(enrollment.monthly_amount)}</strong></span>}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Total Paid</p><p style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 700 }}>₹{fmtINR(enrollment.total_amount_paid)}</p></div>
              <div><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Gold Accumulated</p><p style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 700 }}>{(enrollment.total_grams_accumulated || 0).toFixed(4)}g</p></div>
              <div><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Payments</p><p style={{ fontSize: '18px', color: '#fff', fontWeight: 700 }}>{(enrollment.payments || []).length}</p></div>
            </div>
          )}
        </div>

        {/* WA template buttons */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(212,175,55,0.08)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(enrollment.status === 'new' || (enrollment.status === 'active' && (enrollment.months_paid || 0) === 0)) && (
            <WAButton label="Send Welcome" href={buildWALink(enrollment, 'welcome')} />
          )}
          {isFixed && enrollment.status === 'active' && npw && (
            <WAButton label={npw.is_overdue ? 'Send Overdue Reminder' : 'Send Payment Reminder'} href={buildWALink(enrollment, 'reminder')} style={npw.is_overdue ? { borderColor: 'rgba(239,68,68,0.4)', color: '#f87171', background: 'rgba(239,68,68,0.08)' } : {}} />
          )}
          {lastPay && (
            <WAButton label="Payment Received" href={buildWALink(enrollment, 'received')} />
          )}
          {enrollment.status === 'completed' && (
            <WAButton label="Send Completion Notice" href={buildWALink(enrollment, 'complete')} style={{ borderColor: 'rgba(74,222,128,0.4)', color: '#4ade80', background: 'rgba(74,222,128,0.08)' }} />
          )}
        </div>

        {/* Overdue banner */}
        {npw?.is_overdue && (
          <div style={{ padding: '10px 24px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={15} color="#f87171" />
            <span style={{ fontSize: '13px', color: '#f87171', flex: 1 }}>Payment window missed ({fmtDateStr(npw.start_date)} – {fmtDateStr(npw.end_date)}). Forfeit this month?</span>
            <button onClick={() => setActiveTab('forfeit')} style={{ fontSize: '12px', padding: '4px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}>Forfeit</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ padding: '14px 24px 0', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {tabBtn('payments', 'Payments')}
          {tabBtn('status', 'Status')}
          {isFixed && tabBtn('forfeit', 'Forfeit Month')}
        </div>

        {/* Tab content */}
        <div style={{ padding: '18px 24px 28px' }}>

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div>
              <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
                <p style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Log New Payment</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>Amount (₹) *</label><input type="number" min="0" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} style={inp} placeholder={enrollment.monthly_amount ? `e.g. ${fmtINR(enrollment.monthly_amount)}` : '0'} /></div>
                  <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>Date *</label><input type="date" value={payForm.payment_date} onChange={e => setPayForm(p => ({ ...p, payment_date: e.target.value }))} style={inp} /></div>
                  <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>Method</label><select value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>{PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                  <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>Notes</label><input type="text" value={payForm.notes} onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} style={inp} placeholder="Optional" /></div>
                </div>
                <button onClick={handleLogPayment} disabled={payLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: payLoading ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: payLoading ? 'not-allowed' : 'pointer' }}>
                  <CheckCircle2 size={14} />{payLoading ? 'Logging...' : 'Log Payment'}
                </button>
              </div>

              {(enrollment.payments || []).length === 0 ? (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px', padding: '16px 0' }}>No payments yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <th style={sHead}>Date</th><th style={sHead}>Amount</th><th style={sHead}>Method</th>
                      {isFixed && <th style={sHead}>Month #</th>}
                      {!isFixed && <><th style={sHead}>Rate/g</th><th style={sHead}>Grams</th></>}
                    </tr></thead>
                    <tbody>
                      {[...(enrollment.payments || [])].reverse().map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                          <td style={sCell}>{fmtDateStr(p.payment_date)}</td>
                          <td style={{ ...sCell, color: '#D4AF37', fontWeight: 600 }}>₹{fmtINR(p.amount)}</td>
                          <td style={sCell}>{p.method}</td>
                          {isFixed && <td style={{ ...sCell, textAlign: 'center' }}>{p.month_number || '—'}</td>}
                          {!isFixed && <><td style={sCell}>{p.gold_rate_at_payment ? `₹${fmtINR(p.gold_rate_at_payment)}` : '—'}</td><td style={{ ...sCell, color: '#D4AF37' }}>{p.grams_credited ? `${p.grams_credited}g` : '—'}</td></>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STATUS TAB */}
          {activeTab === 'status' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>Status</label>
                <select value={statusForm.status} onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                  {ENROLL_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={handleStatusSave} disabled={statusSaving} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: statusSaving ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: statusSaving ? 'not-allowed' : 'pointer' }}>
                <Save size={14} />{statusSaving ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          )}

          {/* FORFEIT TAB */}
          {activeTab === 'forfeit' && isFixed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Mark a month as missed. This extends the total tenure by 1 month.</p>
              {(enrollment.forfeited_months || []).length > 0 && (
                <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#fbbf24' }}>Already forfeited: months {enrollment.forfeited_months.join(', ')}</p>
                </div>
              )}
              <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>Month Number *</label><input type="number" min="1" value={forfeitForm.month_number} onChange={e => setForfeitForm(p => ({ ...p, month_number: e.target.value }))} style={inp} placeholder={`1–${enrollment.expected_total_months || '?'}`} /></div>
              <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>Reason (optional)</label><input type="text" value={forfeitForm.reason} onChange={e => setForfeitForm(p => ({ ...p, reason: e.target.value }))} style={inp} /></div>
              <button onClick={handleForfeit} disabled={forfeitLoading} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: forfeitLoading ? 'not-allowed' : 'pointer' }}>
                <AlertTriangle size={14} />{forfeitLoading ? 'Processing...' : 'Forfeit Month'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── AdminSchemes ─────────────────────────────────────────────────────────────

const AdminSchemes = () => {
  const [tab, setTab] = useState('schemes');
  const [schemes, setSchemes] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schemeModal, setSchemeModal] = useState(null);
  const [manageEnrollment, setManageEnrollment] = useState(null);
  const [enrollCustomer, setEnrollCustomer] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, eRes] = await Promise.all([adminAPI.schemes.getAll(), adminAPI.schemeEnrollments.getAll()]);
      setSchemes(sRes.data || []);
      setEnrollments(eRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Delete this scheme?')) return;
    try { await adminAPI.schemes.delete(id); toast.success('Scheme deleted'); load(); }
    catch (err) { toast.error(err?.response?.data?.detail || 'Error deleting scheme', { duration: 7000 }); }
  };

  const handleDeleteEnrollment = async (id, name) => {
    if (!window.confirm(`Delete enrollment for ${name}? This cannot be undone.`)) return;
    try { await adminAPI.schemeEnrollments.delete(id); toast.success('Enrollment deleted'); load(); }
    catch (err) { toast.error(err?.response?.data?.detail || 'Error'); }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#D4AF37', fontWeight: 600, margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '10px' }}><Coins size={22} /> Schemes</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{schemes.length} scheme(s) · {enrollments.length} enrollment(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tab === 'enrollments' && (
            <button onClick={() => setEnrollCustomer(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              <Users size={15} /> Enroll Customer
            </button>
          )}
          {tab === 'schemes' && (
            <button onClick={() => setSchemeModal('new')} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              <Plus size={16} /> Add Scheme
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {[['schemes', 'Schemes'], ['enrollments', 'Enrollments']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '8px 18px', borderRadius: '20px', border: `1px solid ${tab === k ? '#D4AF37' : 'rgba(255,255,255,0.12)'}`, background: tab === k ? 'rgba(212,175,55,0.1)' : 'transparent', color: tab === k ? '#D4AF37' : 'rgba(255,255,255,0.45)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading…</div>
      ) : tab === 'schemes' ? (
        schemes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}><Coins size={48} style={{ marginBottom: '16px', opacity: 0.3 }} /><p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>No schemes yet.</p></div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={sHead}>Image</th><th style={sHead}>Name</th><th style={sHead}>Type</th><th style={sHead}>Min/Details</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Status</th><th style={{ ...sHead, textAlign: 'center' }}>Order</th><th style={{ ...sHead, width: '80px' }}></th>
              </tr></thead>
              <tbody>
                {schemes.map((scheme, idx) => (
                  <motion.tr key={scheme.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }} style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                    <td style={sCell}>{scheme.hero_image ? <img src={scheme.hero_image} alt={scheme.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }} /> : <div style={{ width: '44px', height: '44px', background: 'rgba(212,175,55,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Coins size={18} color="rgba(212,175,55,0.4)" /></div>}</td>
                    <td style={{ ...sCell, color: '#fff', fontWeight: 500 }}>{scheme.name}</td>
                    <td style={sCell}><span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: scheme.scheme_type === 'fixed_monthly' ? 'rgba(96,165,250,0.12)' : 'rgba(212,175,55,0.1)', color: scheme.scheme_type === 'fixed_monthly' ? '#60a5fa' : '#D4AF37', fontWeight: 600 }}>{scheme.scheme_type === 'fixed_monthly' ? 'Fixed' : 'Flexible'}</span></td>
                    <td style={{ ...sCell, color: 'rgba(255,255,255,0.45)', maxWidth: '180px' }}>{scheme.scheme_type === 'fixed_monthly' ? `Min ₹${fmtINR(scheme.minimum_monthly_amount)} · ${scheme.total_months} months` : (scheme.tagline || '—')}</td>
                    <td style={{ ...sCell, textAlign: 'center' }}><span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', background: scheme.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)', color: scheme.is_active ? '#4ade80' : '#9ca3af', fontWeight: 600 }}>{scheme.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ ...sCell, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>{scheme.display_order}</td>
                    <td style={sCell}><div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setSchemeModal(scheme)} style={{ padding: '5px 8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer' }}><Edit2 size={13} /></button>
                      <button onClick={() => handleDeleteScheme(scheme.id)} style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                    </div></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        enrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}><Users size={48} style={{ marginBottom: '16px', opacity: 0.3 }} /><p style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}>No enrollments yet. Use "Enroll Customer" to add one.</p></div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <th style={sHead}>Scheme</th><th style={sHead}>Customer</th><th style={sHead}>Phone</th>
                  <th style={sHead}>Progress / Totals</th><th style={sHead}>Status</th><th style={sHead}>Date</th>
                  <th style={{ ...sHead, width: '130px' }}></th>
                </tr></thead>
                <tbody>
                  {enrollments.map((e, idx) => {
                    const npw = computeNextWindow(e);
                    const isFixed = e.scheme_type === 'fixed_monthly';
                    return (
                      <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                        style={{ borderBottom: '1px solid rgba(212,175,55,0.07)', background: npw?.is_overdue ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                        <td style={{ ...sCell, color: '#D4AF37' }}>{e.scheme_name || '—'}</td>
                        <td style={{ ...sCell, color: '#fff', fontWeight: 500 }}>{e.customer_name}</td>
                        <td style={sCell}>{e.customer_phone}</td>
                        <td style={sCell}>
                          {isFixed
                            ? <span style={{ fontSize: '12px' }}>{e.months_paid || 0}/{e.expected_total_months || e.original_total_months || '?'} mo{e.monthly_amount ? ` · ₹${fmtINR(e.monthly_amount)}` : ''}</span>
                            : <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>₹{fmtINR(e.total_amount_paid)} · {(e.total_grams_accumulated || 0).toFixed(2)}g</span>}
                          {npw?.is_overdue && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#f87171' }}>⚠ overdue</span>}
                        </td>
                        <td style={sCell}><span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: `${ENROLL_COLORS[e.status] || '#888'}22`, color: ENROLL_COLORS[e.status] || '#888', fontWeight: 600 }}>{e.status}</span></td>
                        <td style={{ ...sCell, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fmtDate(e.created_at)}</td>
                        <td style={sCell}>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => setManageEnrollment(e)} style={{ padding: '5px 8px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', color: '#D4AF37', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                              <ChevronRight size={12} /> Manage
                            </button>
                            <button onClick={() => handleDeleteEnrollment(e.id, e.customer_name)} style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      <AnimatePresence>
        {schemeModal && <SchemeModal scheme={schemeModal === 'new' ? null : schemeModal} onClose={() => setSchemeModal(null)} onSave={() => { setSchemeModal(null); load(); }} />}
        {enrollCustomer && <EnrollCustomerModal schemes={schemes} onClose={() => setEnrollCustomer(false)} onSave={() => { setEnrollCustomer(false); load(); setTab('enrollments'); }} />}
        {manageEnrollment && <EnrollmentManageModal enrollment={manageEnrollment} onClose={() => setManageEnrollment(null)} onRefresh={load} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminSchemes;
