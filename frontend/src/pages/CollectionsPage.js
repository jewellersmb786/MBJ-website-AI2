import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { categoriesAPI, productsAPI, settingsAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Filter, Share2, Copy, X, Search } from 'lucide-react';

const CollectionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Core data
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsappDigits, setWhatsappDigits] = useState('');

  // Filter state — initialized from URL params
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [weightRange, setWeightRange] = useState([
    Math.max(0, parseFloat(searchParams.get('weight_min') || '0')),
    Math.min(200, parseFloat(searchParams.get('weight_max') || '200')),
  ]);
  const [selectedPurities, setSelectedPurities] = useState(() => {
    const p = searchParams.get('purity');
    return p ? p.split(',') : [];
  });

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // View + share modal state
  const [imageView, setImageView] = useState('dummy'); // 'dummy' | 'model'
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Mount: fetch all data
  useEffect(() => {
    (async () => {
      try {
        const [catRes, prodRes, settRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ limit: 1000 }),
          settingsAPI.getPublic(),
        ]);
        setCategories(catRes.data);
        setAllProducts(prodRes.data);
        setWhatsappDigits((settRes.data?.whatsapp || '').replace(/\D/g, ''));
      } catch {
        // silently handled — page shows empty state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Debounce search query 200ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Sync filters → URL params
  useEffect(() => {
    if (!selectedCategory) return;
    const params = { category: selectedCategory };
    if (selectedSubcategory) params.subcategory = selectedSubcategory;
    if (weightRange[0] > 0) params.weight_min = weightRange[0];
    if (weightRange[1] < 200) params.weight_max = weightRange[1];
    if (selectedPurities.length > 0) params.purity = selectedPurities.join(',');
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedSubcategory, weightRange, selectedPurities]);

  // Computed values
  const categoryMap = useMemo(() => {
    const map = {};
    for (const c of categories) map[c.id] = c.name;
    return map;
  }, [categories]);

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

  // Cross-category search results (used when no category selected)
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return allProducts.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.item_code || '').toLowerCase().includes(q) ||
      (categoryMap[p.category_id] || '').toLowerCase().includes(q)
    );
  }, [debouncedQuery, allProducts, categoryMap]);

  // Within-category search (name + item_code only)
  const displayProducts = useMemo(() => {
    if (!debouncedQuery) return filteredProducts;
    const q = debouncedQuery.toLowerCase();
    return filteredProducts.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.item_code || '').toLowerCase().includes(q)
    );
  }, [filteredProducts, debouncedQuery]);

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  // Navigation helpers
  const enterCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    setWeightRange([0, 200]);
    setSelectedPurities([]);
    setSearchQuery('');
    setSearchParams({ category: categoryId });
  };

  const backToCategories = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setWeightRange([0, 200]);
    setSelectedPurities([]);
    setSearchQuery('');
    setSearchParams({});
  };

  const togglePurity = (purity) =>
    setSelectedPurities(prev =>
      prev.includes(purity) ? prev.filter(p => p !== purity) : [...prev, purity]
    );

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // Product card image
  const getProductImage = (product) => {
    if (imageView === 'model') return product.image_model || product.image_dummy || null;
    return product.image_dummy || null;
  };

  // Shared search bar component (inline)
  const SearchBar = ({ placeholder = 'Search by item code, name, or category...' }) => (
    <div style={{ position: 'relative', marginBottom: '28px' }}>
      <Search
        size={16}
        color="rgba(212,175,55,0.5)"
        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '13px 44px 13px 42px',
          background: '#1a0710',
          border: '1px solid rgba(212,175,55,0.35)',
          borderRadius: '10px',
          color: '#fff',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.65)'}
        onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.35)'}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );

  // Shared product card renderer
  const ProductCard = ({ product, index }) => {
    const img = getProductImage(product);
    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.04, 0.4) }}
      >
        <div
          className="pcard"
          style={{ position: 'relative', background: '#1a0f12', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s', cursor: 'pointer' }}
          onClick={() => navigate(`/product/${product.id}`)}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(61,8,21,0.55)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ aspectRatio: '4/5', overflow: 'hidden', position: 'relative', background: '#120808' }}>
            {img ? (
              <img className="pcard-img" src={img} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.45s ease' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '52px', color: 'rgba(212,175,55,0.14)' }}>{product.name.charAt(0)}</span>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, #1a0f12 0%, transparent 100%)', pointerEvents: 'none' }} />
            {product.item_code && (
              <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,7,16,0.85)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '4px', padding: '2px 7px', fontSize: '10px', color: '#D4AF37', fontWeight: 600, letterSpacing: '0.04em', backdropFilter: 'blur(4px)' }}>
                {product.item_code}
              </div>
            )}
            <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
              <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', backdropFilter: 'blur(6px)', background: product.stock_status === 'in_stock' ? 'rgba(34,197,94,0.2)' : 'rgba(251,146,60,0.2)', color: product.stock_status === 'in_stock' ? '#4ade80' : '#fb923c' }}>
                {product.stock_status === 'in_stock' ? 'In Stock' : 'MTO'}
              </span>
            </div>
          </div>
          <div style={{ padding: '14px 16px 18px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: 400, color: '#D4AF37', margin: '0 0 7px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {product.name}
            </h3>
            {categoryMap[product.category_id] && !selectedCategory && (
              <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.45)', margin: '0 0 4px', letterSpacing: '0.04em' }}>
                {categoryMap[product.category_id]}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(212,175,55,0.52)', letterSpacing: '0.04em' }}>
              <span>{product.weight} g</span>
              <span>{product.purity?.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ── CATEGORY CARDS VIEW ──────────────────────────────────────────────────
  if (!selectedCategory) {
    const showSearchResults = debouncedQuery.length > 0 && !loading;

    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>Explore</p>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>
              Our Collections
            </h1>
            <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto' }} />
          </div>

          {/* Search bar */}
          <SearchBar />

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ aspectRatio: '3/4', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} className="cat-skeleton" />
              ))}
            </div>
          ) : showSearchResults ? (
            /* Search results */
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                  Found <strong style={{ color: '#D4AF37' }}>{searchResults.length}</strong> item{searchResults.length !== 1 ? 's' : ''} for "{debouncedQuery}"
                </p>
              </div>
              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.35)' }}>
                  <p style={{ fontSize: '18px', fontFamily: 'Georgia, serif' }}>No items found.</p>
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>Try a different search term.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {searchResults.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </>
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
          .pcard:hover .pcard-img { transform: scale(1.05); }
          @media (max-width: 640px) { .cat-card { aspect-ratio: unset; } }
        `}</style>
      </div>
    );
  }

  // ── PRODUCTS VIEW ──────────────────────────────────────────────────────────
  const subcats = selectedCategoryData?.subcategories || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

        {/* Top row: back + share */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={backToCategories}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,0.65)'}
          >
            <ArrowLeft size={14} /> Back to Collections
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 14px', background: 'transparent', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', color: 'rgba(212,175,55,0.65)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.05em' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.color = '#D4AF37'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; e.currentTarget.style.color = 'rgba(212,175,55,0.65)'; }}
          >
            <Share2 size={13} /> Share this view
          </button>
        </div>

        {/* Category heading */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', margin: 0 }}>
            {selectedCategoryData?.name || 'Collection'}
          </h1>
          <div style={{ width: '32px', height: '1px', background: '#D4AF37', marginTop: '12px' }} />
        </div>

        {/* Dummy/Model toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '3px', marginBottom: '20px' }}>
          {['dummy', 'model'].map(view => (
            <button
              key={view}
              onClick={() => setImageView(view)}
              style={{ padding: '6px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'capitalize', fontWeight: 600, transition: 'all 0.2s', background: imageView === view ? '#D4AF37' : 'transparent', color: imageView === view ? '#000' : 'rgba(212,175,55,0.6)' }}
            >
              {view === 'dummy' ? 'Item view' : 'Model view'}
            </button>
          ))}
        </div>

        {/* Subcategory chips */}
        {subcats.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {['', ...subcats].map(sub => (
              <button
                key={sub || 'all'}
                onClick={() => setSelectedSubcategory(sub)}
                style={{ padding: '6px 16px', borderRadius: '20px', border: `1px solid ${selectedSubcategory === sub ? '#D4AF37' : 'rgba(212,175,55,0.25)'}`, background: selectedSubcategory === sub ? '#D4AF37' : 'transparent', color: selectedSubcategory === sub ? '#000' : 'rgba(212,175,55,0.7)', fontSize: '12px', fontWeight: selectedSubcategory === sub ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.18s' }}
              >
                {sub || 'All'}
              </button>
            ))}
          </div>
        )}

        {/* Search bar */}
        <SearchBar placeholder="Search by name or item code..." />

        {debouncedQuery && (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', marginTop: '-12px' }}>
            Found <strong style={{ color: '#D4AF37' }}>{displayProducts.length}</strong> item{displayProducts.length !== 1 ? 's' : ''} matching "{debouncedQuery}"
          </p>
        )}

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* Filters sidebar */}
          <div style={{ width: '200px', flexShrink: 0, position: 'sticky', top: '88px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Filter size={15} color="#D4AF37" />
                <span style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 600 }}>Filters</span>
              </div>

              {/* Weight */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', margin: '0 0 10px' }}>Weight (grams)</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '3px', letterSpacing: '0.08em' }}>MIN</label>
                    <input
                      type="number" step="0.5" min="0" max="200"
                      value={weightRange[0]}
                      onChange={e => { const v = parseFloat(e.target.value) || 0; setWeightRange([Math.min(v, weightRange[1]), weightRange[1]]); }}
                      onBlur={e => { const v = parseFloat(e.target.value) || 0; setWeightRange([Math.max(0, Math.min(v, weightRange[1])), weightRange[1]]); }}
                      style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '6px', color: '#D4AF37', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '3px', letterSpacing: '0.08em' }}>MAX</label>
                    <input
                      type="number" step="0.5" min="0" max="200"
                      value={weightRange[1]}
                      onChange={e => { const v = parseFloat(e.target.value) || 0; setWeightRange([weightRange[0], Math.max(v, weightRange[0])]); }}
                      onBlur={e => { const v = parseFloat(e.target.value) || 0; setWeightRange([weightRange[0], Math.min(200, Math.max(v, weightRange[0]))]); }}
                      style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '6px', color: '#D4AF37', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                </div>
                <input type="range" min="0" max="200" step="0.5" value={weightRange[0]}
                  onChange={e => { const v = parseFloat(e.target.value); setWeightRange([Math.min(v, weightRange[1]), weightRange[1]]); }}
                  style={{ width: '100%', accentColor: '#D4AF37', marginBottom: '4px', display: 'block' }} />
                <input type="range" min="0" max="200" step="0.5" value={weightRange[1]}
                  onChange={e => { const v = parseFloat(e.target.value); setWeightRange([weightRange[0], Math.max(v, weightRange[0])]); }}
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
                  <div key={i} style={{ aspectRatio: '4/5', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} className="cat-skeleton" />
                ))}
              </div>
            ) : displayProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif' }}>No products found.</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.22)', marginTop: '8px' }}>
                  {debouncedQuery ? 'Try a different search term.' : 'Try adjusting the filters.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {displayProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={e => e.target === e.currentTarget && setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
              style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '14px', padding: '28px', maxWidth: '440px', width: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#D4AF37', margin: 0 }}>Share this filtered view</h2>
                <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {window.location.href}
                </span>
                <button onClick={copyShareLink} style={{ background: 'none', border: 'none', color: linkCopied ? '#4ade80' : '#D4AF37', cursor: 'pointer', flexShrink: 0, padding: '2px' }} title="Copy link">
                  <Copy size={16} />
                </button>
              </div>
              {linkCopied && <p style={{ fontSize: '12px', color: '#4ade80', marginBottom: '12px', textAlign: 'center' }}>Link copied!</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hi, here are some items from our collection that match your requirements: ${window.location.href}\n\nClick any item to see full details and prices.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  Share via WhatsApp
                </a>
                <button onClick={() => setShowShareModal(false)}
                  style={{ padding: '11px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .cat-skeleton { animation: skelPulse 1.5s ease-in-out infinite; }
        @keyframes skelPulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
        .cat-card:hover .cat-media { transform: scale(1.06); }
        .pcard:hover .pcard-img { transform: scale(1.05); }
      `}</style>
    </div>
  );
};

export default CollectionsPage;
