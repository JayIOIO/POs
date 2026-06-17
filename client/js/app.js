// Global API configuration
const API_BASE = '/api';

// Global state
let currentUser = null;
let currentPage = 'dashboard';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    setupEventListeners();
});

// Check if user is authenticated
async function checkAuthentication() {
    try {
        const response = await fetch(`${API_BASE}/auth/current-user`);

        if (response.ok) {
            currentUser = await response.json();
            loadPage(currentPage);
        } else {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login.html';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) {
                loadPage(page);
                updateActiveNav(link);
            }
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Load page content
function loadPage(page) {
    currentPage = page;
    const content = document.getElementById('content');

    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'pos':
            loadPOS();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'sales':
            loadSales();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'expenses':
            loadExpenses();
            break;
        case 'users':
            loadUsers();
            break;
        default:
            loadDashboard();
    }
}

// Update active navigation
function updateActiveNav(link) {
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
}

// Logout
async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Load Dashboard
async function loadDashboard() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/dashboard/data`);
        const data = await response.json();

        const html = `
            <div class="card-header">
                <h1 class="card-title">Dashboard</h1>
            </div>

            <div class="grid grid-4">
                <div class="stat-card">
                    <div class="stat-label">Today's Sales</div>
                    <div class="stat-value">₱${data.todays_sales.toFixed(2)}</div>
                </div>
                <div class="stat-card accent">
                    <div class="stat-label">Weekly Sales</div>
                    <div class="stat-value">₱${data.weekly_sales.toFixed(2)}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Monthly Sales</div>
                    <div class="stat-value">₱${data.monthly_sales.toFixed(2)}</div>
                </div>
                <div class="stat-card danger">
                    <div class="stat-label">Total Products</div>
                    <div class="stat-value">${data.total_products}</div>
                </div>
            </div>

            <div class="grid grid-2">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Low Stock Items</h2>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Stock</th>
                                <th>Reorder Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.low_stock_items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td><span class="badge badge-danger">${item.stock}</span></td>
                                    <td>${item.reorder_level}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Best Selling Products</h2>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.best_selling_products.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.total_quantity}</td>
                                    <td>₱${item.total_sales.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Recent Transactions</h2>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Cashier</th>
                            <th>Date & Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.recent_transactions.map(transaction => `
                            <tr>
                                <td>#${transaction.id}</td>
                                <td>₱${transaction.total_amount.toFixed(2)}</td>
                                <td>${transaction.payment_method}</td>
                                <td>${transaction.username}</td>
                                <td>${new Date(transaction.created_at).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        content.innerHTML = html;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        content.innerHTML = '<div class="alert alert-danger">Error loading dashboard</div>';
    }
}

// Load Products
async function loadProducts() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();

        const html = `
            <div class="card-header">
                <h1 class="card-title">Products</h1>
                <button class="btn btn-primary" onclick="openProductModal()">+ Add Product</button>
            </div>

            <div class="card">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Barcode</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Cost Price</th>
                            <th>Selling Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.id}</td>
                                <td>${product.barcode || '-'}</td>
                                <td>${product.name}</td>
                                <td>${product.category}</td>
                                <td>₱${product.cost_price.toFixed(2)}</td>
                                <td>₱${product.selling_price.toFixed(2)}</td>
                                <td>
                                    <span class="badge ${product.stock <= product.reorder_level ? 'badge-danger' : 'badge-primary'}">
                                        ${product.stock}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-info btn-small" onclick="editProduct(${product.id})">Edit</button>
                                        <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        content.innerHTML = html;
    } catch (error) {
        console.error('Error loading products:', error);
        content.innerHTML = '<div class="alert alert-danger">Error loading products</div>';
    }
}

