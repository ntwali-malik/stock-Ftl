import React, { useState, useEffect } from 'react';
import './CategoryForm.css';

const CategoryForm = ({ 
  category = null, 
  onSubmit, 
  onCancel, 
  loading = false, 
  error = null,
  existingCategories = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    }
  }, [category]);

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

    // Real-time validation for name field
    if (name === 'name' && value.trim()) {
      const trimmedName = value.trim();
      const isDuplicate = existingCategories.some(existingCategory => 
        existingCategory.name.toLowerCase() === trimmedName.toLowerCase() &&
        (!category || existingCategory._id !== category._id)
      );
      
      if (isDuplicate) {
        setFormErrors(prev => ({
          ...prev,
          name: 'A category with this name already exists. Please choose a different name.'
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    } else {
      // Check for duplicate names (case-insensitive)
      const trimmedName = formData.name.trim();
      const isDuplicate = existingCategories.some(existingCategory => 
        existingCategory.name.toLowerCase() === trimmedName.toLowerCase() &&
        (!category || existingCategory._id !== category._id)
      );
      
      if (isDuplicate) {
        errors.name = 'A category with this name already exists. Please choose a different name.';
      }
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: ''
    });
    setFormErrors({});
    onCancel();
  };

  return (
    <div className="category-form-overlay">
      <div className="category-form-container">
        <div className="category-form-header">
          <h2>{category ? 'Edit Category' : 'Add New Category'}</h2>
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

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${formErrors.name ? 'error' : ''}`}
              placeholder="Enter category name"
              disabled={loading}
            />
            {formErrors.name && (
              <span className="field-error">{formErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-textarea ${formErrors.description ? 'error' : ''}`}
              placeholder="Enter category description (optional)"
              rows="3"
              disabled={loading}
            />
            {formErrors.description && (
              <span className="field-error">{formErrors.description}</span>
            )}
          </div>


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
              {loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
