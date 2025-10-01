import React, { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import CategoryForm from '../forms/CategoryForm';
import DeleteConfirmation from '../common/DeleteConfirmation';
import './Sections.css';
import './Categories.css';

const Categories = () => {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError
  } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleCreateCategory = async (categoryData) => {
    try {
      await createCategory(categoryData);
      setShowForm(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      await updateCategory(editingCategory._id, categoryData);
      setEditingCategory(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(deleteConfirm._id);
      setDeleteConfirm(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
  };

  const handleDeleteClick = (category) => {
    setDeleteConfirm(category);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };


  return (
    <div className="section-container">
      <div className="section-header">
        <div className="header-content">
          <div>
            <h1>Categories Management</h1>
            <p>Organize your products into categories for better inventory management.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            + Add Category
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
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
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

        {/* Categories List */}
        <div className="categories-container">
          {loading && categories.length === 0 ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No categories found</h3>
              <p>
                {searchTerm 
                  ? 'No categories match your search criteria.' 
                  : 'Get started by creating your first category.'
                }
              </p>
              {!searchTerm && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Create First Category
                </button>
              )}
            </div>
          ) : (
            <div className="categories-grid">
              {filteredCategories.map((category) => (
                <div key={category._id} className="category-card">
                  <div className="category-header">
                    <div className="category-info">
                      <h3 className="category-name">{category.name}</h3>
                      <span className="category-date">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {category.description && (
                    <p className="category-description">{category.description}</p>
                  )}
                  
                  <div className="category-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditCategory(category)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(category)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        {categories.length > 0 && (
          <div className="categories-stats">
            <div className="stat-item">
              <span className="stat-number">{categories.length}</span>
              <span className="stat-label">Total Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{categories.filter(cat => cat.description).length}</span>
              <span className="stat-label">With Description</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {categories.filter(cat => {
                  const createdDate = new Date(cat.createdAt);
                  const today = new Date();
                  const diffTime = Math.abs(today - createdDate);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}
              </span>
              <span className="stat-label">Created This Week</span>
            </div>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={handleCancelForm}
          loading={loading}
          error={error}
          existingCategories={categories}
        />
      )}

      {/* Edit Category Form Modal */}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleUpdateCategory}
          onCancel={handleCancelForm}
          loading={loading}
          error={error}
          existingCategories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmation
          isOpen={!!deleteConfirm}
          onConfirm={handleDeleteCategory}
          onCancel={handleCancelDelete}
          title="Delete Category"
          message="Are you sure you want to delete this category?"
          itemName={deleteConfirm.name}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Categories;