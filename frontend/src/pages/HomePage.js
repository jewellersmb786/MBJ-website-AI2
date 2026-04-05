import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI, productsAPI } from '../api';
import { Calculator, Sparkles, Award, Shield, ArrowRight, ChevronDown } from 'lucide-react';

// Hero background images
const HERO_IMAGE = 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/ui57govy_Lucid_Realism_Take_reference_from_the_images_which_I_have_shar_0.jpg';
const PARALLAX_IMAGE = 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/p6odm8yi_bridal%203.jpg';
const CTA_IMAGE = 'https://images.unsplash.com/photo-1723879580148-517048db5bd9';

const SPECIALTY_ITEMS = [
  {
    name: 'Necklaces',
    image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/ljp2cik2_Lucid_Realism_artistic_portrait_photography_of_Take_reference__1.jpg',
    desc: 'Handcrafted Nakshi & Antique necklaces',
  },
  {
    name: 'Haaram',
    image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/9dnccvp8_Lucid_Realism_Take_reference_from_the_images_which_I_have_shar_1.jpg',
    desc: 'Traditional long gold haaram designs',
  },
  {
    name: 'Bridal Sets',
    image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/ok2l7fm8_Lucid_Realism_artistic_portrait_photography_of_Take_reference__2.jpg',
    desc: 'Complete bridal jewellery collections',
  },
  {
    name: 'Jhumkas',
    image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/bujmhehh_bridal2.jpg',
    desc: 'Statement Nakshi & Antique jhumkas',
  },
];

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ featured_only: true, limit: 6 }),
      ]);
      setCategories(catRes.data.slice(0, 4));
      setFeaturedProducts(prodRes.data);
    } catch (e) {}
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>

      {/* ══════════════════════════════════
          HERO SECTION
          Full screen, background image,
          text only — NO logo, NO rates
      ══════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src={HERO_IMAGE}
            alt="MBJ Jewellers"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 50%, rgba(15,15,15,1) 100%)' }} />
        </div>

        {/* Hero text content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: '800px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.7)', marginBottom: '24px' }}>
            Mysore, Karnataka
          </p>
          <h1 style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', lineHeight: 1.15, marginBottom: '20px' }}>
            South Indian
            <span style={{ display: 'block', color: '#D4AF37' }}>Nakshi &amp; Antique</span>
            Jewellery
          </h1>
          <p style={{ fontSize: '14px', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', marginBottom: '48px', lineHeight: 1.7 }}>
            Necklaces · Haaram · Bridal Sets · Jhumkas
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/collections"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px',
                border: '1px solid rgba(212,175,55,0.6)',
                color: '#D4AF37',
                textDecoration: 'none',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                background: 'rgba(212,175,55,0.05)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.05)'}
            >
              Explore Collections <ArrowRight size={14} />
            </Link>
            <Link
              to="/calculator"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              <Calculator size={14} /> Gold Calculator
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, animation: 'bounce 2s infinite' }}>
          <ChevronDown size={24} color="rgba(212,175,55,0.5)" />
        </div>
      </section>

      {/* ══════════════════════════════════
          OUR SPECIALITIES
      ══════════════════════════════════ */}
      <section style={{ padding: '100px 0', background: '#0f0f0f' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>
              What We Offer
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>
              Our Specialities
            </h2>
            <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto' }} />
          </div>

          {/* 4 specialty cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {SPECIALTY_ITEMS.map((item, i) => (
              <Link
                key={i}
                to="/collections"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
                >
                  <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)', transition: 'transform 0.5s ease' }}
                    />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontFamily: 'Georgia, serif', color: '#D4AF37', marginBottom: '6px' }}>{item.name}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em' }}>{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View all button */}
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link
              to="/collections"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 32px',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#D4AF37',
                textDecoration: 'none',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              View All Collections <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          PARALLAX QUOTE SECTION
      ══════════════════════════════════ */}
      <section style={{ position: 'relative', height: '60vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={PARALLAX_IMAGE}
          alt="Craftsmanship"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 32px', maxWidth: '700px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '20px', lineHeight: 1.2 }}>
            Crafted with
            <span style={{ display: 'block', color: '#D4AF37' }}>Devotion</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, letterSpacing: '0.05em' }}>
            Every piece tells a story of tradition, artistry and the sacred beauty of South Indian heritage
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════
          WHY CHOOSE US
      ══════════════════════════════════ */}
      <section style={{ padding: '100px 0', background: '#080808' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>
              Our Promise
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>
              The MBJ Difference
            </h2>
            <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px' }}>
            {[
              { icon: <Sparkles size={32} color="#D4AF37" />, title: 'Authentic Nakshi Work', desc: 'Traditional handcrafted Nakshi jewellery with intricate embossed detailing' },
              { icon: <Award size={32} color="#D4AF37" />, title: 'BIS Hallmarked Gold', desc: 'Certified purity and quality on every piece we craft' },
              { icon: <Shield size={32} color="#D4AF37" />, title: 'Transparent Pricing', desc: 'Live gold rates with detailed price breakdown — no hidden charges' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'rgba(212,175,55,0.04)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '15px', color: '#D4AF37', marginBottom: '12px', letterSpacing: '0.05em' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA SECTION
      ══════════════════════════════════ */}
      <section style={{ position: 'relative', padding: '100px 0', overflow: 'hidden' }}>
        <img
          src={CTA_IMAGE}
          alt="Custom Orders"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 32px', maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '16px' }}>
            Made Just for You
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '20px', lineHeight: 1.2 }}>
            Begin Your Journey
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '48px', lineHeight: 1.8 }}>
            Let us help you find or create the perfect piece that tells your unique story
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/custom-order"
              style={{
                padding: '14px 32px',
                border: '1px solid rgba(212,175,55,0.6)',
                color: '#D4AF37',
                textDecoration: 'none',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                background: 'rgba(212,175,55,0.05)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.05)'}
            >
              Custom Orders
            </Link>
            <Link
              to="/contact"
              style={{
                padding: '14px 32px',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
