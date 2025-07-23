// Customers Module
function loadCustomers() {
    const tableBody = document.querySelector('#customersTable tbody');
    tableBody.innerHTML = '';
    
    const customers = db.getAll('customers');
    
    customers.forEach(customer => {
        const balanceClass = customer.current_balance > 0 ? 'text-danger' : 'text-success';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.email || 'N/A'}</td>
            <td>${customer.phone || 'N/A'}</td>
            <td>$${customer.credit_limit.toFixed(2)}</td>
            <td class="${balanceClass}">$${customer.current_balance.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewCustomer(${customer.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editCustomer(${customer.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showNewCustomerModal() {
    Swal.fire({
        title: 'Add New Customer',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-control" id="customerName" required>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="customerEmail">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Phone</label>
                        <input type="text" class="form-control" id="customerPhone">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Tax ID</label>
                        <input type="text" class="form-control" id="customerTaxId">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-8">
                    <div class="mb-3">
                        <label class="form-label">Address</label>
                        <textarea class="form-control" id="customerAddress" rows="2"></textarea>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Credit Limit</label>
                        <input type="number" class="form-control" id="customerCreditLimit" min="0" value="0">
                    </div>
                </div>
            </div>
        `,
        width: '800px',
        showCancelButton: true,
        confirmButtonText: 'Save Customer',
        preConfirm: () => {
            const name = document.getElementById('customerName').value;
            const email = document.getElementById('customerEmail').value;
            const phone = document.getElementById('customerPhone').value;
            const taxId = document.getElementById('customerTaxId').value;
            const address = document.getElementById('customerAddress').value;
            const creditLimit = parseFloat(document.getElementById('customerCreditLimit').value) || 0;
            
            if (!name) {
                showError('Customer name is required');
                return false;
            }
            
            const newCustomer = {
                name,
                email,
                phone,
                tax_id: taxId,
                address,
                credit_limit: creditLimit,
                current_balance: 0
            };
            
            db.create('customers', newCustomer);
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Customer added successfully.', 'success');
            loadCustomers();
        }
    });
}

function viewCustomer(id) {
    const customer = db.getById('customers', id);
    if (!customer) {
        showError('Customer not found');
        return;
    }
    
    const invoices = db.getCustomerInvoices(id);
    
    let invoicesHtml = '';
    invoices.forEach(inv => {
        invoicesHtml += `
            <tr>
                <td>${inv.invoice_number}</td>
                <td>${inv.date}</td>
                <td>$${inv.total.toFixed(2)}</td>
                <td>${inv.status === 'paid' ? 'Paid' : 'Pending'}</td>
            </tr>
        `;
    });
    
    Swal.fire({
        title: customer.name,
        html: `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
                    <p><strong>Tax ID:</strong> ${customer.tax_id || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Credit Limit:</strong> $${customer.credit_limit.toFixed(2)}</p>
                    <p><strong>Current Balance:</strong> $${customer.current_balance.toFixed(2)}</p>
                    <p><strong>Available Credit:</strong> $${(customer.credit_limit - customer.current_balance).toFixed(2)}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <p><strong>Address:</strong> ${customer.address || 'N/A'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h5>Invoices</h5>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoicesHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `,
        width: '900px'
    });
}

function editCustomer(id) {
    // Similar to showNewCustomerModal but with existing data
    Swal.fire('Info', 'Edit functionality would be implemented here', 'info');
}

function deleteCustomer(id) {
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
            db.delete('customers', id);
            Swal.fire('Deleted!', 'The customer has been deleted.', 'success');
            loadCustomers();
        }
    });
}
