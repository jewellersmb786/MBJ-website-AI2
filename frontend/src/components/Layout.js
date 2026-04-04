import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { goldAPI, settingsAPI } from '../api';
import { Phone, Menu, X, Mail } from 'lucide-react';
import CustomCursor from './CustomCursor';

const Layout = () => {
  const [goldRates, setGoldRates] = useState(null);
  const [settings, setSettings] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchGoldRates();
    fetchSettings();

    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchGoldRates = async () => {
    try {
      const response = await goldAPI.getRates();
      setGoldRates(response.data);
    } catch (error) {
      console.error('Error fetching gold rates:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getPublic();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const navLinksLeft = [
    { to: '/', label: 'Home' },
    { to: '/collections', label: 'Collections' },
    { to: '/calculator', label: 'Calculator' },
  ];

  const navLinksRight = [
    { to: '/custom-order', label: 'Custom Orders' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const allNavLinks = [...navLinksLeft, ...navLinksRight];

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative">

      {/* ── TOP HERO HEADER (visible before scroll) ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(10,10,10,0.97)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(212,175,55,0.15)' : 'none',
        }}
      >
        {/* Gold rate ticker — hides on scroll */}
        {!scrolled && goldRates && (
          <div className="border-b border-[#D4AF37]/20 py-1.5 hidden lg:block transition-all duration-300">
            <div className="container mx-auto px-6 flex justify-center gap-8 text-xs text-[#D4AF37]/80 tracking-widest uppercase">
              <span>24K — ₹{goldRates.k24_rate?.toLocaleString('en-IN')}/g</span>
              <span className="opacity-40">|</span>
              <span>22K — ₹{goldRates.k22_rate?.toLocaleString('en-IN')}/g</span>
              <span className="opacity-40">|</span>
              <span>18K — ₹{goldRates.k18_rate?.toLocaleString('en-IN')}/g</span>
            </div>
          </div>
        )}

        {/* ── LARGE CENTERED NAME (before scroll) ── */}
        {!scrolled && (
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center pt-6 pb-2">
              <Link to="/" className="block text-center mb-4">
                <h1
                  className="font-serif tracking-[0.25em] uppercase text-white"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '0.3em' }}
                >
                  Jewellers MB
                </h1>
                <p className="text-[#D4AF37]/70 tracking-[0.4em] uppercase text-xs mt-1">
                  Nakshi &amp; Antique Jewellery
                </p>
              </Link>

              {/* Nav links in a single row below the name */}
              <nav className="hidden lg:flex items-center gap-10 pb-4 mt-1">
                {allNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm tracking-widest uppercase transition-colors duration-200 ${
                      location.pathname === link.to
                        ? 'text-[#D4AF37]'
                        : 'text-white/80 hover:text-[#D4AF37]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile hamburger when not scrolled */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden absolute right-6 top-6 text-white"
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        )}

        {/* ── COMPACT SCROLLED NAVBAR ── */}
        {scrolled && (
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between py-4">

              {/* Left nav */}
              <nav className="hidden lg:flex items-center gap-8 flex-1">
                {navLinksLeft.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-xs tracking-widest uppercase transition-colors ${
                      location.pathname === link.to
                        ? 'text-[#D4AF37]'
                        : 'text-white/80 hover:text-[#D4AF37]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Small centered / left brand name */}
              <Link
                to="/"
                className="flex-shrink-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2"
              >
                <span
                  className="font-serif tracking-[0.3em] uppercase text-white"
                  style={{ fontSize: '1.1rem' }}
                >
                  Jewellers MB
                </span>
              </Link>

              {/* Right nav */}
              <nav className="hidden lg:flex items-center gap-8 flex-1 justify-end">
                {navLinksRight.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-xs tracking-widest uppercase transition-colors ${
                      location.pathname === link.to
                        ? 'text-[#D4AF37]'
                        : 'text-white/80 hover:text-[#D4AF37]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => setShowContactModal(true)}
                  className="border border-[#D4AF37]/60 hover:border-[#D4AF37] text-[#D4AF37] px-5 py-1.5 text-xs tracking-widest uppercase transition-all"
                >
                  Get in Touch
                </button>
              </nav>

              {/* Mobile hamburger when scrolled */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white"
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-y-0 right-0 w-64 bg-black/98 backdrop-blur-sm z-40 lg:hidden border-l border-[#D4AF37]/20">
          <nav className="flex flex-col space-y-6 p-8 mt-24">
            {allNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm tracking-widest uppercase ${
                  location.pathname === link.to ? 'text-[#D4AF37]' : 'text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowContactModal(true);
              }}
              className="border border-[#D4AF37] text-[#D4AF37] px-6 py-3 text-xs tracking-widest uppercase mt-4"
            >
              Get in Touch
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className={scrolled ? 'pt-16' : 'pt-0'}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-[#D4AF37]/10 mt-32">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl tracking-[0.3em] uppercase text-white mb-2">
              Jewellers MB
            </h3>
            <p className="text-[#D4AF37]/60 tracking-widest uppercase text-xs">
              Nakshi &amp; Antique Jewellery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Exquisite South Indian Nakshi &amp; Antique Jewellery.
                Crafting heritage, one masterpiece at a time.
              </p>
            </div>
            <div>
              <h4 className="text-[#D4AF37] tracking-widest uppercase text-xs mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {allNavLinks.slice(1).map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-[#D4AF37] transition-colors tracking-wider uppercase text-xs">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[#D4AF37] tracking-widest uppercase text-xs mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {settings?.phone && <li>{settings.phone}</li>}
                {settings?.email && <li>{settings.email}</li>}
                <li>
                  <a
                    href={settings?.instagram ? `https://instagram.com/${settings.instagram.replace('@', '')}` : 'https://instagram.com/jewellersmb'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    {settings?.instagram || '@jewellersmb'}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#D4AF37]/10 pt-8 text-center text-xs text-gray-600 tracking-widest uppercase">
            <p>© 2026 Jewellers MB. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-[#111] border border-[#D4AF37]/30 p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl tracking-widest uppercase text-[#D4AF37] mb-6 text-center">Contact Us</h3>
            <div className="space-y-4">
              <a
                href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 border border-green-500/30 hover:border-green-500/60 transition-all"
              >
                <div className="w-12 h-12 bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white tracking-wider">WhatsApp</div>
                  <div className="text-sm text-gray-400">+91 7019539776</div>
                </div>
              </a>
              <a
                href="mailto:jewellersmb786@gmail.com"
                className="flex items-center gap-4 p-4 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all"
              >
                <div className="w-12 h-12 bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
                  <Mail size={24} className="text-black" />
                </div>
                <div>
                  <div className="font-semibold text-white tracking-wider">Email</div>
                  <div className="text-sm text-gray-400">jewellersmb786@gmail.com</div>
                </div>
              </a>
              <a
                href="tel:+917019539776"
                className="flex items-center gap-4 p-4 border border-blue-500/30 hover:border-blue-500/60 transition-all"
              >
                <div className="w-12 h-12 bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Phone size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white tracking-wider">Call</div>
                  <div className="text-sm text-gray-400">+91 7019539776</div>
                </div>
              </a>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="mt-6 w-full py-3 border border-gray-700 hover:border-gray-500 text-gray-400 text-xs tracking-widest uppercase transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
