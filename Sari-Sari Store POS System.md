# Sari-Sari Store POS System

A complete Point of Sale (POS) web application for Filipino sari-sari stores built with Vanilla HTML, CSS, JavaScript, Node.js, Express, and SQLite.

## Features

### Core Functionality
- **Dashboard**: Real-time sales metrics, inventory status, and business analytics
- **POS/Cashier Module**: Fast product search, barcode scanning, cart management, and receipt printing
- **Product Management**: Add, edit, delete products with barcode support and categorization
- **Inventory Management**: Stock in/out operations, inventory adjustments, and low-stock alerts
- **Sales Reporting**: Daily, weekly, and monthly sales reports with product and category breakdowns
- **Customer Management**: Maintain customer database with contact information and purchase history
- **Supplier Management**: Track suppliers with contact details and address information
- **Expense Tracking**: Monitor daily and monthly expenses with profit calculations
- **User Management**: Admin controls for user creation and role-based access

### Technical Features
- **Offline Capability**: Works completely offline on local computers
- **Local Database**: SQLite database for data persistence
- **Authentication**: Secure login with role-based access control (Admin/Cashier)
- **Responsive Design**: Mobile-first design supporting all screen sizes
- **Receipt Printing**: Thermal receipt printer compatible format (58mm)
- **Backup System**: Export and import database backups
- **Payment Methods**: Support for Cash, GCash, and Maya payments

## Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript (No frameworks)

### Backend
- Node.js
- Express.js

### Database
- SQLite3

### Deployment
- Localhost (Windows PC)
- No internet required

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Navigate to project directory**
   ```bash
   cd sari-sari-pos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - Default login credentials:
     - Username: `admin`
     - Password: `admin123`

## Project Structure

```
sari-sari-pos/
├── client/                 # Frontend files
│   ├── index.html         # Main dashboard page
│   ├── login.html         # Login page
│   ├── css/
│   │   └── style.css      # Global styles
│   └── js/
│       └── app.js         # Main application logic
├── server/                # Backend files
│   ├── server.js          # Express server configuration
│   ├── database.js        # Database connection and initialization
│   ├── controllers/       # Business logic controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── salesController.js
│   │   ├── inventoryController.js
│   │   ├── customerController.js
│   │   ├── supplierController.js
│   │   ├── expensesController.js
│   │   └── dashboardController.js
│   ├── routes/           # API route definitions
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── sales.js
│   │   ├── inventory.js
│   │   ├── customers.js
│   │   ├── suppliers.js
│   │   ├── expenses.js
│   │   └── dashboard.js
│   └── middleware/       # Authentication middleware
│       └── auth.js
├── database/             # Database files
│   ├── database.sqlite   # SQLite database (auto-created)
│   └── schema.sql        # Database schema
├── uploads/              # Product images and uploads
│   └── product-images/
├── package.json          # Node.js dependencies
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/current-user` - Get current user info
- `GET /api/auth/users` - Get all users (Admin)
- `POST /api/auth/users` - Create user (Admin)
- `PUT /api/auth/users/:id` - Update user (Admin)
- `DELETE /api/auth/users/:id` - Delete user (Admin)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/search?query=` - Search products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/low-stock` - Get low stock items
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales/:id` - Get sale details
- `GET /api/sales/today` - Get today's sales
- `GET /api/sales/report?period=` - Get sales report
- `GET /api/sales/best-selling?limit=` - Get best selling products

### Inventory
- `POST /api/inventory/stock-in` - Add stock (Admin)
- `POST /api/inventory/stock-out` - Remove stock (Admin)
- `POST /api/inventory/adjust` - Adjust inventory (Admin)
- `GET /api/inventory/logs` - Get inventory logs
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/summary` - Get inventory summary

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/search?query=` - Search customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer (Admin)
- `PUT /api/customers/:id` - Update customer (Admin)
- `DELETE /api/customers/:id` - Delete customer (Admin)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/search?query=` - Search suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create supplier (Admin)
- `PUT /api/suppliers/:id` - Update supplier (Admin)
- `DELETE /api/suppliers/:id` - Delete supplier (Admin)

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/today` - Get today's expenses
- `GET /api/expenses/date-range?start_date=&end_date=` - Get expenses by date range
- `GET /api/expenses/category?period=` - Get expenses by category
- `GET /api/expenses/profit?period=` - Get profit calculation
- `POST /api/expenses` - Create expense (Admin)
- `PUT /api/expenses/:id` - Update expense (Admin)
- `DELETE /api/expenses/:id` - Delete expense (Admin)

### Dashboard
- `GET /api/dashboard/data` - Get dashboard data
- `GET /api/dashboard/sales-trend?period=` - Get sales trend
- `GET /api/dashboard/inventory-value` - Get inventory value
- `GET /api/dashboard/payment-methods?period=` - Get payment method summary

## Database Schema

### Users Table
- id, username, password_hash, role, created_at

### Products Table
- id, barcode, name, category, cost_price, selling_price, stock, reorder_level, image, created_at

### Sales Table
- id, total_amount, payment_method, cashier_id, discount, created_at

### Sale Items Table
- id, sale_id, product_id, quantity, price

### Customers Table
- id, name, phone, address, created_at

### Suppliers Table
- id, name, contact_person, phone, address, created_at

### Inventory Logs Table
- id, product_id, action, quantity, remarks, created_at

### Expenses Table
- id, category, description, amount, created_at

## Usage Guide

### First Time Setup
1. Login with admin credentials (admin/admin123)
2. Create additional users for cashiers
3. Add product categories and products
4. Configure suppliers and customers

### Daily Operations
1. **POS/Cashier**: Use the cashier module for sales transactions
2. **Inventory**: Track stock movements and adjust inventory as needed
3. **Reports**: Monitor sales and expenses through reports
4. **Dashboard**: Check real-time business metrics

### Admin Functions
1. **User Management**: Create and manage user accounts
2. **Product Management**: Maintain product database
3. **Supplier Management**: Manage supplier information
4. **Backup**: Regularly backup the database

## Color Scheme

- **Primary Green**: #22C55E
- **Secondary White**: #FFFFFF
- **Accent Orange**: #F97316
- **Dark Gray**: #1F2937
- **Light Gray**: #F3F4F6

## Troubleshooting

### Application won't start
- Ensure Node.js is installed: `node --version`
- Check if port 3000 is available
- Delete `database/database.sqlite` to reset the database

### Database errors
- Check database file permissions
- Ensure SQLite3 is properly installed
- Verify database schema in `database/schema.sql`

### Login issues
- Clear browser cookies and cache
- Check if admin user exists in database
- Verify session configuration in server.js

## Features to Implement

The following features are ready for implementation:
- Product image upload and display
- Advanced reporting with PDF export
- Barcode generation and scanning
- Multi-language support
- Cloud backup integration
- Receipt printer integration
- Loyalty program management

## Support & Maintenance

For issues or feature requests, please refer to the project documentation or contact the development team.

## License

This project is proprietary software for Sari-Sari Store POS System.

## Version

Version 1.0.0 - Initial Release

---

**Happy selling! 🏪**
