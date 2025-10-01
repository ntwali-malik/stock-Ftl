import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, toggleSidebar, sidebarCollapsed }) => {
  const { logout, refreshSession } = useAuth();
  // const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    console.log('Logout button clicked');
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to logout?');
    
    if (confirmed) {
      console.log('User confirmed logout');
      logout();
      // Close the user menu
      setShowUserMenu(false);
    } else {
      console.log('User cancelled logout');
      // Close the user menu
      setShowUserMenu(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleProfileSettings = () => {
    setShowUserMenu(false);
    // Navigate to profile settings or open profile modal
    alert('Profile Settings - This feature will be available soon!');
  };

  const handleChangePassword = () => {
    setShowUserMenu(false);
    setShowChangePassword(true);
  };

  const handlePreferences = () => {
    setShowUserMenu(false);
    setShowPreferences(true);
  };

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      console.log('Refreshing session...');
      const success = await refreshSession();
      console.log('Session refresh result:', success);
      setShowUserMenu(false);
      if (success) {
        alert('Session refreshed successfully!');
      } else {
        alert('Failed to refresh session. Please try again.');
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      alert('Error refreshing session. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const closeModals = () => {
    setShowChangePassword(false);
    setShowPreferences(false);
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        
        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products, clients, stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <button className="notification-btn" title="Notifications">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>

          <div className="language-selector">
            <select className="language-dropdown">
              <option value="en">ENG</option>
              <option value="es">ESP</option>
              <option value="fr">FRA</option>
            </select>
          </div>

          <div className="user-menu">
            <button 
              className="user-profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user.role === 'admin' ? '👑' : user.role === 'technician' ? '🔧' : '👤'}
              </div>
              <div className="user-info">
                <div className="user-name">{user.fullName || user.username}</div>
                <div className="user-role">{user.role}</div>
              </div>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="greeting">{getGreeting()}, {user.fullName || user.username}!</div>
                  <div className="user-email">{user.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleProfileSettings}>
                  <span className="item-icon">👤</span>
                  Profile Settings
                </button>
                <button className="dropdown-item" onClick={handleChangePassword}>
                  <span className="item-icon">🔒</span>
                  Change Password
                </button>
                <button className="dropdown-item" onClick={handlePreferences}>
                  <span className="item-icon">⚙️</span>
                  Preferences
                </button>
                <button 
                  className="dropdown-item"
                  onClick={handleRefreshSession}
                  disabled={isRefreshing}
                >
                  <span className="item-icon">🔄</span>
                  {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span className="item-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" className="form-input" placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-input" placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" className="form-input" placeholder="Confirm new password" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModals}>Cancel</button>
              <button className="btn btn-primary">Change Password</button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Preferences</h3>
              <button className="modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Theme</label>
                <select className="form-select">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select className="form-select">
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="rw">Kinyarwanda</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notifications</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    Email notifications
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    Low stock alerts
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    System updates
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Dashboard Layout</label>
                <select className="form-select">
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModals}>Cancel</button>
              <button className="btn btn-primary">Save Preferences</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
