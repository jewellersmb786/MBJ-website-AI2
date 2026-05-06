import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, Save, X, Eye, EyeOff, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── helpers ────────────────────────────────────────────────────────────────

const buildTree = (cats) => {
  const roots = cats.filter(c => !c.parent_id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const addChildren = (nodes, depth = 0) =>
    nodes.map(n => ({
      ...n,
      depth,
      children: addChildren(
        cats.filter(c => c.parent_id === n.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        depth + 1
      ),
    }));
  return addChildren(roots);
};

const flattenTree = (nodes, result = []) => {
  for (const n of nodes) { result.push(n); flattenTree(n.children, result); }
  return result;
};

// ─── styles ──────────────────────────────────────────────────────────────────

const sInput = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.25)',
  color: '#fff', fontSize: '14px', outline: 'none', borderRadius: '6px',
  boxSizing: 'border-box',
};

// ─── CategoryModal ────────────────────────────────────────────────────────────

const CategoryModal = ({ category, allCategories, onClose, onSave, presetParentId }) => {
  const isEdit = !!category;
  const [form, setForm] = useState({
    name: category?.name || '',
    display_image: category?.display_image || '',
    parent_id: category?.parent_id || presetParentId || '',
    is_featured_in_nav: category?.is_featured_in_nav || false,
    order: category?.order ?? 0,
    is_active: category?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleImg = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const { compressImage, PRESET_PRODUCT } = await import('../../utils/compressImage');
      const compressed = await compressImage(file, PRESET_PRODUCT);
      setForm(p => ({ ...p, display_image: compressed }));
    } catch { toast.error('Image upload failed'); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        display_image: form.display_image || undefined,
        parent_id: form.parent_id || null,
        is_featured_in_nav: form.is_featured_in_nav,
        order: parseInt(form.order) || 0,
        is_active: form.is_active,
      };
      if (isEdit) await adminAPI.categories.update(category.id, payload);
      else await adminAPI.categories.create(payload);
      toast.success(isEdit ? 'Category updated' : 'Category created');
      onSave();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Error saving category'); }
    finally { setSaving(false); }
  };

  // Exclude self and own descendants from parent picker
  const excludeIds = new Set();
  if (isEdit) {
    excludeIds.add(category.id);
    const addDescendants = (id) => {
      allCategories.filter(c => c.parent_id === id).forEach(c => { excludeIds.add(c.id); addDescendants(c.id); });
    };
    addDescendants(category.id);
  }
  const parentOptions = allCategories.filter(c => !excludeIds.has(c.id));
  const flatParents = flattenTree(buildTree(parentOptions));
  const hasParent = !!form.parent_id;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }}
        style={{ background: '#121212', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '12px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', color: '#D4AF37', fontWeight: 600, margin: 0 }}>
            {isEdit ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={22} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Parent */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Parent Category</label>
            <select value={form.parent_id} onChange={e => setForm(p => ({ ...p, parent_id: e.target.value }))}
              style={{ ...sInput, cursor: 'pointer' }}>
              <option value="">— None (Top-Level) —</option>
              {flatParents.map(c => (
                <option key={c.id} value={c.id}>
                  {'  '.repeat(c.depth)}{c.depth > 0 ? '↳ ' : ''}{c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={sInput} placeholder="e.g. Casting Rings" />
          </div>

          {/* Image */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Display Image</label>
            {form.display_image ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={form.display_image} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)' }} />
                <button type="button" onClick={() => setForm(p => ({ ...p, display_image: '' }))} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
                <label style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: 'rgba(212,175,55,0.7)', cursor: 'pointer', textDecoration: 'underline' }}>Replace<input type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} /></label>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed rgba(212,175,55,0.3)', borderRadius: '8px', cursor: 'pointer', background: 'rgba(212,175,55,0.03)' }}>
                <Upload size={22} color="rgba(212,175,55,0.5)" style={{ marginBottom: '6px' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Click to upload</span>
                <input type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Order + Active */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Display Order</label>
              <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} min="0" style={sInput} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Visibility</label>
              <button type="button" onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', width: '100%', background: form.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.is_active ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '6px', color: form.is_active ? '#4ade80' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px' }}>
                {form.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                {form.is_active ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </div>

          {/* Featured in nav (only for non-top-level) */}
          {hasParent && (
            <div style={{ padding: '12px 14px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_featured_in_nav} onChange={e => setForm(p => ({ ...p, is_featured_in_nav: e.target.checked }))}
                  style={{ accentColor: '#D4AF37', width: '15px', height: '15px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 500 }}>Featured in Top Nav</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Show in public nav menu (max 8 per top-level category)</p>
                </div>
              </label>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: saving ? 'rgba(212,175,55,0.5)' : '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Save size={16} />{saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── AdminCategories ──────────────────────────────────────────────────────────

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | category_object | {preset_parent: id}

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminAPI.categories.getAll();
      setCategories(r.data || []);
    } catch { toast.error('Error loading categories'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This will fail if it has children or products.`)) return;
    try { await adminAPI.categories.delete(cat.id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err?.response?.data?.detail || 'Error deleting', { duration: 7000 }); }
  };

  const treeFlat = flattenTree(buildTree(categories));
  const topLevel = categories.filter(c => !c.parent_id);

  const rowStyle = (depth) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 14px',
    paddingLeft: `${14 + depth * 28}px`,
    background: depth === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
    borderBottom: '1px solid rgba(212,175,55,0.07)',
    transition: 'background 0.15s',
  });

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#D4AF37', fontWeight: 600, margin: '0 0 3px' }}>Categories</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {topLevel.length} top-level · {categories.length} total
          </p>
        </div>
        <button onClick={() => setModal('new')}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          <Plus size={16} /> Add Top-Level Category
        </button>
      </div>

      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px', padding: '10px 14px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '8px' }}>
        <Star size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: '#D4AF37' }} />
        "Featured in Nav" (max 8 per top-level): these subcategories appear in the public site's top navigation hover menu.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.35)' }}>Loading...</div>
      ) : treeFlat.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Georgia, serif', fontSize: '16px' }}>
          No categories yet.
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          {treeFlat.map((cat, idx) => (
            <motion.div key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
              style={{ ...rowStyle(cat.depth), opacity: cat.is_active ? 1 : 0.55 }}>

              {/* Depth connector */}
              {cat.depth > 0 && (
                <ChevronRight size={12} color="rgba(212,175,55,0.3)" style={{ flexShrink: 0, marginLeft: '-16px' }} />
              )}

              {/* Thumb */}
              {cat.display_image ? (
                <img src={cat.display_image} alt={cat.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0, border: '1px solid rgba(212,175,55,0.2)' }} />
              ) : (
                <div style={{ width: '36px', height: '36px', background: 'rgba(212,175,55,0.08)', borderRadius: '5px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: 'rgba(212,175,55,0.3)' }}>{cat.name.charAt(0)}</span>
                </div>
              )}

              {/* Name + badges */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: cat.depth === 0 ? '15px' : '13px', fontWeight: cat.depth === 0 ? 600 : 400, color: cat.depth === 0 ? '#fff' : 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                  {!cat.is_active && <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '20px', background: 'rgba(107,114,128,0.2)', color: '#9ca3af' }}>Hidden</span>}
                  {cat.is_featured_in_nav && <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '20px', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '3px' }}><Star size={9} />Nav Featured</span>}
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Order: {cat.order ?? 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                <button onClick={() => setModal(cat)}
                  style={{ padding: '5px 10px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setModal({ _addChild: true, parent_id: cat.id })}
                  style={{ padding: '5px 10px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '6px', color: '#D4AF37', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <Plus size={12} /> Child
                </button>
                <button onClick={() => handleDelete(cat)}
                  style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <CategoryModal
            category={typeof modal === 'object' && !modal._addChild ? modal : null}
            allCategories={categories}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); load(); }}
            presetParentId={modal?._addChild ? modal.parent_id : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
