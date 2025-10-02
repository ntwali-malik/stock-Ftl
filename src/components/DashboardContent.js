import React from 'react';
import AdminDashboard from './dashboards/AdminDashboard';
import TechnicianDashboard from './dashboards/TechnicianDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import Products from './sections/Products';
import Categories from './sections/Categories';
import Stock from './sections/Stock';
import Clients from './sections/Clients';
import Reports from './sections/Reports';
import Settings from './sections/Settings';

const DashboardContent = ({ activeSection, userRole }) => {
  console.log('DashboardContent: activeSection:', activeSection);
  console.log('DashboardContent: userRole:', userRole);
  
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        console.log('DashboardContent: Rendering dashboard for role:', userRole);
        // Normalize role to lowercase for comparison
        const normalizedRole = (userRole || '').toLowerCase();
        console.log('DashboardContent: Normalized role:', normalizedRole);
        
        switch (normalizedRole) {
          case 'admin':
            console.log('DashboardContent: Rendering AdminDashboard');
            return <AdminDashboard />;
          case 'technician':
            console.log('DashboardContent: Rendering TechnicianDashboard');
            return <TechnicianDashboard />;
          case 'staff':
            console.log('DashboardContent: Rendering StaffDashboard');
            return <StaffDashboard />;
          default:
            console.log('DashboardContent: Default case - Rendering StaffDashboard for role:', normalizedRole);
            return <StaffDashboard />;
        }
      case 'products':
        // Only Admin and Staff can access Products
        const normalizedUserRole = (userRole || '').toLowerCase();
        if (normalizedUserRole === 'admin' || normalizedUserRole === 'staff') {
          return <Products />;
        } else {
          // Redirect technicians to dashboard if they try to access products
          return <TechnicianDashboard />;
        }
      case 'categories':
        return <Categories />;
      case 'stock':
        return <Stock />;
      case 'clients':
        return <Clients />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <StaffDashboard />;
    }
  };

  return (
    <main className="dashboard-content">
      {renderContent()}
    </main>
  );
};

export default DashboardContent;
