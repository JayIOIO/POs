const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', checkAuth, customerController.getAllCustomers);
router.get('/search', checkAuth, customerController.searchCustomers);
router.get('/:id', checkAuth, customerController.getCustomerById);

// Admin routes
router.post('/', checkAdmin, customerController.createCustomer);
router.put('/:id', checkAdmin, customerController.updateCustomer);
router.delete('/:id', checkAdmin, customerController.deleteCustomer);

module.exports = router;
