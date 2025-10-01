import React from 'react';
import './DeleteConfirmation.css';

const DeleteConfirmation = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  itemName = "",
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation-container">
        <div className="delete-confirmation-header">
          <div className="warning-icon">⚠️</div>
          <h3>{title}</h3>
        </div>
        
        <div className="delete-confirmation-body">
          <p>{message}</p>
          {itemName && (
            <div className="item-name">
              <strong>"{itemName}"</strong>
            </div>
          )}
          <p className="warning-text">
            This action cannot be undone.
          </p>
        </div>
        
        <div className="delete-confirmation-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