// Load POS
async function loadPOS() {
    const content = document.getElementById('content');
    
    const html = `
        <div class="grid grid-2">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Product Search</h2>
                </div>
                <div class="form-group">
                    <input type="text" id="posSearch" placeholder="Search by name or barcode..." class="form-control">
                </div>
                <div id="productList"></div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Shopping Cart</h2>
                </div>
                <table class="table" id="cartTable">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="cartItems"></tbody>
                </table>
                <div class="card mt-20">
                    <div class="form-group">
                        <label>Discount (%)</label>
                        <input type="number" id="discountPercent" min="0" max="100" value="0" class="form-control">
                    </div>
                    <div class="flex-between mb-20">
                        <span>Subtotal:</span>
                        <span id="subtotal">₱0.00</span>
                    </div>
                    <div class="flex-between mb-20">
                        <span>Discount:</span>
                        <span id="discountAmount">₱0.00</span>
                    </div>
                    <div class="flex-between mb-20" style="font-size: 18px; font-weight: bold;">
                        <span>Total:</span>
                        <span id="total">₱0.00</span>
                    </div>
                    <div class="form-group">
                        <label>Payment Method</label>
                        <select id="paymentMethod" class="form-control">
                            <option value="Cash">Cash</option>
                            <option value="GCash">GCash</option>
                            <option value="Maya">Maya</option>
                        </select>
                    </div>

                    <div style="background: #F3F4F6; padding: 12px; border-radius: 6px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-weight: 600; display: flex; align-items: center; gap: 6px;">
                            🖨️ Auto-Print Receipt
                        </span>
                        <label style="position: relative; display: inline-block; width: 44px; height: 22px; cursor: pointer;">
                            <input type="checkbox" id="receiptPrintToggle" checked style="opacity: 0; width: 0; height: 0;">
                            <span class="toggle-slider" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #22C55E; border-radius: 22px; transition: .3s;"></span>
                        </label>
                    </div>

                    <style>
                        /* Generates the circular toggle button inside your switch layout */
                        .toggle-slider:before {
                            position: absolute;
                            content: "";
                            height: 16px;
                            width: 16px;
                            left: 3px;
                            bottom: 3px;
                            background-color: white;
                            border-radius: 50%;
                            transition: .3s;
                        }
                        
                        /* Smooth color transformation states when you toggle it ON or OFF */
                        #receiptPrintToggle:not(:checked) + .toggle-slider {
                            background-color: #ccc !important;
                        }
                        
                        #receiptPrintToggle:not(:checked) + .toggle-slider:before {
                            transform: translateX(0px);
                        }
                        
                        #receiptPrintToggle:checked + .toggle-slider:before {
                            transform: translateX(22px);
                        }
                    </style>

                    <button class="btn btn-success btn-block" onclick="completeSale()">Complete Sale</button>
                </div>
            </div>
        </div>
    `;

    content.innerHTML = html;

            // 💡 ADD THESE THREE LINES RIGHT HERE:
        const printPreference = localStorage.getItem('rememberPrintSetting') !== 'false';
        const toggleCheckbox = document.getElementById('receiptPrintToggle');
        if (toggleCheckbox) {
            toggleCheckbox.checked = printPreference;
        }

    setupPOSListeners();
}

// Setup POS listeners
function setupPOSListeners() {
    const searchInput = document.getElementById('posSearch');
    searchInput.addEventListener('keyup', searchPOSProducts);
    
    const discountInput = document.getElementById('discountPercent');
    discountInput.addEventListener('change', updatePOSTotal);
}

// Search POS products
async function searchPOSProducts() {
    const query = document.getElementById('posSearch').value;
    
    if (!query) {
        document.getElementById('productList').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/products/search?query=${encodeURIComponent(query)}`);
        const products = await response.json();

        const html = products.map(product => `
            <div class="card mb-10" style="cursor: pointer;" onclick="addToCart(${product.id}, '${product.name}', ${product.selling_price}, ${product.stock})">
                <div class="flex-between">
                    <div>
                        <strong>${product.name}</strong>
                        <div class="text-muted">₱${product.selling_price.toFixed(2)}</div>
                    </div>
                    <div class="text-right">
                        <div>Stock: ${product.stock}</div>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('productList').innerHTML = html;
    } catch (error) {
        console.error('Error searching products:', error);
    }
}

