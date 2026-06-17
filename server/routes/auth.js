const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/current-user', checkAuth, authController.getCurrentUser);

// Admin management routes
router.get('/users', checkAdmin, authController.getAllUsers);
router.post('/users', checkAdmin, authController.createUser);
router.put('/users/:id', checkAdmin, authController.updateUser);
router.delete('/users/:id', checkAdmin, authController.deleteUser);

module.exports = router; // <-- Express now gets a real Router function!