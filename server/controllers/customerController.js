const { dbGet, dbRun, dbAll } = require('../database.js');

// Get all customers
const getAllCustomers = async(req, res) => {
    try {
        const customers = await dbAll('SELECT * FROM customers ORDER BY name');
        res.json(customers);
    } catch (error) {
        console.error('Error getting customers:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get customer by ID
const getCustomerById = async(req, res) => {
    try {
        const { id } = req.params;
        const customer = await dbGet('SELECT * FROM customers WHERE id = ?', [id]);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Error getting customer:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Search customers
const searchCustomers = async(req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const customers = await dbAll(
            'SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name', [`%${query}%`, `%${query}%`]
        );

        res.json(customers);
    } catch (error) {
        console.error('Error searching customers:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create customer
const createCustomer = async(req, res) => {
    try {
        const { name, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Customer name required' });
        }

        const result = await dbRun(
            'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)', [name, phone || null, address || null]
        );

        res.json({
            success: true,
            customerId: result.id
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update customer
const updateCustomer = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Customer name required' });
        }

        await dbRun(
            'UPDATE customers SET name = ?, phone = ?, address = ? WHERE id = ?', [name, phone || null, address || null, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete customer
const deleteCustomer = async(req, res) => {
    try {
        const { id } = req.params;

        await dbRun('DELETE FROM customers WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    searchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
