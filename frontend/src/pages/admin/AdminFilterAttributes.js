import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Plus, Edit2, Trash2, X, Save, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const inp = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)',
  borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

const sHead = { padding: '10px 14px', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(212,175,55,0.12)' };
const sCell = { padding: '11px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle' };

// ─── AttributeModal ──────────────────────────────────────────────────────────

const EMPTY = { name: '', display_name: '', description: '', options: [''], display_order: 0, visible_options_count: 6, is_active: true };

const AttributeModal = ({ attr, categoryId, onClose, onSave }) => {
  const isEdit = !!attr;
  const [form, setForm] = useState(isEdit ? {
    name: attr.name,
    display_name: attr.display_name || '',
    description: attr.description || '',
    options: attr.options?.length ? [...attr.options] : [''],
    display_order: attr.display_order || 0,
    visible_options_count: attr.visible_options_count || 6,
    is_active: attr.is_active ?? true,
  } : { ...EMPTY, options: [''] });
  const [saving, setSaving] = useState(false);

  const setOption = (i, val) => setForm(p => { const opts = [...p.options]; opts[i] = val; return { ...p, options: opts }; });
  const addOption = () => setForm(p => ({ ...p, options: [...p.options, ''] }));
  const removeOption = (i) => setForm(p => ({ ...p, options: p.options.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const cleanedOptions = form.options.map(o => o.trim()).filter(Boolean);
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        display_name: form.display_name.trim() || undefined,
        description: form.description.trim() || undefined,
        options: cleanedOptions,
        display_order: parseInt(form.display_order) || 0,
        visible_options_count: parseInt(form.visible_options_count) || 6,
        is_active: form.is_active,
        ...(!isEdit && { category_id: categoryId }),
      };
      if (isEdit) await adminAPI.filterAttributes.update(attr.id, payload);
      else await adminAPI.filterAttributes.create(payload);
      toast.success(isEdit ? 'Updated' : 'Created');
      onSave();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Error saving'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        style={{ background: '#111', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '520px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
        <h2 style={{ fontSize: '18px', color: '#D4AF37', marginBottom: '20px' }}>{isEdit ? 'Edit Filter' : 'Add Filter'}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Attribute Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="e.g. Gender" />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Display Label</label>
              <input type="text" value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} style={inp} placeholder="Defaults to name" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Description <span style={{ color: 'rgba(255,255,255,0.25)' }}>(shown as tooltip)</span></label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={inp} placeholder="Optional helper text" />
          </div>

          {/* Options */}
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '8px' }}>Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {form.options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <GripVertical size={14} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                  <input type="text" value={opt} onChange={e => setOption(i, e.target.value)} style={{ ...inp, flex: 1 }} placeholder={`Option ${i + 1}`} />
                  {form.options.length > 1 && (
                    <button onClick={() => removeOption(i)} style={{ padding: '6px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', flexShrink: 0, display: 'flex' }}><X size={12} /></button>
                  )}
                </div>
              ))}
              <button onClick={addOption} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '6px', color: '#D4AF37', fontSize: '12px', cursor: 'pointer' }}>
                <Plus size={13} /> Add Option
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Visible Count</label>
              <input type="number" min="1" value={form.visible_options_count} onChange={e => setForm(p => ({ ...p, visible_options_count: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '5px' }}>Order</label>
              <input type="number" min="0" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '1px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                  style={{ accentColor: '#D4AF37', width: '14px', height: '14px' }} />
                Active
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px', background: saving ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Save size={15} />{saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── AdminFilterAttributes ────────────────────────────────────────────────────

const AdminFilterAttributes = () => {
  const [topLevelCats, setTopLevelCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catsLoading, setCatsLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | attr_object

  // Load all categories and pick top-level ones
  useEffect(() => {
    adminAPI.categories.getAll()
      .then(r => {
        const all = r.data || [];
        const tops = all.filter(c => !c.parent_id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setTopLevelCats(tops);
        if (tops.length) setSelectedCatId(tops[0].id);
      })
      .catch(() => toast.error('Error loading categories'))
      .finally(() => setCatsLoading(false));
  }, []);

  const loadAttrs = useCallback(async () => {
    if (!selectedCatId) return;
    setLoading(true);
    try {
      const r = await adminAPI.filterAttributes.getByCategory(selectedCatId);
      setAttributes(r.data || []);
    } catch { toast.error('Error loading filter attributes'); }
    finally { setLoading(false); }
  }, [selectedCatId]);

  useEffect(() => { loadAttrs(); }, [loadAttrs]);

  const handleDelete = async (attr) => {
    if (!window.confirm(`Delete filter "${attr.name}"?`)) return;
    try { await adminAPI.filterAttributes.delete(attr.id); toast.success('Deleted'); loadAttrs(); }
    catch (err) { toast.error(err?.response?.data?.detail || 'Error deleting'); }
  };

  const selectedCat = topLevelCats.find(c => c.id === selectedCatId);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#D4AF37', fontWeight: 600, margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SlidersHorizontal size={22} /> Filter Attributes
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Define filter options for each top-level category. Children inherit their parent's filters.
          </p>
        </div>
        {selectedCatId && (
          <button onClick={() => setModal('new')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            <Plus size={16} /> Add Filter
          </button>
        )}
      </div>

      {/* Category selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '8px' }}>Manage filters for:</label>
        {catsLoading ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Loading categories...</div>
        ) : (
          <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)}
            style={{ ...inp, maxWidth: '320px', cursor: 'pointer' }}>
            {topLevelCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* Attributes table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading...</div>
      ) : attributes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
          <SlidersHorizontal size={44} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', marginBottom: '8px' }}>
            No filter attributes for {selectedCat?.name || 'this category'}.
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
            Add filters like Gender, Style, Occasion to power the public browse experience.
          </p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
              <th style={sHead}>Name / Label</th>
              <th style={sHead}>Options</th>
              <th style={{ ...sHead, textAlign: 'center' }}>Visible</th>
              <th style={{ ...sHead, textAlign: 'center' }}>Order</th>
              <th style={{ ...sHead, textAlign: 'center' }}>Status</th>
              <th style={{ ...sHead, width: '80px' }}></th>
            </tr></thead>
            <tbody>
              {attributes.map((attr, idx) => (
                <motion.tr key={attr.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                  style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                  <td style={sCell}>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 500 }}>{attr.name}</p>
                    {attr.display_name && attr.display_name !== attr.name && (
                      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Label: {attr.display_name}</p>
                    )}
                    {attr.description && (
                      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{attr.description}</p>
                    )}
                  </td>
                  <td style={sCell}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(attr.options || []).slice(0, 5).map(o => (
                        <span key={o} style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.8)', border: '1px solid rgba(212,175,55,0.2)' }}>{o}</span>
                      ))}
                      {attr.options?.length > 5 && (
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>+{attr.options.length - 5} more</span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...sCell, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>{attr.visible_options_count}</td>
                  <td style={{ ...sCell, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>{attr.display_order}</td>
                  <td style={{ ...sCell, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: attr.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)', color: attr.is_active ? '#4ade80' : '#9ca3af', fontWeight: 600 }}>
                      {attr.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={sCell}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => setModal(attr)} style={{ padding: '5px 8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer' }}><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(attr)} style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <AttributeModal
            attr={modal === 'new' ? null : modal}
            categoryId={selectedCatId}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); loadAttrs(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFilterAttributes;
