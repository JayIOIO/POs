const { dbGet, dbRun, dbAll } = require('../database.js');

// Create sale
const createSale = async(req, res) => {
    try {
        const { items, total_amount, payment_method, discount } = req.body;
        const cashier_id = req.session.userId;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in sale' });
        }

        // Insert sale
        const saleResult = await dbRun(
            'INSERT INTO sales (total_amount, payment_method, cashier_id, discount) VALUES (?, ?, ?, ?)', [total_amount, payment_method, cashier_id, discount || 0]
        );

        const saleId = saleResult.id;

        // Insert sale items and update stock
        for (const item of items) {
            await dbRun(
                'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [saleId, item.product_id, item.quantity, item.price]
            );

            // Update product stock
            await dbRun(
                'UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]
            );

            // Log inventory change
            await dbRun(
                'INSERT INTO inventory_logs (product_id, action, quantity, remarks) VALUES (?, ?, ?, ?)', [item.product_id, 'sale', item.quantity, `Sale #${saleId}`]
            );
        }

        res.json({
            success: true,
            saleId: saleId
        });
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get sale by ID
const getSaleById = async(req, res) => {
    try {
        const { id } = req.params;

        const sale = await dbGet('SELECT * FROM sales WHERE id = ?', [id]);

        if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        const items = await dbAll(
            'SELECT si.*, p.name, p.barcode FROM sale_items si JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?', [id]
        );

        const cashier = await dbGet('SELECT username FROM users WHERE id = ?', [sale.cashier_id]);

        res.json({
            ...sale,
            items: items,
            cashier_name: cashier.username
        });
    } catch (error) {
        console.error('Error getting sale:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all sales
const getAllSales = async(req, res) => {
    try {
        const sales = await dbAll('SELECT * FROM sales ORDER BY created_at DESC');
        res.json(sales);
    } catch (error) {
        console.error('Error getting sales:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get sales by date range
const getSalesByDateRange = async(req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start and end dates required' });
        }

        const sales = await dbAll(
            'SELECT * FROM sales WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC', [start_date, end_date]
        );

        res.json(sales);
    } catch (error) {
        console.error('Error getting sales by date range:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get today's sales
const getTodaysSales = async(req, res) => {
    try {
        const sales = await dbAll(
            "SELECT * FROM sales WHERE DATE(created_at) = DATE('now') ORDER BY created_at DESC"
        );

        const totalAmount = await dbGet(
            "SELECT SUM(total_amount) as total FROM sales WHERE DATE(created_at) = DATE('now')"
        );

        res.json({
            sales: sales,
            total: totalAmount.total || 0
        });
    } catch (error) {
        console.error('Error getting today\'s sales:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get sales report
const getSalesReport = async(req, res) => {
    try {
        const { period } = req.query;

        let dateCondition = "DATE(created_at) = DATE('now')";

        if (period === 'weekly') {
            dateCondition = "DATE(created_at) >= DATE('now', '-7 days')";
        } else if (period === 'monthly') {
            dateCondition = "strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')";
        }

        const sales = await dbAll(
            `SELECT * FROM sales WHERE ${dateCondition} ORDER BY created_at DESC`
        );

        const totalAmount = await dbGet(
            `SELECT SUM(total_amount) as total, COUNT(*) as count FROM sales WHERE ${dateCondition}`
        );

        res.json({
            sales: sales,
            total: totalAmount.total || 0,
            count: totalAmount.count || 0
        });
    } catch (error) {
        console.error('Error getting sales report:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get product sales report
const getProductSalesReport = async(req, res) => {
    try {
        const { period } = req.query;

        let dateCondition = "DATE(s.created_at) = DATE('now')";

        if (period === 'weekly') {
            dateCondition = "DATE(s.created_at) >= DATE('now', '-7 days')";
        } else if (period === 'monthly') {
            dateCondition = "strftime('%Y-%m', s.created_at) = strftime('%Y-%m', 'now')";
        }

        const report = await dbAll(
            `SELECT p.id, p.name, p.category, SUM(si.quantity) as total_quantity, SUM(si.quantity * si.price) as total_sales
             FROM sale_items si
             JOIN products p ON si.product_id = p.id
             JOIN sales s ON si.sale_id = s.id
             WHERE ${dateCondition}
             GROUP BY p.id
             ORDER BY total_sales DESC`
        );

        res.json(report);
    } catch (error) {
        console.error('Error getting product sales report:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get best selling products
const getBestSellingProducts = async(req, res) => {
    try {
        const { limit } = req.query;
        const limitValue = limit || 10;

        const products = await dbAll(
            `SELECT p.id, p.name, p.category, SUM(si.quantity) as total_quantity, SUM(si.quantity * si.price) as total_sales
             FROM sale_items si
             JOIN products p ON si.product_id = p.id
             GROUP BY p.id
             ORDER BY total_quantity DESC
             LIMIT ?`, [limitValue]
        );

        res.json(products);
    } catch (error) {
        console.error('Error getting best selling products:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createSale,
    getSaleById,
    getAllSales,
    getSalesByDateRange,
    getTodaysSales,
    getSalesReport,
    getProductSalesReport,
    getBestSellingProducts
};
