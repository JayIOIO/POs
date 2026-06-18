const { dbGet, dbRun, dbAll } = require('../database.js');

// Get all products
const getAllProducts = async(req, res) => {
    try {
        const products = await dbAll('SELECT * FROM products ORDER BY name');
        res.json(products);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get product by ID
const getProductById = async(req, res) => {
    try {
        const { id } = req.params;
        const product = await dbGet('SELECT * FROM products WHERE id = ?', [id]);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Search products
const searchProducts = async(req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const products = await dbAll(
            'SELECT * FROM products WHERE name LIKE ? OR barcode LIKE ? OR category LIKE ? ORDER BY name', [`%${query}%`, `%${query}%`, `%${query}%`]
        );

        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get products by category
const getProductsByCategory = async(req, res) => {
    try {
        const { category } = req.params;
        const products = await dbAll('SELECT * FROM products WHERE category = ? ORDER BY name', [category]);
        res.json(products);
    } catch (error) {
        console.error('Error getting products by category:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get product by barcode
const getProductByBarcode = async(req, res) => {
    try {
        const { barcode } = req.params;
        const product = await dbGet('SELECT * FROM products WHERE barcode = ?', [barcode]);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error getting product by barcode:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create product
const createProduct = async(req, res) => {
    try {
        // 💡 EXCLUDE 'stock' from req.body so nobody can inject an initial stock value here
        const {
            barcode,
            name,
            category,
            cost_price,
            selling_price,
            reorder_level,
            image,
            has_bundle_promo,
            bundle_qty,
            bundle_price
        } = req.body;

        if (!name || !category || cost_price === undefined || selling_price === undefined) {
            return res.status(400).json({ error: 'Name, category, cost price, and selling price are required' });
        }

        // 💡 FORCE stock to be 0 explicitly in the database insertion array
        const query = `
            INSERT INTO products (barcode, name, category, cost_price, selling_price, stock, reorder_level, image, has_bundle_promo, bundle_qty, bundle_price) 
            VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
        `;

        const result = await dbRun(query, [
            barcode || null, name, category, cost_price, selling_price,
            reorder_level !== undefined ? reorder_level : 10,
            image || null,
            has_bundle_promo || 0, bundle_qty || 0, bundle_price || 0
        ]);

        res.json({
            success: true,
            productId: result.id
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update product
const updateProduct = async(req, res) => {
    try {
        const { id } = req.params;
        const { barcode, name, category, cost_price, selling_price, stock, reorder_level, image, has_bundle_promo, bundle_qty, bundle_price } = req.body;

        if (!name || !category || !cost_price || !selling_price) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        await dbRun(
            'UPDATE products SET barcode=?, name=?, category=?, cost_price=?, selling_price=?, stock=?, reorder_level=?, image=?, has_bundle_promo=?, bundle_qty=?, bundle_price=? WHERE id=?', [barcode || null, name, category, cost_price, selling_price, stock || 0, reorder_level || 10, image || null,
                has_bundle_promo || 0, bundle_qty || 0, bundle_price || 0, id
            ]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete product
const deleteProduct = async(req, res) => {
    try {
        const { id } = req.params;

        await dbRun('DELETE FROM products WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get low stock products
const getLowStockProducts = async(req, res) => {
    try {
        const products = await dbAll('SELECT * FROM products WHERE stock <= reorder_level ORDER BY stock ASC');
        res.json(products);
    } catch (error) {
        console.error('Error getting low stock products:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all categories
const getCategories = async(req, res) => {
    try {
        const categories = await dbAll('SELECT DISTINCT category FROM products ORDER BY category');
        res.json(categories.map(c => c.category));
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    searchProducts,
    getProductsByCategory,
    getProductByBarcode,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getCategories
};