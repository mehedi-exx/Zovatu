/* ===================================
   Zovatu Smart Billing Tool - Storage
   Data Storage and Management Module
   =================================== */

// Storage management class
class ZovatuStorage {
    constructor() {
        this.storagePrefix = 'zovatu_';
        this.version = '2.0';
        this.init();
    }

    // Initialize storage
    init() {
        this.checkVersion();
        this.ensureDefaultData();
    }

    // Check storage version and migrate if needed
    checkVersion() {
        const currentVersion = this.get('version');
        if (currentVersion !== this.version) {
            this.migrateData(currentVersion, this.version);
            this.set('version', this.version);
        }
    }

    // Migrate data between versions
    migrateData(fromVersion, toVersion) {
        console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
        
        // Migration logic can be added here for future versions
        if (!fromVersion) {
            // First time setup
            this.ensureDefaultData();
        }
    }

    // Ensure default data exists
    ensureDefaultData() {
        // Default settings
        if (!this.get('settings')) {
            this.set('settings', {
                currency: 'BDT',
                taxRate: 0,
                discountRate: 0,
                language: 'en',
                theme: 'light',
                autoBackup: true,
                printSettings: {
                    paperSize: 'A4',
                    orientation: 'portrait',
                    includeBarcode: true,
                    includeQR: false
                },
                businessInfo: {
                    name: '',
                    address: '',
                    phone: '',
                    email: '',
                    website: '',
                    logo: ''
                }
            });
        }

        // Default shops array
        if (!this.get('shops')) {
            this.set('shops', []);
        }

        // Default products array
        if (!this.get('products')) {
            this.set('products', []);
        }

        // Default invoices array
        if (!this.get('invoices')) {
            this.set('invoices', []);
        }

        // Default users array
        if (!this.get('users')) {
            this.set('users', [
                {
                    id: 'admin_001',
                    username: 'admin',
                    password: 'admin123', // In production, this should be hashed
                    role: 'admin',
                    name: 'Administrator',
                    email: 'admin@zovatu.com',
                    phone: '',
                    avatar: '',
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    isActive: true
                }
            ]);
        }

        // Default categories
        if (!this.get('categories')) {
            this.set('categories', [
                { id: 'cat_001', name: 'Electronics', description: 'Electronic items and gadgets' },
                { id: 'cat_002', name: 'Clothing', description: 'Apparel and fashion items' },
                { id: 'cat_003', name: 'Food & Beverages', description: 'Food and drink items' },
                { id: 'cat_004', name: 'Books', description: 'Books and educational materials' },
                { id: 'cat_005', name: 'Home & Garden', description: 'Home improvement and garden items' }
            ]);
        }

        // Current session
        if (!this.get('currentSession')) {
            this.set('currentSession', {
                userId: null,
                shopId: null,
                loginTime: null,
                isLoggedIn: false
            });
        }
    }

