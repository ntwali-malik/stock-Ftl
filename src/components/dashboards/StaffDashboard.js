import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { dashboardService } from '../../services/dashboardService';
import '../DashboardCards.css';

const StaffDashboard = () => {
  const { stats, loading, error, refreshDashboard } = useDashboard();
  const [todaySales, setTodaySales] = useState(0);
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    // Fetch additional staff-specific data
    const fetchStaffData = async () => {
      try {
        const movements = await dashboardService.getRecentMovements(20);
        
        // Calculate today's sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaySalesCount = movements.filter(movement => {
          const movementDate = new Date(movement.createdAt);
          return movement.movementType === 'SALE' && movementDate >= today;
        }).length;
        
        setTodaySales(todaySalesCount);
        setRecentMovements(movements.slice(0, 10));
      } catch (err) {
        console.error('Error fetching staff dashboard data:', err);
      }
    };

    if (!loading) {
      fetchStaffData();
    }
  }, [loading]);

  const dashboardCards = [
    {
      id: 'sales',
      title: 'Today\'s Sales',
      value: todaySales,
      icon: '💰',
      color: 'green',
      subtitle: 'Sales completed today',
      trend: `${todaySales > 0 ? 'Active sales' : 'No sales today'}`
    },
    {
      id: 'clients',
      title: 'Total Clients',
      value: stats.totalClients,
      icon: '👥',
      color: 'blue',
      subtitle: 'Registered customers',
      trend: `${stats.totalClients > 0 ? 'Active customers' : 'No clients yet'}`
    },
    {
      id: 'movements',
      title: 'Today\'s Movements',
      value: stats.todayMovements,
      icon: '📈',
      color: 'purple',
      subtitle: 'Stock transactions today',
      trend: `${stats.todayMovements > 0 ? 'Active today' : 'No movements today'}`
    },
    {
      id: 'products',
      title: 'Available Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'teal',
      subtitle: 'Products in inventory',
      trend: `${stats.totalProducts > 0 ? 'Inventory available' : 'No products yet'}`
    },
    {
      id: 'low-stock',
      title: 'Low Stock Alert',
      value: stats.lowStockItems,
      icon: '⚠️',
      color: 'orange',
      subtitle: 'Items need restocking',
      trend: `${stats.lowStockItems > 0 ? 'Needs attention' : 'All items in stock'}`
    },
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: `${stats.monthlyRevenue.toLocaleString()} RWF`,
      icon: '💎',
      color: 'indigo',
      subtitle: 'This month\'s earnings',
      trend: `${stats.monthlyRevenue > 0 ? 'Revenue generated' : 'No sales this month'}`
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading staff dashboard...</p>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>Manage daily operations and customer interactions.</p>
        </div>
        <div className="dashboard-actions">
          <button 
            onClick={refreshDashboard}
            className="refresh-btn"
            title="Refresh dashboard data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>Error loading dashboard data: {error}</span>
          <button onClick={refreshDashboard} className="error-close">×</button>
        </div>
      )}

      <div className="dashboard-cards">
        {dashboardCards.map((card) => (
          <div key={card.id} className={`dashboard-card ${card.color}`}>
            <div className="card-header">
              <div className="card-icon">{card.icon}</div>
              <div className="card-title">{card.title}</div>
            </div>
            <div className="card-content">
              <div className="card-value">{card.value}</div>
              <div className="card-subtitle">{card.subtitle}</div>
              <div className="card-trend">{card.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-widgets">
        <div className="widget">
          <div className="widget-header">
            <h3>Recent Stock Movements</h3>
            <div className="widget-actions">
              <button className="widget-btn">📊</button>
            </div>
          </div>
          <div className="widget-content">
            <div className="movements-list">
              {recentMovements.length > 0 ? (
                recentMovements.slice(0, 5).map((movement) => (
                  <div key={movement._id} className="movement-item">
                    <div className="movement-info">
                      <span className={`movement-type ${movement.movementType?.toLowerCase()}`}>
                        {movement.movementType === 'PURCHASE' ? '📥' : '📤'}
                      </span>
                      <span className="movement-product">
                        {movement.product?.name || 'Unknown Product'}
                      </span>
                      <span className="movement-quantity">Qty: {movement.quantity}</span>
                    </div>
                    <div className="movement-date">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No recent movements</div>
              )}
            </div>
          </div>
        </div>

        <div className="widget">
          <div className="widget-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="widget-content">
            <div className="quick-actions">
              <button className="action-btn primary">
                <span className="action-icon">🛒</span>
                New Sale
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">👥</span>
                Add Client
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">📦</span>
                Check Stock
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">📋</span>
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;