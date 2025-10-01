import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useStockMovements } from '../../hooks/useStockMovements';
import { useProducts } from '../../hooks/useProducts';
import { useClients } from '../../hooks/useClients';
import StockMovementForm from '../forms/StockMovementForm';
import DeleteConfirmation from '../common/DeleteConfirmation';
import './Sections.css';
import './Stock.css';

const Stock = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const {
    stockMovements,
    loading,
    error,
    createStockMovement,
    updateStockMovement,
    deleteStockMovement,
    clearError
  } = useStockMovements();

  const { products } = useProducts();
  const { clients } = useClients();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const [showForm, setShowForm] = useState(false);
  const [editingStockMovement, setEditingStockMovement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filter and sort stock movements
  const filteredStockMovements = (stockMovements || [])
    .filter(movement => {
      if (!movement) return false; // Skip invalid movements
      
      const searchLower = (searchTerm || '').toLowerCase();
      const matchesSearch = 
        movement.product?.name?.toLowerCase().includes(searchLower) ||
        movement.client?.name?.toLowerCase().includes(searchLower) ||
        (movement.movementType && movement.movementType.toLowerCase().includes(searchLower));
      
      const matchesType = !filterType || movement.movementType === filterType;
      const matchesStatus = !filterStatus || movement.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      try {
        switch (sortBy) {
          case 'product':
            aValue = a.product?.name || '';
            bValue = b.product?.name || '';
            break;
          case 'movementType':
            aValue = a.movementType || '';
            bValue = b.movementType || '';
            break;
          case 'quantity':
            aValue = a.quantity || 0;
            bValue = b.quantity || 0;
            break;
          case 'client':
            aValue = a.client?.name || '';
            bValue = b.client?.name || '';
            break;
          case 'createdAt':
            aValue = a.createdAt ? new Date(a.createdAt) : new Date(0);
            bValue = b.createdAt ? new Date(b.createdAt) : new Date(0);
            break;
          default:
            aValue = a.createdAt ? new Date(a.createdAt) : new Date(0);
            bValue = b.createdAt ? new Date(b.createdAt) : new Date(0);
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      } catch (error) {
        console.error('Error sorting stock movements:', error);
        return 0; // Return 0 to maintain original order if sorting fails
      }
    });

  const handleCreateStockMovement = async (stockMovementData) => {
    try {
      await createStockMovement(stockMovementData);
      setShowForm(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUpdateStockMovement = async (stockMovementData) => {
    try {
      await updateStockMovement(editingStockMovement._id, stockMovementData);
      setEditingStockMovement(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteStockMovement = async () => {
    try {
      await deleteStockMovement(deleteConfirm._id);
      setDeleteConfirm(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleEditStockMovement = (stockMovement) => {
    setEditingStockMovement(stockMovement);
  };

  const handleDeleteClick = (stockMovement) => {
    setDeleteConfirm(stockMovement);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStockMovement(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  // Calculate stock statistics
  const calculateStockStats = () => {
    const purchases = stockMovements.filter(m => m.movementType === 'PURCHASE' && m.status === 'YES');
    const sales = stockMovements.filter(m => m.movementType === 'SALE' && m.status === 'YES');
    
    const totalPurchased = purchases.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const totalSold = sales.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const currentStock = totalPurchased - totalSold;
    
    return {
      totalPurchased,
      totalSold,
      currentStock,
      purchaseCount: purchases.length,
      saleCount: sales.length
    };
  };

  const stockStats = calculateStockStats();

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

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="header-content">
          <div>
            <h1>Stock Movement Management</h1>
            <p>Track inventory movements, purchases, and sales.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            + Add Movement
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}

      <div className="section-content">
        {/* Search and Filter Controls */}
        <div className="controls-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-controls">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="PURCHASE">Purchases</option>
              <option value="SALE">Sales</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="YES">Active</option>
              <option value="NO">Inactive</option>
            </select>
          </div>
          
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="product">Sort by Product</option>
              <option value="movementType">Sort by Type</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="client">Sort by Client</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-btn"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Stock Movements List */}
        <div className="stock-movements-container">
          {loading && stockMovements.length === 0 ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading stock movements...</p>
            </div>
          ) : filteredStockMovements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No stock movements found</h3>
              <p>
                {searchTerm || filterType || filterStatus
                  ? 'No movements match your search criteria.' 
                  : 'Get started by adding your first stock movement.'
                }
              </p>
              {!searchTerm && !filterType && !filterStatus && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Add First Movement
                </button>
              )}
            </div>
          ) : (
            <div className="stock-movements-grid">
              {filteredStockMovements.map((movement) => {
                if (!movement || !movement._id) return null; // Skip invalid movements
                
                return (
                  <div key={movement._id} className={`stock-movement-card ${(movement.movementType || '').toLowerCase()}`}>
                    <div className="movement-header">
                      <div className="movement-type">
                        <span className={`type-badge ${(movement.movementType || '').toLowerCase()}`}>
                          {movement.movementType === 'PURCHASE' ? '📥 Purchase' : '📤 Sale'}
                        </span>
                        <span className={`status-badge ${(movement.status || '').toLowerCase()}`}>
                          {movement.status === 'YES' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="movement-date">
                        {movement.createdAt ? new Date(movement.createdAt).toLocaleDateString() : 'Unknown Date'}
                      </div>
                    </div>
                  
                  <div className="movement-details">
                    <div className="detail-item">
                      <span className="detail-label">Product:</span>
                      <span className="detail-value">{getProductName(movement.product?._id || movement.product)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value quantity">{movement.quantity}</span>
                    </div>
                    
                    {movement.movementType === 'SALE' && movement.client && (
                      <div className="detail-item">
                        <span className="detail-label">Client:</span>
                        <span className="detail-value">{getClientName(movement.client?._id || movement.client)}</span>
                      </div>
                    )}
                    
                    {movement.movementType === 'PURCHASE' && movement.purchaseDate && (
                      <div className="detail-item">
                        <span className="detail-label">Purchase Date:</span>
                        <span className="detail-value">{new Date(movement.purchaseDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="movement-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditStockMovement(movement)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(movement)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Statistics */}
        {stockMovements.length > 0 && (
          <div className="stock-stats">
            <div className="stat-item">
              <span className="stat-number">{stockStats.currentStock}</span>
              <span className="stat-label">Current Stock</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stockStats.totalPurchased}</span>
              <span className="stat-label">Total Purchased</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stockStats.totalSold}</span>
              <span className="stat-label">Total Sold</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stockStats.purchaseCount}</span>
              <span className="stat-label">Purchase Orders</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stockStats.saleCount}</span>
              <span className="stat-label">Sales Orders</span>
            </div>
          </div>
        )}
      </div>

      {/* Stock Movement Form Modal */}
      {showForm && (
        <StockMovementForm
          onSubmit={handleCreateStockMovement}
          onCancel={handleCancelForm}
          loading={loading}
          error={error}
          products={products}
          clients={clients}
        />
      )}

      {/* Edit Stock Movement Form Modal */}
      {editingStockMovement && (
        <StockMovementForm
          stockMovement={editingStockMovement}
          onSubmit={handleUpdateStockMovement}
          onCancel={handleCancelForm}
          loading={loading}
          error={error}
          products={products}
          clients={clients}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmation
          isOpen={!!deleteConfirm}
          onConfirm={handleDeleteStockMovement}
          onCancel={handleCancelDelete}
          title="Delete Stock Movement"
          message="Are you sure you want to delete this stock movement?"
          itemName={`${deleteConfirm.movementType} - ${getProductName(deleteConfirm.product?._id || deleteConfirm.product)}`}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Stock;