// Add to cart
function addToCart(productId, name, price, stock) {
    let cart = JSON.parse(localStorage.getItem('posCart') || '[]');
    const existingItem = cart.find(item => item.product_id === productId);

    if (existingItem) {
        if (existingItem.quantity < stock) {
            existingItem.quantity++;
        }
    } else {
        cart.push({
            product_id: productId,
            name: name,
            price: price,
            quantity: 1,
            stock: stock
        });
    }

    localStorage.setItem('posCart', JSON.stringify(cart));
    updatePOSCart();
}

// Update POS cart display
function updatePOSCart() {
    const cart = JSON.parse(localStorage.getItem('posCart') || '[]');
    const cartItems = document.getElementById('cartItems');

    const html = cart.map((item, index) => `
        <tr>
            <td>${item.name}</td>
            <td>
                <input type="number" min="1" max="${item.stock}" value="${item.quantity}" 
                    onchange="updateCartQuantity(${index}, this.value)" style="width: 100px;">
            </td>
            <td>₱${item.price.toFixed(2)}</td>
            <td>₱${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-small" onclick="removeFromCart(${index})">Remove</button>
            </td>
        </tr>
    `).join('');

    cartItems.innerHTML = html;
    updatePOSTotal();
}

// Update cart quantity
function updateCartQuantity(index, quantity) {
    let cart = JSON.parse(localStorage.getItem('posCart') || '[]');
    cart[index].quantity = parseInt(quantity);
    localStorage.setItem('posCart', JSON.stringify(cart));
    updatePOSCart();
}

// Remove from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('posCart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('posCart', JSON.stringify(cart));
    updatePOSCart();
}

// Update POS total
function updatePOSTotal() {
    const cart = JSON.parse(localStorage.getItem('posCart') || '[]');
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount;

    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('discountAmount').textContent = `₱${discountAmount.toFixed(2)}`;
    document.getElementById('total').textContent = `₱${total.toFixed(2)}`;
}

