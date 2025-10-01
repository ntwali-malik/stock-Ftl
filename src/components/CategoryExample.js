import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories';

const CategoryExample = () => {
  const { 
    categories, 
    loading, 
    error, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    clearError 
  } = useCategories();

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await createCategory(newCategory);
      setNewCategory({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(editingCategory._id, editingCategory);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="category-example">
      <h2>Category Management</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* Create Category Form */}
      <form onSubmit={handleCreateCategory} className="category-form">
        <h3>Create New Category</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder="Category Description"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>

      {/* Categories List */}
      <div className="categories-list">
        <h3>Categories ({categories.length})</h3>
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <div key={category._id} className="category-card">
                {editingCategory && editingCategory._id === category._id ? (
                  <form onSubmit={handleUpdateCategory}>
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      required
                    />
                    <textarea
                      value={editingCategory.description}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    />
                    <div className="button-group">
                      <button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Save'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingCategory(null)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h4>{category.name}</h4>
                    <p>{category.description}</p>
                    <div className="category-actions">
                      <button 
                        onClick={() => setEditingCategory(category)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category._id)}
                        disabled={loading}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryExample;
