/**
 * Zovatu Pro - Advanced Billing System
 * Handles all billing operations including POS, barcode scanning, and invoice generation
 */

class ZovatuBilling {
    constructor() {
        this.currentBill = {
            id: null,
            items: [],
            customer: null,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0,
            paid: 0,
            change: 0,
            notes: ''
        };
        
        this.settings = zovatuStorage.getItem('settings') || {};
        this.products = zovatuStorage.getItem('products') || [];
        this.customers = zovatuStorage.getItem('customers') || [];
        
        this.isScanning = false;
        this.scannerActive = false;
        
        this.init();
    }

    /**
     * Initialize billing system
     */
    init() {
        this.createBillingInterface();
        this.setupEventListeners();
        this.loadRecentBills();
        this.resetBill();
    }

    /**
     * Create billing interface
     */
    createBillingInterface() {
        const billingPage = document.getElementById('billingPage');
        if (!billingPage) return;

        billingPage.innerHTML = `
            <div class="billing-container">
                <!-- Billing Header -->
                <div class="billing-header">
                    <div class="billing-header-left">
                        <h2>Point of Sale</h2>
                        <div class="bill-info">
                            <span class="bill-number">Bill #<span id="currentBillNumber">NEW</span></span>
                            <span class="bill-date">${ZovatuUtils.formatDate(new Date())}</span>
                        </div>
                    </div>
                    <div class="billing-header-right">
                        <button class="btn btn-outline" id="holdBillBtn">
                            <i class="fas fa-pause"></i>
                            Hold Bill
                        </button>
                        <button class="btn btn-outline" id="recallBillBtn">
                            <i class="fas fa-history"></i>
                            Recall Bill
                        </button>
                        <button class="btn btn-error" id="clearBillBtn">
                            <i class="fas fa-trash"></i>
                            Clear All
                        </button>
                    </div>
                </div>

                <div class="billing-content">
                    <!-- Left Panel - Product Search & Scanner -->
                    <div class="billing-left-panel">
                        <!-- Product Search -->
                        <div class="product-search-section">
                            <div class="search-header">
                                <h3>Add Products</h3>
                                <button class="btn btn-sm btn-primary" id="toggleScannerBtn">
                                    <i class="fas fa-barcode"></i>
                                    Scanner
                                </button>
                            </div>
                            
                            <!-- Barcode Scanner -->
                            <div class="scanner-section hidden" id="scannerSection">
                                <div class="scanner-container">
                                    <video id="scannerVideo" autoplay></video>
                                    <div class="scanner-overlay">
                                        <div class="scanner-line"></div>
                                    </div>
                                </div>
                                <div class="scanner-controls">
                                    <button class="btn btn-success" id="startScannerBtn">Start Scanner</button>
                                    <button class="btn btn-error" id="stopScannerBtn">Stop Scanner</button>
                                </div>
                                <div class="scanner-status" id="scannerStatus">
                                    Scanner ready
                                </div>
                            </div>

                            <!-- Manual Search -->
                            <div class="manual-search">
                                <div class="search-input-group">
                                    <input type="text" id="productSearchInput" placeholder="Search by name, barcode, or scan..." class="search-input">
                                    <button class="search-btn" id="searchProductBtn">
                                        <i class="fas fa-search"></i>
                                    </button>
                                </div>
                                
                                <!-- Quick Add by Barcode -->
                                <div class="quick-barcode-input">
                                    <input type="text" id="barcodeInput" placeholder="Enter barcode manually" class="barcode-input">
                                    <button class="btn btn-primary" id="addByBarcodeBtn">Add</button>
                                </div>
                            </div>

                            <!-- Product Results -->
                            <div class="product-results" id="productResults">
                                <!-- Products will be displayed here -->
                            </div>
                        </div>

                        <!-- Quick Categories -->
                        <div class="quick-categories">
                            <h4>Quick Categories</h4>
                            <div class="category-buttons" id="categoryButtons">
                                <!-- Category buttons will be generated here -->
                            </div>
                        </div>

                        <!-- Recent Products -->
                        <div class="recent-products">
                            <h4>Recent Products</h4>
                            <div class="recent-products-list" id="recentProductsList">
                                <!-- Recent products will be displayed here -->
                            </div>
                        </div>
                    </div>

                    <!-- Center Panel - Bill Items -->
                    <div class="billing-center-panel">
                        <div class="bill-items-section">
                            <div class="bill-items-header">
                                <h3>Bill Items</h3>
                                <span class="items-count">0 items</span>
                            </div>
                            
                            <div class="bill-items-table">
                                <div class="bill-items-header-row">
                                    <div class="item-name">Product</div>
                                    <div class="item-price">Price</div>
                                    <div class="item-qty">Qty</div>
                                    <div class="item-total">Total</div>
                                    <div class="item-actions">Actions</div>
                                </div>
                                
                                <div class="bill-items-body" id="billItemsBody">
                                    <div class="empty-bill">
                                        <i class="fas fa-shopping-cart"></i>
                                        <p>No items added yet</p>
                                        <small>Search and add products to start billing</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Bill Summary & Payment -->
                    <div class="billing-right-panel">
                        <!-- Customer Selection -->
                        <div class="customer-section">
                            <h4>Customer</h4>
                            <div class="customer-selector">
                                <select id="customerSelect" class="customer-select">
                                    <option value="">Walk-in Customer</option>
                                </select>
                                <button class="btn btn-sm btn-outline" id="addCustomerBtn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Bill Summary -->
                        <div class="bill-summary">
                            <h4>Bill Summary</h4>
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span id="billSubtotal">${this.settings.currencySymbol || '৳'}0.00</span>
                            </div>
                            <div class="summary-row">
                                <span>Tax (${this.settings.taxRate || 0}%):</span>
                                <span id="billTax">${this.settings.currencySymbol || '৳'}0.00</span>
                            </div>
                            <div class="summary-row discount-row">
                                <span>Discount:</span>
                                <div class="discount-input">
                                    <input type="number" id="discountInput" placeholder="0" min="0" step="0.01">
                                    <select id="discountType">
                                        <option value="amount">৳</option>
                                        <option value="percent">%</option>
                                    </select>
                                </div>
                            </div>
                            <div class="summary-row total-row">
                                <span>Total:</span>
                                <span id="billTotal">${this.settings.currencySymbol || '৳'}0.00</span>
                            </div>
                        </div>

                        <!-- Payment Section -->
                        <div class="payment-section">
                            <h4>Payment</h4>
                            <div class="payment-methods">
                                <button class="payment-method active" data-method="cash">
                                    <i class="fas fa-money-bill"></i>
                                    Cash
                                </button>
                                <button class="payment-method" data-method="card">
                                    <i class="fas fa-credit-card"></i>
                                    Card
                                </button>
                                <button class="payment-method" data-method="mobile">
                                    <i class="fas fa-mobile-alt"></i>
                                    Mobile
                                </button>
                            </div>
                            
                            <div class="payment-input">
                                <label>Amount Paid</label>
                                <input type="number" id="paidAmountInput" placeholder="0.00" min="0" step="0.01">
                            </div>
                            
                            <div class="change-display">
                                <span>Change:</span>
                                <span id="changeAmount">${this.settings.currencySymbol || '৳'}0.00</span>
                            </div>
                            
                            <!-- Quick Payment Buttons -->
                            <div class="quick-payment-buttons">
                                <button class="quick-pay-btn" data-amount="exact">Exact</button>
                                <button class="quick-pay-btn" data-amount="50">৳50</button>
                                <button class="quick-pay-btn" data-amount="100">৳100</button>
                                <button class="quick-pay-btn" data-amount="500">৳500</button>
                                <button class="quick-pay-btn" data-amount="1000">৳1000</button>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="billing-actions">
                            <button class="btn btn-lg btn-success" id="completeBillBtn" disabled>
                                <i class="fas fa-check"></i>
                                Complete Sale
                            </button>
                            <button class="btn btn-lg btn-outline" id="printBillBtn" disabled>
                                <i class="fas fa-print"></i>
                                Print Bill
                            </button>
                        </div>

                        <!-- Notes -->
                        <div class="bill-notes">
                            <label>Notes</label>
                            <textarea id="billNotes" placeholder="Add notes for this bill..." rows="3"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Held Bills Modal -->
            <div class="modal-overlay" id="heldBillsModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3>Held Bills</h3>
                        <button class="modal-close" id="closeHeldBillsModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="held-bills-list" id="heldBillsList">
                            <!-- Held bills will be displayed here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Customer Modal -->
            <div class="modal-overlay" id="addCustomerModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3>Add New Customer</h3>
                        <button class="modal-close" id="closeAddCustomerModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="addCustomerForm">
                            <div class="input-group">
                                <label>Name *</label>
                                <input type="text" id="customerName" required>
                            </div>
                            <div class="input-group">
                                <label>Phone</label>
                                <input type="tel" id="customerPhone">
                            </div>
                            <div class="input-group">
                                <label>Email</label>
                                <input type="email" id="customerEmail">
                            </div>
                            <div class="input-group">
                                <label>Address</label>
                                <textarea id="customerAddress" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancelAddCustomer">Cancel</button>
                        <button class="btn btn-primary" id="saveCustomer">Save Customer</button>
                    </div>
                </div>
            </div>
        `;

        this.loadCustomers();
        this.loadCategories();
        this.loadRecentProducts();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Product search
        const productSearchInput = document.getElementById('productSearchInput');
        if (productSearchInput) {
            productSearchInput.addEventListener('input', ZovatuUtils.debounce((e) => {
                this.searchProducts(e.target.value);
            }, 300));
            
            productSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProducts(e.target.value);
                }
            });
        }

        // Barcode input
        const barcodeInput = document.getElementById('barcodeInput');
        if (barcodeInput) {
            barcodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addProductByBarcode(e.target.value);
                    e.target.value = '';
                }
            });
        }

        // Add by barcode button
        const addByBarcodeBtn = document.getElementById('addByBarcodeBtn');
        if (addByBarcodeBtn) {
            addByBarcodeBtn.addEventListener('click', () => {
                const barcode = document.getElementById('barcodeInput').value;
                this.addProductByBarcode(barcode);
                document.getElementById('barcodeInput').value = '';
            });
        }

        // Scanner toggle
        const toggleScannerBtn = document.getElementById('toggleScannerBtn');
        if (toggleScannerBtn) {
            toggleScannerBtn.addEventListener('click', () => this.toggleScanner());
        }

        // Scanner controls
        const startScannerBtn = document.getElementById('startScannerBtn');
        const stopScannerBtn = document.getElementById('stopScannerBtn');
        if (startScannerBtn) {
            startScannerBtn.addEventListener('click', () => this.startScanner());
        }
        if (stopScannerBtn) {
            stopScannerBtn.addEventListener('click', () => this.stopScanner());
        }

        // Customer selection
        const customerSelect = document.getElementById('customerSelect');
        if (customerSelect) {
            customerSelect.addEventListener('change', (e) => {
                this.selectCustomer(e.target.value);
            });
        }

        // Add customer
        const addCustomerBtn = document.getElementById('addCustomerBtn');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => this.showAddCustomerModal());
        }

        // Discount input
        const discountInput = document.getElementById('discountInput');
        const discountType = document.getElementById('discountType');
        if (discountInput) {
            discountInput.addEventListener('input', () => this.calculateTotal());
        }
        if (discountType) {
            discountType.addEventListener('change', () => this.calculateTotal());
        }

        // Payment methods
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', (e) => {
                paymentMethods.forEach(m => m.classList.remove('active'));
                e.target.classList.add('active');
                this.currentBill.paymentMethod = e.target.dataset.method;
            });
        });

        // Paid amount input
        const paidAmountInput = document.getElementById('paidAmountInput');
        if (paidAmountInput) {
            paidAmountInput.addEventListener('input', () => this.calculateChange());
        }

        // Quick payment buttons
        const quickPayBtns = document.querySelectorAll('.quick-pay-btn');
        quickPayBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount;
                if (amount === 'exact') {
                    document.getElementById('paidAmountInput').value = this.currentBill.total;
                } else {
                    document.getElementById('paidAmountInput').value = amount;
                }
                this.calculateChange();
            });
        });

        // Action buttons
        const completeBillBtn = document.getElementById('completeBillBtn');
        const printBillBtn = document.getElementById('printBillBtn');
        const holdBillBtn = document.getElementById('holdBillBtn');
        const recallBillBtn = document.getElementById('recallBillBtn');
        const clearBillBtn = document.getElementById('clearBillBtn');

        if (completeBillBtn) {
            completeBillBtn.addEventListener('click', () => this.completeBill());
        }
        if (printBillBtn) {
            printBillBtn.addEventListener('click', () => this.printBill());
        }
        if (holdBillBtn) {
            holdBillBtn.addEventListener('click', () => this.holdBill());
        }
        if (recallBillBtn) {
            recallBillBtn.addEventListener('click', () => this.showHeldBills());
        }
        if (clearBillBtn) {
            clearBillBtn.addEventListener('click', () => this.clearBill());
        }

        // Modal close buttons
        const modalCloseButtons = document.querySelectorAll('.modal-close');
        modalCloseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) modal.classList.remove('active');
            });
        });

        // Add customer form
        const saveCustomerBtn = document.getElementById('saveCustomer');
        const cancelAddCustomerBtn = document.getElementById('cancelAddCustomer');
        if (saveCustomerBtn) {
            saveCustomerBtn.addEventListener('click', () => this.saveNewCustomer());
        }
        if (cancelAddCustomerBtn) {
            cancelAddCustomerBtn.addEventListener('click', () => {
                document.getElementById('addCustomerModal').classList.remove('active');
            });
        }

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when billing page is active
        if (!document.getElementById('billingPage').classList.contains('active')) return;

        // Don't handle shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'F1':
                e.preventDefault();
                document.getElementById('productSearchInput')?.focus();
                break;
            case 'F2':
                e.preventDefault();
                this.toggleScanner();
                break;
            case 'F3':
                e.preventDefault();
                this.showAddCustomerModal();
                break;
            case 'F4':
                e.preventDefault();
                this.holdBill();
                break;
            case 'F5':
                e.preventDefault();
                this.showHeldBills();
                break;
            case 'F9':
                e.preventDefault();
                this.clearBill();
                break;
            case 'F12':
                e.preventDefault();
                if (this.currentBill.items.length > 0) {
                    this.completeBill();
                }
                break;
        }
    }

    /**
     * Search products
     */
    searchProducts(query) {
        if (!query || query.length < 1) {
            this.showAllProducts();
            return;
        }

        const results = this.products.filter(product => 
            ZovatuUtils.searchInText(product.name, query) ||
            product.barcode.includes(query) ||
            (product.category && ZovatuUtils.searchInText(product.category, query))
        );

        this.displayProductResults(results);
    }

    /**
     * Show all products
     */
    showAllProducts() {
        this.displayProductResults(this.products.slice(0, 20)); // Show first 20 products
    }

    /**
     * Display product search results
     */
    displayProductResults(products) {
        const resultsContainer = document.getElementById('productResults');
        if (!resultsContainer) return;

        if (products.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No products found</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = products.map(product => `
            <div class="product-result-item" data-product-id="${product.id}">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-details">
                        <span class="product-price">${ZovatuUtils.formatCurrency(product.price)}</span>
                        <span class="product-stock">Stock: ${product.stock}</span>
                        <span class="product-barcode">${product.barcode}</span>
                    </div>
                </div>
                <button class="add-product-btn" onclick="window.billing.addProductToBill('${product.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `).join('');
    }

    /**
     * Add product by barcode
     */
    addProductByBarcode(barcode) {
        if (!barcode) return;

        const product = this.products.find(p => p.barcode === barcode);
        if (product) {
            this.addProductToBill(product.id);
            this.showToast('success', 'Product Added', `${product.name} added to bill`);
        } else {
            this.showToast('error', 'Product Not Found', `No product found with barcode: ${barcode}`);
        }
    }

    /**
     * Add product to bill
     */
    addProductToBill(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showToast('error', 'Error', 'Product not found');
            return;
        }

        if (product.stock < quantity) {
            this.showToast('warning', 'Insufficient Stock', `Only ${product.stock} items available`);
            return;
        }

        // Check if product already exists in bill
        const existingItem = this.currentBill.items.find(item => item.productId === productId);
        
        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                this.showToast('warning', 'Insufficient Stock', `Only ${product.stock} items available`);
                return;
            }
            existingItem.quantity += quantity;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            this.currentBill.items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                total: product.price * quantity,
                barcode: product.barcode
            });
        }

        this.updateBillDisplay();
        this.calculateTotal();
        this.addToRecentProducts(product);
    }

    /**
     * Remove product from bill
     */
    removeProductFromBill(productId) {
        this.currentBill.items = this.currentBill.items.filter(item => item.productId !== productId);
        this.updateBillDisplay();
        this.calculateTotal();
    }

    /**
     * Update product quantity in bill
     */
    updateProductQuantity(productId, newQuantity) {
        const item = this.currentBill.items.find(item => item.productId === productId);
        const product = this.products.find(p => p.id === productId);
        
        if (!item || !product) return;

        if (newQuantity <= 0) {
            this.removeProductFromBill(productId);
            return;
        }

        if (newQuantity > product.stock) {
            this.showToast('warning', 'Insufficient Stock', `Only ${product.stock} items available`);
            return;
        }

        item.quantity = newQuantity;
        item.total = item.quantity * item.price;
        
        this.updateBillDisplay();
        this.calculateTotal();
    }

    /**
     * Update bill display
     */
    updateBillDisplay() {
        const billItemsBody = document.getElementById('billItemsBody');
        if (!billItemsBody) return;

        if (this.currentBill.items.length === 0) {
            billItemsBody.innerHTML = `
                <div class="empty-bill">
                    <i class="fas fa-shopping-cart"></i>
                    <p>No items added yet</p>
                    <small>Search and add products to start billing</small>
                </div>
            `;
        } else {
            billItemsBody.innerHTML = this.currentBill.items.map(item => `
                <div class="bill-item-row" data-product-id="${item.productId}">
                    <div class="item-name">
                        <div class="product-name">${item.name}</div>
                        <div class="product-barcode">${item.barcode}</div>
                    </div>
                    <div class="item-price">${ZovatuUtils.formatCurrency(item.price)}</div>
                    <div class="item-qty">
                        <button class="qty-btn minus" onclick="window.billing.updateProductQuantity('${item.productId}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" value="${item.quantity}" min="1" 
                               onchange="window.billing.updateProductQuantity('${item.productId}', parseInt(this.value))"
                               class="qty-input">
                        <button class="qty-btn plus" onclick="window.billing.updateProductQuantity('${item.productId}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="item-total">${ZovatuUtils.formatCurrency(item.total)}</div>
                    <div class="item-actions">
                        <button class="remove-item-btn" onclick="window.billing.removeProductFromBill('${item.productId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Update items count
        const itemsCount = document.querySelector('.items-count');
        if (itemsCount) {
            itemsCount.textContent = `${this.currentBill.items.length} items`;
        }
    }

    /**
     * Calculate bill total
     */
    calculateTotal() {
        // Calculate subtotal
        this.currentBill.subtotal = this.currentBill.items.reduce((sum, item) => sum + item.total, 0);

        // Calculate tax
        const taxRate = this.settings.taxRate || 0;
        this.currentBill.tax = (this.currentBill.subtotal * taxRate) / 100;

        // Calculate discount
        const discountInput = document.getElementById('discountInput');
        const discountType = document.getElementById('discountType');
        const discountValue = parseFloat(discountInput?.value || 0);

        if (discountType?.value === 'percent') {
            this.currentBill.discount = (this.currentBill.subtotal * discountValue) / 100;
        } else {
            this.currentBill.discount = discountValue;
        }

        // Calculate total
        this.currentBill.total = this.currentBill.subtotal + this.currentBill.tax - this.currentBill.discount;
        this.currentBill.total = Math.max(0, this.currentBill.total); // Ensure total is not negative

        this.updateBillSummary();
        this.calculateChange();
    }

    /**
     * Update bill summary display
     */
    updateBillSummary() {
        const currencySymbol = this.settings.currencySymbol || '৳';
        
        const billSubtotal = document.getElementById('billSubtotal');
        const billTax = document.getElementById('billTax');
        const billTotal = document.getElementById('billTotal');

        if (billSubtotal) billSubtotal.textContent = `${currencySymbol}${this.currentBill.subtotal.toFixed(2)}`;
        if (billTax) billTax.textContent = `${currencySymbol}${this.currentBill.tax.toFixed(2)}`;
        if (billTotal) billTotal.textContent = `${currencySymbol}${this.currentBill.total.toFixed(2)}`;

        // Enable/disable complete button
        const completeBillBtn = document.getElementById('completeBillBtn');
        if (completeBillBtn) {
            completeBillBtn.disabled = this.currentBill.items.length === 0;
        }
    }

    /**
     * Calculate change
     */
    calculateChange() {
        const paidAmountInput = document.getElementById('paidAmountInput');
        const paidAmount = parseFloat(paidAmountInput?.value || 0);
        
        this.currentBill.paid = paidAmount;
        this.currentBill.change = Math.max(0, paidAmount - this.currentBill.total);

        const changeAmount = document.getElementById('changeAmount');
        if (changeAmount) {
            const currencySymbol = this.settings.currencySymbol || '৳';
            changeAmount.textContent = `${currencySymbol}${this.currentBill.change.toFixed(2)}`;
            
            // Highlight if change is negative (insufficient payment)
            if (this.currentBill.change < 0) {
                changeAmount.style.color = 'var(--error-600)';
            } else {
                changeAmount.style.color = 'var(--success-600)';
            }
        }
    }

    /**
     * Complete bill and generate invoice
     */
    async completeBill() {
        if (this.currentBill.items.length === 0) {
            this.showToast('warning', 'Empty Bill', 'Please add items to the bill');
            return;
        }

        if (this.currentBill.paid < this.currentBill.total) {
            this.showToast('error', 'Insufficient Payment', 'Payment amount is less than total');
            return;
        }

        try {
            // Generate invoice
            const invoice = await this.generateInvoice();
            
            // Update product stock
            this.updateProductStock();
            
            // Save invoice
            this.saveInvoice(invoice);
            
            // Update customer total purchases
            if (this.currentBill.customer) {
                this.updateCustomerPurchases();
            }
            
            // Show success message
            this.showToast('success', 'Sale Completed', `Invoice ${invoice.invoiceNumber} generated successfully`);
            
            // Print invoice if auto-print is enabled
            if (this.settings.autoPrint) {
                this.printInvoice(invoice);
            }
            
            // Reset bill
            this.resetBill();
            
        } catch (error) {
            console.error('Error completing bill:', error);
            this.showToast('error', 'Error', 'Failed to complete sale');
        }
    }

    /**
     * Generate invoice
     */
    async generateInvoice() {
        const invoiceNumber = this.generateInvoiceNumber();
        const now = new Date();

        const invoice = {
            id: ZovatuUtils.generateId('inv'),
            invoiceNumber: invoiceNumber,
            customerId: this.currentBill.customer?.id || null,
            customerName: this.currentBill.customer?.name || 'Walk-in Customer',
            customerPhone: this.currentBill.customer?.phone || '',
            customerEmail: this.currentBill.customer?.email || '',
            customerAddress: this.currentBill.customer?.address || '',
            items: [...this.currentBill.items],
            subtotal: this.currentBill.subtotal,
            tax: this.currentBill.tax,
            taxRate: this.settings.taxRate || 0,
            discount: this.currentBill.discount,
            total: this.currentBill.total,
            paid: this.currentBill.paid,
            change: this.currentBill.change,
            paymentMethod: this.currentBill.paymentMethod || 'cash',
            notes: this.currentBill.notes,
            status: 'paid',
            createdAt: now.toISOString(),
            createdBy: 'admin' // TODO: Get from user session
        };

        return invoice;
    }

    /**
     * Generate invoice number
     */
    generateInvoiceNumber() {
        const invoices = zovatuStorage.getItem('invoices') || [];
        const lastInvoice = invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        let nextNumber = 1;
        if (lastInvoice && lastInvoice.invoiceNumber) {
            const match = lastInvoice.invoiceNumber.match(/ZP-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }
        
        return `ZP-${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Update product stock
     */
    updateProductStock() {
        this.currentBill.items.forEach(item => {
            const product = this.products.find(p => p.id === item.productId);
            if (product) {
                product.stock -= item.quantity;
                product.lastSold = new Date().toISOString();
            }
        });
        
        zovatuStorage.setItem('products', this.products);
    }

    /**
     * Save invoice
     */
    saveInvoice(invoice) {
        const invoices = zovatuStorage.getItem('invoices') || [];
        invoices.push(invoice);
        zovatuStorage.setItem('invoices', invoices);
    }

    /**
     * Update customer purchases
     */
    updateCustomerPurchases() {
        if (!this.currentBill.customer) return;
        
        const customers = zovatuStorage.getItem('customers') || [];
        const customer = customers.find(c => c.id === this.currentBill.customer.id);
        
        if (customer) {
            customer.totalPurchases = (customer.totalPurchases || 0) + this.currentBill.total;
            customer.lastPurchase = new Date().toISOString();
            zovatuStorage.setItem('customers', customers);
        }
    }

    /**
     * Print bill/invoice
     */
    printBill() {
        if (this.currentBill.items.length === 0) {
            this.showToast('warning', 'Empty Bill', 'No items to print');
            return;
        }

        const printContent = this.generatePrintContent();
        this.openPrintWindow(printContent);
    }

    /**
     * Print invoice
     */
    printInvoice(invoice) {
        const printContent = this.generateInvoicePrintContent(invoice);
        this.openPrintWindow(printContent);
    }

    /**
     * Generate print content for current bill
     */
    generatePrintContent() {
        const settings = this.settings;
        const currencySymbol = settings.currencySymbol || '৳';
        const now = new Date();

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill - ${settings.shopName || 'Zovatu Pro'}</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .shop-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                    .shop-details { font-size: 10px; color: #666; }
                    .bill-info { margin: 20px 0; }
                    .bill-info div { margin: 2px 0; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th, .items-table td { padding: 5px; text-align: left; border-bottom: 1px solid #ddd; }
                    .items-table th { background: #f5f5f5; font-weight: bold; }
                    .text-right { text-align: right; }
                    .total-section { margin-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
                    .total-row.final { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 5px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="shop-name">${settings.shopName || 'Zovatu Pro'}</div>
                    <div class="shop-details">
                        ${settings.shopAddress || ''}<br>
                        Phone: ${settings.shopPhone || ''} | Email: ${settings.shopEmail || ''}
                    </div>
                </div>
                
                <div class="bill-info">
                    <div><strong>Bill #:</strong> DRAFT</div>
                    <div><strong>Date:</strong> ${ZovatuUtils.formatDate(now)} ${ZovatuUtils.formatTime(now)}</div>
                    <div><strong>Customer:</strong> ${this.currentBill.customer?.name || 'Walk-in Customer'}</div>
                    <div><strong>Cashier:</strong> Admin</div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.currentBill.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="text-right">${currencySymbol}${item.price.toFixed(2)}</td>
                                <td class="text-right">${item.quantity}</td>
                                <td class="text-right">${currencySymbol}${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${currencySymbol}${this.currentBill.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax (${settings.taxRate || 0}%):</span>
                        <span>${currencySymbol}${this.currentBill.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Discount:</span>
                        <span>${currencySymbol}${this.currentBill.discount.toFixed(2)}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total:</span>
                        <span>${currencySymbol}${this.currentBill.total.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Paid:</span>
                        <span>${currencySymbol}${this.currentBill.paid.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Change:</span>
                        <span>${currencySymbol}${this.currentBill.change.toFixed(2)}</span>
                    </div>
                </div>
                
                ${this.currentBill.notes ? `<div style="margin-top: 20px;"><strong>Notes:</strong> ${this.currentBill.notes}</div>` : ''}
                
                <div class="footer">
                    Thank you for your business!<br>
                    Powered by Zovatu Pro
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Generate print content for invoice
     */
    generateInvoicePrintContent(invoice) {
        const settings = this.settings;
        const currencySymbol = settings.currencySymbol || '৳';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.invoiceNumber} - ${settings.shopName || 'Zovatu Pro'}</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .shop-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                    .shop-details { font-size: 10px; color: #666; }
                    .invoice-title { font-size: 16px; font-weight: bold; margin: 20px 0; text-align: center; }
                    .invoice-info { margin: 20px 0; }
                    .invoice-info div { margin: 2px 0; }
                    .customer-info { margin: 20px 0; padding: 10px; border: 1px solid #ddd; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th, .items-table td { padding: 5px; text-align: left; border-bottom: 1px solid #ddd; }
                    .items-table th { background: #f5f5f5; font-weight: bold; }
                    .text-right { text-align: right; }
                    .total-section { margin-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
                    .total-row.final { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 5px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #666; }
                    .payment-info { margin: 20px 0; padding: 10px; background: #f9f9f9; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="shop-name">${settings.shopName || 'Zovatu Pro'}</div>
                    <div class="shop-details">
                        ${settings.shopAddress || ''}<br>
                        Phone: ${settings.shopPhone || ''} | Email: ${settings.shopEmail || ''}
                    </div>
                </div>
                
                <div class="invoice-title">INVOICE</div>
                
                <div class="invoice-info">
                    <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
                    <div><strong>Date:</strong> ${ZovatuUtils.formatDate(invoice.createdAt)} ${ZovatuUtils.formatTime(invoice.createdAt)}</div>
                    <div><strong>Status:</strong> ${invoice.status.toUpperCase()}</div>
                </div>
                
                <div class="customer-info">
                    <strong>Bill To:</strong><br>
                    ${invoice.customerName}<br>
                    ${invoice.customerPhone ? `Phone: ${invoice.customerPhone}<br>` : ''}
                    ${invoice.customerEmail ? `Email: ${invoice.customerEmail}<br>` : ''}
                    ${invoice.customerAddress ? `Address: ${invoice.customerAddress}` : ''}
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="text-right">${currencySymbol}${item.price.toFixed(2)}</td>
                                <td class="text-right">${item.quantity}</td>
                                <td class="text-right">${currencySymbol}${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${currencySymbol}${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax (${invoice.taxRate}%):</span>
                        <span>${currencySymbol}${invoice.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Discount:</span>
                        <span>${currencySymbol}${invoice.discount.toFixed(2)}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total:</span>
                        <span>${currencySymbol}${invoice.total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="payment-info">
                    <strong>Payment Information:</strong><br>
                    Method: ${invoice.paymentMethod.toUpperCase()}<br>
                    Amount Paid: ${currencySymbol}${invoice.paid.toFixed(2)}<br>
                    Change: ${currencySymbol}${invoice.change.toFixed(2)}
                </div>
                
                ${invoice.notes ? `<div style="margin-top: 20px;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
                
                <div class="footer">
                    Thank you for your business!<br>
                    Powered by Zovatu Pro
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Open print window
     */
    openPrintWindow(content) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }

    /**
     * Hold current bill
     */
    holdBill() {
        if (this.currentBill.items.length === 0) {
            this.showToast('warning', 'Empty Bill', 'No items to hold');
            return;
        }

        const heldBills = zovatuStorage.getItem('held_bills') || [];
        const heldBill = {
            id: ZovatuUtils.generateId('held'),
            ...this.currentBill,
            heldAt: new Date().toISOString()
        };

        heldBills.push(heldBill);
        zovatuStorage.setItem('held_bills', heldBills);

        this.showToast('success', 'Bill Held', 'Bill has been saved for later');
        this.resetBill();
    }

    /**
     * Show held bills
     */
    showHeldBills() {
        const heldBills = zovatuStorage.getItem('held_bills') || [];
        const modal = document.getElementById('heldBillsModal');
        const heldBillsList = document.getElementById('heldBillsList');

        if (heldBills.length === 0) {
            heldBillsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-pause"></i>
                    <p>No held bills</p>
                </div>
            `;
        } else {
            heldBillsList.innerHTML = heldBills.map(bill => `
                <div class="held-bill-item">
                    <div class="held-bill-info">
                        <div class="held-bill-id">Bill #${bill.id}</div>
                        <div class="held-bill-details">
                            ${bill.items.length} items • ${ZovatuUtils.formatCurrency(bill.total)}
                        </div>
                        <div class="held-bill-time">Held: ${ZovatuUtils.formatDate(bill.heldAt)} ${ZovatuUtils.formatTime(bill.heldAt)}</div>
                    </div>
                    <div class="held-bill-actions">
                        <button class="btn btn-sm btn-primary" onclick="window.billing.recallBill('${bill.id}')">
                            Recall
                        </button>
                        <button class="btn btn-sm btn-error" onclick="window.billing.deleteHeldBill('${bill.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }

        modal.classList.add('active');
    }

    /**
     * Recall held bill
     */
    recallBill(billId) {
        const heldBills = zovatuStorage.getItem('held_bills') || [];
        const bill = heldBills.find(b => b.id === billId);

        if (!bill) {
            this.showToast('error', 'Error', 'Held bill not found');
            return;
        }

        // Load the held bill
        this.currentBill = { ...bill };
        delete this.currentBill.heldAt;

        // Remove from held bills
        const updatedHeldBills = heldBills.filter(b => b.id !== billId);
        zovatuStorage.setItem('held_bills', updatedHeldBills);

        // Update display
        this.updateBillDisplay();
        this.calculateTotal();
        this.loadCustomerIntoSelector();

        // Close modal
        document.getElementById('heldBillsModal').classList.remove('active');

        this.showToast('success', 'Bill Recalled', 'Held bill has been restored');
    }

    /**
     * Delete held bill
     */
    deleteHeldBill(billId) {
        if (!confirm('Are you sure you want to delete this held bill?')) return;

        const heldBills = zovatuStorage.getItem('held_bills') || [];
        const updatedHeldBills = heldBills.filter(b => b.id !== billId);
        zovatuStorage.setItem('held_bills', updatedHeldBills);

        this.showHeldBills(); // Refresh the list
        this.showToast('success', 'Bill Deleted', 'Held bill has been deleted');
    }

    /**
     * Clear current bill
     */
    clearBill() {
        if (this.currentBill.items.length === 0) return;

        if (!confirm('Are you sure you want to clear all items?')) return;

        this.resetBill();
        this.showToast('info', 'Bill Cleared', 'All items have been removed');
    }

    /**
     * Reset bill to initial state
     */
    resetBill() {
        this.currentBill = {
            id: null,
            items: [],
            customer: null,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0,
            paid: 0,
            change: 0,
            paymentMethod: 'cash',
            notes: ''
        };

        // Reset UI
        this.updateBillDisplay();
        this.updateBillSummary();
        
        // Reset form inputs
        document.getElementById('customerSelect').value = '';
        document.getElementById('discountInput').value = '';
        document.getElementById('paidAmountInput').value = '';
        document.getElementById('billNotes').value = '';
        
        // Reset payment method
        document.querySelectorAll('.payment-method').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.payment-method[data-method="cash"]')?.classList.add('active');

        // Update bill number
        document.getElementById('currentBillNumber').textContent = 'NEW';
    }

    /**
     * Load customers into selector
     */
    loadCustomers() {
        const customerSelect = document.getElementById('customerSelect');
        if (!customerSelect) return;

        this.customers = zovatuStorage.getItem('customers') || [];
        
        customerSelect.innerHTML = '<option value="">Walk-in Customer</option>' +
            this.customers.map(customer => 
                `<option value="${customer.id}">${customer.name} - ${customer.phone}</option>`
            ).join('');
    }

    /**
     * Load customer into selector (for recalled bills)
     */
    loadCustomerIntoSelector() {
        const customerSelect = document.getElementById('customerSelect');
        if (!customerSelect || !this.currentBill.customer) return;

        customerSelect.value = this.currentBill.customer.id || '';
    }

    /**
     * Select customer
     */
    selectCustomer(customerId) {
        if (!customerId) {
            this.currentBill.customer = null;
            return;
        }

        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            this.currentBill.customer = customer;
        }
    }

    /**
     * Show add customer modal
     */
    showAddCustomerModal() {
        const modal = document.getElementById('addCustomerModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('customerName').focus();
        }
    }

    /**
     * Save new customer
     */
    saveNewCustomer() {
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const email = document.getElementById('customerEmail').value.trim();
        const address = document.getElementById('customerAddress').value.trim();

        if (!name) {
            this.showToast('error', 'Validation Error', 'Customer name is required');
            return;
        }

        if (phone && !ZovatuUtils.validatePhone(phone)) {
            this.showToast('error', 'Validation Error', 'Invalid phone number format');
            return;
        }

        if (email && !ZovatuUtils.validateEmail(email)) {
            this.showToast('error', 'Validation Error', 'Invalid email format');
            return;
        }

        const customer = {
            id: ZovatuUtils.generateId('cust'),
            name: name,
            phone: phone,
            email: email,
            address: address,
            totalPurchases: 0,
            createdAt: new Date().toISOString()
        };

        this.customers.push(customer);
        zovatuStorage.setItem('customers', this.customers);

        // Update customer selector
        this.loadCustomers();
        
        // Select the new customer
        document.getElementById('customerSelect').value = customer.id;
        this.selectCustomer(customer.id);

        // Close modal and reset form
        document.getElementById('addCustomerModal').classList.remove('active');
        document.getElementById('addCustomerForm').reset();

        this.showToast('success', 'Customer Added', `${customer.name} has been added successfully`);
    }

    /**
     * Load product categories
     */
    loadCategories() {
        const categories = [...new Set(this.products.map(p => p.category).filter(Boolean))];
        const categoryButtons = document.getElementById('categoryButtons');
        
        if (!categoryButtons) return;

        categoryButtons.innerHTML = categories.map(category => 
            `<button class="category-btn" onclick="window.billing.filterByCategory('${category}')">${category}</button>`
        ).join('') + '<button class="category-btn" onclick="window.billing.showAllProducts()">All</button>';
    }

    /**
     * Filter products by category
     */
    filterByCategory(category) {
        const filteredProducts = this.products.filter(p => p.category === category);
        this.displayProductResults(filteredProducts);
    }

    /**
     * Load recent products
     */
    loadRecentProducts() {
        const recentProducts = zovatuStorage.getItem('recent_products') || [];
        const recentProductsList = document.getElementById('recentProductsList');
        
        if (!recentProductsList) return;

        if (recentProducts.length === 0) {
            recentProductsList.innerHTML = '<p class="no-recent">No recent products</p>';
            return;
        }

        recentProductsList.innerHTML = recentProducts.slice(0, 5).map(product => `
            <div class="recent-product-item" onclick="window.billing.addProductToBill('${product.id}')">
                <div class="recent-product-name">${product.name}</div>
                <div class="recent-product-price">${ZovatuUtils.formatCurrency(product.price)}</div>
            </div>
        `).join('');
    }

    /**
     * Add to recent products
     */
    addToRecentProducts(product) {
        let recentProducts = zovatuStorage.getItem('recent_products') || [];
        
        // Remove if already exists
        recentProducts = recentProducts.filter(p => p.id !== product.id);
        
        // Add to beginning
        recentProducts.unshift(product);
        
        // Keep only last 10
        recentProducts = recentProducts.slice(0, 10);
        
        zovatuStorage.setItem('recent_products', recentProducts);
        this.loadRecentProducts();
    }

    /**
     * Load recent bills
     */
    loadRecentBills() {
        // This could be used to show recent bills in a sidebar or quick access
        const recentInvoices = zovatuStorage.getItem('invoices') || [];
        // Implementation depends on UI requirements
    }

    /**
     * Toggle barcode scanner
     */
    toggleScanner() {
        const scannerSection = document.getElementById('scannerSection');
        if (!scannerSection) return;

        if (scannerSection.classList.contains('hidden')) {
            scannerSection.classList.remove('hidden');
            this.initializeScanner();
        } else {
            scannerSection.classList.add('hidden');
            this.stopScanner();
        }
    }

    /**
     * Initialize barcode scanner
     */
    async initializeScanner() {
        try {
            // Check if browser supports getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showToast('error', 'Scanner Error', 'Camera access not supported in this browser');
                return;
            }

            const video = document.getElementById('scannerVideo');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera if available
            });

            video.srcObject = stream;
            this.scannerStream = stream;
            
            document.getElementById('scannerStatus').textContent = 'Scanner ready - Click Start to begin scanning';
            
        } catch (error) {
            console.error('Scanner initialization error:', error);
            this.showToast('error', 'Scanner Error', 'Failed to access camera');
        }
    }

    /**
     * Start barcode scanner
     */
    startScanner() {
        if (!this.scannerStream) {
            this.initializeScanner();
            return;
        }

        this.scannerActive = true;
        document.getElementById('scannerStatus').textContent = 'Scanning... Point camera at barcode';
        
        // Start scanning process (simplified - in real implementation, use a barcode scanning library)
        this.scanningInterval = setInterval(() => {
            if (this.scannerActive) {
                // In a real implementation, you would use a library like QuaggaJS or ZXing
                // to decode barcodes from the video stream
                this.processScannerFrame();
            }
        }, 100);
    }

    /**
     * Stop barcode scanner
     */
    stopScanner() {
        this.scannerActive = false;
        
        if (this.scanningInterval) {
            clearInterval(this.scanningInterval);
            this.scanningInterval = null;
        }

        if (this.scannerStream) {
            this.scannerStream.getTracks().forEach(track => track.stop());
            this.scannerStream = null;
        }

        const video = document.getElementById('scannerVideo');
        if (video) {
            video.srcObject = null;
        }

        document.getElementById('scannerStatus').textContent = 'Scanner stopped';
    }

    /**
     * Process scanner frame (placeholder for actual barcode detection)
     */
    processScannerFrame() {
        // This is a placeholder. In a real implementation, you would:
        // 1. Capture frame from video
        // 2. Use barcode detection library to find and decode barcodes
        // 3. Call addProductByBarcode() when barcode is detected
        
        // For demo purposes, we'll simulate barcode detection
        // In real implementation, replace this with actual barcode scanning logic
    }

    /**
     * Show toast notification
     */
    showToast(type, title, message) {
        if (window.toast) {
            window.toast[type](title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

// Initialize billing when page loads
document.addEventListener('pageChange', (e) => {
    if (e.detail.page === 'billing') {
        if (!window.billing) {
            window.billing = new ZovatuBilling();
        }
    }
});

// Make available globally
if (typeof window !== 'undefined') {
    window.ZovatuBilling = ZovatuBilling;
}

