import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { heroAPI } from '../api';

// ─── Pulse dot with hover card ───────────────────────────────────────────────

function PulseDot({ label, meta, productId, style }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (productId) navigate(`/products/${productId}`);
    else navigate('/collections');
  };

  return (
    <div
      style={{ position: 'absolute', ...style }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={handleClick}
    >
      {/* Pulsing ring */}
      <span style={{
        position: 'absolute', inset: -8,
        borderRadius: '50%',
        border: '1.5px solid rgba(212,175,55,0.5)',
        animation: 'heroPulse 2s ease-out infinite',
        pointerEvents: 'none',
      }} />
      {/* Dot */}
      <div style={{
        width: 16, height: 16,
        borderRadius: '50%',
        background: '#D4AF37',
        cursor: 'pointer',
        boxShadow: '0 0 0 3px rgba(212,175,55,0.3)',
        position: 'relative', zIndex: 1,
      }} />
      {/* Hover card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', bottom: 28, left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15,8,16,0.92)',
              border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: 10,
              padding: '10px 16px',
              whiteSpace: 'nowrap',
              minWidth: 140,
              zIndex: 10,
            }}
          >
            <div style={{ color: '#D4AF37', fontSize: 13, fontWeight: 600 }}>{label}</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>{meta}</div>
            <div style={{ color: '#D4AF37', fontSize: 11, marginTop: 6 }}>Discover →</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const BG = 'linear-gradient(135deg, #1a0710 0%, #0f0810 50%, #3d0815 100%)';

export default function CinematicHero() {
  const heroRef = useRef(null);
  const [hero, setHero] = useState(null);
  const [spotX, setSpotX] = useState(0);
  const [spotY, setSpotY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fetch hero content
  useEffect(() => {
    heroAPI.getPublic()
      .then(r => setHero(r.data))
      .catch(() => setHero({}));
  }, []);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Mouse spotlight (desktop) / auto-pan (mobile)
  const onMouseMove = useCallback((e) => {
    if (!heroRef.current || prefersReduced) return;
    const rect = heroRef.current.getBoundingClientRect();
    setSpotX(e.clientX - rect.left);
    setSpotY(e.clientY - rect.top);
  }, [prefersReduced]);

  useEffect(() => {
    if (!isMobile || prefersReduced) return;
    let angle = 0;
    const id = setInterval(() => {
      angle += 0.012;
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setSpotX(rect.width / 2 + Math.cos(angle) * rect.width * 0.3);
      setSpotY(rect.height / 2 + Math.sin(angle) * rect.height * 0.25);
    }, 30);
    return () => clearInterval(id);
  }, [isMobile, prefersReduced]);

  // Scroll-driven transforms
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Piece 1: visible 0→0.48, fades/lifts out 0.25→0.52
  const piece1Opacity = useTransform(scrollYProgress, [0, 0.25, 0.52], [1, 1, 0]);
  const piece1Y = useTransform(scrollYProgress, [0.25, 0.52], ['0%', '-12%']);

  // Piece 2: slides in from right 0.30→0.50, fades out 0.62→0.78
  const piece2Opacity = useTransform(scrollYProgress, [0.30, 0.50, 0.62, 0.78], [0, 1, 1, 0]);
  const piece2X = useTransform(scrollYProgress, [0.30, 0.50], ['18%', '0%']);

  // Model image: fades in 0.62→0.78
  const modelOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1]);

  // Tagline: fades out 0.45→0.65
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.45, 0.65], [1, 1, 0]);
  const taglineY = useTransform(scrollYProgress, [0.45, 0.65], ['0%', '-8%']);

  // Pulse dots: appear with model
  const dotsOpacity = useTransform(scrollYProgress, [0.72, 0.85], [0, 1]);

  // Scroll hint: fades out as soon as user starts scrolling
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const hasImages = hero && (hero.piece1_image || hero.piece2_image || hero.model_image);

  if (!hero) return null;

  // ── No images: compact static tagline hero ──
  if (!hasImages) {
    return (
      <>
        <style>{`
          @keyframes heroPulse {
            0%   { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(2.4); opacity: 0; }
          }
        `}</style>
        <div style={{
          height: '100vh', background: BG,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 24px',
        }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            color: '#D4AF37',
            fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            {hero.tagline_main || 'Crafted with Devotion'}
          </div>
          <div style={{
            marginTop: 16,
            color: 'rgba(255,255,255,0.55)',
            fontSize: 'clamp(1rem, 2vw, 1.4rem)',
            fontStyle: 'italic',
            letterSpacing: '0.04em',
          }}>
            {hero.tagline_sub || 'Heritage. Artistry. Intimacy.'}
          </div>
        </div>
      </>
    );
  }

  // ── Reduced motion: static layout ──
  if (prefersReduced) {
    return (
      <>
        <style>{`@keyframes heroPulse { 0% { opacity:0.8;transform:scale(1);} 100%{opacity:0;transform:scale(2.4);}}`}</style>
        <div style={{
          height: '100vh', background: BG, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {hero.model_image && (
            <img src={hero.model_image} alt="Model"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
          )}
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
            <div style={{ fontFamily: 'Georgia,serif', color: '#D4AF37', fontSize: 'clamp(2.5rem,5.5vw,5rem)', lineHeight: 1.15 }}>
              {hero.tagline_main || 'Crafted with Devotion'}
            </div>
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(1rem,2vw,1.4rem)', fontStyle: 'italic' }}>
              {hero.tagline_sub || 'Heritage. Artistry. Intimacy.'}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Full cinematic scroll-driven hero ──
  return (
    <>
      <style>{`
        @keyframes heroPulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      {/* Scroll container — 150vh so sticky inner sticks for scroll travel */}
      <div ref={heroRef} style={{ height: '150vh', position: 'relative' }}>
        <div style={{
          position: 'sticky', top: 0,
          height: '100vh', overflow: 'hidden',
          background: BG,
        }}
          onMouseMove={onMouseMove}
        >
          {/* Mouse spotlight */}
          {!prefersReduced && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
              background: `radial-gradient(circle 320px at ${spotX}px ${spotY}px, rgba(212,175,55,0.13), transparent 70%)`,
              transition: 'background 0.1s ease',
            }} />
          )}

          {/* Phase 1: Piece 1 — centre-left */}
          {hero.piece1_image && (
            <motion.div style={{
              position: 'absolute', zIndex: 2,
              left: isMobile ? '50%' : '22%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: piece1Opacity,
              y: piece1Y,
              width: isMobile ? '70vw' : '32vw',
              maxWidth: 480,
            }}>
              <img
                src={hero.piece1_image} alt="Featured piece"
                style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 40px rgba(212,175,55,0.25))' }}
              />
            </motion.div>
          )}

          {/* Phase 2: Piece 2 — slides in from right */}
          {hero.piece2_image && (
            <motion.div style={{
              position: 'absolute', zIndex: 3,
              right: isMobile ? '50%' : '10%',
              top: '50%',
              transform: isMobile ? 'translate(50%, -50%)' : 'translateY(-50%)',
              opacity: piece2Opacity,
              x: piece2X,
              width: isMobile ? '60vw' : '28vw',
              maxWidth: 400,
            }}>
              <img
                src={hero.piece2_image} alt="Featured piece 2"
                style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 40px rgba(212,175,55,0.2))' }}
              />
            </motion.div>
          )}

          {/* Phase 3: Model image + pulse dots */}
          {hero.model_image && (
            <motion.div style={{
              position: 'absolute', inset: 0, zIndex: 2,
              opacity: modelOpacity,
            }}>
              <img
                src={hero.model_image} alt="Model wearing jewellery"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
              />
              {/* Dark overlay for readability */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)',
              }} />
            </motion.div>
          )}

          {/* Pulse dots (only when model is visible) */}
          <motion.div style={{ position: 'absolute', inset: 0, zIndex: 5, opacity: dotsOpacity, pointerEvents: 'none' }}>
            <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
              {hero.dot1_label && (
                <PulseDot
                  label={hero.dot1_label}
                  meta={hero.dot1_meta}
                  productId={hero.dot1_product_id}
                  style={{ left: isMobile ? '30%' : '28%', top: isMobile ? '35%' : '40%' }}
                />
              )}
              {hero.dot2_label && (
                <PulseDot
                  label={hero.dot2_label}
                  meta={hero.dot2_meta}
                  productId={hero.dot2_product_id}
                  style={{ left: isMobile ? '60%' : '55%', top: isMobile ? '50%' : '45%' }}
                />
              )}
              {hero.dot3_label && (
                <PulseDot
                  label={hero.dot3_label}
                  meta={hero.dot3_meta}
                  productId={hero.dot3_product_id}
                  style={{ left: isMobile ? '45%' : '40%', top: isMobile ? '68%' : '65%' }}
                />
              )}
            </motion.div>
          </motion.div>

          {/* Tagline — always centred, fades out in phase 3 */}
          <motion.div style={{
            position: 'absolute', zIndex: 6,
            bottom: isMobile ? '10%' : '12%',
            left: 0, right: 0,
            textAlign: 'center',
            padding: '0 24px',
            opacity: taglineOpacity,
            y: taglineY,
          }}>
            <div style={{
              fontFamily: 'Georgia, serif',
              color: '#D4AF37',
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 20px rgba(0,0,0,0.6)',
            }}>
              {hero.tagline_main || 'Crafted with Devotion'}
            </div>
            <div style={{
              marginTop: 12,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.3rem)',
              fontStyle: 'italic',
              letterSpacing: '0.05em',
              textShadow: '0 1px 10px rgba(0,0,0,0.5)',
            }}>
              {hero.tagline_sub || 'Heritage. Artistry. Intimacy.'}
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            style={{
              position: 'absolute', bottom: 28, left: '50%',
              transform: 'translateX(-50%)', zIndex: 7,
              opacity: scrollHintOpacity,
            }}
          >
            <div style={{
              width: 1, height: 48,
              background: 'linear-gradient(to bottom, rgba(212,175,55,0.7), transparent)',
              margin: '0 auto',
            }} />
            <div style={{
              color: 'rgba(212,175,55,0.6)', fontSize: 10,
              letterSpacing: '0.15em', marginTop: 6, textAlign: 'center',
            }}>SCROLL</div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
