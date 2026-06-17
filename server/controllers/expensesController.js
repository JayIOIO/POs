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

// Get profit calculation
const getProfitCalculation = async(req, res) => {
    try {
        const { period } = req.query;

        let dateCondition = "DATE(created_at) = DATE('now')";

        if (period === 'weekly') {
            dateCondition = "DATE(created_at) >= DATE('now', '-7 days')";
        } else if (period === 'monthly') {
            dateCondition = "strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')";
        }

        const sales = await dbGet(
            `SELECT SUM(total_amount) as total_sales FROM sales WHERE ${dateCondition}`
        );

        const expenses = await dbGet(
            `SELECT SUM(amount) as total_expenses FROM expenses WHERE ${dateCondition}`
        );

        const totalSales = sales.total_sales || 0;
        const totalExpenses = expenses.total_expenses || 0;
        const profit = totalSales - totalExpenses;

        res.json({
            total_sales: totalSales,
            total_expenses: totalExpenses,
            profit: profit
        });
    } catch (error) {
        console.error('Error calculating profit:', error);
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
