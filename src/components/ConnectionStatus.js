import React, { useState, useEffect } from 'react';
import { checkBackendStatus } from '../utils/backendStatus';

const ConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setError(null);
    
    try {
      const result = await checkBackendStatus();
      setLastChecked(new Date());
      
      if (result.status === 'ok') {
        setConnectionStatus('connected');
      } else if (result.status === 'html') {
        setConnectionStatus('partial');
        setError('Backend is running but may not be properly configured');
      } else {
        setConnectionStatus('disconnected');
        setError(result.error || 'Backend server is not accessible');
      }
    } catch (err) {
      setConnectionStatus('disconnected');
      setError(err.message);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981'; // green
      case 'partial': return '#f59e0b'; // yellow
      case 'disconnected': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'partial': return 'Partial Connection';
      case 'disconnected': return 'Disconnected';
      default: return 'Checking...';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'partial': return '🟡';
      case 'disconnected': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="connection-status" style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{getStatusIcon()}</span>
        <span style={{ fontWeight: 'bold', color: getStatusColor() }}>
          Backend: {getStatusText()}
        </span>
        <button 
          onClick={checkConnection}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px'
          }}
          title="Check connection"
        >
          🔄
        </button>
      </div>
      
      {error && (
        <div style={{ 
          marginTop: '4px', 
          fontSize: '10px', 
          color: '#ef4444',
          wordBreak: 'break-word'
        }}>
          {error}
        </div>
      )}
      
      {lastChecked && (
        <div style={{ 
          marginTop: '4px', 
          fontSize: '10px', 
          color: '#6b7280'
        }}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}
      
      {connectionStatus === 'disconnected' && (
        <div style={{ 
          marginTop: '4px', 
          fontSize: '10px', 
          color: '#6b7280'
        }}>
          <div>• Check if backend server is running</div>
          <div>• Verify port configuration</div>
          <div>• Check network connectivity</div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
