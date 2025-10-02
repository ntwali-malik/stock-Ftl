import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './SignUp.css';

const SignUp = () => {
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'technician'
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
    
    // Mobile debugging
    console.log('Signup form submitted on mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    console.log('Form data:', formData);
    console.log('API Base URL:', process.env.REACT_APP_API_URL || 'https://stock-ftl.onrender.com');
    
    try {
      await register(formData);
      // Registration successful - user will be automatically logged in
      console.log('Registration successful');
    } catch (error) {
      console.error('Registration error on mobile:', error);
      setLocalError(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Header Section */}
        <div className="signup-header">
          <div className="signup-logo">S</div>
          <h1 className="signup-welcome">Create Account</h1>
          <p className="signup-subtitle">Join us to get started with your account</p>
        </div>

        {/* Form Section */}
        <div className="signup-form-container">
          {/* Error Display */}
          {(error || localError) && (
            <div className="error-message">
              {error || localError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
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
                  placeholder="Enter your password"
                  required
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="role">Role</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="role"
                  name="role"
                  value="Technician"
                  readOnly
                  className="role-input"
                  placeholder="Technician"
                />
              </div>
            </div>

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link to="/login" className="login-text">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
