import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSlideshow = ({ settings }) => {
  const navigate = useNavigate();
  const slides = settings?.hero_slides?.length > 0 ? settings.hero_slides : null;
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef([]);
  const timerRef = useRef(null);

  // Auto-advance timer for image slides in a multi-slide show
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const slide = slides[current];
    if (slide?.media_type !== 'video') {
      timerRef.current = setTimeout(() => {
        setCurrent(i => (i + 1) % slides.length);
      }, 6000);
    }
    return () => clearTimeout(timerRef.current);
  }, [current, slides]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync video playback when active slide changes
  useEffect(() => {
    videoRefs.current.forEach((ref, i) => {
      if (!ref) return;
      if (i === current) {
        ref.currentTime = 0;
        ref.play().catch(() => {});
      } else {
        ref.pause();
      }
    });
  }, [current]);

  const handleSlideClick = (slide) => {
    const lt = slide?.link_type;
    const lv = slide?.link_value;
    if (!lt || lt === 'none' || !lv) return;
    if (lt === 'product') navigate(`/product/${lv}`);
    else if (lt === 'category') navigate(`/collections?category=${lv}`);
    else if (lt === 'url') window.open(lv, '_blank', 'noopener,noreferrer');
  };

  const hasText = settings?.hero_heading || settings?.hero_subheading || settings?.hero_cta_text;

  const textOverlay = (
    <>
      {hasText && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(26,7,16,0.6) 100%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{ textAlign: 'center', padding: '0 32px', maxWidth: '700px', pointerEvents: 'auto' }}>
          {settings?.hero_heading && (
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.8rem)',
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 400, color: '#fff',
              marginBottom: '16px', lineHeight: 1.15,
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}>
              {settings.hero_heading}
            </h1>
          )}
          {settings?.hero_subheading && (
            <p style={{
              fontSize: '16px', color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.8, marginBottom: '36px',
              fontStyle: 'italic',
              textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            }}>
              {settings.hero_subheading}
            </p>
          )}
          {settings?.hero_cta_text && (
            <Link
              to={settings.hero_cta_link || '/collections'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 34px',
                border: '1px solid rgba(212,175,55,0.6)',
                color: '#D4AF37', textDecoration: 'none',
                fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
                background: 'rgba(212,175,55,0.05)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.05)'; }}
            >
              {settings.hero_cta_text} <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </>
  );

  const containerStyle = {
    position: 'relative',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    background: '#1a0710',
  };

  // No media — dark bg with text only
  if (!slides && !settings?.hero_image_url) {
    return (
      <section style={containerStyle}>
        {textOverlay}
      </section>
    );
  }

  // Backward-compat: single fallback image
  if (!slides) {
    return (
      <section style={containerStyle}>
        <img
          src={settings.hero_image_url}
          alt="Hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,7,16,0.5)' }} />
        {textOverlay}
      </section>
    );
  }

  // Slideshow
  const isSingleVideo = slides.length === 1 && slides[0].media_type === 'video';

  return (
    <section style={containerStyle}>
      {slides.map((slide, i) => {
        const isClickable = slide.link_type && slide.link_type !== 'none' && slide.link_value;
        return (
          <div
            key={i}
            onClick={() => handleSlideClick(slide)}
            style={{
              position: 'absolute', inset: 0,
              opacity: i === current ? 1 : 0,
              transition: 'opacity 0.8s ease',
              cursor: isClickable ? 'pointer' : 'default',
              zIndex: i === current ? 1 : 0,
            }}
          >
            {slide.media_type === 'video' ? (
              <video
                ref={el => { videoRefs.current[i] = el; }}
                src={slide.media_data}
                muted
                playsInline
                autoPlay={i === 0}
                loop={isSingleVideo}
                onEnded={slides.length > 1 ? () => {
                  clearTimeout(timerRef.current);
                  setCurrent(j => (j + 1) % slides.length);
                } : undefined}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <img
                src={slide.media_data}
                alt={`Slide ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </div>
        );
      })}

      {textOverlay}

      {slides.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: '8px', zIndex: 20,
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                clearTimeout(timerRef.current);
                setCurrent(i);
              }}
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px', borderRadius: '4px',
                padding: 0, border: 'none', cursor: 'pointer', outline: 'none',
                background: i === current ? '#D4AF37' : 'rgba(212,175,55,0.35)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlideshow;
