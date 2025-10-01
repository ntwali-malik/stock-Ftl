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
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        switch (userRole) {
          case 'admin':
            return <AdminDashboard />;
          case 'technician':
            return <TechnicianDashboard />;
          case 'staff':
            return <StaffDashboard />;
          default:
            return <StaffDashboard />;
        }
      case 'products':
        return <Products />;
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
