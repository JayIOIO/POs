const { dbGet, dbRun, dbAll } = require('../database.js');

// Get all expenses
const getAllExpenses = async(req, res) => {
    try {
        const expenses = await dbAll('SELECT * FROM expenses ORDER BY created_at DESC');
        res.json(expenses);
    } catch (error) {
        console.error('Error getting expenses:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get expenses by date range
const getExpensesByDateRange = async(req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start and end dates required' });
        }

        const expenses = await dbAll(
            'SELECT * FROM expenses WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC', [start_date, end_date]
        );

        res.json(expenses);
    } catch (error) {
        console.error('Error getting expenses by date range:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get today's expenses
const getTodaysExpenses = async(req, res) => {
    try {
        const expenses = await dbAll(
            "SELECT * FROM expenses WHERE DATE(created_at) = DATE('now') ORDER BY created_at DESC"
        );

        const totalAmount = await dbGet(
            "SELECT SUM(amount) as total FROM expenses WHERE DATE(created_at) = DATE('now')"
        );

        res.json({
            expenses: expenses,
            total: totalAmount.total || 0
        });
    } catch (error) {
        console.error('Error getting today\'s expenses:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get expenses by category
const getExpensesByCategory = async(req, res) => {
    try {
        const { period } = req.query;

        let dateCondition = "DATE(created_at) = DATE('now')";

        if (period === 'weekly') {
            dateCondition = "DATE(created_at) >= DATE('now', '-7 days')";
        } else if (period === 'monthly') {
            dateCondition = "strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')";
        }

        const expenses = await dbAll(
            `SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE ${dateCondition} GROUP BY category ORDER BY total DESC`
        );

        res.json(expenses);
    } catch (error) {
        console.error('Error getting expenses by category:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create expense
const createExpense = async(req, res) => {
    try {
        const { category, description, amount } = req.body;

        if (!category || !amount) {
            return res.status(400).json({ error: 'Category and amount required' });
        }

        const result = await dbRun(
            'INSERT INTO expenses (category, description, amount) VALUES (?, ?, ?)', [category, description || null, amount]
        );

        res.json({
            success: true,
            expenseId: result.id
        });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update expense
const updateExpense = async(req, res) => {
    try {
        const { id } = req.params;
        const { category, description, amount } = req.body;

        if (!category || !amount) {
            return res.status(400).json({ error: 'Category and amount required' });
        }

        await dbRun(
            'UPDATE expenses SET category = ?, description = ?, amount = ? WHERE id = ?', [category, description || null, amount, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete expense
const deleteExpense = async(req, res) => {
    try {
        const { id } = req.params;

        await dbRun('DELETE FROM expenses WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get profit calculation for ANY custom date range
const getProfitCalculation = async(req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start date and end date parameters are required' });
        }

        // 1. Calculate Gross Revenue and true Wholesale Inventory Cost (COGS) for this timeframe
        const salesMetrics = await dbGet(`
            SELECT 
                SUM(si.quantity * si.price) AS total_sales,
                SUM(si.quantity * p.cost_price) AS total_cogs
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            JOIN sales s ON si.sale_id = s.id
            WHERE DATE(s.created_at) BETWEEN ? AND ?
        `, [start_date, end_date]);

        // 2. Fetch the overhead operating expenses matching the same timeframe
        const expensesMetrics = await dbGet(`
            SELECT SUM(amount) AS total_expenses 
            FROM expenses 
            WHERE DATE(created_at) BETWEEN ? AND ?
        `, [start_date, end_date]);

        const totalSales = salesMetrics.total_sales || 0;
        const totalCogs = salesMetrics.total_cogs || 0;
        const totalExpenses = expensesMetrics.total_expenses || 0;

        // 3. Formula: Sales - Cost of Goods Sold - Expenses
        const netProfit = totalSales - totalCogs - totalExpenses;

        res.json({
            success: true,
            start_date,
            end_date,
            total_sales: totalSales,
            total_cogs: totalCogs,
            total_expenses: totalExpenses,
            profit: netProfit
        });
    } catch (error) {
        console.error('Error calculating range profit details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = {
    getAllExpenses,
    getExpensesByDateRange,
    getTodaysExpenses,
    getExpensesByCategory,
    createExpense,
    updateExpense,
    deleteExpense,
    getProfitCalculation
};