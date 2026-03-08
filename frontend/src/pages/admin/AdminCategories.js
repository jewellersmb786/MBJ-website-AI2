import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    display_image: '',
    subcategories: [],
    order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.categories.getAll();
      setCategories(response.data.sort((a, b) => a.order - b.order));
    } catch (error) {
      toast.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
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
    } catch (error) {
      toast.error('Error saving category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      display_image: category.display_image || '',
      subcategories: category.subcategories || [],
      order: category.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminAPI.categories.delete(id);
      toast.success('Category deleted!');
      fetchCategories();
    } catch (error) {
      toast.error('Error deleting category');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', display_image: '', subcategories: [], order: 0 });
    setEditingCategory(null);
    setShowForm(false);
  };

  const toggleSubcategory = (sub) => {
    const current = formData.subcategories || [];
    if (current.includes(sub)) {
      setFormData({ ...formData, subcategories: current.filter(s => s !== sub) });
    } else {
      setFormData({ ...formData, subcategories: [...current, sub] });
    }
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-playfair font-bold gold-text">Manage Categories</h1>
          <button
            onClick={() => setShowForm(true)}
            className="glass-gold px-6 py-3 rounded-full font-semibold text-gold hover-glow flex items-center space-x-2"
            data-testid="add-category-button"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-gold rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gold">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gold">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-xl text-white focus:ring-2 focus:ring-gold"
                    placeholder="e.g., Nakshi Jewellery"
                    required
                  />
                </div>

                {/* Display Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Display Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.display_image}
                    onChange={(e) => setFormData({ ...formData, display_image: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-xl text-white focus:ring-2 focus:ring-gold"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.display_image && (
                    <div className="mt-3">
                      <img 
                        src={formData.display_image} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-xl border border-gold/30"
                      />
                    </div>
                  )}
                </div>

                {/* Subcategories */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Subcategories
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => toggleSubcategory('men')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        (formData.subcategories || []).includes('men')
                          ? 'bg-gold text-black'
                          : 'bg-black/50 text-gray-400 border border-gold/20'
                      }`}
                    >
                      Men's
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSubcategory('women')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        (formData.subcategories || []).includes('women')
                          ? 'bg-gold text-black'
                          : 'bg-black/50 text-gray-400 border border-gold/20'
                      }`}
                    >
                      Women's
                    </button>
                  </div>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-xl text-white focus:ring-2 focus:ring-gold"
                    min="0"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gold hover:bg-gold-dark text-black py-3 rounded-full font-bold flex items-center justify-center space-x-2"
                  >
                    <Save size={20} />
                    <span>{editingCategory ? 'Update' : 'Create'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-black/50 text-gray-400 rounded-full font-semibold hover:text-gold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-400 py-20">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20">
              No categories yet. Click "Add Category" to create one.
            </div>
          ) : (
            categories.map((category) => (
              <motion.div
                key={category.id}
                className="glass rounded-2xl overflow-hidden hover-glow"
                whileHover={{ y: -5 }}
              >
                {category.display_image ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={category.display_image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gold/20 to-maroon/20 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gold/30" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gold mb-2">{category.name}</h3>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {category.subcategories.map((sub) => (
                        <span key={sub} className="text-xs bg-black/50 px-3 py-1 rounded-full text-gray-400 capitalize">
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mb-4">Order: {category.order}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 bg-gold/20 hover:bg-gold/30 text-gold py-2 rounded-lg font-semibold flex items-center justify-center space-x-2"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="px-4 bg-red-500/20 hover:bg-red-500/30 text-red-500 py-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Helper Text */}
        <div className="mt-12 glass-gold rounded-2xl p-6">
          <h3 className="font-bold text-gold mb-3">📝 How to Add Images:</h3>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>Upload your image to a public image host (e.g., imgur.com, imgbb.com)</li>
            <li>Copy the direct image URL</li>
            <li>Paste it in the "Display Image URL" field above</li>
            <li>Or use the images you've already uploaded to Emergent (check the URLs in your artifacts)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