// Complete sale with Auto-Print Toggle configuration
async function completeSale() {
    const cart = JSON.parse(localStorage.getItem('posCart') || '[]');
    
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const paymentMethod = document.getElementById('paymentMethod').value;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const totalAmount = subtotal - discountAmount;

    try {
        const response = await fetch(`${API_BASE}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                total_amount: totalAmount,
                payment_method: paymentMethod,
                discount: discountAmount
            })
        });

        if (response.ok) {
            const result = await response.json();
            alert('Sale completed successfully!');
            
            // 1. Get the toggle element
            const autoPrintToggle = document.getElementById('receiptPrintToggle');
            
            // 2. Save its state (true or false) to localStorage so the system remembers it
            if (autoPrintToggle) {
                localStorage.setItem('rememberPrintSetting', autoPrintToggle.checked);
            }
            
            // Clear current working transaction cart data
            localStorage.removeItem('posCart');
            
            // Reload your register interface screen (this resets the HTML)
            loadPOS();

            // 3. Check if it WAS checked to decide if we print right now
            const wasChecked = localStorage.getItem('rememberPrintSetting') === 'true';
            if (wasChecked) {
                printReceipt(result.saleId);
            }
            
        } else {
            alert('Error completing sale');
        }
    } catch (error) {
        console.error('Error completing sale:', error);
        alert('Error completing sale');
    }
}

// Print receipt
async function printReceipt(saleId) {
    try {
        const response = await fetch(`${API_BASE}/sales/${saleId}`);
        const sale = await response.json();

        const receiptHTML = `
            <html>
            <head>
                <title>Receipt #${sale.id}</title>
                <style>
                    body { font-family: monospace; width: 300px; margin: 0 auto; }
                    .receipt { text-align: center; padding: 20px; }
                    .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                    table { width: 100%; }
                    td { padding: 5px; }
                    .total { font-weight: bold; font-size: 18px; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <h2>SARI-SARI STORE</h2>
                    <p>Receipt #${sale.id}</p>
                    <p>${new Date(sale.created_at).toLocaleString()}</p>
                    <p>Cashier: ${sale.cashier_name}</p>
                    <div class="line"></div>
                    <table>
                        ${sale.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>₱${item.price.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <div class="line"></div>
                    <table>
                        <tr>
                            <td>Total:</td>
                            <td class="total">₱${sale.total_amount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Payment:</td>
                            <td>${sale.payment_method}</td>
                        </tr>
                    </table>
                    <div class="line"></div>
                    <p>Thank you for your purchase!</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '', 'height=400,width=600');
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.print();
    } catch (error) {
        console.error('Error printing receipt:', error);
    }
}

// Load Inventory
async function loadInventory() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/inventory/summary`);
        const summary = await response.json();

        const html = `
            <div class="card-header">
                <h1 class="card-title">Inventory Management</h1>
            </div>

            <div class="grid grid-3">
                <div class="stat-card">
                    <div class="stat-label">Total Products</div>
                    <div class="stat-value">${summary.total_products}</div>
                </div>
                <div class="stat-card accent">
                    <div class="stat-label">Total Stock</div>
                    <div class="stat-value">${summary.total_stock}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Low Stock Items</div>
                    <div class="stat-value">${summary.low_stock_count}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Inventory Actions</h2>
                </div>
                <div class="grid grid-3">
                    <button class="btn btn-primary btn-block" onclick="openStockInModal()">Stock In</button>
                    <button class="btn btn-warning btn-block" onclick="openStockOutModal()">Stock Out</button>
                    <button class="btn btn-info btn-block" onclick="openAdjustmentModal()">Adjustment</button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Inventory Logs</h2>
                </div>
                <div id="inventoryLogs"></div>
            </div>
        `;

        content.innerHTML = html;
        loadInventoryLogs();
    } catch (error) {
        console.error('Error loading inventory:', error);
        content.innerHTML = '<div class="alert alert-danger">Error loading inventory</div>';
    }
}

// Load inventory logs
async function loadInventoryLogs() {
    try {
        const response = await fetch(`${API_BASE}/inventory/logs`);
        const logs = await response.json();

        const html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Action</th>
                        <th>Quantity</th>
                        <th>Remarks</th>
                        <th>Date & Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(log => `
                        <tr>
                            <td>${log.name}</td>
                            <td><span class="badge badge-primary">${log.action}</span></td>
                            <td>${log.quantity}</td>
                            <td>${log.remarks}</td>
                            <td>${new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('inventoryLogs').innerHTML = html;
    } catch (error) {
        console.error('Error loading inventory logs:', error);
    }
}

// Load Sales
async function loadSales() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/sales/all`);
        const sales = await response.json();

        const html = `
            <div class="card-header">
                <h1 class="card-title">Sales Report</h1>
            </div>

            <div class="card">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Total Amount</th>
                            <th>Payment Method</th>
                            <th>Date & Time</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(sale => `
                            <tr>
                                <td>#${sale.id}</td>
                                <td>₱${sale.total_amount.toFixed(2)}</td>
                                <td>${sale.payment_method}</td>
                                <td>${new Date(sale.created_at).toLocaleString()}</td>
                                <td>
                                    <button class="btn btn-info btn-small" onclick="viewSaleDetails(${sale.id})">View</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        content.innerHTML = html;
    } catch (error) {
        console.error('Error loading sales:', error);
        content.innerHTML = '<div class="alert alert-danger">Error loading sales</div>';
    }
}

// View sale details
async function viewSaleDetails(saleId) {
    try {
        const response = await fetch(`${API_BASE}/sales/${saleId}`);
        const sale = await response.json();

        const itemsHTML = sale.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₱${item.price.toFixed(2)}</td>
                <td>₱${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
        `).join('');

        alert(`Sale #${sale.id}\nTotal: ₱${sale.total_amount.toFixed(2)}\nPayment: ${sale.payment_method}\nCashier: ${sale.cashier_name}`);
    } catch (error) {
        console.error('Error viewing sale details:', error);
    }
}

// Load Customers
async function loadCustomers() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/customers`);
        const customers = await response.json();

        const html = `
            <div class="card-header">
                <h1 class="card-title">Customers</h1>
                <button class="btn btn-primary" onclick="openCustomerModal()">+ Add Customer</button>
            </div>

            <div class="card">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(customer => `
                            <tr>
                                <td>${customer.id}</td>
                                <td>${customer.name}</td>
                                <td>${customer.phone || '-'}</td>
                                <td>${customer.address || '-'}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-info btn-small" onclick="editCustomer(${customer.id})">Edit</button>
                                        <button class="btn btn-danger btn-small" onclick="deleteCustomer(${customer.id})">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        content.innerHTML = html;
    } catch (error) {
        console.error('Error loading customers:', error);
        content.innerHTML = '<div class="alert alert-danger">Error loading customers</div>';
    }
}

// Load Suppliers
async function loadSuppliers() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/suppliers`);
        const suppliers = await response.json();

        const html = `
            <div class="card-header">
                <h1 class="card-title">Suppliers</h1>
                <button class="btn btn-primary" onclick="openSupplierModal()">+ Add Supplier</button>
            </div>

            <div class="card">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Contact Person</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suppliers.map(supplier => `
                            <tr>
                                <td>${supplier.id}</td>
                                <td>${supplier.name}</td>
                                <td>${supplier.contact_person || '-'}</td>
                                <td>${supplier.phone || '-'}</td>
                                <td>${supplier.address || '-'}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-info btn-small" onclick="editSupplier(${supplier.id})">Edit</button>
                                        <button class="btn btn-danger btn-small" onclick="deleteSupplier(${supplier.id})">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        content.innerHTML = html;
    } catch (error) {
        console.error('Error loading suppliers:', error);
        content.innerHTML = '<div class="alert alert-danger">Error loading suppliers</div>';
    }
}

