import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, TrendingUp, Sparkles } from 'lucide-react';
import { settingsAPI } from '../api';
import toast from 'react-hot-toast';

const CalculatorPage = () => {
  const [formData, setFormData] = useState({
    weight: '',
    wastage_percent: '',
    making_charges: '',
    stone_charges: '',
    purity: '22k'
  });

  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [goldRates, setGoldRates] = useState({
    k24_rate: 7200,
    k22_rate: 6600,
    k18_rate: 5400
  });
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchLiveGoldRate();
  }, []);

  const fetchLiveGoldRate = async () => {
    try {
      const response = await settingsAPI.getPublic();
      setGoldRates({
        k24_rate: response.data.k24_rate || 7200,
        k22_rate: response.data.k22_rate || 6600,
        k18_rate: response.data.k18_rate || 5400
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching live gold rate:', error);
    }
  };

  const wastageOptions = [13, 12, 10, 8];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const selectWastage = (value) => {
    setFormData({
      ...formData,
      wastage_percent: value
    });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();

    if (!formData.weight || !formData.wastage_percent) {
      toast.error('Please enter weight and select wastage');
      return;
    }

    setCalculating(true);
    try {
      const weight = parseFloat(formData.weight);
      const wastagePercent = parseFloat(formData.wastage_percent);
      const makingChargesPerGram = parseFloat(formData.making_charges || 0);
      const stoneCharges = parseFloat(formData.stone_charges || 0);
      
      // Use correct rate based on purity selection
      let goldRate;
      if (formData.purity === '24k') {
        goldRate = goldRates.k24_rate;
      } else if (formData.purity === '18k') {
        goldRate = goldRates.k18_rate;
      } else {
        goldRate = goldRates.k22_rate; // Default 22K
      }

      // HIDDEN CALCULATION (Industry Standard)
      const billableWeight = weight + (weight * (wastagePercent / 100));
      const goldValue = billableWeight * goldRate;
      const totalMakingCharges = weight * makingChargesPerGram;
      const subtotal = goldValue + totalMakingCharges + stoneCharges;
      const finalPrice = subtotal * 1.03;

      setResult({
        final_price: Math.round(finalPrice),
        gold_rate_used: goldRate,
        purity: formData.purity
      });
      
      toast.success('Price calculated!');
    } catch (error) {
      toast.error('Error calculating price');
      console.error('Error:', error);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen py-32 relative">
      <div className="absolute inset-0 grid-overlay opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <CalcIcon className="w-16 h-16 text-gold" />
              <h1 className="text-6xl font-playfair font-bold gold-text">
                Price Calculator
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Calculate your jewellery price with precision
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-3xl p-6 mb-8"
          >
            <h3 className="text-lg font-bold text-white mb-4 text-center">Live Gold Rates (Per Gram)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">24K</p>
                <p className="text-2xl font-playfair font-bold text-[#D4AF37]">₹{goldRates.k24_rate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">22K</p>
                <p className="text-2xl font-playfair font-bold text-[#D4AF37]">₹{goldRates.k22_rate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">18K</p>
                <p className="text-2xl font-playfair font-bold text-[#D4AF37]">₹{goldRates.k18_rate}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">Updated by Admin • Select purity below</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-3xl p-8 mb-8"
          >
            <form onSubmit={handleCalculate} className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Gold Purity *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['24k', '22k', '18k'].map((purity) => (
                    <button
                      key={purity}
                      type="button"
                      onClick={() => setFormData({ ...formData, purity })}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        formData.purity === purity
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-black/50 text-white border border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      {purity.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Weight (grams) *
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-6 py-4 bg-black/50 border border-gold/30 rounded-xl text-white text-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="Enter weight in grams"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Wastage (VA) *
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {wastageOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectWastage(value)}
                      className={`py-4 rounded-xl font-bold text-lg transition-all ${
                        formData.wastage_percent === value
                          ? 'bg-gold text-black'
                          : 'bg-black/50 text-gray-400 border border-gold/20 hover:border-gold/50'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Making Charges (₹ per gram) <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="making_charges"
                  value={formData.making_charges}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-6 py-4 bg-black/50 border border-gold/30 rounded-xl text-white text-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="Enter making charges per gram"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Stone/Beads Charges (₹) <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="stone_charges"
                  value={formData.stone_charges}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-6 py-4 bg-black/50 border border-gold/30 rounded-xl text-white text-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="Enter stone/beads charges"
                />
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="w-full bg-gold hover:bg-gold-dark text-black py-5 rounded-full font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 hover-glow"
                data-testid="calculate-button"
              >
                <CalcIcon size={24} />
                <span>{calculating ? 'Calculating...' : 'Calculate Price'}</span>
              </button>
            </form>
          </motion.div>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-gold rounded-3xl p-12 text-center mb-6"
            >
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-12 h-12 text-gold" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-4">Estimated Final Price</h3>
              <p className="text-7xl font-playfair font-bold text-[#D4AF37] mb-4" data-testid="final-price">
                ₹{result.final_price.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-400 mb-8">
                Based on {result.purity.toUpperCase()} Gold Rate: ₹{result.gold_rate_used}/g • Includes 3% GST
              </p>
              
              {/* WhatsApp Inquiry Button */}
              <a
                href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '')}?text=Namaste Jewellers MB, I calculated a jewellery estimate of ₹${result.final_price.toLocaleString('en-IN')}. Please confirm pricing and availability.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#D4AF37] hover:bg-[#B8960F] text-black px-8 py-4 rounded-full font-bold text-lg transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>Inquire on WhatsApp</span>
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
