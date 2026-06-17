const bcrypt = require('bcryptjs');
const { dbGet } = require('../database');

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

// Hash password
const hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

// Compare password
const comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

module.exports = {
    checkAuth,
    checkAdmin,
    hashPassword,
    comparePassword
};
