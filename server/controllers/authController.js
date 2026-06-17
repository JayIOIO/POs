const { dbGet, dbRun, dbAll } = require('../database');
const { comparePassword, hashPassword } = require('../middleware/auth');

// Login user
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);

        if (!user || !comparePassword(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Logout user
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true });
    });
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await dbGet('SELECT id, username, role FROM users WHERE id = ?', [req.session.userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await dbAll('SELECT id, username, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create new user (admin only)
const createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role required' });
        }

        const hashedPassword = hashPassword(password);

        const result = await dbRun(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        res.json({
            success: true,
            userId: result.id
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user (admin only)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role, password } = req.body;

        if (!username || !role) {
            return res.status(400).json({ error: 'Username and role required' });
        }

        let query = 'UPDATE users SET username = ?, role = ?';
        let params = [username, role];

        if (password) {
            query += ', password_hash = ?';
            params.push(hashPassword(password));
        }

        query += ' WHERE id = ?';
        params.push(id);

        await dbRun(query, params);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting the last admin
        const adminCount = await dbGet('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
        const userToDelete = await dbGet('SELECT role FROM users WHERE id = ?', [id]);

        if (userToDelete.role === 'admin' && adminCount.count <= 1) {
            return res.status(400).json({ error: 'Cannot delete the last admin user' });
        }

        await dbRun('DELETE FROM users WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    login,
    logout,
    getCurrentUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};
