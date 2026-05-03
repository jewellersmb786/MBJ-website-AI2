import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { catalogueAPI } from '../api';

const WATERMARK_ROWS = 4;
const WATERMARK_COLS = 3;

const WatermarkOverlay = ({ text }) => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', userSelect: 'none', zIndex: 2 }}>
    {Array.from({ length: WATERMARK_ROWS * WATERMARK_COLS }).map((_, i) => {
      const row = Math.floor(i / WATERMARK_COLS);
      const col = i % WATERMARK_COLS;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${row * 32 - 10}%`,
            left: `${col * 40 - 8}%`,
            transform: 'rotate(-32deg)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgba(212,175,55,0.35)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.06em',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {text}
        </div>
      );
    })}
  </div>
);

const CataloguePage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | not_found | expired | revoked | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await catalogueAPI.view(id);
        setData(res.data);
        setStatus('ok');
      } catch (err) {
        const code = err?.response?.status;
        const detail = err?.response?.data?.detail || '';
        if (code === 404) setStatus('not_found');
        else if (code === 410) {
          if (detail.includes('revoked')) setStatus('revoked');
          else setStatus('expired');
          setErrorMsg(detail);
        } else {
          setStatus('error');
          setErrorMsg(detail || 'An error occurred');
        }
      }
    })();
  }, [id]);

  // Disable print via CSS, disable text selection globally
  useEffect(() => {
    document.body.style.userSelect = 'none';
    return () => { document.body.style.userSelect = ''; };
  }, []);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return iso; }
  };

  const waLink = (productName) => {
    const digits = (data?.settings?.whatsapp || '').replace(/\D/g, '');
    const msg = encodeURIComponent(`Hi! I'm interested in "${productName}" from my catalogue (Ref: ${id.slice(0, 8).toUpperCase()}). Please share more details.`);
    return `https://wa.me/${digits}?text=${msg}`;
  };

  const indicativePrice = (product) => {
    const rate = data?.settings?.k22_rate || 13835;
    const w = parseFloat(product.weight || 0);
    if (!w) return null;
    return Math.round(w * rate * 1.12 * 1.03);
  };

  const wmText = data ? `Jewellers MB · ${data.customer_phone}` : '';

  // ── States ────────────────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: 'rgba(212,175,55,0.6)', fontSize: '14px', marginTop: '16px' }}>Loading catalogue…</p>
        </div>
        <style>{noprint}</style>
      </div>
    );
  }

  if (status === 'not_found') {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <div style={iconCircle}>✕</div>
          <h2 style={headingGold}>Catalogue Not Found</h2>
          <p style={mutedText}>This link doesn't exist or may have been removed.</p>
        </div>
        <style>{noprint}</style>
      </div>
    );
  }

  if (status === 'revoked') {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <div style={iconCircle}>✕</div>
          <h2 style={headingGold}>Catalogue Revoked</h2>
          <p style={mutedText}>This catalogue has been revoked by the jeweller.</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>Please contact Jewellers MB for assistance.</p>
        </div>
        <style>{noprint}</style>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <div style={iconCircle}>⏱</div>
          <h2 style={headingGold}>Catalogue Expired</h2>
          <p style={mutedText}>This catalogue link has expired after 7 days.</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>Contact the jeweller to request a fresh catalogue.</p>
        </div>
        <style>{noprint}</style>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <h2 style={headingGold}>Something went wrong</h2>
          <p style={mutedText}>{errorMsg}</p>
        </div>
        <style>{noprint}</style>
      </div>
    );
  }

  // ── Main viewer ───────────────────────────────────────────────────────────
  const { customer_name, expires_at, view_count, products, settings } = data;

  return (
    <div style={pageStyle} onContextMenu={e => e.preventDefault()}>
      {/* Header */}
      <div style={{ background: '#120808', borderBottom: '1px solid rgba(212,175,55,0.18)', padding: '0' }}>
        {/* Gold top bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #D4AF37 0%, #a87f20 100%)' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', margin: '0 0 4px' }}>
              {settings.business_name}
            </p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', margin: 0, fontWeight: 400 }}>
              Curated for <span style={{ color: '#D4AF37' }}>{customer_name}</span>
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 3px' }}>
              Valid until <span style={{ color: 'rgba(212,175,55,0.8)' }}>{formatDate(expires_at)}</span>
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              {products.length} items · viewed {view_count} time{view_count !== 1 ? 's' : ''} · ref {id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Notice bar */}
      <div style={{ background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.1)', padding: '8px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          This catalogue is personal and watermarked. Prices shown are indicative — actual price depends on gold rate at time of purchase.
        </p>
      </div>

      {/* Products grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif', fontSize: '18px' }}>
            No products in this catalogue.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {products.map((product) => {
              const price = indicativePrice(product);
              return (
                <div
                  key={product.id}
                  style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '12px', overflow: 'hidden' }}
                >
                  {/* Image with watermark */}
                  <div
                    style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden', background: '#120808' }}
                    onContextMenu={e => e.preventDefault()}
                  >
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        draggable={false}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
                        onContextMenu={e => e.preventDefault()}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: '56px', color: 'rgba(212,175,55,0.18)' }}>{product.name.charAt(0)}</span>
                      </div>
                    )}
                    <WatermarkOverlay text={wmText} />
                    {/* Bottom gradient */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, #1a0f12, transparent)', pointerEvents: 'none' }} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px 18px 18px' }}>
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: 400, color: '#D4AF37', margin: '0 0 7px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(212,175,55,0.5)', marginBottom: '4px' }}>
                      <span>{product.weight} g</span>
                      <span>{(product.purity || '').toUpperCase()}</span>
                    </div>
                    {price && (
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
                        ~₹{price.toLocaleString('en-IN')} <span style={{ fontSize: '10px' }}>*indicative</span>
                      </p>
                    )}

                    <a
                      href={waLink(product.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
                    >
                      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      Inquire on WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: '#120808', borderTop: '1px solid rgba(212,175,55,0.1)', padding: '24px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: '0 0 4px' }}>
          {settings.business_name} · This catalogue is personal and non-transferable
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', margin: 0 }}>
          * Prices are indicative only. Actual price is calculated at time of purchase based on current gold rate, making charges and applicable taxes.
        </p>
      </div>

      <style>{noprint}</style>
    </div>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const pageStyle = {
  minHeight: '100vh',
  background: '#0f080c',
  color: '#fff',
  fontFamily: "'system-ui', sans-serif",
};

const centerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  padding: '40px 24px',
  textAlign: 'center',
};

const iconCircle = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'rgba(212,175,55,0.1)',
  border: '1px solid rgba(212,175,55,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  color: '#D4AF37',
  marginBottom: '20px',
};

const headingGold = {
  fontFamily: 'Georgia, serif',
  fontSize: '26px',
  color: '#D4AF37',
  fontWeight: 400,
  margin: '0 0 12px',
};

const mutedText = {
  fontSize: '15px',
  color: 'rgba(255,255,255,0.4)',
  margin: 0,
  lineHeight: 1.6,
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '3px solid rgba(212,175,55,0.15)',
  borderTopColor: '#D4AF37',
  animation: 'spin 0.9s linear infinite',
};

const noprint = `
  @media print { body { display: none !important; } }
  * { user-select: none !important; -webkit-user-select: none !important; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default CataloguePage;