// Load Expenses
async function loadExpenses() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="spinner"></div>';

    try {
        const profitResponse = await fetch(`${API_BASE}/expenses/profit`);
        const profit = await profitResponse.json();

        const expensesResponse = await fetch(`${API_BASE}/expenses`);
        const expenses = await expensesResponse.json();

        const html = `
            <div class="card-header">
                <h1 class="card-title">Expenses & Profit</h1>
                <button class="btn btn-primary" onclick="openExpenseModal()">+ Add Expense</button>
            </div>

            <div class="grid grid-3">
                <div class="stat-card">
                    <div class="stat-label">Total Sales</div>
                    <div class="stat-value">₱${profit.total_sales.toFixed(2)}</div>
                </div>
                <div class="stat-card accent">
                    <div class="stat-label">Total Expenses</div>
                    <div class="stat-value">₱${profit.total_expenses.toFixed(2)}</div>
                </div>
                <div class="stat-card ${profit.profit >= 0 ? 'success' : 'danger'}">
                    <div class="stat-label">Profit</div>
                    <div class="stat-value">₱${profit.profit.toFixed(2)}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Expenses</h2>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expenses.map(expense => `
                            <tr>
                                <td>${expense.id}</td>
                                <td>${expense.category}</td>
                                <td>${expense.description || '-'}</td>
                                <td>₱${expense.amount.toFixed(2)}</td>
                                <td>${new Date(expense.created_at).toLocaleString()}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-info btn-small" onclick="editExpense(${expense.id})">Edit</button>
                                        <button class="btn btn-danger btn-small" onclick="deleteExpense(${expense.id})">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        content.innerHTML = html;
    } catch (error) {
        console.error('Error loading expenses:', error);
        content.innerHTML = '<div class="alert alert-danger">Error loading expenses</div>';
    }
}

