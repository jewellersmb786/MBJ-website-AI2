import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy } from 'lucide-react';

// ── 7 daily-rotating corner ornament styles ─────────────────────────────────
function drawStyle0(ctx, x, y, size) {
  const g = '#D4AF37';
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = g;
  ctx.fillStyle = g;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.1, size * 0.4, size * 0.4, size * 0.1, size, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.4, size * 0.1, size * 0.1, size * 0.4, 0, size);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.15, size * 0.15, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.05, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.05, size * 0.5, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStyle1(ctx, x, y, size) {
  const g = '#D4AF37';
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = g;
  ctx.fillStyle = g;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.1);
  ctx.quadraticCurveTo(size * 0.3, size * 0.3, size, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.1, 0);
  ctx.quadraticCurveTo(size * 0.3, size * 0.3, 0, size);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.2, size * 0.2);
  ctx.lineTo(size * 0.35, size * 0.35);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.38, size * 0.38, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStyle2(ctx, x, y, size) {
  const g = '#D4AF37';
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = g;
  ctx.fillStyle = g;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.5, size * 0.05, size * 0.7, size * 0.15, size * 0.9, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.05, size * 0.5, size * 0.15, size * 0.7, 0, size * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.12, size * 0.12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.45, size * 0.02, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.02, size * 0.45, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.65, size * 0.08, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.08, size * 0.65, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStyle3(ctx, x, y, size) {
  const g = '#D4AF37';
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = g;
  ctx.fillStyle = g;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.2, size * 0.05, size * 0.35, size * 0.2, size * 0.6, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.6, 0);
  ctx.bezierCurveTo(size * 0.75, size * 0.08, size * 0.85, size * 0.02, size, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.05, size * 0.2, size * 0.2, size * 0.35, 0, size * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, size * 0.6);
  ctx.bezierCurveTo(size * 0.08, size * 0.75, size * 0.02, size * 0.85, 0, size);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.22, size * 0.22, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStyle4(ctx, x, y, size) {
  const g = '#D4AF37';
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = g;
  ctx.fillStyle = g;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size * 0.15, size * 0.15, size * 0.15, Math.PI, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.15, 0);
  ctx.lineTo(size * 0.85, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, size * 0.15);
  ctx.lineTo(0, size * 0.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.03, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.03, size * 0.5, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.18, size * 0.18, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStyle5(ctx, x, y, size) {
  const g = '#D4AF37';
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = g;
  ctx.fillStyle = g;
  ctx.lineWidth = 2;
  // leaf shape along diagonal
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.15, size * 0.3, size * 0.3, size * 0.15, size * 0.5, size * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.3, size * 0.15, size * 0.15, size * 0.3, size * 0.5, size * 0.5);
  ctx.stroke();
  // extensions
  ctx.beginPath();
  ctx.moveTo(size * 0.5, 0);
  ctx.bezierCurveTo(size * 0.35, size * 0.08, size * 0.25, size * 0.02, size * 0.9, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, size * 0.5);
  ctx.bezierCurveTo(size * 0.08, size * 0.35, size * 0.02, size * 0.25, 0, size * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.25, size * 0.25, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStyle6(ctx, x, y, size) {
  const g = '#D4AF37';
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = g;
  ctx.fillStyle = g;
  ctx.lineWidth = 1.8;
  // triple curved lines
  for (let i = 0; i < 3; i++) {
    const off = i * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(off, 0);
    ctx.bezierCurveTo(off + size * 0.1, size * 0.2, size * 0.3, size * 0.05 + off, size * 0.7 + off * 0.5, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, off);
    ctx.bezierCurveTo(size * 0.2, off + size * 0.1, size * 0.05 + off, size * 0.3, 0, size * 0.7 + off * 0.5);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(size * 0.1, size * 0.1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.3, size * 0.04, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.04, size * 0.3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const ORNAMENT_STYLES = [drawStyle0, drawStyle1, drawStyle2, drawStyle3, drawStyle4, drawStyle5, drawStyle6];

function drawCornerOrnaments(ctx, W, H, inset) {
  const style = ORNAMENT_STYLES[new Date().getDay()];
  const size = 80;
  const margin = inset + 14;

  // Top-left
  ctx.save();
  ctx.translate(margin, margin);
  style(ctx, 0, 0, size);
  ctx.restore();

  // Top-right (mirror horizontally)
  ctx.save();
  ctx.translate(W - margin, margin);
  ctx.scale(-1, 1);
  style(ctx, 0, 0, size);
  ctx.restore();

  // Bottom-left (mirror vertically)
  ctx.save();
  ctx.translate(margin, H - margin);
  ctx.scale(1, -1);
  style(ctx, 0, 0, size);
  ctx.restore();

  // Bottom-right (mirror both)
  ctx.save();
  ctx.translate(W - margin, H - margin);
  ctx.scale(-1, -1);
  style(ctx, 0, 0, size);
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

      // Subtle radial gold highlight
      const radGrad = ctx.createRadialGradient(W / 2, H * 0.18, 0, W / 2, H * 0.18, W * 0.6);
      radGrad.addColorStop(0, 'rgba(212,175,55,0.08)');
      radGrad.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Outer frame
      const outerInset = 32;
      ctx.strokeStyle = gold;
      ctx.lineWidth = 6;
      ctx.strokeRect(outerInset, outerInset, W - outerInset * 2, H - outerInset * 2);

      const innerInset = outerInset + 12;
      ctx.lineWidth = 1;
      ctx.strokeRect(innerInset, innerInset, W - innerInset * 2, H - innerInset * 2);

      // 3. Corner ornaments
      drawCornerOrnaments(ctx, W, H, outerInset);

      // 4. Top section — Business identity (~22% = y 0 to ~422)
      let logoDrawn = false;
      if (settings.logo) {
        try {
          const img = await loadImage(settings.logo);
          const maxW = 360, maxH = 200;
          let dw = img.width, dh = img.height;
          if (dw > maxW) { dh = dh * (maxW / dw); dw = maxW; }
          if (dh > maxH) { dw = dw * (maxH / dh); dh = maxH; }
          const lx = (W - dw) / 2;
          const ly = 120;
          ctx.drawImage(img, lx, ly, dw, dh);
          logoDrawn = true;
        } catch { /* fallback to text */ }
      }
      if (!logoDrawn) {
        ctx.textAlign = 'center';
        ctx.fillStyle = gold;
        ctx.font = 'bold 80px Georgia, serif';
        ctx.fillText('MB JEWELLERS', W / 2, 260);
      }

      // Decorative gold line below logo
      const decoLineY = logoDrawn ? 340 : 300;
      ctx.strokeStyle = gold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W * 0.35, decoLineY);
      ctx.lineTo(W * 0.65, decoLineY);
      ctx.stroke();

      // 5. Header section (~8%)
      const headerY = decoLineY + 70;
      ctx.textAlign = 'center';
      ctx.fillStyle = gold;
      ctx.font = 'bold 38px Helvetica, Arial, sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText("TODAY'S GOLD & SILVER RATES", W / 2, headerY);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = cream;
      ctx.font = 'italic 24px Georgia, serif';
      ctx.fillText('Per Gram • Buying Rate Only', W / 2, headerY + 44);

      // 6. Date section (~5%)
      const dateY = headerY + 110;
      ctx.fillStyle = cream;
      ctx.font = '32px Helvetica, Arial, sans-serif';
      ctx.fillText('📅  ' + dateStr, W / 2, dateY);

      // 7. Rates table (~42%)
      const tableTop = dateY + 80;
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

      // 8. Disclaimer section (~8%)
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

      // 9. Footer (~5%)
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
