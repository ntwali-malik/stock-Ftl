import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalClients: 0,
    totalStockMovements: 0,
    lowStockItems: 0,
    totalStockValue: 0,
    todayMovements: 0,
    monthlyRevenue: 0,
    recentMovements: [],
    categoryStock: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await dashboardService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch low stock products
  const fetchLowStockProducts = useCallback(async (threshold = 10) => {
    try {
      return await dashboardService.getLowStockProducts(threshold);
    } catch (err) {
      console.error('Error fetching low stock products:', err);
      return [];
    }
  }, []);

  // Fetch recent movements
  const fetchRecentMovements = useCallback(async (limit = 10) => {
    try {
      return await dashboardService.getRecentMovements(limit);
    } catch (err) {
      console.error('Error fetching recent movements:', err);
      return [];
    }
  }, []);

  // Fetch top selling products
  const fetchTopSellingProducts = useCallback(async (limit = 5) => {
    try {
      return await dashboardService.getTopSellingProducts(limit);
    } catch (err) {
      console.error('Error fetching top selling products:', err);
      return [];
    }
  }, []);

  // Fetch sales summary for charts
  const fetchSalesSummary = useCallback(async (startDate, endDate) => {
    try {
      return await dashboardService.getSalesSummary(startDate, endDate);
    } catch (err) {
      console.error('Error fetching sales summary:', err);
      return [];
    }
  }, []);

  // Load dashboard data on mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Refresh dashboard data
  const refreshDashboard = useCallback(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    refreshDashboard,
    fetchLowStockProducts,
    fetchRecentMovements,
    fetchTopSellingProducts,
    fetchSalesSummary
  };
};

export default useDashboard;
