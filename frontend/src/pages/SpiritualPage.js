import React from 'react';
import { Link } from 'react-router-dom';

const SpiritualPage = () => (
  <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' }}>
    <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '16px' }}>MBJ Jewellers</p>
    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>Spiritual</h1>
    <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto 24px' }} />
    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '480px', lineHeight: 1.8, marginBottom: '40px' }}>
      Our spiritual jewellery collection is coming soon. A curated selection of sacred and devotional pieces crafted with the finest artistry.
    </p>
    <Link to="/"
      style={{ padding: '12px 28px', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}
    >
      Back to Home
    </Link>
  </div>
);

export default SpiritualPage;
