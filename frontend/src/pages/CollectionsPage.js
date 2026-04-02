import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoriesAPI, productsAPI } from '../api';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

const CollectionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSubcategory]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedSubcategory) params.subcategory = selectedSubcategory;
      
      const response = await productsAPI.getAll(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-playfair font-bold mb-4">Our Collections</h1>
          <p className="text-gray-600 dark:text-gray-400">Explore our exquisite range of South Indian jewellery</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter size={20} className="text-gold" />
                <h3 className="font-bold text-lg">Filters</h3>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm text-gray-600 dark:text-gray-400">CATEGORY</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? 'bg-gold text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-[#D4AF37] text-black font-semibold'
                          : 'text-white hover:bg-gray-800'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategory Filter */}
              {selectedCategoryData?.subcategories?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-600 dark:text-gray-400">TYPE</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSubcategory('')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        !selectedSubcategory
                          ? 'bg-maroon text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      All
                    </button>
                    {selectedCategoryData.subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors capitalize ${
                          selectedSubcategory === sub
                            ? 'bg-maroon text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-xl h-96 animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No products found in this category.</p>
                <p className="text-sm text-gray-500 mt-2">Try selecting a different category or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                      data-testid={`product-card-${product.id}`}
                    >
                      <div className="aspect-square bg-gradient-to-br from-gold/20 to-maroon/20 overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-6xl font-playfair font-bold gold-text">
                              {product.name.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold group-hover:text-gold transition-colors">
                            {product.name}
                          </h3>
                          {product.stock_status === 'in_stock' ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">In Stock</span>
                          ) : (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Made to Order</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Weight: {product.weight}g</span>
                          <span className="capitalize">{product.purity}</span>
                        </div>
                        <div className="mt-3 text-gold font-semibold text-sm">View Details →</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;
