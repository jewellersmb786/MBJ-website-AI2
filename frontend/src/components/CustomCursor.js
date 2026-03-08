import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isZoom, setIsZoom] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      
      // Check if hovering over clickable elements
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      }
      
      // Check if hovering over images for zoom effect
      if (target.tagName === 'IMG' || target.closest('.zoom-image')) {
        setIsZoom(true);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(false);
      }
      if (target.tagName === 'IMG' || target.closest('.zoom-image')) {
        setIsZoom(false);
      }
    };

    // Smooth cursor follow with lerp
    const animate = () => {
      const speed = 0.15;
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;

      if (cursor) {
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      }
      if (cursorDot) {
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      {/* Main Cursor Ring */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: isZoom ? 120 : isHovering ? 60 : 40,
          height: isZoom ? 120 : isHovering ? 60 : 40,
          opacity: isZoom ? 0.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <div className="w-full h-full rounded-full border-2 border-gold" 
          style={{
            background: isZoom ? 'radial-gradient(circle, transparent 30%, rgba(212, 175, 55, 0.1) 100%)' : 'transparent'
          }}
        >
          {isZoom && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gold text-xs font-semibold">ZOOM</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cursor Dot */}
      <motion.div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: isHovering ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <div className="w-2 h-2 rounded-full bg-gold"></div>
      </motion.div>
    </>
  );
};

export default CustomCursor;
