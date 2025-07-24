/**
 * Zovatu Smart Billing Tool - Storage Management System
 * Handles all data persistence using localStorage with backup capabilities
 */

class ZovatuStorage {
    constructor() {
        this.storagePrefix = 'zovatu_billing_';
        this.version = '2.0.0';
        this.initializeStorage();
    }

    /**
     * Initialize storage with default data structure
     */
    initializeStorage() {
        // Check if this is first time setup
        if (!this.getItem('initialized')) {
            this.setItem('initialized', true);
            this.setItem('version', this.version);
            this.setItem('setup_completed', false);
            this.setItem('shop_profile', null);
            this.setItem('products', []);
            this.setItem('bills', []);
            this.setItem('settings', this.getDefaultSettings());
            this.setItem('analytics', this.getDefaultAnalytics());
            this.setItem('shop_status', {
                isOpen: false,
                openedAt: null,
                closedAt: null,
                dailySales: 0,
                dailyProfit: 0
            });
        }

        // Auto-backup setup
        this.setupAutoBackup();
    }

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            billingMode: 'ultra', // 'simple' or 'ultra'
            currency: {
                code: 'USD',
                symbol: '$',
                name: 'US Dollar'
            },
            print: {
                autoPrint: false,
                thermalMode: false,
                includeBarcode: true,
                includeQR: true
            },
            notifications: {
                lowStockThreshold: 10,
                showToasts: true,
                soundEnabled: true
            },
            backup: {
                autoBackup: true,
                backupInterval: 24, // hours
                lastBackup: null
            },
            theme: {
                mode: 'light', // 'light' or 'dark'
                accentColor: '#ff6b35'
            }
        };
    }

    /**
     * Get default analytics structure
     */
    getDefaultAnalytics() {
        return {
            totalSales: 0,
            totalProfit: 0,
            totalLoss: 0,
            stockValue: 0,
            productCount: 0,
            dailyData: [],
            monthlyData: [],
            topProducts: [],
            lowStockProducts: []
        };
    }

    /**
     * Generic storage methods
     */
    setItem(key, value) {
        try {
            const fullKey = this.storagePrefix + key;
            const serializedValue = JSON.stringify({
                data: value,
                timestamp: new Date().toISOString(),
                version: this.version
            });
            localStorage.setItem(fullKey, serializedValue);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        try {
            const fullKey = this.storagePrefix + key;
            const item = localStorage.getItem(fullKey);
            if (!item) return defaultValue;
            
            const parsed = JSON.parse(item);
            return parsed.data;
        } catch (error) {
            console.error('Storage retrieval error:', error);
            return defaultValue;
        }
    }

    removeItem(key) {
        const fullKey = this.storagePrefix + key;
        localStorage.removeItem(fullKey);
    }

    /**
     * Shop Profile Management
     */
    saveShopProfile(profile) {
        const shopProfile = {
            ...profile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.setItem('shop_profile', shopProfile);
        this.setItem('setup_completed', true);
        return shopProfile;
    }

    getShopProfile() {
        return this.getItem('shop_profile');
    }

    updateShopProfile(updates) {
        const currentProfile = this.getShopProfile();
        if (!currentProfile) return null;

        const updatedProfile = {
            ...currentProfile,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.setItem('shop_profile', updatedProfile);
        return updatedProfile;
    }

    /**
     * Product Management
     */
    saveProduct(product) {
        const products = this.getProducts();
        const newProduct = {
            id: this.generateId(),
            ...product,
            barcode: product.barcode || this.generateBarcode(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        this.setItem('products', products);
        this.updateAnalytics();
        return newProduct;
    }

    getProducts() {
        return this.getItem('products', []);
    }

    getProductByBarcode(barcode) {
        const products = this.getProducts();
        return products.find(product => product.barcode === barcode);
    }

    getProductById(id) {
        const products = this.getProducts();
        return products.find(product => product.id === id);
    }

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(product => product.id === id);
        
        if (index === -1) return null;

        products[index] = {
            ...products[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.setItem('products', products);
        this.updateAnalytics();
        return products[index];
    }

    deleteProduct(id) {
        const products = this.getProducts();
        const filteredProducts = products.filter(product => product.id !== id);
        this.setItem('products', filteredProducts);
        this.updateAnalytics();
        return true;
    }

    updateProductStock(id, quantity, operation = 'subtract') {
        const product = this.getProductById(id);
        if (!product) return null;

        const newStock = operation === 'subtract' 
            ? product.stock - quantity 
            : product.stock + quantity;

        return this.updateProduct(id, { stock: Math.max(0, newStock) });
    }

    /**
     * Bill Management
     */
    saveBill(bill) {
        const bills = this.getBills();
        const newBill = {
            id: this.generateId(),
            billNumber: this.generateBillNumber(),
            ...bill,
            createdAt: new Date().toISOString()
        };
        
        bills.unshift(newBill); // Add to beginning for recent bills
        this.setItem('bills', bills);
        
        // Update product stock for ultra mode bills
        if (bill.items && bill.items.length > 0) {
            bill.items.forEach(item => {
                this.updateProductStock(item.productId, item.quantity, 'subtract');
            });
        }
        
        this.updateDailySales(bill.total, bill.profit || 0);
        this.updateAnalytics();
        return newBill;
    }

    getBills() {
        return this.getItem('bills', []);
    }

    getRecentBills(limit = 10) {
        const bills = this.getBills();
        return bills.slice(0, limit);
    }

    getBillById(id) {
        const bills = this.getBills();
        return bills.find(bill => bill.id === id);
    }

    /**
     * Settings Management
     */
    getSettings() {
        return this.getItem('settings', this.getDefaultSettings());
    }

    updateSettings(updates) {
        const currentSettings = this.getSettings();
        const newSettings = this.deepMerge(currentSettings, updates);
        this.setItem('settings', newSettings);
        return newSettings;
    }

    /**
     * Shop Status Management
     */
    getShopStatus() {
        return this.getItem('shop_status', {
            isOpen: false,
            openedAt: null,
            closedAt: null,
            dailySales: 0,
            dailyProfit: 0
        });
    }

    openShop() {
        const status = {
            isOpen: true,
            openedAt: new Date().toISOString(),
            closedAt: null,
            dailySales: 0,
            dailyProfit: 0
        };
        this.setItem('shop_status', status);
        return status;
    }

    closeShop() {
        const currentStatus = this.getShopStatus();
        const status = {
            ...currentStatus,
            isOpen: false,
            closedAt: new Date().toISOString()
        };
        this.setItem('shop_status', status);
        
        // Save daily summary
        this.saveDailySummary(currentStatus);
        return status;
    }

    updateDailySales(amount, profit = 0) {
        const status = this.getShopStatus();
        status.dailySales += amount;
        status.dailyProfit += profit;
        this.setItem('shop_status', status);
    }

    saveDailySummary(status) {
        const analytics = this.getAnalytics();
        const today = new Date().toISOString().split('T')[0];
        
        const dailyEntry = {
            date: today,
            sales: status.dailySales,
            profit: status.dailyProfit,
            openedAt: status.openedAt,
            closedAt: status.closedAt
        };
        
        // Remove existing entry for today if exists
        analytics.dailyData = analytics.dailyData.filter(entry => entry.date !== today);
        analytics.dailyData.unshift(dailyEntry);
        
        // Keep only last 30 days
        analytics.dailyData = analytics.dailyData.slice(0, 30);
        
        this.setItem('analytics', analytics);
    }

    /**
     * Analytics Management
     */
    getAnalytics() {
        return this.getItem('analytics', this.getDefaultAnalytics());
    }

    updateAnalytics() {
        const products = this.getProducts();
        const bills = this.getBills();
        
        const analytics = {
            totalSales: bills.reduce((sum, bill) => sum + (bill.total || 0), 0),
            totalProfit: bills.reduce((sum, bill) => sum + (bill.profit || 0), 0),
            totalLoss: 0, // Calculate based on expired/damaged products
            stockValue: products.reduce((sum, product) => sum + (product.costPrice * product.stock), 0),
            productCount: products.length,
            dailyData: this.getAnalytics().dailyData || [],
            monthlyData: this.calculateMonthlyData(),
            topProducts: this.calculateTopProducts(),
            lowStockProducts: this.getLowStockProducts()
        };
        
        this.setItem('analytics', analytics);
        return analytics;
    }

    calculateMonthlyData() {
        const dailyData = this.getAnalytics().dailyData || [];
        const monthlyMap = new Map();
        
        dailyData.forEach(day => {
            const month = day.date.substring(0, 7); // YYYY-MM
            if (!monthlyMap.has(month)) {
                monthlyMap.set(month, { sales: 0, profit: 0 });
            }
            const monthData = monthlyMap.get(month);
            monthData.sales += day.sales;
            monthData.profit += day.profit;
        });
        
        return Array.from(monthlyMap.entries()).map(([month, data]) => ({
            month,
            ...data
        })).slice(0, 12); // Last 12 months
    }

    calculateTopProducts() {
        const bills = this.getBills();
        const productSales = new Map();
        
        bills.forEach(bill => {
            if (bill.items) {
                bill.items.forEach(item => {
                    const current = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
                    current.quantity += item.quantity;
                    current.revenue += item.total;
                    productSales.set(item.productId, current);
                });
            }
        });
        
        const products = this.getProducts();
        return Array.from(productSales.entries())
            .map(([productId, sales]) => {
                const product = products.find(p => p.id === productId);
                return product ? { ...product, ...sales } : null;
            })
            .filter(Boolean)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }

    getLowStockProducts() {
        const products = this.getProducts();
        const settings = this.getSettings();
        const threshold = settings.notifications.lowStockThreshold;
        
        return products.filter(product => product.stock <= threshold);
    }

    /**
     * Backup and Export
     */
    createBackup() {
        const backup = {
            version: this.version,
            timestamp: new Date().toISOString(),
            data: {
                shop_profile: this.getShopProfile(),
                products: this.getProducts(),
                bills: this.getBills(),
                settings: this.getSettings(),
                analytics: this.getAnalytics(),
                shop_status: this.getShopStatus()
            }
        };
        
        // Update last backup time
        this.updateSettings({
            backup: {
                ...this.getSettings().backup,
                lastBackup: new Date().toISOString()
            }
        });
        
        return backup;
    }

    downloadBackup() {
        const backup = this.createBackup();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `zovatu-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return backup;
    }

    restoreBackup(backupData) {
        try {
            if (!backupData.data) throw new Error('Invalid backup format');
            
            // Restore all data
            Object.entries(backupData.data).forEach(([key, value]) => {
                if (value !== null) {
                    this.setItem(key, value);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Backup restoration error:', error);
            return false;
        }
    }

    setupAutoBackup() {
        const settings = this.getSettings();
        if (!settings.backup.autoBackup) return;
        
        const lastBackup = settings.backup.lastBackup;
        const backupInterval = settings.backup.backupInterval * 60 * 60 * 1000; // Convert hours to ms
        
        if (!lastBackup || (Date.now() - new Date(lastBackup).getTime()) > backupInterval) {
            // Auto backup needed
            setTimeout(() => {
                this.downloadBackup();
            }, 5000); // Delay 5 seconds after app load
        }
        
        // Set up recurring backup
        setInterval(() => {
            if (this.getSettings().backup.autoBackup) {
                this.downloadBackup();
            }
        }, backupInterval);
    }

    /**
     * Utility Methods
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateBarcode() {
        // Generate a 13-digit EAN barcode
        const timestamp = Date.now().toString();
        const random = Math.random().toString().substr(2, 4);
        return (timestamp + random).substr(0, 13);
    }

    generateBillNumber() {
        const bills = this.getBills();
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const todayBills = bills.filter(bill => 
            bill.createdAt.split('T')[0].replace(/-/g, '') === today
        );
        const sequence = (todayBills.length + 1).toString().padStart(3, '0');
        return `ZB${today}${sequence}`;
    }

    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Search and Filter Methods
     */
    searchProducts(query) {
        const products = this.getProducts();
        const lowercaseQuery = query.toLowerCase();
        
        return products.filter(product => 
            product.name.toLowerCase().includes(lowercaseQuery) ||
            product.barcode.includes(query) ||
            (product.category && product.category.toLowerCase().includes(lowercaseQuery)) ||
            (product.description && product.description.toLowerCase().includes(lowercaseQuery))
        );
    }

    filterBills(filters) {
        const bills = this.getBills();
        
        return bills.filter(bill => {
            if (filters.dateFrom && bill.createdAt < filters.dateFrom) return false;
            if (filters.dateTo && bill.createdAt > filters.dateTo) return false;
            if (filters.minAmount && bill.total < filters.minAmount) return false;
            if (filters.maxAmount && bill.total > filters.maxAmount) return false;
            if (filters.mode && bill.mode !== filters.mode) return false;
            return true;
        });
    }

    /**
     * Data Validation
     */
    validateProduct(product) {
        const errors = [];
        
        if (!product.name || product.name.trim().length === 0) {
            errors.push('Product name is required');
        }
        
        if (!product.costPrice || product.costPrice <= 0) {
            errors.push('Cost price must be greater than 0');
        }
        
        if (!product.sellingPrice || product.sellingPrice <= 0) {
            errors.push('Selling price must be greater than 0');
        }
        
        if (product.sellingPrice <= product.costPrice) {
            errors.push('Selling price must be greater than cost price');
        }
        
        if (product.stock < 0) {
            errors.push('Stock cannot be negative');
        }
        
        return errors;
    }

    validateShopProfile(profile) {
        const errors = [];
        
        if (!profile.shopName || profile.shopName.trim().length === 0) {
            errors.push('Shop name is required');
        }
        
        if (!profile.shopAddress || profile.shopAddress.trim().length === 0) {
            errors.push('Shop address is required');
        }
        
        if (!profile.shopMobile || profile.shopMobile.trim().length === 0) {
            errors.push('Mobile number is required');
        }
        
        return errors;
    }

    /**
     * Clear all data (for testing or reset)
     */
    clearAllData() {
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith(this.storagePrefix)
        );
        
        keys.forEach(key => localStorage.removeItem(key));
        this.initializeStorage();
    }

    /**
     * Get storage usage statistics
     */
    getStorageStats() {
        let totalSize = 0;
        const stats = {};
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                const size = localStorage.getItem(key).length;
                totalSize += size;
                const dataKey = key.replace(this.storagePrefix, '');
                stats[dataKey] = size;
            }
        });
        
        return {
            totalSize,
            totalSizeKB: Math.round(totalSize / 1024),
            breakdown: stats
        };
    }
}

// Export for use in other modules
window.ZovatuStorage = ZovatuStorage;

