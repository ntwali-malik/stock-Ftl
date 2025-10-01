import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useClients } from '../../hooks/useClients';
import ClientForm from '../forms/ClientForm';
import DeleteConfirmation from '../common/DeleteConfirmation';
import './Sections.css';
import './Clients.css';

const Clients = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    clearError
  } = useClients();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.location && client.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.contact && client.contact.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'location':
          aValue = a.location || '';
          bValue = b.location || '';
          break;
        case 'contact':
          aValue = a.contact || '';
          bValue = b.contact || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleCreateClient = async (clientData) => {
    try {
      await createClient(clientData);
      setShowForm(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUpdateClient = async (clientData) => {
    try {
      await updateClient(editingClient._id, clientData);
      setEditingClient(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteClient = async () => {
    try {
      await deleteClient(deleteConfirm._id);
      setDeleteConfirm(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
  };

  const handleDeleteClick = (client) => {
    setDeleteConfirm(client);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

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
            <h1>Clients Management</h1>
            <p>Manage your client database and contact information.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            + Add Client
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
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
              <option value="location">Sort by Location</option>
              <option value="contact">Sort by Contact</option>
              <option value="createdAt">Sort by Date</option>
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

        {/* Clients List */}
        <div className="clients-container">
          {loading && clients.length === 0 ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No clients found</h3>
              <p>
                {searchTerm 
                  ? 'No clients match your search criteria.' 
                  : 'Get started by adding your first client.'
                }
              </p>
              {!searchTerm && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Add First Client
                </button>
              )}
            </div>
          ) : (
            <div className="clients-grid">
              {filteredClients.map((client) => (
                <div key={client._id} className="client-card">
                  <div className="client-header">
                    <div className="client-info">
                      <h3 className="client-name">{client.name}</h3>
                      <span className="client-date">
                        Added: {new Date(client.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="client-details">
                    {client.location && (
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{client.location}</span>
                      </div>
                    )}
                    
                    {client.contact && (
                      <div className="detail-item">
                        <span className="detail-icon">📞</span>
                        <span className="detail-label">Contact:</span>
                        <span className="detail-value">{client.contact}</span>
                      </div>
                    )}
                    
                    {!client.location && !client.contact && (
                      <div className="no-details">
                        <span className="no-details-text">No additional information provided</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="client-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditClient(client)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(client)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        {clients.length > 0 && (
          <div className="clients-stats">
            <div className="stat-item">
              <span className="stat-number">{clients.length}</span>
              <span className="stat-label">Total Clients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{clients.filter(c => c.location).length}</span>
              <span className="stat-label">With Location</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{clients.filter(c => c.contact).length}</span>
              <span className="stat-label">With Contact</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {clients.filter(c => {
                  const createdDate = new Date(c.createdAt);
                  const today = new Date();
                  const diffTime = Math.abs(today - createdDate);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}
              </span>
              <span className="stat-label">Added This Week</span>
            </div>
          </div>
        )}
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <ClientForm
          onSubmit={handleCreateClient}
          onCancel={handleCancelForm}
          loading={loading}
          error={error}
          existingClients={clients}
        />
      )}

      {/* Edit Client Form Modal */}
      {editingClient && (
        <ClientForm
          client={editingClient}
          onSubmit={handleUpdateClient}
          onCancel={handleCancelForm}
          loading={loading}
          error={error}
          existingClients={clients}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmation
          isOpen={!!deleteConfirm}
          onConfirm={handleDeleteClient}
          onCancel={handleCancelDelete}
          title="Delete Client"
          message="Are you sure you want to delete this client?"
          itemName={deleteConfirm.name}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Clients;