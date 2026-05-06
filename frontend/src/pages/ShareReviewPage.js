import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Upload, Send, ExternalLink } from 'lucide-react';
import { testimonialsAPI, settingsAPI } from '../api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useUserPhone } from '../contexts/UserPhoneContext';
import { compressImage, PRESET_AVATAR, PRESET_TESTIMONIAL } from '../utils/compressImage';

const inputCls = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)',
  borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box',
};

const ShareReviewPage = () => {
  const { phone: contextPhone, setPhone: savePhone } = useUserPhone();
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ customer_name: '', customer_phone: contextPhone || '', review_text: '' });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    settingsAPI.getPublic().then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageUpload = async (e, setter, preset) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, preset);
      setter(compressed);
    } catch { toast.error('Failed to load image'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim()) { toast.error('Name is required'); return; }
    if (form.customer_phone.replace(/\D/g, '').length < 10) { toast.error('Enter a valid 10-digit phone'); return; }
    if (!rating) { toast.error('Please select a star rating'); return; }
    if (!form.review_text.trim()) { toast.error('Please write a review'); return; }

    setSubmitting(true);
    try {
      await testimonialsAPI.submit({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.replace(/\D/g, ''),
        rating,
        review_text: form.review_text.trim(),
        customer_photo: customerPhoto || undefined,
        product_image: productImage || undefined,
      });
      savePhone(form.customer_phone);
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const googleUrl = settings?.google_maps_review_url;
    const igUrl = settings?.instagram;
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: '480px', width: '100%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '24px', padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Send size={28} color="#D4AF37" />
          </div>
          <h2 style={{ fontSize: '26px', color: '#D4AF37', fontFamily: 'Georgia, serif', fontWeight: 400, margin: '0 0 12px' }}>Thank You!</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 32px' }}>
            Your review has been submitted and will appear on our site after a quick approval.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {googleUrl && (
              <a href={googleUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '10px', color: '#D4AF37', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.1)'}
              >
                <ExternalLink size={15} /> Also leave a Google Review →
              </a>
            )}
            {igUrl && (
              <a href={igUrl.startsWith('http') ? igUrl : `https://instagram.com/${igUrl.replace('@','')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px', color: '#c084fc', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.08)'}
              >
                Tag us on Instagram →
              </a>
            )}
            <Link to="/"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              Visit our website
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const PhotoUploadField = ({ label, value, setter, hint, preset }) => (
    <div>
      <p style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>{label} <span style={{ textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.25)' }}>(optional)</span></p>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={value} alt={label} style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.3)', display: 'block' }} />
          <button type="button" onClick={() => setter(null)}
            style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      ) : (
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '80px', border: '2px dashed rgba(212,175,55,0.25)', borderRadius: '10px', cursor: 'pointer', gap: '6px', transition: 'border-color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'}
        >
          <Upload size={16} color="rgba(212,175,55,0.5)" />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{hint}</span>
          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setter, preset)} style={{ display: 'none' }} />
        </label>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px' }}>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>Customer Reviews</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#D4AF37', margin: '0 0 14px' }}>Share your experience</h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>
            We'd love to hear from you. Your review helps others discover us.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '36px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Your Name *</label>
                <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange}
                  placeholder="Priya Sharma" style={inputCls} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Phone *</label>
                <input type="tel" name="customer_phone" value={form.customer_phone} onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX" style={inputCls} />
              </div>
            </div>

            {/* Star rating */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>Your Rating *</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3,4,5].map(i => (
                  <button key={i} type="button"
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '36px', lineHeight: 1, color: i <= (hoverRating || rating) ? '#D4AF37' : 'rgba(255,255,255,0.2)', transition: 'color 0.12s, transform 0.12s', transform: i <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)', padding: '2px' }}
                  >★</button>
                ))}
                {rating > 0 && (
                  <span style={{ alignSelf: 'center', marginLeft: '8px', fontSize: '13px', color: 'rgba(212,175,55,0.7)' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Review text */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Your Review *</label>
              <textarea name="review_text" value={form.review_text} onChange={handleChange} rows={4}
                placeholder="Tell us about your experience with MBJ Jewellers…"
                style={{ ...inputCls, resize: 'vertical', minHeight: '100px', lineHeight: 1.6 }} />
            </div>

            {/* Photo uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <PhotoUploadField label="Photo of you with the item" value={customerPhoto} setter={setCustomerPhoto} hint="Click to upload" preset={PRESET_AVATAR} />
              <PhotoUploadField label="Photo of the item" value={productImage} setter={setProductImage} hint="Click to upload" preset={PRESET_TESTIMONIAL} />
            </div>

            <button type="submit" disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', background: submitting ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              <Send size={18} />
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </motion.div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '20px' }}>
          Reviews are moderated and typically approved within 24 hours.
        </p>
      </div>
    </div>
  );
};

export default ShareReviewPage;
