// Zovatu Billing Tool - Storage Utility
// Handles localStorage and IndexedDB operations for client-side data persistence

class BillingStorage {
    constructor() {
        this.prefix = 'zovatu_billing_';
        this.currentUser = localStorage.getItem('loggedInUser') || 'guest';
        this.userPrefix = `${this.prefix}${this.currentUser}_`;
        this.initializeStorage();
    }

    // Initialize storage with default structure
    initializeStorage() {
        const defaultData = {
            shops: [],
            currentShop: null,
            settings: {
                autoBackup: true,
                backupFrequency: 'daily',
                currency: 'BDT',
                invoicePrefix: 'INV-',
                printEnabled: true
            }
        };

        // Check if user data exists, if not create it
        if (!this.getData('shops')) {
            this.setData('shops', defaultData.shops);
        }
        if (!this.getData('settings')) {
            this.setData('settings', defaultData.settings);
        }
    }

    // Generic data operations
    setData(key, data) {
        try {
            const fullKey = this.userPrefix + key;
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    getData(key) {
        try {
            const fullKey = this.userPrefix + key;
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    removeData(key) {
        try {
            const fullKey = this.userPrefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Error removing data:', error);
            return false;
        }
    }

    // Shop operations
    saveShop(shop) {
        const shops = this.getData('shops') || [];
        const existingIndex = shops.findIndex(s => s.id === shop.id);
        
        if (existingIndex >= 0) {
            shops[existingIndex] = shop;
        } else {
            shops.push(shop);
        }
        
        return this.setData('shops', shops);
    }

    getShops() {
        return this.getData('shops') || [];
    }

    getShop(shopId) {
        const shops = this.getShops();
        return shops.find(shop => shop.id === shopId) || null;
    }

    deleteShop(shopId) {
        const shops = this.getShops();
        const filteredShops = shops.filter(shop => shop.id !== shopId);
        
        // Also remove all related data
        this.removeData(`products_${shopId}`);
        this.removeData(`invoices_${shopId}`);
        this.removeData(`salesmen_${shopId}`);
        
        return this.setData('shops', filteredShops);
    }

    // Current shop operations
    setCurrentShop(shopId) {
        return this.setData('currentShop', shopId);
    }

    getCurrentShop() {
        const shopId = this.getData('currentShop');
        return shopId ? this.getShop(shopId) : null;
    }

    // Product operations
    saveProduct(shopId, product) {
        const products = this.getProducts(shopId);
        const existingIndex = products.findIndex(p => p.id === product.id);
        
        if (existingIndex >= 0) {
            products[existingIndex] = product;
        } else {
            products.push(product);
        }
        
        return this.setData(`products_${shopId}`, products);
    }

    getProducts(shopId) {
        return this.getData(`products_${shopId}`) || [];
    }

    getProduct(shopId, productId) {
        const products = this.getProducts(shopId);
        return products.find(product => product.id === productId) || null;
    }

    deleteProduct(shopId, productId) {
        const products = this.getProducts(shopId);
        const filteredProducts = products.filter(product => product.id !== productId);
        return this.setData(`products_${shopId}`, filteredProducts);
    }

    // Invoice operations
    saveInvoice(shopId, invoice) {
        const invoices = this.getInvoices(shopId);
        const existingIndex = invoices.findIndex(i => i.id === invoice.id);
        
        if (existingIndex >= 0) {
            invoices[existingIndex] = invoice;
        } else {
            invoices.push(invoice);
        }
        
        return this.setData(`invoices_${shopId}`, invoices);
    }

    getInvoices(shopId, filters = {}) {
        let invoices = this.getData(`invoices_${shopId}`) || [];
        
        // Apply filters
        if (filters.date) {
            const filterDate = new Date(filters.date).toDateString();
            invoices = invoices.filter(invoice => 
                new Date(invoice.date).toDateString() === filterDate
            );
        }
        
        if (filters.status) {
            invoices = invoices.filter(invoice => invoice.status === filters.status);
        }
        
        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            invoices = invoices.filter(invoice => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate >= start && invoiceDate <= end;
            });
        }
        
        // Sort by date (newest first)
        return invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getInvoice(shopId, invoiceId) {
        const invoices = this.getInvoices(shopId);
        return invoices.find(invoice => invoice.id === invoiceId) || null;
    }

    deleteInvoice(shopId, invoiceId) {
        const invoices = this.getInvoices(shopId);
        const filteredInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
        return this.setData(`invoices_${shopId}`, filteredInvoices);
    }

    // Salesman operations
    saveSalesman(shopId, salesman) {
        const salesmen = this.getSalesmen(shopId);
        const existingIndex = salesmen.findIndex(s => s.id === salesman.id);
        
        if (existingIndex >= 0) {
            salesmen[existingIndex] = salesman;
        } else {
            salesmen.push(salesman);
        }
        
        return this.setData(`salesmen_${shopId}`, salesmen);
    }

    getSalesmen(shopId) {
        return this.getData(`salesmen_${shopId}`) || [];
    }

    getSalesman(shopId, salesmanId) {
        const salesmen = this.getSalesmen(shopId);
        return salesmen.find(salesman => salesman.id === salesmanId) || null;
    }

    deleteSalesman(shopId, salesmanId) {
        const salesmen = this.getSalesmen(shopId);
        const filteredSalesmen = salesmen.filter(salesman => salesman.id !== salesmanId);
        return this.setData(`salesmen_${shopId}`, filteredSalesmen);
    }

    // Settings operations
    saveSettings(settings) {
        const currentSettings = this.getData('settings') || {};
        const updatedSettings = { ...currentSettings, ...settings };
        return this.setData('settings', updatedSettings);
    }

    getSettings() {
        return this.getData('settings') || {
            autoBackup: true,
            backupFrequency: 'daily',
            currency: 'BDT',
            invoicePrefix: 'INV-',
            printEnabled: true
        };
    }

    // Backup operations
    exportData() {
        const data = {
            shops: this.getData('shops'),
            settings: this.getData('settings'),
            currentShop: this.getData('currentShop'),
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        // Add all shop-specific data
        const shops = this.getShops();
        shops.forEach(shop => {
            data[`products_${shop.id}`] = this.getProducts(shop.id);
            data[`invoices_${shop.id}`] = this.getInvoices(shop.id);
            data[`salesmen_${shop.id}`] = this.getSalesmen(shop.id);
        });

        return data;
    }

    importData(data) {
        try {
            // Validate data structure
            if (!data.shops || !Array.isArray(data.shops)) {
                throw new Error('Invalid backup data format');
            }

            // Import main data
            this.setData('shops', data.shops);
            if (data.settings) this.setData('settings', data.settings);
            if (data.currentShop) this.setData('currentShop', data.currentShop);

            // Import shop-specific data
            data.shops.forEach(shop => {
                if (data[`products_${shop.id}`]) {
                    this.setData(`products_${shop.id}`, data[`products_${shop.id}`]);
                }
                if (data[`invoices_${shop.id}`]) {
                    this.setData(`invoices_${shop.id}`, data[`invoices_${shop.id}`]);
                }
                if (data[`salesmen_${shop.id}`]) {
                    this.setData(`salesmen_${shop.id}`, data[`salesmen_${shop.id}`]);
                }
            });

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith(this.userPrefix)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }

    clearAllData() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.userPrefix)) {
                localStorage.removeItem(key);
            }
        });
        this.initializeStorage();
    }

