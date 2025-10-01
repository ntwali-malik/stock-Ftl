import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Sections.css';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Settings state
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Fabritech',
    companyEmail: 'info@fabritech.com',
    companyPhone: '+250 788 123 456',
    companyAddress: 'Kigali, Rwanda',
    currency: 'RWF',
    timezone: 'Africa/Kigali',
    lowStockThreshold: 10,
    autoBackup: true
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="section-container">
        <div className="loading-message">
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Check if user has admin permissions
  if (user.role !== 'admin') {
    return (
      <div className="section-container">
        <div className="access-denied">
          <div className="access-denied-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access system settings.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'system', name: 'System', icon: '🖥️' },
    { id: 'backup', name: 'Backup', icon: '💾' }
  ];

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="header-content">
          <div>
            <h1>System Settings</h1>
            <p>Configure system preferences, user management, and security settings.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {success && (
        <div className="success-banner">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="success-close">×</button>
        </div>
      )}

      <div className="section-content">
        {/* Settings Tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-panel">
              <h3>General Settings</h3>
              <div className="settings-grid">
                <div className="setting-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={generalSettings.companyName}
                    onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                    className="setting-input"
                  />
                </div>

                <div className="setting-group">
                  <label>Company Email</label>
                  <input
                    type="email"
                    value={generalSettings.companyEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, companyEmail: e.target.value})}
                    className="setting-input"
                  />
                </div>

                <div className="setting-group">
                  <label>Company Phone</label>
                  <input
                    type="tel"
                    value={generalSettings.companyPhone}
                    onChange={(e) => setGeneralSettings({...generalSettings, companyPhone: e.target.value})}
                    className="setting-input"
                  />
                </div>

                <div className="setting-group">
                  <label>Currency</label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                    className="setting-select"
                  >
                    <option value="RWF">RWF - Rwandan Franc</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label>Low Stock Threshold</label>
                  <input
                    type="number"
                    value={generalSettings.lowStockThreshold}
                    onChange={(e) => setGeneralSettings({...generalSettings, lowStockThreshold: parseInt(e.target.value)})}
                    className="setting-input"
                    min="1"
                  />
                </div>
              </div>

              <div className="settings-actions">
                <button
                  onClick={() => {
                    localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
                    setSuccess('General settings saved successfully!');
                    setTimeout(() => setSuccess(null), 3000);
                  }}
                  className="btn btn-primary"
                >
                  Save General Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="settings-panel">
              <h3>User Management</h3>
              <div className="coming-soon">
                <div className="coming-soon-icon">👥</div>
                <h4>User Management</h4>
                <p>Create, edit, and manage user accounts and permissions.</p>
                <p><em>This feature will be available in the next update.</em></p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h3>Notification Settings</h3>
              <div className="coming-soon">
                <div className="coming-soon-icon">🔔</div>
                <h4>Notification Settings</h4>
                <p>Configure email alerts, low stock notifications, and system updates.</p>
                <p><em>This feature will be available in the next update.</em></p>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="settings-panel">
              <h3>System Settings</h3>
              <div className="coming-soon">
                <div className="coming-soon-icon">🖥️</div>
                <h4>System Configuration</h4>
                <p>Configure system preferences, security settings, and maintenance options.</p>
                <p><em>This feature will be available in the next update.</em></p>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="settings-panel">
              <h3>Backup & Maintenance</h3>
              <div className="coming-soon">
                <div className="coming-soon-icon">💾</div>
                <h4>Backup & Maintenance</h4>
                <p>Create backups, restore data, and perform system maintenance tasks.</p>
                <p><em>This feature will be available in the next update.</em></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
