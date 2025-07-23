// Vendors Module
function loadVendors() {
    const tableBody = document.querySelector('#vendorsTable tbody');
    tableBody.innerHTML = '';
    
    const vendors = db.getAll('vendors');
    
    vendors.forEach(vendor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vendor.name}</td>
            <td>${vendor.contact_person || 'N/A'}</td>
            <td>${vendor.email || 'N/A'}</td>
            <td>${vendor.phone || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewVendor(${vendor.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editVendor(${vendor.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteVendor(${vendor.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showNewVendorModal() {
    Swal.fire({
        title: 'Add New Vendor',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Vendor Name</label>
                        <input type="text" class="form-control" id="vendorName" required>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Contact Person</label>
                        <input type="text" class="form-control" id="vendorContact">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="vendorEmail">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Phone</label>
                        <input type="text" class="form-control" id="vendorPhone">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Tax ID</label>
                        <input type="text" class="form-control" id="vendorTaxId">
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Address</label>
                <textarea class="form-control" id="vendorAddress" rows="2"></textarea>
            </div>
        `,
        width: '800px',
        showCancelButton: true,
        confirmButtonText: 'Save Vendor',
        preConfirm: () => {
            const name = document.getElementById('vendorName').value;
            const contactPerson = document.getElementById('vendorContact').value;
            const email = document.getElementById('vendorEmail').value;
            const phone = document.getElementById('vendorPhone').value;
            const taxId = document.getElementById('vendorTaxId').value;
            const address = document.getElementById('vendorAddress').value;
            
            if (!name) {
                showError('Vendor name is required');
                return false;
            }
            
            const newVendor = {
                name,
                contact_person: contactPerson,
                email,
                phone,
                tax_id: taxId,
                address
            };
            
            db.create('vendors', newVendor);
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Vendor added successfully.', 'success');
            loadVendors();
        }
    });
}

function viewVendor(id) {
    const vendor = db.getById('vendors', id);
    if (!vendor) {
        showError('Vendor not found');
        return;
    }
    
    const products = db.getAll('products').filter(p => p.vendor_id === id);
    
    let productsHtml = '';
    products.forEach(product => {
        productsHtml += `
            <tr>
                <td>${product.name}</td>
                <td>${product.sku}</td>
                <td>$${product.cost_price.toFixed(2)}</td>
                <td>${product.current_stock}</td>
            </tr>
        `;
    });
    
    Swal.fire({
        title: vendor.name,
        html: `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Contact Person:</strong> ${vendor.contact_person || 'N/A'}</p>
                    <p><strong>Email:</strong> ${vendor.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${vendor.phone || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Tax ID:</strong> ${vendor.tax_id || 'N/A'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <p><strong>Address:</strong> ${vendor.address || 'N/A'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h5>Products Supplied</h5>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Cost Price</th>
                                    <th>Current Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `,
        width: '900px'
    });
}

function editVendor(id) {
    // Similar to showNewVendorModal but with existing data
    Swal.fire('Info', 'Edit functionality would be implemented here', 'info');
}

function deleteVendor(id) {
    // Check if any products are associated with this vendor
    const products = db.getAll('products').filter(p => p.vendor_id === id);
    if (products.length > 0) {
        Swal.fire('Error', 'Cannot delete vendor with associated products', 'error');
        return;
    }
    
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
            db.delete('vendors', id);
            Swal.fire('Deleted!', 'The vendor has been deleted.', 'success');
            loadVendors();
        }
    });
}
