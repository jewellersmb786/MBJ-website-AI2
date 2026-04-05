import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { goldAPI, settingsAPI } from '../api';
import { Phone, Menu, X, Mail, MessageCircle } from 'lucide-react';
import CustomCursor from './CustomCursor';

const LOGO_URL = 'https://i.ibb.co/DHmMcnm9/openart-image-rw2-Sfjg-1736872346359-raw-removebg-preview-1.png';

// Social media SVG icons
const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const YouTubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#000"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
);

const Layout = () => {
  const [settings, setSettings] = useState(null);
  const [goldRates, setGoldRates] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    settingsAPI.getPublic().then(r => setSettings(r.data)).catch(() => {});
    goldAPI.getRates().then(r => setGoldRates(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (p) => location.pathname === p;

  const navLeft = [
    { to: '/', label: 'Home' },
    { to: '/collections', label: 'Collections' },
    { to: '/schemes', label: 'Schemes' },
    { to: '/spiritual', label: 'Spiritual' },
  ];

  const navRight = [
    { to: '/calculator', label: 'Gold Calculator' },
    { to: '/custom-order', label: 'Custom Orders' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  const allLinks = [...navLeft, ...navRight];

  const navLinkStyle = (active) => ({
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: active ? '#D4AF37' : 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    paddingBottom: '2px',
    borderBottom: active ? '1px solid #D4AF37' : '1px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
    whiteSpace: 'nowrap',
  });

  const socialLinks = [
    { key: 'facebook', icon: <FacebookIcon />, label: 'Facebook' },
    { key: 'youtube', icon: <YouTubeIcon />, label: 'YouTube' },
    { key: 'twitter', icon: <TwitterIcon />, label: 'Twitter' },
    { key: 'instagram', icon: <InstagramIcon />, label: 'Instagram' },
  ];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <CustomCursor />

      {/* ════════════════════════════
          HEADER
      ════════════════════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(8,8,8,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(212,175,55,0.12)' : 'none',
        transition: 'background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s',
      }}>

        {/* ── UTILITY BAR ── */}
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          borderBottom: '1px solid rgba(212,175,55,0.08)',
          overflow: 'hidden',
          maxHeight: scrolled ? '0' : '36px',
          transition: 'max-height 0.3s ease',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Gold rates left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)' }}>
              {goldRates ? (
                <>
                  <span>24K ₹{Number(goldRates.k24_rate).toLocaleString('en-IN')}/g</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                  <span>22K ₹{Number(goldRates.k22_rate).toLocaleString('en-IN')}/g</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                  <span>18K ₹{Number(goldRates.k18_rate).toLocaleString('en-IN')}/g</span>
                  {goldRates.last_updated && (
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>| as of {formatDate(goldRates.last_updated)}</span>
                  )}
                </>
              ) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>Loading rates...</span>}
            </div>

            {/* Right — social icons + Get in Touch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Social icons */}
              {socialLinks.map(({ key, icon, label }) => {
                const url = settings?.[key];
                return url ? (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                    title={label}
                    style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', transition: 'color 0.2s', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    {icon}
                  </a>
                ) : (
                  <span key={key} title={`${label} (not set)`}
                    style={{ color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', cursor: 'default' }}
                  >
                    {icon}
                  </span>
                );
              })}
              <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 4px' }}>|</span>
              {/* Get in Touch */}
              <button
                onClick={() => setShowContactModal(true)}
                style={{
                  fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)',
                  background: 'transparent', padding: '4px 14px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN NAV ── */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

          {/* HOMEPAGE HERO STATE — logo center, links split left/right */}
          {isHome && !scrolled && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0' }}>
              {/* Left nav */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', flex: 1 }} className="hidden-mobile">
                {navLeft.map(link => (
                  <Link key={link.to} to={link.to}
                    style={navLinkStyle(isActive(link.to))}
                    onMouseEnter={e => { if (!isActive(link.to)) e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { if (!isActive(link.to)) e.target.style.color = 'rgba(255,255,255,0.7)'; }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Center logo */}
              <Link to="/" style={{ flexShrink: 0, margin: '0 32px', display: 'block' }}>
                <img src={LOGO_URL} alt="MBJ Jewellers"
                  style={{ height: '90px', width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </Link>

              {/* Right nav */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', flex: 1, justifyContent: 'flex-end' }} className="hidden-mobile">
                {navRight.map(link => (
                  <Link key={link.to} to={link.to}
                    style={navLinkStyle(isActive(link.to))}
                    onMouseEnter={e => { if (!isActive(link.to)) e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { if (!isActive(link.to)) e.target.style.color = 'rgba(255,255,255,0.7)'; }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ display: 'none', color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                className="show-mobile"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}

          {/* SCROLLED STATE or INNER PAGES — logo left, all links right */}
          {(!isHome || scrolled) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              {/* Logo icon — left */}
              <Link to="/" style={{ flexShrink: 0 }}>
                <img src={LOGO_URL} alt="MBJ Jewellers"
                  style={{ height: '44px', width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </Link>

              {/* All nav links — right */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="hidden-mobile">
                {allLinks.map(link => (
                  <Link key={link.to} to={link.to}
                    style={{ ...navLinkStyle(isActive(link.to)), fontSize: '10px' }}
                    onMouseEnter={e => { if (!isActive(link.to)) e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { if (!isActive(link.to)) e.target.style.color = 'rgba(255,255,255,0.7)'; }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                className="show-mobile"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 40 }}
            onClick={() => setMobileMenuOpen(false)} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px',
            background: '#0a0a0a', borderLeft: '1px solid rgba(212,175,55,0.15)',
            zIndex: 45, padding: '80px 32px 32px',
            display: 'flex', flexDirection: 'column', gap: '22px',
          }}>
            <img src={LOGO_URL} alt="MBJ" style={{ height: '56px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }} />
            {allLinks.map(link => (
              <Link key={link.to} to={link.to}
                style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: isActive(link.to) ? '#D4AF37' : 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                {link.label}
              </Link>
            ))}
            <button onClick={() => { setMobileMenuOpen(false); setShowContactModal(true); }}
              style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', background: 'transparent', padding: '10px', cursor: 'pointer', marginTop: '8px' }}
            >
              Get in Touch
            </button>
          </div>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ paddingTop: isHome ? '0' : '72px' }}>
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#080808', borderTop: '1px solid rgba(212,175,55,0.1)', marginTop: '80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 32px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px', marginBottom: '48px' }}>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '20px' }}>Contact Us</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {settings?.phone && (
                  <a href={`tel:${settings.phone}`} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    <Phone size={12} /> {settings.phone}
                  </a>
                )}
                {settings?.email && (
                  <a href={`mailto:${settings.email}`} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    <Mail size={12} /> {settings.email}
                  </a>
                )}
                {settings?.whatsapp && (
                  <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=Hi!`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    <MessageCircle size={12} /> WhatsApp Us
                  </a>
                )}
                {/* Social icons in footer */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {socialLinks.map(({ key, icon, label }) => {
                    const url = settings?.[key];
                    return url ? (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer" title={label}
                        style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                      >
                        {icon}
                      </a>
                    ) : (
                      <span key={key} style={{ color: 'rgba(255,255,255,0.15)' }}>{icon}</span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* About Us */}
            <div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '20px' }}>About Us</h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.8' }}>
                {settings?.tagline || 'Specialists in South Indian Nakshi & Antique jewellery — Necklaces, Harams, Jhumkas and Bridal Sets, crafted with timeless artistry.'}
              </p>
            </div>

            {/* Store Location */}
            <div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '20px' }}>Store Location</h4>
              {settings?.store_location ? (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.8' }}>
                  {settings.store_location}
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                  Add store location from admin settings
                </p>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(212,175,55,0.08)', paddingTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
              © {new Date().getFullYear()} MBJ Jewellers · All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* ── CONTACT MODAL ── */}
      {showContactModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setShowContactModal(false)}
        >
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.22)', padding: '40px', maxWidth: '400px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <img src={LOGO_URL} alt="MBJ" style={{ height: '56px', width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', textAlign: 'center', marginBottom: '24px' }}>Get in Touch</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: `https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g,'')}?text=Hi!`, icon: <MessageCircle size={17} />, bg: '#22c55e', label: 'WhatsApp', sub: settings?.whatsapp || '+91 7019539776', target: '_blank' },
                { href: `mailto:${settings?.email||'jewellersmb786@gmail.com'}`, icon: <Mail size={17} />, bg: '#D4AF37', iconColor: '#000', label: 'Email', sub: settings?.email || 'jewellersmb786@gmail.com', target: '_self' },
                { href: `tel:${settings?.phone||'+917019539776'}`, icon: <Phone size={17} />, bg: '#3b82f6', label: 'Call Us', sub: settings?.phone || '+91 7019539776', target: '_self' },
              ].map(({ href, icon, bg, iconColor, label, sub, target }) => (
                <a key={label} href={href} target={target} rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                >
                  <div style={{ width: '36px', height: '36px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: iconColor || '#fff' }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#fff', letterSpacing: '0.08em' }}>{label}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>{sub}</div>
                  </div>
                </a>
              ))}
            </div>
            <button onClick={() => setShowContactModal(false)}
              style={{ marginTop: '16px', width: '100%', padding: '11px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
            >Close</button>
          </div>
        </div>
      )}

      {/* ── FLOATING WHATSAPP ── */}
      <a href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g,'')||'917019539776'}?text=Hi!`}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 40, width: '50px', height: '50px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(34,197,94,0.4)', textDecoration: 'none', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle size={22} color="white" />
      </a>

      <style>{`
        @media (max-width: 1024px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