    // Get data from localStorage
    get(key) {
        try {
            const item = localStorage.getItem(this.storagePrefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting data from storage:', error);
            return null;
        }
    }

    // Set data to localStorage
    set(key, value) {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting data to storage:', error);
            return false;
        }
    }

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(this.storagePrefix + key);
            return true;
        } catch (error) {
            console.error('Error removing data from storage:', error);
            return false;
        }
    }

    // Clear all data
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // Get all shops
    getShops() {
        return this.get('shops') || [];
    }

    // Add new shop
    addShop(shop) {
        const shops = this.getShops();
        shop.id = shop.id || ZovatuUtils.generateId('shop_');
        shop.createdAt = shop.createdAt || new Date().toISOString();
        shop.isActive = shop.isActive !== undefined ? shop.isActive : true;
        
        shops.push(shop);
        return this.set('shops', shops);
    }

    // Update shop
    updateShop(shopId, updates) {
        const shops = this.getShops();
        const index = shops.findIndex(shop => shop.id === shopId);
        
        if (index !== -1) {
            shops[index] = { ...shops[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set('shops', shops);
        }
        return false;
    }

    // Delete shop
    deleteShop(shopId) {
        const shops = this.getShops();
        const filteredShops = shops.filter(shop => shop.id !== shopId);
        return this.set('shops', filteredShops);
    }

    // Get shop by ID
    getShop(shopId) {
        const shops = this.getShops();
        return shops.find(shop => shop.id === shopId) || null;
    }

    // Get all products
    getProducts(shopId = null) {
        const products = this.get('products') || [];
        if (shopId) {
            return products.filter(product => product.shopId === shopId);
        }
        return products;
    }

    // Add new product
    addProduct(product) {
        const products = this.getProducts();
        product.id = product.id || ZovatuUtils.generateId('prod_');
        product.createdAt = product.createdAt || new Date().toISOString();
        product.isActive = product.isActive !== undefined ? product.isActive : true;
        
        products.push(product);
        return this.set('products', products);
    }

    // Update product
    updateProduct(productId, updates) {
        const products = this.getProducts();
        const index = products.findIndex(product => product.id === productId);
        
        if (index !== -1) {
            products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set('products', products);
        }
        return false;
    }

    // Delete product
    deleteProduct(productId) {
        const products = this.getProducts();
        const filteredProducts = products.filter(product => product.id !== productId);
        return this.set('products', filteredProducts);
    }

    // Get product by ID
    getProduct(productId) {
        const products = this.getProducts();
        return products.find(product => product.id === productId) || null;
    }

    // Search products
    searchProducts(query, shopId = null) {
        const products = this.getProducts(shopId);
        const searchTerm = query.toLowerCase();
        
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm) ||
            product.barcode.toLowerCase().includes(searchTerm) ||
            (product.category && product.category.toLowerCase().includes(searchTerm))
        );
    }

    // Get all invoices
    getInvoices(shopId = null) {
        const invoices = this.get('invoices') || [];
        if (shopId) {
            return invoices.filter(invoice => invoice.shopId === shopId);
        }
        return invoices;
    }

    // Add new invoice
    addInvoice(invoice) {
        const invoices = this.getInvoices();
        invoice.id = invoice.id || ZovatuUtils.generateId('inv_');
        invoice.invoiceNumber = invoice.invoiceNumber || this.generateInvoiceNumber();
        invoice.createdAt = invoice.createdAt || new Date().toISOString();
        invoice.status = invoice.status || 'completed';
        
        invoices.push(invoice);
        return this.set('invoices', invoices);
    }

    // Update invoice
    updateInvoice(invoiceId, updates) {
        const invoices = this.getInvoices();
        const index = invoices.findIndex(invoice => invoice.id === invoiceId);
        
        if (index !== -1) {
            invoices[index] = { ...invoices[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set('invoices', invoices);
        }
        return false;
    }

    // Delete invoice
    deleteInvoice(invoiceId) {
        const invoices = this.getInvoices();
        const filteredInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
        return this.set('invoices', filteredInvoices);
    }

    // Generate invoice number
    generateInvoiceNumber() {
        const invoices = this.getInvoices();
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const prefix = `INV-${year}${month}${day}`;
        const todayInvoices = invoices.filter(inv => 
            inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix)
        );
        
        const nextNumber = String(todayInvoices.length + 1).padStart(3, '0');
        return `${prefix}-${nextNumber}`;
    }

    // Get all users
    getUsers() {
        return this.get('users') || [];
    }

    // Add new user
    addUser(user) {
        const users = this.getUsers();
        user.id = user.id || ZovatuUtils.generateId('user_');
        user.createdAt = user.createdAt || new Date().toISOString();
        user.isActive = user.isActive !== undefined ? user.isActive : true;
        
        users.push(user);
        return this.set('users', users);
    }

    // Update user
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(user => user.id === userId);
        
        if (index !== -1) {
            users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set('users', users);
        }
        return false;
    }

    // Delete user
    deleteUser(userId) {
        const users = this.getUsers();
        const filteredUsers = users.filter(user => user.id !== userId);
        return this.set('users', filteredUsers);
    }

    // Get user by ID
    getUser(userId) {
        const users = this.getUsers();
        return users.find(user => user.id === userId) || null;
    }

    // Authenticate user
    authenticateUser(username, password) {
        const users = this.getUsers();
        const user = users.find(u => 
            u.username === username && 
            u.password === password && 
            u.isActive
        );
        
        if (user) {
            // Update last login
            this.updateUser(user.id, { lastLogin: new Date().toISOString() });
            
            // Set current session
            this.setCurrentSession({
                userId: user.id,
                shopId: null,
                loginTime: new Date().toISOString(),
                isLoggedIn: true
            });
            
            return user;
        }
        
        return null;
    }

    // Get current session
    getCurrentSession() {
        return this.get('currentSession') || {
            userId: null,
            shopId: null,
            loginTime: null,
            isLoggedIn: false
        };
    }

    // Set current session
    setCurrentSession(session) {
        return this.set('currentSession', session);
    }

    // Logout user
    logout() {
        return this.setCurrentSession({
            userId: null,
            shopId: null,
            loginTime: null,
            isLoggedIn: false
        });
    }

    // Get settings
    getSettings() {
        return this.get('settings') || {};
    }

    // Update settings
    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        return this.set('settings', newSettings);
    }

    // Get categories
    getCategories() {
        return this.get('categories') || [];
    }

    // Add category
    addCategory(category) {
        const categories = this.getCategories();
        category.id = category.id || ZovatuUtils.generateId('cat_');
        categories.push(category);
        return this.set('categories', categories);
    }

    // Export all data
    exportData() {
        const data = {
            version: this.version,
            exportDate: new Date().toISOString(),
            shops: this.getShops(),
            products: this.getProducts(),
            invoices: this.getInvoices(),
            users: this.getUsers(),
            categories: this.getCategories(),
            settings: this.getSettings()
        };
        
        return data;
    }

    // Import data
    importData(data) {
        try {
            if (data.shops) this.set('shops', data.shops);
            if (data.products) this.set('products', data.products);
            if (data.invoices) this.set('invoices', data.invoices);
            if (data.users) this.set('users', data.users);
            if (data.categories) this.set('categories', data.categories);
            if (data.settings) this.set('settings', data.settings);
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Get storage usage
    getStorageUsage() {
        let totalSize = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                totalSize += localStorage.getItem(key).length;
            }
        });
        
        return {
            used: totalSize,
            formatted: ZovatuUtils.formatFileSize(totalSize),
            percentage: Math.round((totalSize / (5 * 1024 * 1024)) * 100) // Assuming 5MB limit
        };
    }

    // Backup data to file
    backupToFile() {
        const data = this.exportData();
        const filename = `zovatu_backup_${ZovatuUtils.formatDate(new Date(), 'YYYY-MM-DD')}.json`;
        const jsonString = ZovatuUtils.stringifyJSON(data);
        
        ZovatuUtils.downloadFile(jsonString, filename, 'application/json');
        return true;
    }

    // Restore data from file
    restoreFromFile(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const success = this.importData(data);
                callback(success, success ? 'Data restored successfully!' : 'Failed to restore data');
            } catch (error) {
                callback(false, 'Invalid backup file format');
            }
        };
        reader.readAsText(file);
    }
}

// Create global storage instance
const ZovatuStore = new ZovatuStorage();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ZovatuStorage, ZovatuStore };
}

