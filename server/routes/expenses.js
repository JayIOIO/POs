const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', checkAuth, expensesController.getAllExpenses);
router.get('/today', checkAuth, expensesController.getTodaysExpenses);
router.get('/date-range', checkAuth, expensesController.getExpensesByDateRange);
router.get('/category', checkAuth, expensesController.getExpensesByCategory);
router.get('/profit', checkAuth, expensesController.getProfitCalculation);

// Admin routes
router.post('/', checkAdmin, expensesController.createExpense);
router.put('/:id', checkAdmin, expensesController.updateExpense);
router.delete('/:id', checkAdmin, expensesController.deleteExpense);

module.exports = router;
