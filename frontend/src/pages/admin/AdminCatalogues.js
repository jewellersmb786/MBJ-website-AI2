import React, { useState, useEffect } from 'react';
import { catalogueAPI } from '../../api';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, RefreshCw, XCircle, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS = {
  active: { label: 'Active', color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
  expired: { label: 'Expired', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  revoked: { label: 'Revoked', color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
};

const getStatus = (share) => {
  if (share.is_revoked) return 'revoked';
  if (new Date(share.expires_at) < new Date()) return 'expired';
  return 'active';
};

const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso?.slice(0, 10) || '—'; }
};

const AdminCatalogues = () => {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchShares(); }, []);

  const fetchShares = async () => {
    try {
      const res = await catalogueAPI.listShares();
      setShares(res.data);
    } catch {
      toast.error('Failed to load catalogues');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/catalogue/${id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this catalogue? The link will stop working immediately.')) return;
    setActionLoading(id + '_revoke');
    try {
      await catalogueAPI.revoke(id);
      toast.success('Catalogue revoked');
      fetchShares();
    } catch {
      toast.error('Failed to revoke');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegenerate = async (id) => {
    setActionLoading(id + '_regen');
    try {
      await catalogueAPI.regenerate(id);
      toast.success('Catalogue regenerated — valid for 7 more days');
      fetchShares();
    } catch {
      toast.error('Failed to regenerate');
    } finally {
      setActionLoading(null);
    }
  };

  const sCell = { padding: '14px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle' };
  const sHead = { padding: '12px 16px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.12)' };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#D4AF37', fontWeight: 600, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={26} /> Shared Catalogues
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {shares.length} total · {shares.filter(s => getStatus(s) === 'active').length} active
          </p>
        </div>
        <button
          onClick={fetchShares}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading catalogues…</div>
      ) : shares.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
          <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', fontFamily: 'Georgia, serif' }}>No catalogues generated yet.</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Select products on the Collections page and click "Save selection".</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={sHead}>Customer</th>
                <th style={sHead}>Phone</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Items</th>
                <th style={sHead}>Created</th>
                <th style={sHead}>Expires</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Views</th>
                <th style={{ ...sHead, textAlign: 'center' }}>Status</th>
                <th style={{ ...sHead, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((share, idx) => {
                const st = getStatus(share);
                const { label, color, bg } = STATUS[st];
                return (
                  <motion.tr
                    key={share.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}
                  >
                    <td style={{ ...sCell, color: '#fff', fontWeight: 500 }}>{share.customer_name}</td>
                    <td style={{ ...sCell, fontVariantNumeric: 'tabular-nums' }}>{share.customer_phone}</td>
                    <td style={{ ...sCell, textAlign: 'center' }}>{share.product_count}</td>
                    <td style={{ ...sCell, fontVariantNumeric: 'tabular-nums' }}>{fmtDate(share.created_at)}</td>
                    <td style={{ ...sCell, fontVariantNumeric: 'tabular-nums', color: st === 'expired' ? 'rgba(251,146,60,0.7)' : 'rgba(255,255,255,0.55)' }}>{fmtDate(share.expires_at)}</td>
                    <td style={{ ...sCell, textAlign: 'center', color: '#D4AF37', fontVariantNumeric: 'tabular-nums' }}>{share.view_count}</td>
                    <td style={{ ...sCell, textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: bg, color, fontWeight: 600 }}>{label}</span>
                    </td>
                    <td style={{ ...sCell, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* View */}
                        <a
                          href={`/catalogue/${share.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open catalogue"
                          style={{ padding: '6px 10px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                        >
                          <ExternalLink size={13} />
                        </a>

                        {/* Copy */}
                        <button
                          onClick={() => copyLink(share.id)}
                          title="Copy link"
                          style={{ padding: '6px 10px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Copy size={13} />
                        </button>

                        {/* Revoke — only for active */}
                        {st === 'active' && (
                          <button
                            onClick={() => handleRevoke(share.id)}
                            disabled={actionLoading === share.id + '_revoke'}
                            title="Revoke catalogue"
                            style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <XCircle size={13} />
                          </button>
                        )}

                        {/* Regenerate — for expired or revoked */}
                        {(st === 'expired' || st === 'revoked') && (
                          <button
                            onClick={() => handleRegenerate(share.id)}
                            disabled={actionLoading === share.id + '_regen'}
                            title="Regenerate (reset expiry)"
                            style={{ padding: '6px 10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                          >
                            <RefreshCw size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCatalogues;
