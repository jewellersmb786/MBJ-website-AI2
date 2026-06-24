import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_FILL = 'rgba(212,175,55,0.35)';
const GOLD_SHADOW = '#9C7C26';

// ── Style 0 — Paisley (Mango/Boota) ────────────────────────────────────────
function drawStyle0(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const s = size;

  // Outer paisley teardrop
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD_FILL;
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.05);
  ctx.bezierCurveTo(s * 0.85, s * 0.05, s * 0.95, s * 0.4, s * 0.8, s * 0.7);
  ctx.bezierCurveTo(s * 0.65, s * 0.92, s * 0.35, s * 0.92, s * 0.2, s * 0.7);
  ctx.bezierCurveTo(s * 0.05, s * 0.4, s * 0.15, s * 0.05, s * 0.5, s * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner concentric curve 1
  ctx.lineWidth = 2;
  ctx.strokeStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.15);
  ctx.bezierCurveTo(s * 0.75, s * 0.15, s * 0.82, s * 0.4, s * 0.7, s * 0.6);
  ctx.bezierCurveTo(s * 0.6, s * 0.78, s * 0.4, s * 0.78, s * 0.3, s * 0.6);
  ctx.bezierCurveTo(s * 0.18, s * 0.4, s * 0.25, s * 0.15, s * 0.5, s * 0.15);
  ctx.closePath();
  ctx.stroke();

  // Inner concentric curve 2
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.28);
  ctx.bezierCurveTo(s * 0.65, s * 0.28, s * 0.7, s * 0.42, s * 0.62, s * 0.55);
  ctx.bezierCurveTo(s * 0.56, s * 0.65, s * 0.44, s * 0.65, s * 0.38, s * 0.55);
  ctx.bezierCurveTo(s * 0.3, s * 0.42, s * 0.35, s * 0.28, s * 0.5, s * 0.28);
  ctx.closePath();
  ctx.stroke();

  // Curled tip at top
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.05);
  ctx.bezierCurveTo(s * 0.42, -s * 0.08, s * 0.2, -s * 0.02, s * 0.18, s * 0.12);
  ctx.stroke();

  // Dot accents
  ctx.fillStyle = GOLD;
  [[0.5, 0.42], [0.38, 0.55], [0.62, 0.55], [0.5, 0.72], [0.3, 0.38], [0.7, 0.38]].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(s * px, s * py, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// ── Style 1 — Lotus Bud ────────────────────────────────────────────────────
function drawStyle1(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const s = size;
  const cx = s * 0.5, cy = s * 0.5;

  // 8 petals
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD_FILL;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const petalLen = s * 0.38;
    const petalW = s * 0.12;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(petalW, -petalLen * 0.3, petalW, -petalLen * 0.7, 0, -petalLen);
    ctx.bezierCurveTo(-petalW, -petalLen * 0.7, -petalW, -petalLen * 0.3, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Inner ring
  ctx.lineWidth = 2;
  ctx.strokeStyle = GOLD;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.12, 0, Math.PI * 2);
  ctx.stroke();

  // Center filled circle
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Dots between petals
  for (let i = 0; i < 8; i++) {
    const angle = ((i + 0.5) / 8) * Math.PI * 2 - Math.PI / 2;
    const dx = cx + Math.cos(angle) * s * 0.22;
    const dy = cy + Math.sin(angle) * s * 0.22;
    ctx.beginPath();
    ctx.arc(dx, dy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── Style 2 — Kalash with Mango Leaves ─────────────────────────────────────
function drawStyle2(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const s = size;
  const cx = s * 0.5;

  // Pot body
  ctx.lineWidth = 3;
  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD_FILL;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.22, s * 0.45);
  ctx.bezierCurveTo(cx - s * 0.28, s * 0.65, cx - s * 0.25, s * 0.85, cx - s * 0.15, s * 0.92);
  ctx.lineTo(cx + s * 0.15, s * 0.92);
  ctx.bezierCurveTo(cx + s * 0.25, s * 0.85, cx + s * 0.28, s * 0.65, cx + s * 0.22, s * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pot rim
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.25, s * 0.45);
  ctx.lineTo(cx + s * 0.25, s * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.2, s * 0.42);
  ctx.lineTo(cx + s * 0.2, s * 0.42);
  ctx.stroke();

  // Horizontal bands on pot
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = GOLD;
  [0.58, 0.72].forEach(yy => {
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.24, s * yy);
    ctx.lineTo(cx + s * 0.24, s * yy);
    ctx.stroke();
  });

  // Left mango leaf
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD_FILL;
  ctx.beginPath();
  ctx.moveTo(cx, s * 0.42);
  ctx.bezierCurveTo(cx - s * 0.15, s * 0.2, cx - s * 0.4, s * 0.12, cx - s * 0.42, s * 0.25);
  ctx.bezierCurveTo(cx - s * 0.38, s * 0.15, cx - s * 0.12, s * 0.28, cx, s * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right mango leaf
  ctx.beginPath();
  ctx.moveTo(cx, s * 0.42);
  ctx.bezierCurveTo(cx + s * 0.15, s * 0.2, cx + s * 0.4, s * 0.12, cx + s * 0.42, s * 0.25);
  ctx.bezierCurveTo(cx + s * 0.38, s * 0.15, cx + s * 0.12, s * 0.28, cx, s * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Center leaf (upward)
  ctx.beginPath();
  ctx.moveTo(cx, s * 0.42);
  ctx.bezierCurveTo(cx - s * 0.06, s * 0.18, cx - s * 0.02, s * 0.05, cx, s * 0.02);
  ctx.bezierCurveTo(cx + s * 0.02, s * 0.05, cx + s * 0.06, s * 0.18, cx, s * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dot on top
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(cx, s * 0.02, 5, 0, Math.PI * 2);
  ctx.fill();

  // Base
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.18, s * 0.92);
  ctx.lineTo(cx + s * 0.18, s * 0.92);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.22, s * 0.96);
  ctx.lineTo(cx + s * 0.22, s * 0.96);
  ctx.stroke();

  ctx.restore();
}

// ── Style 3 — Mandala Quarter ──────────────────────────────────────────────
function drawStyle3(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const s = size;

  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD;

  // Concentric quarter arcs
  const radii = [0.2, 0.35, 0.5, 0.65, 0.8, 0.95];
  radii.forEach((r, i) => {
    ctx.lineWidth = i === radii.length - 1 ? 3.5 : (i % 2 === 0 ? 2.5 : 1.5);
    ctx.beginPath();
    ctx.arc(0, 0, s * r, 0, Math.PI / 2);
    ctx.stroke();
  });

  // Radiating lines
  const lineCount = 7;
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= lineCount; i++) {
    const angle = (i / lineCount) * (Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * s * 0.15, Math.sin(angle) * s * 0.15);
    ctx.lineTo(Math.cos(angle) * s * 0.95, Math.sin(angle) * s * 0.95);
    ctx.stroke();
  }

  // Dots at intersections of arcs and radii
  ctx.fillStyle = GOLD;
  for (let i = 1; i <= lineCount - 1; i++) {
    const angle = (i / lineCount) * (Math.PI / 2);
    [0.35, 0.65, 0.95].forEach(r => {
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * s * r, Math.sin(angle) * s * r, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Filled petal shapes between radii on middle ring
  ctx.fillStyle = GOLD_FILL;
  ctx.lineWidth = 2;
  ctx.strokeStyle = GOLD;
  for (let i = 0; i < lineCount; i++) {
    const a1 = (i / lineCount) * (Math.PI / 2);
    const a2 = ((i + 1) / lineCount) * (Math.PI / 2);
    const amid = (a1 + a2) / 2;
    const rInner = s * 0.5;
    const rOuter = s * 0.65;
    const rMid = (rInner + rOuter) / 2 + s * 0.04;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
    ctx.quadraticCurveTo(Math.cos(amid) * rMid, Math.sin(amid) * rMid, Math.cos(a2) * rInner, Math.sin(a2) * rInner);
    ctx.stroke();
  }

  // Center quarter-circle filled
  ctx.fillStyle = GOLD_FILL;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, s * 0.2, 0, Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ── Style 4 — Scrollwork / Vel Vine ────────────────────────────────────────
function drawStyle4(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const s = size;

  // Main spiral vine
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.05);
  ctx.bezierCurveTo(s * 0.3, s * 0.05, s * 0.5, s * 0.2, s * 0.55, s * 0.4);
  ctx.bezierCurveTo(s * 0.6, s * 0.6, s * 0.45, s * 0.75, s * 0.3, s * 0.7);
  ctx.bezierCurveTo(s * 0.15, s * 0.65, s * 0.15, s * 0.5, s * 0.25, s * 0.45);
  ctx.bezierCurveTo(s * 0.35, s * 0.4, s * 0.42, s * 0.48, s * 0.38, s * 0.55);
  ctx.stroke();

  // Second branch
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(s * 0.05, 0);
  ctx.bezierCurveTo(s * 0.05, s * 0.3, s * 0.2, s * 0.5, s * 0.4, s * 0.55);
  ctx.bezierCurveTo(s * 0.6, s * 0.6, s * 0.75, s * 0.45, s * 0.7, s * 0.3);
  ctx.bezierCurveTo(s * 0.65, s * 0.15, s * 0.5, s * 0.15, s * 0.45, s * 0.25);
  ctx.bezierCurveTo(s * 0.4, s * 0.35, s * 0.48, s * 0.42, s * 0.55, s * 0.38);
  ctx.stroke();

  // Leaf/bud accents along the vine
  ctx.fillStyle = GOLD_FILL;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  const buds = [
    [0.18, 0.12, -0.3], [0.38, 0.18, 0.4], [0.52, 0.32, 0.8],
    [0.12, 0.18, -0.8], [0.18, 0.38, -1.2], [0.32, 0.52, -0.5],
  ];
  buds.forEach(([bx, by, angle]) => {
    ctx.save();
    ctx.translate(s * bx, s * by);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(6, -14, 2, -22, 0, -26);
    ctx.bezierCurveTo(-2, -22, -6, -14, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });

  // Center spiral filled dot
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(s * 0.38, s * 0.55, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.55, s * 0.38, 6, 0, Math.PI * 2);
  ctx.fill();

  // Small dots along curves
  ctx.fillStyle = GOLD;
  [[0.1, 0.04], [0.25, 0.1], [0.42, 0.25], [0.04, 0.1], [0.1, 0.25], [0.25, 0.42]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(s * dx, s * dy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// ── Style 5 — Diamond Lattice (Jaali) ──────────────────────────────────────
function drawStyle5(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const s = size;

  // Outer border arc (quarter circle boundary)
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(s * 0.92, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, s * 0.92);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, s * 0.92, 0, Math.PI / 2);
  ctx.stroke();

  // Diamond grid
  ctx.lineWidth = 2;
  const gridSize = s * 0.18;
  const rows = 5;
  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD_FILL;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < rows - r; c++) {
      const dx = c * gridSize + r * gridSize * 0.5 + gridSize * 0.5;
      const dy = r * gridSize * 0.866 + gridSize * 0.4;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > s * 0.88) continue;

      const half = gridSize * 0.38;
      ctx.beginPath();
      ctx.moveTo(dx, dy - half);
      ctx.lineTo(dx + half * 0.7, dy);
      ctx.lineTo(dx, dy + half);
      ctx.lineTo(dx - half * 0.7, dy);
      ctx.closePath();
      if ((r + c) % 2 === 0) ctx.fill();
      ctx.stroke();
    }
  }

  // Dots at intersections
  ctx.fillStyle = GOLD;
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= rows - r; c++) {
      const dx = c * gridSize + r * gridSize * 0.5;
      const dy = r * gridSize * 0.866;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > s * 0.9 || dist < gridSize * 0.2) continue;
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// ── Style 6 — Peacock Feather Eye ──────────────────────────────────────────
function drawStyle6(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const s = size;
  const cx = s * 0.45, cy = s * 0.45;

  // Radiating spine curves from corner
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(s * 0.1, s * 0.2, s * 0.2, s * 0.35, cx, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.25, s * 0.08, cx + s * 0.15, cy - s * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.08, s * 0.25, cx - s * 0.2, cy + s * 0.15);
  ctx.stroke();

  // Outer feather eye — large oval
  ctx.lineWidth = 3;
  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD_FILL;
  ctx.beginPath();
  ctx.ellipse(cx, cy, s * 0.28, s * 0.2, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Middle oval
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = GOLD;
  ctx.beginPath();
  ctx.ellipse(cx, cy, s * 0.18, s * 0.12, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();

  // Inner oval
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.ellipse(cx, cy, s * 0.09, s * 0.06, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Barbs — short lines radiating from the eye
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = GOLD;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const innerR = s * 0.28;
    const outerR = s * 0.35;
    const ex = Math.cos(angle + Math.PI / 4);
    const ey = Math.sin(angle + Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(cx + ex * innerR, cy + ey * innerR * 0.72);
    ctx.lineTo(cx + ex * outerR, cy + ey * outerR * 0.72);
    ctx.stroke();
  }

  // Tip dots
  ctx.fillStyle = GOLD;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = s * 0.36;
    const ex = cx + Math.cos(angle + Math.PI / 4) * r;
    const ey = cy + Math.sin(angle + Math.PI / 4) * r * 0.72;
    if (ex < -s * 0.05 || ey < -s * 0.05) continue;
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

const ORNAMENT_STYLES = [drawStyle0, drawStyle1, drawStyle2, drawStyle3, drawStyle4, drawStyle5, drawStyle6];

function drawCornerOrnaments(ctx, W, H) {
  const style = ORNAMENT_STYLES[new Date().getDay()];
  const size = 180;

  // Top-left: rotation 0
  style(ctx, 96, 96, size, 0);
  // Top-right: rotation π/2
  style(ctx, W - 96, 96, size, Math.PI / 2);
  // Bottom-right: rotation π
  style(ctx, W - 96, H - 96, size, Math.PI);
  // Bottom-left: rotation -π/2
  style(ctx, 96, H - 96, size, -Math.PI / 2);
}

function drawCenterDivider(ctx, W, y) {
  const style = ORNAMENT_STYLES[new Date().getDay()];
  const motifSize = 70;

  // Thin gold lines extending left and right
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W * 0.12, y);
  ctx.lineTo(W * 0.5 - motifSize * 0.6, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W * 0.5 + motifSize * 0.6, y);
  ctx.lineTo(W * 0.88, y);
  ctx.stroke();

  // Dot accents along lines
  ctx.fillStyle = GOLD;
  const dotPositions = [0.15, 0.22, 0.29, 0.36, 0.64, 0.71, 0.78, 0.85];
  dotPositions.forEach(px => {
    ctx.beginPath();
    ctx.arc(W * px, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Center motif (small version of daily style)
  ctx.save();
  ctx.translate(W * 0.5 - motifSize * 0.5, y - motifSize * 0.5);
  style(ctx, 0, 0, motifSize, 0);
  ctx.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const RateCardModal = ({ settings, onClose }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const fmtRate = (n) => {
    if (!n) return '—';
    return Number(n).toLocaleString('en-IN');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = async () => {
      const ctx = canvas.getContext('2d');
      const W = 1080, H = 1920;
      canvas.width = W;
      canvas.height = H;

      const gold = '#D4AF37';
      const cream = '#F5E6D3';

      // 1. Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a0710');
      grad.addColorStop(0.5, '#3d0815');
      grad.addColorStop(1, '#1a0710');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Subtle radial gold highlight in upper-center
      const radGrad = ctx.createRadialGradient(W / 2, H * 0.18, 0, W / 2, H * 0.18, W * 0.6);
      radGrad.addColorStop(0, 'rgba(212,175,55,0.08)');
      radGrad.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Outer frame — double-line
      const outerInset = 32;
      ctx.strokeStyle = gold;
      ctx.lineWidth = 6;
      ctx.strokeRect(outerInset, outerInset, W - outerInset * 2, H - outerInset * 2);

      const innerInset = outerInset + 12;
      ctx.lineWidth = 1;
      ctx.strokeRect(innerInset, innerInset, W - innerInset * 2, H - innerInset * 2);

      // 3. Corner ornaments
      drawCornerOrnaments(ctx, W, H);

      // 4. Top section — Business identity (top ~25% = ~480px)
      const topSectionEnd = H * 0.25;
      let logoDrawn = false;
      if (settings.logo) {
        try {
          const img = await loadImage(settings.logo);
          const maxW = 500, maxH = 300;
          let dw = img.width, dh = img.height;
          if (dw > maxW) { dh = dh * (maxW / dw); dw = maxW; }
          if (dh > maxH) { dw = dw * (maxH / dh); dh = maxH; }
          const lx = (W - dw) / 2;
          const ly = (topSectionEnd - dh) / 2 + 20;
          ctx.drawImage(img, lx, ly, dw, dh);
          logoDrawn = true;
        } catch { /* fallback to text */ }
      }
      if (!logoDrawn) {
        ctx.textAlign = 'center';
        ctx.fillStyle = gold;
        ctx.font = 'bold 80px Georgia, serif';
        ctx.fillText('MB JEWELLERS', W / 2, topSectionEnd * 0.55);
      }

      // Decorative gold line below logo area
      const decoLineY = topSectionEnd + 10;
      ctx.strokeStyle = gold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W * 0.35, decoLineY);
      ctx.lineTo(W * 0.65, decoLineY);
      ctx.stroke();

      // 5. Header section
      const headerY = decoLineY + 65;
      ctx.textAlign = 'center';
      ctx.fillStyle = gold;
      ctx.font = 'bold 38px Helvetica, Arial, sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText("TODAY'S GOLD & SILVER RATES", W / 2, headerY);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = cream;
      ctx.font = 'italic 24px Georgia, serif';
      ctx.fillText('Per Gram • Buying Rate Only', W / 2, headerY + 44);

      // 6. Date section
      const dateY = headerY + 100;
      ctx.fillStyle = cream;
      ctx.font = '32px Helvetica, Arial, sans-serif';
      ctx.fillText('📅  ' + dateStr, W / 2, dateY);

      // Center divider motif between header and rates
      const dividerY = dateY + 60;
      drawCenterDivider(ctx, W, dividerY);

      // 7. Rates table
      const tableTop = dividerY + 60;
      const contentLeft = (W - 800) / 2;
      const contentRight = contentLeft + 800;
      const rowH = 120;
      const rowGap = 16;

      const rows = [
        { badge: '24K', name: 'Gold 999', rate: settings.k24_rate },
        { badge: '22K', name: 'Gold 916HM', rate: settings.k22_rate },
        { badge: '18K', name: 'Gold 75HM', rate: settings.k18_rate },
        { badge: 'Ag', name: 'Silver 999', rate: settings.silver_rate },
      ];

      rows.forEach((row, i) => {
        const y = tableTop + i * (rowH + rowGap);
        const centerY = y + rowH / 2;

        // Badge box
        const badgeX = contentLeft;
        const badgeSize = 60;
        const badgeTop = centerY - badgeSize / 2;
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeTop, badgeSize, badgeSize, 8);
        ctx.fill();

        ctx.fillStyle = '#2a0a12';
        ctx.font = 'bold 22px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(row.badge, badgeX + badgeSize / 2, centerY);

        // Type name
        ctx.fillStyle = cream;
        ctx.font = '28px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(row.name, badgeX + badgeSize + 24, centerY);

        // Rate on far right
        ctx.fillStyle = gold;
        ctx.font = 'bold 56px Georgia, serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹' + fmtRate(row.rate) + '/g', contentRight, centerY);

        // Divider line (not after last row)
        if (i < rows.length - 1) {
          ctx.strokeStyle = 'rgba(212,175,55,0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(contentLeft, y + rowH + rowGap / 2);
          ctx.lineTo(contentRight, y + rowH + rowGap / 2);
          ctx.stroke();
        }
      });

      // Reset text baseline
      ctx.textBaseline = 'alphabetic';

      // 8. Disclaimer section
      const disclaimerY = tableTop + rows.length * (rowH + rowGap) + 40;

      // Small trend arrow icon
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 12, disclaimerY - 20);
      ctx.lineTo(W / 2, disclaimerY - 32);
      ctx.lineTo(W / 2 + 12, disclaimerY - 20);
      ctx.closePath();
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = cream;
      ctx.font = 'italic 22px Georgia, serif';
      ctx.fillText('Rates change daily based on market fluctuations.', W / 2, disclaimerY + 10);
      ctx.font = '20px Helvetica, Arial, sans-serif';
      ctx.fillText('Buying & selling rates may differ. Visit store for purchase rates.', W / 2, disclaimerY + 48);

      // 9. Footer
      const footerY = H - 100;
      ctx.fillStyle = gold;
      ctx.font = '22px Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(settings.website || 'mbj-jewellers.vercel.app', W / 2, footerY);

      ctx.fillStyle = cream;
      ctx.font = '18px Helvetica, Arial, sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('Trust  •  Purity  •  Value', W / 2, footerY + 36);
      ctx.letterSpacing = '0px';
    };

    draw();
  }, [settings, dateStr]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const dateSlug = today.toISOString().split('T')[0];
    a.download = `mb-jewellers-rate-${dateSlug}.png`;
    a.href = dataUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyText = async () => {
    const lines = [
      `Date: ${dateStr} 📅`,
      'Gold rate:',
      '',
      `24kt/ 999 : ₹${fmtRate(settings.k24_rate)}/- per gram`,
      '',
      `22kt/ 916HM : ₹${fmtRate(settings.k22_rate)}/- per gram`,
      '',
      `18kt/ 75HM : ₹${fmtRate(settings.k18_rate)}/- per gram`,
      'Silver rate:',
      '',
      `₹${fmtRate(settings.silver_rate)}/- per gram`,
    ];

    const websiteVal = settings.website || 'mbj-jewellers.vercel.app';
    lines.push(`🌐 Website: ${websiteVal}`);

    if (settings.instagram) {
      lines.push(`📸 Instagram: ${settings.instagram}`);
    }

    const whatsappVal = settings.whatsapp || settings.phone;
    if (whatsappVal) {
      lines.push(`📞 WhatsApp: ${whatsappVal}`);
    }

    lines.push('MB Jewellers');

    const text = lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ background: '#1a0710', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '24px', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        <h3 style={{ fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '16px', textAlign: 'center' }}>Rate Card for Today</h3>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <canvas ref={canvasRef} style={{ width: '100%', maxWidth: '360px', height: 'auto', aspectRatio: '1080/1920', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button onClick={handleDownload} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <Download size={15} /> Download PNG
          </button>
          <button onClick={handleCopyText} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`, color: copied ? '#22c55e' : 'rgba(255,255,255,0.7)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <Copy size={15} /> {copied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>

        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
          Download the image to share on your Instagram Story. Paste the copied message text into your broadcast channel.
        </p>
      </div>
    </div>
  );
};

export default RateCardModal;
