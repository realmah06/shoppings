// Financial Module
function loadExpenses() {
    const tableBody = document.querySelector('#expensesTable tbody');
    tableBody.innerHTML = '';
    
    const expenses = db.getAll('expenses');
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${expense.payment_method}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewExpense(${expense.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editExpense(${expense.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showNewExpenseModal() {
    Swal.fire({
        title: 'Add New Expense',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Date</label>
                        <input type="date" class="form-control" id="expenseDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Category</label>
                        <select class="form-select" id="expenseCategory">
                            <option value="office">Office Supplies</option>
                            <option value="utilities">Utilities</option>
                            <option value="rent">Rent</option>
                            <option value="salary">Salary</option>
                            <option value="marketing">Marketing</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Description</label>
                <input type="text" class="form-control" id="expenseDescription" required>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Amount</label>
                        <input type="number" class="form-control" id="expenseAmount" min="0" step="0.01" required>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Payment Method</label>
                        <select class="form-select" id="expensePaymentMethod">
                            <option value="cash">Cash</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="card">Credit Card</option>
                            <option value="check">Check</option>
                        </select>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Save Expense',
        preConfirm: () => {
            const date = document.getElementById('expenseDate').value;
            const category = document.getElementById('expenseCategory').value;
            const description = document.getElementById('expenseDescription').value;
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const paymentMethod = document.getElementById('expensePaymentMethod').value;
            
            if (!date || !description || isNaN(amount) || amount <= 0) {
                showError('Please fill in all required fields');
                return false;
            }
            
            const newExpense = {
                date,
                category,
                description,
                amount,
                payment_method: paymentMethod
            };
            
            db.create('expenses', newExpense);
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Expense added successfully.', 'success');
            loadExpenses();
        }
    });
}

function viewExpense(id) {
    const expense = db.getById('expenses', id);
    if (!expense) {
        showError('Expense not found');
        return;
    }
    
    Swal.fire({
        title: 'Expense Details',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Date:</strong> ${expense.date}</p>
                    <p><strong>Category:</strong> ${expense.category}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Amount:</strong> $${expense.amount.toFixed(2)}</p>
                    <p><strong>Payment Method:</strong> ${expense.payment_method}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <p><strong>Description:</strong> ${expense.description}</p>
                </div>
            </div>
        `,
        width: '700px'
    });
}

function editExpense(id) {
    // Similar to showNewExpenseModal but with existing data
    Swal.fire('Info', 'Edit functionality would be implemented here', 'info');
}

function deleteExpense(id) {
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
            db.delete('expenses', id);
            Swal.fire('Deleted!', 'The expense has been deleted.', 'success');
            loadExpenses();
        }
    });
}

function loadBankTransfers() {
    const tableBody = document.querySelector('#bankTransfersTable tbody');
    tableBody.innerHTML = '';
    
    const transfers = db.getAll('bank_transfers');
    
    transfers.forEach(transfer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transfer.date}</td>
            <td>${transfer.from_account}</td>
            <td>${transfer.to_account}</td>
            <td>$${transfer.amount.toFixed(2)}</td>
            <td>${transfer.reference}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewBankTransfer(${transfer.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteBankTransfer(${transfer.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showNewBankTransferModal() {
    Swal.fire({
        title: 'New Bank Transfer',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Date</label>
                        <input type="date" class="form-control" id="transferDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Amount</label>
                        <input type="number" class="form-control" id="transferAmount" min="0" step="0.01" required>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">From Account</label>
                        <select class="form-select" id="transferFrom">
                            <option value="main">Main Account (****1234)</option>
                            <option value="savings">Savings Account (****5678)</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">To Account</label>
                        <select class="form-select" id="transferTo">
                            <option value="main">Main Account (****1234)</option>
                            <option value="savings">Savings Account (****5678)</option>
                            <option value="vendor">Vendor Account</option>
                            <option value="other">Other Bank</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Reference</label>
                <input type="text" class="form-control" id="transferReference">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Record Transfer',
        preConfirm: () => {
            const date = document.getElementById('transferDate').value;
            const amount = parseFloat(document.getElementById('transferAmount').value);
            const fromAccount = document.getElementById('transferFrom').value;
            const toAccount = document.getElementById('transferTo').value;
            const reference = document.getElementById('transferReference').value;
            
            if (!date || isNaN(amount) || amount <= 0 || fromAccount === toAccount) {
                showError('Please fill in all required fields and ensure accounts are different');
                return false;
            }
            
            const newTransfer = {
                date,
                from_account: fromAccount,
                to_account: toAccount,
                amount,
                reference
            };
            
            db.create('bank_transfers', newTransfer);
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Bank transfer recorded successfully.', 'success');
            loadBankTransfers();
        }
    });
}

function viewBankTransfer(id) {
    const transfer = db.getById('bank_transfers', id);
    if (!transfer) {
        showError('Bank transfer not found');
        return;
    }
    
    Swal.fire({
        title: 'Bank Transfer Details',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Date:</strong> ${transfer.date}</p>
                    <p><strong>From Account:</strong> ${transfer.from_account}</p>
                    <p><strong>To Account:</strong> ${transfer.to_account}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Amount:</strong> $${transfer.amount.toFixed(2)}</p>
                    <p><strong>Reference:</strong> ${transfer.reference || 'N/A'}</p>
                </div>
            </div>
        `,
        width: '700px'
    });
}

function deleteBankTransfer(id) {
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
            db.delete('bank_transfers', id);
            Swal.fire('Deleted!', 'The bank transfer has been deleted.', 'success');
            loadBankTransfers();
        }
    });
}

function loadCreditDebitAdjustments() {
    const tableBody = document.querySelector('#adjustmentsTable tbody');
    tableBody.innerHTML = '';
    
    const adjustments = db.getAll('adjustments');
    const customers = db.getAll('customers');
    
    adjustments.forEach(adjustment => {
        const customer = customers.find(c => c.id === adjustment.customer_id);
        const typeClass = adjustment.type === 'credit' ? 'text-success' : 'text-danger';
        const typeText = adjustment.type === 'credit' ? 'Credit' : 'Debit';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${adjustment.date}</td>
            <td>${customer ? customer.name : 'N/A'}</td>
            <td class="${typeClass}">${typeText}</td>
            <td>$${adjustment.amount.toFixed(2)}</td>
            <td>${adjustment.reason}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewAdjustment(${adjustment.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAdjustment(${adjustment.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showNewAdjustmentModal() {
    const customers = db.getAll('customers');
    let customerOptions = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    Swal.fire({
        title: 'New Credit/Debit Adjustment',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Date</label>
                        <input type="date" class="form-control" id="adjustmentDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Customer</label>
                        <select class="form-select" id="adjustmentCustomer" required>
                            <option value="">Select Customer</option>
                            ${customerOptions}
                        </select>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Type</label>
                        <select class="form-select" id="adjustmentType" required>
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Amount</label>
                        <input type="number" class="form-control" id="adjustmentAmount" min="0" step="0.01" required>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Reason</label>
                <textarea class="form-control" id="adjustmentReason" rows="3" required></textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Record Adjustment',
        preConfirm: () => {
            const date = document.getElementById('adjustmentDate').value;
            const customerId = parseInt(document.getElementById('adjustmentCustomer').value);
            const type = document.getElementById('adjustmentType').value;
            const amount = parseFloat(document.getElementById('adjustmentAmount').value);
            const reason = document.getElementById('adjustmentReason').value;
            
            if (!date || !customerId || isNaN(amount) || amount <= 0 || !reason) {
                showError('Please fill in all required fields');
                return false;
            }
            
            const customer = db.getById('customers', customerId);
            if (!customer) {
                showError('Customer not found');
                return false;
            }
            
            // Update customer balance
            let newBalance = customer.current_balance;
            if (type === 'credit') {
                newBalance -= amount;
            } else {
                newBalance += amount;
            }
            
            db.update('customers', customerId, { current_balance: newBalance });
            
            const newAdjustment = {
                date,
                customer_id: customerId,
                type,
                amount,
                reason
            };
            
            db.create('adjustments', newAdjustment);
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Adjustment recorded successfully.', 'success');
            loadCreditDebitAdjustments();
            loadCustomers(); // Refresh customer list to show updated balances
        }
    });
}

function viewAdjustment(id) {
    const adjustment = db.getById('adjustments', id);
    if (!adjustment) {
        showError('Adjustment not found');
        return;
    }
    
    const customer = db.getById('customers', adjustment.customer_id);
    const typeText = adjustment.type === 'credit' ? 'Credit' : 'Debit';
    const typeClass = adjustment.type === 'credit' ? 'text-success' : 'text-danger';
    
    Swal.fire({
        title: `${typeText} Adjustment`,
        html: `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Date:</strong> ${adjustment.date}</p>
                    <p><strong>Customer:</strong> ${customer ? customer.name : 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Type:</strong> <span class="${typeClass}">${typeText}</span></p>
                    <p><strong>Amount:</strong> $${adjustment.amount.toFixed(2)}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <p><strong>Reason:</strong> ${adjustment.reason}</p>
                </div>
            </div>
        `,
        width: '700px'
    });
}

function deleteAdjustment(id) {
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
            db.delete('adjustments', id);
            Swal.fire('Deleted!', 'The adjustment has been deleted.', 'success');
            loadCreditDebitAdjustments();
        }
    });
}
