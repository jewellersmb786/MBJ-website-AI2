import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoriesAPI, productsAPI, goldAPI } from '../api';
import { Calculator, Sparkles, Award, Shield, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [goldRates, setGoldRates] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes, goldRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ featured_only: true, limit: 6 }),
        goldAPI.getRates()
      ]);
      setCategories(categoriesRes.data.slice(0, 6));
      setFeaturedProducts(productsRes.data);
      setGoldRates(goldRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-maroon-dark via-maroon to-maroon-light">
        <div className="absolute inset-0 pattern-bg opacity-20"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6"
          >
            <Sparkles className="w-16 h-16 mx-auto text-gold-light" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-6">
            Exquisite South Indian
            <span className="block gold-text mt-2">Nakshi & Antique Jewellery</span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 font-cormorant">
            Crafting Bridal Dreams with Traditional Elegance
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/collections"
              className="bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 inline-flex items-center justify-center space-x-2"
              data-testid="explore-collections-button"
            >
              <span>Explore Collections</span>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/custom-order"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
              data-testid="custom-order-button"
            >
              Design Your Dream Jewellery
            </Link>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gold-light rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gold rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </section>

      {/* Live Gold Rate Calculator Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gold/10 to-maroon/10 rounded-3xl p-8 border border-gold/20">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Calculator className="w-8 h-8 text-gold" />
                <h2 className="text-3xl font-playfair font-bold text-center">Live Gold Rate Calculator</h2>
              </div>
              
              {goldRates && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">24 Karat</p>
                    <p className="text-2xl font-bold text-gold">₹{goldRates.k24_rate}</p>
                    <p className="text-xs text-gray-500">per gram</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">22 Karat</p>
                    <p className="text-2xl font-bold text-gold">₹{goldRates.k22_rate}</p>
                    <p className="text-xs text-gray-500">per gram</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">18 Karat</p>
                    <p className="text-2xl font-bold text-gold">₹{goldRates.k18_rate}</p>
                    <p className="text-xs text-gray-500">per gram</p>
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <Link
                  to="/calculator"
                  className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-full font-semibold transition-all"
                  data-testid="calculate-price-button"
                >
                  <Calculator size={20} />
                  <span>Calculate Your Jewellery Price</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-playfair font-bold mb-4">Our Specialties</h2>
            <p className="text-gray-600 dark:text-gray-400">Handcrafted with Traditional Excellence</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/collections?category=${category.id}`}
                  className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="aspect-square bg-gradient-to-br from-gold/20 to-maroon/20 flex items-center justify-center">
                    {category.display_image ? (
                      <img
                        src={category.display_image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-6xl font-playfair font-bold gold-text">
                        {category.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-playfair font-bold mb-2 group-hover:text-gold transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Explore Collection →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/collections"
              className="inline-flex items-center space-x-2 text-gold font-semibold hover:text-gold-dark transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-playfair font-bold text-center mb-12">Why Choose Jewellers MB</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">Authentic Nakshi Work</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Traditional handcrafted Nakshi jewellery with intricate detailing
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                BIS Hallmarked gold ensuring purity and quality standards
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">Transparent Pricing</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Live gold rates with detailed price breakdown calculator
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-maroon via-maroon-dark to-maroon">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-playfair font-bold text-white mb-6">
            Ready to Create Your Dream Jewellery?
          </h2>
          <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
            Contact us for custom orders, bridal consultations, or to explore our exclusive collections
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/custom-order"
              className="bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            >
              Start Custom Order
            </Link>
            <Link
              to="/contact"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
