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
    credentials: 'include', // Important for session cookies
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
    throw error;
  }
};

// Client service
export const clientService = {
  // Create a new client
  createClient: async (clientData) => {
    try {
      const response = await apiRequest('/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });

      return response;
    } catch (error) {
      console.error('Create client failed:', error);
      throw error;
    }
  },

  // Get all clients
  getClients: async () => {
    try {
      const response = await apiRequest('/api/clients');
      return response;
    } catch (error) {
      console.error('Get clients failed:', error);
      throw error;
    }
  },

  // Get client by ID
  getClientById: async (clientId) => {
    try {
      if (!clientId) {
        throw new Error('Client ID is required');
      }

      const response = await apiRequest(`/api/clients/${clientId}`);
      return response;
    } catch (error) {
      console.error('Get client by ID failed:', error);
      throw error;
    }
  },

  // Update client
  updateClient: async (clientId, updateData) => {
    try {
      if (!clientId) {
        throw new Error('Client ID is required');
      }

      const response = await apiRequest(`/api/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response;
    } catch (error) {
      console.error('Update client failed:', error);
      throw error;
    }
  },

  // Delete client
  deleteClient: async (clientId) => {
    try {
      if (!clientId) {
        throw new Error('Client ID is required');
      }

      const response = await apiRequest(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      console.error('Delete client failed:', error);
      throw error;
    }
  },

  // Search clients (optional utility function)
  searchClients: async (searchTerm) => {
    try {
      const response = await apiRequest(`/api/clients/search?q=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error) {
      console.error('Search clients failed:', error);
      throw error;
    }
  },

  // Get clients with pagination (optional utility function)
  getClientsPaginated: async (page = 1, limit = 10) => {
    try {
      const response = await apiRequest(`/api/clients?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Get paginated clients failed:', error);
      throw error;
    }
  }
};

// Export default clientService
export default clientService;
