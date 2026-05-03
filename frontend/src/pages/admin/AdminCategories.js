import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, Save, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const PRESET_SUBCATS = ['men', 'women', 'kids', 'unisex', 'couple sets'];

const getNameSuggestions = (name) => {
  const n = name.toLowerCase();
  if (/necklace|pendant|chain|bracelet/.test(n)) return ['men', 'women'];
  if (/bangle|earring|jhumka|maang|bridal|haram|nakshi|antique/.test(n)) return ['women'];
  return [];
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [subcatAutoMode, setSubcatAutoMode] = useState(true);
  const [customSubInput, setCustomSubInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    display_image: '',
    subcategories: [],
    order: 0,
    is_active: true,
  });

  useEffect(() => { fetchCategories(); }, []);

  // Auto-suggest subcategories for new categories
  useEffect(() => {
    if (!editingCategory && subcatAutoMode && formData.name) {
      setFormData(prev => ({ ...prev, subcategories: getNameSuggestions(prev.name) }));
    }
  }, [formData.name, editingCategory, subcatAutoMode]);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.categories.getAll();
      setCategories(response.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch {
      toast.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, display_image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminAPI.categories.update(editingCategory.id, formData);
        toast.success('Category updated!');
      } else {
        await adminAPI.categories.create(formData);
        toast.success('Category created!');
      }
      resetForm();
      fetchCategories();
    } catch {
      toast.error('Error saving category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setSubcatAutoMode(false);
    setCustomSubInput('');
    setFormData({
      name: category.name,
      display_image: category.display_image || '',
      subcategories: category.subcategories || [],
      order: category.order ?? 0,
      is_active: category.is_active ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await adminAPI.categories.delete(id);
      toast.success('Category deleted!');
      fetchCategories();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error deleting category';
      toast.error(msg, { duration: 7000 });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', display_image: '', subcategories: [], order: 0, is_active: true });
    setEditingCategory(null);
    setSubcatAutoMode(true);
    setCustomSubInput('');
    setShowForm(false);
  };

  const toggleSubcat = (sub) => {
    setSubcatAutoMode(false);
    setFormData(prev => {
      const current = prev.subcategories || [];
      return {
        ...prev,
        subcategories: current.includes(sub)
          ? current.filter(s => s !== sub)
          : [...current, sub],
      };
    });
  };

  const addCustomSubcat = () => {
    const val = customSubInput.trim().toLowerCase();
    if (!val) return;
    setSubcatAutoMode(false);
    setFormData(prev => {
      const current = prev.subcategories || [];
      if (current.includes(val)) return prev;
      return { ...prev, subcategories: [...current, val] };
    });
    setCustomSubInput('');
  };

  const removeSubcat = (sub) => {
    setSubcatAutoMode(false);
    setFormData(prev => ({ ...prev, subcategories: (prev.subcategories || []).filter(s => s !== sub) }));
  };

  const sInput = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.25)',
    color: '#fff', fontSize: '14px', outline: 'none', borderRadius: '6px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '32px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: '#D4AF37', fontWeight: 600, margin: '0 0 4px' }}>Manage Categories</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              {categories.length} categories · {categories.filter(c => c.is_active !== false).length} active
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            data-testid="add-category-button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={18} /> Add Category
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              style={{ background: '#121212', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '12px', padding: '32px', maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', color: '#D4AF37', fontWeight: 600, margin: 0 }}>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Nakshi Necklaces"
                    required
                    style={sInput}
                  />
                </div>

                {/* Display Image Upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                    Category Image
                  </label>
                  {formData.display_image ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={formData.display_image}
                        alt="Preview"
                        style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)', display: 'block' }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, display_image: '' }))}
                        style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={14} />
                      </button>
                      <label
                        style={{ display: 'block', marginTop: '8px', fontSize: '12px', color: 'rgba(212,175,55,0.7)', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Replace image
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <label
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '120px', border: '2px dashed rgba(212,175,55,0.3)', borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.2s', background: 'rgba(212,175,55,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
                    >
                      <Upload size={24} color="rgba(212,175,55,0.5)" style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Click to upload image</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>JPG, PNG, WEBP</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* Subcategories */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>
                    Subcategories
                  </label>

                  {/* Selected chips */}
                  {(formData.subcategories || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {(formData.subcategories || []).map(sub => (
                        <span
                          key={sub}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '20px', fontSize: '12px', color: '#D4AF37', textTransform: 'capitalize' }}
                        >
                          {sub}
                          <button
                            type="button"
                            onClick={() => removeSubcat(sub)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgba(212,175,55,0.6)', lineHeight: 1, display: 'flex' }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Preset buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {PRESET_SUBCATS.map(sub => {
                      const selected = (formData.subcategories || []).includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubcat(sub)}
                          style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${selected ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.2)'}`, background: selected ? 'rgba(212,175,55,0.15)' : 'transparent', color: selected ? '#D4AF37' : 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.18s' }}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom input */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={customSubInput}
                      onChange={e => setCustomSubInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSubcat())}
                      placeholder="Add custom (e.g. temple, traditional)"
                      style={{ ...sInput, flex: 1, padding: '8px 12px', fontSize: '13px' }}
                    />
                    <button
                      type="button"
                      onClick={addCustomSubcat}
                      style={{ padding: '8px 14px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Order + is_active row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      min="0"
                      style={sInput}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                      Show on Website
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', width: '100%', background: formData.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${formData.is_active ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '6px', color: formData.is_active ? '#4ade80' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
                    >
                      {formData.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                      {formData.is_active ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                  <button
                    type="submit"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Save size={18} />
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Categories grid */}
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '60px 0' }}>Loading...</div>
        ) : categories.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '60px 0', fontSize: '15px' }}>
            No categories yet. Click "Add Category" to create one.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {categories.map(category => (
              <motion.div
                key={category.id}
                whileHover={{ y: -4 }}
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${category.is_active === false ? 'rgba(255,255,255,0.08)' : 'rgba(212,175,55,0.18)'}`, borderRadius: '10px', overflow: 'hidden', opacity: category.is_active === false ? 0.6 : 1 }}
              >
                {/* Image */}
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
                  {category.display_image ? (
                    <img
                      src={category.display_image}
                      alt={category.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,0.05)' }}>
                      <span style={{ fontSize: '36px', fontFamily: 'Georgia, serif', color: 'rgba(212,175,55,0.2)' }}>{category.name.charAt(0)}</span>
                    </div>
                  )}
                  {category.is_active === false && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <EyeOff size={10} /> Hidden
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '16px', color: '#D4AF37', fontWeight: 600, margin: '0 0 6px' }}>{category.name}</h3>
                  {(category.subcategories || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                      {category.subcategories.map(sub => (
                        <span key={sub} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', textTransform: 'capitalize' }}>{sub}</span>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', margin: '0 0 14px' }}>Order: {category.order ?? 0}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(category)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.1)'}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
