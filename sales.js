// Sales Module
function loadInvoices() {
    const tableBody = document.querySelector('#invoicesTable tbody');
    tableBody.innerHTML = '';
    
    const invoices = db.getAll('invoices');
    const customers = db.getAll('customers');
    
    invoices.forEach(invoice => {
        const customer = customers.find(c => c.id === invoice.customer_id);
        const statusBadge = invoice.status === 'paid' ? 
            '<span class="badge bg-success">Paid</span>' : 
            '<span class="badge bg-warning">Pending</span>';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.date}</td>
            <td>${customer ? customer.name : 'Unknown'}</td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewInvoice(${invoice.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editInvoice(${invoice.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteInvoice(${invoice.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showNewInvoiceModal() {
    const customers = db.getAll('customers');
    const products = db.getAll('products');
    
    let customerOptions = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    let productOptions = products.map(p => `<option value="${p.id}">${p.name} ($${p.selling_price.toFixed(2)})</option>`).join('');
    
    Swal.fire({
        title: 'Create New Invoice',
        html: `
            <div class="mb-3">
                <label class="form-label">Customer</label>
                <select class="form-select" id="invoiceCustomer">
                    <option value="">Select Customer</option>
                    ${customerOptions}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" id="invoiceDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="mb-3">
                <label class="form-label">Items</label>
                <div id="invoiceItems">
                    <div class="row mb-2">
                        <div class="col-md-5">
                            <select class="form-select product-select">
                                <option value="">Select Product</option>
                                ${productOptions}
                            </select>
                        </div>
                        <div class="col-md-3">
                            <input type="number" class="form-control quantity" min="1" value="1" placeholder="Qty">
                        </div>
                        <div class="col-md-3">
                            <input type="text" class="form-control price" placeholder="Price" readonly>
                        </div>
                        <div class="col-md-1">
                            <button class="btn btn-danger btn-sm remove-item">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <button class="btn btn-sm btn-success" id="addItemBtn">
                    <i class="bi bi-plus"></i> Add Item
                </button>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Subtotal</label>
                        <input type="text" class="form-control" id="invoiceSubtotal" value="$0.00" readonly>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Tax (%)</label>
                        <input type="number" class="form-control" id="invoiceTax" value="10" min="0" max="100">
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Total</label>
                <input type="text" class="form-control" id="invoiceTotal" value="$0.00" readonly>
            </div>
        `,
        width: '800px',
        showCancelButton: true,
        confirmButtonText: 'Create Invoice',
        didOpen: () => {
            // Add event listeners for dynamic item management
            document.getElementById('addItemBtn').addEventListener('click', addInvoiceItem);
            
            // Event delegation for remove buttons
            document.getElementById('invoiceItems').addEventListener('click', function(e) {
                if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                    e.target.closest('.row').remove();
                    calculateInvoiceTotals();
                }
            });
            
            // Product selection change
            document.getElementById('invoiceItems').addEventListener('change', function(e) {
                if (e.target.classList.contains('product-select')) {
                    const productId = parseInt(e.target.value);
                    if (productId) {
                        const product = db.getById('products', productId);
                        const priceInput = e.target.closest('.row').querySelector('.price');
                        priceInput.value = product.selling_price.toFixed(2);
                        calculateInvoiceTotals();
                    }
                }
            });
            
            // Quantity change
            document.getElementById('invoiceItems').addEventListener('input', function(e) {
                if (e.target.classList.contains('quantity')) {
                    calculateInvoiceTotals();
                }
            });
            
            // Tax change
            document.getElementById('invoiceTax').addEventListener('input', calculateInvoiceTotals);
        },
        preConfirm: () => {
            const customerId = parseInt(document.getElementById('invoiceCustomer').value);
            const date = document.getElementById('invoiceDate').value;
            const taxRate = parseFloat(document.getElementById('invoiceTax').value) || 0;
            
            if (!customerId) {
                showError('Please select a customer');
                return false;
            }
            
            const items = [];
            let subtotal = 0;
            
            document.querySelectorAll('#invoiceItems .row').forEach(row => {
                const productId = parseInt(row.querySelector('.product-select').value);
                const quantity = parseInt(row.querySelector('.quantity').value) || 0;
                const price = parseFloat(row.querySelector('.price').value) || 0;
                
                if (productId && quantity > 0 && price > 0) {
                    const total = quantity * price;
                    items.push({ product_id: productId, quantity, price, total });
                    subtotal += total;
                }
            });
            
            if (items.length === 0) {
                showError('Please add at least one item to the invoice');
                return false;
            }
            
            const tax = subtotal * (taxRate / 100);
            const total = subtotal + tax;
            
            // Generate invoice number
            const invoices = db.getAll('invoices');
            const nextId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
            const invoiceNumber = `INV-${new Date().getFullYear()}-${nextId.toString().padStart(3, '0')}`;
            
            const newInvoice = {
                invoice_number: invoiceNumber,
                date,
                customer_id: customerId,
                items,
                subtotal,
                tax,
                total,
                status: 'pending'
            };
            
            db.create('invoices', newInvoice);
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Invoice created successfully.', 'success');
            loadInvoices();
            updateDashboardStats();
        }
    });
}

function addInvoiceItem() {
    const products = db.getAll('products');
    let productOptions = products.map(p => `<option value="${p.id}">${p.name} ($${p.selling_price.toFixed(2)})</option>`).join('');
    
    const newItem = document.createElement('div');
    newItem.className = 'row mb-2';
    newItem.innerHTML = `
        <div class="col-md-5">
            <select class="form-select product-select">
                <option value="">Select Product</option>
                ${productOptions}
            </select>
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control quantity" min="1" value="1" placeholder="Qty">
        </div>
        <div class="col-md-3">
            <input type="text" class="form-control price" placeholder="Price" readonly>
        </div>
        <div class="col-md-1">
            <button class="btn btn-danger btn-sm remove-item">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    document.getElementById('invoiceItems').appendChild(newItem);
}

function calculateInvoiceTotals() {
    let subtotal = 0;
    
    document.querySelectorAll('#invoiceItems .row').forEach(row => {
        const quantity = parseInt(row.querySelector('.quantity').value) || 0;
        const price = parseFloat(row.querySelector('.price').value) || 0;
        subtotal += quantity * price;
    });
    
    const taxRate = parseFloat(document.getElementById('invoiceTax').value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    document.getElementById('invoiceSubtotal').value = `$${subtotal.toFixed(2)}`;
    document.getElementById('invoiceTotal').value = `$${total.toFixed(2)}`;
}

function viewInvoice(id) {
    const invoice = db.getById('invoices', id);
    if (!invoice) {
        showError('Invoice not found');
        return;
    }
    
    const customer = db.getById('customers', invoice.customer_id);
    const products = db.getAll('products');
    
    let itemsHtml = '';
    invoice.items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        itemsHtml += `
            <tr>
                <td>${product ? product.name : 'Unknown Product'}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${item.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    Swal.fire({
        title: `Invoice ${invoice.invoice_number}`,
        html: `
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Customer:</strong> ${customer ? customer.name : 'Unknown'}<br>
                    <strong>Date:</strong> ${invoice.date}<br>
                    <strong>Status:</strong> ${invoice.status === 'paid' ? 'Paid' : 'Pending'}
                </div>
                <div class="col-md-6 text-end">
                    <strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}<br>
                    <strong>Tax (${((invoice.tax / invoice.subtotal) * 100).toFixed(2)}%):</strong> $${invoice.tax.toFixed(2)}<br>
                    <strong>Total:</strong> $${invoice.total.toFixed(2)}
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>
        `,
        width: '800px'
    });
}

function editInvoice(id) {
    // Similar to showNewInvoiceModal but with existing data
    // Implementation would be similar to the create function but with existing values
    Swal.fire('Info', 'Edit functionality would be implemented here', 'info');
}

function deleteInvoice(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            db.delete('invoices', id);
            Swal.fire('Deleted!', 'The invoice has been deleted.', 'success');
            loadInvoices();
            updateDashboardStats();
        }
    });
}

function updateDashboardStats() {
    if (currentModule === 'dashboard') {
        loadDashboardData();
    }
}
