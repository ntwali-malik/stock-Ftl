const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Basic CRUD operations
router.post('/', stockController.createMovement);
router.get('/', stockController.getMovements);
router.get('/:id', stockController.getMovementById);
router.put('/:id', stockController.updateMovement);
router.delete('/:id', stockController.deleteMovement);

// Stock balance and reports
router.get('/balance/all', stockController.getStockBalance);

// Serial number tracking
router.get('/serial/:serialNumber', stockController.getSerialNumberHistory);

// Client sales reports
router.get('/reports/client-sales', stockController.getClientSalesReport);

// Product movement history
router.get('/product/:productId/history', stockController.getProductMovementHistory);

// Sales summary and analytics
router.get('/reports/sales-summary', stockController.getSalesSummary);

module.exports = router;
