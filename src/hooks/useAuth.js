import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedInUser = sessionStorage.getItem('logged_in_user');
        if (loggedInUser) {
          const userData = JSON.parse(loggedInUser);
          
          // Set user from local storage first
          setUser(userData);
          
          // Try to verify session with backend (but don't fail if it doesn't work)
          try {
            const verifiedUser = await authService.verifySession();
            if (verifiedUser) {
              // Update user data with fresh data from backend
              setUser(verifiedUser);
              sessionStorage.setItem('logged_in_user', JSON.stringify(verifiedUser));
            }
            // If verification fails, keep the local user data
          } catch (verifyError) {
            console.log('Session verification failed, using local data:', verifyError.message);
            // Keep the local user data even if verification fails
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        sessionStorage.removeItem('logged_in_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Database login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use authService for database authentication
      const response = await authService.login(credentials);
      
      // Validate response structure (backend returns: message, role, username, userId)
      if (!response || !response.username || !response.role) {
        throw new Error('Invalid response from server');
      }
      
      // Extract user data from backend response
      const userData = {
        id: response.userId,
        username: response.username,
        role: response.role,
        fullName: response.fullName || response.username,
        email: response.email || null
      };
      
      // Save user data to sessionStorage (session-only)
      sessionStorage.setItem('logged_in_user', JSON.stringify(userData));
      
      // Set user state and navigate to dashboard
      console.log('Setting user state to:', userData);
      setUser(userData);
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
      
      return { success: true, user: userData };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      // Auto-login after successful registration
      await login({
        username: userData.username,
        password: userData.password
      });
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Database logout function
  const logout = useCallback(async () => {
    try {
      // Use authService for database logout
      await authService.logout();
      
      // Clear user state and navigate to login
      console.log('Clearing user state');
      setUser(null);
      setError(null);
      
      // Navigate to login page after logout
      navigate('/login');
    } catch (error) {
      // Even if logout fails, clear local state and navigate
      setUser(null);
      setError(null);
      navigate('/login');
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh session (useful for debugging)
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const verifiedUser = await authService.verifySession();
      if (verifiedUser) {
        setUser(verifiedUser);
        sessionStorage.setItem('logged_in_user', JSON.stringify(verifiedUser));
        return true;
      } else {
        setUser(null);
        sessionStorage.removeItem('logged_in_user');
        return false;
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setUser(null);
      sessionStorage.removeItem('logged_in_user');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
    refreshSession
  };
};

export default useAuth;
