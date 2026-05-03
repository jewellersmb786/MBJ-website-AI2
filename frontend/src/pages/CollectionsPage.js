import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { categoriesAPI, productsAPI, settingsAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Filter, Heart, Share2, X } from 'lucide-react';

const readShareList = () => {
  try { return JSON.parse(sessionStorage.getItem('shareList') || '[]'); }
  catch { return []; }
};
const writeShareList = (list) => {
  try { sessionStorage.setItem('shareList', JSON.stringify(list)); }
  catch {}
};

const CollectionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [weightRange, setWeightRange] = useState([0, 200]);
  const [selectedPurities, setSelectedPurities] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Share-list state (persisted in sessionStorage)
  const [shareList, setShareList] = useState(readShareList);
  const [shareMode, setShareMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, prodRes, settRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ limit: 500 }),
          settingsAPI.getPublic(),
        ]);
        setCategories(catRes.data);
        setAllProducts(prodRes.data);
        const digits = (settRes.data?.whatsapp || '').replace(/\D/g, '');
        setWhatsappNumber(digits);
      } catch (e) {
        console.error('Error loading collections:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const p of allProducts) {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    }
    return counts;
  }, [allProducts]);

  const visibleCategories = useMemo(
    () => categories.filter(c => (categoryCounts[c.id] || 0) > 0),
    [categories, categoryCounts]
  );

  const filteredProducts = useMemo(() => {
    let list = selectedCategory
      ? allProducts.filter(p => p.category_id === selectedCategory)
      : allProducts;
    if (selectedSubcategory) list = list.filter(p => p.subcategory === selectedSubcategory);
    list = list.filter(p => p.weight >= weightRange[0] && p.weight <= weightRange[1]);
    if (selectedPurities.length > 0) list = list.filter(p => selectedPurities.includes(p.purity));
    return list;
  }, [allProducts, selectedCategory, selectedSubcategory, weightRange, selectedPurities]);

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  const enterCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    setWeightRange([0, 200]);
    setSelectedPurities([]);
    setSearchParams({ category: categoryId });
  };

  const backToCategories = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setWeightRange([0, 200]);
    setSelectedPurities([]);
    setSearchParams({});
  };

  const togglePurity = (purity) =>
    setSelectedPurities(prev =>
      prev.includes(purity) ? prev.filter(p => p !== purity) : [...prev, purity]
    );

  const toggleShareItem = (productId, e) => {
    if (e) e.stopPropagation();
    setShareList(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      writeShareList(next);
      return next;
    });
  };

  const clearShareList = () => {
    setShareList([]);
    writeShareList([]);
  };

  const shareViaWhatsApp = () => {
    const items = shareList
      .map(id => {
        const p = allProducts.find(prod => prod.id === id);
        return p ? `• ${p.name}: ${window.location.origin}/product/${id}` : null;
      })
      .filter(Boolean)
      .join('\n');
    const msg = `Hi, here are some items I'm interested in:\n\n${items}\n\nCould you share more details?`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCardClick = (productId) => {
    if (shareMode) {
      toggleShareItem(productId);
    } else {
      navigate(`/product/${productId}`);
    }
  };

  // ── CATEGORY CARDS VIEW ────────────────────────────────────────────────────
  if (!selectedCategory) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>Explore</p>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>
              Our Collections
            </h1>
            <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto' }} />
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ aspectRatio: '3/4', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} className="cat-skeleton" />
              ))}
            </div>
          ) : visibleCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.35)' }}>
              <p style={{ fontSize: '18px', fontFamily: 'Georgia, serif' }}>No collections available yet.</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Check back soon.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {visibleCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  className="cat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => enterCategory(cat.id)}
                  style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'rgba(212,175,55,0.06)' }}>
                    {cat.display_image ? (
                      <img className="cat-media" src={cat.display_image} alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)', display: 'block', transition: 'transform 0.55s ease' }}
                      />
                    ) : (
                      <div className="cat-media"
                        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(128,0,32,0.1) 100%)', transition: 'transform 0.55s ease' }}
                      >
                        <span style={{ fontSize: '56px', fontFamily: 'Georgia, serif', color: 'rgba(212,175,55,0.25)' }}>{cat.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 45%, transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '22px 20px' }}>
                    <h2 style={{ fontSize: '19px', fontFamily: 'Georgia, serif', color: '#D4AF37', margin: '0 0 5px', lineHeight: 1.2 }}>{cat.name}</h2>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.48)', margin: 0 }}>
                      {categoryCounts[cat.id]} {categoryCounts[cat.id] === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          .cat-card:hover .cat-media { transform: scale(1.06); }
          .cat-skeleton { animation: skelPulse 1.5s ease-in-out infinite; }
          @keyframes skelPulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
          @media (max-width: 640px) { .cat-card { aspect-ratio: unset; } }
        `}</style>
      </div>
    );
  }

  // ── PRODUCTS VIEW ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: shareList.length > 0 ? '100px' : '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

        {/* Back + heading + share toggle */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <button
              onClick={backToCategories}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)', padding: 0, marginBottom: '18px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,0.65)'}
            >
              <ArrowLeft size={14} /> Back to Collections
            </button>
            {/* Share mode toggle */}
            <button
              onClick={() => setShareMode(m => !m)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 14px', background: shareMode ? 'rgba(212,175,55,0.15)' : 'transparent', border: `1px solid ${shareMode ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)'}`, borderRadius: '20px', color: shareMode ? '#D4AF37' : 'rgba(212,175,55,0.55)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.05em' }}
            >
              <Share2 size={13} />
              {shareMode ? 'Exit share mode' : 'Share list'}
              {shareList.length > 0 && !shareMode && (
                <span style={{ background: '#D4AF37', color: '#000', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {shareList.length}
                </span>
              )}
            </button>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', margin: 0 }}>
            {selectedCategoryData?.name || 'Collection'}
          </h1>
          <div style={{ width: '32px', height: '1px', background: '#D4AF37', marginTop: '12px' }} />
          {shareMode && (
            <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.6)', marginTop: '10px' }}>
              Tap the <Heart size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> on any item to add it to your share list.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* Filters sidebar */}
          <div style={{ width: '210px', flexShrink: 0, position: 'sticky', top: '88px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Filter size={15} color="#D4AF37" />
                <span style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 600 }}>Filters</span>
              </div>

              {selectedCategoryData?.subcategories?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', margin: '0 0 10px' }}>Type</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {['', ...selectedCategoryData.subcategories].map(sub => (
                      <button key={sub || 'all'} onClick={() => setSelectedSubcategory(sub)}
                        style={{ textAlign: 'left', padding: '7px 11px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', textTransform: 'capitalize', background: selectedSubcategory === sub ? '#D4AF37' : 'transparent', color: selectedSubcategory === sub ? '#000' : 'rgba(212,175,55,0.75)', transition: 'all 0.2s' }}
                      >{sub || 'All'}</button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', margin: '0 0 10px' }}>Weight (grams)</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#D4AF37', marginBottom: '8px' }}>
                  <span>{weightRange[0]}g</span><span>{weightRange[1]}g</span>
                </div>
                <input type="range" min="0" max="200" step="1" value={weightRange[0]}
                  onChange={e => setWeightRange([parseInt(e.target.value), weightRange[1]])}
                  style={{ width: '100%', accentColor: '#D4AF37', marginBottom: '6px', display: 'block' }} />
                <input type="range" min="0" max="200" step="1" value={weightRange[1]}
                  onChange={e => setWeightRange([weightRange[0], parseInt(e.target.value)])}
                  style={{ width: '100%', accentColor: '#D4AF37', display: 'block' }} />
              </div>

              <div>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', margin: '0 0 10px' }}>Purity</p>
                {['24k', '22k', '18k'].map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedPurities.includes(p)} onChange={() => togglePurity(p)}
                      style={{ accentColor: '#D4AF37', width: '14px', height: '14px' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{p.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} className="cat-skeleton" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif' }}>No products found.</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.22)', marginTop: '8px' }}>Try adjusting the filters.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {filteredProducts.map((product, index) => {
                  const isHearted = shareList.includes(product.id);
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.4) }}
                    >
                      <div
                        className="pcard"
                        data-testid={`product-card-${product.id}`}
                        style={{ position: 'relative', background: '#1a0f12', border: `1px solid ${isHearted ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.15)'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s', cursor: 'pointer' }}
                        onClick={() => handleCardClick(product.id)}
                        onMouseEnter={e => {
                          if (!isHearted) e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 16px 40px rgba(61,8,21,0.55)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = isHearted ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.15)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Heart / share icon — always toggles share list */}
                        <button
                          onClick={e => toggleShareItem(product.id, e)}
                          className="pcard-heart"
                          title={isHearted ? 'Remove from share list' : 'Add to share list'}
                          style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: isHearted ? 'rgba(212,175,55,0.95)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, transition: 'all 0.18s' }}
                        >
                          <Heart size={14} color={isHearted ? '#000' : 'rgba(255,255,255,0.7)'} fill={isHearted ? '#000' : 'none'} />
                        </button>

                        {/* Image */}
                        <div style={{ aspectRatio: '4/5', overflow: 'hidden', position: 'relative', background: '#120808' }}>
                          {product.images?.[0] ? (
                            <img className="pcard-img" src={product.images[0]} alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.45s ease' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontFamily: 'Georgia, serif', fontSize: '52px', color: 'rgba(212,175,55,0.18)' }}>{product.name.charAt(0)}</span>
                            </div>
                          )}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, #1a0f12 0%, transparent 100%)', pointerEvents: 'none' }} />
                          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                            <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', backdropFilter: 'blur(6px)', background: product.stock_status === 'in_stock' ? 'rgba(34,197,94,0.2)' : 'rgba(251,146,60,0.2)', color: product.stock_status === 'in_stock' ? '#4ade80' : '#fb923c' }}>
                              {product.stock_status === 'in_stock' ? 'In Stock' : 'MTO'}
                            </span>
                          </div>
                        </div>

                        <div style={{ padding: '14px 16px 18px' }}>
                          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: 400, color: '#D4AF37', margin: '0 0 7px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {product.name}
                          </h3>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(212,175,55,0.52)', letterSpacing: '0.04em' }}>
                            <span>{product.weight} g</span>
                            <span>{product.purity?.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating share bar — appears when ≥1 item in shareList */}
      <AnimatePresence>
        {shareList.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: '#1a0f12', borderTop: '1px solid rgba(212,175,55,0.3)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}
          >
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ color: '#D4AF37', fontWeight: 600 }}>{shareList.length}</span> item{shareList.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={shareViaWhatsApp}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Share via WhatsApp
            </button>
            <button
              onClick={clearShareList}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
            >
              <X size={13} /> Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .cat-skeleton { animation: skelPulse 1.5s ease-in-out infinite; }
        @keyframes skelPulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
        .cat-card:hover .cat-media { transform: scale(1.06); }
        .pcard:hover .pcard-img { transform: scale(1.05); }
        .pcard-heart { opacity: 0.5; }
        .pcard:hover .pcard-heart, .pcard-heart:focus { opacity: 1; }
      `}</style>
    </div>
  );
};

export default CollectionsPage;
