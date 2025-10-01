// Dashboard service for fetching real-time dashboard data
import { productService } from './productService';
import { categoryService } from './categoryService';
import { clientService } from './clientService';
import { stockMovementService } from './stockMovementService';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text.substring(0, 200));
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const dashboardService = {
  // Get comprehensive dashboard statistics
  getDashboardStats: async () => {
    try {
      // Fetch all data in parallel
      const [products, categories, clients, stockMovements, stockBalance] = await Promise.allSettled([
        productService.getProducts(),
        categoryService.getCategories(),
        clientService.getClients(),
        stockMovementService.getMovements(),
        stockMovementService.getStockBalance()
      ]);

      // Calculate statistics
      const stats = {
        totalProducts: products.status === 'fulfilled' ? products.value.length : 0,
        totalCategories: categories.status === 'fulfilled' ? categories.value.length : 0,
        totalClients: clients.status === 'fulfilled' ? clients.value.length : 0,
        totalStockMovements: stockMovements.status === 'fulfilled' ? stockMovements.value.length : 0,
        lowStockItems: 0,
        totalStockValue: 0,
        todayMovements: 0,
        monthlyRevenue: 0,
        recentMovements: [],
        categoryStock: []
      };

      // Calculate low stock items
      if (products.status === 'fulfilled') {
        stats.lowStockItems = products.value.filter(product => (product.quantity || 0) <= 10).length;
      }

      // Calculate total stock value and category stock
      if (products.status === 'fulfilled') {
        stats.totalStockValue = products.value.reduce((sum, product) => {
          const quantity = product.quantity || 0;
          const price = product.purchasePrice || 0;
          return sum + (quantity * price);
        }, 0);

        // Calculate stock by category
        const categoryStockMap = {};
        products.value.forEach(product => {
          const categoryId = product.category?._id || product.category;
          const categoryName = product.category?.name || 'Uncategorized';
          const quantity = product.quantity || 0;
          const value = quantity * (product.purchasePrice || 0);

          if (!categoryStockMap[categoryId]) {
            categoryStockMap[categoryId] = {
              categoryId,
              categoryName,
              totalQuantity: 0,
              totalValue: 0,
              productCount: 0
            };
          }

          categoryStockMap[categoryId].totalQuantity += quantity;
          categoryStockMap[categoryId].totalValue += value;
          categoryStockMap[categoryId].productCount += 1;
        });

        stats.categoryStock = Object.values(categoryStockMap).sort((a, b) => b.totalQuantity - a.totalQuantity);
      }

      // Calculate today's movements
      if (stockMovements.status === 'fulfilled') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        stats.todayMovements = stockMovements.value.filter(movement => {
          const movementDate = new Date(movement.createdAt);
          return movementDate >= today;
        }).length;

        // Get recent movements (last 5)
        stats.recentMovements = stockMovements.value
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
      }

      // Calculate monthly revenue
      if (stockMovements.status === 'fulfilled') {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const monthlySales = stockMovements.value.filter(movement => {
          const movementDate = new Date(movement.createdAt);
          return movement.movementType === 'SALE' && movementDate >= currentMonth;
        });

        stats.monthlyRevenue = monthlySales.reduce((sum, sale) => {
          const product = sale.product;
          if (product && product.sellingPrice) {
            return sum + (sale.quantity * product.sellingPrice);
          }
          return sum;
        }, 0);
      }

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats if API fails
      return {
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
      };
    }
  },

  // Get sales summary for charts
  getSalesSummary: async (startDate, endDate) => {
    try {
      const response = await apiRequest(`/stock/reports/sales-summary?startDate=${startDate}&endDate=${endDate}&groupBy=day`);
      return response;
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      return [];
    }
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    try {
      const response = await productService.getLowStockProducts(threshold);
      return response;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
  },

  // Get recent stock movements
  getRecentMovements: async (limit = 10) => {
    try {
      const movements = await stockMovementService.getMovements();
      return movements
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent movements:', error);
      return [];
    }
  },

  // Get top selling products
  getTopSellingProducts: async (limit = 5) => {
    try {
      const movements = await stockMovementService.getMovements();
      const sales = movements.filter(m => m.movementType === 'SALE');
      
      const productSales = {};
      sales.forEach(sale => {
        const productId = sale.product?._id || sale.product;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              product: sale.product,
              totalQuantity: 0,
              totalRevenue: 0
            };
          }
          productSales[productId].totalQuantity += sale.quantity || 0;
          if (sale.product?.sellingPrice) {
            productSales[productId].totalRevenue += (sale.quantity || 0) * sale.product.sellingPrice;
          }
        }
      });

      return Object.values(productSales)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      return [];
    }
  }
};

export default dashboardService;
