import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gemstonesAPI, spiritualArticleTypesAPI, spiritualInquiriesAPI } from '../api';
import { Sparkles, X, Send, Check, Calendar, Star, Globe, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserPhone } from '../contexts/UserPhoneContext';
import { RASHI_LIST, PLANETS_LIST, MONTH_NAMES, RASHI_DEVANAGARI } from '../utils/astrologyMap';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PLANET_SYMBOLS = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const MODE_CARDS = [
  { key: 'month',  Icon: Calendar,   label: 'By Birth Month',         sub: 'Western birthstone — not Vedic Rashi' },
  { key: 'rashi',  Icon: Star,       label: 'By Vedic Rashi',         sub: 'Mesh, Karka, Simha...' },
  { key: 'planet', Icon: Globe,      label: 'By Planet (Graha)',      sub: 'Sun, Moon, Mars, Rahu...' },
  { key: 'all',    Icon: LayoutGrid, label: 'Browse All Gemstones',   sub: 'See the full collection' },
];

const Chip = ({ label, sub, active, onClick }) => (
  <button onClick={onClick}
    style={{
      padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', textAlign: 'center',
      border: `1px solid ${active ? '#D4AF37' : 'rgba(255,255,255,0.15)'}`,
      background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
      color: active ? '#D4AF37' : 'rgba(255,255,255,0.55)',
      fontSize: '13px', fontWeight: active ? 600 : 400, transition: 'all 0.15s',
    }}>
    {label}
    {sub && <span style={{ display: 'block', fontSize: '10px', color: active ? 'rgba(212,175,55,0.7)' : 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{sub}</span>}
  </button>
);

const StepBadge = ({ num, done }) => (
  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? '#D4AF37' : 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: done ? '#000' : '#D4AF37', flexShrink: 0 }}>
    {done ? <Check size={14} /> : num}
  </div>
);

