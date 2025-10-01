import React, { useState, useEffect } from 'react';
import './StockMovementForm.css';

const StockMovementForm = ({ 
  stockMovement = null, 
  onSubmit, 
  onCancel, 
  loading = false, 
  error = null,
  products = [],
  clients = []
}) => {
  const [formData, setFormData] = useState({
    product: '',
    movementType: 'PURCHASE',
    quantity: '',
    client: '',
    purchaseDate: '',
    status: 'YES'
  });

  const [formErrors, setFormErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (stockMovement) {
      try {
        setFormData({
          product: stockMovement.product?._id || stockMovement.product || '',
          movementType: stockMovement.movementType || 'PURCHASE',
          quantity: stockMovement.quantity || '',
          client: stockMovement.client?._id || stockMovement.client || '',
          purchaseDate: stockMovement.purchaseDate ? new Date(stockMovement.purchaseDate).toISOString().split('T')[0] : '',
          status: stockMovement.status || 'YES'
        });
      } catch (error) {
        console.error('Error initializing form data:', error);
        setFormErrors({ submit: 'Error loading movement data. Please try again.' });
      }
    }
  }, [stockMovement]);

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

    // Real-time validation for quantity
    if (name === 'quantity' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        setFormErrors(prev => ({
          ...prev,
          quantity: 'Quantity must be a valid positive number.'
        }));
      }
    }

    // Clear client field when movement type is PURCHASE
    if (name === 'movementType' && value === 'PURCHASE') {
      setFormData(prev => ({
        ...prev,
        client: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Product validation
    if (!formData.product) {
      errors.product = 'Please select a product';
    } else {
      // Check if product exists in the products list
      const productExists = products.find(p => p._id === formData.product);
      if (!productExists) {
        errors.product = 'Selected product is not available';
      }
    }

    // Movement type validation
    if (!formData.movementType) {
      errors.movementType = 'Please select a movement type';
    }

    // Quantity validation
    if (!formData.quantity || formData.quantity.trim() === '') {
      errors.quantity = 'Quantity is required';
    } else {
      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.quantity = 'Quantity must be a valid positive number';
      } else if (!Number.isInteger(quantity)) {
        errors.quantity = 'Quantity must be a whole number';
      }
    }

    // Client validation (required for SALES)
    if (formData.movementType === 'SALE' && !formData.client) {
      errors.client = 'Client is required for sales';
    } else if (formData.movementType === 'SALE' && formData.client) {
      // Check if client exists in the clients list
      const clientExists = clients.find(c => c._id === formData.client);
      if (!clientExists) {
        errors.client = 'Selected client is not available';
      }
    }

    // Purchase date validation (required for PURCHASE)
    if (formData.movementType === 'PURCHASE' && !formData.purchaseDate) {
      errors.purchaseDate = 'Purchase date is required for purchases';
    } else if (formData.movementType === 'PURCHASE' && formData.purchaseDate) {
      // Validate date is not in the future
      const purchaseDate = new Date(formData.purchaseDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (purchaseDate > today) {
        errors.purchaseDate = 'Purchase date cannot be in the future';
      }
    }

    // Status validation
    if (!formData.status) {
      errors.status = 'Please select a status';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Prepare data for submission
        const submitData = {
          product: formData.product,
          movementType: formData.movementType,
          quantity: parseFloat(formData.quantity),
          status: formData.status
        };

        // Add optional fields based on movement type
        if (formData.movementType === 'SALE' && formData.client) {
          submitData.client = formData.client;
        }

        if (formData.movementType === 'PURCHASE' && formData.purchaseDate) {
          submitData.purchaseDate = new Date(formData.purchaseDate).toISOString();
        }
        
        console.log('Submitting stock movement data:', submitData);
        onSubmit(submitData);
      } catch (error) {
        console.error('Error preparing form data:', error);
        setFormErrors({ submit: 'Error preparing form data. Please try again.' });
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      product: '',
      movementType: 'PURCHASE',
      quantity: '',
      client: '',
      purchaseDate: '',
      status: 'YES'
    });
    setFormErrors({});
    onCancel();
  };

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  return (
    <div className="stock-movement-form-overlay">
      <div className="stock-movement-form-container">
        <div className="stock-movement-form-header">
          <h2>{stockMovement ? 'Edit Stock Movement' : 'Add New Stock Movement'}</h2>
          <button 
            type="button" 
            className="close-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {(error || formErrors.submit) && (
          <div className="form-error">
            {error || formErrors.submit}
          </div>
        )}

        {/* Warning messages for missing data */}
        {products.length === 0 && (
          <div className="form-warning">
            ⚠️ No products available. Please create products first before adding stock movements.
          </div>
        )}
        
        {formData.movementType === 'SALE' && clients.length === 0 && (
          <div className="form-warning">
            ⚠️ No clients available. Please create clients first before recording sales.
          </div>
        )}

        <form onSubmit={handleSubmit} className="stock-movement-form">
          <div className="form-group">
            <label htmlFor="product" className="form-label">
              Product *
            </label>
            <select
              id="product"
              name="product"
              value={formData.product}
              onChange={handleChange}
              className={`form-select ${formErrors.product ? 'error' : ''}`}
              disabled={loading || products.length === 0}
            >
              <option value="">
                {products.length === 0 ? 'No products available' : 'Select a product'}
              </option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            {formErrors.product && (
              <span className="field-error">{formErrors.product}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="movementType" className="form-label">
              Movement Type *
            </label>
            <select
              id="movementType"
              name="movementType"
              value={formData.movementType}
              onChange={handleChange}
              className={`form-select ${formErrors.movementType ? 'error' : ''}`}
              disabled={loading}
            >
              <option value="PURCHASE">Purchase (Stock In)</option>
              <option value="SALE">Sale (Stock Out)</option>
            </select>
            {formErrors.movementType && (
              <span className="field-error">{formErrors.movementType}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="quantity" className="form-label">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`form-input ${formErrors.quantity ? 'error' : ''}`}
              placeholder="Enter quantity"
              min="1"
              step="1"
              disabled={loading}
            />
            {formErrors.quantity && (
              <span className="field-error">{formErrors.quantity}</span>
            )}
          </div>

          {formData.movementType === 'SALE' && (
            <div className="form-group">
              <label htmlFor="client" className="form-label">
                Client *
              </label>
              <select
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className={`form-select ${formErrors.client ? 'error' : ''}`}
                disabled={loading || clients.length === 0}
              >
                <option value="">
                  {clients.length === 0 ? 'No clients available' : 'Select a client'}
                </option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {formErrors.client && (
                <span className="field-error">{formErrors.client}</span>
              )}
            </div>
          )}

          {formData.movementType === 'PURCHASE' && (
            <div className="form-group">
              <label htmlFor="purchaseDate" className="form-label">
                Purchase Date *
              </label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className={`form-input ${formErrors.purchaseDate ? 'error' : ''}`}
                disabled={loading}
              />
              {formErrors.purchaseDate && (
                <span className="field-error">{formErrors.purchaseDate}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`form-select ${formErrors.status ? 'error' : ''}`}
              disabled={loading}
            >
              <option value="YES">Active</option>
              <option value="NO">Inactive</option>
            </select>
            {formErrors.status && (
              <span className="field-error">{formErrors.status}</span>
            )}
          </div>

          {/* Movement Summary */}
          {formData.product && formData.quantity && (
            <div className="movement-summary">
              <h4>Movement Summary</h4>
              <div className="summary-item">
                <span className="summary-label">Product:</span>
                <span className="summary-value">{getProductName(formData.product)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Type:</span>
                <span className={`summary-value ${formData.movementType === 'PURCHASE' ? 'purchase' : 'sale'}`}>
                  {formData.movementType === 'PURCHASE' ? '📥 Purchase' : '📤 Sale'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Quantity:</span>
                <span className="summary-value">{formData.quantity}</span>
              </div>
              {formData.movementType === 'SALE' && formData.client && (
                <div className="summary-item">
                  <span className="summary-label">Client:</span>
                  <span className="summary-value">{getClientName(formData.client)}</span>
                </div>
              )}
              {formData.movementType === 'PURCHASE' && formData.purchaseDate && (
                <div className="summary-item">
                  <span className="summary-label">Purchase Date:</span>
                  <span className="summary-value">{new Date(formData.purchaseDate).toLocaleDateString()}</span>
                </div>
              )}
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
              disabled={loading || products.length === 0 || (formData.movementType === 'SALE' && clients.length === 0)}
            >
              {loading ? 'Saving...' : (stockMovement ? 'Update Movement' : 'Create Movement')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementForm;
