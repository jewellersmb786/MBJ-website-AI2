import React, { useState, useEffect } from 'react';
import { goldAPI, calculatorAPI } from '../api';
import { Calculator, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const CalculatorPage = () => {
  const [goldRates, setGoldRates] = useState(null);
  const [formData, setFormData] = useState({
    weight: '',
    wastage_percent: '',
    making_charges: '',
    stone_charges: '0',
    purity: '22k'
  });
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchGoldRates();
  }, []);

  const fetchGoldRates = async () => {
    try {
      const response = await goldAPI.getRates();
      setGoldRates(response.data);
    } catch (error) {
      console.error('Error fetching gold rates:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!formData.weight || !formData.wastage_percent || !formData.making_charges) {
      toast.error('Please fill all required fields');
      return;
    }

    setCalculating(true);
    try {
      const response = await calculatorAPI.calculate({
        weight: parseFloat(formData.weight),
        wastage_percent: parseFloat(formData.wastage_percent),
        making_charges: parseFloat(formData.making_charges),
        stone_charges: parseFloat(formData.stone_charges || 0),
        purity: formData.purity
      });
      setResult(response.data);
      toast.success('Price calculated successfully!');
    } catch (error) {
      toast.error('Error calculating price');
      console.error('Error:', error);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Calculator className="w-12 h-12 text-gold" />
              <h1 className="text-5xl font-playfair font-bold">Price Calculator</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Calculate your jewellery price with live gold rates</p>
          </div>

          {/* Live Gold Rates */}
          {goldRates && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">24 Karat</p>
                <p className="text-2xl font-bold text-gold">₹{goldRates.k24_rate}</p>
                <p className="text-xs text-gray-500">per gram</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">22 Karat</p>
                <p className="text-2xl font-bold text-gold">₹{goldRates.k22_rate}</p>
                <p className="text-xs text-gray-500">per gram</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">18 Karat</p>
                <p className="text-2xl font-bold text-gold">₹{goldRates.k18_rate}</p>
                <p className="text-xs text-gray-500">per gram</p>
              </div>
            </div>
          )}

          {/* Calculator Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleCalculate} className="space-y-6">
              {/* Purity Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">Gold Purity *</label>
                <select
                  name="purity"
                  value={formData.purity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent dark:bg-gray-800"
                  required
                >
                  <option value="24k">24 Karat</option>
                  <option value="22k">22 Karat (Recommended)</option>
                  <option value="18k">18 Karat</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-semibold mb-2">Weight (grams) *</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent dark:bg-gray-800"
                  placeholder="Enter weight in grams"
                  required
                />
              </div>

              {/* Wastage */}
              <div>
                <label className="block text-sm font-semibold mb-2">Wastage (%) *</label>
                <input
                  type="number"
                  name="wastage_percent"
                  value={formData.wastage_percent}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent dark:bg-gray-800"
                  placeholder="Enter wastage percentage"
                  required
                />
              </div>

              {/* Making Charges */}
              <div>
                <label className="block text-sm font-semibold mb-2">Making Charges (₹) *</label>
                <input
                  type="number"
                  name="making_charges"
                  value={formData.making_charges}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent dark:bg-gray-800"
                  placeholder="Enter making charges"
                  required
                />
              </div>

              {/* Stone Charges */}
              <div>
                <label className="block text-sm font-semibold mb-2">Stone Charges (₹)</label>
                <input
                  type="number"
                  name="stone_charges"
                  value={formData.stone_charges}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent dark:bg-gray-800"
                  placeholder="Enter stone charges (if any)"
                />
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                disabled={calculating}
                className="w-full bg-gold hover:bg-gold-dark text-white py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                data-testid="calculate-button"
              >
                <Calculator size={20} />
                <span>{calculating ? 'Calculating...' : 'Calculate Price'}</span>
              </button>
            </form>

            {/* Result */}
            {result && (
              <div className="mt-8 p-6 bg-gradient-to-br from-gold/10 to-maroon/10 rounded-xl border-2 border-gold/30">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="w-5 h-5 text-gold" />
                  <h3 className="font-bold text-lg">Calculated Price</h3>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Final Amount (including 3% GST)</p>
                  <p className="text-5xl font-bold gold-text" data-testid="final-price">₹{result.final_price.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500 mt-4">Gold Rate Used: ₹{result.gold_rate_used}/g ({result.purity.toUpperCase()})</p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">Calculation Formula:</p>
                  <p className="text-xs">(((Weight + Wastage%) × Gold Rate) + Stone Charges + Making Charges) + 3% GST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
