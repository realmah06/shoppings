// Global variables
let currentModule = 'dashboard';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('dashboard.html')) {
        loadDashboard();
        updateNotificationCount();
    }
});

// Load a module
function loadModule(moduleName) {
    currentModule = moduleName;
    const moduleContent = document.getElementById('module-content');
    
    // Clear current content
    moduleContent.innerHTML = '';
    
    // Load the appropriate template
    const template = document.getElementById(`${moduleName}-template`);
    if (template) {
        const clone = template.content.cloneNode(true);
        moduleContent.appendChild(clone);
        
        // Initialize the module
        switch(moduleName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'sales-invoice':
                loadInvoices();
                break;
            case 'products':
                loadProducts();
                break;
            case 'customers':
                loadCustomers();
                break;
            case 'vendors':
                loadVendors();
                break;
            // Add cases for other modules
        }
    } else {
        moduleContent.innerHTML = `<div class="alert alert-info">Module ${moduleName} is under development</div>`;
    }
    
    // Update active menu item
    updateActiveMenuItem(moduleName);
}

function loadDashboard() {
    loadModule('dashboard');
}

function loadDashboardData() {
    // Today's sales
    const today = new Date().toISOString().split('T')[0];
    const invoices = db.getAll('invoices');
    const todaySales = invoices
        .filter(inv => inv.date === today)
        .reduce((sum, inv) => sum + inv.total, 0);
    document.getElementById('todaySales').textContent = `$${todaySales.toFixed(2)}`;
    
    // Monthly sales (current month)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlySales = invoices
        .filter(inv => {
            const [year, month] = inv.date.split('-');
            return parseInt(year) === currentYear && parseInt(month) === currentMonth;
        })
        .reduce((sum, inv) => sum + inv.total, 0);
    document.getElementById('monthlySales').textContent = `$${monthlySales.toFixed(2)}`;
    
    // Low stock items
    const products = db.getAll('products');
    const lowStockItems = products.filter(p => p.current_stock <= p.min_stock_level).length;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    
    // Pending invoices
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
    document.getElementById('pendingInvoices').textContent = pendingInvoices;
    
    // Recent sales
    loadRecentSales();
    
    // Stock alerts
    loadStockAlerts();
}

function loadRecentSales() {
    const tableBody = document.querySelector('#recentSalesTable tbody');
    tableBody.innerHTML = '';
    
    const invoices = db.getAll('invoices').slice(0, 5);
    const customers = db.getAll('customers');
    
    invoices.forEach(invoice => {
        const customer = customers.find(c => c.id === invoice.customer_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${customer ? customer.name : 'Unknown'}</td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td>${invoice.date}</td>
        `;
        tableBody.appendChild(row);
    });
}

function loadStockAlerts() {
    const tableBody = document.querySelector('#stockAlertsTable tbody');
    tableBody.innerHTML = '';
    
    const products = db.getAll('products').filter(p => p.current_stock <= p.min_stock_level);
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td class="${product.current_stock <= product.min_stock_level ? 'text-danger fw-bold' : ''}">${product.current_stock}</td>
            <td>${product.min_stock_level}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateActiveMenuItem(moduleName) {
    // Remove active class from all menu items
    document.querySelectorAll('#sidebar li').forEach(li => {
        li.classList.remove('active');
    });
    
    // Add active class to current module
    const menuItem = document.querySelector(`#sidebar a[onclick="loadModule('${moduleName}')"]`);
    if (menuItem) {
        menuItem.parentElement.classList.add('active');
    } else {
        // For submenu items, find the parent
        const submenuItem = document.querySelector(`#sidebar a[onclick*="${moduleName}"]`);
        if (submenuItem) {
            submenuItem.parentElement.classList.add('active');
            // Also open the parent dropdown
            const parentDropdown = submenuItem.closest('.collapse');
            if (parentDropdown) {
                parentDropdown.classList.add('show');
            }
        }
    }
}

function updateNotificationCount() {
    // In a real app, you would fetch actual notifications
    const count = 0;
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Helper function for showing error messages
function showError(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error'
    });
}
