// Inventory Module
function loadProducts() {
    const tableBody = document.querySelector('#productsTable tbody');
    tableBody.innerHTML = '';
    
    const products = db.getAll('products');
    const vendors = db.getAll('vendors');
    
    products.forEach(product => {
        const vendor = vendors.find(v => v.id === product.vendor_id);
        const stockClass = product.current_stock <= product.min_stock_level ? 'text-danger fw-bold' : '';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.sku}</td>
            <td>${product.category}</td>
            <td>$${product.cost_price.toFixed(2)}</td>
            <td>$${product.selling_price.toFixed(2)}</td>
            <td class="${stockClass}">${product.current_stock}</td>
            <td>${product.min_stock_level}</td>
            <td>${vendor ? vendor.name : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewProduct(${product.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showNewProductModal() {
    const vendors = db.getAll('vendors');
    let vendorOptions = vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    
    Swal.fire({
        title: 'Add New Product',
        html: `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Product Name</label>
                        <input type="text" class="form-control" id="productName" required>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">SKU</label>
                        <input type="text" class="form-control" id="productSku" required>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Barcode</label>
                        <input type="text" class="form-control" id="productBarcode">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Category</label>
                        <input type="text" class="form-control" id="productCategory">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Cost Price</label>
                        <input type="number" class="form-control" id="productCost" min="0" step="0.01" required>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Selling Price</label>
                        <input type="number" class="form-control" id="productPrice" min="0" step="0.01" required>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Vendor</label>
                        <select class="form-select" id="productVendor">
                            <option value="">Select Vendor</option>
                            ${vendorOptions}
                        </select>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Current Stock</label>
                        <input type="number" class="form-control" id="productStock" min="0" value="0">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Minimum Stock Level</label>
                        <input type="number" class="form-control" id="productMinStock" min="0" value="5">
                    </div>
                </div>
            </div>
        `,
        width: '800px',
        showCancelButton: true,
        confirmButtonText: 'Save Product',
        preConfirm: () => {
            const name = document.getElementById('productName').value;
            const sku = document.getElementById('productSku').value;
            const barcode = document.getElementById('productBarcode').value;
            const category = document.getElementById('productCategory').value;
            const costPrice = parseFloat(document.getElementById('productCost').value);
            const sellingPrice = parseFloat(document.getElementById('productPrice').value);
            const vendorId = parseInt(document.getElementById('productVendor').value) || null;
            const currentStock = parseInt(document.getElementById('productStock').value) || 0;
            const minStockLevel = parseInt(document.getElementById('productMinStock').value) || 0;
            
            if (!name || !sku || isNaN(costPrice) || isNaN(sellingPrice)) {
                showError('Please fill in all required fields');
                return false;
            }
            
            const newProduct = {
                name,
                sku,
                barcode,
                category,
                cost_price: costPrice,
                selling_price: sellingPrice,
                vendor_id: vendorId,
                current_stock: currentStock,
                min_stock_level: minStockLevel
            };
            
            db.create('products', newProduct);
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Product added successfully.', 'success');
            loadProducts();
            updateDashboardStats();
        }
    });
}

function viewProduct(id) {
    const product = db.getById('products', id);
    if (!product) {
        showError('Product not found');
        return;
    }
    
    const vendor = product.vendor_id ? db.getById('vendors', product.vendor_id) : null;
    
    Swal.fire({
        title: product.name,
        html: `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>SKU:</strong> ${product.sku}</p>
                    <p><strong>Barcode:</strong> ${product.barcode || 'N/A'}</p>
                    <p><strong>Category:</strong> ${product.category || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Cost Price:</strong> $${product.cost_price.toFixed(2)}</p>
                    <p><strong>Selling Price:</strong> $${product.selling_price.toFixed(2)}</p>
                    <p><strong>Vendor:</strong> ${vendor ? vendor.name : 'N/A'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <p><strong>Current Stock:</strong> ${product.current_stock}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Minimum Stock Level:</strong> ${product.min_stock_level}</p>
                </div>
            </div>
        `,
        width: '700px'
    });
}

function editProduct(id) {
    // Similar to showNewProductModal but with existing data
    Swal.fire('Info', 'Edit functionality would be implemented here', 'info');
}

function deleteProduct(id) {
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
            db.delete('products', id);
            Swal.fire('Deleted!', 'The product has been deleted.', 'success');
            loadProducts();
            updateDashboardStats();
        }
    });
}

function showStockAdjustmentModal() {
    const products = db.getAll('products');
    let productOptions = products.map(p => `<option value="${p.id}">${p.name} (Current: ${p.current_stock})</option>`).join('');
    
    Swal.fire({
        title: 'Stock Adjustment',
        html: `
            <div class="mb-3">
                <label class="form-label">Product</label>
                <select class="form-select" id="adjustProduct" required>
                    <option value="">Select Product</option>
                    ${productOptions}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Adjustment Type</label>
                <select class="form-select" id="adjustType" required>
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                    <option value="set">Set Stock</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-control" id="adjustQty" min="1" value="1" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Reason</label>
                <textarea class="form-control" id="adjustReason" rows="3"></textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Apply Adjustment',
        preConfirm: () => {
            const productId = parseInt(document.getElementById('adjustProduct').value);
            const adjustType = document.getElementById('adjustType').value;
            const quantity = parseInt(document.getElementById('adjustQty').value);
            const reason = document.getElementById('adjustReason').value;
            
            if (!productId || isNaN(quantity) || quantity < 1) {
                showError('Please fill in all required fields');
                return false;
            }
            
            const product = db.getById('products', productId);
            if (!product) {
                showError('Product not found');
                return false;
            }
            
            let newStock = product.current_stock;
            
            switch(adjustType) {
                case 'add':
                    newStock += quantity;
                    break;
                case 'remove':
                    newStock -= quantity;
                    break;
                case 'set':
                    newStock = quantity;
                    break;
            }
            
            if (newStock < 0) {
                showError('Stock cannot be negative');
                return false;
            }
            
            db.update('products', productId, { current_stock: newStock });
            
            // Record the adjustment (in a real app, you might have an adjustments table)
            const adjustment = {
                product_id: productId,
                type: adjustType,
                quantity,
                new_quantity: newStock,
                reason,
                date: new Date().toISOString().split('T')[0],
                user: JSON.parse(localStorage.getItem('currentUser')).username
            };
            
            // In a real app, you would save this to an adjustments table
            console.log('Stock adjustment recorded:', adjustment);
            
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Stock adjusted successfully.', 'success');
            loadProducts();
            updateDashboardStats();
        }
    });
}
