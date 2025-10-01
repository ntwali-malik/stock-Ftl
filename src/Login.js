import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './Login.css';

const Login = () => {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    try {
      await login(formData);
      // Login successful - user will be redirected automatically
    } catch (error) {
      setLocalError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left Section - Welcome */}
        <div className="welcome-section">
          <h1 className="welcome-title">WELCOME BACK!</h1>
          <p className="welcome-text">Lorem ipsum, dolor sit amet consectetur adipisicing.</p>
        </div>

        {/* Right Section - Login Form */}
        <div className="form-section">
          <h2 className="login-title">Login</h2>
          
          {/* Error Display */}
          {(error || localError) && (
            <div className="error-message">
              {error || localError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="forgot-password">
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account? <Link to="/signup" className="signup-text">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
