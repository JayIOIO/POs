const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// Protected routes
router.post('/', checkAuth, salesController.createSale);
router.get('/today', checkAuth, salesController.getTodaysSales);
router.get('/report', checkAuth, salesController.getSalesReport);
router.get('/product-report', checkAuth, salesController.getProductSalesReport);
router.get('/best-selling', checkAuth, salesController.getBestSellingProducts);
router.get('/date-range', checkAuth, salesController.getSalesByDateRange);
router.get('/all', checkAdmin, salesController.getAllSales);
router.get('/:id', checkAuth, salesController.getSaleById);

module.exports = router;
