/**
 * Zovatu Smart Billing Tool - UI Interaction Handlers
 * Manages all user interface interactions and connects UI with core logic
 */

class ZovatuBillingUI {
    constructor() {
        this.storage = new ZovatuStorage();
        this.billingCore = new ZovatuBillingCore(this.storage);
        this.currentView = 'loading';
        this.charts = {};
        this.toastQueue = [];
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the UI system
     */
    async init() {
        try {
            // Show loading screen
            this.showLoading();
            
            // Initialize Chart.js
            await this.loadChartJS();
            
            // Check if setup is completed
            const setupCompleted = this.storage.getItem('setup_completed', false);
            
            if (!setupCompleted) {
                this.showProfileSetup();
            } else {
                this.showMainInterface();
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize components
            this.initializeComponents();
            
            this.isInitialized = true;
            this.hideLoading();
            
        } catch (error) {
            console.error('UI Initialization Error:', error);
            this.showToast('Failed to initialize application', 'error');
        }
    }

    /**
     * Load Chart.js library dynamically
     */
    async loadChartJS() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Profile Setup
        document.getElementById('profileSetupForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileSetup();
        });

        // Mode Toggle
        document.getElementById('modeToggle')?.addEventListener('change', (e) => {
            this.handleModeToggle(e.target.checked);
        });

        // Shop Status Toggle
        document.getElementById('shopStatusToggle')?.addEventListener('click', () => {
            this.handleShopStatusToggle();
        });

        // Simple Mode Calculator
        this.setupSimpleModeListeners();

        // Ultra Mode Listeners
        this.setupUltraModeListeners();

        // Settings Modal
        this.setupSettingsListeners();

        // Admin Panel
        this.setupAdminPanelListeners();

        // Product Management
        this.setupProductManagementListeners();

        // General Modal Listeners
        this.setupModalListeners();

        // Keyboard Shortcuts
        this.setupKeyboardShortcuts();

        // Auto-save listeners
        this.setupAutoSaveListeners();
    }

