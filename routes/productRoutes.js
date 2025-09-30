const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require("../middleware/auth");

// Basic CRUD operations
router.post("/", protect, authorize("admin", "staff"), productController.createProduct);
router.get("/", protect, productController.getProducts);
router.get("/:id", protect, productController.getProductById);
router.put("/:id", protect, authorize("admin", "staff"), productController.updateProduct);
router.delete("/:id", protect, authorize("admin"), productController.deleteProduct);

// Stock management
router.put("/:id/stock", protect, authorize("admin", "staff"), productController.updateStock);

// Serial number management
router.post("/:id/serial", protect, authorize("admin", "staff"), productController.addSerialNumber);
router.delete("/:id/serial", protect, authorize("admin", "staff"), productController.removeSerialNumber);

// Category and inventory queries
router.get("/category/:categoryId", protect, productController.getProductsByCategory);
router.get("/inventory/low-stock", protect, productController.getLowStockProducts);

module.exports = router;
