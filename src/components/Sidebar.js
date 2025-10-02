import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection, collapsed, open, userRole = 'staff', onClose }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      roles: ['admin', 'technician', 'staff']
    },
    {
      id: 'products',
      label: 'Products',
      icon: '📦',
      roles: ['admin', 'staff']
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: '📁',
      roles: ['admin', 'technician', 'staff']
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: '📈',
      roles: ['admin', 'technician', 'staff']
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: '👥',
      roles: ['admin', 'technician', 'staff']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📋',
      roles: ['admin']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1024 && onClose) {
      onClose();
    }
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📦</span>
          {!collapsed && <span className="logo-text">STOCKMATE</span>}
        </div>
        {/* Mobile close button */}
        {window.innerWidth <= 1024 && open && (
          <button className="mobile-close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredMenuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleSectionClick(item.id)}
                title={collapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {!collapsed && activeSection === item.id && (
                  <span className="nav-arrow">→</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {(userRole || 'staff') === 'admin' ? '👑' : (userRole || 'staff') === 'technician' ? '🔧' : '👤'}
          </div>
          {!collapsed && (
            <div className="user-details">
              <div className="user-name">{(userRole || 'staff').charAt(0).toUpperCase() + (userRole || 'staff').slice(1)}</div>
              <div className="user-role">{userRole || 'staff'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
