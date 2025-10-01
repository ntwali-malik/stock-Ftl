const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Basic CRUD operations
router.post("/", productController.createProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

// Stock management
router.put("/:id/stock", productController.updateStock);

// Serial number management
router.post("/:id/serial", productController.addSerialNumber);
router.delete("/:id/serial", productController.removeSerialNumber);

// Category and inventory queries
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/inventory/low-stock", productController.getLowStockProducts);

module.exports = router;
