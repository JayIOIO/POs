const { dbGet, dbRun, dbAll } = require('../database.js');

// Stock in (add inventory)
const stockIn = async(req, res) => {
    try {
        const { product_id, quantity, remarks } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({ error: 'Product ID and quantity required' });
        }

        // Update product stock
        await dbRun(
            'UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, product_id]
        );

        // Log inventory change
        await dbRun(
            'INSERT INTO inventory_logs (product_id, action, quantity, remarks) VALUES (?, ?, ?, ?)', [product_id, 'stock_in', quantity, remarks || 'Stock in']
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error in stock in:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Stock out (remove inventory)
const stockOut = async(req, res) => {
    try {
        const { product_id, quantity, remarks } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({ error: 'Product ID and quantity required' });
        }

        const product = await dbGet('SELECT stock FROM products WHERE id = ?', [product_id]);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // Update product stock
        await dbRun(
            'UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product_id]
        );

        // Log inventory change
        await dbRun(
            'INSERT INTO inventory_logs (product_id, action, quantity, remarks) VALUES (?, ?, ?, ?)', [product_id, 'stock_out', quantity, remarks || 'Stock out']
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error in stock out:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Inventory adjustment
const adjustInventory = async(req, res) => {
    try {
        const { product_id, quantity, remarks } = req.body;

        if (!product_id || quantity === undefined) {
            return res.status(400).json({ error: 'Product ID and quantity required' });
        }

        // Update product stock
        await dbRun(
            'UPDATE products SET stock = ? WHERE id = ?', [quantity, product_id]
        );

        // Log inventory change
        await dbRun(
            'INSERT INTO inventory_logs (product_id, action, quantity, remarks) VALUES (?, ?, ?, ?)', [product_id, 'adjustment', quantity, remarks || 'Inventory adjustment']
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error adjusting inventory:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get inventory logs
const getInventoryLogs = async(req, res) => {
    try {
        const { product_id } = req.query;

        let query = 'SELECT il.*, p.name FROM inventory_logs il JOIN products p ON il.product_id = p.id';
        let params = [];

        if (product_id) {
            query += ' WHERE il.product_id = ?';
            params.push(product_id);
        }

        query += ' ORDER BY il.created_at DESC';

        const logs = await dbAll(query, params);
        res.json(logs);
    } catch (error) {
        console.error('Error getting inventory logs:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get low stock products
const getLowStockProducts = async(req, res) => {
    try {
        const products = await dbAll(
            'SELECT * FROM products WHERE stock <= reorder_level ORDER BY stock ASC'
        );

        res.json(products);
    } catch (error) {
        console.error('Error getting low stock products:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get inventory summary
const getInventorySummary = async(req, res) => {
    try {
        const summary = await dbGet(
            'SELECT COUNT(*) as total_products, SUM(stock) as total_stock, SUM(stock * cost_price) as total_value FROM products'
        );

        const lowStock = await dbGet(
            'SELECT COUNT(*) as low_stock_count FROM products WHERE stock <= reorder_level'
        );

        res.json({
            ...summary,
            ...lowStock
        });
    } catch (error) {
        console.error('Error getting inventory summary:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    stockIn,
    stockOut,
    adjustInventory,
    getInventoryLogs,
    getLowStockProducts,
    getInventorySummary
};
