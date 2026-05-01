import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoriesAPI, productsAPI } from '../api';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter } from 'lucide-react';

const CollectionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [weightRange, setWeightRange] = useState([0, 200]);
  const [selectedPurities, setSelectedPurities] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ limit: 500 }),
        ]);
        setCategories(catRes.data);
        setAllProducts(prodRes.data);
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
                      <img
                        className="cat-media"
                        src={cat.display_image}
                        alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)', display: 'block', transition: 'transform 0.55s ease' }}
                      />
                    ) : (
                      <div
                        className="cat-media"
                        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(128,0,32,0.1) 100%)', transition: 'transform 0.55s ease' }}
                      >
                        <span style={{ fontSize: '56px', fontFamily: 'Georgia, serif', color: 'rgba(212,175,55,0.25)' }}>
                          {cat.name.charAt(0)}
                        </span>
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
          @media (max-width: 640px) {
            .cat-card { aspect-ratio: unset; }
          }
        `}</style>
      </div>
    );
  }

  // ── PRODUCTS VIEW ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

        {/* Back + heading */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={backToCategories}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)', padding: 0, marginBottom: '18px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,0.65)'}
          >
            <ArrowLeft size={14} /> Back to Collections
          </button>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', margin: 0 }}>
            {selectedCategoryData?.name || 'Collection'}
          </h1>
          <div style={{ width: '32px', height: '1px', background: '#D4AF37', marginTop: '12px' }} />
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* Filters sidebar */}
          <div style={{ width: '210px', flexShrink: 0, position: 'sticky', top: '88px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Filter size={15} color="#D4AF37" />
                <span style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 600 }}>Filters</span>
              </div>

              {/* Subcategory */}
              {selectedCategoryData?.subcategories?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: '10px', margin: '0 0 10px' }}>Type</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {['', ...selectedCategoryData.subcategories].map(sub => (
                      <button
                        key={sub || 'all'}
                        onClick={() => setSelectedSubcategory(sub)}
                        style={{ textAlign: 'left', padding: '7px 11px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', textTransform: 'capitalize', background: selectedSubcategory === sub ? '#D4AF37' : 'transparent', color: selectedSubcategory === sub ? '#000' : 'rgba(212,175,55,0.75)', transition: 'all 0.2s' }}
                      >
                        {sub || 'All'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight */}
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

              {/* Purity */}
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
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.4) }}
                  >
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }} data-testid={`product-card-${product.id}`}>
                      <div
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.25s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ aspectRatio: '1', overflow: 'hidden', background: 'rgba(212,175,55,0.06)' }}>
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', display: 'block' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '40px', fontFamily: 'Georgia, serif', color: 'rgba(212,175,55,0.22)' }}>{product.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                            <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: 500, margin: 0, lineHeight: 1.3 }}>{product.name}</h3>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', flexShrink: 0, whiteSpace: 'nowrap', background: product.stock_status === 'in_stock' ? 'rgba(34,197,94,0.15)' : 'rgba(251,146,60,0.15)', color: product.stock_status === 'in_stock' ? '#4ade80' : '#fb923c' }}>
                              {product.stock_status === 'in_stock' ? 'In Stock' : 'MTO'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>
                            <span>{product.weight}g</span>
                            <span>{product.purity?.toUpperCase()}</span>
                          </div>
                          <div style={{ marginTop: '10px', fontSize: '12px', color: '#D4AF37', letterSpacing: '0.04em' }}>View Details →</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cat-skeleton { animation: skelPulse 1.5s ease-in-out infinite; }
        @keyframes skelPulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
        @media (max-width: 768px) {
          .collections-layout { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
};

export default CollectionsPage;
