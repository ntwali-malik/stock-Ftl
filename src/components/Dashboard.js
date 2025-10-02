import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardContent from './DashboardContent';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set appropriate dashboard based on user role
  React.useEffect(() => {
    if (user) {
      console.log('Dashboard: User object:', user);
      console.log('Dashboard: User role:', user.role);
      
      // Automatically set the appropriate dashboard section based on role
      const getDashboardForRole = (role) => {
        switch (role) {
          case 'admin':
            return 'dashboard'; // AdminDashboard
          case 'technician':
            return 'dashboard'; // TechnicianDashboard
          case 'staff':
            return 'dashboard'; // StaffDashboard
          default:
            return 'dashboard'; // StaffDashboard
        }
      };
      
      const appropriateSection = getDashboardForRole(user.role);
      console.log('Dashboard: Setting active section to:', appropriateSection);
      setActiveSection(appropriateSection);
    }
  }, [user]);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        // On desktop, close mobile sidebar
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-error">
        <h2>Access Denied</h2>
        <p>Please log in to access the dashboard.</p>
      </div>
    );
  }

  const toggleSidebar = () => {
    // Check if we're on mobile (screen width <= 1024px)
    const isMobile = window.innerWidth <= 1024;
    
    if (isMobile) {
      // On mobile, toggle the open state
      setSidebarOpen(!sidebarOpen);
    } else {
      // On desktop, toggle the collapsed state
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Handle section changes with role-based access control
  const handleSetActiveSection = (section) => {
    const userRole = (user?.role || '').toLowerCase();
    
    // Prevent technicians from accessing products section
    if (section === 'products' && userRole === 'technician') {
      // Redirect technicians to dashboard if they try to access products
      setActiveSection('dashboard');
      return;
    }
    
    setActiveSection(section);
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Mobile overlay */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}
      
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={handleSetActiveSection}
        collapsed={sidebarCollapsed}
        open={sidebarOpen}
        userRole={user.role}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header 
          user={user}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <DashboardContent 
          activeSection={activeSection}
          userRole={user.role}
        />
      </div>
    </div>
  );
};

export default Dashboard;