// Load Users (Admin only)
async function loadUsers() {
    if (currentUser.role !== 'admin') {
        document.getElementById('content').innerHTML = '<div class="alert alert-danger">Access denied</div>';
        return;
    }

    const content = document.getElementById('content');
    content.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/auth/users`);
        const users = await response.json();

        const html = `
            <div class="card-header">
                <h1 class="card-title">User Management</h1>
                <button class="btn btn-primary" onclick="openUserModal()">+ Add User</button>
            </div>

            <div class="card">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.username}</td>
                                <td><span class="badge badge-primary">${user.role}</span></td>
                                <td>${new Date(user.created_at).toLocaleString()}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-info btn-small" onclick="editUser(${user.id})">Edit</button>
                                        <button class="btn btn-danger btn-small" onclick="deleteUser(${user.id})">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        content.innerHTML = html;
    } catch (error) {
        console.error('Error loading users:', error);
        content.innerHTML = '<div class="alert alert-danger">Error loading users</div>';
    }
}
// Utility helper to fetch backend items and populate selection dropdown lists
async function fillProductDropdown(elementId) {
    const selectDropdown = document.getElementById(elementId);
    if (!selectDropdown) return;
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        selectDropdown.innerHTML = '<option value="">-- Select Product --</option>';
        products.forEach(p => {
            selectDropdown.innerHTML += `<option value="${p.id}">${p.name} (In Stock: ${p.stock})</option>`;
        });
    } catch (err) {
        console.error('Error fetching inventory products:', err);
    }
}

// Generic Helper to clear or toggle element states
function showSystemModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

// Modal functions (placeholders - will be expanded in next phase)
// 1. PRODUCTS MANAGEMENT LOGIC
// Generic Helper to clear or toggle element states
function showSystemModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

// 1. PRODUCTS MANAGEMENT LOGIC
function openProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalTitle').innerText = '🏷️ Add New Product';
    showSystemModal('productModal');
}

async function editProduct(id) {
    try {
        const res = await fetch(`/api/products/${id}`);
        const p = await res.json();
        document.getElementById('productId').value = p.id;
        document.getElementById('productBarcode').value = p.barcode || '';
        document.getElementById('productName').value = p.name;
        document.getElementById('productCategory').value = p.category;
        document.getElementById('productCostPrice').value = p.cost_price;
        document.getElementById('productSellingPrice').value = p.selling_price;
        document.getElementById('productStock').value = p.stock;
        document.getElementById('productReorder').value = p.reorder_level;
        document.getElementById('productModalTitle').innerText = '📝 Edit Product';
        showSystemModal('productModal');
    } catch (err) { console.error(err); }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this item from database?')) {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) loadPage('products');
    }
}

// 2. CUSTOMERS LOGIC
function openCustomerModal() {
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
    document.getElementById('customerModalTitle').innerText = '👥 Add New Customer';
    showSystemModal('customerModal');
}

async function editCustomer(id) {
    try {
        const res = await fetch(`/api/customers/${id}`);
        const c = await res.json();
        document.getElementById('customerId').value = c.id;
        document.getElementById('customerName').value = c.name;
        document.getElementById('customerPhone').value = c.phone || '';
        document.getElementById('customerAddress').value = c.address || '';
        document.getElementById('customerModalTitle').innerText = '📝 Edit Customer';
        showSystemModal('customerModal');
    } catch (err) { console.error(err); }
}

async function deleteCustomer(id) {
    if (confirm('Delete this customer?')) {
        const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
        if (res.ok) loadPage('customers');
    }
}

// 3. SUPPLIERS LOGIC
function openSupplierModal() {
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = '';
    document.getElementById('supplierModalTitle').innerText = '🚚 Add New Supplier';
    showSystemModal('supplierModal');
}

async function editSupplier(id) {
    try {
        const res = await fetch(`/api/suppliers/${id}`);
        const s = await res.json();
        document.getElementById('supplierId').value = s.id;
        document.getElementById('supplierName').value = s.name;
        document.getElementById('supplierContact').value = s.contact_person || '';
        document.getElementById('supplierPhone').value = s.phone || '';
        document.getElementById('supplierAddress').value = s.address || '';
        document.getElementById('supplierModalTitle').innerText = '📝 Edit Supplier';
        showSystemModal('supplierModal');
    } catch (err) { console.error(err); }
}

async function deleteSupplier(id) {
    if (confirm('Remove this supplier entry?')) {
        const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
        if (res.ok) loadPage('suppliers');
    }
}

// 4. EXPENSES LOGIC
function openExpenseModal() {
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseId').value = '';
    document.getElementById('expenseModalTitle').innerText = '💰 Record Expense';
    showSystemModal('expenseModal');
}

