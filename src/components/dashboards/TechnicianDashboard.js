import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { dashboardService } from '../../services/dashboardService';
import '../DashboardCards.css';

const TechnicianDashboard = () => {
  const { stats, loading, error, refreshDashboard } = useDashboard();
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    // Fetch technician-specific data
    const fetchTechnicianData = async () => {
      try {
        const [lowStock, movements] = await Promise.all([
          dashboardService.getLowStockProducts(5), // Critical threshold
          dashboardService.getRecentMovements(10)
        ]);
        
        setLowStockProducts(lowStock);
        setRecentMovements(movements);
      } catch (err) {
        console.error('Error fetching technician dashboard data:', err);
      }
    };

    if (!loading) {
      fetchTechnicianData();
    }
  }, [loading]);

  // Calculate sold out metrics
  const soldOutItems = stats.categoryStock ? stats.categoryStock.filter(cat => cat.totalQuantity === 0).length : 0;
  const totalSales = stats.todayMovements || 0; // This could be refined to show actual sales
  const outOfStockProducts = stats.categoryStock ? 
    stats.categoryStock.reduce((total, cat) => total + (cat.totalQuantity === 0 ? cat.productCount : 0), 0) : 0;

  const dashboardCards = [
    {
      id: 'sold-out',
      title: 'Sold Out Categories',
      value: soldOutItems,
      icon: '🚫',
      color: 'red',
      subtitle: 'Categories completely sold out',
      trend: `${soldOutItems > 0 ? 'Requires restocking' : 'All categories have stock'}`
    },
    {
      id: 'out-of-stock',
      title: 'Out of Stock Products',
      value: outOfStockProducts,
      icon: '📦',
      color: 'orange',
      subtitle: 'Products with zero quantity',
      trend: `${outOfStockProducts > 0 ? 'Need replenishment' : 'All products in stock'}`
    },
    {
      id: 'low-stock',
      title: 'Low Stock Alerts',
      value: stats.lowStockItems,
      icon: '⚠️',
      color: 'yellow',
      subtitle: 'Items running low',
      trend: `${stats.lowStockItems > 0 ? 'Monitor closely' : 'Stock levels healthy'}`
    },
    {
      id: 'total-sales',
      title: 'Today\'s Sales',
      value: totalSales,
      icon: '📤',
      color: 'purple',
      subtitle: 'Items sold today',
      trend: `${totalSales > 0 ? 'Active sales day' : 'No sales today'}`
    },
    {
      id: 'categories',
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: '📁',
      color: 'green',
      subtitle: 'Product categories managed',
      trend: `${stats.totalCategories > 0 ? 'Well organized' : 'No categories yet'}`
    },
    {
      id: 'system-health',
      title: 'System Status',
      value: 'Online',
      icon: '💚',
      color: 'teal',
      subtitle: 'Backend connectivity',
      trend: error ? 'Connection issues' : 'All systems operational'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading technician dashboard...</p>
      </div>
    );
  }

  return (
    <div className="technician-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Technician Dashboard</h1>
          <p>Monitor sold out items, stock depletion, and inventory replenishment needs.</p>
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
            <h3>Low Stock Alerts</h3>
            <div className="widget-actions">
              <button className="widget-btn">⚠️</button>
            </div>
          </div>
          <div className="widget-content">
            <div className="alerts-list">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product._id} className="alert-item">
                    <div className="alert-info">
                      <span className="alert-product">{product.name}</span>
                      <span className="alert-quantity">Stock: {product.quantity || 0}</span>
                    </div>
                    <div className="alert-category">
                      {product.category?.name || 'No Category'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No low stock alerts</div>
              )}
            </div>
          </div>
        </div>

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
            <h3>Stock Status by Category</h3>
            <div className="widget-actions">
              <button className="widget-btn">🚫</button>
            </div>
          </div>
          <div className="widget-content">
            <div className="category-stock-list">
              {stats.categoryStock.length > 0 ? (
                stats.categoryStock.slice(0, 5).map((category) => (
                  <div key={category.categoryId} className={`category-stock-item ${category.totalQuantity === 0 ? 'sold-out' : category.totalQuantity <= 5 ? 'low-stock' : ''}`}>
                    <div className="category-info">
                      <div className="category-name">
                        {category.totalQuantity === 0 && <span className="sold-out-icon">🚫</span>}
                        {category.categoryName}
                      </div>
                      <div className="category-details">
                        <span className="product-count">{category.productCount} products</span>
                        <span className={`stock-quantity ${category.totalQuantity === 0 ? 'zero-stock' : category.totalQuantity <= 5 ? 'low-stock-text' : ''}`}>
                          {category.totalQuantity} {
                            category.categoryName === 'Starlink Standard V3' || 
                            category.categoryName === 'Starlink Mini Kit' || 
                            category.categoryName === 'Starlink Mini' ||
                            category.categoryName === 'Starlink Enterprise Kit' ||
                            (category.categoryName.includes('Starlink') && 
                             (category.categoryName.includes('Standard') || 
                              category.categoryName.includes('Mini') || 
                              category.categoryName.includes('Enterprise')))
                              ? 'Kits' 
                              : category.categoryName === 'Starlink Ethernet Adapter' || 
                                category.categoryName === 'Starlink Ethernet Adapters' ||
                                category.categoryName === 'Satrlink Ethernet Adapter' ||
                                (category.categoryName.includes('Starlink') && category.categoryName.includes('Ethernet'))
                                ? 'Box' 
                                : 'units'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No category stock data available</div>
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
                <span className="action-icon">📦</span>
                Update Stock
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">🔧</span>
                System Check
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">📊</span>
                Generate Report
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">⚠️</span>
                View Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;