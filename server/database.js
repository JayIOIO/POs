const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database schema
function initializeDatabase() {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // db.exec runs the entire file from top to bottom in a safe sequence
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing database schema:', err);
        } else {
            console.log('Database schema initialized cleanly!');
            // Insert default admin user if not exists
            insertDefaultAdmin();
        }
    });
}

// Insert default admin user
function insertDefaultAdmin() {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);

    db.run(
        'INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin'],
        (err) => {
            if (err) {
                console.error('Error inserting default admin:', err);
            } else {
                console.log('Default admin user ready (username: admin, password: admin123)');
            }
        }
    );
}

// Promisify database operations
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    db,
    dbRun,
    dbGet,
    dbAll
};