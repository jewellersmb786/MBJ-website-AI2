import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { schemesAPI, settingsAPI } from '../api';
import { Coins, CheckCircle2 } from 'lucide-react';

const SchemesPage = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsapp, setWhatsapp] = useState('917019539776');

  useEffect(() => {
    Promise.all([
      schemesAPI.getAll(),
      settingsAPI.getPublic(),
    ]).then(([sRes, stRes]) => {
      setSchemes(sRes.data || []);
      const w = (stRes.data?.whatsapp || '').replace(/\D/g, '');
      if (w) setWhatsapp(w);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '0 32px', marginBottom: '64px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Coins size={26} color="#D4AF37" />
        </div>
        <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>MBJ Jewellers</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>Our Gold Saving Schemes</h1>
        <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto 20px' }} />
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          Flexible and affordable savings plans designed to make your dream jewellery purchase a reality.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading schemes...</div>
        ) : schemes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 32px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Schemes coming soon.</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginBottom: '28px' }}>Contact us for personalised plans.</p>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              Contact on WhatsApp
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' }}>
            {schemes.map((scheme, idx) => (
              <motion.div key={scheme.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                onClick={() => navigate(`/schemes/${scheme.id}`)}
                style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                {scheme.hero_image && (
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <img src={scheme.hero_image} alt={scheme.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)' }} />
                  </div>
                )}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#D4AF37', marginBottom: '4px' }}>{scheme.name}</h3>
                  {scheme.tagline && (
                    <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.6)', marginBottom: '10px', fontStyle: 'italic' }}>{scheme.tagline}</p>
                  )}
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '16px', flex: 1 }}>
                    {scheme.description.split(/\n\n+/)[0]}
                  </p>

                  {scheme.highlights?.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {scheme.highlights.slice(0, 3).map((h, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                          <CheckCircle2 size={14} color="#D4AF37" style={{ flexShrink: 0, marginTop: '2px' }} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/schemes/${scheme.id}`); }}
                    style={{ width: '100%', padding: '12px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#B8960F'}
                    onMouseLeave={e => e.currentTarget.style.background = '#D4AF37'}
                  >{scheme.cta_button_text || 'Enroll Now'}</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemesPage;
