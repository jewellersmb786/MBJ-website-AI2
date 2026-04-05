import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let animating = true;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }
    };

    const onMouseOver = (e) => {
      const t = e.target;
      if (t.closest('a') || t.closest('button') || t.tagName === 'A' || t.tagName === 'BUTTON') {
        if (cursorRef.current) cursorRef.current.style.transform += ' scale(1.6)';
      }
    };

    const onMouseOut = (e) => {
      const t = e.target;
      if (t.closest('a') || t.closest('button') || t.tagName === 'A' || t.tagName === 'BUTTON') {
        if (cursorRef.current) {
          cursorRef.current.style.width = '36px';
          cursorRef.current.style.height = '36px';
        }
      }
    };

    const animate = () => {
      if (!animating) return;
      cursorX += (mouseX - cursorX) * 0.12;
      cursorY += (mouseY - cursorY) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    animate();

    return () => {
      animating = false;
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <>
      {/* Outer ring - follows with lag */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: '-18px',
          left: '-18px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.6)',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'width 0.2s, height 0.2s',
          willChange: 'transform',
        }}
      />
      {/* Inner dot - follows instantly */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: '-3px',
          left: '-3px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#D4AF37',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default CustomCursor;
