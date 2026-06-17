const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// Protected routes
router.get('/logs', checkAuth, inventoryController.getInventoryLogs);
router.get('/low-stock', checkAuth, inventoryController.getLowStockProducts);
router.get('/summary', checkAuth, inventoryController.getInventorySummary);

// Admin routes
router.post('/stock-in', checkAdmin, inventoryController.stockIn);
router.post('/stock-out', checkAdmin, inventoryController.stockOut);
router.post('/adjust', checkAdmin, inventoryController.adjustInventory);

module.exports = router;
