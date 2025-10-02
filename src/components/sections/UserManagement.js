import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import UserForm from '../forms/UserForm';
import DeleteConfirmation from '../common/DeleteConfirmation';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers();
      setUsers(Array.isArray(response) ? response : response.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
      // Mock data for development
      setUsers([
        {
          _id: '1',
          username: 'admin',
          fullName: 'System Administrator',
          email: 'admin@fabritech.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          username: 'staff001',
          fullName: 'John Doe',
          email: 'staff@fabritech.com',
          role: 'staff',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '3',
          username: 'tech001',
          fullName: 'Jane Smith',
          email: 'tech@fabritech.com',
          role: 'technician',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    setLoading(true);
    try {
      const newUser = await userService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Failed to create user:', err);
      setError('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    setLoading(true);
    try {
      const updatedUser = await userService.updateUser(editingUser._id, userData);
      setUsers(prev => prev.map(user => 
        user._id === editingUser._id ? updatedUser : user
      ));
      setShowForm(false);
      setEditingUser(null);
      setError(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    try {
      await userService.deleteUser(deleteConfirm._id);
      setUsers(prev => prev.filter(user => user._id !== deleteConfirm._id));
      setDeleteConfirm(null);
      setError(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#e74c3c';
      case 'staff': return '#3498db';
      case 'technician': return '#f39c12';
      default: return '#95a5a6';
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Create, edit, and manage user accounts and permissions</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          <span className="btn-icon">👤</span>
          Add New User
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="technician">Technician</option>
          </select>
          
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading && !users.length ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Email</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.fullName}</div>
                        <div className="user-username">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="role-badge" 
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="email">{user.email}</div>
                  </td>
                  <td className="date-cell">
                    {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setEditingUser(user);
                          setShowForm(true);
                        }}
                        title="Edit User"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteConfirm(user)}
                        title="Delete User"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No users found</h3>
            <p>
              {searchTerm || filterRole 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first user'
              }
            </p>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmation
          isOpen={!!deleteConfirm}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteConfirm(null)}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          itemName={`${deleteConfirm.fullName} (@${deleteConfirm.username})`}
          loading={loading}
        />
      )}
    </div>
  );
};

export default UserManagement;
