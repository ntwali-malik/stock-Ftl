import React, { useState, useEffect } from 'react';
import './ClientForm.css';

const ClientForm = ({ 
  client = null, 
  onSubmit, 
  onCancel, 
  loading = false, 
  error = null,
  existingClients = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        location: client.location || '',
        contact: client.contact || ''
      });
    }
  }, [client]);

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
      const isDuplicate = existingClients.some(existingClient => 
        existingClient.name.toLowerCase() === trimmedName.toLowerCase() &&
        (!client || existingClient._id !== client._id)
      );
      
      if (isDuplicate) {
        setFormErrors(prev => ({
          ...prev,
          name: 'A client with this name already exists. Please choose a different name.'
        }));
      }
    }

    // Real-time validation for contact field
    if (name === 'contact' && value.trim()) {
      const trimmedContact = value.trim();
      const isDuplicate = existingClients.some(existingClient => 
        existingClient.contact && 
        existingClient.contact.toLowerCase() === trimmedContact.toLowerCase() &&
        (!client || existingClient._id !== client._id)
      );
      
      if (isDuplicate) {
        setFormErrors(prev => ({
          ...prev,
          contact: 'A client with this contact already exists. Please choose a different contact.'
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Client name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Client name must be at least 2 characters';
    } else {
      // Check for duplicate names (case-insensitive)
      const trimmedName = formData.name.trim();
      const isDuplicate = existingClients.some(existingClient => 
        existingClient.name.toLowerCase() === trimmedName.toLowerCase() &&
        (!client || existingClient._id !== client._id)
      );
      
      if (isDuplicate) {
        errors.name = 'A client with this name already exists. Please choose a different name.';
      }
    }

    // Location validation (optional but must be valid if provided)
    if (formData.location && formData.location.trim().length < 2) {
      errors.location = 'Location must be at least 2 characters if provided';
    }

    // Contact validation (optional but must be valid if provided)
    if (formData.contact) {
      const trimmedContact = formData.contact.trim();
      if (trimmedContact.length < 3) {
        errors.contact = 'Contact must be at least 3 characters if provided';
      } else {
        // Check for duplicate contacts (case-insensitive)
        const isDuplicate = existingClients.some(existingClient => 
          existingClient.contact && 
          existingClient.contact.toLowerCase() === trimmedContact.toLowerCase() &&
          (!client || existingClient._id !== client._id)
        );
        
        if (isDuplicate) {
          errors.contact = 'A client with this contact already exists. Please choose a different contact.';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Clean up the data (trim whitespace, remove empty optional fields)
      const submitData = {
        name: formData.name.trim(),
        location: formData.location.trim() || undefined,
        contact: formData.contact.trim() || undefined
      };
      
      onSubmit(submitData);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      location: '',
      contact: ''
    });
    setFormErrors({});
    onCancel();
  };

  return (
    <div className="client-form-overlay">
      <div className="client-form-container">
        <div className="client-form-header">
          <h2>{client ? 'Edit Client' : 'Add New Client'}</h2>
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

        <form onSubmit={handleSubmit} className="client-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Client Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${formErrors.name ? 'error' : ''}`}
              placeholder="Enter client name"
              disabled={loading}
            />
            {formErrors.name && (
              <span className="field-error">{formErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`form-input ${formErrors.location ? 'error' : ''}`}
              placeholder="Enter client location (optional)"
              disabled={loading}
            />
            {formErrors.location && (
              <span className="field-error">{formErrors.location}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contact" className="form-label">
              Contact Information
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className={`form-input ${formErrors.contact ? 'error' : ''}`}
              placeholder="Enter contact info (phone, email, etc.)"
              disabled={loading}
            />
            {formErrors.contact && (
              <span className="field-error">{formErrors.contact}</span>
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
              {loading ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
