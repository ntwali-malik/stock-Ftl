import { useState, useEffect, useCallback } from 'react';
import stockMovementService from '../services/stockMovementService';

export const useStockMovements = () => {
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all stock movements
  const fetchStockMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stockMovementService.getMovements();
      setStockMovements(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new stock movement
  const createStockMovement = useCallback(async (stockMovementData) => {
    try {
      setLoading(true);
      setError(null);
      const newStockMovement = await stockMovementService.createMovement(stockMovementData);
      setStockMovements(prev => [newStockMovement, ...prev]);
      return newStockMovement;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a stock movement
  const updateStockMovement = useCallback(async (stockMovementId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedStockMovement = await stockMovementService.updateMovement(stockMovementId, updateData);
      setStockMovements(prev => 
        prev.map(stockMovement => 
          stockMovement._id === stockMovementId ? updatedStockMovement : stockMovement
        )
      );
      return updatedStockMovement;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a stock movement
  const deleteStockMovement = useCallback(async (stockMovementId) => {
    try {
      setLoading(true);
      setError(null);
      await stockMovementService.deleteMovement(stockMovementId);
      setStockMovements(prev => prev.filter(stockMovement => stockMovement._id !== stockMovementId));
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get stock movement by ID
  const getStockMovementById = useCallback(async (stockMovementId) => {
    try {
      setLoading(true);
      setError(null);
      const stockMovement = await stockMovementService.getMovementById(stockMovementId);
      return stockMovement;
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

  // Load stock movements on mount
  useEffect(() => {
    fetchStockMovements();
  }, [fetchStockMovements]);

  return {
    stockMovements,
    loading,
    error,
    fetchStockMovements,
    createStockMovement,
    updateStockMovement,
    deleteStockMovement,
    getStockMovementById,
    clearError
  };
};

// Hook for managing a single stock movement
export const useStockMovement = (stockMovementId) => {
  const [stockMovement, setStockMovement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch single stock movement
  const fetchStockMovement = useCallback(async () => {
    if (!stockMovementId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await stockMovementService.getMovementById(stockMovementId);
      setStockMovement(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stockMovementId]);

  // Update stock movement
  const updateStockMovement = useCallback(async (updateData) => {
    if (!stockMovementId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedStockMovement = await stockMovementService.updateMovement(stockMovementId, updateData);
      setStockMovement(updatedStockMovement);
      return updatedStockMovement;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stockMovementId]);

  // Delete stock movement
  const deleteStockMovement = useCallback(async () => {
    if (!stockMovementId) return;

    try {
      setLoading(true);
      setError(null);
      await stockMovementService.deleteMovement(stockMovementId);
      setStockMovement(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stockMovementId]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load stock movement on mount
  useEffect(() => {
    fetchStockMovement();
  }, [fetchStockMovement]);

  return {
    stockMovement,
    loading,
    error,
    fetchStockMovement,
    updateStockMovement,
    deleteStockMovement,
    clearError
  };
};

export default useStockMovements;