async function editExpense(id) {
    alert('This base system maintains historical chronological cost ledgers; create a new record instead to adjust costs.');
}

async function deleteExpense(id) {
    if (confirm('Delete this expense log?')) {
        const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
        if (res.ok) loadPage('expenses');
    }
}

// Open Stock In Form Pop-up
function openStockInModal() {
    const modal = document.getElementById('stockInModal');
    if (modal) {
        modal.classList.remove('hidden'); // Removes template hidden styles
        modal.style.display = 'flex';     // Forces modern flexbox layouts
        fillProductDropdown('stockInProduct');
    }
}

// Open Stock Out Form Pop-up
function openStockOutModal() {
    const modal = document.getElementById('stockOutModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        fillProductDropdown('stockOutProduct');
    }
}

// Open Adjustment Form Pop-up
function openAdjustmentModal() {
    const modal = document.getElementById('adjustmentModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        fillProductDropdown('adjustmentProduct');
    }
}

// Global window event registration for operation modal pipeline submissions
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Stock In Event Handler
    document.getElementById('stockInForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            product_id: parseInt(document.getElementById('stockInProduct').value),
            quantity: parseInt(document.getElementById('stockInQty').value),
            remarks: document.getElementById('stockInRemarks').value || 'Stock In'
        };
        const res = await fetch('/api/inventory/stock-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            document.getElementById('stockInModal').style.display = 'none';
            document.getElementById('stockInForm').reset();
            if (typeof loadPage === 'function') loadPage('inventory');
        } else {
            alert('Error updating stock in values.');
        }
    });

    // 2. Stock Out Event Handler
    document.getElementById('stockOutForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            product_id: parseInt(document.getElementById('stockOutProduct').value),
            quantity: parseInt(document.getElementById('stockOutQty').value),
            remarks: document.getElementById('stockOutFormRemarks').value
        };
        const res = await fetch('/api/inventory/stock-out', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            document.getElementById('stockOutModal').style.display = 'none';
            document.getElementById('stockOutForm').reset();
            if (typeof loadPage === 'function') loadPage('inventory');
        } else {
            const data = await res.json();
            alert(data.error || 'Error processing stock out.');
        }
    });

    // 3. Adjustment Event Handler
    document.getElementById('adjustmentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            product_id: parseInt(document.getElementById('adjustmentProduct').value),
            new_stock: parseInt(document.getElementById('adjustmentQty').value),
            remarks: document.getElementById('adjustmentRemarks').value
        };
        const res = await fetch('/api/inventory/adjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            document.getElementById('adjustmentModal').style.display = 'none';
            document.getElementById('adjustmentForm').reset();
            if (typeof loadPage === 'function') loadPage('inventory');
        } else {
            alert('Error applying system inventory adjustments.');
        }
    });
});

// 5. USER ACCOUNTS LOGIC
function openUserModal() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModalTitle').innerText = '👤 Create User Account';
    showSystemModal('userModal');
}

async function editUser(id) {
    try {
        // Simple mock route fetch for account details or load by list context
        document.getElementById('userId').value = id;
        document.getElementById('userModalTitle').innerText = '📝 Edit Account Access';
        showSystemModal('userModal');
    } catch (err) { console.error(err); }
}

async function deleteUser(id) {
    if (confirm('Revoke access and delete this user account?')) {
        const res = await fetch(`/api/auth/users/${id}`, { method: 'DELETE' });
        if (res.ok) loadPage('users');
        else {
            const errData = await res.json();
            alert(errData.error || 'Operation failed.');
        }
    }
}

