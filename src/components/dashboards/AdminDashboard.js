import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { dashboardService } from '../../services/dashboardService';
import '../DashboardCards.css';

const AdminDashboard = () => {
  const { stats, loading, error, refreshDashboard } = useDashboard();
  // const [lowStockProducts, setLowStockProducts] = useState([]);
  // const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    // Fetch additional data
    const fetchAdditionalData = async () => {
      try {
        // const [lowStock, movements] = await Promise.all([
        //   dashboardService.getLowStockProducts(10),
        //   dashboardService.getRecentMovements(5)
        // ]);
        // setLowStockProducts(lowStock);
        // setRecentMovements(movements);
      } catch (err) {
        console.error('Error fetching additional dashboard data:', err);
      }
    };

    if (!loading) {
      fetchAdditionalData();
    }
  }, [loading]);

  const dashboardCards = [
    {
      id: 'products',
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'blue',
      subtitle: 'Active inventory items',
      trend: `${stats.totalProducts > 0 ? 'Active' : 'No products yet'}`
    },
    {
      id: 'categories',
      title: 'Categories',
      value: stats.totalCategories,
      icon: '📁',
      color: 'green',
      subtitle: 'Product categories',
      trend: `${stats.totalCategories > 0 ? 'Organized' : 'No categories yet'}`
    },
    {
      id: 'clients',
      title: 'Total Clients',
      value: stats.totalClients,
      icon: '👥',
      color: 'purple',
      subtitle: 'Registered clients',
      trend: `${stats.totalClients > 0 ? 'Active customers' : 'No clients yet'}`
    },
    {
      id: 'stock-value',
      title: 'Stock Value',
      value: `${stats.totalStockValue.toLocaleString()} RWF`,
      icon: '💰',
      color: 'orange',
      subtitle: 'Total inventory value',
      trend: `${stats.totalStockValue > 0 ? 'Current value' : 'No stock value'}`
    },
    {
      id: 'low-stock',
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: '⚠️',
      color: 'red',
      subtitle: 'Items need restocking',
      trend: `${stats.lowStockItems > 0 ? 'Needs attention' : 'All items in stock'}`
    },
    {
      id: 'movements',
      title: 'Today\'s Movements',
      value: stats.todayMovements,
      icon: '📈',
      color: 'teal',
      subtitle: 'Today\'s transactions',
      trend: `${stats.todayMovements > 0 ? 'Active today' : 'No movements today'}`
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
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="greeting">{getGreeting()}, Admin!</span>
              <span className="hero-subtitle">Welcome to your command center</span>
            </h1>
            <p className="hero-description">
              Here's your complete overview of the Fabritech inventory management system. 
              Monitor performance, track key metrics, and manage your business efficiently.
            </p>
            <div className="hero-meta">
              <span className="current-date">{getCurrentDate()}</span>
              <span className="system-status">
                <span className="status-indicator"></span>
                System Online
              </span>
            </div>
          </div>
          <div className="hero-actions">
            <button 
              onClick={refreshDashboard}
              className="hero-refresh-btn"
              title="Refresh dashboard data"
            >
              <span className="refresh-icon">🔄</span>
              <span>Refresh Data</span>
            </button>
            <button className="hero-export-btn">
              <span className="export-icon">📊</span>
              <span>Export Report</span>
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-stats-preview">
            <div className="preview-stat">
              <span className="preview-value">{stats.totalProducts}</span>
              <span className="preview-label">Products</span>
            </div>
            <div className="preview-stat">
              <span className="preview-value">{stats.totalClients}</span>
              <span className="preview-label">Clients</span>
            </div>
            <div className="preview-stat">
              <span className="preview-value">{stats.lowStockItems}</span>
              <span className="preview-label">Low Stock</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>Error loading dashboard data: {error}</span>
          <button onClick={refreshDashboard} className="error-close">×</button>
        </div>
      )}

      {/* Key Metrics Section */}
      <div className="metrics-section">
        <div className="section-header">
          <h2>Key Performance Indicators</h2>
          <p>Monitor your business metrics at a glance</p>
        </div>
        <div className="metrics-grid">
          {dashboardCards.map((card) => (
            <div key={card.id} className={`metric-card ${card.color}`}>
              <div className="metric-header">
                <div className="metric-icon">{card.icon}</div>
                <div className="metric-title">{card.title}</div>
              </div>
              <div className="metric-content">
                <div className="metric-value">{card.value}</div>
                <div className="metric-subtitle">{card.subtitle}</div>
                <div className="metric-trend">
                  <span className="trend-indicator">●</span>
                  {card.trend}
                </div>
              </div>
              <div className="metric-footer">
                <button className="metric-action-btn">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics & Insights Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h2>Analytics & Insights</h2>
          <p>Visualize your data and take informed actions</p>
        </div>
        
        <div className="analytics-grid">
          {/* Stock Movement Chart */}
          <div className="analytics-card chart-card">
            <div className="card-header">
              <div className="card-title-section">
                <h3>Stock Movement Trends</h3>
                <p>Monthly inventory changes</p>
              </div>
              <div className="card-actions">
                <button className="action-icon-btn" title="Full Screen">
                  <span>⛶</span>
                </button>
                <button className="action-icon-btn" title="Settings">
                  <span>⚙️</span>
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="chart-container">
                <div className="chart-bars">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((height, index) => (
                    <div key={index} className="chart-bar" style={{ height: `${height}%` }}>
                      <div className="bar-value">{height}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-labels">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                    <span key={month} className="chart-label">{month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category Stock */}
          <div className="analytics-card category-card">
            <div className="card-header">
              <div className="card-title-section">
                <h3>Inventory by Category</h3>
                <p>Stock distribution overview</p>
              </div>
              <div className="card-actions">
                <button className="action-icon-btn" title="View All">
                  <span>📊</span>
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="category-list">
                {stats.categoryStock.length > 0 ? (
                  stats.categoryStock.map((category, index) => (
                    <div key={category.categoryId} className="category-item">
                      <div className="category-header">
                        <div className="category-name">{category.categoryName}</div>
                        <div className="category-badge">{category.productCount} items</div>
                      </div>
                      <div className="category-stats">
                        <div className="stock-quantity">
                          {category.totalQuantity} {
                            category.categoryName === 'Starlink Standard V3' || 
                            category.categoryName === 'Starlink Mini Kit' || 
                            category.categoryName === 'Starlink Enterprise Kit' 
                              ? 'Kits' 
                              : category.categoryName === 'Starlink Ethernet Adapter' || 
                                category.categoryName === 'Satrlink Ethernet Adapter'
                                ? 'Box' 
                                : 'units'
                          }
                        </div>
                        <div className="stock-bar">
                          <div 
                            className="stock-fill" 
                            style={{ 
                              width: `${Math.min((category.totalQuantity / 100) * 100, 100)}%`,
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data-state">
                    <div className="no-data-icon">📦</div>
                    <p>No category data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Common tasks and shortcuts</p>
        </div>
        <div className="actions-grid">
          <button className="action-card primary-action">
            <div className="action-icon">➕</div>
            <div className="action-content">
              <h4>Add Product</h4>
              <p>Create new inventory item</p>
            </div>
            <div className="action-arrow">→</div>
          </button>
          
          <button className="action-card secondary-action">
            <div className="action-icon">📦</div>
            <div className="action-content">
              <h4>Stock Movement</h4>
              <p>Record purchase or sale</p>
            </div>
            <div className="action-arrow">→</div>
          </button>
          
          <button className="action-card secondary-action">
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h4>Add Client</h4>
              <p>Register new customer</p>
            </div>
            <div className="action-arrow">→</div>
          </button>
          
          <button className="action-card secondary-action">
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h4>Generate Report</h4>
              <p>Create detailed analytics</p>
            </div>
            <div className="action-arrow">→</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
