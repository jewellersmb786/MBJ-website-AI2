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
      setScrolled(window.scrollY > 50);
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

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/collections', label: 'Collections' },
    { to: '/calculator', label: 'Calculator' },
    { to: '/custom-order', label: 'Custom Orders' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative">
      
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4 gap-8">
            {/* Logo - Centered */}
            <Link to="/" className="flex-shrink-0">
              <img 
                src={settings?.logo_url || "https://customer-assets.emergentagent.com/job_planning-phase-9/artifacts/6lie68ha_openart-fabf0c3b-095b-4c9f-ba55-7fb5f24a5ff2.png"} 
                alt="MBJ Jewellers" 
                className="h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-base font-medium transition-colors ${
                    location.pathname === link.to 
                      ? 'text-[#D4AF37]' 
                      : 'text-white hover:text-[#D4AF37]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Contact Button */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-[#D4AF37] hover:bg-[#B8960F] text-black px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2"
              >
                <Phone size={16} />
                <span>Contact</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-y-0 right-0 w-64 bg-black/95 backdrop-blur-sm z-40 lg:hidden border-l border-[#D4AF37]/20">
          <nav className="flex flex-col space-y-6 p-8 mt-20">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-medium ${
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
              className="bg-[#D4AF37] text-black px-6 py-3 rounded-full font-semibold"
            >
              Contact
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="relative">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-t from-black to-transparent border-t border-gold/10 mt-32">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-playfair font-bold gold-text mb-4">
                Jewellers MB
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Exquisite South Indian Nakshi & Antique Jewellery. 
                Crafting heritage, one masterpiece at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {navLinks.slice(1).map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-gold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {settings?.phone && <li>{settings.phone}</li>}
                {settings?.email && <li>{settings.email}</li>}
                {settings?.instagram && <li>{settings.instagram}</li>}
              </ul>
            </div>
          </div>
          <div className="border-t border-gold/10 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 Jewellers MB. Crafted with Excellence.</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-playfair font-bold text-[#D4AF37] mb-6 text-center">Contact MBJ</h3>
            <div className="space-y-4">
              <a
                href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition-all"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">WhatsApp</div>
                  <div className="text-sm text-gray-400">+91 7019539776</div>
                </div>
              </a>
              <a
                href="mailto:jewellersmb786@gmail.com"
                className="flex items-center gap-4 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl hover:bg-[#D4AF37]/20 transition-all"
              >
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <Mail size={24} className="text-black" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Email</div>
                  <div className="text-sm text-gray-400">jewellersmb786@gmail.com</div>
                </div>
              </a>
              <a
                href="tel:+917019539776"
                className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Phone size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Call</div>
                  <div className="text-sm text-gray-400">+91 7019539776</div>
                </div>
              </a>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all"
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
