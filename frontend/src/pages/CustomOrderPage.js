import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Instagram, Send } from 'lucide-react';
import { customOrderAPI } from '../api';
import toast from 'react-hot-toast';

const IMAGE_LIMIT = 5;

const CustomOrderPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    jewellery_type: '',
    description: '',
    instagram_url: '',
    reference_images: [],
    weight_requirement: '',
    occasion: '',
    preferred_completion_date: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRefImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const available = IMAGE_LIMIT - formData.reference_images.length;
    const toAdd = files.slice(0, available);
    if (toAdd.length === 0) { toast.error(`Maximum ${IMAGE_LIMIT} reference images allowed.`); return; }
    const readers = toAdd.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(imgs => {
      setFormData(prev => ({ ...prev, reference_images: [...prev.reference_images, ...imgs] }));
    });
  };

  const removeRefImage = (idx) => {
    setFormData(prev => ({ ...prev, reference_images: prev.reference_images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Name is required.'); return; }
    const digits = formData.phone.replace(/\D/g, '');
    if (digits.length < 10) { toast.error('Please enter a valid 10-digit phone number.'); return; }

    setSubmitting(true);
    try {
      const res = await customOrderAPI.create({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        jewellery_type: formData.jewellery_type || 'Custom Design',
        description: formData.description.trim() || undefined,
        reference_images: formData.reference_images,
        instagram_url: formData.instagram_url.trim() || undefined,
        weight_requirement: formData.weight_requirement ? parseFloat(formData.weight_requirement) : undefined,
        occasion: formData.occasion || undefined,
        preferred_completion_date: formData.preferred_completion_date || undefined,
      });

      const ref = res.data?.reference_code || 'CUSTOM-NEW';
      setSuccessRef(ref);

      const whatsappNumber = '917019539776';
      const msg = `New Custom Order Request (${ref})%0A%0AName: ${encodeURIComponent(formData.name)}%0APhone: ${encodeURIComponent(formData.phone)}%0AType: ${encodeURIComponent(formData.jewellery_type || 'Custom Design')}%0ADetails: ${encodeURIComponent(formData.description)}`;
      window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
    } catch {
      toast.error('Error submitting inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]";

  if (successRef) {
    return (
      <div className="min-h-screen py-32 bg-[#1a1a1a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto px-4 text-center"
        >
          <div className="bg-black/60 border border-[#D4AF37]/40 rounded-3xl p-10">
            <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-6">
              <Send className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-playfair font-bold text-[#D4AF37] mb-3">Request Received!</h2>
            <p className="text-gray-300 mb-6">We'll contact you within 24 hours to discuss your custom order.</p>
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl px-6 py-4 mb-8">
              <p className="text-xs text-gray-400 mb-1 tracking-widest uppercase">Your Reference</p>
              <p className="text-2xl font-bold text-[#D4AF37] tracking-wider">{successRef}</p>
            </div>
            <p className="text-sm text-gray-400">
              WhatsApp: +91 7019539776 • Email: jewellersmb786@gmail.com
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 bg-[#1a1a1a]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl font-playfair font-bold text-[#D4AF37] mb-4">Custom Jewellery Orders</h1>
            <p className="text-gray-400 text-lg">Create your dream jewellery piece • 162K+ Instagram Followers Trust Us</p>
          </motion.div>

          {/* Instagram Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-3xl p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Instagram className="w-8 h-8 text-[#D4AF37]" />
              <h2 className="text-2xl font-bold text-white">Instagram Reference</h2>
            </div>
            <p className="text-gray-300 mb-6">Saw something you love on our Instagram (@jewellersmb)? Share it with us!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Paste URL */}
              <div className="bg-black/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <LinkIcon className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-semibold text-white">Paste Instagram URL</h3>
                </div>
                <input type="url" name="instagram_url" value={formData.instagram_url} onChange={handleChange}
                  className={inputCls} placeholder="https://instagram.com/p/..." />
              </div>

              {/* Upload images */}
              <div className="bg-black/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-semibold text-white">
                    Upload Reference Images
                    <span className="ml-2 text-xs font-normal text-gray-400">({formData.reference_images.length}/{IMAGE_LIMIT})</span>
                  </h3>
                </div>
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl transition-colors ${formData.reference_images.length >= IMAGE_LIMIT ? 'border-gray-600 cursor-not-allowed opacity-50' : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60 cursor-pointer'}`}>
                  <Upload className="w-7 h-7 text-gray-400 mb-1" />
                  <p className="text-sm text-gray-400">{formData.reference_images.length >= IMAGE_LIMIT ? 'Limit reached' : 'Click to upload'}</p>
                  <input type="file" accept="image/*" multiple onChange={handleRefImagesUpload}
                    disabled={formData.reference_images.length >= IMAGE_LIMIT} className="hidden" />
                </label>
              </div>
            </div>

            {/* Thumbnail strip */}
            {formData.reference_images.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {formData.reference_images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} alt={`Ref ${idx + 1}`} className="w-20 h-20 object-cover rounded-xl border border-[#D4AF37]/30" />
                    <button type="button" onClick={() => removeRefImage(idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 leading-none">✕</button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-black/50 border border-[#D4AF37]/20 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Your Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Your Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className={inputCls} placeholder="Enter your name" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className={inputCls} placeholder="+91 XXXXX XXXXX" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className={inputCls} placeholder="your@email.com" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Jewellery Type</label>
                <input type="text" name="jewellery_type" value={formData.jewellery_type} onChange={handleChange}
                  className={inputCls} placeholder="e.g., Nakshi Necklace, Antique Haram" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description & Requirements</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4"
                  className={inputCls} style={{ resize: 'vertical', minHeight: '100px' }}
                  placeholder="Describe your custom jewellery requirements..." />
              </div>

              {/* Weight + 22K Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Weight Requirement (grams) <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input type="text" inputMode="decimal" name="weight_requirement" value={formData.weight_requirement}
                    onChange={handleChange}
                    className={inputCls} placeholder="e.g. 25 — leave blank if unsure" />
                </div>
                <div style={{ border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '12px 16px', alignSelf: 'flex-end', color: '#D4AF37', fontStyle: 'italic', fontSize: '13px', lineHeight: 1.5 }}>
                  ✦ We craft customised jewellery only in 22K gold.
                </div>
              </div>

              {/* Occasion & Date row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Occasion <span className="text-gray-500 font-normal">(optional)</span></label>
                  <input type="text" name="occasion" value={formData.occasion} onChange={handleChange}
                    className={inputCls} placeholder="e.g., Wedding, Anniversary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Preferred Completion Date <span className="text-gray-500 font-normal">(optional)</span></label>
                  <input type="date" name="preferred_completion_date" value={formData.preferred_completion_date} onChange={handleChange}
                    className={inputCls} style={{ colorScheme: 'dark' }} />
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-[#D4AF37] hover:bg-[#B8960F] text-black py-4 rounded-full font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <Send size={20} />
                <span>{submitting ? 'Submitting...' : 'Submit Custom Order Request'}</span>
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>We will contact you within 24 hours to discuss your custom order</p>
            <p className="mt-2">WhatsApp: +91 7019539776 • Email: jewellersmb786@gmail.com</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomOrderPage;
