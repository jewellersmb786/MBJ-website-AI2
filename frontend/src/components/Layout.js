import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { settingsAPI } from '../api';
import { Phone, Menu, X, Mail, MessageCircle } from 'lucide-react';
import CustomCursor from './CustomCursor';

const LOGO_URL = 'https://i.ibb.co/DHmMcnm9/openart-image-rw2-Sfjg-1736872346359-raw-removebg-preview-1.png';

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const YouTubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0a0a0a"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/collections', label: 'Collections' },
  { to: '/schemes', label: 'Schemes' },
  { to: '/my-scheme', label: 'My Schemes' },
  { to: '/spiritual', label: 'Spiritual' },
  { to: '/calculator', label: 'Quotation' },
  { to: '/custom-order', label: 'Customisation' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

const SOCIAL = [
  { key: 'facebook', icon: <FacebookIcon /> },
  { key: 'youtube', icon: <YouTubeIcon /> },
  { key: 'twitter', icon: <TwitterIcon /> },
  { key: 'instagram', icon: <InstagramIcon /> },
];

const Layout = () => {
  const [settings, setSettings] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    // Use settingsAPI for EVERYTHING — rates, social links, all settings
    settingsAPI.getPublic().then(r => setSettings(r.data)).catch(() => {});
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isActive = (p) => location.pathname === p;

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return ''; }
  };

  const fmtRate = (n) => {
    if (!n) return '—';
    return Number(n).toLocaleString('en-IN');
  };

  // Logo sizing
  const logoW = scrolled ? 40 : (isHome ? 140 : 70);
  // Clip bottom 38% when scrolled to hide JEWELLERS text
  const logoClip = scrolled ? 'inset(0 0 38% 0)' : 'none';

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <CustomCursor />

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(8,8,8,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(212,175,55,0.12)' : 'none',
        transition: 'background 0.4s, box-shadow 0.4s',
      }}>

        {/* ── UTILITY BAR ── */}
        <div style={{
          background: 'rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(212,175,55,0.07)',
          maxHeight: scrolled ? '0' : '36px',
          opacity: scrolled ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 0.4s ease, opacity 0.3s ease',
        }}>
          <div style={{
            maxWidth: '1400px', margin: '0 auto', padding: '0 32px',
            height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            {/* Gold rates — from settings (same source as calculator) */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              fontVariantNumeric: 'tabular-nums',
              fontSize: '11px', letterSpacing: '0.06em',
              color: 'rgba(212,175,55,0.7)',
            }}>
              {settings ? (
                <>
                  <span>24K &nbsp;₹{fmtRate(settings.k24_rate)}<span style={{ fontSize: '9px', color: 'rgba(212,175,55,0.45)' }}>/g</span></span>
                  <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                  <span>22K &nbsp;₹{fmtRate(settings.k22_rate)}<span style={{ fontSize: '9px', color: 'rgba(212,175,55,0.45)' }}>/g</span></span>
                  <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                  <span>18K &nbsp;₹{fmtRate(settings.k18_rate)}<span style={{ fontSize: '9px', color: 'rgba(212,175,55,0.45)' }}>/g</span></span>
                  {settings.rates_updated_at && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                      <span style={{ fontFamily: 'sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
                        as of {formatDate(settings.rates_updated_at)}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span style={{ fontFamily: 'sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Loading rates...</span>
              )}
            </div>

            {/* Social icons + Get in Touch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {SOCIAL.map(({ key, icon }) => {
                const url = settings?.[key];
                if (url) {
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                    >{icon}</a>
                  );
                }
                return (
                  <span key={key} style={{ color: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center' }}>{icon}</span>
                );
              })}
              <span style={{ color: 'rgba(255,255,255,0.1)', margin: '0 2px' }}>|</span>
              <button
                onClick={() => setShowContactModal(true)}
                style={{
                  fontSize: '10px', letterSpacing: '0.13em', textTransform: 'uppercase',
                  color: '#D4AF37', border: '1px solid rgba(212,175,55,0.35)',
                  background: 'transparent', padding: '3px 12px', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Get in Touch</button>
            </div>
          </div>
        </div>

        {/* ── MAIN NAV ── */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: scrolled ? '52px' : (isHome ? '100px' : '62px'),
            transition: 'height 0.4s ease',
          }}>

            {/* LOGO */}
            <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', marginRight: '12px' }}>
              <img
                src={LOGO_URL}
                alt="MBJ Jewellers"
                style={{
                  width: `${logoW}px`,
                  height: 'auto',
                  objectFit: 'contain',
                  objectPosition: 'top center',
                  clipPath: logoClip,
                  transition: 'width 0.4s ease, clip-path 0.4s ease',
                  display: 'block',
                }}
              />
            </Link>

            {/* NAV LINKS — equal flex boxes, vertically centered, no underline */}
            <nav style={{
              display: 'flex',
              alignItems: 'stretch',
              flex: 1,
              height: '100%',
            }} className="desktop-nav">
              {NAV_LINKS.map(({ to, label }) => {
                const act = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      flex: '1 1 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      // Bigger font, professional
                      fontSize: scrolled ? '11px' : '12px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: act ? 600 : 400,
                      // Active = gold color only, no underline
                      color: act ? '#D4AF37' : 'rgba(255,255,255,0.65)',
                      textDecoration: 'none',
                      // NO border bottom at all
                      borderBottom: 'none',
                      transition: 'color 0.2s, font-weight 0.2s, font-size 0.4s',
                      padding: '0 2px',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!act) e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { if (!act) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-btn"
              style={{ marginLeft: 'auto', color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 40 }} onClick={() => setMobileMenuOpen(false)} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px',
            background: '#0a0a0a', borderLeft: '1px solid rgba(212,175,55,0.15)',
            zIndex: 45, padding: '80px 32px 32px',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            <img src={LOGO_URL} alt="MBJ" style={{ width: '50px', clipPath: 'inset(0 0 38% 0)', marginBottom: '8px' }} />
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: isActive(to) ? '#D4AF37' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none', fontWeight: isActive(to) ? 600 : 400,
              }}>{label}</Link>
            ))}
            <button
              onClick={() => { setMobileMenuOpen(false); setShowContactModal(true); }}
              style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', background: 'transparent', padding: '10px', cursor: 'pointer', marginTop: '8px' }}
            >Get in Touch</button>
          </div>
        </>
      )}

      {/* ── CONTENT ── */}
      <main style={{ paddingTop: isHome ? '0' : '68px' }}>
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#080808', borderTop: '1px solid rgba(212,175,55,0.1)', marginTop: '80px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '56px 32px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '48px', marginBottom: '36px' }}>

            <div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '16px' }}>Contact Us</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {settings?.phone && <a href={`tel:${settings.phone}`} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}><Phone size={12}/>{settings.phone}</a>}
                {settings?.email && <a href={`mailto:${settings.email}`} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}><Mail size={12}/>{settings.email}</a>}
                {settings?.whatsapp && <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g,'')}?text=Hi!`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}><MessageCircle size={12}/>WhatsApp Us</a>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  {SOCIAL.map(({ key, icon }) => {
                    const url = settings?.[key];
                    return url
                      ? <a key={key} href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s', textDecoration: 'none', display: 'flex' }} onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>{icon}</a>
                      : <span key={key} style={{ color: 'rgba(255,255,255,0.15)', display: 'flex' }}>{icon}</span>;
                  })}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '16px' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {[
                  { to: '/collections', label: 'Collections' },
                  { to: '/track-order', label: 'Track Order' },
                  { to: '/custom-order', label: 'Custom Orders' },
                  { to: '/schemes', label: 'Schemes' },
                  { to: '/spiritual', label: 'Spiritual' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >{label}</Link>
                ))}
              </div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '16px' }}>About Us</h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.8' }}>
                {settings?.tagline || 'Specialists in South Indian Nakshi & Antique jewellery — Necklaces, Harams, Jhumkas and Bridal Sets.'}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '16px' }}>Store Location</h4>
              {settings?.store_location
                ? <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.8' }}>{settings.store_location}</p>
                : <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Add from admin settings</p>
              }
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(212,175,55,0.08)', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
              © {new Date().getFullYear()} MBJ Jewellers · All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* ── CONTACT MODAL ── */}
      {showContactModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowContactModal(false)}>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.22)', padding: '40px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <img src={LOGO_URL} alt="MBJ" style={{ width: '50px', clipPath: 'inset(0 0 38% 0)', display: 'block', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', textAlign: 'center', marginBottom: '24px' }}>Get in Touch</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: `https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g,'')||'917019539776'}?text=Hi!`, icon: <MessageCircle size={17}/>, bg: '#22c55e', label: 'WhatsApp', sub: settings?.whatsapp||'+91 7019539776', target: '_blank' },
                { href: `mailto:${settings?.email||'jewellersmb786@gmail.com'}`, icon: <Mail size={17}/>, bg: '#D4AF37', iconColor: '#000', label: 'Email', sub: settings?.email||'jewellersmb786@gmail.com', target: '_self' },
                { href: `tel:${settings?.phone||'+917019539776'}`, icon: <Phone size={17}/>, bg: '#3b82f6', label: 'Call Us', sub: settings?.phone||'+91 7019539776', target: '_self' },
              ].map(({ href, icon, bg, iconColor, label, sub, target }) => (
                <a key={label} href={href} target={target} rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                >
                  <div style={{ width: '36px', height: '36px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: iconColor||'#fff' }}>{icon}</div>
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
      <a
        href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g,'')||'917019539776'}?text=Hi!`}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 40, width: '50px', height: '50px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(34,197,94,0.4)', textDecoration: 'none', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle size={22} color="white" />
      </a>

      <style>{`
        @media (max-width: 1100px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: flex !important; }
        }
        @media (min-width: 1101px) {
          .mobile-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
