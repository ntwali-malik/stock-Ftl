import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { productService } from '../../services/productService';
import ProductForm from '../forms/ProductForm';
import DeleteConfirmation from '../common/DeleteConfirmation';
import './Sections.css';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError
  } = useProducts();

  const { categories } = useCategories();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCategory, setFilterCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [stockThreshold, setStockThreshold] = useState(10);
  const [showSerialModal, setShowSerialModal] = useState(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [stockOperation, setStockOperation] = useState('set');
  const [stockQuantity, setStockQuantity] = useState('');
  const [soldProducts, setSoldProducts] = useState(new Set());

  // Fetch products with filters
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);

  // Function to check which Starlink products have been sold
  const checkSoldProducts = async (products) => {
    const soldSet = new Set();
    
    for (const product of products) {
      const categoryName = product.category?.name || '';
      const isStarlinkCategory = categoryName === 'Starlink Standard V3' || 
                                categoryName === 'Starlink Mini Kit' || 
                                categoryName === 'Starlink Mini' || 
                                categoryName === 'Starlink Enterprise Kit' ||
                                categoryName === 'Starlink Ethernet Adapter' ||
                                categoryName === 'Starlink Ethernet Adapters' ||
                                categoryName === 'Satrlink Ethernet Adapter' ||
                                (categoryName.includes('Starlink') && categoryName.includes('Ethernet')) ||
                                (categoryName.includes('Starlink') && categoryName.includes('Mini')) ||
                                categoryName.includes('Starlink');
      
      // Debug logging
      console.log('Products - Product:', product.name, 'Category:', categoryName, 'Is Starlink:', isStarlinkCategory);
      
      if (isStarlinkCategory && (product.quantity || 0) === 0) {
        try {
          const { stockMovementService } = await import('../../services/stockMovementService');
          const movements = await stockMovementService.getMovements({ product: product._id });
          const hasSales = movements.some(movement => movement.movementType === 'SALE');
          
          if (hasSales) {
            soldSet.add(product._id);
          }
        } catch (error) {
          console.error('Error checking sales for product:', product._id, error);
        }
      }
    }
    
    setSoldProducts(soldSet);
  };

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setFilterLoading(true);
      try {
        let result;
        
        if (showLowStock) {
          result = await productService.getLowStockProducts(stockThreshold);
        } else {
          const filters = {};
          if (searchTerm) filters.search = searchTerm;
          if (filterCategory) filters.category = filterCategory;
          if (minPrice) filters.minPrice = parseFloat(minPrice);
          if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
          
          result = await productService.getProducts(filters);
        }
        
        setFilteredProducts(result);
        
        // Check which Starlink products have been sold
        await checkSoldProducts(result);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
        setFilteredProducts([]);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [searchTerm, filterCategory, minPrice, maxPrice, showLowStock, stockThreshold]);

  // Sort products client-side (since backend doesn't handle sorting)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'category':
        aValue = a.category?.name || '';
        bValue = b.category?.name || '';
        break;
      case 'purchasePrice':
        aValue = a.purchasePrice || 0;
        bValue = b.purchasePrice || 0;
        break;
      case 'sellingPrice':
        aValue = a.sellingPrice || 0;
        bValue = b.sellingPrice || 0;
        break;
      case 'quantity':
        aValue = a.quantity || 0;
        bValue = b.quantity || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleCreateProduct = async (productData) => {
    try {
      await createProduct(productData);
      setShowForm(false);
      
      // Refresh the filtered products to show the new product
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCategory) filters.category = filterCategory;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
      const result = await productService.getProducts(filters);
      setFilteredProducts(result);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      await updateProduct(editingProduct._id, productData);
      setEditingProduct(null);
      
      // Refresh the filtered products to show the updated product
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCategory) filters.category = filterCategory;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
      const result = await productService.getProducts(filters);
      setFilteredProducts(result);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(deleteConfirm._id);
      setDeleteConfirm(null);
      
      // Refresh the filtered products to remove the deleted product
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCategory) filters.category = filterCategory;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
      const result = await productService.getProducts(filters);
      setFilteredProducts(result);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleDeleteClick = (product) => {
    setDeleteConfirm(product);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleUpdateStock = async (productId, quantity, operation) => {
    try {
      await productService.updateStock(productId, quantity, operation);
      // Refresh the filtered products
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCategory) filters.category = filterCategory;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
      const result = await productService.getProducts(filters);
      setFilteredProducts(result);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleAddSerialNumber = async (productId) => {
    try {
      await productService.addSerialNumber(productId, serialNumber);
      setSerialNumber('');
      setShowSerialModal(null);
      // Refresh the filtered products
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCategory) filters.category = filterCategory;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
      const result = await productService.getProducts(filters);
      setFilteredProducts(result);
    } catch (error) {
      console.error('Error adding serial number:', error);
    }
  };

  const handleRemoveSerialNumber = async (productId, serialNumber) => {
    try {
      await productService.removeSerialNumber(productId, serialNumber);
      // Refresh the filtered products
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCategory) filters.category = filterCategory;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
      const result = await productService.getProducts(filters);
      setFilteredProducts(result);
    } catch (error) {
      console.error('Error removing serial number:', error);
    }
  };

  const handleStockOperation = async (productId) => {
    const quantity = parseFloat(stockQuantity);
    if (isNaN(quantity)) {
      alert('Please enter a valid quantity');
      return;
    }
    
    // Find the product to check its category
    const product = sortedProducts.find(p => p._id === productId);
    if (product) {
      const categoryName = product.category?.name || '';
      const isStarlinkCategory = categoryName === 'Starlink Standard V3' || 
                                categoryName === 'Starlink Mini Kit' || 
                                categoryName === 'Starlink Mini' || 
                                categoryName === 'Starlink Enterprise Kit' ||
                                categoryName === 'Starlink Ethernet Adapter' ||
                                categoryName === 'Starlink Ethernet Adapters' ||
                                categoryName === 'Satrlink Ethernet Adapter' ||
                                (categoryName.includes('Starlink') && categoryName.includes('Ethernet')) ||
                                (categoryName.includes('Starlink') && categoryName.includes('Mini')) ||
                                categoryName.includes('Starlink');
      
      if (isStarlinkCategory) {
        const currentQuantity = product.quantity || 0;
        const isOutOfStock = currentQuantity === 0;
        const isSold = soldProducts.has(productId);
        
        // Check if this Starlink product has been sold
        if (isSold) {
          alert(`This ${categoryName} product has been sold and cannot be restocked. Each Starlink product is unique and once sold, it cannot be added back to inventory.`);
          return;
        }
        
        // For Starlink categories, check if adding would exceed 1
        if (stockOperation === 'add') {
          const newQuantity = currentQuantity + quantity;
          if (newQuantity > 1) {
            alert(`Maximum quantity for ${categoryName} is 1. Cannot add more.`);
            return;
          }
        } else if (stockOperation === 'set') {
          if (quantity > 1) {
            alert(`Maximum quantity for ${categoryName} is 1.`);
            return;
          }
        }
      }
    }
    
    await handleUpdateStock(productId, quantity, stockOperation);
    setStockQuantity('');
    setStockOperation('set');
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const calculateProfitMargin = (purchasePrice, sellingPrice) => {
    if (!purchasePrice || !sellingPrice) return null;
    const profit = sellingPrice - purchasePrice;
    const margin = (profit / purchasePrice) * 100;
    return { profit, margin };
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="section-container">
        <div className="loading-message">
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="header-content">
          <div>
            <h1>Products Management</h1>
            <p>Manage your product inventory, pricing, and categories.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            + Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}

      <div className="section-content">
        {/* Search and Filter Controls */}
        <div className="controls-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-controls">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="price-filter-controls">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="price-input"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-input"
            />
          </div>

          <div className="low-stock-controls">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              Low Stock
            </label>
            {showLowStock && (
              <input
                type="number"
                placeholder="Threshold"
                value={stockThreshold}
                onChange={(e) => setStockThreshold(parseInt(e.target.value) || 10)}
                className="threshold-input"
                min="1"
              />
            )}
          </div>
          
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="purchasePrice">Sort by Purchase Price</option>
              <option value="sellingPrice">Sort by Selling Price</option>
              <option value="quantity">Sort by Stock</option>
              <option value="createdAt">Sort by Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-btn"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="products-container">
          {filterLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>
                {searchTerm || filterCategory || minPrice || maxPrice || showLowStock
                  ? 'No products match your search criteria.' 
                  : 'Get started by creating your first product.'
                }
              </p>
              {!searchTerm && !filterCategory && !minPrice && !maxPrice && !showLowStock && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Create First Product
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map((product) => {
                // const profitData = calculateProfitMargin(product.purchasePrice, product.sellingPrice);
                
                return (
                  <div key={product._id} className="product-card">
                    <div className="product-header">
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <span className="product-category">
                          {getCategoryName(product.category?._id || product.category)}
                        </span>
                      </div>
                      <div className="product-date">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="product-pricing">
                      <div className="price-item">
                        <span className="price-label">Purchase:</span>
                        <span className="price-value purchase">{product.purchasePrice?.toLocaleString()} RWF</span>
                      </div>
                    </div>

                    <div className="product-stock">
                      <div className="stock-info">
                        <span className="stock-label">Stock:</span>
                        <span className={`stock-value ${product.quantity <= 10 ? 'low-stock' : ''}`}>
                          {product.quantity || 0}
                        </span>
                      </div>
                      {product.items && product.items.length > 0 && (
                        <div className="serial-info">
                          <span className="serial-label">Serial Items:</span>
                          <span className="serial-value">{product.items.length}</span>
                        </div>
                      )}
                    </div>

                    {/* Stock Management Controls */}
                    <div className="stock-controls">
                      {(() => {
                        const categoryName = getCategoryName(product.category?._id || product.category);
                        const isStarlinkCategory = categoryName === 'Starlink Standard V3' || 
                                                  categoryName === 'Starlink Mini Kit' || 
                                categoryName === 'Starlink Mini' || 
                                                  categoryName === 'Starlink Enterprise Kit' ||
                                                  categoryName === 'Starlink Ethernet Adapter' ||
                                categoryName === 'Starlink Ethernet Adapters' ||
                                                  categoryName === 'Satrlink Ethernet Adapter' ||
                                (categoryName.includes('Starlink') && categoryName.includes('Ethernet')) ||
                                (categoryName.includes('Starlink') && categoryName.includes('Mini')) ||
                                categoryName.includes('Starlink');
                        
                        // Debug logging
                        console.log('Products - Stock controls - Product:', product.name, 'Category:', categoryName, 'Is Starlink:', isStarlinkCategory);
                        
                        const currentQuantity = product.quantity || 0;
                        const isOutOfStock = currentQuantity === 0;
                        const isSold = soldProducts.has(product._id);
                        
                        // For Starlink products, distinguish between new (qty 0, no sales) and sold (qty 0, has sales)
                        const isSoldStarlink = isStarlinkCategory && isSold;
                        const isNewStarlink = isStarlinkCategory && isOutOfStock && !isSold;
                        
                        return (
                          <>
                            {isStarlinkCategory && (
                              <div className={`stock-limit-warning ${isSoldStarlink ? 'sold-warning' : isNewStarlink ? 'new-warning' : ''}`}>
                                <span className="limit-icon">
                                  {isSoldStarlink ? '🚫' : isNewStarlink ? '⚠️' : '⚠️'}
                                </span>
                                <span className="limit-text">
                                  {isSoldStarlink ? 'SOLD - No adjustments allowed' : isNewStarlink ? 'New product - Max quantity: 1' : 'Max quantity: 1'}
                                </span>
                              </div>
                            )}
                            
                            {isSoldStarlink ? (
                              <div className="stock-disabled-message">
                                <span className="disabled-icon">🔒</span>
                                <span className="disabled-text">This Starlink product has been sold and cannot be restocked</span>
                              </div>
                            ) : isNewStarlink ? (
                              <div className="stock-warning-message">
                                <span className="warning-icon">ℹ️</span>
                                <span className="warning-text">This is a new Starlink product. You can add quantity to make it available.</span>
                              </div>
                            ) : null}
                            
                            {!isSoldStarlink && (
                              <div className="stock-input-group">
                                <select
                                  value={stockOperation}
                                  onChange={(e) => setStockOperation(e.target.value)}
                                  className="stock-operation-select"
                                >
                                  <option value="set">Set</option>
                                  <option value="add">Add</option>
                                  <option value="subtract">Subtract</option>
                                </select>
                                <input
                                  type="number"
                                  placeholder="Qty"
                                  value={stockQuantity}
                                  onChange={(e) => setStockQuantity(e.target.value)}
                                  className="stock-quantity-input"
                                  min="0"
                                  max={isStarlinkCategory ? "1" : undefined}
                                />
                                <button
                                  onClick={() => handleStockOperation(product._id)}
                                  className="btn btn-sm btn-secondary"
                                  disabled={!stockQuantity || isNaN(parseFloat(stockQuantity))}
                                >
                                  Update
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Serial Number Management */}
                    {product.items && product.items.length > 0 && (
                      <div className="serial-numbers">
                        <div className="serial-header">
                          <span>Serial Numbers:</span>
                          <button
                            onClick={() => setShowSerialModal(product._id)}
                            className="btn btn-sm btn-outline"
                          >
                            + Add
                          </button>
                        </div>
                        <div className="serial-list">
                          {product.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="serial-item">
                              <span className="serial-number">{item.serialNumber}</span>
                              <span className={`serial-status ${item.isAvailable ? 'available' : 'unavailable'}`}>
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                              <button
                                onClick={() => handleRemoveSerialNumber(product._id, item.serialNumber)}
                                className="btn btn-sm btn-danger"
                                title="Remove serial number"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {product.items.length > 3 && (
                            <div className="serial-more">
                              +{product.items.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="product-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditProduct(product)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteClick(product)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Statistics - Hidden for Technicians */}
        {sortedProducts.length > 0 && user?.role?.toLowerCase() !== 'technician' && (
          <div className="products-stats">
            <div className="stat-item">
              <span className="stat-number">{sortedProducts.length}</span>
              <span className="stat-label">Filtered Products</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{sortedProducts.filter(p => p.sellingPrice).length}</span>
              <span className="stat-label">With Selling Price</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {sortedProducts.reduce((sum, p) => sum + (p.purchasePrice || 0), 0).toLocaleString()} RWF
              </span>
              <span className="stat-label">Total Investment</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {sortedProducts.filter(p => (p.quantity || 0) <= 10).length}
              </span>
              <span className="stat-label">Low Stock Items</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {sortedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0)}
              </span>
              <span className="stat-label">Total Stock</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          onSubmit={handleCreateProduct}
          onCancel={handleCancelForm}
          loading={loading}
          error={error}
          existingProducts={products}
          categories={categories}
        />
      )}

      {/* Edit Product Form Modal */}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleUpdateProduct}
          onCancel={handleCancelForm}
          loading={loading}
          error={error}
          existingProducts={products}
          categories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmation
          isOpen={!!deleteConfirm}
          onConfirm={handleDeleteProduct}
          onCancel={handleCancelDelete}
          title="Delete Product"
          message="Are you sure you want to delete this product?"
          itemName={deleteConfirm.name}
          loading={loading}
        />
      )}

      {/* Serial Number Modal */}
      {showSerialModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Serial Number</h3>
              <button
                onClick={() => {
                  setShowSerialModal(null);
                  setSerialNumber('');
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="serialNumber">Serial Number:</label>
                <input
                  type="text"
                  id="serialNumber"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Enter serial number"
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowSerialModal(null);
                  setSerialNumber('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddSerialNumber(showSerialModal)}
                className="btn btn-primary"
                disabled={!serialNumber.trim()}
              >
                Add Serial Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;