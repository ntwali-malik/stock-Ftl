// Token management utilities
// import { authUtils } from './authService';

// Base API URL - update this to match your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://stock-ftl.onrender.com';

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
      
      // Handle specific status codes
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (response.status === 404) {
        throw new Error(`Endpoint not found (${response.status}). The backend might not be properly deployed or the API structure is different.`);
      }
      
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. This usually means the backend server is not running or the endpoint doesn't exist.`);
    }

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 400 && data.error) {
        if (data.error.includes('E11000') || data.error.includes('already exists')) {
          throw new Error('A product with this name already exists. Please choose a different name.');
        }
        if (data.error.includes('Serial number') && data.error.includes('already exists')) {
          throw new Error(data.error);
        }
        if (data.error.includes('Category not found')) {
          throw new Error('Selected category does not exist. Please choose a valid category.');
        }
        if (data.error.includes('Product not found')) {
          throw new Error('Product not found. It may have been deleted.');
        }
        throw new Error(data.error);
      }
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Product service
export const productService = {
  // Create a new product
  createProduct: async (productData) => {
    try {
      const response = await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });

      return response;
    } catch (error) {
      console.error('Create product failed:', error);
      throw error;
    }
  },

  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query parameters
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
      
      const response = await apiRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Get products failed:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await apiRequest(`/api/products/${productId}`);
      return response;
    } catch (error) {
      console.error('Get product by ID failed:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, updateData) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await apiRequest(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response;
    } catch (error) {
      console.error('Update product failed:', error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await apiRequest(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      console.error('Delete product failed:', error);
      throw error;
    }
  },

  // Update stock quantity
  updateStock: async (productId, quantity, operation = 'set') => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      if (typeof quantity !== 'number') {
        throw new Error('Quantity must be a number');
      }
      if (!['add', 'subtract', 'set'].includes(operation)) {
        throw new Error('Operation must be: add, subtract, or set');
      }

      const response = await apiRequest(`/api/products/${productId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ quantity, operation }),
      });

      return response;
    } catch (error) {
      console.error('Update stock failed:', error);
      throw error;
    }
  },

  // Add serial number to a product
  addSerialNumber: async (productId, serialNumber) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      if (!serialNumber) {
        throw new Error('Serial number is required');
      }

      const response = await apiRequest(`/api/products/${productId}/serial`, {
        method: 'POST',
        body: JSON.stringify({ serialNumber }),
      });

      return response;
    } catch (error) {
      console.error('Add serial number failed:', error);
      throw error;
    }
  },

  // Remove serial number from a product
  removeSerialNumber: async (productId, serialNumber) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      if (!serialNumber) {
        throw new Error('Serial number is required');
      }

      const response = await apiRequest(`/api/products/${productId}/serial`, {
        method: 'DELETE',
        body: JSON.stringify({ serialNumber }),
      });

      return response;
    } catch (error) {
      console.error('Remove serial number failed:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      const response = await apiRequest(`/api/products/category/${categoryId}`);
      return response;
    } catch (error) {
      console.error('Get products by category failed:', error);
      throw error;
    }
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    try {
      const response = await apiRequest(`/api/products/inventory/low-stock?threshold=${threshold}`);
      return response;
    } catch (error) {
      console.error('Get low stock products failed:', error);
      throw error;
    }
  },

  // Search products by name (using the search filter in getProducts)
  searchProducts: async (searchTerm) => {
    try {
      return await productService.getProducts({ search: searchTerm });
    } catch (error) {
      console.error('Search products failed:', error);
      throw error;
    }
  },

  // Get products with price range filter
  getProductsByPriceRange: async (minPrice, maxPrice) => {
    try {
      return await productService.getProducts({ minPrice, maxPrice });
    } catch (error) {
      console.error('Get products by price range failed:', error);
      throw error;
    }
  }
};

// Export default productService
export default productService;
