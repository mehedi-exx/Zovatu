// Enhanced Zovatu Billing System
// Data Storage Keys
const STORAGE_KEYS = {
  PRODUCTS: 'zovatu_products',
  CUSTOMERS: 'zovatu_customers',
  INVOICES: 'zovatu_invoices',
  SETTINGS: 'zovatu_settings',
  SALES_HISTORY: 'zovatu_sales_history'
};

// Global Variables
let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [];
let customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
let invoices = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES)) || [];
let currentInvoice = {
  id: '',
  customerId: '',
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  paymentStatus: 'pending',
  paymentMethod: 'cash',
  createdAt: ''
};

// Utility Functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount) {
  return `৳${amount.toFixed(2)}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('bn-BD');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Toast styles
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 5px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  // Type-specific colors
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  };
  
  toast.style.backgroundColor = colors[type] || colors.info;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

// Product Management Functions
function addProduct() {
  const name = document.getElementById('newProductName').value.trim();
  const code = document.getElementById('newProductCode').value.trim() || generateId();
  const price = parseFloat(document.getElementById('newProductPrice').value);
  const category = document.getElementById('newProductCategory').value.trim() || 'General';
  const stock = parseInt(document.getElementById('newProductStock').value) || 0;
  const minStock = parseInt(document.getElementById('newProductMinStock').value) || 5;

  if (!name || isNaN(price) || price <= 0) {
    showToast('অনুগ্রহ করে সঠিক প্রোডাক্ট তথ্য প্রদান করুন', 'error');
    return;
  }

  // Check if product code already exists
  if (products.find(p => p.code === code)) {
    showToast('এই প্রোডাক্ট কোড ইতিমধ্যে বিদ্যমান', 'error');
    return;
  }

  const product = {
    id: generateId(),
    name,
    code,
    price,
    category,
    stock,
    minStock,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  products.push(product);
  saveData();
  renderProducts();
  clearProductForm();
  generateAutoBarcode(code);
  showToast('প্রোডাক্ট সফলভাবে যোগ করা হয়েছে', 'success');
}

function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById('newProductName').value = product.name;
  document.getElementById('newProductCode').value = product.code;
  document.getElementById('newProductPrice').value = product.price;
  document.getElementById('newProductCategory').value = product.category;
  document.getElementById('newProductStock').value = product.stock;
  document.getElementById('newProductMinStock').value = product.minStock;

  // Change add button to update button
  const addBtn = document.querySelector('#product-section button');
  addBtn.textContent = '🔄 Update Product';
  addBtn.onclick = () => updateProduct(id);
}

function updateProduct(id) {
  const name = document.getElementById('newProductName').value.trim();
  const code = document.getElementById('newProductCode').value.trim();
  const price = parseFloat(document.getElementById('newProductPrice').value);
  const category = document.getElementById('newProductCategory').value.trim();
  const stock = parseInt(document.getElementById('newProductStock').value);
  const minStock = parseInt(document.getElementById('newProductMinStock').value);

  if (!name || isNaN(price) || price <= 0) {
    showToast('অনুগ্রহ করে সঠিক প্রোডাক্ট তথ্য প্রদান করুন', 'error');
    return;
  }

  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) return;

  products[productIndex] = {
    ...products[productIndex],
    name,
    code,
    price,
    category,
    stock,
    minStock,
    updatedAt: new Date().toISOString()
  };

  saveData();
  renderProducts();
  clearProductForm();
  resetAddButton();
  showToast('প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে', 'success');
}

function deleteProduct(id) {
  if (!confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি মুছে ফেলতে চান?')) return;

  products = products.filter(p => p.id !== id);
  saveData();
  renderProducts();
  showToast('প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে', 'success');
}

function clearProductForm() {
  document.getElementById('newProductName').value = '';
  document.getElementById('newProductCode').value = '';
  document.getElementById('newProductPrice').value = '';
  document.getElementById('newProductCategory').value = '';
  document.getElementById('newProductStock').value = '';
  document.getElementById('newProductMinStock').value = '';
}

function resetAddButton() {
  const addBtn = document.querySelector('#product-section button');
  addBtn.textContent = '➕ Add Product';
  addBtn.onclick = addProduct;
}

function renderProducts() {
  const list = document.getElementById('productList');
  if (!list) return;

  list.innerHTML = '';

  if (products.length === 0) {
    list.innerHTML = '<p class="no-data">কোন প্রোডাক্ট পাওয়া যায়নি</p>';
    return;
  }

  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product-item';
    
    const lowStock = product.stock <= product.minStock;
    const stockClass = lowStock ? 'low-stock' : 'normal-stock';
    
    div.innerHTML = `
      <div class="product-info">
        <h4>${product.name}</h4>
        <p>কোড: ${product.code} | ক্যাটাগরি: ${product.category}</p>
        <p>মূল্য: ${formatCurrency(product.price)}</p>
        <p class="${stockClass}">স্টক: ${product.stock} ${lowStock ? '(কম স্টক!)' : ''}</p>
      </div>
      <div class="product-actions">
        <button onclick="addToInvoice('${product.id}')" class="btn-add">➕ যোগ করুন</button>
        <button onclick="editProduct('${product.id}')" class="btn-edit">✏️ সম্পাদনা</button>
        <button onclick="deleteProduct('${product.id}')" class="btn-delete">🗑️ মুছুন</button>
      </div>
    `;
    
    list.appendChild(div);
  });
}

// Customer Management Functions
function addCustomer() {
  const name = document.getElementById('newCustomerName').value.trim();
  const phone = document.getElementById('newCustomerPhone').value.trim();
  const email = document.getElementById('newCustomerEmail').value.trim();
  const address = document.getElementById('newCustomerAddress').value.trim();

  if (!name || !phone) {
    showToast('নাম এবং ফোন নম্বর আবশ্যক', 'error');
    return;
  }

  // Check if customer already exists
  if (customers.find(c => c.phone === phone)) {
    showToast('এই ফোন নম্বর দিয়ে ইতিমধ্যে একজন কাস্টমার রয়েছে', 'error');
    return;
  }

  const customer = {
    id: generateId(),
    name,
    phone,
    email,
    address,
    creditLimit: 0,
    currentBalance: 0,
    loyaltyPoints: 0,
    createdAt: new Date().toISOString()
  };

  customers.push(customer);
  saveData();
  renderCustomers();
  clearCustomerForm();
  showToast('কাস্টমার সফলভাবে যোগ করা হয়েছে', 'success');
}

function renderCustomers() {
  const list = document.getElementById('customerList');
  if (!list) return;

  list.innerHTML = '';

  if (customers.length === 0) {
    list.innerHTML = '<p class="no-data">কোন কাস্টমার পাওয়া যায়নি</p>';
    return;
  }

  customers.forEach(customer => {
    const div = document.createElement('div');
    div.className = 'customer-item';
    
    div.innerHTML = `
      <div class="customer-info">
        <h4>${customer.name}</h4>
        <p>ফোন: ${customer.phone}</p>
        <p>ইমেইল: ${customer.email || 'N/A'}</p>
        <p>ব্যালেন্স: ${formatCurrency(customer.currentBalance)}</p>
      </div>
      <div class="customer-actions">
        <button onclick="selectCustomer('${customer.id}')" class="btn-select">নির্বাচন করুন</button>
        <button onclick="deleteCustomer('${customer.id}')" class="btn-delete">🗑️ মুছুন</button>
      </div>
    `;
    
    list.appendChild(div);
  });
}

function selectCustomer(id) {
  const customer = customers.find(c => c.id === id);
  if (!customer) return;

  currentInvoice.customerId = id;
  document.getElementById('selectedCustomer').textContent = customer.name;
  showToast(`কাস্টমার নির্বাচিত: ${customer.name}`, 'success');
}

function clearCustomerForm() {
  document.getElementById('newCustomerName').value = '';
  document.getElementById('newCustomerPhone').value = '';
  document.getElementById('newCustomerEmail').value = '';
  document.getElementById('newCustomerAddress').value = '';
}

function deleteCustomer(id) {
  if (!confirm('আপনি কি নিশ্চিত যে এই কাস্টমারটি মুছে ফেলতে চান?')) return;

  customers = customers.filter(c => c.id !== id);
  saveData();
  renderCustomers();
  showToast('কাস্টমার সফলভাবে মুছে ফেলা হয়েছে', 'success');
}

// Invoice Management Functions
function addToInvoice(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    showToast('এই প্রোডাক্টটি স্টকে নেই', 'error');
    return;
  }

  // Check if product already in invoice
  const existingItem = currentInvoice.items.find(item => item.productId === productId);
  
  if (existingItem) {
    if (existingItem.quantity >= product.stock) {
      showToast('পর্যাপ্ত স্টক নেই', 'error');
      return;
    }
    existingItem.quantity++;
  } else {
    currentInvoice.items.push({
      productId: productId,
      productName: product.name,
      productCode: product.code,
      price: product.price,
      quantity: 1,
      discount: 0
    });
  }

  calculateInvoiceTotal();
  renderInvoice();
  showToast(`${product.name} ইনভয়েসে যোগ করা হয়েছে`, 'success');
}

function removeFromInvoice(productId) {
  currentInvoice.items = currentInvoice.items.filter(item => item.productId !== productId);
  calculateInvoiceTotal();
  renderInvoice();
  showToast('আইটেম ইনভয়েস থেকে সরানো হয়েছে', 'success');
}

function updateQuantity(productId, quantity) {
  const item = currentInvoice.items.find(item => item.productId === productId);
  const product = products.find(p => p.id === productId);
  
  if (!item || !product) return;

  if (quantity <= 0) {
    removeFromInvoice(productId);
    return;
  }

  if (quantity > product.stock) {
    showToast('পর্যাপ্ত স্টক নেই', 'error');
    return;
  }

  item.quantity = quantity;
  calculateInvoiceTotal();
  renderInvoice();
}

function calculateInvoiceTotal() {
  currentInvoice.subtotal = currentInvoice.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity - item.discount);
  }, 0);

  currentInvoice.tax = currentInvoice.subtotal * 0.05; // 5% tax
  currentInvoice.total = currentInvoice.subtotal + currentInvoice.tax - currentInvoice.discount;
}

function renderInvoice() {
  const table = document.getElementById('invoiceTable');
  if (!table) return;

  if (currentInvoice.items.length === 0) {
    table.innerHTML = '<tr><td colspan="6" class="no-data">ইনভয়েসে কোন আইটেম নেই</td></tr>';
    document.getElementById('totalAmount').textContent = '0';
    return;
  }

  let html = `
    <tr>
      <th>প্রোডাক্ট</th>
      <th>কোড</th>
      <th>মূল্য</th>
      <th>পরিমাণ</th>
      <th>মোট</th>
      <th>অ্যাকশন</th>
    </tr>
  `;

  currentInvoice.items.forEach(item => {
    const itemTotal = item.price * item.quantity - item.discount;
    html += `
      <tr>
        <td>${item.productName}</td>
        <td>${item.productCode}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>
          <input type="number" value="${item.quantity}" min="1" 
                 onchange="updateQuantity('${item.productId}', this.value)"
                 class="quantity-input">
        </td>
        <td>${formatCurrency(itemTotal)}</td>
        <td>
          <button onclick="removeFromInvoice('${item.productId}')" class="btn-remove">🗑️</button>
        </td>
      </tr>
    `;
  });

  table.innerHTML = html;
  document.getElementById('totalAmount').textContent = currentInvoice.total.toFixed(2);
}

function generateInvoice() {
  if (currentInvoice.items.length === 0) {
    showToast('ইনভয়েসে কোন আইটেম নেই', 'error');
    return;
  }

  currentInvoice.id = 'INV-' + Date.now();
  currentInvoice.createdAt = new Date().toISOString();
  currentInvoice.paymentStatus = 'paid';

  // Update product stock
  currentInvoice.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });

  // Save invoice
  invoices.push({...currentInvoice});
  
  // Reset current invoice
  currentInvoice = {
    id: '',
    customerId: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    createdAt: ''
  };

  saveData();
  renderInvoice();
  renderProducts();
  showToast('ইনভয়েস সফলভাবে তৈরি হয়েছে', 'success');
}

// Data Management Functions
function saveData() {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
}

function backupData() {
  const data = {
    products,
    customers,
    invoices,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zovatu-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('ডাটা ব্যাকআপ সফল', 'success');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.products) products = data.products;
      if (data.customers) customers = data.customers;
      if (data.invoices) invoices = data.invoices;
      
      saveData();
      renderProducts();
      renderCustomers();
      showToast('ডাটা সফলভাবে ইমপোর্ট করা হয়েছে', 'success');
    } catch (error) {
      showToast('ভুল ফাইল ফরম্যাট', 'error');
    }
  };
  reader.readAsText(file);
}

// Barcode Functions
function generateAutoBarcode(code) {
  try {
    JsBarcode("#autoBarcode", code, { 
      format: "CODE128",
      width: 2,
      height: 100,
      displayValue: true
    });
  } catch (error) {
    console.error('Barcode generation error:', error);
  }
}

function printAutoBarcode() {
  const barcodeElement = document.getElementById("autoBarcode");
  if (!barcodeElement) return;

  const printWindow = window.open('', '', 'width=600,height=400');
  printWindow.document.write(`
    <html>
      <head><title>Barcode Print</title></head>
      <body style="text-align: center; padding: 20px;">
        ${barcodeElement.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
}