// GLOBAL PIPELINE TRANSACTION SUBMISSIONS
document.addEventListener('DOMContentLoaded', () => {
    
    // Product submission handler
    document.getElementById('productForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const payload = {
            barcode: document.getElementById('productBarcode').value || null,
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            cost_price: parseFloat(document.getElementById('productCostPrice').value),
            selling_price: parseFloat(document.getElementById('productSellingPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            reorder_level: parseInt(document.getElementById('productReorder').value)
        };
        const url = id ? `/api/products/${id}` : '/api/products';
        const method = id ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            document.getElementById('productModal').style.display = 'none';
            loadPage('products');
        }
    });

    // Customer submission handler
    document.getElementById('customerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('customerId').value;
        const payload = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value || null,
            address: document.getElementById('customerAddress').value || null
        };
        const url = id ? `/api/customers/${id}` : '/api/customers';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            document.getElementById('customerModal').style.display = 'none';
            loadPage('customers');
        }
    });

    // Supplier submission handler
    document.getElementById('supplierForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('supplierId').value;
        const payload = {
            name: document.getElementById('supplierName').value,
            contact_person: document.getElementById('supplierContact').value || null,
            phone: document.getElementById('supplierPhone').value || null,
            address: document.getElementById('supplierAddress').value || null
        };
        const url = id ? `/api/suppliers/${id}` : '/api/suppliers';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            document.getElementById('supplierModal').style.display = 'none';
            loadPage('suppliers');
        }
    });

    // Expense submission handler
    document.getElementById('expenseForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            category: document.getElementById('expenseCategory').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            description: document.getElementById('expenseDesc').value
        };
        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            document.getElementById('expenseModal').style.display = 'none';
            loadPage('expenses');
        }
    });

    // User management account handler
    document.getElementById('userForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('userId').value;
        const payload = {
            username: document.getElementById('userUsername').value,
            password: document.getElementById('userPassword').value || undefined,
            role: document.getElementById('userRoleSelect').value
        };
        const url = id ? `/api/auth/users/${id}` : '/api/auth/users';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            document.getElementById('userModal').style.display = 'none';
            loadPage('users');
        } else {
            const data = await res.json();
            alert(data.error || 'Error processing system user authentication profiles.');
        }
    });
});

function toggleMobileSidebar() {
    // 💡 Find the semantic <nav> element on your webpage
    const sidebarNav = document.querySelector('nav');
    const menuBtn = document.getElementById('mobileMenuTrigger');
    
    if (sidebarNav) {
        // Toggles the class name on and off
        sidebarNav.classList.toggle('mobile-open');
        
        // Console test log: Open your browser inspect panel (F12) to make sure this outputs!
        console.log("Mobile menu state toggled. Is open?", sidebarNav.classList.contains('mobile-open'));
        
        // Dynamically switch menu icon typography states
        if (menuBtn) {
            if (sidebarNav.classList.contains('mobile-open')) {
                menuBtn.innerText = '✖';
            } else {
                menuBtn.innerText = '☰';
            }
        }
    } else {
        console.error("Error: Could not locate a <nav> sidebar element on this layout page!");
    }
}

// Optional helper: Automatically shut the menu drawer after hitting any action tab option to clear space
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        // If clicking a nav item option button inside the menu, close the panel automatically
        if (e.target.closest('a') || e.target.closest('button:not(#mobileMenuTrigger)')) {
            const layoutSidebar = document.querySelector('.sidebar') || document.querySelector('[style*="width: 250px"]');
            if (layoutSidebar && layoutSidebar.classList.contains('mobile-open')) {
                toggleMobileSidebar();
            }
        }
    }
});

// 💡 CLICK OUTSIDE TO CLOSE: Automatically shunts the mobile menu away
document.addEventListener('click', (event) => {
    // Only execute this logic if the viewport is in mobile mode
    if (window.innerWidth <= 768) {
        const sidebarNav = document.querySelector('nav');
        const menuBtn = document.getElementById('mobileMenuTrigger');

        // Check if the sidebar menu is currently open
        if (sidebarNav && sidebarNav.classList.contains('mobile-open')) {
            
            /* If the click happened OUTSIDE the <nav> element 
               AND OUTSIDE the hamburger trigger button itself, shut it down!
            */
            if (!sidebarNav.contains(event.target) && !menuBtn.contains(event.target)) {
                sidebarNav.classList.remove('mobile-open');
                
                // Reset the hamburger button icon back to the bars
                if (menuBtn) {
                    menuBtn.innerText = '☰';
                }
                
                console.log("Clicked outside. Mobile menu automatically closed.");
            }
        }
    }
});