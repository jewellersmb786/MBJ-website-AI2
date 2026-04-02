import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, TrendingUp, Sparkles } from 'lucide-react';
import { calculatorAPI } from '../api';
import toast from 'react-hot-toast';

const CalculatorPage = () => {
  const [manualRates, setManualRates] = useState({
    k24_rate: '7200',
    k22_rate: '6600',
    k18_rate: '5400'
  });

  const [formData, setFormData] = useState({
    weight: '',
    wastage_percent: '',
    making_charges: '',
    stone_charges: '',
    purity: '22k'
  });

  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const wastageOptions = [13, 12, 10, 8];

  const handleManualRateChange = (e) => {
    setManualRates({
      ...manualRates,
      [e.target.name]: e.target.value
    });
  };

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
      const goldRate = parseFloat(manualRates.k22_rate); // Always use 22k

      // HIDDEN CALCULATION (Industry Standard)
      // Step 1: Calculate Billable Weight (includes wastage)
      const billableWeight = weight + (weight * (wastagePercent / 100));
      
      // Step 2: Calculate Gold Value
      const goldValue = billableWeight * goldRate;
      
      // Step 3: Calculate Total Making Charges (per gram of item weight)
      const totalMakingCharges = weight * makingChargesPerGram;
      
      // Step 4: Calculate Subtotal
      const subtotal = goldValue + totalMakingCharges + stoneCharges;
      
      // Step 5: Add 3% GST
      const finalPrice = subtotal * 1.03;

      setResult({
        final_price: Math.round(finalPrice),
        gold_rate_used: goldRate,
        purity: '22k'
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
            className="glass-gold rounded-3xl p-8 mb-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-gold" />
              <h3 className="text-xl font-bold text-gold">Manual Gold Rates (per gram)</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Currently using 22K Gold Rate (Industry Standard for South Indian Jewellery)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  24K Gold Rate (₹/g)
                </label>
                <input
                  type="number"
                  name="k24_rate"
                  value={manualRates.k24_rate}
                  onChange={handleManualRateChange}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-xl text-gold font-bold text-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="7200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  22K Gold Rate (₹/g)
                </label>
                <input
                  type="number"
                  name="k22_rate"
                  value={manualRates.k22_rate}
                  onChange={handleManualRateChange}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-xl text-gold font-bold text-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="6600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  18K Gold Rate (₹/g)
                </label>
                <input
                  type="number"
                  name="k18_rate"
                  value={manualRates.k18_rate}
                  onChange={handleManualRateChange}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-xl text-gold font-bold text-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="5400"
                />
              </div>
            </div>
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
              className="glass-gold rounded-3xl p-12 text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-12 h-12 text-gold" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-4">Estimated Final Price</h3>
              <p className="text-7xl font-playfair font-bold text-[#D4AF37] mb-4" data-testid="final-price">
                ₹{result.final_price.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-400">
                Based on 22K Gold Rate: ₹{result.gold_rate_used}/g • Includes 3% GST
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
