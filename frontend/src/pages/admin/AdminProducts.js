import React, { useState, useEffect } from 'react';
import { adminAPI, categoriesAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, Save, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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
    images: []
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
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
      if (response.data.length > 0) {
        setSelectedCategory(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      const response = await adminAPI.products.getAll({ category_id: categoryId });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(images => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...images]
      }));
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
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
      images: []
    });
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      weight: product.weight,
      purity: product.purity,
      wastage_percent: product.wastage_percent,
      making_charges: product.making_charges,
      stone_charges: product.stone_charges,
      stock_status: product.stock_status,
      is_featured: product.is_featured,
      images: product.images || []
    });
    setShowProductModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    try {
      const payload = {
        ...formData,
        category_id: selectedCategory.id,
        weight: parseFloat(formData.weight),
        wastage_percent: parseFloat(formData.wastage_percent || 0),
        making_charges: parseFloat(formData.making_charges || 0),
        stone_charges: parseFloat(formData.stone_charges || 0)
      };

      if (editingProduct) {
        await adminAPI.products.update(editingProduct.id, payload);
        toast.success('Product updated successfully!');
      } else {
        await adminAPI.products.create(payload);
        toast.success('Product added successfully!');
      }

      setShowProductModal(false);
      fetchProducts(selectedCategory.id);
    } catch (error) {
      toast.error('Error saving product');
      console.error(error);
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

      {/* Category Tabs */}
      <div className="bg-black/50 border border-[#D4AF37]/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((category) => (
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
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
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
                    <h3 className="text-lg font-bold text-white mb-2 truncate">{product.name}</h3>
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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-2xl p-8 max-w-3xl w-full my-8"
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
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]"
                    placeholder="Product description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Product Images</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#D4AF37]/30 rounded-xl cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">Click to upload images (multiple)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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