import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy } from 'lucide-react';

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
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1920;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a0710');
    grad.addColorStop(1, '#3d0815');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Gold border
    const inset = 24;
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 8;
    ctx.strokeRect(inset + 4, inset + 4, W - (inset + 4) * 2, H - (inset + 4) * 2);

    // Helper
    const gold = '#D4AF37';
    const cream = '#F5E6D3';

    // Business name
    ctx.textAlign = 'center';
    ctx.fillStyle = gold;
    ctx.font = 'bold 80px Georgia, serif';
    ctx.fillText('MB JEWELLERS', W / 2, 280);

    // Subtitle
    ctx.fillStyle = cream;
    ctx.font = 'italic 36px Georgia, serif';
    ctx.fillText('Jewellers & Bankers', W / 2, 340);

    // Decorative line
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.25, 390);
    ctx.lineTo(W * 0.75, 390);
    ctx.stroke();

    // Heading
    ctx.fillStyle = gold;
    ctx.font = '36px Georgia, serif';
    ctx.letterSpacing = '4px';
    ctx.fillText("TODAY'S GOLD & SILVER RATES", W / 2, 500);

    // Date
    ctx.fillStyle = cream;
    ctx.font = 'italic 44px Georgia, serif';
    ctx.fillText(dateStr, W / 2, 580);

    // Rates table
    const tableTop = 720;
    const rowH = 120;
    const leftX = 160;
    const rightX = W - 160;

    const rows = [
      { label: '24K · 999', rate: `₹${fmtRate(settings.k24_rate)}/g`, color: gold },
      { label: '22K · 916HM', rate: `₹${fmtRate(settings.k22_rate)}/g`, color: gold },
      { label: '18K · 75HM', rate: `₹${fmtRate(settings.k18_rate)}/g`, color: gold },
    ];

    ctx.font = '56px Georgia, serif';
    rows.forEach((row, i) => {
      const y = tableTop + i * rowH;
      ctx.fillStyle = row.color;
      ctx.textAlign = 'left';
      ctx.fillText(row.label, leftX, y);
      ctx.textAlign = 'right';
      ctx.fillText(row.rate, rightX, y);
    });

    // Divider
    const divY = tableTop + rows.length * rowH - 30;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftX, divY);
    ctx.lineTo(rightX, divY);
    ctx.stroke();

    // Silver row
    const silverY = divY + 90;
    ctx.font = '56px Georgia, serif';
    ctx.fillStyle = cream;
    ctx.textAlign = 'left';
    ctx.fillText('Silver · 999', leftX, silverY);
    ctx.textAlign = 'right';
    ctx.fillText(`₹${fmtRate(settings.silver_rate)}/g`, rightX, silverY);

    // Footer
    ctx.fillStyle = gold;
    ctx.font = '28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('mbj-jewellers.vercel.app', W / 2, H - 80);
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
    const text = `Date: ${dateStr} 📅\nGold rate:\n\n24kt/ 999 : ${fmtRate(settings.k24_rate)}/- per gram\n\n22kt/ 916HM : ${fmtRate(settings.k22_rate)}/- per gram\n\n18kt/ 75HM : ${fmtRate(settings.k18_rate)}/- per gram\nSilver rate:\n\n${fmtRate(settings.silver_rate)}/- per gram\nMB Jewellers`;
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
