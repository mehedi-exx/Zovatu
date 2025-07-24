// Zovatu Billing Tool - Main JavaScript File
// Handles UI interactions, navigation, and core functionality

class BillingTool {
    constructor() {
        this.currentStep = 1;
        this.currentSection = 'billing';
        this.currentShop = null;
        this.calculatorData = {
            amountReceived: 0,
            billAmount: 0,
            changeAmount: 0
        };
        
        this.init();
    }

    init() {
        this.loadUserInfo();
        this.checkExistingShops();
        this.setupEventListeners();
        this.initializeCalculator();
    }

    // Load current user information
    loadUserInfo() {
        const username = localStorage.getItem('loggedInUser') || 'Guest';
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `Welcome, ${username}`;
        }
    }

    // Check if user has existing shops
    checkExistingShops() {
        const shops = billingStorage.getShops();
        const currentShopId = billingStorage.getData('currentShop');
        
        if (shops.length === 0) {
            this.showScreen('shopCreationScreen');
        } else if (currentShopId && billingStorage.getShop(currentShopId)) {
            this.currentShop = billingStorage.getShop(currentShopId);
            this.showScreen('dashboardScreen');
            this.loadShopData();
        } else {
            this.showScreen('shopSelectionScreen');
            this.loadShopsGrid();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Shop creation form
        const shopForm = document.getElementById('shopCreationForm');
        if (shopForm) {
            shopForm.addEventListener('submit', (e) => this.handleShopCreation(e));
        }

        // Logo upload preview
        const logoInput = document.getElementById('shopLogo');
        if (logoInput) {
            logoInput.addEventListener('change', (e) => this.handleLogoPreview(e));
        }

        // Product form
        const productForm = document.getElementById('addProductForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleAddProduct(e));
        }

        // Salesman form
        const salesmanForm = document.getElementById('addSalesmanForm');
        if (salesmanForm) {
            salesmanForm.addEventListener('submit', (e) => this.handleAddSalesman(e));
        }

        // Calculator inputs
        const amountReceived = document.getElementById('amountReceived');
        const billAmount = document.getElementById('billAmount');
        
        if (amountReceived) {
            amountReceived.addEventListener('input', (e) => this.updateCalculatorDisplay(e.target.value, 'received'));
        }
        
        if (billAmount) {
            billAmount.addEventListener('input', (e) => this.updateCalculatorDisplay(e.target.value, 'bill'));
        }

        // Modal overlay click to close
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Screen management
    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    // Shop creation handling
    handleShopCreation(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const shopData = {
            id: billingStorage.generateId(),
            name: formData.get('shopName'),
            address: formData.get('shopAddress'),
            phone: formData.get('shopPhone'),
            logo: null,
            created_at: new Date().toISOString(),
            settings: {
                invoice_prefix: 'INV-',
                currency: 'BDT',
                auto_backup_enabled: true
            }
        };

        // Handle logo if uploaded
        const logoFile = formData.get('shopLogo');
        if (logoFile && logoFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                shopData.logo = e.target.result;
                this.saveShopAndProceed(shopData);
            };
            reader.readAsDataURL(logoFile);
        } else {
            this.saveShopAndProceed(shopData);
        }
    }

    saveShopAndProceed(shopData) {
        if (billingStorage.saveShop(shopData)) {
            billingStorage.setCurrentShop(shopData.id);
            this.currentShop = shopData;
            this.showToast('Shop created successfully!', 'success');
            this.showScreen('dashboardScreen');
            this.loadShopData();
        } else {
            this.showToast('Error creating shop. Please try again.', 'error');
        }
    }

    // Logo preview handling
    handleLogoPreview(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('logoPreview');
        
        if (file && preview) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Logo Preview">`;
            };
            reader.readAsDataURL(file);
        }
    }

    // Load shops grid for selection
    loadShopsGrid() {
        const shopsGrid = document.getElementById('shopsGrid');
        if (!shopsGrid) return;

        const shops = billingStorage.getShops();
        
        if (shops.length === 0) {
            shopsGrid.innerHTML = `
                <div class="no-shops">
                    <i class="fas fa-store" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p>No shops found. Create your first shop to get started.</p>
                </div>
            `;
            return;
        }

        shopsGrid.innerHTML = shops.map(shop => {
            const stats = billingStorage.getShopStats(shop.id);
            return `
                <div class="shop-card" onclick="billingTool.selectShop('${shop.id}')">
                    <div class="shop-card-header">
                        <div class="shop-card-logo">
                            ${shop.logo ? `<img src="${shop.logo}" alt="${shop.name}">` : '<i class="fas fa-store"></i>'}
                        </div>
                        <div class="shop-card-info">
                            <h3>${shop.name}</h3>
                            <p>${shop.address}</p>
                        </div>
                    </div>
                    <div class="shop-card-stats">
                        <div class="stat-item">
                            <div class="stat-value">${stats.totalProducts}</div>
                            <div class="stat-label">Products</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.totalInvoices}</div>
                            <div class="stat-label">Invoices</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.totalSalesmen}</div>
                            <div class="stat-label">Salesmen</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Select a shop
    selectShop(shopId) {
        const shop = billingStorage.getShop(shopId);
        if (shop) {
            this.currentShop = shop;
            billingStorage.setCurrentShop(shopId);
            this.showScreen('dashboardScreen');
            this.loadShopData();
            this.showToast(`Switched to ${shop.name}`, 'success');
        }
    }

    // Load shop data into dashboard
    loadShopData() {
        if (!this.currentShop) return;

        // Update shop info bar
        const shopLogo = document.getElementById('currentShopLogo');
        const shopName = document.getElementById('currentShopName');
        const shopAddress = document.getElementById('currentShopAddress');

        if (shopLogo) {
            if (this.currentShop.logo) {
                shopLogo.src = this.currentShop.logo;
                shopLogo.style.display = 'block';
            } else {
                shopLogo.style.display = 'none';
            }
        }

        if (shopName) shopName.textContent = this.currentShop.name;
        if (shopAddress) shopAddress.textContent = this.currentShop.address;

        // Load section data
        this.loadProducts();
        this.loadInvoices();
        this.loadSalesmen();
        this.loadReports();
    }

    // Section navigation
    showSection(sectionName) {
        // Update navigation
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === sectionName) {
                btn.classList.add('active');
            }
        });

        // Update sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
        
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }

        // Load section-specific data
        switch (sectionName) {
            case 'products':
                this.loadProducts();
                break;
            case 'invoices':
                this.loadInvoices();
                break;
            case 'salesmen':
                this.loadSalesmen();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    // Calculator functionality
    initializeCalculator() {
        this.currentStep = 1;
        this.updateCalculatorStep();
    }

    updateCalculatorStep() {
        const steps = document.querySelectorAll('.input-step');
        steps.forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
                const input = step.querySelector('input');
                if (input && !input.readOnly) {
                    setTimeout(() => input.focus(), 100);
                }
            }
        });
    }

    updateCalculatorDisplay(value, type) {
        const display = document.getElementById('calculatorDisplay');
        const label = document.getElementById('displayLabel');
        
        if (type === 'received') {
            this.calculatorData.amountReceived = parseFloat(value) || 0;
            if (display) display.textContent = this.formatCurrency(this.calculatorData.amountReceived);
            if (label) label.textContent = 'Amount Received';
        } else if (type === 'bill') {
            this.calculatorData.billAmount = parseFloat(value) || 0;
            if (display) display.textContent = this.formatCurrency(this.calculatorData.billAmount);
            if (label) label.textContent = 'Total Bill Amount';
        }
    }

    nextStep() {
        if (this.currentStep === 1) {
            const amountReceived = parseFloat(document.getElementById('amountReceived').value) || 0;
            if (amountReceived <= 0) {
                this.showToast('Please enter a valid amount received', 'error');
                return;
            }
            this.calculatorData.amountReceived = amountReceived;
            this.currentStep = 2;
        } else if (this.currentStep === 2) {
            const billAmount = parseFloat(document.getElementById('billAmount').value) || 0;
            if (billAmount <= 0) {
                this.showToast('Please enter a valid bill amount', 'error');
                return;
            }
            this.calculatorData.billAmount = billAmount;
            this.calculatorData.changeAmount = this.calculatorData.amountReceived - this.calculatorData.billAmount;
            
            const changeInput = document.getElementById('changeAmount');
            if (changeInput) {
                changeInput.value = this.calculatorData.changeAmount.toFixed(2);
            }
            
            const display = document.getElementById('calculatorDisplay');
            const label = document.getElementById('displayLabel');
            if (display) display.textContent = this.formatCurrency(this.calculatorData.changeAmount);
            if (label) label.textContent = 'Change to Return';
            
            this.currentStep = 3;
        }
        
        this.updateCalculatorStep();
    }

    generateInvoice() {
        if (this.calculatorData.billAmount <= 0) {
            this.showToast('Please complete the billing process first', 'error');
            return;
        }

        const invoice = {
            id: billingStorage.generateId(),
            shop_id: this.currentShop.id,
            invoice_number: this.generateInvoiceNumber(),
            date: new Date().toISOString(),
            customer_name: 'Walk-in Customer',
            customer_phone: '',
            items: [{
                product_id: 'quick_sale',
                name: 'Quick Sale',
                quantity: 1,
                unit_price: this.calculatorData.billAmount,
                total: this.calculatorData.billAmount
            }],
            total_amount: this.calculatorData.billAmount,
            amount_received: this.calculatorData.amountReceived,
            change_returned: this.calculatorData.changeAmount,
            status: 'paid',
            salesman_id: 'admin'
        };

        if (billingStorage.saveInvoice(this.currentShop.id, invoice)) {
            this.showToast('Invoice generated successfully!', 'success');
            this.resetCalculator();
            
            // Show print option if enabled
            const settings = billingStorage.getSettings();
            if (settings.printEnabled) {
                this.showPrintOption(invoice);
            }
        } else {
            this.showToast('Error generating invoice', 'error');
        }
    }

    generateInvoiceNumber() {
        const settings = billingStorage.getSettings();
        const prefix = settings.invoicePrefix || 'INV-';
        const year = new Date().getFullYear();
        const invoices = billingStorage.getInvoices(this.currentShop.id);
        const count = invoices.length + 1;
        return `${prefix}${year}-${count.toString().padStart(4, '0')}`;
    }

    resetCalculator() {
        this.currentStep = 1;
        this.calculatorData = { amountReceived: 0, billAmount: 0, changeAmount: 0 };
        
        document.getElementById('amountReceived').value = '';
        document.getElementById('billAmount').value = '';
        document.getElementById('changeAmount').value = '';
        
        const display = document.getElementById('calculatorDisplay');
        const label = document.getElementById('displayLabel');
        if (display) display.textContent = '0.00';
        if (label) label.textContent = 'Amount Received';
        
        this.updateCalculatorStep();
    }

    // Product management
    loadProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid || !this.currentShop) return;

        const products = billingStorage.getProducts(this.currentShop.id);
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-box" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p>No products found. Add your first product to get started.</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-header">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <span class="product-code">${product.code}</span>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn" onclick="billingTool.editProduct('${product.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="billingTool.deleteProduct('${product.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="product-details">
                    <div class="detail-item">
                        <span class="detail-label">Stock:</span>
                        <span class="detail-value">${product.stock} ${product.unit || 'pcs'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Brand:</span>
                        <span class="detail-value">${product.brand || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Color:</span>
                        <span class="detail-value">${product.color || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Size:</span>
                        <span class="detail-value">${product.size || 'N/A'}</span>
                    </div>
                </div>
                <div class="product-price">${this.formatCurrency(product.price)}</div>
            </div>
        `).join('');
    }

    handleAddProduct(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const product = {
            id: billingStorage.generateId(),
            shop_id: this.currentShop.id,
            name: formData.get('productName') || '',
            code: formData.get('productCode') || '',
            price: parseFloat(formData.get('productPrice')) || 0,
            stock: parseInt(formData.get('productStock')) || 0,
            unit: formData.get('productUnit') || 'pcs',
            brand: formData.get('productBrand') || '',
            color: formData.get('productColor') || '',
            size: formData.get('productSize') || '',
            barcode: formData.get('productBarcode') || '',
            created_at: new Date().toISOString()
        };

        if (billingStorage.saveProduct(this.currentShop.id, product)) {
            this.showToast('Product added successfully!', 'success');
            this.closeModal();
            this.loadProducts();
            e.target.reset();
        } else {
            this.showToast('Error adding product', 'error');
        }
    }

    // Invoice management
    loadInvoices() {
        const invoicesList = document.getElementById('invoicesList');
        if (!invoicesList || !this.currentShop) return;

        const invoices = billingStorage.getInvoices(this.currentShop.id);
        
        if (invoices.length === 0) {
            invoicesList.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-file-invoice" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p>No invoices found. Generate your first invoice to get started.</p>
                </div>
            `;
            return;
        }

        invoicesList.innerHTML = invoices.map(invoice => `
            <div class="invoice-item">
                <div class="invoice-header">
                    <span class="invoice-number">${invoice.invoice_number}</span>
                    <span class="invoice-date">${this.formatDate(invoice.date)}</span>
                </div>
                <div class="invoice-details">
                    <div class="invoice-detail">
                        <div class="invoice-detail-label">Customer</div>
                        <div class="invoice-detail-value">${invoice.customer_name || 'Walk-in'}</div>
                    </div>
                    <div class="invoice-detail">
                        <div class="invoice-detail-label">Amount</div>
                        <div class="invoice-detail-value">${this.formatCurrency(invoice.total_amount)}</div>
                    </div>
                    <div class="invoice-detail">
                        <div class="invoice-detail-label">Status</div>
                        <div class="invoice-detail-value">${invoice.status || 'paid'}</div>
                    </div>
                    <div class="invoice-detail">
                        <div class="invoice-detail-label">Actions</div>
                        <div class="invoice-detail-value">
                            <button class="action-btn" onclick="billingTool.viewInvoice('${invoice.id}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn" onclick="billingTool.printInvoice('${invoice.id}')" title="Print">
                                <i class="fas fa-print"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Salesman management
    loadSalesmen() {
        const salesmenGrid = document.getElementById('salesmenGrid');
        if (!salesmenGrid || !this.currentShop) return;

        const salesmen = billingStorage.getSalesmen(this.currentShop.id);
        
        if (salesmen.length === 0) {
            salesmenGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-users" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p>No salesmen found. Add your first salesman to get started.</p>
                </div>
            `;
            return;
        }

        salesmenGrid.innerHTML = salesmen.map(salesman => `
            <div class="salesman-card">
                <div class="salesman-header">
                    <div class="salesman-info">
                        <h4>${salesman.name}</h4>
                        <span class="salesman-email">${salesman.email}</span>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn" onclick="billingTool.editSalesman('${salesman.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="billingTool.deleteSalesman('${salesman.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="permissions-list">
                    ${Object.entries(salesman.permissions || {}).map(([key, value]) => 
                        `<span class="permission-tag ${value ? '' : 'disabled'}">${this.formatPermissionName(key)}</span>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }

    handleAddSalesman(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const salesman = {
            id: billingStorage.generateId(),
            shop_id: this.currentShop.id,
            name: formData.get('salesmanName') || '',
            email: formData.get('salesmanEmail') || '',
            permissions: {
                can_view_invoices: document.getElementById('canViewInvoices').checked,
                can_edit_invoices: document.getElementById('canEditInvoices').checked,
                can_print_invoices: document.getElementById('canPrintInvoices').checked,
                can_manage_products: document.getElementById('canManageProducts').checked
            },
            created_at: new Date().toISOString()
        };

        if (billingStorage.saveSalesman(this.currentShop.id, salesman)) {
            this.showToast('Salesman added successfully!', 'success');
            this.closeModal();
            this.loadSalesmen();
            e.target.reset();
        } else {
            this.showToast('Error adding salesman', 'error');
        }
    }

    // Reports
    loadReports() {
        // This will be implemented in the advanced features phase
        const reportsContent = document.getElementById('reportsContent');
        if (reportsContent) {
            reportsContent.innerHTML = `
                <div class="coming-soon">
                    <i class="fas fa-chart-bar" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p>Advanced reporting features coming soon!</p>
                </div>
            `;
        }
    }

    // Modal management
    showModal(modalId) {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById(modalId);
        
        if (overlay && modal) {
            overlay.classList.add('active');
            modal.classList.add('active');
        }
    }

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        const modals = document.querySelectorAll('.modal');
        
        if (overlay) overlay.classList.remove('active');
        modals.forEach(modal => modal.classList.remove('active'));
    }

    // Utility functions
    formatCurrency(amount) {
        const settings = billingStorage.getSettings();
        const currency = settings.currency || 'BDT';
        return `${currency} ${parseFloat(amount).toFixed(2)}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    formatPermissionName(key) {
        return key.replace(/can_|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.openSettings();
                    break;
                case 'n':
                    e.preventDefault();
                    if (this.currentSection === 'products') {
                        this.showAddProduct();
                    } else if (this.currentSection === 'salesmen') {
                        this.showAddSalesman();
                    }
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            this.closeModal();
        }
    }
}

// Global functions for HTML onclick events
function goBack() {
    window.history.back();
}

function showShopCreation() {
    billingTool.showScreen('shopCreationScreen');
}

function showShopSelection() {
    billingTool.showScreen('shopSelectionScreen');
    billingTool.loadShopsGrid();
}

function showSection(section) {
    billingTool.showSection(section);
}

function nextStep() {
    billingTool.nextStep();
}

function generateInvoice() {
    billingTool.generateInvoice();
}

function showAddProduct() {
    billingTool.showModal('addProductModal');
}

function showAddSalesman() {
    billingTool.showModal('addSalesmanModal');
}

function openSettings() {
    billingTool.showModal('settingsModal');
}

function closeModal() {
    billingTool.closeModal();
}

function filterInvoices() {
    billingTool.loadInvoices();
}

function generateReport() {
    billingTool.loadReports();
}

function generateBarcode() {
    // This will be implemented in the advanced features phase
    billingTool.showToast('Barcode generation feature coming soon!', 'info');
}

function showSettingsTab(tab) {
    // This will be implemented in the advanced features phase
    billingTool.showToast('Settings feature coming soon!', 'info');
}

// Initialize the billing tool when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.billingTool = new BillingTool();
});

