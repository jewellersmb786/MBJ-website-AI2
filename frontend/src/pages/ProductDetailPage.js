import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, settingsAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, ZoomIn, Instagram } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [settings, setSettings] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // imageView: 'dummy' | 'model'
  const [imageView, setImageView] = useState('dummy');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setImageView('dummy');
    setLightboxOpen(false);
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [prodRes, settRes] = await Promise.all([
          productsAPI.getById(id),
          settingsAPI.getPublic(),
        ]);
        if (cancelled) return;
        const prod = prodRes.data;
        setProduct(prod);
        setSettings(settRes.data);

        const catRes = await categoriesAPI.getAll();
        if (cancelled) return;
        const cat = (catRes.data || []).find(c => c.id === prod.category_id);
        setCategory(cat || null);

        const simRes = await productsAPI.getAll({ category_id: prod.category_id, limit: 20 });
        if (cancelled) return;
        const others = (simRes.data || []).filter(p => p.id !== id);
        setSimilar(others.sort(() => Math.random() - 0.5).slice(0, 4));
      } catch (err) {
        if (!cancelled) setError(err?.response?.status === 404 ? 'not_found' : 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleKeyDown = useCallback((e) => {
    if (lightboxOpen && e.key === 'Escape') setLightboxOpen(false);
  }, [lightboxOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Active image based on view toggle
  const activeImage = (product) => {
    if (!product) return null;
    if (imageView === 'model') return product.image_model || product.image_dummy || null;
    return product.image_dummy || null;
  };

  const calcPrice = () => {
    if (!product || !settings) return null;
    const rate = settings.k22_rate || 13835;
    const weight = parseFloat(product.weight || 0);
    const wastage = parseFloat(product.wastage_percent || 0);
    const making = parseFloat(product.making_charges || 0);
    const stone = parseFloat(product.stone_charges || 0);
    const goldValue = weight * (1 + wastage / 100) * rate;
    const makingTotal = weight * making;
    const subtotal = goldValue + makingTotal + stone;
    const gst = subtotal * 0.03;
    return { rate, weight, wastage, goldValue, makingTotal, stone, subtotal, gst, total: subtotal + gst };
  };

  const waLink = () => {
    if (!product || !settings) return '#';
    const digits = (settings.whatsapp || '').replace(/\D/g, '');
    const code = product.item_code ? ` (Code: ${product.item_code},` : ' (';
    const msg = `Hi, I'm interested in ${product.name}${code} Weight: ${product.weight}g, Purity: ${(product.purity || '').toUpperCase()}). Could you share more details?`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  };

  const fmtINR = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 32px 60px' }}>
          <div className="pdp-grid" style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: '48px' }}>
            <div style={{ aspectRatio: '4/5', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} className="skel" />
            <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[220, 320, 140, 200, 60].map((w, i) => (
                <div key={i} style={{ height: '16px', width: `${w}px`, maxWidth: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} className="skel" />
              ))}
            </div>
          </div>
        </div>
        <style>{skelStyle}</style>
      </div>
    );
  }

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (error === 'not_found') {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '140px 32px 60px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '16px' }}>Not Found</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>Product Not Found</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>This product may have been removed or the link is incorrect.</p>
          <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37', textDecoration: 'none', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <ArrowLeft size={13} /> Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '140px 32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', color: '#D4AF37', marginBottom: '12px' }}>Something went wrong</h2>
          <button onClick={() => navigate(-1)} style={{ color: 'rgba(212,175,55,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>← Go back</button>
        </div>
      </div>
    );
  }

  const price = calcPrice();
  const img = activeImage(product);
  const hasDummy = Boolean(product.image_dummy);
  const hasModel = Boolean(product.image_model);

  return (
    <div style={pageStyle} onContextMenu={e => { if (e.target.tagName === 'IMG') e.preventDefault(); }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 32px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          <Link to="/collections" style={bcLink}
            onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,0.6)'}
          >Collections</Link>
          {category && (
            <><span>›</span>
            <Link to={`/collections?category=${category.id}`} style={bcLink}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,0.6)'}
            >{category.name}</Link></>
          )}
          <span>›</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{product.name}</span>
        </div>

        {/* 2-col layout */}
        <div className="pdp-grid" style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: '48px', alignItems: 'start' }}>

          {/* LEFT — dual-view gallery */}
          <div>
            {/* Main image */}
            <div
              style={{ position: 'relative', background: '#1a0710', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/5', marginBottom: '12px', cursor: img ? 'zoom-in' : 'default' }}
              onClick={() => img && setLightboxOpen(true)}
            >
              {img ? (
                <img src={img} alt={product.name} draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }}
                  onContextMenu={e => e.preventDefault()}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '80px', color: 'rgba(212,175,55,0.12)' }}>{product.name.charAt(0)}</span>
                </div>
              )}

              {img && (
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.55)', borderRadius: '6px', padding: '5px 8px', pointerEvents: 'none' }}>
                  <ZoomIn size={12} color="rgba(212,175,55,0.7)" />
                </div>
              )}

              {/* Subtle watermark */}
              <div style={{ position: 'absolute', bottom: '14px', left: '16px', fontSize: '11px', color: 'rgba(212,175,55,0.28)', letterSpacing: '0.08em', userSelect: 'none', pointerEvents: 'none' }}>
                Jewellers MB
              </div>
            </div>

            {/* View thumbnails */}
            {(hasDummy || hasModel) && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {hasDummy && (
                  <button
                    onClick={() => setImageView('dummy')}
                    style={{ position: 'relative', width: '80px', height: '80px', padding: 0, border: `2px solid ${imageView === 'dummy' ? '#D4AF37' : 'rgba(255,255,255,0.12)'}`, borderRadius: '6px', overflow: 'hidden', background: '#1a0710', cursor: 'pointer', transition: 'border-color 0.2s', flexShrink: 0 }}
                  >
                    <img src={product.image_dummy} alt="Dummy view" draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onContextMenu={e => e.preventDefault()}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', padding: '3px 0', textAlign: 'center', fontSize: '9px', color: imageView === 'dummy' ? '#D4AF37' : 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                      Item
                    </div>
                  </button>
                )}
                {hasModel && (
                  <button
                    onClick={() => setImageView('model')}
                    style={{ position: 'relative', width: '80px', height: '80px', padding: 0, border: `2px solid ${imageView === 'model' ? '#D4AF37' : 'rgba(255,255,255,0.12)'}`, borderRadius: '6px', overflow: 'hidden', background: '#1a0710', cursor: 'pointer', transition: 'border-color 0.2s', flexShrink: 0 }}
                  >
                    <img src={product.image_model} alt="Model view" draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onContextMenu={e => e.preventDefault()}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', padding: '3px 0', textAlign: 'center', fontSize: '9px', color: imageView === 'model' ? '#D4AF37' : 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                      Model
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — product info */}
          <div style={{ paddingTop: '8px' }}>
            {/* Stock badge */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', background: product.stock_status === 'in_stock' ? 'rgba(34,197,94,0.15)' : 'rgba(251,146,60,0.15)', color: product.stock_status === 'in_stock' ? '#4ade80' : '#fb923c' }}>
                {product.stock_status === 'in_stock' ? 'In Stock' : product.stock_status === 'made_to_order' ? 'Made to Order' : 'Out of Stock'}
              </span>
            </div>

            {/* Name + item code */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 400, color: '#D4AF37', margin: 0, lineHeight: 1.2 }}>
                {product.name}
              </h1>
              {product.item_code && (
                <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '6px', fontSize: '13px', color: 'rgba(212,175,55,0.85)', fontWeight: 600, letterSpacing: '0.05em', flexShrink: 0, marginTop: '4px' }}>
                  {product.item_code}
                </span>
              )}
            </div>

            {/* Specs row */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '8px' }}>
              {[
                { label: 'Weight', value: `${product.weight} g` },
                { label: 'Purity', value: (product.purity || '').toUpperCase() },
                product.subcategory && { label: 'Type', value: product.subcategory.charAt(0).toUpperCase() + product.subcategory.slice(1) },
              ].filter(Boolean).map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 3px' }}>{item.label}</p>
                  <p style={{ fontSize: '15px', color: '#fff', margin: 0, fontWeight: 500 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            {price && (
              <div style={{ marginBottom: '24px', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.7)', margin: 0 }}>Indicative Price</p>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: `Gold (${price.weight}g${price.wastage ? ` + ${price.wastage}% VA` : ''} × ₹${price.rate.toLocaleString('en-IN')}/g)`, val: price.goldValue },
                    price.makingTotal > 0 && { label: 'Making charges', val: price.makingTotal },
                    price.stone > 0 && { label: 'Stone / beads', val: price.stone },
                    { label: 'Subtotal', val: price.subtotal, sep: true },
                    { label: 'GST (3%)', val: price.gst },
                  ].filter(Boolean).map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingTop: row.sep ? '6px' : 0, borderTop: row.sep ? '1px solid rgba(212,175,55,0.12)' : 'none' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.48)' }}>{row.label}</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>{fmtINR(row.val)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', marginTop: '2px', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
                    <span style={{ fontSize: '14px', color: '#D4AF37', fontWeight: 700 }}>Total (indicative)</span>
                    <span style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmtINR(price.total)}</span>
                  </div>
                </div>
                <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', margin: 0, lineHeight: 1.5 }}>
                    * Indicative only. Actual price depends on gold rate at time of purchase, exact making charges, and applicable taxes.
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '8px' }}>Description</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: 0 }}>{product.description}</p>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href={waLink()} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px 20px', background: '#22c55e', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
                onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Inquire on WhatsApp
              </a>

              {product.instagram_url && (
                <a href={product.instagram_url} target="_blank" rel="noopener noreferrer"
                  title="View on Instagram"
                  style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(225,48,108,0.15)'; e.currentTarget.style.borderColor = 'rgba(225,48,108,0.4)'; e.currentTarget.style.color = '#E1306C'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  <Instagram size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '8px' }}>From this collection</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#fff', margin: 0 }}>You may also like</h2>
              <div style={{ width: '28px', height: '1px', background: '#D4AF37', marginTop: '10px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {similar.map(sim => (
                <motion.div key={sim.id} whileHover={{ y: -3 }}>
                  <Link to={`/product/${sim.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.12)'}
                    >
                      <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#120808' }}>
                        {(sim.image_dummy || sim.image_model) ? (
                          <img src={sim.image_dummy || sim.image_model} alt={sim.name} draggable={false}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            onContextMenu={e => e.preventDefault()}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: 'rgba(212,175,55,0.18)' }}>{sim.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: 400, color: '#D4AF37', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sim.name}</h3>
                          {sim.item_code && <span style={{ fontSize: '10px', color: 'rgba(212,175,55,0.55)', flexShrink: 0 }}>{sim.item_code}</span>}
                        </div>
                        <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.45)', margin: 0 }}>{sim.weight}g · {(sim.purity || '').toUpperCase()}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox — shows active image */}
      <AnimatePresence>
        {lightboxOpen && img && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setLightboxOpen(false)}
          >
            <button onClick={() => setLightboxOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <X size={20} />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              src={img} alt={product.name} draggable={false}
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px', userSelect: 'none' }}
              onClick={e => e.stopPropagation()}
              onContextMenu={e => e.preventDefault()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) { .pdp-grid { grid-template-columns: 1fr !important; } }
        ${skelStyle}
      `}</style>
    </div>
  );
};

const pageStyle = { minHeight: '100vh', background: '#0f0f0f', color: '#fff' };
const bcLink = { color: 'rgba(212,175,55,0.6)', textDecoration: 'none', transition: 'color 0.2s' };
const skelStyle = `.skel { animation: skelPulse 1.5s ease-in-out infinite; } @keyframes skelPulse { 0%,100%{opacity:1}50%{opacity:.45} }`;

export default ProductDetailPage;
