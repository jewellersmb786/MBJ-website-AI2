import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { goldAPI, settingsAPI } from '../api';
import { Phone, Menu, X, Mail, MessageCircle } from 'lucide-react';
import CustomCursor from './CustomCursor';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://i.ibb.co/DHmMcnm9/openart-image-rw2-Sfjg-1736872346359-raw-removebg-preview-1.png';

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
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

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
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  const allNavLinks = [...navLinksLeft, ...navLinksRight];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0f0f0f] relative">
      <CustomCursor />

      {/* ── TOP UTILITY BAR ── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0a0a0a] border-b border-[#D4AF37]/10 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-2 flex items-center justify-between">
              {/* Gold rates */}
              <div className="hidden lg:flex items-center gap-6 text-[10px] tracking-widest uppercase text-[#D4AF37]/60">
                {goldRates && (
                  <>
                    <span>24K ₹{goldRates.k24_rate?.toLocaleString('en-IN')}/g</span>
                    <span className="text-[#D4AF37]/20">|</span>
                    <span>22K ₹{goldRates.k22_rate?.toLocaleString('en-IN')}/g</span>
                    <span className="text-[#D4AF37]/20">|</span>
                    <span>18K ₹{goldRates.k18_rate?.toLocaleString('en-IN')}/g</span>
                    {goldRates.last_updated && (
                      <>
                        <span className="text-[#D4AF37]/20">|</span>
                        <span className="text-white/30">
                          Updated: {new Date(goldRates.last_updated).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              {/* Right utility links */}
              <div className="flex items-center gap-6 text-[10px] tracking-widest uppercase text-white/40 ml-auto">
                <a
                  href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle size={11} />
                  WhatsApp
                </a>
                <span className="text-white/20">|</span>
                <a href={`tel:${settings?.phone}`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <Phone size={11} />
                  {settings?.phone || '+91 7019539776'}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN HEADER ── */}
      <header
        className="fixed left-0 right-0 z-50 transition-all duration-500"
        style={{
          top: 0,
          background: scrolled
            ? 'rgba(8, 8, 8, 0.96)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(212,175,55,0.12)' : 'none',
        }}
      >
        {/* ── HERO NAVBAR (before scroll) ── */}
        <AnimatePresence>
          {!scrolled && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="container mx-auto px-6"
            >
              {/* Full logo centered */}
              <div className="flex flex-col items-center pt-8 pb-2">
                <Link to="/" className="block mb-5">
                  <motion.img
                    src={LOGO_URL}
                    alt="MBJ Jewellers"
                    className="h-28 w-auto object-contain"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </Link>

                {/* Nav links in single row below logo */}
                <nav className="hidden lg:flex items-center gap-10 pb-5">
                  {allNavLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-200 relative group ${
                        isActive(link.to)
                          ? 'text-[#D4AF37]'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {link.label}
                      <span className={`absolute -bottom-1 left-0 h-px bg-[#D4AF37] transition-all duration-300 ${
                        isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'
                      }`} />
                    </Link>
                  ))}
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="text-[11px] tracking-[0.2em] uppercase font-medium border border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#D4AF37] px-5 py-1.5 transition-all duration-200 hover:bg-[#D4AF37]/10"
                  >
                    Get in Touch
                  </button>
                </nav>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden absolute right-6 top-8 text-white"
                >
                  {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── COMPACT SCROLLED NAVBAR ── */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-6"
            >
              <div className="flex items-center justify-between py-3">

                {/* Small logo icon — left */}
                <Link to="/" className="flex-shrink-0">
                  <motion.img
                    src={LOGO_URL}
                    alt="MBJ Jewellers"
                    className="h-12 w-auto object-contain"
                    layoutId="logo"
                  />
                </Link>

                {/* Nav links — right */}
                <nav className="hidden lg:flex items-center gap-8">
                  {allNavLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-200 relative group ${
                        isActive(link.to)
                          ? 'text-[#D4AF37]'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {link.label}
                      <span className={`absolute -bottom-1 left-0 h-px bg-[#D4AF37] transition-all duration-300 ${
                        isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'
                      }`} />
                    </Link>
                  ))}
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="text-[10px] tracking-[0.2em] uppercase border border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#D4AF37] px-4 py-1.5 transition-all duration-200 hover:bg-[#D4AF37]/10"
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
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-72 bg-[#0a0a0a] z-40 border-l border-[#D4AF37]/15"
          >
            <div className="flex flex-col p-8 mt-24 gap-6">
              <img src={LOGO_URL} alt="MBJ Jewellers" className="h-16 w-auto object-contain mb-4" />
              {allNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm tracking-[0.2em] uppercase transition-colors ${
                    isActive(link.to) ? 'text-[#D4AF37]' : 'text-white/70 hover:text-white'
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
                className="border border-[#D4AF37]/50 text-[#D4AF37] px-6 py-3 text-xs tracking-widest uppercase mt-4 hover:bg-[#D4AF37]/10 transition-all"
              >
                Get in Touch
              </button>

              {/* Gold rates in mobile menu */}
              {goldRates && (
                <div className="mt-6 pt-6 border-t border-[#D4AF37]/10 space-y-2 text-xs text-white/40 tracking-wider">
                  <p>24K — ₹{goldRates.k24_rate?.toLocaleString('en-IN')}/g</p>
                  <p>22K — ₹{goldRates.k22_rate?.toLocaleString('en-IN')}/g</p>
                  <p>18K — ₹{goldRates.k18_rate?.toLocaleString('en-IN')}/g</p>
                  {goldRates.last_updated && (
                    <p className="text-white/25">
                      Updated: {new Date(goldRates.last_updated).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── MAIN CONTENT ── */}
      <main>
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080808] border-t border-[#D4AF37]/10 mt-20">
        {/* Top footer */}
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col items-center mb-12">
            <img src={LOGO_URL} alt="MBJ Jewellers" className="h-24 w-auto object-contain mb-6 opacity-90" />
            <p className="text-[#D4AF37]/50 tracking-[0.4em] uppercase text-xs text-center">
              Nakshi & Antique Jewellery · Mysore, Karnataka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* About */}
            <div>
              <h4 className="text-[#D4AF37] tracking-widest uppercase text-xs mb-5 pb-2 border-b border-[#D4AF37]/15">About Us</h4>
              <p className="text-white/40 text-sm leading-relaxed">
                Specialists in exquisite South Indian Nakshi & Antique jewellery.
                Crafting heritage pieces — Necklaces, Harams, Jhumkas and Bridal sets
                with timeless craftsmanship in Mysore.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[#D4AF37] tracking-widest uppercase text-xs mb-5 pb-2 border-b border-[#D4AF37]/15">Quick Links</h4>
              <ul className="space-y-3">
                {allNavLinks.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-white/40 hover:text-[#D4AF37] transition-colors text-xs tracking-wider uppercase"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-[#D4AF37] tracking-widest uppercase text-xs mb-5 pb-2 border-b border-[#D4AF37]/15">Contact Us</h4>
              <ul className="space-y-4 text-sm text-white/40">
                {settings?.phone && (
                  <li>
                    <a href={`tel:${settings.phone}`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                      <Phone size={13} />
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings?.email && (
                  <li>
                    <a href={`mailto:${settings.email}`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                      <Mail size={13} />
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings?.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=Hi!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                    >
                      <MessageCircle size={13} />
                      WhatsApp Us
                    </a>
                  </li>
                )}
                {settings?.instagram && (
                  <li>
                    <a
                      href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#D4AF37] transition-colors"
                    >
                      {settings.instagram}
                    </a>
                  </li>
                )}
              </ul>

              {/* Gold Rates in footer */}
              {goldRates && (
                <div className="mt-6 pt-5 border-t border-[#D4AF37]/10">
                  <p className="text-[#D4AF37]/50 text-[10px] tracking-widest uppercase mb-3">Today's Gold Rate</p>
                  <div className="space-y-1.5 text-xs text-white/35">
                    <p>24K — ₹{goldRates.k24_rate?.toLocaleString('en-IN')}/g</p>
                    <p>22K — ₹{goldRates.k22_rate?.toLocaleString('en-IN')}/g</p>
                    <p>18K — ₹{goldRates.k18_rate?.toLocaleString('en-IN')}/g</p>
                    {goldRates.last_updated && (
                      <p className="text-white/20 text-[10px] mt-1">
                        Updated: {new Date(goldRates.last_updated).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[#D4AF37]/10 pt-8 text-center">
            <p className="text-xs text-white/20 tracking-widest uppercase">
              © {new Date().getFullYear()} MBJ Jewellers · Mysore · All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* ── CONTACT MODAL ── */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[#0f0f0f] border border-[#D4AF37]/25 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={LOGO_URL} alt="MBJ" className="h-16 w-auto object-contain mx-auto mb-6" />
              <h3 className="font-serif text-xl tracking-[0.2em] uppercase text-[#D4AF37] mb-6 text-center">
                Get in Touch
              </h3>
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border border-green-500/20 hover:border-green-500/50 hover:bg-green-500/5 transition-all"
                >
                  <div className="w-10 h-10 bg-green-500 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm tracking-wider">WhatsApp</div>
                    <div className="text-white/40 text-xs">{settings?.whatsapp || '+91 7019539776'}</div>
                  </div>
                </a>

                <a
                  href={`mailto:${settings?.email || 'jewellersmb786@gmail.com'}`}
                  className="flex items-center gap-4 p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all"
                >
                  <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-black" />
                  </div>
                  <div>
                    <div className="text-white text-sm tracking-wider">Email</div>
                    <div className="text-white/40 text-xs">{settings?.email || 'jewellersmb786@gmail.com'}</div>
                  </div>
                </a>

                <a
                  href={`tel:${settings?.phone || '+917019539776'}`}
                  className="flex items-center gap-4 p-4 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm tracking-wider">Call Us</div>
                    <div className="text-white/40 text-xs">{settings?.phone || '+91 7019539776'}</div>
                  </div>
                </a>
              </div>

              <button
                onClick={() => setShowContactModal(false)}
                className="mt-6 w-full py-3 border border-white/10 hover:border-white/25 text-white/40 text-xs tracking-widest uppercase transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING WHATSAPP BUTTON ── */}
      <a
        href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi! I'm interested in your jewellery.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-2xl transition-all hover:scale-110"
        style={{ borderRadius: '50%' }}
      >
        <MessageCircle size={26} className="text-white" />
      </a>
    </div>
  );
};

export default Layout;
