import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { categoriesAPI, productsAPI } from '../api';
import { Calculator, Sparkles, Award, Shield, ArrowRight, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// User uploaded images
const BRIDAL_IMAGES = [
  'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/p6odm8yi_bridal%203.jpg',
  'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/n3t9l1kh_Bridal.jpg',
  'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/bujmhehh_bridal2.jpg',
  'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/19hqhtrt_jewellery.jpg',
  'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/rgx9hhjy_jewellery2.jpg',
];

// Additional curated images
const JEWELLERY_IMAGES = [
  'https://images.unsplash.com/photo-1723879580148-517048db5bd9',
  'https://images.unsplash.com/photo-1767096612165-b5a33caa48a5',
  'https://images.unsplash.com/photo-1601121141122-e62a764f15c9',
  'https://images.unsplash.com/photo-1653227907864-560dce4c252d',
  'https://images.unsplash.com/photo-1758995115560-59c10d6cc28f',
  'https://images.unsplash.com/photo-1758995115475-7b7d6eb060ba',
  'https://images.unsplash.com/photo-1769857879388-df93b4c96bca',
];

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const heroRef = useRef(null);
  const parallaxRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    fetchData();
    
    // GSAP Scroll Animations
    gsap.fromTo('.fade-in-up', 
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.fade-in-up',
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none none',
        }
      }
    );

    // Parallax scroll effect
    if (parallaxRef.current) {
      gsap.to(parallaxRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ featured_only: true, limit: 6 })
      ]);
      setCategories(categoriesRes.data.slice(0, 3));
      setFeaturedProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* CINEMATIC HERO SECTION */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Parallax Image */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black z-10"></div>
          <img
            src={BRIDAL_IMAGES[0]}
            alt="Nakshi Antique Jewellery"
            className="w-full h-full object-cover zoom-image"
            style={{ filter: 'brightness(0.7)' }}
          />
        </motion.div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black z-20"></div>

        {/* Gold Particles Effect */}
        <div className="absolute inset-0 z-10">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-30 text-center px-4 max-w-5xl mx-auto"
          style={{ opacity }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: 'spring' }}
            className="mb-8"
          >
            <Sparkles className="w-20 h-20 mx-auto text-gold" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-6xl md:text-8xl font-playfair font-bold text-white mb-6 text-glow"
          >
            Timeless
            <span className="block gold-text mt-2">Nakshi Elegance</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 font-cormorant tracking-wide"
          >
            Where Heritage Meets Luxury in Every Intricate Detail
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              to="/collections"
              className="glass-gold px-10 py-5 rounded-full font-semibold text-gold hover-glow inline-flex items-center justify-center space-x-3 group"
              data-testid="explore-collections-button"
            >
              <span>Explore Collections</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/calculator"
              className="glass px-10 py-5 rounded-full font-semibold text-white hover-glow inline-flex items-center justify-center space-x-3"
              data-testid="calculator-button"
            >
              <Calculator size={20} />
              <span>Calculate Price</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-gold" />
        </motion.div>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section className="relative py-32 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-playfair font-bold gold-text mb-4">
              Our Specialties
            </h2>
            <p className="text-gray-400 text-lg">Handcrafted South Indian Masterpieces</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Nakshi Jewellery', image: BRIDAL_IMAGES[1], desc: 'Intricate embossed artistry' },
              { name: 'Antique Collections', image: BRIDAL_IMAGES[3], desc: 'Timeless heritage pieces' },
              { name: 'Bridal Sets', image: BRIDAL_IMAGES[2], desc: 'Complete wedding elegance' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="fade-in-up group"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Link to="/collections" className="block">
                  <div className="relative overflow-hidden rounded-2xl glass hover-glow transition-all duration-500">
                    <div className="aspect-[3/4] overflow-hidden zoom-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover zoom-image transition-transform duration-700 group-hover:scale-110"
                        style={{ filter: 'brightness(0.8)' }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-2xl font-playfair font-bold text-gold mb-2">{item.name}</h3>
                      <p className="text-gray-300 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PARALLAX SHOWCASE */}
      <section className="relative h-screen overflow-hidden">
        <div ref={parallaxRef} className="absolute inset-0">
          <img
            src={BRIDAL_IMAGES[4]}
            alt="Exquisite Craftsmanship"
            className="w-full h-full object-cover zoom-image"
            style={{ filter: 'brightness(0.6)' }}
          />
        </div>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center px-4"
          >
            <h2 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-6 text-glow">
              Crafted with
              <span className="block gold-text mt-2">Devotion</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Every piece tells a story of tradition, artistry, and the sacred beauty of South Indian heritage
            </p>
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative py-32 bg-gradient-to-b from-black via-maroon-dark/20 to-black">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-playfair font-bold text-center gold-text mb-20"
          >
            The Jewellers MB Promise
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Sparkles className="w-12 h-12" />,
                title: 'Authentic Nakshi Work',
                desc: 'Traditional handcrafted Nakshi jewellery with intricate embossed detailing'
              },
              {
                icon: <Award className="w-12 h-12" />,
                title: 'Premium Quality',
                desc: 'BIS Hallmarked gold ensuring purity and quality standards'
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: 'Transparent Pricing',
                desc: 'Live gold rates with detailed price breakdown calculator'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="fade-in-up text-center"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="glass-gold w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gold hover-glow">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={JEWELLERY_IMAGES[0]}
            alt="Contact Us"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.3)' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-maroon/80 to-black/80"></div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-playfair font-bold text-white mb-6 text-glow">
              Begin Your Journey
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Let us help you find or create the perfect piece that tells your unique story
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/custom-order"
                className="glass-gold px-10 py-5 rounded-full font-semibold text-gold hover-glow"
              >
                Custom Orders
              </Link>
              <Link
                to="/contact"
                className="glass px-10 py-5 rounded-full font-semibold text-white hover-glow"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
