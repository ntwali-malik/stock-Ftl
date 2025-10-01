import React, { useState, useEffect } from 'react';
import './ProductForm.css';

const ProductForm = ({ 
  product = null, 
  onSubmit, 
  onCancel, 
  loading = false, 
  error = null,
  existingProducts = [],
  categories = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchasePrice: '',
    sellingPrice: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category?._id || product.category || '',
        purchasePrice: product.purchasePrice || '',
        sellingPrice: product.sellingPrice || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // If category changes and we have a name, re-validate the name
    if (name === 'category' && formData.name.trim()) {
      const trimmedName = formData.name.trim();
      
      // Get selected category name
      const selectedCategory = categories.find(cat => cat._id === value);
      const categoryName = selectedCategory?.name || '';
      
      // Check if this is a Starlink category
      const isStarlinkCategory = categoryName === 'Starlink Standard V3' || 
                                categoryName === 'Starlink Mini Kit' || 
                                categoryName === 'Starlink Enterprise Kit' ||
                                categoryName === 'Starlink Ethernet Adapter' ||
                                categoryName === 'Satrlink Ethernet Adapter';
      
      if (isStarlinkCategory) {
        // For Starlink products, check for any duplicate name (strict uniqueness)
        const isDuplicate = existingProducts.some(existingProduct => 
          existingProduct.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!product || existingProduct._id !== product._id)
        );
        
        if (isDuplicate) {
          setFormErrors(prev => ({
            ...prev,
            name: `A ${categoryName} product with this name already exists. Each Starlink product must be unique.`
          }));
        }
      }
    }

    // Real-time validation for name field
    if (name === 'name' && value.trim()) {
      const trimmedName = value.trim();
      
      // Get selected category name
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      const categoryName = selectedCategory?.name || '';
      
      // Check if this is a Starlink category
      const isStarlinkCategory = categoryName === 'Starlink Standard V3' || 
                                categoryName === 'Starlink Mini Kit' || 
                                categoryName === 'Starlink Enterprise Kit' ||
                                categoryName === 'Starlink Ethernet Adapter' ||
                                categoryName === 'Satrlink Ethernet Adapter';
      
      if (isStarlinkCategory) {
        // For Starlink products, check for any duplicate name (strict uniqueness)
        const isDuplicate = existingProducts.some(existingProduct => 
          existingProduct.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!product || existingProduct._id !== product._id)
        );
        
        if (isDuplicate) {
          setFormErrors(prev => ({
            ...prev,
            name: `A ${categoryName} product with this name already exists. Each Starlink product must be unique.`
          }));
        }
      } else {
        // For non-Starlink products, allow duplicates (existing behavior)
        const isDuplicate = existingProducts.some(existingProduct => 
          existingProduct.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!product || existingProduct._id !== product._id)
        );
        
        if (isDuplicate) {
          setFormErrors(prev => ({
            ...prev,
            name: 'A product with this name already exists. Please choose a different name.'
          }));
        }
      }
    }

    // Real-time validation for price fields
    if (name === 'purchasePrice' || name === 'sellingPrice') {
      const numValue = parseFloat(value);
      if (value && (isNaN(numValue) || numValue < 0)) {
        setFormErrors(prev => ({
          ...prev,
          [name]: 'Price must be a valid positive number.'
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Product name must be at least 2 characters';
    } else {
      // Get selected category name
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      const categoryName = selectedCategory?.name || '';
      
      // Check if this is a Starlink category
      const isStarlinkCategory = categoryName === 'Starlink Standard V3' || 
                                categoryName === 'Starlink Mini Kit' || 
                                categoryName === 'Starlink Enterprise Kit' ||
                                categoryName === 'Starlink Ethernet Adapter' ||
                                categoryName === 'Satrlink Ethernet Adapter';
      
      if (isStarlinkCategory) {
        // For Starlink products, check for any duplicate name (strict uniqueness)
        const trimmedName = formData.name.trim();
        const isDuplicate = existingProducts.some(existingProduct => 
          existingProduct.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!product || existingProduct._id !== product._id)
        );
        
        if (isDuplicate) {
          errors.name = `A ${categoryName} product with this name already exists. Each Starlink product must be unique.`;
        }
      } else {
        // For non-Starlink products, allow duplicates (existing behavior)
        const trimmedName = formData.name.trim();
        const isDuplicate = existingProducts.some(existingProduct => 
          existingProduct.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!product || existingProduct._id !== product._id)
        );
        
        if (isDuplicate) {
          errors.name = 'A product with this name already exists. Please choose a different name.';
        }
      }
    }

    // Category validation
    if (!formData.category) {
      errors.category = 'Please select a category';
    }

    // Purchase price validation
    if (!formData.purchasePrice) {
      errors.purchasePrice = 'Purchase price is required';
    } else {
      const purchasePrice = parseFloat(formData.purchasePrice);
      if (isNaN(purchasePrice) || purchasePrice <= 0) {
        errors.purchasePrice = 'Purchase price must be a valid positive number';
      }
    }

    // Selling price validation (optional but must be valid if provided)
    if (formData.sellingPrice) {
      const sellingPrice = parseFloat(formData.sellingPrice);
      if (isNaN(sellingPrice) || sellingPrice < 0) {
        errors.sellingPrice = 'Selling price must be a valid positive number';
      } else if (formData.purchasePrice) {
        const purchasePrice = parseFloat(formData.purchasePrice);
        if (sellingPrice < purchasePrice) {
          errors.sellingPrice = 'Selling price should not be less than purchase price';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert price strings to numbers
      const submitData = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : undefined
      };
      
      onSubmit(submitData);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: '',
      purchasePrice: '',
      sellingPrice: ''
    });
    setFormErrors({});
    onCancel();
  };

  // const getCategoryName = (categoryId) => {
  //   const category = categories.find(cat => cat._id === categoryId);
  //   return category ? category.name : 'Unknown Category';
  // };

  return (
    <div className="product-form-overlay">
      <div className="product-form-container">
        <div className="product-form-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button 
            type="button" 
            className="close-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${formErrors.name ? 'error' : ''}`}
              placeholder="Enter product name"
              disabled={loading}
            />
            {formErrors.name && (
              <span className="field-error">{formErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-select ${formErrors.category ? 'error' : ''}`}
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <span className="field-error">{formErrors.category}</span>
            )}
            {/* Show Starlink uniqueness note */}
            {(() => {
              const selectedCategory = categories.find(cat => cat._id === formData.category);
              const categoryName = selectedCategory?.name || '';
              const isStarlinkCategory = categoryName === 'Starlink Standard V3' || 
                                        categoryName === 'Starlink Mini Kit' || 
                                        categoryName === 'Starlink Enterprise Kit' ||
                                        categoryName === 'Starlink Ethernet Adapter' ||
                                        categoryName === 'Satrlink Ethernet Adapter';
              
              if (isStarlinkCategory) {
                return (
                  <div className="form-info">
                    <span className="info-icon">ℹ️</span>
                    <span className="info-text">
                      Each {categoryName} product must have a unique name. No duplicates allowed.
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchasePrice" className="form-label">
                Purchase Price *
              </label>
              <div className="price-input-container">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className={`form-input price-input ${formErrors.purchasePrice ? 'error' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
              </div>
              {formErrors.purchasePrice && (
                <span className="field-error">{formErrors.purchasePrice}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sellingPrice" className="form-label">
                Selling Price
              </label>
              <div className="price-input-container">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="sellingPrice"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  className={`form-input price-input ${formErrors.sellingPrice ? 'error' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
              </div>
              {formErrors.sellingPrice && (
                <span className="field-error">{formErrors.sellingPrice}</span>
              )}
            </div>
          </div>

          {/* Price Summary */}
          {formData.purchasePrice && formData.sellingPrice && 
           !isNaN(parseFloat(formData.purchasePrice)) && 
           !isNaN(parseFloat(formData.sellingPrice)) && (
            <div className="price-summary">
              <div className="summary-item">
                <span className="summary-label">Purchase Price:</span>
                <span className="summary-value">{parseFloat(formData.purchasePrice).toLocaleString()} RWF</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Selling Price:</span>
                <span className="summary-value">{parseFloat(formData.sellingPrice).toLocaleString()} RWF</span>
              </div>
              <div className="summary-item profit">
                <span className="summary-label">Profit Margin:</span>
                <span className="summary-value">
                  {(parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)).toLocaleString()} RWF
                  ({(((parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