    /**
     * Setup Simple Mode Event Listeners
     */
    setupSimpleModeListeners() {
        const calculator = document.getElementById('simpleCalculator');
        if (!calculator) return;

        // Number buttons
        calculator.querySelectorAll('.calc-btn[data-number]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleCalculatorInput(btn.dataset.number);
            });
        });

        // Operation buttons
        calculator.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
            this.clearCalculatorDisplay();
        });

        calculator.querySelector('[data-action="backspace"]')?.addEventListener('click', () => {
            this.handleCalculatorBackspace();
        });

        calculator.querySelector('[data-action="next"]')?.addEventListener('click', () => {
            this.handleCalculatorNext();
        });

        calculator.querySelector('[data-action="generate"]')?.addEventListener('click', () => {
            this.handleSimpleBillGenerate();
        });

        // Decimal point
        calculator.querySelector('[data-action="decimal"]')?.addEventListener('click', () => {
            this.handleCalculatorInput('.');
        });
    }

    /**
     * Setup Ultra Mode Event Listeners
     */
    setupUltraModeListeners() {
        // Barcode Scanner
        document.getElementById('barcodeInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleBarcodeScanner(e.target.value);
                e.target.value = '';
            }
        });

        // Manual Product Search
        document.getElementById('productSearch')?.addEventListener('input', (e) => {
            this.handleProductSearch(e.target.value);
        });

        // Checkout Button
        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            this.showCheckoutModal();
        });

        // Clear Cart
        document.getElementById('clearCartBtn')?.addEventListener('click', () => {
            this.handleClearCart();
        });

        // Try Simple Mode
        document.getElementById('trySimpleModeBtn')?.addEventListener('click', () => {
            this.switchToSimpleMode();
        });
    }

    /**
     * Setup Settings Modal Listeners
     */
    setupSettingsListeners() {
        // Currency Change
        document.getElementById('currencySelect')?.addEventListener('change', (e) => {
            this.handleCurrencyChange(e.target.value);
        });

        // Print Settings
        document.getElementById('autoPrintToggle')?.addEventListener('change', (e) => {
            this.updatePrintSettings({ autoPrint: e.target.checked });
        });

        document.getElementById('thermalModeToggle')?.addEventListener('change', (e) => {
            this.updatePrintSettings({ thermalMode: e.target.checked });
        });

        // Notification Settings
        document.getElementById('lowStockThreshold')?.addEventListener('change', (e) => {
            this.updateNotificationSettings({ lowStockThreshold: parseInt(e.target.value) });
        });

        // Backup Settings
        document.getElementById('autoBackupToggle')?.addEventListener('change', (e) => {
            this.updateBackupSettings({ autoBackup: e.target.checked });
        });

        document.getElementById('backupInterval')?.addEventListener('change', (e) => {
            this.updateBackupSettings({ backupInterval: parseInt(e.target.value) });
        });

        // Manual Backup
        document.getElementById('manualBackupBtn')?.addEventListener('click', () => {
            this.handleManualBackup();
        });

        // Edit Shop Profile
        document.getElementById('editShopBtn')?.addEventListener('click', () => {
            this.showEditShopModal();
        });
    }

    /**
     * Setup Admin Panel Listeners
     */
    setupAdminPanelListeners() {
        // Date Range Filter
        document.getElementById('dateFromFilter')?.addEventListener('change', () => {
            this.updateAdminCharts();
        });

        document.getElementById('dateToFilter')?.addEventListener('change', () => {
            this.updateAdminCharts();
        });

        // Export Reports
        document.getElementById('exportReportBtn')?.addEventListener('click', () => {
            this.handleExportReport();
        });

        // Refresh Stats
        document.getElementById('refreshStatsBtn')?.addEventListener('click', () => {
            this.refreshAdminStats();
        });
    }

    /**
     * Setup Product Management Listeners
     */
    setupProductManagementListeners() {
        // Add Product Form
        document.getElementById('addProductForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProduct();
        });

        // Product Search
        document.getElementById('productManagementSearch')?.addEventListener('input', (e) => {
            this.filterProductList(e.target.value);
        });

        // Generate Barcode
        document.getElementById('generateBarcodeBtn')?.addEventListener('click', () => {
            this.generateProductBarcode();
        });
    }

    /**
     * Setup Modal Listeners
     */
    setupModalListeners() {
        // Close modal buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Settings Modal Open
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettingsModal();
        });

        // Admin Panel Open
        document.getElementById('adminBtn')?.addEventListener('click', () => {
            this.showAdminPanel();
        });

        // Product Management Open
        document.getElementById('productManagementBtn')?.addEventListener('click', () => {
            this.showProductManagement();
        });
    }

    /**
     * Setup Keyboard Shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.showSettingsModal();
                        break;
                    case 'a':
                        e.preventDefault();
                        this.showAdminPanel();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.showProductManagement();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.handleManualBackup();
                        break;
                }
            }

            // Function keys
            switch (e.key) {
                case 'F1':
                    e.preventDefault();
                    document.getElementById('productSearch')?.focus();
                    break;
                case 'F2':
                    e.preventDefault();
                    if (this.billingCore.getBillingMode() === 'ultra') {
                        this.showCheckoutModal();
                    } else {
                        this.handleSimpleBillGenerate();
                    }
                    break;
                case 'Escape':
                    this.closeAllModals();
                    break;
            }
        });
    }

    /**
     * Setup Auto-save Listeners
     */
    setupAutoSaveListeners() {
        // Auto-save on input changes
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', () => {
                // Debounced auto-save
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.autoSave();
                }, 1000);
            });
        });
    }

    /**
     * Initialize Components
     */
    initializeComponents() {
        this.updateShopStatus();
        this.updateBillingMode();
        this.loadRecentBills();
        this.checkLowStockAlerts();
        this.updateCurrencyDisplay();
    }

    /**
     * Profile Setup Handler
     */
    handleProfileSetup() {
        const formData = new FormData(document.getElementById('profileSetupForm'));
        const profileData = {
            shopName: formData.get('shopName'),
            shopAddress: formData.get('shopAddress'),
            shopMobile: formData.get('shopMobile'),
            shopEmail: formData.get('shopEmail')
        };

        const validation = this.storage.validateShopProfile(profileData);
        if (validation.length > 0) {
            this.showToast(validation.join(', '), 'error');
            return;
        }

        const profile = this.storage.saveShopProfile(profileData);
        if (profile) {
            this.showToast('Shop profile created successfully!', 'success');
            this.hideModal('profileSetupModal');
            this.showMainInterface();
        } else {
            this.showToast('Failed to create shop profile', 'error');
        }
    }

    /**
     * Mode Toggle Handler
     */
    handleModeToggle(isUltraMode) {
        const mode = isUltraMode ? 'ultra' : 'simple';
        const result = this.billingCore.setBillingMode(mode);
        
        if (result.success) {
            this.updateBillingMode();
            this.showToast(`Switched to ${mode === 'ultra' ? 'Ultra' : 'Simple'} Mode`, 'success');
        } else {
            this.showToast(result.error, 'error');
        }
    }

    /**
     * Shop Status Toggle Handler
     */
    handleShopStatusToggle() {
        const currentStatus = this.storage.getShopStatus();
        
        if (currentStatus.isOpen) {
            // Close shop
            const result = this.storage.closeShop();
            this.showToast('Shop closed successfully. Daily sales saved.', 'success');
        } else {
            // Open shop
            const result = this.storage.openShop();
            this.showToast('Shop opened successfully!', 'success');
        }
        
        this.updateShopStatus();
    }

    /**
     * Calculator Input Handler
     */
    handleCalculatorInput(value) {
        const display = document.getElementById('calculatorDisplay');
        if (!display) return;

        let currentValue = display.textContent;
        
        if (currentValue === '0' || currentValue === 'Error') {
            currentValue = '';
        }

        if (value === '.' && currentValue.includes('.')) {
            return; // Prevent multiple decimal points
        }

        display.textContent = currentValue + value;
    }

    /**
     * Calculator Backspace Handler
     */
    handleCalculatorBackspace() {
        const display = document.getElementById('calculatorDisplay');
        if (!display) return;

        let currentValue = display.textContent;
        if (currentValue.length > 1) {
            display.textContent = currentValue.slice(0, -1);
        } else {
            display.textContent = '0';
        }
    }

    /**
     * Calculator Clear Handler
     */
    clearCalculatorDisplay() {
        const display = document.getElementById('calculatorDisplay');
        if (display) {
            display.textContent = '0';
        }
        
        // Reset calculator state
        this.calculatorState = {
            step: 1,
            customerPayment: 0,
            billAmount: 0
        };
        
        this.updateCalculatorStep();
    }

    /**
     * Calculator Next Handler
     */
    handleCalculatorNext() {
        const display = document.getElementById('calculatorDisplay');
        if (!display) return;

        const value = parseFloat(display.textContent) || 0;
        
        if (!this.calculatorState) {
            this.calculatorState = { step: 1, customerPayment: 0, billAmount: 0 };
        }

        switch (this.calculatorState.step) {
            case 1:
                // Customer payment entered
                this.calculatorState.customerPayment = value;
                this.calculatorState.step = 2;
                display.textContent = '0';
                break;
            case 2:
                // Bill amount entered
                this.calculatorState.billAmount = value;
                this.calculatorState.step = 3;
                const change = this.calculatorState.customerPayment - this.calculatorState.billAmount;
                display.textContent = change.toFixed(2);
                break;
        }
        
        this.updateCalculatorStep();
    }

    /**
     * Simple Bill Generate Handler
     */
    handleSimpleBillGenerate() {
        if (!this.calculatorState || this.calculatorState.step < 3) {
            this.showToast('Please complete all calculator steps', 'error');
            return;
        }

        const result = this.billingCore.calculateSimpleBill(
            this.calculatorState.customerPayment,
            this.calculatorState.billAmount
        );

        if (result.success) {
            const savedBill = this.storage.saveBill(result.bill);
            this.showBillPreview(savedBill);
            this.loadRecentBills();
            this.clearCalculatorDisplay();
            this.showToast('Bill generated successfully!', 'success');
        } else {
            this.showToast(result.errors.join(', '), 'error');
        }
    }

    /**
     * Barcode Scanner Handler
     */
    handleBarcodeScanner(barcode) {
        if (!barcode.trim()) return;

        const result = this.billingCore.addToCart(barcode);
        
        if (result.success) {
            this.updateCartDisplay();
            this.showToast('Product added to cart', 'success');
        } else {
            this.showToast(result.error, 'error');
            // Show "Try Simple Mode" option
            this.showTrySimpleModeOption();
        }
    }

    /**
     * Product Search Handler
     */
    handleProductSearch(query) {
        if (query.length < 2) {
            this.hideProductSearchResults();
            return;
        }

        const products = this.billingCore.searchProducts(query);
        this.showProductSearchResults(products);
    }

    /**
     * Currency Change Handler
     */
    handleCurrencyChange(currencyCode) {
        const result = this.billingCore.setCurrency(currencyCode);
        
        if (result.success) {
            this.updateCurrencyDisplay();
            this.showToast(`Currency changed to ${result.currency.name}`, 'success');
        } else {
            this.showToast(result.error, 'error');
        }
    }

    /**
     * Manual Backup Handler
     */
    handleManualBackup() {
        try {
            this.storage.downloadBackup();
            this.showToast('Backup downloaded successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to create backup', 'error');
        }
    }

    /**
     * UI Update Methods
     */
    updateShopStatus() {
        const status = this.storage.getShopStatus();
        const statusElement = document.getElementById('shopStatus');
        const toggleButton = document.getElementById('shopStatusToggle');
        
        if (statusElement) {
            statusElement.textContent = status.isOpen ? 'Open' : 'Closed';
            statusElement.className = `shop-status ${status.isOpen ? 'open' : 'closed'}`;
        }
        
        if (toggleButton) {
            toggleButton.textContent = status.isOpen ? 'Close Shop' : 'Open Shop';
            toggleButton.className = `shop-toggle-btn ${status.isOpen ? 'close' : 'open'}`;
        }

        // Update daily sales display
        const dailySalesElement = document.getElementById('dailySales');
        if (dailySalesElement) {
            dailySalesElement.textContent = this.billingCore.formatCurrency(status.dailySales);
        }
    }

    updateBillingMode() {
        const mode = this.billingCore.getBillingMode();
        const toggle = document.getElementById('modeToggle');
        const simpleMode = document.getElementById('simpleModeContainer');
        const ultraMode = document.getElementById('ultraModeContainer');
        
        if (toggle) {
            toggle.checked = mode === 'ultra';
        }
        
        if (simpleMode && ultraMode) {
            if (mode === 'simple') {
                simpleMode.style.display = 'block';
                ultraMode.style.display = 'none';
            } else {
                simpleMode.style.display = 'none';
                ultraMode.style.display = 'block';
            }
        }
    }

    updateCalculatorStep() {
        const stepIndicator = document.getElementById('calculatorStep');
        if (!stepIndicator || !this.calculatorState) return;

        const steps = [
            'Enter customer payment',
            'Enter bill amount',
            'Change calculated'
        ];

        stepIndicator.textContent = steps[this.calculatorState.step - 1] || steps[0];
    }

    updateCartDisplay() {
        const cart = this.billingCore.getCart();
        const cartContainer = document.getElementById('cartItems');
        const totals = this.billingCore.calculateCartTotals();
        
        if (!cartContainer) return;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<div class="empty-cart">Cart is empty</div>';
        } else {
            cartContainer.innerHTML = cart.map(item => `
                <div class="cart-item" data-product-id="${item.productId}">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">${this.billingCore.formatCurrency(item.sellingPrice)} x ${item.quantity}</div>
                    </div>
                    <div class="item-total">${this.billingCore.formatCurrency(item.total)}</div>
                    <div class="item-actions">
                        <button class="qty-btn" onclick="billingUI.updateCartQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                        <span class="qty">${item.quantity}</span>
                        <button class="qty-btn" onclick="billingUI.updateCartQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                        <button class="remove-btn" onclick="billingUI.removeFromCart('${item.productId}')">×</button>
                    </div>
                </div>
            `).join('');
        }

        // Update totals
        document.getElementById('cartSubtotal').textContent = totals.subtotal;
        document.getElementById('cartTotal').textContent = totals.total;
        document.getElementById('cartItemCount').textContent = totals.itemCount;
    }

    updateCurrencyDisplay() {
        const currency = this.billingCore.currentCurrency;
        document.querySelectorAll('.currency-symbol').forEach(el => {
            el.textContent = currency.symbol;
        });
        
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.value = currency.code;
        }
    }

    loadRecentBills() {
        const recentBills = this.storage.getRecentBills(5);
        const container = document.getElementById('recentBills');
        
        if (!container) return;

        if (recentBills.length === 0) {
            container.innerHTML = '<div class="no-bills">No recent bills</div>';
        } else {
            container.innerHTML = recentBills.map(bill => `
                <div class="recent-bill-item" onclick="billingUI.showBillDetails('${bill.id}')">
                    <div class="bill-info">
                        <div class="bill-number">${bill.billNumber}</div>
                        <div class="bill-date">${this.billingCore.formatDateTime(bill.createdAt)}</div>
                    </div>
                    <div class="bill-amount">${this.billingCore.formatCurrency(bill.total)}</div>
                    <div class="bill-mode">${bill.mode === 'ultra' ? 'Ultra' : 'Simple'}</div>
                </div>
            `).join('');
        }
    }

    checkLowStockAlerts() {
        const lowStockProducts = this.billingCore.checkLowStockAlerts();
        
        if (lowStockProducts.length > 0) {
            const productNames = lowStockProducts.map(p => p.name).join(', ');
            this.showToast(`Low stock alert: ${productNames}`, 'warning', 5000);
        }
    }

    /**
     * Modal Management
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    showSettingsModal() {
        this.loadSettingsData();
        this.showModal('settingsModal');
    }

    showAdminPanel() {
        this.loadAdminData();
        this.showModal('adminPanelModal');
    }

    showProductManagement() {
        this.loadProductManagementData();
        this.showModal('productManagementModal');
    }

    showCheckoutModal() {
        const cart = this.billingCore.getCart();
        if (cart.length === 0) {
            this.showToast('Cart is empty', 'error');
            return;
        }
        
        this.loadCheckoutData();
        this.showModal('checkoutModal');
    }

    showBillPreview(bill) {
        const previewContainer = document.getElementById('billPreviewContent');
        if (previewContainer) {
            previewContainer.innerHTML = this.billingCore.generateBillHTML(bill);
        }
        
        // Store current bill for printing
        this.currentBill = bill;
        this.showModal('billPreviewModal');
    }

    /**
     * Chart Management
     */
    initializeCharts() {
        this.createSalesChart();
        this.createProfitChart();
        this.createStockChart();
        this.createTopProductsChart();
    }

    createSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        const analytics = this.storage.getAnalytics();
        const dailyData = analytics.dailyData.slice(0, 7).reverse();

        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dailyData.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    label: 'Daily Sales',
                    data: dailyData.map(d => d.sales),
                    borderColor: '#ff6b35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    tension: 0.4
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
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createProfitChart() {
        const ctx = document.getElementById('profitChart');
        if (!ctx) return;

        const analytics = this.storage.getAnalytics();
        const monthlyData = analytics.monthlyData.slice(0, 6).reverse();

        this.charts.profit = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.map(d => d.month),
                datasets: [{
                    label: 'Monthly Profit',
                    data: monthlyData.map(d => d.profit),
                    backgroundColor: '#4CAF50'
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
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createStockChart() {
        const ctx = document.getElementById('stockChart');
        if (!ctx) return;

        const products = this.storage.getProducts();
        const lowStockProducts = products.filter(p => p.stock <= 10);
        const normalStockProducts = products.filter(p => p.stock > 10);

        this.charts.stock = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Low Stock', 'Normal Stock'],
                datasets: [{
                    data: [lowStockProducts.length, normalStockProducts.length],
                    backgroundColor: ['#f44336', '#4CAF50']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createTopProductsChart() {
        const ctx = document.getElementById('topProductsChart');
        if (!ctx) return;

        const analytics = this.storage.getAnalytics();
        const topProducts = analytics.topProducts.slice(0, 5);

        this.charts.topProducts = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: topProducts.map(p => p.name),
                datasets: [{
                    label: 'Revenue',
                    data: topProducts.map(p => p.revenue),
                    backgroundColor: '#2196F3'
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
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateAdminCharts() {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        // Recreate charts with updated data
        this.initializeCharts();
    }

    /**
     * Toast Notification System
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        const container = document.getElementById('toastContainer') || this.createToastContainer();
        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);

        // Animate in
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 100);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * View Management
     */
    showLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    showProfileSetup() {
        this.hideLoading();
        this.showModal('profileSetupModal');
    }

    showMainInterface() {
        this.hideLoading();
        const mainInterface = document.getElementById('mainInterface');
        if (mainInterface) {
            mainInterface.style.display = 'block';
        }
    }

    /**
     * Data Loading Methods
     */
    loadSettingsData() {
        const settings = this.storage.getSettings();
        const shopProfile = this.storage.getShopProfile();
        
        // Load currency settings
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.value = settings.currency.code;
        }
        
        // Load print settings
        document.getElementById('autoPrintToggle').checked = settings.print.autoPrint;
        document.getElementById('thermalModeToggle').checked = settings.print.thermalMode;
        
        // Load notification settings
        document.getElementById('lowStockThreshold').value = settings.notifications.lowStockThreshold;
        
        // Load backup settings
        document.getElementById('autoBackupToggle').checked = settings.backup.autoBackup;
        document.getElementById('backupInterval').value = settings.backup.backupInterval;
        
        // Load shop profile
        if (shopProfile) {
            document.getElementById('editShopName').value = shopProfile.shopName;
            document.getElementById('editShopAddress').value = shopProfile.shopAddress;
            document.getElementById('editShopMobile').value = shopProfile.shopMobile;
            document.getElementById('editShopEmail').value = shopProfile.shopEmail || '';
        }
    }

    loadAdminData() {
        const stats = this.billingCore.getDashboardStats();
        
        // Update stat cards
        document.getElementById('totalSalesValue').textContent = stats.totalSales;
        document.getElementById('totalProfitValue').textContent = stats.totalProfit;
        document.getElementById('stockValueValue').textContent = stats.stockValue;
        document.getElementById('productCountValue').textContent = stats.productCount;
        document.getElementById('dailySalesValue').textContent = stats.dailySales;
        document.getElementById('lowStockCountValue').textContent = stats.lowStockCount;
        
        // Initialize charts
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }

    loadProductManagementData() {
        const products = this.storage.getProducts();
        this.renderProductList(products);
    }

    loadCheckoutData() {
        const totals = this.billingCore.calculateCartTotals();
        document.getElementById('checkoutTotal').textContent = totals.total;
    }

    /**
     * Utility Methods
     */
    autoSave() {
        // Implement auto-save logic if needed
        console.log('Auto-save triggered');
    }

    formatCurrency(amount) {
        return this.billingCore.formatCurrency(amount);
    }

    // Public methods for global access
    updateCartQuantity(productId, quantity) {
        const result = this.billingCore.updateCartItemQuantity(productId, quantity);
        if (result.success) {
            this.updateCartDisplay();
        } else {
            this.showToast(result.error, 'error');
        }
    }

    removeFromCart(productId) {
        const result = this.billingCore.removeFromCart(productId);
        if (result.success) {
            this.updateCartDisplay();
            this.showToast('Item removed from cart', 'success');
        }
    }

    showBillDetails(billId) {
        const bill = this.storage.getBillById(billId);
        if (bill) {
            this.showBillPreview(bill);
        }
    }

    printCurrentBill() {
        if (this.currentBill) {
            this.billingCore.printBill(this.currentBill);
        }
    }
}

// Initialize the UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.billingUI = new ZovatuBillingUI();
});

// Export for global access
window.ZovatuBillingUI = ZovatuBillingUI;

