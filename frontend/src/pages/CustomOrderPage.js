import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Instagram, Send } from 'lucide-react';
import { customOrderAPI } from '../api';
import toast from 'react-hot-toast';

const CustomOrderPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    jewellery_type: '',
    description: '',
    instagram_url: '',
    instagram_screenshot: null
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          instagram_screenshot: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Please fill required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Save to database first
      await customOrderAPI.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        jewellery_type: formData.jewellery_type || 'Custom Design',
        description: formData.description,
        reference_images: formData.instagram_screenshot ? [formData.instagram_screenshot] : []
      });
      
      toast.success('Custom order inquiry submitted!');

      // Prepare WhatsApp message
      const whatsappNumber = '917019539776';
      const message = `New Custom Order Request:%0A%0AName: ${encodeURIComponent(formData.name)}%0AContact: ${encodeURIComponent(formData.phone)}%0AEmail: ${encodeURIComponent(formData.email || 'Not provided')}%0AJewellery Type: ${encodeURIComponent(formData.jewellery_type || 'Custom Design')}%0ADetails: ${encodeURIComponent(formData.description || 'Not provided')}%0AInstagram: ${encodeURIComponent(formData.instagram_url || 'Not provided')}`;
      
      // Open WhatsApp
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      
      // Reset form for next customer
      setFormData({
        name: '',
        phone: '',
        email: '',
        jewellery_type: '',
        description: '',
        instagram_url: '',
        instagram_screenshot: null
      });
    } catch (error) {
      toast.error('Error submitting inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-32 bg-[#1a1a1a]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-playfair font-bold text-[#D4AF37] mb-4">
              Custom Jewellery Orders
            </h1>
            <p className="text-gray-400 text-lg">
              Create your dream jewellery piece • 162K+ Instagram Followers Trust Us
            </p>
          </motion.div>

          {/* Instagram Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-3xl p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Instagram className="w-8 h-8 text-[#D4AF37]" />
              <h2 className="text-2xl font-bold text-white">Instagram Reference</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Saw something you love on our Instagram (@jewellersmb)? Share it with us!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: Paste Instagram URL */}
              <div className="bg-black/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <LinkIcon className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-semibold text-white">Paste Instagram URL</h3>
                </div>
                <input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="https://instagram.com/p/..."
                />
              </div>

              {/* Option 2: Upload Screenshot */}
              <div className="bg-black/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-semibold text-white">Upload Screenshot</h3>
                </div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#D4AF37]/30 rounded-xl cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">Click to upload image</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {formData.instagram_screenshot && (
                  <div className="mt-3">
                    <img 
                      src={formData.instagram_screenshot} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Custom Order Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/50 border border-[#D4AF37]/20 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Your Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Jewellery Type
                </label>
                <input
                  type="text"
                  name="jewellery_type"
                  value={formData.jewellery_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="e.g., Nakshi Necklace, Antique Haram"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description & Requirements
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Describe your custom jewellery requirements..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
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
