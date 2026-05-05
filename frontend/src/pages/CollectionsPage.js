import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { categoriesAPI, productsAPI, settingsAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Filter, Share2, Copy, X, Search, ChevronDown, ChevronUp, Info } from 'lucide-react';

// ─── Part 5A: SearchBar declared OUTSIDE to avoid remount on every keystroke ─

const SearchBar = React.memo(({ value, onChange, placeholder = 'Search by item code, name, or category...' }) => {
  const ref = useRef(null);
  return (
    <div style={{ position: 'relative', marginBottom: '28px' }}>
      <Search size={16} color="rgba(212,175,55,0.5)"
        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '13px 44px 13px 42px',
          background: '#1a0710', border: '1px solid rgba(212,175,55,0.35)',
          borderRadius: '10px', color: '#fff', fontSize: '14px',
          outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.65)'}
        onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.35)'}
      />
      {value && (
        <button onClick={() => onChange('')}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
          <X size={15} />
        </button>
      )}
    </div>
  );
});

// ─── helpers ─────────────────────────────────────────────────────────────────

const getDescendantIds = (rootId, allCats) => {
  const ids = new Set([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const pid = queue.shift();
    for (const c of allCats) {
      if (c.parent_id === pid && !ids.has(c.id)) { ids.add(c.id); queue.push(c.id); }
    }
  }
  return ids;
};

const getTopLevelId = (catId, allCats) => {
  const cat = allCats.find(c => c.id === catId);
  if (!cat || !cat.parent_id) return catId;
  return getTopLevelId(cat.parent_id, allCats);
};

const KNOWN_PARAMS = new Set(['category', 'scope', 'weight_min', 'weight_max', 'purity', 'q']);

// ─── CollectionsPage ──────────────────────────────────────────────────────────

const CollectionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Core data
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filterAttributes, setFilterAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsappDigits, setWhatsappDigits] = useState('');

  // Navigation
  const [topLevelId, setTopLevelId] = useState(searchParams.get('category') || '');
  const [scopeId, setScopeId] = useState(searchParams.get('scope') || '');

  // Filters — Part 5B: weight stored as string
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '');
  const [weightMin, setWeightMin] = useState(searchParams.get('weight_min') || '');
  const [weightMax, setWeightMax] = useState(searchParams.get('weight_max') || '');
  const [selectedPurities, setSelectedPurities] = useState(() => {
    const p = searchParams.get('purity'); return p ? p.split(',') : [];
  });
  const [attributeFilters, setAttributeFilters] = useState(() => {
    const out = {};
    for (const [k, v] of searchParams.entries()) {
      if (!KNOWN_PARAMS.has(k)) out[k] = v.split(',');
    }
    return out;
  });

  // UI state
  const [imageView, setImageView] = useState('dummy');
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [expandedAttrs, setExpandedAttrs] = useState({});

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Mount: fetch all data
  useEffect(() => {
    (async () => {
      try {
        const [catRes, prodRes, settRes] = await Promise.all([
          categoriesAPI.getAll(false),
          productsAPI.getAll({ limit: 1000 }),
          settingsAPI.getPublic(),
        ]);
        setCategories(catRes.data || []);
        setAllProducts(prodRes.data || []);
        setWhatsappDigits((settRes.data?.whatsapp || '').replace(/\D/g, ''));
      } catch { /* handled — page shows empty state */ }
      finally { setLoading(false); }
    })();
  }, []);

  // Fetch filter attributes when top-level category changes
  useEffect(() => {
    if (!topLevelId) { setFilterAttributes([]); return; }
    categoriesAPI.getFilterAttributes(topLevelId)
      .then(r => setFilterAttributes((r.data || []).filter(a => a.is_active)))
      .catch(() => setFilterAttributes([]));
  }, [topLevelId]);

  // Sync state → URL
  useEffect(() => {
    if (!topLevelId) { setSearchParams({}, { replace: true }); return; }
    const params = { category: topLevelId };
    if (scopeId) params.scope = scopeId;
    if (weightMin) params.weight_min = weightMin;
    if (weightMax) params.weight_max = weightMax;
    if (selectedPurities.length) params.purity = selectedPurities.join(',');
    if (debouncedQuery) params.q = debouncedQuery;
    for (const [k, vals] of Object.entries(attributeFilters)) {
      if (vals.length) params[k] = vals.join(',');
    }
    setSearchParams(params, { replace: true });
  }, [topLevelId, scopeId, weightMin, weightMax, selectedPurities, debouncedQuery, attributeFilters]);

  // Derived data
  const topLevelCats = useMemo(() =>
    categories.filter(c => !c.parent_id && c.is_active).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [categories]
  );

  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c])), [categories]);

  const catProductCount = useMemo(() => {
    const counts = {};
    for (const cat of topLevelCats) {
      const ids = getDescendantIds(cat.id, categories);
      counts[cat.id] = allProducts.filter(p => ids.has(p.category_id)).length;
    }
    return counts;
  }, [topLevelCats, categories, allProducts]);

  const directChildren = useMemo(() =>
    topLevelId ? categories.filter(c => c.parent_id === topLevelId && c.is_active).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [],
    [topLevelId, categories]
  );

  const displayProducts = useMemo(() => {
    if (!topLevelId) return [];
    const rootId = scopeId || topLevelId;
    const scopeIds = getDescendantIds(rootId, categories);
    let list = allProducts.filter(p => scopeIds.has(p.category_id));
    if (weightMin) list = list.filter(p => p.weight >= parseFloat(weightMin));
    if (weightMax) list = list.filter(p => p.weight <= parseFloat(weightMax));
    if (selectedPurities.length) list = list.filter(p => selectedPurities.includes(p.purity));
    for (const [attrName, values] of Object.entries(attributeFilters)) {
      if (values.length) list = list.filter(p => values.includes(p.attribute_values?.[attrName]));
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.item_code || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [topLevelId, scopeId, categories, allProducts, weightMin, weightMax, selectedPurities, attributeFilters, debouncedQuery]);

  const searchResults = useMemo(() => {
    if (!debouncedQuery || topLevelId) return [];
    const q = debouncedQuery.toLowerCase();
    return allProducts.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.item_code || '').toLowerCase().includes(q) ||
      (categoryMap[p.category_id]?.name || '').toLowerCase().includes(q)
    );
  }, [debouncedQuery, topLevelId, allProducts, categoryMap]);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (scopeId && categoryMap[scopeId]) chips.push({ label: `Type: ${categoryMap[scopeId].name}`, clear: () => setScopeId('') });
    for (const [attr, vals] of Object.entries(attributeFilters)) {
      for (const val of vals) chips.push({ label: `${attr}: ${val}`, clear: () => toggleAttributeFilter(attr, val) });
    }
    if (selectedPurities.length) selectedPurities.forEach(p => chips.push({ label: `Purity: ${p.toUpperCase()}`, clear: () => togglePurity(p) }));
    if (weightMin) chips.push({ label: `Min weight: ${weightMin}g`, clear: () => setWeightMin('') });
    if (weightMax) chips.push({ label: `Max weight: ${weightMax}g`, clear: () => setWeightMax('') });
    return chips;
  }, [scopeId, attributeFilters, selectedPurities, weightMin, weightMax, categoryMap]);

  const clearAllFilters = () => {
    setScopeId(''); setWeightMin(''); setWeightMax('');
    setSelectedPurities([]); setAttributeFilters({}); setSearchQuery('');
  };

  const togglePurity = (p) => setSelectedPurities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const toggleAttributeFilter = useCallback((attrName, option) => {
    setAttributeFilters(prev => {
      const current = prev[attrName] || [];
      const updated = current.includes(option) ? current.filter(v => v !== option) : [...current, option];
      return updated.length ? { ...prev, [attrName]: updated } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== attrName));
    });
  }, []);

  const enterCategory = (catId) => {
    setTopLevelId(catId); setScopeId(''); setWeightMin(''); setWeightMax('');
    setSelectedPurities([]); setAttributeFilters({}); setSearchQuery('');
  };

  const backToCategories = () => {
    setTopLevelId(''); setScopeId(''); setWeightMin(''); setWeightMax('');
    setSelectedPurities([]); setAttributeFilters({}); setSearchQuery('');
    setSearchParams({});
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const getProductImage = (product) => {
    if (imageView === 'model') return product.image_model || product.image_dummy || null;
    return product.image_dummy || null;
  };

  // ── Shared product card ──────────────────────────────────────────────────────
  const ProductCard = ({ product, index }) => {
    const img = getProductImage(product);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.3) }}>
        <div className="pcard"
          style={{ position: 'relative', background: '#1a0f12', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s', cursor: 'pointer' }}
          onClick={() => navigate(`/product/${product.id}`)}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(61,8,21,0.55)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ aspectRatio: '4/5', overflow: 'hidden', position: 'relative', background: '#120808' }}>
            {img ? (
              <img className="pcard-img" src={img} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.45s ease' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '52px', color: 'rgba(212,175,55,0.14)' }}>{product.name.charAt(0)}</span>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, #1a0f12 0%, transparent 100%)', pointerEvents: 'none' }} />
            {product.item_code && (
              <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,7,16,0.85)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '4px', padding: '2px 7px', fontSize: '10px', color: '#D4AF37', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
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
            {!topLevelId && categoryMap[product.category_id] && (
              <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.45)', margin: '0 0 4px' }}>{categoryMap[product.category_id].name}</p>
            )}
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(212,175,55,0.52)' }}>
              <span>{product.weight} g</span>
              <span>{product.purity?.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ── CATEGORY GRID VIEW ───────────────────────────────────────────────────────
  if (!topLevelId) {
    const showSearch = debouncedQuery.length > 0 && !loading;
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>Explore</p>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>Our Collections</h1>
            <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto' }} />
          </div>

          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {[1,2,3,4].map(i => <div key={i} style={{ aspectRatio: '3/4', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'skelPulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : showSearch ? (
            <>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>
                Found <strong style={{ color: '#D4AF37' }}>{searchResults.length}</strong> item{searchResults.length !== 1 ? 's' : ''} for "{debouncedQuery}"
              </p>
              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.35)' }}>
                  <p style={{ fontSize: '18px', fontFamily: 'Georgia, serif' }}>No items found.</p>
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>Try a different search term.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {searchResults.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              )}
            </>
          ) : topLevelCats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.35)' }}>
              <p style={{ fontSize: '18px', fontFamily: 'Georgia, serif' }}>No collections available yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {topLevelCats.map((cat, i) => (
                <motion.div key={cat.id} className="cat-card"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={() => enterCategory(cat.id)}
                  style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'rgba(212,175,55,0.06)' }}>
                    {cat.display_image ? (
                      <img className="cat-media" src={cat.display_image} alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)', display: 'block', transition: 'transform 0.55s ease' }} />
                    ) : (
                      <div className="cat-media" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(128,0,32,0.1) 100%)', transition: 'transform 0.55s ease' }}>
                        <span style={{ fontSize: '56px', fontFamily: 'Georgia, serif', color: 'rgba(212,175,55,0.25)' }}>{cat.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 45%, transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '22px 20px' }}>
                    <h2 style={{ fontSize: '19px', fontFamily: 'Georgia, serif', color: '#D4AF37', margin: '0 0 5px' }}>{cat.name}</h2>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.48)', margin: 0 }}>
                      {catProductCount[cat.id] || 0} piece{(catProductCount[cat.id] || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <style>{`
          .cat-card:hover .cat-media { transform: scale(1.06); }
          .pcard:hover .pcard-img { transform: scale(1.05); }
          @keyframes skelPulse { 0%,100%{opacity:1}50%{opacity:0.45} }
        `}</style>
      </div>
    );
  }

  // ── CATEGORY LANDING VIEW ────────────────────────────────────────────────────
  const selectedCat = categoryMap[topLevelId];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={backToCategories}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,175,55,0.65)'}>
            <ArrowLeft size={14} /> Back to Collections
          </button>
          <button onClick={() => setShowShareModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 14px', background: 'transparent', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', color: 'rgba(212,175,55,0.65)', fontSize: '12px', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.color = '#D4AF37'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; e.currentTarget.style.color = 'rgba(212,175,55,0.65)'; }}>
            <Share2 size={13} /> Share this view
          </button>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Georgia, serif', fontWeight: 400, color: '#fff', margin: 0 }}>
            {selectedCat?.name || 'Collection'}
          </h1>
          <div style={{ width: '32px', height: '1px', background: '#D4AF37', marginTop: '12px' }} />
        </div>

        {/* Shop by Type shortcuts */}
        {directChildren.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', marginBottom: '12px' }}>Shop by Type</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setScopeId('')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${!scopeId ? '#D4AF37' : 'rgba(212,175,55,0.25)'}`, background: !scopeId ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)', color: !scopeId ? '#D4AF37' : 'rgba(255,255,255,0.55)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.18s' }}>
                All
              </button>
              {directChildren.map(child => (
                <button key={child.id} onClick={() => setScopeId(child.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${scopeId === child.id ? '#D4AF37' : 'rgba(212,175,55,0.2)'}`, background: scopeId === child.id ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.02)', color: scopeId === child.id ? '#D4AF37' : 'rgba(255,255,255,0.55)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.18s' }}>
                  {child.display_image && <img src={child.display_image} alt={child.name} style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '4px' }} />}
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dummy/Model toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '3px', marginBottom: '20px' }}>
          {['dummy', 'model'].map(v => (
            <button key={v} onClick={() => setImageView(v)}
              style={{ padding: '6px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', background: imageView === v ? '#D4AF37' : 'transparent', color: imageView === v ? '#000' : 'rgba(212,175,55,0.6)' }}>
              {v === 'dummy' ? 'Item view' : 'Model view'}
            </button>
          ))}
        </div>

        {/* Search bar in products view */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name or item code..." />

        {/* Active chips */}
        {activeChips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', marginTop: '-8px' }}>
            {activeChips.map((chip, i) => (
              <button key={i} onClick={chip.clear}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', color: '#D4AF37', fontSize: '12px', cursor: 'pointer' }}>
                {chip.label} <X size={11} />
              </button>
            ))}
            <button onClick={clearAllFilters}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer' }}>
              Clear all
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
          {/* Filter sidebar */}
          <div style={{ width: '210px', flexShrink: 0, position: 'sticky', top: '88px', overflowX: 'hidden' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Filter size={14} color="#D4AF37" />
                <span style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 600 }}>Filters</span>
              </div>

              {/* Dynamic attribute filters */}
              {filterAttributes.map(attr => {
                const selected = attributeFilters[attr.name] || [];
                const isExpanded = expandedAttrs[attr.id];
                const visibleCount = attr.visible_options_count || 6;
                const opts = attr.options || [];
                const shown = isExpanded ? opts : opts.slice(0, visibleCount);
                return (
                  <div key={attr.id} style={{ marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: 0, flex: 1 }}>
                        {attr.display_name || attr.name}
                      </p>
                      {attr.description && (
                        <span title={attr.description} style={{ cursor: 'help' }}><Info size={11} color="rgba(255,255,255,0.25)" /></span>
                      )}
                    </div>
                    {shown.map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggleAttributeFilter(attr.name, opt)}
                          style={{ accentColor: '#D4AF37', width: '13px', height: '13px' }} />
                        <span style={{ fontSize: '13px', color: selected.includes(opt) ? '#D4AF37' : 'rgba(255,255,255,0.6)' }}>{opt}</span>
                      </label>
                    ))}
                    {opts.length > visibleCount && (
                      <button onClick={() => setExpandedAttrs(p => ({ ...p, [attr.id]: !isExpanded }))}
                        style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isExpanded ? <><ChevronUp size={12} />Show less</> : <><ChevronDown size={12} />+{opts.length - visibleCount} more</>}
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Weight */}
              <div style={{ marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', margin: '0 0 10px' }}>Weight (g)</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" inputMode="decimal" placeholder="Min" value={weightMin}
                    onChange={e => setWeightMin(e.target.value)}
                    style={{ flex: 1, minWidth: 0, width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '6px', color: '#D4AF37', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                  <input type="text" inputMode="decimal" placeholder="Max" value={weightMax}
                    onChange={e => setWeightMax(e.target.value)}
                    style={{ flex: 1, minWidth: 0, width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '6px', color: '#D4AF37', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Purity */}
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', margin: '0 0 10px' }}>Purity</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['24k','22k','18k'].map(p => (
                    <button key={p} onClick={() => togglePurity(p)}
                      style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${selectedPurities.includes(p) ? '#D4AF37' : 'rgba(212,175,55,0.25)'}`, background: selectedPurities.includes(p) ? '#D4AF37' : 'transparent', color: selectedPurities.includes(p) ? '#000' : 'rgba(212,175,55,0.7)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s' }}>
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {[1,2,3,4,5,6].map(i => <div key={i} style={{ aspectRatio: '4/5', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'skelPulse 1.5s ease-in-out infinite' }} />)}
              </div>
            ) : displayProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif' }}>No products match these filters.</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.22)', marginTop: '8px' }}>Try removing some filters.</p>
                {activeChips.length > 0 && (
                  <button onClick={clearAllFilters} style={{ marginTop: '16px', padding: '8px 20px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: '#D4AF37', fontSize: '13px', cursor: 'pointer' }}>
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
                  {displayProducts.length} piece{displayProducts.length !== 1 ? 's' : ''}
                  {debouncedQuery ? ` matching "${debouncedQuery}"` : ''}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {displayProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={e => e.target === e.currentTarget && setShowShareModal(false)}>
            <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
              style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '14px', padding: '28px', maxWidth: '440px', width: '100%' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#D4AF37', margin: 0 }}>Share this view</h2>
                <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{window.location.href}</span>
                <button onClick={copyShareLink} style={{ background: 'none', border: 'none', color: linkCopied ? '#4ade80' : '#D4AF37', cursor: 'pointer', padding: '2px' }}><Copy size={16} /></button>
              </div>
              {linkCopied && <p style={{ fontSize: '12px', color: '#4ade80', marginBottom: '12px', textAlign: 'center' }}>Copied!</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hi, here are some items from our collection: ${window.location.href}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#22c55e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
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
        .cat-card:hover .cat-media { transform: scale(1.06); }
        .pcard:hover .pcard-img { transform: scale(1.05); }
        @keyframes skelPulse { 0%,100%{opacity:1}50%{opacity:0.45} }
      `}</style>
    </div>
  );
};

export default CollectionsPage;
