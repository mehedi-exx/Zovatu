// Professional Billing System JavaScript
class ZovatuBillingSystem {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('zovatu_products')) || [];
        this.customers = JSON.parse(localStorage.getItem('zovatu_customers')) || [];
        this.invoices = JSON.parse(localStorage.getItem('zovatu_invoices')) || [];
        this.settings = JSON.parse(localStorage.getItem('zovatu_settings')) || this.getDefaultSettings();
        this.currentBill = [];
        this.currentTab = 'dashboard';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.renderProducts();
        this.renderCustomers();
        this.populateCustomerSelect();
        this.loadSettings();
        this.hideLoading();
    }

    getDefaultSettings() {
        return {
            shopName: 'আপনার দোকানের নাম',
            shopAddress: 'দোকানের ঠিকানা',
            shopPhone: '01XXXXXXXXX',
            shopEmail: 'email@example.com',
            autoPrint: false,
            printSize: 'thermal',
            language: 'bn',
            theme: 'light',
            taxRate: 5
        };
    }

    // Data Management
    saveData() {
        localStorage.setItem('zovatu_products', JSON.stringify(this.products));
        localStorage.setItem('zovatu_customers', JSON.stringify(this.customers));
        localStorage.setItem('zovatu_invoices', JSON.stringify(this.invoices));
        localStorage.setItem('zovatu_settings', JSON.stringify(this.settings));
    }

    loadData() {
        // Load sample data if empty
        if (this.products.length === 0) {
            this.loadSampleData();
        }
    }

    loadSampleData() {
        this.products = [
            {
                id: 'P001',
                name: 'স্যামসাং গ্যালাক্সি A54',
                code: 'SAM-A54-001',
                category: 'মোবাইল ফোন',
                price: 45000,
                stock: 25,
                minStock: 5,
                description: 'স্যামসাং এর জনপ্রিয় স্মার্টফোন',
                createdAt: new Date().toISOString()
            },
            {
                id: 'P002',
                name: 'আইফোন 14',
                code: 'APL-IP14-001',
                category: 'মোবাইল ফোন',
                price: 120000,
                stock: 10,
                minStock: 3,
                description: 'অ্যাপলের সর্বশেষ আইফোন',
                createdAt: new Date().toISOString()
            }
        ];

        this.customers = [
            {
                id: 'C001',
                name: 'মোহাম্মদ রহিম',
                phone: '01712345678',
                email: 'rahim@email.com',
                address: 'ঢাকা, বাংলাদেশ',
                creditLimit: 50000,
                totalPurchase: 0,
                createdAt: new Date().toISOString()
            }
        ];

        this.saveData();
    }

    // Tab Management
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        event.target.classList.add('active');
        
        this.currentTab = tabName;
        
        // Update content based on tab
        switch(tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'products':
                this.renderProducts();
                break;
            case 'customers':
                this.renderCustomers();
                break;
            case 'billing':
                this.populateCustomerSelect();
                break;
            case 'reports':
                this.initializeReports();
                break;
        }
    }

    // Dashboard Functions
    updateDashboard() {
        const today = new Date().toDateString();
        const todayInvoices = this.invoices.filter(inv => 
            new Date(inv.date).toDateString() === today
        );
        
        const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
        
        document.getElementById('todaySales').textContent = `৳${todaySales.toLocaleString()}`;
        document.getElementById('totalProducts').textContent = this.products.length;
        document.getElementById('totalCustomers').textContent = this.customers.length;
        document.getElementById('todayInvoices').textContent = todayInvoices.length;
        
        this.renderSalesChart();
    }

    renderSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        // Get last 7 days data
        const last7Days = [];
        const salesData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            last7Days.push(date.toLocaleDateString('bn-BD', { 
                month: 'short', 
                day: 'numeric' 
            }));
            
            const daySales = this.invoices
                .filter(inv => new Date(inv.date).toDateString() === dateStr)
                .reduce((sum, inv) => sum + inv.total, 0);
            
            salesData.push(daySales);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'বিক্রয় (৳)',
                    data: salesData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '৳' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Product Management
    showAddProductModal() {
        document.getElementById('addProductModal').style.display = 'block';
        document.getElementById('modalProductName').focus();
    }

    addProduct() {
        const name = document.getElementById('modalProductName').value.trim();
        const code = document.getElementById('modalProductCode').value.trim() || 
                    'P' + Date.now().toString().slice(-6);
        const category = document.getElementById('modalProductCategory').value.trim();
        const price = parseFloat(document.getElementById('modalProductPrice').value);
        const stock = parseInt(document.getElementById('modalProductStock').value) || 0;
        const minStock = parseInt(document.getElementById('modalProductMinStock').value) || 5;
        const description = document.getElementById('modalProductDescription').value.trim();

        if (!name || isNaN(price)) {
            this.showToast('অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন', 'error');
            return;
        }

        // Check if product code already exists
        if (this.products.some(p => p.code === code)) {
            this.showToast('এই প্রোডাক্ট কোড ইতিমধ্যে ব্যবহৃত হয়েছে', 'error');
            return;
        }

        const product = {
            id: 'P' + Date.now(),
            name,
            code,
            category,
            price,
            stock,
            minStock,
            description,
            createdAt: new Date().toISOString()
        };

        this.products.push(product);
        this.saveData();
        this.renderProducts();
        this.closeModal('addProductModal');
        this.clearProductForm();
        this.showToast('প্রোডাক্ট সফলভাবে যোগ করা হয়েছে', 'success');
        this.updateDashboard();
    }

    renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.products.forEach(product => {
            const row = document.createElement('tr');
            const stockStatus = product.stock <= product.minStock ? 'low-stock' : 'in-stock';
            const stockText = product.stock <= product.minStock ? 'কম স্টক' : 'স্টক আছে';
            
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.code}</td>
                <td>${product.category || 'N/A'}</td>
                <td>৳${product.price.toLocaleString()}</td>
                <td>${product.stock}</td>
                <td><span class="status ${stockStatus}">${stockText}</span></td>
                <td>
                    <button onclick="billingSystem.editProduct('${product.id}')" class="btn-sm">✏️</button>
                    <button onclick="billingSystem.deleteProduct('${product.id}')" class="btn-sm danger">🗑️</button>
                    <button onclick="billingSystem.generateBarcode('${product.code}')" class="btn-sm">🔖</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    deleteProduct(productId) {
        if (confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি মুছে দিতে চান?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveData();
            this.renderProducts();
            this.showToast('প্রোডাক্ট মুছে দেওয়া হয়েছে', 'info');
            this.updateDashboard();
        }
    }

    filterProducts() {
        const searchTerm = document.getElementById('productSearch').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        const filteredProducts = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.code.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        this.renderFilteredProducts(filteredProducts);
    }

    // Customer Management
    showAddCustomerModal() {
        document.getElementById('addCustomerModal').style.display = 'block';
        document.getElementById('modalCustomerName').focus();
    }

    addCustomer() {
        const name = document.getElementById('modalCustomerName').value.trim();
        const phone = document.getElementById('modalCustomerPhone').value.trim();
        const email = document.getElementById('modalCustomerEmail').value.trim();
        const address = document.getElementById('modalCustomerAddress').value.trim();
        const creditLimit = parseFloat(document.getElementById('modalCustomerCredit').value) || 0;

        if (!name || !phone) {
            this.showToast('অনুগ্রহ করে নাম এবং ফোন নম্বর দিন', 'error');
            return;
        }

        // Check if phone already exists
        if (this.customers.some(c => c.phone === phone)) {
            this.showToast('এই ফোন নম্বর ইতিমধ্যে ব্যবহৃত হয়েছে', 'error');
            return;
        }

        const customer = {
            id: 'C' + Date.now(),
            name,
            phone,
            email,
            address,
            creditLimit,
            totalPurchase: 0,
            createdAt: new Date().toISOString()
        };

        this.customers.push(customer);
        this.saveData();
        this.renderCustomers();
        this.populateCustomerSelect();
        this.closeModal('addCustomerModal');
        this.clearCustomerForm();
        this.showToast('কাস্টমার সফলভাবে যোগ করা হয়েছে', 'success');
        this.updateDashboard();
    }

    renderCustomers() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.address || 'N/A'}</td>
                <td>৳${customer.totalPurchase.toLocaleString()}</td>
                <td>
                    <button onclick="billingSystem.editCustomer('${customer.id}')" class="btn-sm">✏️</button>
                    <button onclick="billingSystem.deleteCustomer('${customer.id}')" class="btn-sm danger">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    deleteCustomer(customerId) {
        if (confirm('আপনি কি নিশ্চিত যে এই কাস্টমারটি মুছে দিতে চান?')) {
            this.customers = this.customers.filter(c => c.id !== customerId);
            this.saveData();
            this.renderCustomers();
            this.populateCustomerSelect();
            this.showToast('কাস্টমার মুছে দেওয়া হয়েছে', 'info');
            this.updateDashboard();
        }
    }

    populateCustomerSelect() {
        const select = document.getElementById('billCustomer');
        if (!select) return;

        select.innerHTML = '<option value="">ওয়াক-ইন কাস্টমার</option>';
        
        this.customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.name} (${customer.phone})`;
            select.appendChild(option);
        });
    }

    // Billing Functions
    searchBillProducts() {
        const searchTerm = document.getElementById('billProductSearch').value.toLowerCase();
        const suggestions = document.getElementById('productSuggestions');
        
        if (searchTerm.length < 2) {
            suggestions.innerHTML = '';
            return;
        }

        const matchedProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.code.toLowerCase().includes(searchTerm)
        );

        suggestions.innerHTML = '';
        matchedProducts.slice(0, 5).forEach(product => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span>${product.name}</span>
                <span>৳${product.price}</span>
                <span>স্টক: ${product.stock}</span>
            `;
            div.onclick = () => this.addToBill(product);
            suggestions.appendChild(div);
        });
    }

    addToBill(product) {
        if (product.stock <= 0) {
            this.showToast('এই প্রোডাক্টের স্টক নেই', 'error');
            return;
        }

        const existingItem = this.currentBill.find(item => item.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
                existingItem.total = existingItem.quantity * existingItem.price;
            } else {
                this.showToast('পর্যাপ্ত স্টক নেই', 'error');
                return;
            }
        } else {
            this.currentBill.push({
                id: product.id,
                name: product.name,
                code: product.code,
                price: product.price,
                quantity: 1,
                total: product.price
            });
        }

        this.renderBillItems();
        this.updateBillTotal();
        document.getElementById('billProductSearch').value = '';
        document.getElementById('productSuggestions').innerHTML = '';
    }

    renderBillItems() {
        const tbody = document.getElementById('billItemsBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.currentBill.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>৳${item.price}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="billingSystem.updateItemQuantity(${index}, this.value)">
                </td>
                <td>৳${item.total.toLocaleString()}</td>
                <td>
                    <button onclick="billingSystem.removeFromBill(${index})" class="btn-sm danger">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateItemQuantity(index, newQuantity) {
        const quantity = parseInt(newQuantity);
        const item = this.currentBill[index];
        const product = this.products.find(p => p.id === item.id);

        if (quantity <= 0) {
            this.removeFromBill(index);
            return;
        }

        if (quantity > product.stock) {
            this.showToast('পর্যাপ্ত স্টক নেই', 'error');
            this.renderBillItems();
            return;
        }

        item.quantity = quantity;
        item.total = item.quantity * item.price;
        this.renderBillItems();
        this.updateBillTotal();
    }

    removeFromBill(index) {
        this.currentBill.splice(index, 1);
        this.renderBillItems();
        this.updateBillTotal();
    }

    updateBillTotal() {
        const subtotal = this.currentBill.reduce((sum, item) => sum + item.total, 0);
        const discount = parseFloat(document.getElementById('billDiscount').value) || 0;
        const tax = (subtotal - discount) * (this.settings.taxRate / 100);
        const total = subtotal - discount + tax;

        document.getElementById('billSubtotal').textContent = `৳${subtotal.toLocaleString()}`;
        document.getElementById('billTax').textContent = `৳${tax.toLocaleString()}`;
        document.getElementById('billTotal').textContent = `৳${total.toLocaleString()}`;
    }

    calculateChange() {
        const total = this.getBillTotal();
        const received = parseFloat(document.getElementById('receivedAmount').value) || 0;
        const change = received - total;
        
        document.getElementById('changeAmount').textContent = `৳${change.toLocaleString()}`;
    }

    getBillTotal() {
        const subtotal = this.currentBill.reduce((sum, item) => sum + item.total, 0);
        const discount = parseFloat(document.getElementById('billDiscount').value) || 0;
        const tax = (subtotal - discount) * (this.settings.taxRate / 100);
        return subtotal - discount + tax;
    }

    generateBill() {
        if (this.currentBill.length === 0) {
            this.showToast('বিলে কোন আইটেম নেই', 'error');
            return;
        }

        const customerId = document.getElementById('billCustomer').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const receivedAmount = parseFloat(document.getElementById('receivedAmount').value) || 0;
        const total = this.getBillTotal();

        if (receivedAmount < total) {
            this.showToast('প্রাপ্ত টাকা বিলের চেয়ে কম', 'error');
            return;
        }

        // Create invoice
        const invoice = {
            id: 'INV' + Date.now(),
            customerId: customerId || null,
            items: [...this.currentBill],
            subtotal: this.currentBill.reduce((sum, item) => sum + item.total, 0),
            discount: parseFloat(document.getElementById('billDiscount').value) || 0,
            tax: (this.currentBill.reduce((sum, item) => sum + item.total, 0) - (parseFloat(document.getElementById('billDiscount').value) || 0)) * (this.settings.taxRate / 100),
            total: total,
            paymentMethod: paymentMethod,
            receivedAmount: receivedAmount,
            changeAmount: receivedAmount - total,
            date: new Date().toISOString(),
            createdBy: authManager.getCurrentUser()?.username || 'Unknown'
        };

        // Update stock
        this.currentBill.forEach(item => {
            const product = this.products.find(p => p.id === item.id);
            if (product) {
                product.stock -= item.quantity;
            }
        });

        // Update customer total purchase
        if (customerId) {
            const customer = this.customers.find(c => c.id === customerId);
            if (customer) {
                customer.totalPurchase += total;
            }
        }

        this.invoices.push(invoice);
        this.saveData();

        // Clear current bill
        this.clearBill();
        
        this.showToast('বিল সফলভাবে তৈরি হয়েছে', 'success');
        this.updateDashboard();

        // Auto print if enabled
        if (this.settings.autoPrint) {
            this.printInvoice(invoice);
        }
    }

    clearBill() {
        this.currentBill = [];
        this.renderBillItems();
        this.updateBillTotal();
        document.getElementById('billCustomer').value = '';
        document.getElementById('billDiscount').value = '0';
        document.getElementById('receivedAmount').value = '';
        document.getElementById('changeAmount').textContent = '৳০';
        document.getElementById('billProductSearch').value = '';
        document.getElementById('productSuggestions').innerHTML = '';
    }

    // Print Functions
    printInvoice(invoice) {
        const printWindow = window.open('', '_blank');
        const printContent = this.generateInvoicePrintContent(invoice);
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    generateInvoicePrintContent(invoice) {
        const customer = invoice.customerId ? 
            this.customers.find(c => c.id === invoice.customerId) : null;
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${invoice.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .invoice-details { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; }
                    .footer { margin-top: 20px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${this.settings.shopName}</h2>
                    <p>${this.settings.shopAddress}</p>
                    <p>ফোন: ${this.settings.shopPhone} | ইমেইল: ${this.settings.shopEmail}</p>
                </div>
                
                <div class="invoice-details">
                    <p><strong>ইনভয়েস নং:</strong> ${invoice.id}</p>
                    <p><strong>তারিখ:</strong> ${new Date(invoice.date).toLocaleDateString('bn-BD')}</p>
                    ${customer ? `<p><strong>কাস্টমার:</strong> ${customer.name} (${customer.phone})</p>` : ''}
                    <p><strong>পেমেন্ট মেথড:</strong> ${invoice.paymentMethod}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>আইটেম</th>
                            <th>মূল্য</th>
                            <th>পরিমাণ</th>
                            <th>মোট</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>৳${item.price}</td>
                                <td>${item.quantity}</td>
                                <td>৳${item.total}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 20px;">
                    <p><strong>সাবটোটাল:</strong> ৳${invoice.subtotal}</p>
                    <p><strong>ডিসকাউন্ট:</strong> ৳${invoice.discount}</p>
                    <p><strong>ট্যাক্স:</strong> ৳${invoice.tax}</p>
                    <p class="total"><strong>মোট:</strong> ৳${invoice.total}</p>
                    <p><strong>প্রাপ্ত:</strong> ৳${invoice.receivedAmount}</p>
                    <p><strong>ফেরত:</strong> ৳${invoice.changeAmount}</p>
                </div>
                
                <div class="footer">
                    <p>ধন্যবাদ! আবার আসবেন।</p>
                </div>
            </body>
            </html>
        `;
    }

    // Barcode Generation
    generateBarcode(code) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>বারকোড - ${code}</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <svg id="barcode-${code}"></svg>
                    <br><br>
                    <button onclick="billingSystem.printBarcode('${code}')" class="primary-btn">🖨️ প্রিন্ট</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Generate barcode
        JsBarcode(`#barcode-${code}`, code, {
            format: "CODE128",
            width: 2,
            height: 100,
            displayValue: true
        });
    }

    printBarcode(code) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Barcode - ${code}</title>
                <style>
                    body { text-align: center; margin: 20px; }
                </style>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            </head>
            <body>
                <svg id="barcode"></svg>
                <script>
                    JsBarcode("#barcode", "${code}", {
                        format: "CODE128",
                        width: 2,
                        height: 100,
                        displayValue: true
                    });
                    window.print();
                </script>
            </body>
            </html>
        `);
    }

    // Settings Management
    loadSettings() {
        document.getElementById('shopName').value = this.settings.shopName;
        document.getElementById('shopAddress').value = this.settings.shopAddress;
        document.getElementById('shopPhone').value = this.settings.shopPhone;
        document.getElementById('shopEmail').value = this.settings.shopEmail;
        document.getElementById('autoPrint').checked = this.settings.autoPrint;
        document.getElementById('printSize').value = this.settings.printSize;
        document.getElementById('language').value = this.settings.language;
        document.getElementById('theme').value = this.settings.theme;
    }

    saveSettings() {
        this.settings = {
            shopName: document.getElementById('shopName').value,
            shopAddress: document.getElementById('shopAddress').value,
            shopPhone: document.getElementById('shopPhone').value,
            shopEmail: document.getElementById('shopEmail').value,
            autoPrint: document.getElementById('autoPrint').checked,
            printSize: document.getElementById('printSize').value,
            language: document.getElementById('language').value,
            theme: document.getElementById('theme').value,
            taxRate: this.settings.taxRate
        };

        this.saveData();
        this.showToast('সেটিংস সেভ করা হয়েছে', 'success');
    }

    // Data Export/Import
    exportData() {
        const data = {
            products: this.products,
            customers: this.customers,
            invoices: this.invoices,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zovatu-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('ডাটা এক্সপোর্ট সম্পন্ন', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (confirm('এটি বর্তমান সব ডাটা প্রতিস্থাপন করবে। আপনি কি নিশ্চিত?')) {
                        this.products = data.products || [];
                        this.customers = data.customers || [];
                        this.invoices = data.invoices || [];
                        this.settings = data.settings || this.getDefaultSettings();
                        
                        this.saveData();
                        this.init();
                        this.showToast('ডাটা ইমপোর্ট সম্পন্ন', 'success');
                    }
                } catch (error) {
                    this.showToast('ভুল ফাইল ফরম্যাট', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    clearAllData() {
        if (confirm('আপনি কি নিশ্চিত যে সব ডাটা মুছে দিতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।')) {
            localStorage.removeItem('zovatu_products');
            localStorage.removeItem('zovatu_customers');
            localStorage.removeItem('zovatu_invoices');
            localStorage.removeItem('zovatu_settings');
            
            this.products = [];
            this.customers = [];
            this.invoices = [];
            this.settings = this.getDefaultSettings();
            
            this.init();
            this.showToast('সব ডাটা মুছে দেওয়া হয়েছে', 'info');
        }
    }

    // Modal Management
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    clearProductForm() {
        document.getElementById('modalProductName').value = '';
        document.getElementById('modalProductCode').value = '';
        document.getElementById('modalProductCategory').value = '';
        document.getElementById('modalProductPrice').value = '';
        document.getElementById('modalProductStock').value = '0';
        document.getElementById('modalProductMinStock').value = '5';
        document.getElementById('modalProductDescription').value = '';
    }

    clearCustomerForm() {
        document.getElementById('modalCustomerName').value = '';
        document.getElementById('modalCustomerPhone').value = '';
        document.getElementById('modalCustomerEmail').value = '';
        document.getElementById('modalCustomerAddress').value = '';
        document.getElementById('modalCustomerCredit').value = '0';
    }

    // Event Listeners
    setupEventListeners() {
        // Close modals when clicking outside
        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        };

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.textContent.split(' ')[1];
                const tabMap = {
                    'ড্যাশবোর্ড': 'dashboard',
                    'প্রোডাক্ট': 'products',
                    'কাস্টমার': 'customers',
                    'বিলিং': 'billing',
                    'রিপোর্ট': 'reports',
                    'সেটিংস': 'settings'
                };
                this.showTab(tabMap[tabName] || 'dashboard');
            });
        });
    }

    // Utility Functions
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast toast-${type} show`;
        
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// Global functions for HTML onclick events
window.showTab = (tabName) => billingSystem.showTab(tabName);
window.showAddProductModal = () => billingSystem.showAddProductModal();
window.showAddCustomerModal = () => billingSystem.showAddCustomerModal();
window.addProduct = () => billingSystem.addProduct();
window.addCustomer = () => billingSystem.addCustomer();
window.closeModal = (modalId) => billingSystem.closeModal(modalId);
window.clearBill = () => billingSystem.clearBill();
window.generateBill = () => billingSystem.generateBill();
window.saveBill = () => billingSystem.generateBill();
window.printBill = () => {
    if (billingSystem.currentBill.length > 0) {
        billingSystem.showToast('প্রথমে বিল তৈরি করুন', 'error');
    }
};
window.updateBillTotal = () => billingSystem.updateBillTotal();
window.calculateChange = () => billingSystem.calculateChange();
window.searchBillProducts = () => billingSystem.searchBillProducts();
window.filterProducts = () => billingSystem.filterProducts();
window.filterCustomers = () => billingSystem.filterCustomers();
window.saveSettings = () => billingSystem.saveSettings();
window.resetSettings = () => billingSystem.loadSettings();
window.exportData = () => billingSystem.exportData();
window.importData = () => billingSystem.importData();
window.clearAllData = () => billingSystem.clearAllData();

// Initialize the billing system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.billingSystem = new ZovatuBillingSystem();
});

