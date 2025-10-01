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
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Handle specific network errors
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to backend server at ${url}. Please check if the server is running and accessible.`);
    }
    
    throw error;
  }
};

// Stock Movement service
export const stockMovementService = {
  // Create a new stock movement
  createMovement: async (movementData) => {
    try {
      const { product, movementType, quantity } = movementData;
      
      // Validate required fields
      if (!product || !movementType || !quantity) {
        throw new Error('product, movementType and quantity are required');
      }

      const response = await apiRequest('/api/stock', {
        method: 'POST',
        body: JSON.stringify(movementData),
      });

      return response;
    } catch (error) {
      console.error('Create stock movement failed:', error);
      throw error;
    }
  },

  // Get all stock movements
  getMovements: async () => {
    try {
      const response = await apiRequest('/api/stock');
      return response;
    } catch (error) {
      console.error('Get stock movements failed:', error);
      
      // Handle connection errors gracefully
      if (error.message.includes('Cannot connect to backend server') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('404') || 
          error.message.includes('endpoint doesn\'t exist')) {
        console.warn('Stock movements endpoint not available, returning empty array');
        return [];
      }
      
      throw error;
    }
  },

  // Get stock movement by ID
  getMovementById: async (movementId) => {
    try {
      if (!movementId) {
        throw new Error('Movement ID is required');
      }

      const response = await apiRequest(`/api/stock/${movementId}`);
      return response;
    } catch (error) {
      console.error('Get stock movement by ID failed:', error);
      throw error;
    }
  },

  // Update stock movement
  updateMovement: async (movementId, updateData) => {
    try {
      if (!movementId) {
        throw new Error('Movement ID is required');
      }

      const response = await apiRequest(`/api/stock/${movementId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response;
    } catch (error) {
      console.error('Update stock movement failed:', error);
      throw error;
    }
  },

  // Delete stock movement
  deleteMovement: async (movementId) => {
    try {
      if (!movementId) {
        throw new Error('Movement ID is required');
      }

      const response = await apiRequest(`/api/stock/${movementId}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      console.error('Delete stock movement failed:', error);
      throw error;
    }
  },

  // Get stock balance for all products
  getStockBalance: async () => {
    try {
      const response = await apiRequest('/api/stock/balance/all');
      return response;
    } catch (error) {
      console.error('Get stock balance failed:', error);
      throw error;
    }
  },

  // Get stock movements by product (optional utility function)
  getMovementsByProduct: async (productId) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await apiRequest(`/api/stock/product/${productId}/history`);
      return response;
    } catch (error) {
      console.error('Get movements by product failed:', error);
      throw error;
    }
  },

  // Get stock movements by client (optional utility function)
  getMovementsByClient: async (clientId) => {
    try {
      if (!clientId) {
        throw new Error('Client ID is required');
      }

      const response = await apiRequest(`/api/stock/reports/client-sales?clientId=${clientId}`);
      return response;
    } catch (error) {
      console.error('Get movements by client failed:', error);
      throw error;
    }
  },

  // Get stock movements by movement type (optional utility function)
  getMovementsByType: async (movementType) => {
    try {
      if (!movementType) {
        throw new Error('Movement type is required');
      }

      const response = await apiRequest(`/api/stock?movementType=${movementType}`);
      return response;
    } catch (error) {
      console.error('Get movements by type failed:', error);
      throw error;
    }
  },

  // Get stock movements with pagination (optional utility function)
  getMovementsPaginated: async (page = 1, limit = 10) => {
    try {
      const response = await apiRequest(`/api/stock?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Get paginated movements failed:', error);
      throw error;
    }
  }
};

// Export default stockMovementService
export default stockMovementService;