const GemstoneCard = ({ gem, active, onClick, hoveredId, setHoveredId, hideVedicBadges = false }) => {
  const isHovered = hoveredId === gem.id;
  return (
    <motion.div whileHover={{ scale: 1.02 }} onClick={() => onClick(gem)}
      onMouseEnter={() => setHoveredId(gem.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{ cursor: 'pointer', background: active ? 'rgba(212,175,55,0.1)' : '#1a0f12', border: `2px solid ${active ? '#D4AF37' : 'rgba(212,175,55,0.15)'}`, borderRadius: '12px', overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}>

      {active && (
        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <Check size={12} color="#000" />
        </div>
      )}

      {/* Image / color swatch */}
      {gem.image ? (
        <img src={gem.image} alt={gem.name} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ height: '100px', background: gem.color_hex ? `${gem.color_hex}22` : 'rgba(212,175,55,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {gem.color_hex && <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: gem.color_hex, opacity: 0.9, boxShadow: `0 0 20px ${gem.color_hex}44` }} />}
        </div>
      )}

      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          {gem.color_hex && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: gem.color_hex, flexShrink: 0 }} />}
          <p style={{ fontSize: '13px', color: active ? '#D4AF37' : '#fff', fontWeight: 600, margin: 0 }}>{gem.name}</p>
        </div>

        {/* Planet badges — hidden in Western birth-month mode */}
        {!hideVedicBadges && (gem.planets || []).length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
            {gem.planets.slice(0, 2).map(p => (
              <span key={p} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.8)', border: '1px solid rgba(212,175,55,0.2)' }}>
                {PLANET_SYMBOLS[p] || ''} {p}
              </span>
            ))}
          </div>
        )}

        {/* Properties excerpt on hover */}
        <AnimatePresence>
          {isHovered && gem.properties && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0', lineHeight: 1.5, overflow: 'hidden' }}>
              {gem.properties.slice(0, 80)}…
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SpiritualPage = () => {
  const [gemstones, setGemstones] = useState([]);
  const [articleTypes, setArticleTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gemstone picker state
  const [pickerMode, setPickerMode] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedRashi, setSelectedRashi] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Selection state
  const [selectedGemstone, setSelectedGemstone] = useState(null);
  const [step1Collapsed, setStep1Collapsed] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Contact form
  const { phone: contextPhone } = useUserPhone();
  const [form, setForm] = useState({ customer_name: '', customer_phone: contextPhone || '', customer_email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState(null);

  useEffect(() => {
    Promise.all([gemstonesAPI.getAll(), spiritualArticleTypesAPI.getAll()])
      .then(([gRes, aRes]) => {
        setGemstones(gRes.data || []);
        setArticleTypes(aRes.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // ── Filtered gemstones based on mode ────────────────────────────────────
  const getFilteredGemstones = () => {
    if (!pickerMode || pickerMode === 'all') return gemstones;
    if (pickerMode === 'month' && selectedMonth !== null) {
      return gemstones.filter(g => (g.birth_months || []).includes(selectedMonth));
    }
    if (pickerMode === 'rashi' && selectedRashi) {
      return gemstones.filter(g => (g.vedic_rashi || []).includes(selectedRashi));
    }
    if (pickerMode === 'planet' && selectedPlanet) {
      return gemstones.filter(g => (g.planets || []).includes(selectedPlanet));
    }
    return [];
  };

  const showGemstoneList = pickerMode === 'all' ||
    (pickerMode === 'month' && selectedMonth !== null) ||
    (pickerMode === 'rashi' && selectedRashi !== null) ||
    (pickerMode === 'planet' && selectedPlanet !== null);

  const filteredGemstones = showGemstoneList ? getFilteredGemstones() : [];

  const handleSelectGemstone = (gem) => {
    if (selectedGemstone?.id === gem.id) {
      setSelectedGemstone(null);
      setStep1Collapsed(false);
    } else {
      setSelectedGemstone(gem);
      setStep1Collapsed(true);
    }
  };

  const handleChangeGemstone = () => {
    setSelectedGemstone(null);
    setStep1Collapsed(false);
  };

  const handleChangeMode = (mode) => {
    setPickerMode(mode);
    setSelectedMonth(null);
    setSelectedRashi(null);
    setSelectedPlanet(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim()) { toast.error('Name is required'); return; }
    const digits = form.customer_phone.replace(/\D/g, '');
    if (digits.length < 10) { toast.error('Please enter a valid phone number'); return; }
    setSubmitting(true);
    try {
      const res = await spiritualInquiriesAPI.create({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim() || undefined,
        selected_gemstone_id: selectedGemstone?.id || undefined,
        selected_article_type_id: selectedArticle?.id || undefined,
        notes: form.notes.trim() || undefined,
      });
      setSuccessRef(res.data?.reference_code || 'SPIRIT-NEW');
    } catch { toast.error('Error submitting inquiry. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const inpCls = { width: '100%', padding: '11px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  // ── Success ──────────────────────────────────────────────────────────────
  if (successRef) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 32px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Sparkles size={34} color="#D4AF37" />
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#D4AF37', marginBottom: '12px' }}>Inquiry Received!</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', marginBottom: '24px', lineHeight: 1.8 }}>
            Thank you! We'll craft a custom piece based on your selection. We'll contact you within 24 hours.
          </p>
          <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '16px 24px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Your Reference</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.1em' }}>{successRef}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', paddingTop: '100px', paddingBottom: '80px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '0 clamp(16px, 4vw, 32px)', marginBottom: '56px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Sparkles size={26} color="#D4AF37" />
        </div>
        <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: '12px' }}>MBJ Jewellers</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>Spiritual & Astrological Jewellery</h1>
        <div style={{ width: '40px', height: '1px', background: '#D4AF37', margin: '0 auto 20px' }} />
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.8 }}>
          Choose your gemstone by Vedic system, birth date, or planet — and let us craft a sacred piece aligned with your energy.
        </p>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>

        {/* Progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', justifyContent: 'center' }}>
          {[['1', 'Gemstone', selectedGemstone], ['2', 'Article', selectedArticle], ['3', 'Details', null]].map(([num, label, done], i) => (
            <React.Fragment key={num}>
              {i > 0 && <div style={{ flex: 1, maxWidth: '60px', height: '1px', background: done || (i === 1 && selectedGemstone) ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)' }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StepBadge num={num} done={Boolean(done)} />
                <span style={{ fontSize: '12px', color: done ? '#D4AF37' : 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading...</div>
        ) : (
          <>
            {/* ── STEP 1 — Gemstone picker ─────────────────────────────────────── */}
            <div style={{ marginBottom: '52px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <StepBadge num="1" done={Boolean(selectedGemstone)} />
                <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 600, margin: 0 }}>
                  {selectedGemstone ? 'Your Gemstone' : 'Choose Your Gemstone'}
                </h2>
                {selectedGemstone && (
                  <button onClick={handleChangeGemstone}
                    style={{ marginLeft: 'auto', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer' }}>
                    Change
                  </button>
                )}
              </div>

              {/* Selected gemstone summary */}
              {step1Collapsed && selectedGemstone ? (
                <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {selectedGemstone.image
                    ? <img src={selectedGemstone.image} alt={selectedGemstone.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                    : selectedGemstone.color_hex
                      ? <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: selectedGemstone.color_hex, flexShrink: 0 }} />
                      : null}
                  <div>
                    <p style={{ fontSize: '16px', color: '#D4AF37', fontWeight: 600, margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>{selectedGemstone.name}</p>
                    {(selectedGemstone.planets || []).length > 0 && (
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>
                        {selectedGemstone.planets.map(p => `${PLANET_SYMBOLS[p]} ${p}`).join(' · ')}
                      </p>
                    )}
                    {selectedGemstone.wearing_finger && (
                      <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.65)', margin: 0, fontStyle: 'italic' }}>
                        Worn on: {selectedGemstone.wearing_finger}
                      </p>
                    )}
                  </div>
                  <Check size={20} color="#D4AF37" style={{ marginLeft: 'auto' }} />
                </div>
              ) : (
                <>
                  {/* Mode cards */}
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px', letterSpacing: '0.06em' }}>
                      How would you like to find your gemstone?
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                      {MODE_CARDS.map(({ key, Icon, label, sub }) => {
                        const active = pickerMode === key;
                        return (
                          <button key={key} onClick={() => handleChangeMode(key)}
                            style={{ padding: '14px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', border: `1px solid ${active ? '#D4AF37' : 'rgba(255,255,255,0.12)'}`, background: active ? 'rgba(212,175,55,0.1)' : '#1a0f12', transition: 'all 0.2s' }}>
                            <Icon size={18} color={active ? '#D4AF37' : 'rgba(255,255,255,0.4)'} style={{ marginBottom: '8px' }} />
                            <p style={{ fontSize: '13px', color: active ? '#D4AF37' : '#fff', fontWeight: 600, margin: '0 0 3px' }}>{label}</p>
                            <p style={{ fontSize: '11px', color: active ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.3)', margin: 0 }}>{sub}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mode-specific selector */}
                  <AnimatePresence>
                    {pickerMode && pickerMode !== 'all' && (
                      <motion.div key={pickerMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ marginBottom: '20px', padding: '18px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.1)' }}>

                        {pickerMode === 'month' && (
                          <>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Select your birth month:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {MONTH_SHORT.map((m, i) => (
                                <Chip key={i} label={m} active={selectedMonth === i + 1} onClick={() => setSelectedMonth(selectedMonth === i + 1 ? null : i + 1)} />
                              ))}
                            </div>
                          </>
                        )}

                        {pickerMode === 'rashi' && (
                          <>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Select your Vedic Rashi:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {RASHI_LIST.map(r => (
                                <Chip key={r} label={r} sub={RASHI_DEVANAGARI[r]} active={selectedRashi === r} onClick={() => setSelectedRashi(selectedRashi === r ? null : r)} />
                              ))}
                            </div>
                          </>
                        )}

                        {pickerMode === 'planet' && (
                          <>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Select the planet recommended by your astrologer:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {PLANETS_LIST.map(p => (
                                <Chip key={p} label={`${PLANET_SYMBOLS[p]} ${p}`} active={selectedPlanet === p} onClick={() => setSelectedPlanet(selectedPlanet === p ? null : p)} />
                              ))}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Gemstone grid */}
                  {showGemstoneList && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {pickerMode === 'month' && selectedMonth && (
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px', lineHeight: 1.6, fontStyle: 'italic' }}>
                          Showing Western birthstones for {MONTH_NAMES[selectedMonth - 1]}.
                          For Vedic recommendations, use <strong style={{ color: 'rgba(212,175,55,0.7)', fontStyle: 'normal' }}>Rashi</strong> or <strong style={{ color: 'rgba(212,175,55,0.7)', fontStyle: 'normal' }}>Planet</strong> mode — your astrologer can tell you yours.
                        </p>
                      )}

                      {filteredGemstones.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p style={{ fontStyle: 'italic', marginBottom: '8px' }}>
                            No gemstones found for this selection.
                          </p>
                          <button onClick={() => handleChangeMode('all')}
                            style={{ padding: '7px 18px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.4)', background: 'transparent', color: '#D4AF37', fontSize: '12px', cursor: 'pointer' }}>
                            Browse All Gemstones
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '14px' }}>
                          {filteredGemstones.map(g => (
                            <GemstoneCard key={g.id} gem={g} active={selectedGemstone?.id === g.id}
                              onClick={handleSelectGemstone} hoveredId={hoveredId} setHoveredId={setHoveredId}
                              hideVedicBadges={pickerMode === 'month'} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* ── STEP 2 — Article Types ────────────────────────────────────────── */}
            <AnimatePresence>
              {selectedGemstone && (
                <motion.div key="step2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '52px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <StepBadge num="2" done={Boolean(selectedArticle)} />
                    <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 600 }}>Choose Article Type</h2>
                  </div>
                  {articleTypes.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: '14px' }}>Article types coming soon.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                      {articleTypes.map(at => {
                        const active = selectedArticle?.id === at.id;
                        return (
                          <motion.div key={at.id} whileHover={{ scale: 1.03 }} onClick={() => setSelectedArticle(active ? null : at)}
                            style={{ cursor: 'pointer', background: active ? 'rgba(212,175,55,0.12)' : '#1a0f12', border: `2px solid ${active ? '#D4AF37' : 'rgba(212,175,55,0.15)'}`, borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                            {active && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><Check size={12} color="#000" /></div>}
                            {at.image ? (
                              <img src={at.image} alt={at.name} style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }} />
                            ) : (
                              <div style={{ height: '90px', background: 'rgba(212,175,55,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={28} color="rgba(212,175,55,0.3)" />
                              </div>
                            )}
                            <div style={{ padding: '10px' }}>
                              <p style={{ fontSize: '13px', color: active ? '#D4AF37' : '#fff', fontWeight: 600, margin: 0 }}>{at.name}</p>
                              {at.description && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '3px 0 0', lineHeight: 1.4 }}>{at.description}</p>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── STEP 3 — Contact form ─────────────────────────────────────────── */}
            <AnimatePresence>
              {selectedGemstone && selectedArticle && (
                <motion.div key="step3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: '#1a0f12', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <StepBadge num="3" done={false} />
                    <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 600 }}>Tell Us More</h2>
                  </div>

                  {/* Selection summary */}
                  <div style={{ background: 'rgba(212,175,55,0.06)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                    <strong style={{ color: '#D4AF37' }}>{selectedGemstone.name}</strong>
                    {selectedGemstone.wearing_finger && (
                      <span style={{ color: 'rgba(212,175,55,0.6)', fontStyle: 'italic' }}> · Worn on: {selectedGemstone.wearing_finger}</span>
                    )}
                    {' · '}
                    <strong style={{ color: '#D4AF37' }}>{selectedArticle.name}</strong>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Your Name *</label>
                      <input type="text" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} style={inpCls} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Phone Number *</label>
                      <input type="tel" value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} style={inpCls} placeholder="+91 XXXXX XXXXX" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Email <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
                      <input type="email" value={form.customer_email} onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))} style={inpCls} placeholder="your@email.com" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Additional Notes <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
                      <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={inpCls} placeholder="Any special requirements..." />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" disabled={submitting}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px', background: submitting ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                        <Send size={18} />
                        {submitting ? 'Submitting...' : 'Submit Inquiry'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Persistent disclaimer */}
      <div style={{ maxWidth: '960px', margin: '48px auto 0', padding: '0 24px' }}>
        <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.45)', fontStyle: 'italic', lineHeight: 1.8, textAlign: 'center' }}>
          Vedic astrology recommendations require your complete birth chart (date, time, and place of birth).
          The Birth Month mode follows Western birthstone tradition. For exact Vedic gemstone advice, please consult an astrologer.
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .spirit-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important; }
        }
      `}</style>
    </div>
  );
};

export default SpiritualPage;
