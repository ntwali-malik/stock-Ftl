import { useState, useEffect, useCallback } from 'react';
import clientService from '../services/clientService';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all clients
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClients();
      setClients(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new client
  const createClient = useCallback(async (clientData) => {
    try {
      setLoading(true);
      setError(null);
      const newClient = await clientService.createClient(clientData);
      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a client
  const updateClient = useCallback(async (clientId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedClient = await clientService.updateClient(clientId, updateData);
      setClients(prev => 
        prev.map(client => 
          client._id === clientId ? updatedClient : client
        )
      );
      return updatedClient;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a client
  const deleteClient = useCallback(async (clientId) => {
    try {
      setLoading(true);
      setError(null);
      await clientService.deleteClient(clientId);
      setClients(prev => prev.filter(client => client._id !== clientId));
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get client by ID
  const getClientById = useCallback(async (clientId) => {
    try {
      setLoading(true);
      setError(null);
      const client = await clientService.getClientById(clientId);
      return client;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    clearError
  };
};

// Hook for managing a single client
export const useClient = (clientId) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch single client
  const fetchClient = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClientById(clientId);
      setClient(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Update client
  const updateClient = useCallback(async (updateData) => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedClient = await clientService.updateClient(clientId, updateData);
      setClient(updatedClient);
      return updatedClient;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Delete client
  const deleteClient = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);
      await clientService.deleteClient(clientId);
      setClient(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load client on mount
  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return {
    client,
    loading,
    error,
    fetchClient,
    updateClient,
    deleteClient,
    clearError
  };
};

export default useClients;
