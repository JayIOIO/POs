const { dbGet, dbRun, dbAll } = require('../database.js');

// Get all suppliers
const getAllSuppliers = async(req, res) => {
    try {
        const suppliers = await dbAll('SELECT * FROM suppliers ORDER BY name');
        res.json(suppliers);
    } catch (error) {
        console.error('Error getting suppliers:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get supplier by ID
const getSupplierById = async(req, res) => {
    try {
        const { id } = req.params;
        const supplier = await dbGet('SELECT * FROM suppliers WHERE id = ?', [id]);

        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        res.json(supplier);
    } catch (error) {
        console.error('Error getting supplier:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Search suppliers
const searchSuppliers = async(req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const suppliers = await dbAll(
            'SELECT * FROM suppliers WHERE name LIKE ? OR contact_person LIKE ? OR phone LIKE ? ORDER BY name', [`%${query}%`, `%${query}%`, `%${query}%`]
        );

        res.json(suppliers);
    } catch (error) {
        console.error('Error searching suppliers:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create supplier
const createSupplier = async(req, res) => {
    try {
        const { name, contact_person, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Supplier name required' });
        }

        const result = await dbRun(
            'INSERT INTO suppliers (name, contact_person, phone, address) VALUES (?, ?, ?, ?)', [name, contact_person || null, phone || null, address || null]
        );

        res.json({
            success: true,
            supplierId: result.id
        });
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update supplier
const updateSupplier = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, contact_person, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Supplier name required' });
        }

        await dbRun(
            'UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, address = ? WHERE id = ?', [name, contact_person || null, phone || null, address || null, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete supplier
const deleteSupplier = async(req, res) => {
    try {
        const { id } = req.params;

        await dbRun('DELETE FROM suppliers WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    searchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
