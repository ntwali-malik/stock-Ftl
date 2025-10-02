import { API_CONFIG } from '../config/api';

const API_BASE_URL = 'https://stock-ftl.onrender.com';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  const config = { ...defaultOptions, ...options };

  try {
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url, config);
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (jsonError) {
        console.error('Failed to parse error response as JSON:', jsonError);
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.warn('Non-JSON response received:', text);
      throw new Error('Server returned non-JSON response');
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

const userService = {
  // Get all users
  getUsers: async () => {
    try {
      return await apiRequest('/api/users');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      return await apiRequest(`/api/users/${id}`);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      return await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      return await apiRequest(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      return await apiRequest(`/api/users/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  // Update user password
  updatePassword: async (id, passwordData) => {
    try {
      return await apiRequest(`/api/users/${id}/password`, {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (id, status) => {
    try {
      return await apiRequest(`/api/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  },

  // Get user permissions
  getUserPermissions: async (id) => {
    try {
      return await apiRequest(`/api/users/${id}/permissions`);
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      throw error;
    }
  },

  // Update user permissions
  updateUserPermissions: async (id, permissions) => {
    try {
      return await apiRequest(`/api/users/${id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      });
    } catch (error) {
      console.error('Failed to update user permissions:', error);
      throw error;
    }
  }
};

export default userService;
