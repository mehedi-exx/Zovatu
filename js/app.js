/**
 * Zovatu Pro - Main Application Controller
 * Handles app initialization, routing, and global functionality
 */

class ZovatuApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.isLoading = true;
        this.isMobile = window.innerWidth <= 1024;
        this.sidebarCollapsed = false;
        this.mobileSidebarOpen = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading screen
            this.showLoading();
            
            // Initialize storage
            await this.initializeStorage();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize components
            this.initializeComponents();
            
            // Setup routing
            this.setupRouting();
            
            // Load initial data
            await this.loadInitialData();
            
            // Hide loading screen and show app
            this.hideLoading();
            
            // Initialize current page
            this.navigateToPage(this.currentPage);
            
            console.log('Zovatu Pro initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Zovatu Pro:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Initialize storage system
     */
    async initializeStorage() {
        // Initialize storage if not already done
        if (!window.zovatuStorage) {
            window.zovatuStorage = new ZovatuStorage();
        }
        
        // Check if this is first time setup
        const isFirstTime = !zovatuStorage.getItem('app_initialized');
        
        if (isFirstTime) {
            await this.setupFirstTime();
        }
    }

    /**
     * Setup first time initialization
     */
    async setupFirstTime() {
        // Set default settings
        const defaultSettings = {
            shopName: 'My Shop',
            currency: 'BDT',
            currencySymbol: '৳',
            taxRate: 0,
            language: 'bn',
            theme: 'light',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '12h'
        };
        
        zovatuStorage.setItem('settings', defaultSettings);
        zovatuStorage.setItem('app_initialized', true);
        
        // Create sample data for demo
        this.createSampleData();
    }

    /**
     * Create sample data for demonstration
     */
    createSampleData() {
        // Sample products
        const sampleProducts = [
            {
                id: 'prod_001',
                name: 'Rice (Basmati)',
                barcode: '1234567890123',
                price: 80,
                cost: 70,
                stock: 50,
                unit: 'kg',
                category: 'Food',
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_002',
                name: 'Cooking Oil',
                barcode: '1234567890124',
                price: 150,
                cost: 130,
                stock: 25,
                unit: 'ltr',
                category: 'Food',
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_003',
                name: 'Sugar',
                barcode: '1234567890125',
                price: 60,
                cost: 55,
                stock: 30,
                unit: 'kg',
                category: 'Food',
                createdAt: new Date().toISOString()
            }
        ];
        
        zovatuStorage.setItem('products', sampleProducts);
        
        // Sample customers
        const sampleCustomers = [
            {
                id: 'cust_001',
                name: 'Ahmed Hassan',
                phone: '01712345678',
                email: 'ahmed@example.com',
                address: 'Dhaka, Bangladesh',
                totalPurchases: 5000,
                createdAt: new Date().toISOString()
            },
            {
                id: 'cust_002',
                name: 'Fatima Rahman',
                phone: '01812345678',
                email: 'fatima@example.com',
                address: 'Chittagong, Bangladesh',
                totalPurchases: 3500,
                createdAt: new Date().toISOString()
            }
        ];
        
        zovatuStorage.setItem('customers', sampleCustomers);
        
        // Sample invoices
        const sampleInvoices = [
            {
                id: 'inv_001',
                invoiceNumber: 'ZP-001',
                customerId: 'cust_001',
                customerName: 'Ahmed Hassan',
                items: [
                    { productId: 'prod_001', name: 'Rice (Basmati)', quantity: 2, price: 80, total: 160 },
                    { productId: 'prod_002', name: 'Cooking Oil', quantity: 1, price: 150, total: 150 }
                ],
                subtotal: 310,
                tax: 0,
                discount: 0,
                total: 310,
                paid: 310,
                change: 0,
                status: 'paid',
                createdAt: new Date().toISOString()
            }
        ];
        
        zovatuStorage.setItem('invoices', sampleInvoices);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    this.navigateToPage(page);
                }
            });
        });

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Quick actions
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Shop selector
        const shopBtn = document.getElementById('shopBtn');
        if (shopBtn) {
            shopBtn.addEventListener('click', () => this.toggleShopSelector());
        }

        // Quick bill button
        const quickBillBtn = document.getElementById('quickBillBtn');
        if (quickBillBtn) {
            quickBillBtn.addEventListener('click', () => this.navigateToPage('billing'));
        }

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Click outside to close dropdowns
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Before unload
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        // Initialize toast system
        if (typeof ZovatuToast !== 'undefined') {
            window.toast = new ZovatuToast();
        }

        // Initialize modal system
        if (typeof ZovatuModal !== 'undefined') {
            window.modal = new ZovatuModal();
        }

        // Initialize other components as needed
        this.initializeCharts();
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        // Chart.js configuration will be handled by dashboard.js
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = 'Inter';
            Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        }
    }

    /**
     * Setup routing
     */
    setupRouting() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateToPage(e.state.page, false);
            }
        });

        // Set initial state
        const initialPage = this.getPageFromURL() || 'dashboard';
        history.replaceState({ page: initialPage }, '', `#${initialPage}`);
    }

    /**
     * Get page from URL hash
     */
    getPageFromURL() {
        const hash = window.location.hash.substring(1);
        const validPages = ['dashboard', 'billing', 'products', 'customers', 'invoices', 'reports', 'settings'];
        return validPages.includes(hash) ? hash : null;
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            // Load user settings
            const settings = zovatuStorage.getItem('settings') || {};
            this.applySettings(settings);

            // Update UI with current data
            this.updateDashboardStats();
            this.updateUserInfo();

        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    /**
     * Apply settings to the application
     */
    applySettings(settings) {
        // Apply theme
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }

        // Apply language
        if (settings.language) {
            document.documentElement.setAttribute('lang', settings.language);
        }

        // Update shop name in header
        const currentShopName = document.getElementById('currentShopName');
        if (currentShopName && settings.shopName) {
            currentShopName.textContent = settings.shopName;
        }
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats() {
        const invoices = zovatuStorage.getItem('invoices') || [];
        const products = zovatuStorage.getItem('products') || [];
        const customers = zovatuStorage.getItem('customers') || [];

        // Calculate totals
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalOrders = invoices.length;
        const totalProducts = products.length;
        const totalCustomers = customers.length;

        // Update UI
        const settings = zovatuStorage.getItem('settings') || {};
        const currencySymbol = settings.currencySymbol || '৳';

        this.updateElement('totalRevenue', `${currencySymbol}${totalRevenue.toLocaleString()}`);
        this.updateElement('totalOrders', totalOrders.toLocaleString());
        this.updateElement('totalProducts', totalProducts.toLocaleString());
        this.updateElement('totalCustomers', totalCustomers.toLocaleString());
    }

    /**
     * Update user information
     */
    updateUserInfo() {
        const settings = zovatuStorage.getItem('settings') || {};
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = settings.ownerName || 'Admin User';
        }
    }

    /**
     * Navigate to a specific page
     */
    navigateToPage(page, updateHistory = true) {
        // Validate page
        const validPages = ['dashboard', 'billing', 'products', 'customers', 'invoices', 'reports', 'settings'];
        if (!validPages.includes(page)) {
            console.warn(`Invalid page: ${page}`);
            return;
        }

        // Hide current page
        const currentPageElement = document.querySelector('.page.active');
        if (currentPageElement) {
            currentPageElement.classList.remove('active');
        }

        // Show new page
        const newPageElement = document.getElementById(`${page}Page`);
        if (newPageElement) {
            newPageElement.classList.add('active');
        }

        // Update navigation
        this.updateNavigation(page);

        // Update page title
        this.updatePageTitle(page);

        // Update URL
        if (updateHistory) {
            history.pushState({ page }, '', `#${page}`);
        }

        // Load page content if needed
        this.loadPageContent(page);

        // Update current page
        this.currentPage = page;

        // Close mobile sidebar if open
        if (this.mobileSidebarOpen) {
            this.toggleMobileSidebar();
        }

        // Trigger page change event
        this.triggerPageChange(page);
    }

    /**
     * Update navigation active state
     */
    updateNavigation(page) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));

        // Add active class to current page nav link
        const currentNavLink = document.querySelector(`[data-page="${page}"]`);
        if (currentNavLink) {
            currentNavLink.classList.add('active');
        }
    }

    /**
     * Update page title
     */
    updatePageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            billing: 'Billing',
            products: 'Products',
            customers: 'Customers',
            invoices: 'Invoices',
            reports: 'Reports',
            settings: 'Settings'
        };

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[page] || 'Dashboard';
        }

        // Update document title
        document.title = `${titles[page] || 'Dashboard'} - Zovatu Pro`;
    }

    /**
     * Load page content dynamically
     */
    async loadPageContent(page) {
        try {
            // Initialize page-specific functionality
            switch (page) {
                case 'dashboard':
                    if (typeof ZovatuDashboard !== 'undefined') {
                        window.dashboard = new ZovatuDashboard();
                    }
                    break;
                case 'billing':
                    if (typeof ZovatuBilling !== 'undefined') {
                        window.billing = new ZovatuBilling();
                    }
                    break;
                case 'products':
                    if (typeof ZovatuProducts !== 'undefined') {
                        window.products = new ZovatuProducts();
                    }
                    break;
                case 'customers':
                    if (typeof ZovatuCustomers !== 'undefined') {
                        window.customers = new ZovatuCustomers();
                    }
                    break;
                case 'invoices':
                    if (typeof ZovatuInvoices !== 'undefined') {
                        window.invoices = new ZovatuInvoices();
                    }
                    break;
                case 'reports':
                    if (typeof ZovatuReports !== 'undefined') {
                        window.reports = new ZovatuReports();
                    }
                    break;
                case 'settings':
                    if (typeof ZovatuSettings !== 'undefined') {
                        window.settings = new ZovatuSettings();
                    }
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${page} content:`, error);
        }
    }

    /**
     * Trigger page change event
     */
    triggerPageChange(page) {
        const event = new CustomEvent('pageChange', {
            detail: { page, previousPage: this.currentPage }
        });
        document.dispatchEvent(event);
    }

    /**
     * Toggle sidebar collapse
     */
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
            
            // Save preference
            zovatuStorage.setItem('sidebar_collapsed', this.sidebarCollapsed);
        }
    }

    /**
     * Toggle mobile sidebar
     */
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-sidebar-overlay');
        
        if (sidebar && overlay) {
            this.mobileSidebarOpen = !this.mobileSidebarOpen;
            sidebar.classList.toggle('mobile-open', this.mobileSidebarOpen);
            overlay.classList.toggle('active', this.mobileSidebarOpen);
        }
    }

    /**
     * Toggle shop selector dropdown
     */
    toggleShopSelector() {
        const shopSelector = document.querySelector('.shop-selector');
        if (shopSelector) {
            shopSelector.classList.toggle('active');
        }
    }

    /**
     * Handle global search
     */
    handleGlobalSearch(query) {
        if (query.length < 2) return;

        // Search across products, customers, and invoices
        const products = zovatuStorage.getItem('products') || [];
        const customers = zovatuStorage.getItem('customers') || [];
        const invoices = zovatuStorage.getItem('invoices') || [];

        const results = {
            products: products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.barcode.includes(query)
            ),
            customers: customers.filter(c => 
                c.name.toLowerCase().includes(query.toLowerCase()) ||
                c.phone.includes(query)
            ),
            invoices: invoices.filter(i => 
                i.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
                i.customerName.toLowerCase().includes(query.toLowerCase())
            )
        };

        // Show search results (implement search results UI)
        this.showSearchResults(results);
    }

    /**
     * Show search results
     */
    showSearchResults(results) {
        // Implement search results dropdown/modal
        console.log('Search results:', results);
    }

    /**
     * Handle quick actions
     */
    handleQuickAction(action) {
        switch (action) {
            case 'new-bill':
                this.navigateToPage('billing');
                break;
            case 'add-product':
                this.navigateToPage('products');
                // Trigger add product modal
                setTimeout(() => {
                    if (window.products && window.products.showAddModal) {
                        window.products.showAddModal();
                    }
                }, 100);
                break;
            case 'add-customer':
                this.navigateToPage('customers');
                // Trigger add customer modal
                setTimeout(() => {
                    if (window.customers && window.customers.showAddModal) {
                        window.customers.showAddModal();
                    }
                }, 100);
                break;
            case 'view-reports':
                this.navigateToPage('reports');
                break;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 1024;

        // Close mobile sidebar if switching to desktop
        if (wasMobile && !this.isMobile && this.mobileSidebarOpen) {
            this.toggleMobileSidebar();
        }
    }

    /**
     * Handle clicks outside dropdowns
     */
    handleOutsideClick(e) {
        // Close shop selector if clicking outside
        const shopSelector = document.querySelector('.shop-selector');
        if (shopSelector && !shopSelector.contains(e.target)) {
            shopSelector.classList.remove('active');
        }

        // Close mobile sidebar if clicking on overlay
        if (e.target.classList.contains('mobile-sidebar-overlay')) {
            this.toggleMobileSidebar();
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl/Cmd + key combinations
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.navigateToPage('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateToPage('billing');
                    break;
                case '3':
                    e.preventDefault();
                    this.navigateToPage('products');
                    break;
                case '4':
                    e.preventDefault();
                    this.navigateToPage('customers');
                    break;
                case '5':
                    e.preventDefault();
                    this.navigateToPage('invoices');
                    break;
                case '6':
                    e.preventDefault();
                    this.navigateToPage('reports');
                    break;
                case 'k':
                    e.preventDefault();
                    document.getElementById('globalSearch')?.focus();
                    break;
            }
        }

        // Escape key
        if (e.key === 'Escape') {
            // Close any open modals or dropdowns
            document.querySelector('.shop-selector.active')?.classList.remove('active');
            if (this.mobileSidebarOpen) {
                this.toggleMobileSidebar();
            }
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload() {
        // Save any pending data
        // Cleanup if needed
    }

    /**
     * Show loading screen
     */
    showLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.classList.remove('hidden');
        if (app) app.classList.add('hidden');
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        const app = document.getElementById('app');
        
        setTimeout(() => {
            if (loadingScreen) loadingScreen.classList.add('hidden');
            if (app) app.classList.remove('hidden');
            this.isLoading = false;
        }, 1000); // Show loading for at least 1 second
    }

    /**
     * Show error message
     */
    showError(message) {
        if (window.toast) {
            window.toast.error('Error', message);
        } else {
            alert(`Error: ${message}`);
        }
    }

    /**
     * Update element content safely
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * Get current settings
     */
    getSettings() {
        return zovatuStorage.getItem('settings') || {};
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        zovatuStorage.setItem('settings', updatedSettings);
        this.applySettings(updatedSettings);
        return updatedSettings;
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        const settings = this.getSettings();
        const symbol = settings.currencySymbol || '৳';
        return `${symbol}${amount.toLocaleString()}`;
    }

    /**
     * Format date
     */
    formatDate(date) {
        const settings = this.getSettings();
        const format = settings.dateFormat || 'DD/MM/YYYY';
        
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        // Simple date formatting
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year);
    }

    /**
     * Generate unique ID
     */
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
    }

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.zovatuApp = new ZovatuApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZovatuApp;
}

