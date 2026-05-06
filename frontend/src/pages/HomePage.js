import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { settingsAPI, categoriesAPI, testimonialsAPI, festivalBannersAPI } from '../api';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK_HERO = 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/ui57govy_Lucid_Realism_Take_reference_from_the_images_which_I_have_shar_0.jpg';
const FALLBACK_PARALLAX = 'https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/p6odm8yi_bridal%203.jpg';
const FALLBACK_CTA = 'https://images.unsplash.com/photo-1723879580148-517048db5bd9';

const DynamicIcon = ({ name, size = 30, color = '#D4AF37' }) => {
  try {
    const Icon = LucideIcons[name];
    if (Icon) return <Icon size={size} color={color} />;
  } catch {}
  return <LucideIcons.Star size={size} color={color} />;
};


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

const Stars = ({ rating }) => (
  <span style={{ letterSpacing: '-1px', fontSize: '16px' }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= rating ? '#D4AF37' : 'rgba(255,255,255,0.15)' }}>★</span>)}
  </span>
);

const HomePage = () => {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [festivalBanner, setFestivalBanner] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  useEffect(() => {
    settingsAPI.getPublic().then(r => setSettings(r.data)).catch(() => {});
    categoriesAPI.getAll().then(r => setCategories(r.data)).catch(() => {});
    testimonialsAPI.getFeatured().then(r => setTestimonials(r.data || [])).catch(() => {});
    festivalBannersAPI.getActive().then(r => {
      const b = r.data;
      if (b) {
        const dismissed = sessionStorage.getItem(`festival_banner_dismissed_${b.id}`);
        setFestivalBanner(b);
        setBannerDismissed(Boolean(dismissed));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  const visibleCount = windowWidth >= 768 ? 3 : 1;

  useEffect(() => {
    if (testimonials.length <= visibleCount) return;
    const timer = setInterval(() => setCarouselIndex(i => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, [testimonials.length, visibleCount]);

  const prevSlide = () => setCarouselIndex(i => (i - 1 + testimonials.length) % testimonials.length);
  const nextSlide = () => setCarouselIndex(i => (i + 1) % testimonials.length);

  const handleDismissBanner = () => {
    if (festivalBanner) sessionStorage.setItem(`festival_banner_dismissed_${festivalBanner.id}`, '1');
    setBannerDismissed(true);
  };

  const getDisplayedTestimonials = () => {
    if (!testimonials.length) return [];
    const count = Math.min(visibleCount, testimonials.length);
    return Array.from({ length: count }, (_, i) => testimonials[(carouselIndex + i) % testimonials.length]);
  };

  const heroImage = settings?.hero_image_url || FALLBACK_HERO;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>

      {/* ══════════════════════
          FESTIVAL BANNER
      ══════════════════════ */}
      {festivalBanner && !bannerDismissed && (
        <div style={{ position: 'relative', width: '100%', zIndex: 5, lineHeight: 0 }}>
          {festivalBanner.click_link ? (
            <a href={festivalBanner.click_link} style={{ display: 'block' }}>
              <img src={festivalBanner.image} alt={festivalBanner.title || 'Promo'} className="festival-desktop-img" style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'cover' }} />
              {festivalBanner.image_mobile && <img src={festivalBanner.image_mobile} alt={festivalBanner.title || 'Promo'} className="festival-mobile-img" style={{ width: '100%', display: 'none', objectFit: 'cover' }} />}
            </a>
          ) : (
            <>
              <img src={festivalBanner.image} alt={festivalBanner.title || 'Promo'} className="festival-desktop-img" style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'cover' }} />
              {festivalBanner.image_mobile && <img src={festivalBanner.image_mobile} alt={festivalBanner.title || 'Promo'} className="festival-mobile-img" style={{ width: '100%', display: 'none', objectFit: 'cover' }} />}
            </>
          )}
          <button onClick={handleDismissBanner}
            style={{ position: 'absolute', top: '10px', right: '12px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', lineHeight: 1 }}>
            ✕
          </button>
        </div>
      )}

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
            {(() => {
              const ids = settings?.featured_category_ids || [];
              let featured = ids.map(id => categories.find(c => c.id === id)).filter(Boolean).slice(0, 4);
              if (featured.length === 0) {
                featured = categories.filter(c => c.display_image).slice(0, 4);
              }
              return featured.map((cat, i) => (
                <Link key={cat.id} to={`/collections?category=${cat.id}`} style={{ textDecoration: 'none', display: 'block' }} className="spec-tile">
                  <div style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                    <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                      {cat.display_image ? (
                        <img
                          className="spec-img"
                          src={cat.display_image}
                          alt={cat.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)', transition: 'transform 0.5s ease', display: 'block' }}
                        />
                      ) : (
                        <div
                          className="spec-img"
                          style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(61,8,21,0.3) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.5s ease' }}
                        >
                          <span style={{ fontFamily: 'Georgia, serif', fontSize: '56px', color: 'rgba(212,175,55,0.25)' }}>{cat.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
                      <h3 style={{ fontSize: '17px', fontFamily: 'Georgia, serif', color: '#D4AF37', margin: 0 }}>{cat.name}</h3>
                    </div>
                  </div>
                </Link>
              ));
            })()}
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
      {(() => {
        const img = settings?.parallax_quote_image || FALLBACK_PARALLAX;
        const heading = settings?.parallax_quote_heading || 'Crafted with Devotion';
        const subtext = settings?.parallax_quote_subtext || 'Every piece tells a story of tradition, artistry and the sacred beauty of South Indian heritage';
        const parts = heading.split(' ');
        const lastWord = parts.pop();
        return (
          <section style={{ position: 'relative', height: '55vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={img} alt="Craftsmanship"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 32px', maxWidth: '600px' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px', lineHeight: 1.2 }}>
                {parts.join(' ')} <span style={{ color: '#D4AF37' }}>{lastWord}</span>
              </h2>
              {subtext && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>{subtext}</p>}
            </div>
          </section>
        );
      })()}

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
            {(settings?.mbj_difference || [
              { icon: 'Sparkles', title: 'Authentic Nakshi Work', description: 'Traditional handcrafted Nakshi jewellery with intricate embossed detailing' },
              { icon: 'Award', title: 'BIS Hallmarked Gold', description: 'Certified purity and quality on every piece we craft' },
              { icon: 'Shield', title: 'Transparent Pricing', description: 'Live gold rates with detailed price breakdown — no hidden charges' },
            ]).map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '68px', height: '68px', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: 'rgba(212,175,55,0.04)' }}>
                  <DynamicIcon name={item.icon} size={30} color="#D4AF37" />
                </div>
                <h3 style={{ fontSize: '15px', color: '#D4AF37', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{item.description || item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════
          CTA
      ══════════════════════ */}
      {(() => {
        const ctaImg = settings?.cta_banner_image || FALLBACK_CTA;
        const ctaHeading = settings?.cta_banner_heading || 'Begin Your Journey';
        const ctaSubtext = settings?.cta_banner_subtext || 'Let us help you find or create the perfect piece that tells your unique story';
        const ctaBtnText = settings?.cta_banner_button_text || 'Explore Collections';
        const ctaBtnLink = settings?.cta_banner_button_link || '/collections';
        return (
          <section style={{ position: 'relative', padding: '100px 0', overflow: 'hidden' }}>
            <img src={ctaImg} alt="CTA"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.22)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 32px', maxWidth: '600px', margin: '0 auto' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '14px' }}>Made Just for You</p>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px', lineHeight: 1.2 }}>{ctaHeading}</h2>
              {ctaSubtext && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px', lineHeight: 1.8 }}>{ctaSubtext}</p>}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to={ctaBtnLink}
                  style={{ padding: '13px 30px', border: '1px solid rgba(212,175,55,0.6)', color: '#D4AF37', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(212,175,55,0.05)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.05)'}
                >{ctaBtnText}</Link>
                <Link to="/contact"
                  style={{ padding: '13px 30px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >Contact Us</Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ══════════════════════
          TESTIMONIALS CAROUSEL
      ══════════════════════ */}
      {testimonials.length > 0 && (
        <section style={{ padding: '100px 0', background: '#080808' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
            <div style={sectionHeaderStyle}>
              <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>Our Customers</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>What our customers say</h2>
              <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto' }} />
            </div>

            {/* Carousel */}
            <div style={{ position: 'relative' }}
              onTouchStart={e => { touchStart.current = e.targetTouches[0].clientX; }}
              onTouchMove={e => { touchEnd.current = e.targetTouches[0].clientX; }}
              onTouchEnd={() => {
                if (touchStart.current === null || touchEnd.current === null) return;
                const diff = touchStart.current - touchEnd.current;
                if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
                touchStart.current = null; touchEnd.current = null;
              }}
            >
              {testimonials.length > visibleCount && (
                <>
                  <button onClick={prevSlide} style={{ position: 'absolute', left: '-18px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextSlide} style={{ position: 'absolute', right: '-18px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(visibleCount, testimonials.length)}, 1fr)`, gap: '20px' }}>
                {getDisplayedTestimonials().map((t, i) => (
                  <div key={`${t.id}-${i}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {t.customer_photo ? (
                        <img src={t.customer_photo} alt={t.customer_name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,175,55,0.3)', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '2px solid rgba(212,175,55,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#D4AF37' }}>{t.customer_name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: '14px', color: '#fff', fontWeight: 600, margin: '0 0 3px' }}>{t.customer_name}</p>
                        <Stars rating={t.rating} />
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0, flex: 1 }}>
                      {t.review_text.length > 150 ? t.review_text.slice(0, 150) + '…' : t.review_text}
                    </p>
                    {t.product_image && (
                      <img src={t.product_image} alt="Item" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Dots */}
              {testimonials.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '24px' }}>
                  {testimonials.map((_, i) => (
                    <button key={i} onClick={() => setCarouselIndex(i)}
                      style={{ width: i === carouselIndex ? '20px' : '6px', height: '6px', borderRadius: '3px', border: 'none', background: i === carouselIndex ? '#D4AF37' : 'rgba(212,175,55,0.25)', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Google rating + share link row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '32px', flexWrap: 'wrap' }}>
              {settings?.google_review_rating && (
                <a href={settings.google_maps_review_url || '#'} target={settings.google_maps_review_url ? '_blank' : '_self'} rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '13px', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <span style={{ color: '#D4AF37', fontSize: '15px' }}>★</span>
                  <span style={{ fontWeight: 600 }}>{settings.google_review_rating}</span>
                  {settings.google_review_count && <span style={{ color: 'rgba(255,255,255,0.4)' }}>({settings.google_review_count} reviews)</span>}
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>on Google</span>
                </a>
              )}
              <Link to="/share-review"
                style={{ fontSize: '13px', color: 'rgba(212,175,55,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,0.7)'}
              >
                Share your experience →
              </Link>
            </div>
          </div>
        </section>
      )}

      <style>{`
        .spec-tile:hover .spec-img { transform: scale(1.06); }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        @media (max-width: 640px) {
          .festival-desktop-img { display: none !important; }
          .festival-mobile-img { display: block !important; }
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
