const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { checkAuth } = require('../middleware/auth');

// Protected routes
router.get('/data', checkAuth, dashboardController.getDashboardData);
router.get('/sales-trend', checkAuth, dashboardController.getSalesTrend);
router.get('/inventory-value', checkAuth, dashboardController.getInventoryValue);
router.get('/payment-methods', checkAuth, dashboardController.getPaymentMethodSummary);

module.exports = router;
