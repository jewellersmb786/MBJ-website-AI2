import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { settingsAPI, categoriesAPI } from '../api';
import { ArrowRight, Calculator, Sparkles, Award, Shield, ChevronDown } from 'lucide-react';

const FALLBACK_HERO = 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/ui57govy_Lucid_Realism_Take_reference_from_the_images_which_I_have_shar_0.jpg';
const PARALLAX_IMAGE = 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/p6odm8yi_bridal%203.jpg';
const CTA_IMAGE = 'https://images.unsplash.com/photo-1723879580148-517048db5bd9';

const SPECIALITIES = [
  { name: 'Necklaces', category_match: 'Necklaces', image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/ljp2cik2_Lucid_Realism_artistic_portrait_photography_of_Take_reference__1.jpg', desc: 'Handcrafted Nakshi & Antique necklaces' },
  { name: 'Haaram', category_match: 'Haram', image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/9dnccvp8_Lucid_Realism_Take_reference_from_the_images_which_I_have_shar_1.jpg', desc: 'Traditional long gold haaram designs' },
  { name: 'Bridal Sets', category_match: 'Bridal Collections', image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/ok2l7fm8_Lucid_Realism_artistic_portrait_photography_of_Take_reference__2.jpg', desc: 'Complete bridal jewellery collections' },
  { name: 'Jhumkas', category_match: 'Earrings', image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/bujmhehh_bridal2.jpg', desc: 'Statement Nakshi & Antique jhumkas' },
];

const SECTIONS = [
  { title: 'Our Collections', desc: 'Explore our full range of handcrafted Nakshi and Antique jewellery — from everyday elegance to grand bridal sets.', link: '/collections', cta: 'Explore Collections', image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/19hqhtrt_jewellery.jpg' },
  { title: 'Gold Calculator', desc: 'Calculate the exact price of your jewellery based on live gold rates, weight, making charges and GST — fully transparent.', link: '/calculator', cta: 'Calculate Now', image: 'https://images.unsplash.com/photo-1601121141122-e62a764f15c9' },
  { title: 'Custom Orders', desc: 'Have a design in mind? Share your idea and we will craft it exclusively for you with the finest artistry.', link: '/custom-order', cta: 'Place Custom Order', image: 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/rgx9hhjy_jewellery2.jpg' },
  { title: 'Our Schemes', desc: 'Join our jewellery savings schemes and make your dream purchase affordable. Flexible plans designed for you.', link: '/schemes', cta: 'View Schemes', image: 'https://images.unsplash.com/photo-1767096612165-b5a33caa48a5' },
];

const sectionHeaderStyle = {
  textAlign: 'center',
  marginBottom: '56px',
};

const HomePage = () => {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    settingsAPI.getPublic().then(r => setSettings(r.data)).catch(() => {});
    categoriesAPI.getAll().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const heroImage = settings?.hero_image_url || FALLBACK_HERO;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>

      {/* ══════════════════════
          HERO — image only
      ══════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <img
          src={heroImage}
          alt="MBJ Jewellers"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #0f0f0f 100%)' }} />
        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', animation: 'bounce 2s infinite' }}>
          <ChevronDown size={24} color="rgba(212,175,55,0.5)" />
        </div>
      </section>

      {/* ══════════════════════
          OUR SPECIALITIES
      ══════════════════════ */}
      <section style={{ padding: '100px 0', background: '#0f0f0f' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={sectionHeaderStyle}>
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>What We Offer</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>Our Specialities</h2>
            <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {SPECIALITIES.map((item, i) => {
              const matched = categories.find(c => c.name.toLowerCase() === item.category_match.toLowerCase());
              const to = matched ? `/collections?category=${matched.id}` : '/collections';
              return (
              <Link key={i} to={to} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
                >
                  <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                    <img src={item.image} alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)', transition: 'transform 0.5s ease' }}
                    />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
                    <h3 style={{ fontSize: '17px', fontFamily: 'Georgia, serif', color: '#D4AF37', marginBottom: '4px' }}>{item.name}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{item.desc}</p>
                  </div>
                </div>
              </Link>
              ); })}

          </div>
        </div>
      </section>

      {/* ══════════════════════
          PAGE SECTIONS
      ══════════════════════ */}
      {SECTIONS.map((sec, i) => (
        <section key={i} style={{ padding: '80px 0', background: i % 2 === 0 ? '#080808' : '#0f0f0f' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr', gap: '64px', alignItems: 'center' }}>
              {/* Text side */}
              <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '14px' }}>MBJ Jewellers</p>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '20px', lineHeight: 1.2 }}>{sec.title}</h2>
                <div style={{ width: '32px', height: '1px', background: '#D4AF37', marginBottom: '20px' }} />
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', marginBottom: '32px' }}>{sec.desc}</p>
                <Link to={sec.link}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', border: '1px solid rgba(212,175,55,0.5)', color: '#D4AF37', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s', background: 'rgba(212,175,55,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.04)'}
                >
                  {sec.cta} <ArrowRight size={13} />
                </Link>
              </div>
              {/* Image side */}
              <div style={{ order: i % 2 === 0 ? 2 : 1, overflow: 'hidden' }}
                onMouseEnter={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
              >
                <img src={sec.image} alt={sec.title}
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'brightness(0.8)', transition: 'transform 0.5s ease', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ══════════════════════
          PARALLAX QUOTE
      ══════════════════════ */}
      <section style={{ position: 'relative', height: '55vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={PARALLAX_IMAGE} alt="Craftsmanship"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 32px', maxWidth: '600px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px', lineHeight: 1.2 }}>
            Crafted with <span style={{ color: '#D4AF37' }}>Devotion</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
            Every piece tells a story of tradition, artistry and the sacred beauty of South Indian heritage
          </p>
        </div>
      </section>

      {/* ══════════════════════
          THE MBJ DIFFERENCE
      ══════════════════════ */}
      <section style={{ padding: '100px 0', background: '#080808' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={sectionHeaderStyle}>
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>Our Promise</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>The MBJ Difference</h2>
            <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px' }}>
            {[
              { icon: <Sparkles size={30} color="#D4AF37" />, title: 'Authentic Nakshi Work', desc: 'Traditional handcrafted Nakshi jewellery with intricate embossed detailing' },
              { icon: <Award size={30} color="#D4AF37" />, title: 'BIS Hallmarked Gold', desc: 'Certified purity and quality on every piece we craft' },
              { icon: <Shield size={30} color="#D4AF37" />, title: 'Transparent Pricing', desc: 'Live gold rates with detailed price breakdown — no hidden charges' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '68px', height: '68px', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: 'rgba(212,175,55,0.04)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '15px', color: '#D4AF37', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════
          CTA
      ══════════════════════ */}
      <section style={{ position: 'relative', padding: '100px 0', overflow: 'hidden' }}>
        <img src={CTA_IMAGE} alt="Custom Orders"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.22)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 32px', maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '14px' }}>Made Just for You</p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px', lineHeight: 1.2 }}>Begin Your Journey</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px', lineHeight: 1.8 }}>Let us help you find or create the perfect piece that tells your unique story</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/custom-order"
              style={{ padding: '13px 30px', border: '1px solid rgba(212,175,55,0.6)', color: '#D4AF37', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(212,175,55,0.05)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.05)'}
            >Custom Orders</Link>
            <Link to="/contact"
              style={{ padding: '13px 30px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >Contact Us</Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        @media (max-width: 768px) {
          section > div > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
