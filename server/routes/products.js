const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// Public routes (require auth)
router.get('/', checkAuth, productController.getAllProducts);
router.get('/search', checkAuth, productController.searchProducts);
router.get('/categories', checkAuth, productController.getCategories);
router.get('/low-stock', checkAuth, productController.getLowStockProducts);
router.get('/category/:category', checkAuth, productController.getProductsByCategory);
router.get('/barcode/:barcode', checkAuth, productController.getProductByBarcode);
router.get('/:id', checkAuth, productController.getProductById);

// Admin routes
router.post('/', checkAdmin, productController.createProduct);
router.put('/:id', checkAdmin, productController.updateProduct);
router.delete('/:id', checkAdmin, productController.deleteProduct);

module.exports = router;
