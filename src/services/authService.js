// Database authentication service

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Simple authentication utilities
export const authUtils = {
  // Check if user is logged in (session-only)
  isLoggedIn: () => {
    return !!sessionStorage.getItem('logged_in_user');
  },

  // Get current user data
  getCurrentUser: () => {
    try {
      const userData = sessionStorage.getItem('logged_in_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // Clear user session
  clearSession: () => {
    sessionStorage.removeItem('logged_in_user');
  }
};

// Database auth service
export const authService = {
  // Database login function
  login: async (credentials) => {
    try {
      const { username, password } = credentials;
      
      // Validate required fields
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // First, test if the backend is accessible
      try {
        const healthCheck = await fetch(`${API_BASE_URL}/api/health`, {
          method: 'GET',
          credentials: 'include'
        });
        console.log('Backend health check status:', healthCheck.status);
        
        if (healthCheck.status === 404) {
          console.log('Health endpoint not found, trying base URL...');
          const baseCheck = await fetch(`${API_BASE_URL}`, {
            method: 'GET',
            credentials: 'include'
          });
          console.log('Base URL check status:', baseCheck.status);
        }
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        // Don't throw error here, continue with login attempt
      }

      // Try with username first, then email if that fails
      const requestBody = {
        username,
        password
      };

      // Alternative request body with email (in case backend expects email)
      const emailRequestBody = {
        email: username, // Treat username as email
        password
      };

      console.log('Login request body:', requestBody);
      console.log('Login request URL:', `${API_BASE_URL}/api/auth/login`);

      // Try login with username first
      let response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify(requestBody),
      });

      // If username login fails with 400, try with email
      if (!response.ok && response.status === 400) {
        console.log('Username login failed, trying with email...');
        response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(emailRequestBody),
        });
      }

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);

      let data;
      try {
        data = await response.json();
        console.log('Login response data:', data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        const textResponse = await response.text();
        console.error('Raw response text:', textResponse);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        console.error('Error response:', data);
        
        // Provide more specific error messages
        if (response.status === 400) {
          throw new Error(data.message || data.error || 'Invalid username or password format');
        } else if (response.status === 401) {
          throw new Error(data.message || data.error || 'Invalid username or password');
        } else if (response.status === 404) {
          throw new Error('Login endpoint not found. Please check backend configuration.');
        } else {
          throw new Error(data.message || data.error || `Login failed with status ${response.status}`);
        }
      }

      // Validate response structure (backend returns: message, role, username, userId)
      if (!data || !data.username || !data.role) {
        throw new Error('Invalid response format from server');
      }

      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return authUtils.isLoggedIn();
  },

  // Get user role
  getUserRole: () => {
    const user = authUtils.getCurrentUser();
    return user ? user.role : null;
  },

  // Verify current session with backend
  verifySession: async () => {
    try {
      console.log('Verifying session with backend...');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('Session verification response status:', response.status);

      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response from auth/me endpoint');
          return null;
        }
        
        const userData = await response.json();
        console.log('Session verification response data:', userData);
        return userData;
      } else {
        console.log('Session verification failed with status:', response.status);
        // Don't clear session on 401 - just return null
        return null;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Session verification timeout:', error);
      } else {
        console.error('Session verification error:', error);
      }
      // Don't clear session on network error - just return null
      return null;
    }
  },

  // Database logout function
  logout: async () => {
    try {
      // Call backend logout endpoint (session-based)
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Important for session cookies
        });
        
        if (!response.ok) {
          console.warn('Backend logout failed:', response.status);
        }
      } catch (error) {
        // Even if backend logout fails, clear local session
        console.warn('Backend logout failed, but clearing local session:', error);
      }
      
      // Clear local session
      authUtils.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      // Always clear local session even if backend fails
      authUtils.clearSession();
    }
  }
};

// Export default authService
export default authService;