// Print Invoice Function
function printInvoice() {
  if (currentInvoice.items.length === 0) {
    showToast('প্রিন্ট করার জন্য কোন আইটেম নেই', 'error');
    return;
  }

  const customer = customers.find(c => c.id === currentInvoice.customerId);
  const customerName = customer ? customer.name : 'Walk-in Customer';

  let invoiceHTML = `
    <html>
      <head>
        <title>Invoice - ${currentInvoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .invoice-details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-section { margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🧾 Zovatu Invoice</h2>
          <p>Invoice ID: ${currentInvoice.id}</p>
          <p>Date: ${formatDate(new Date())}</p>
        </div>
        
        <div class="invoice-details">
          <p><strong>Customer:</strong> ${customerName}</p>
        </div>
        
        <table>
          <tr>
            <th>Product</th>
            <th>Code</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
  `;

  currentInvoice.items.forEach(item => {
    const itemTotal = item.price * item.quantity - item.discount;
    invoiceHTML += `
      <tr>
        <td>${item.productName}</td>
        <td>${item.productCode}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(itemTotal)}</td>
      </tr>
    `;
  });

  invoiceHTML += `
        </table>
        
        <div class="total-section">
          <p><strong>Subtotal: ${formatCurrency(currentInvoice.subtotal)}</strong></p>
          <p><strong>Tax (5%): ${formatCurrency(currentInvoice.tax)}</strong></p>
          <p><strong>Discount: ${formatCurrency(currentInvoice.discount)}</strong></p>
          <h3>Total: ${formatCurrency(currentInvoice.total)}</h3>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>Thank you for your business!</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
}

// Initialize the application
function initializeApp() {
  renderProducts();
  renderCustomers();
  renderInvoice();
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// Load the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

