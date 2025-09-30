const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/auth');

// Basic CRUD operations
router.post('/', protect, authorize('admin', 'staff'), stockController.createMovement);
router.get('/', protect, stockController.getMovements);
router.get('/:id', protect, stockController.getMovementById);
router.put('/:id', protect, authorize('admin', 'staff'), stockController.updateMovement);
router.delete('/:id', protect, authorize('admin'), stockController.deleteMovement);

// Stock balance and reports
router.get('/balance/all', protect, stockController.getStockBalance);

// Serial number tracking
router.get('/serial/:serialNumber', protect, stockController.getSerialNumberHistory);

// Client sales reports
router.get('/reports/client-sales', protect, stockController.getClientSalesReport);

// Product movement history
router.get('/product/:productId/history', protect, stockController.getProductMovementHistory);

// Sales summary and analytics
router.get('/reports/sales-summary', protect, stockController.getSalesSummary);

module.exports = router;
