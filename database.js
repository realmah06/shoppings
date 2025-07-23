class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        if (!localStorage.getItem('salesSystem')) {
            const initialData = {
                users: [
                    { id: 1, username: 'admin', password: 'admin123', full_name: 'Admin User', email: 'admin@example.com', role: 'admin' }
                ],
                customers: [
                    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', address: '123 Main St', tax_id: 'TAX123', credit_limit: 5000, current_balance: 0 },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '9876543210', address: '456 Oak Ave', tax_id: 'TAX456', credit_limit: 3000, current_balance: 0 }
                ],
                products: [
                    { id: 1, name: 'Premium Widget', sku: 'PW-001', barcode: '123456789012', category: 'Widgets', cost_price: 10.00, selling_price: 25.00, current_stock: 15, min_stock_level: 5, vendor_id: 1 },
                    { id: 2, name: 'Basic Gadget', sku: 'BG-002', barcode: '987654321098', category: 'Gadgets', cost_price: 5.00, selling_price: 15.00, current_stock: 8, min_stock_level: 10, vendor_id: 1 },
                    { id: 3, name: 'Deluxe Thingamajig', sku: 'DT-003', barcode: '456123789045', category: 'Thingamajigs', cost_price: 20.00, selling_price: 50.00, current_stock: 3, min_stock_level: 5, vendor_id: 2 }
                ],
                vendors: [
                    { id: 1, name: 'Widgets Inc', contact_person: 'Bob Johnson', email: 'bob@widgets.com', phone: '555-1234', address: '789 Vendor St', tax_id: 'VENDOR123' },
                    { id: 2, name: 'Gadgets Co', contact_person: 'Alice Williams', email: 'alice@gadgets.com', phone: '555-5678', address: '321 Supplier Ave', tax_id: 'VENDOR456' }
                ],
                invoices: [
                    { id: 1, invoice_number: 'INV-2023-001', date: '2023-06-15', customer_id: 1, items: [
                        { product_id: 1, quantity: 2, price: 25.00, total: 50.00 },
                        { product_id: 2, quantity: 3, price: 15.00, total: 45.00 }
                    ], subtotal: 95.00, tax: 9.50, total: 104.50, status: 'paid' },
                    { id: 2, invoice_number: 'INV-2023-002', date: '2023-06-14', customer_id: 2, items: [
                        { product_id: 3, quantity: 1, price: 50.00, total: 50.00 }
                    ], subtotal: 50.00, tax: 5.00, total: 55.00, status: 'pending' }
                ],
                expenses: [],
                bank_transfers: [],
                adjustments: []
            };
            localStorage.setItem('salesSystem', JSON.stringify(initialData));
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem('salesSystem'));
    }

    saveData(data) {
        localStorage.setItem('salesSystem', JSON.stringify(data));
    }

    // Generic CRUD operations
    getAll(table) {
        const data = this.getData();
        return data[table];
    }

    getById(table, id) {
        const items = this.getAll(table);
        return items.find(item => item.id === id);
    }

    create(table, item) {
        const data = this.getData();
        const items = data[table];
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        const newItem = { ...item, id: newId };
        data[table].push(newItem);
        this.saveData(data);
        return newItem;
    }

    update(table, id, updates) {
        const data = this.getData();
        const items = data[table];
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            this.saveData(data);
            return items[index];
        }
        return null;
    }

    delete(table, id) {
        const data = this.getData();
        const items = data[table];
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            const deleted = items.splice(index, 1);
            this.saveData(data);
            return deleted[0];
        }
        return null;
    }

    // Specific entity methods
    getCustomerInvoices(customerId) {
        const data = this.getData();
        return data.invoices.filter(invoice => invoice.customer_id === customerId);
    }

    getProductVendor(productId) {
        const product = this.getById('products', productId);
        if (product && product.vendor_id) {
            return this.getById('vendors', product.vendor_id);
        }
        return null;
    }

    // Authentication
    authenticate(username, password) {
        const users = this.getAll('users');
        return users.find(user => user.username === username && user.password === password);
    }
}

const db = new Database();
