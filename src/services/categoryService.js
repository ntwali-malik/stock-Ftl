// Token management utilities
import { authUtils } from './authService';

// Base API URL - update this to match your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, it's probably an HTML error page
      const text = await response.text();
      console.error('Non-JSON response received:', text.substring(0, 200));
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. This usually means the backend server is not running or the endpoint doesn't exist.`);
    }

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 400 && data.error && data.error.includes('E11000')) {
        throw new Error('A category with this name already exists. Please choose a different name.');
      }
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Category service
export const categoryService = {
  // Create a new category
  createCategory: async (categoryData) => {
    try {
      const response = await apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });

      return response;
    } catch (error) {
      console.error('Create category failed:', error);
      throw error;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await apiRequest('/api/categories');
      return response;
    } catch (error) {
      console.error('Get categories failed:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      const response = await apiRequest(`/api/categories/${categoryId}`);
      return response;
    } catch (error) {
      console.error('Get category by ID failed:', error);
      throw error;
    }
  },

  // Update category
  updateCategory: async (categoryId, updateData) => {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      const response = await apiRequest(`/api/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response;
    } catch (error) {
      console.error('Update category failed:', error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      const response = await apiRequest(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      console.error('Delete category failed:', error);
      throw error;
    }
  },

  // Search categories (optional utility function)
  searchCategories: async (searchTerm) => {
    try {
      const response = await apiRequest(`/api/categories/search?q=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error) {
      console.error('Search categories failed:', error);
      throw error;
    }
  },

  // Get categories with pagination (optional utility function)
  getCategoriesPaginated: async (page = 1, limit = 10) => {
    try {
      const response = await apiRequest(`/api/categories?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Get paginated categories failed:', error);
      throw error;
    }
  }
};

// Export default categoryService
export default categoryService;
