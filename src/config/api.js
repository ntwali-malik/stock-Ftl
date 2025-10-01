// API Configuration
export const API_CONFIG = {
  // Base URL for your backend API
  BASE_URL: process.env.REACT_APP_API_URL || 'https://stock-ftl.onrender.com',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      ME: '/auth/me',
      LOGOUT: '/auth/logout'
    },
    CATEGORIES: {
      BASE: '/categories',
      BY_ID: (id) => `/categories/${id}`,
      SEARCH: '/categories/search'
    }
  },

  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Environment configuration
export const ENV_CONFIG = {
  // Simple token key for localStorage
  TOKEN_KEY: 'auth_token',
  
  // Development mode
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Production mode
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
};

export default API_CONFIG;
