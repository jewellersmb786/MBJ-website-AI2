import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI, categoriesAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, Save, Package } from 'lucide-react';
import toast from 'react-hot-toast';

// Build tree + flatten helpers
const buildCatTree = (cats) => {
  const roots = cats.filter(c => !c.parent_id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const addChildren = (nodes, depth = 0) =>
    nodes.map(n => ({
      ...n, depth,
      children: addChildren(cats.filter(c => c.parent_id === n.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), depth + 1),
    }));
  return addChildren(roots);
};
const flattenCatTree = (nodes, result = []) => {
  for (const n of nodes) { result.push(n); flattenCatTree(n.children, result); }
  return result;
};

const AdminProducts = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formFilterAttrs, setFormFilterAttrs] = useState([]);
  const [formAttrValues, setFormAttrValues] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: '',
    purity: '22k',
    wastage_percent: '',
    making_charges: '',
    stone_charges: '',
    stock_status: 'in_stock',
    is_featured: false,
    image_dummy: '',
    image_model: '',
    item_code: '',
    instagram_url: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.categories.getAll();
      setCategories(response.data || []);
      const tops = (response.data || []).filter(c => !c.parent_id);
      if (tops.length) setSelectedCategory(tops[0]);
    } catch {
      toast.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      const response = await adminAPI.products.getAll({ category_id: categoryId });
      setProducts(response.data);
    } catch {
      toast.error('Error fetching products');
    }
  };

  // Fetch filter attributes when form category changes
  const loadFormFilterAttrs = useCallback(async (catId) => {
    if (!catId) { setFormFilterAttrs([]); return; }
    try {
      const r = await adminAPI.filterAttributes.getByCategory(catId);
      setFormFilterAttrs((r.data || []).filter(a => a.is_active));
    } catch {
      setFormFilterAttrs([]);
    }
  }, []);

  useEffect(() => { loadFormFilterAttrs(formCategoryId); }, [formCategoryId, loadFormFilterAttrs]);

  const handleSingleImageUpload = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    const defaultCatId = selectedCategory?.id || '';
    setFormCategoryId(defaultCatId);
    setFormAttrValues({});
    setFormData({
      name: '',
      description: '',
      weight: '',
      purity: '22k',
      wastage_percent: '',
      making_charges: '',
      stone_charges: '',
      stock_status: 'in_stock',
      is_featured: false,
      image_dummy: '',
      image_model: '',
      item_code: '',
      instagram_url: '',
    });
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormCategoryId(product.category_id || '');
    setFormAttrValues(product.attribute_values || {});
    setFormData({
      name: product.name,
      description: product.description || '',
      weight: String(product.weight ?? ''),
      purity: product.purity,
      wastage_percent: String(product.wastage_percent ?? ''),
      making_charges: String(product.making_charges ?? ''),
      stone_charges: String(product.stone_charges ?? ''),
      stock_status: product.stock_status,
      is_featured: product.is_featured,
      image_dummy: product.image_dummy || '',
      image_model: product.image_model || '',
      item_code: product.item_code || '',
      instagram_url: product.instagram_url || '',
    });
    setShowProductModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    if (!formCategoryId) { toast.error('Please select a category'); return; }
    try {
      const payload = {
        ...formData,
        category_id: formCategoryId,
        weight: parseFloat(formData.weight) || 0,
        wastage_percent: parseFloat(formData.wastage_percent) || 0,
        making_charges: parseFloat(formData.making_charges) || 0,
        stone_charges: parseFloat(formData.stone_charges) || 0,
        attribute_values: formAttrValues,
      };

      if (editingProduct) {
        await adminAPI.products.update(editingProduct.id, payload);
        toast.success('Product updated successfully!');
      } else {
        await adminAPI.products.create(payload);
        toast.success('Product added successfully!');
      }

      setShowProductModal(false);
      fetchProducts(selectedCategory?.id || formCategoryId);
    } catch {
      toast.error('Error saving product');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.products.delete(productId);
        toast.success('Product deleted');
        fetchProducts(selectedCategory.id);
      } catch (error) {
        toast.error('Error deleting product');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[#D4AF37] text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-playfair font-bold text-[#D4AF37] mb-2">Manage Products</h1>
        <p className="text-gray-400">Add and manage products by category</p>
      </div>

      {/* Category Tabs — top-level only */}
      <div className="bg-black/50 border border-[#D4AF37]/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.filter(c => !c.parent_id).map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedCategory?.id === category.id
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-black/50 text-gray-400 hover:text-white border border-[#D4AF37]/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Products in {selectedCategory.name} ({products.length})
            </h2>
            <button
              onClick={openAddModal}
              className="bg-[#D4AF37] hover:bg-[#B8960F] text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="bg-black/30 border border-[#D4AF37]/20 rounded-2xl p-12 text-center">
              <Package size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No products in this category yet</p>
              <button
                onClick={openAddModal}
                className="mt-4 text-[#D4AF37] hover:underline"
              >
                Add your first product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/50 border border-[#D4AF37]/20 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-[#D4AF37]/10 to-[#800020]/10 relative">
                    {(product.image_dummy || (product.images && product.images[0])) ? (
                      <img
                        src={product.image_dummy || product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl font-playfair font-bold text-[#D4AF37]/30">
                        {product.name.charAt(0)}
                      </div>
                    )}
                    {product.is_featured && (
                      <div className="absolute top-2 left-2 bg-[#D4AF37] text-black px-3 py-1 rounded-full text-xs font-bold">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white truncate">{product.name}</h3>
                      {product.item_code && (
                        <span style={{ fontSize: '11px', padding: '2px 7px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '4px', color: '#D4AF37', fontWeight: 600, flexShrink: 0 }}>{product.item_code}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
                      <div>Weight: <span className="text-white">{product.weight}g</span></div>
                      <div>Purity: <span className="text-white">{product.purity.toUpperCase()}</span></div>
                      <div>Wastage: <span className="text-white">{product.wastage_percent}%</span></div>
                      <div>Stone: <span className="text-white">₹{product.stone_charges}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ width: '100%', maxWidth: '800px', background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '32px', boxSizing: 'border-box', margin: '32px 0' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#D4AF37]">
                  {editingProduct ? 'Edit Product' : 'Add New Product'} - {selectedCategory?.name}
                </h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category picker (tree dropdown) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Category *</label>
                  <select value={formCategoryId} onChange={e => { setFormCategoryId(e.target.value); setFormAttrValues({}); }}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: formCategoryId ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                    <option value="">— Select category —</option>
                    {flattenCatTree(buildCatTree(categories)).map(c => (
                      <option key={c.id} value={c.id}>
                        {'  '.repeat(c.depth)}{c.depth > 0 ? '↳ ' : ''}{c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                    placeholder="e.g., Nakshi Necklace"
                    required
                  />
                </div>

                {/* Description */}
                <div style={{ display: 'block' }}>
                  <label className="block text-sm font-semibold text-gray-300" style={{ marginBottom: '8px' }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description..."
                    style={{ width: '100%', minHeight: '120px', padding: '12px', lineHeight: 1.5, boxSizing: 'border-box', resize: 'vertical', overflowY: 'auto', flexShrink: 0, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', display: 'block' }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Weight (grams) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Purity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Purity *</label>
                    <select
                      value={formData.purity}
                      onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="24k">24K</option>
                      <option value="22k">22K</option>
                      <option value="18k">18K</option>
                    </select>
                  </div>

                  {/* Wastage % */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Wastage %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.wastage_percent}
                      onChange={(e) => setFormData({ ...formData, wastage_percent: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Making Charges */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Making Charges (₹/g)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.making_charges}
                      onChange={(e) => setFormData({ ...formData, making_charges: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Stone Charges */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Stone/Beads Charges (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.stone_charges}
                      onChange={(e) => setFormData({ ...formData, stone_charges: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Stock Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Stock Status</label>
                    <select
                      value={formData.stock_status}
                      onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="made_to_order">Made to Order</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 rounded border-[#D4AF37]/30 bg-black/50 text-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]"
                  />
                  <label htmlFor="is_featured" className="text-sm font-semibold text-gray-300">
                    Mark as Featured Product
                  </label>
                </div>

                {/* Item Code + Instagram URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Item Code
                    </label>
                    <input
                      type="text"
                      value={formData.item_code}
                      onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="Auto-generated if blank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Instagram URL <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="Paste Instagram reel/post URL"
                    />
                  </div>
                </div>

                {/* Image Uploads: Dummy + Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { field: 'image_dummy', label: 'Dummy view', sub: 'Item on stand / bust' },
                    { field: 'image_model', label: 'Model view', sub: 'Item on a person' },
                  ].map(({ field, label, sub }) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">{label}</label>
                      <p className="text-xs text-gray-500 mb-2">{sub}</p>
                      {formData[field] ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={formData[field]}
                            alt={label}
                            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(212,175,55,0.3)', display: 'block' }}
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, [field]: '' })}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          >
                            <X size={13} />
                          </button>
                          <label style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: 'rgba(212,175,55,0.7)', cursor: 'pointer', textDecoration: 'underline' }}>
                            Replace
                            <input type="file" accept="image/*" onChange={handleSingleImageUpload(field)} style={{ display: 'none' }} />
                          </label>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#D4AF37]/30 rounded-xl cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                          <Upload className="w-7 h-7 text-gray-400 mb-1" />
                          <p className="text-sm text-gray-400">Click to upload</p>
                          <input type="file" accept="image/*" onChange={handleSingleImageUpload(field)} className="hidden" />
                        </label>
                      )}
                    </div>
                  ))}
                </div>

                {/* Attribute Values */}
                {formFilterAttrs.length > 0 && (
                  <div style={{ padding: '16px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(212,175,55,0.7)', marginBottom: '14px', fontWeight: 600 }}>Product Attributes</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formFilterAttrs.map(attr => (
                        <div key={attr.id}>
                          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{attr.display_name || attr.name}</label>
                          <select value={formAttrValues[attr.name] || ''} onChange={e => setFormAttrValues(p => e.target.value ? { ...p, [attr.name]: e.target.value } : Object.fromEntries(Object.entries(p).filter(([k]) => k !== attr.name)))}
                            style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '8px', color: formAttrValues[attr.name] ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                            <option value="">— Not specified —</option>
                            {(attr.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#D4AF37] hover:bg-[#B8960F] text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Save size={20} />
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;