    // Statistics
    getShopStats(shopId) {
        const products = this.getProducts(shopId);
        const invoices = this.getInvoices(shopId);
        const salesmen = this.getSalesmen(shopId);

        const totalSales = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
        const todayInvoices = invoices.filter(invoice => 
            new Date(invoice.date).toDateString() === new Date().toDateString()
        );
        const todaySales = todayInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

        return {
            totalProducts: products.length,
            totalInvoices: invoices.length,
            totalSalesmen: salesmen.length,
            totalSales: totalSales,
            todayInvoices: todayInvoices.length,
            todaySales: todaySales,
            lowStockProducts: products.filter(p => p.stock < 10).length
        };
    }

    // Search functionality
    searchProducts(shopId, query) {
        const products = this.getProducts(shopId);
        const searchTerm = query.toLowerCase();
        
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.code.toLowerCase().includes(searchTerm) ||
            product.barcode.includes(searchTerm) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm))
        );
    }

    searchInvoices(shopId, query) {
        const invoices = this.getInvoices(shopId);
        const searchTerm = query.toLowerCase();
        
        return invoices.filter(invoice => 
            invoice.invoice_number.toLowerCase().includes(searchTerm) ||
            (invoice.customer_name && invoice.customer_name.toLowerCase().includes(searchTerm)) ||
            (invoice.customer_phone && invoice.customer_phone.includes(searchTerm))
        );
    }
}

// Create global storage instance
window.billingStorage = new BillingStorage();

