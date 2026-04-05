import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { goldAPI, settingsAPI } from '../api';
import { Phone, Menu, X, Mail, MessageCircle } from 'lucide-react';
import CustomCursor from './CustomCursor';

const LOGO_URL = 'https://i.ibb.co/DHmMcnm9/openart-image-rw2-Sfjg-1736872346359-raw-removebg-preview-1.png';

const Layout = () => {
  const [goldRates, setGoldRates] = useState(null);
  const [settings, setSettings] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    fetchGoldRates();
    fetchSettings();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 100);
      // Hide on scroll down, show on scroll up
      if (currentY > lastScrollY.current && currentY > 150) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchGoldRates = async () => {
    try {
      const res = await goldAPI.getRates();
      setGoldRates(res.data);
    } catch (e) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.getPublic();
      setSettings(res.data);
    } catch (e) {}
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/collections', label: 'Collections' },
    { to: '/calculator', label: 'Gold Calculator' },
    { to: '/custom-order', label: 'Custom Orders' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <CustomCursor />

      {/* ════════════════════════════════════
          HEADER
      ════════════════════════════════════ */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.35s ease, background 0.35s ease, box-shadow 0.35s ease',
          background: scrolled ? 'rgba(8,8,8,0.97)' : 'transparent',
          boxShadow: scrolled ? '0 1px 0 rgba(212,175,55,0.12)' : 'none',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >

        {/* ── UTILITY BAR (gold rates + contact) ── */}
        <div
          style={{
            maxHeight: scrolled ? '0' : '36px',
            overflow: 'hidden',
            transition: 'max-height 0.35s ease',
            borderBottom: scrolled ? 'none' : '1px solid rgba(212,175,55,0.08)',
          }}
        >
          <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-9">
            {/* Gold rates */}
            <div className="flex items-center gap-5 text-[10px] tracking-widest uppercase text-[#D4AF37]/55">
              {goldRates ? (
                <>
                  <span>24K &nbsp;₹{Number(goldRates.k24_rate).toLocaleString('en-IN')}/g</span>
                  <span className="text-white/15">|</span>
                  <span>22K &nbsp;₹{Number(goldRates.k22_rate).toLocaleString('en-IN')}/g</span>
                  <span className="text-white/15">|</span>
                  <span>18K &nbsp;₹{Number(goldRates.k18_rate).toLocaleString('en-IN')}/g</span>
                  {goldRates.last_updated && (
                    <>
                      <span className="text-white/15">|</span>
                      <span className="text-white/25">as of {formatDate(goldRates.last_updated)}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-white/20">Loading gold rates...</span>
              )}
            </div>
            {/* Right side */}
            <div className="flex items-center gap-5 text-[10px] tracking-widest uppercase text-white/35">
              <a
                href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi!`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] transition-colors duration-200 flex items-center gap-1.5"
              >
                <MessageCircle size={10} />
                WhatsApp
              </a>
              <span className="text-white/15">|</span>
              <a
                href={`tel:${settings?.phone}`}
                className="hover:text-[#D4AF37] transition-colors duration-200 flex items-center gap-1.5"
              >
                <Phone size={10} />
                {settings?.phone || '+91 7019539776'}
              </a>
            </div>
          </div>
        </div>

        {/* ── MAIN NAV ── */}
        <div className="max-w-7xl mx-auto px-8">

          {/* HOMEPAGE HERO STATE — logo centered, links below */}
          {isHomePage && !scrolled && (
            <div className="flex flex-col items-center py-6">
              <Link to="/">
                <img
                  src={LOGO_URL}
                  alt="MBJ Jewellers"
                  style={{ height: '110px', width: 'auto', objectFit: 'contain' }}
                />
              </Link>
              <nav className="hidden lg:flex items-center gap-9 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      color: isActive(link.to) ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      paddingBottom: '2px',
                      borderBottom: isActive(link.to) ? '1px solid #D4AF37' : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive(link.to)) e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { if (!isActive(link.to)) e.target.style.color = 'rgba(255,255,255,0.7)'; }}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => setShowContactModal(true)}
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#D4AF37',
                    border: '1px solid rgba(212,175,55,0.45)',
                    background: 'transparent',
                    padding: '6px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Get in Touch
                </button>
              </nav>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden absolute right-8 top-8 text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}

          {/* SCROLLED STATE (homepage) or ALL OTHER PAGES — logo left, links right */}
          {(!isHomePage || scrolled) && (
            <div className="flex items-center justify-between py-3">
              {/* Logo icon only — left */}
              <Link to="/" style={{ flexShrink: 0 }}>
                <img
                  src={LOGO_URL}
                  alt="MBJ Jewellers"
                  style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
                />
              </Link>

              {/* Nav links — right */}
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      color: isActive(link.to) ? '#D4AF37' : 'rgba(255,255,255,0.65)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      paddingBottom: '2px',
                      borderBottom: isActive(link.to) ? '1px solid #D4AF37' : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive(link.to)) e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { if (!isActive(link.to)) e.target.style.color = 'rgba(255,255,255,0.65)'; }}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => setShowContactModal(true)}
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#D4AF37',
                    border: '1px solid rgba(212,175,55,0.45)',
                    background: 'transparent',
                    padding: '5px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Get in Touch
                </button>
              </nav>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ════════════════════════════════════
          MOBILE MENU
      ════════════════════════════════════ */}
      {mobileMenuOpen && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 40,
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: '280px',
              background: '#080808',
              borderLeft: '1px solid rgba(212,175,55,0.12)',
              zIndex: 45,
              padding: '80px 32px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <img src={LOGO_URL} alt="MBJ" style={{ height: '60px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }} />
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isActive(link.to) ? '#D4AF37' : 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setMobileMenuOpen(false); setShowContactModal(true); }}
              style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#D4AF37',
                border: '1px solid rgba(212,175,55,0.4)',
                background: 'transparent',
                padding: '10px 20px',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Get in Touch
            </button>
          </div>
        </>
      )}

      {/* ════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════ */}
      <main style={{ paddingTop: isHomePage ? '0' : '72px' }}>
        <Outlet />
      </main>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer style={{ background: '#080808', borderTop: '1px solid rgba(212,175,55,0.1)', marginTop: '80px' }}>
        <div className="max-w-7xl mx-auto px-8 py-16">

          {/* Logo + tagline */}
          <div className="flex flex-col items-center mb-14">
            <img src={LOGO_URL} alt="MBJ Jewellers" style={{ height: '80px', width: 'auto', objectFit: 'contain', marginBottom: '16px', opacity: 0.85 }} />
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.45)', textAlign: 'center' }}>
              Nakshi &amp; Antique Jewellery · Mysore, Karnataka
            </p>
          </div>

          {/* Three columns — uniform alignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

            {/* Col 1: About */}
            <div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '16px' }}>
                About Us
              </h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.8' }}>
                Specialists in South Indian Nakshi &amp; Antique jewellery —
                Necklaces, Harams, Jhumkas and Bridal Sets, crafted with
                timeless artistry in Mysore, Karnataka.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '16px' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {navLinks.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#D4AF37'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.38)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '16px' }}>
                Contact Us
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {settings?.phone && (
                  <li>
                    <a href={`tel:${settings.phone}`} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
                    >
                      <Phone size={12} /> {settings.phone}
                    </a>
                  </li>
                )}
                {settings?.email && (
                  <li>
                    <a href={`mailto:${settings.email}`} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
                    >
                      <Mail size={12} /> {settings.email}
                    </a>
                  </li>
                )}
                {settings?.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=Hi!`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
                    >
                      <MessageCircle size={12} /> WhatsApp Us
                    </a>
                  </li>
                )}
                {settings?.instagram && (
                  <li>
                    <a
                      href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
                    >
                      {settings.instagram}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(212,175,55,0.08)', paddingTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
              © {new Date().getFullYear()} MBJ Jewellers · Mysore · All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════
          CONTACT MODAL
      ════════════════════════════════════ */}
      {showContactModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setShowContactModal(false)}
        >
          <div
            style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.22)', padding: '40px', maxWidth: '420px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <img src={LOGO_URL} alt="MBJ" style={{ height: '60px', width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', textAlign: 'center', marginBottom: '24px' }}>
              Get in Touch
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi!`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', border: '1px solid rgba(34,197,94,0.2)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)'}
              >
                <div style={{ width: '38px', height: '38px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageCircle size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#fff', letterSpacing: '0.1em' }}>WhatsApp</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>{settings?.whatsapp || '+91 7019539776'}</div>
                </div>
              </a>
              <a
                href={`mailto:${settings?.email || 'jewellersmb786@gmail.com'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', border: '1px solid rgba(212,175,55,0.2)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'}
              >
                <div style={{ width: '38px', height: '38px', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} color="black" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#fff', letterSpacing: '0.1em' }}>Email</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>{settings?.email || 'jewellersmb786@gmail.com'}</div>
                </div>
              </a>
              <a
                href={`tel:${settings?.phone || '+917019539776'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', border: '1px solid rgba(59,130,246,0.2)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'}
              >
                <div style={{ width: '38px', height: '38px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#fff', letterSpacing: '0.1em' }}>Call Us</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>{settings?.phone || '+91 7019539776'}</div>
                </div>
              </a>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              style={{ marginTop: '20px', width: '100%', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          FLOATING WHATSAPP
      ════════════════════════════════════ */}
      <a
        href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi! I'm interested in your jewellery.`}
        target="_blank" rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 40,
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          textDecoration: 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,197,94,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.35)'; }}
      >
        <MessageCircle size={24} color="white" />
      </a>
    </div>
  );
};

export default Layout;
