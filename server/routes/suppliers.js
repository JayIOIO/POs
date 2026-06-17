const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', checkAuth, supplierController.getAllSuppliers);
router.get('/search', checkAuth, supplierController.searchSuppliers);
router.get('/:id', checkAuth, supplierController.getSupplierById);

// Admin routes
router.post('/', checkAdmin, supplierController.createSupplier);
router.put('/:id', checkAdmin, supplierController.updateSupplier);
router.delete('/:id', checkAdmin, supplierController.deleteSupplier);

module.exports = router;
