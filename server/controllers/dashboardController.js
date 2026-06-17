const { dbGet, dbAll } = require('../database.js');

// Get dashboard data
const getDashboardData = async(req, res) => {
    try {
        // Today's sales
        const todaysSales = await dbGet(
            "SELECT SUM(total_amount) as total FROM sales WHERE DATE(created_at) = DATE('now')"
        );

        // Weekly sales
        const weeklySales = await dbGet(
            "SELECT SUM(total_amount) as total FROM sales WHERE DATE(created_at) >= DATE('now', '-7 days')"
        );

        // Monthly sales
        const monthlySales = await dbGet(
            "SELECT SUM(total_amount) as total FROM sales WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"
        );

        // Total products
        const totalProducts = await dbGet('SELECT COUNT(*) as count FROM products');

        // Low stock items
        const lowStockItems = await dbAll(
            'SELECT id, name, stock, reorder_level FROM products WHERE stock <= reorder_level ORDER BY stock ASC LIMIT 10'
        );

        // Recent transactions
        const recentTransactions = await dbAll(
            'SELECT s.id, s.total_amount, s.payment_method, s.created_at, u.username FROM sales s JOIN users u ON s.cashier_id = u.id ORDER BY s.created_at DESC LIMIT 10'
        );

        // Best selling products
        const bestSellingProducts = await dbAll(
            `SELECT p.id, p.name, p.category, SUM(si.quantity) as total_quantity, SUM(si.quantity * si.price) as total_sales
             FROM sale_items si
             JOIN products p ON si.product_id = p.id
             GROUP BY p.id
             ORDER BY total_quantity DESC
             LIMIT 10`
        );

        res.json({
            todays_sales: todaysSales.total || 0,
            weekly_sales: weeklySales.total || 0,
            monthly_sales: monthlySales.total || 0,
            total_products: totalProducts.count || 0,
            low_stock_items: lowStockItems,
            recent_transactions: recentTransactions,
            best_selling_products: bestSellingProducts
        });
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get sales trend
const getSalesTrend = async(req, res) => {
    try {
        const { period } = req.query;

        let groupBy = "DATE(created_at)";
        let dateCondition = "DATE(created_at) >= DATE('now', '-30 days')";

        if (period === 'weekly') {
            groupBy = "strftime('%Y-W%W', created_at)";
            dateCondition = "DATE(created_at) >= DATE('now', '-90 days')";
        } else if (period === 'monthly') {
            groupBy = "strftime('%Y-%m', created_at)";
            dateCondition = "DATE(created_at) >= DATE('now', '-12 months')";
        }

        const trend = await dbAll(
            `SELECT ${groupBy} as period, SUM(total_amount) as total_sales, COUNT(*) as transaction_count
             FROM sales
             WHERE ${dateCondition}
             GROUP BY ${groupBy}
             ORDER BY period ASC`
        );

        res.json(trend);
    } catch (error) {
        console.error('Error getting sales trend:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get inventory value
const getInventoryValue = async(req, res) => {
    try {
        const value = await dbGet(
            'SELECT SUM(stock * cost_price) as total_cost_value, SUM(stock * selling_price) as total_selling_value FROM products'
        );

        res.json({
            total_cost_value: value.total_cost_value || 0,
            total_selling_value: value.total_selling_value || 0
        });
    } catch (error) {
        console.error('Error getting inventory value:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get payment method summary
const getPaymentMethodSummary = async(req, res) => {
    try {
        const { period } = req.query;

        let dateCondition = "DATE(created_at) = DATE('now')";

        if (period === 'weekly') {
            dateCondition = "DATE(created_at) >= DATE('now', '-7 days')";
        } else if (period === 'monthly') {
            dateCondition = "strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')";
        }

        const summary = await dbAll(
            `SELECT payment_method, SUM(total_amount) as total, COUNT(*) as count
             FROM sales
             WHERE ${dateCondition}
             GROUP BY payment_method
             ORDER BY total DESC`
        );

        res.json(summary);
    } catch (error) {
        console.error('Error getting payment method summary:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getDashboardData,
    getSalesTrend,
    getInventoryValue,
    getPaymentMethodSummary
};
