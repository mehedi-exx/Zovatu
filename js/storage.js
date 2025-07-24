/**
 * Zovatu Pro - Storage Management System
 * Handles all data persistence using localStorage with advanced features
 */

class ZovatuStorage {
    constructor() {
        this.prefix = 'zovatu_pro_';
        this.version = '1.0.0';
        this.encryptionKey = 'zovatu_secure_key_2024';
        this.init();
    }

    /**
     * Initialize storage system
     */
    init() {
        this.checkVersion();
        this.setupAutoBackup();
    }

    /**
     * Check and handle version changes
     */
    checkVersion() {
        const storedVersion = this.getItem('app_version');
        if (!storedVersion || storedVersion !== this.version) {
            this.handleVersionUpdate(storedVersion, this.version);
            this.setItem('app_version', this.version);
        }
    }

    /**
     * Handle version updates and migrations
     */
    handleVersionUpdate(oldVersion, newVersion) {
        console.log(`Updating from version ${oldVersion} to ${newVersion}`);
        // Add migration logic here if needed
    }

    /**
     * Set item in localStorage
     */
    setItem(key, value, encrypt = false) {
        try {
            const fullKey = this.prefix + key;
            let dataToStore = {
                value: value,
                timestamp: new Date().toISOString(),
                version: this.version,
                encrypted: encrypt
            };

            if (encrypt) {
                dataToStore.value = this.encrypt(JSON.stringify(value));
            }

            localStorage.setItem(fullKey, JSON.stringify(dataToStore));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    /**
     * Get item from localStorage
     */
    getItem(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const item = localStorage.getItem(fullKey);
            
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);
            
            if (parsed.encrypted) {
                const decrypted = this.decrypt(parsed.value);
                return JSON.parse(decrypted);
            }

            return parsed.value;
        } catch (error) {
            console.error('Storage retrieval error:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     */
    removeItem(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Storage removal error:', error);
            return false;
        }
    }

    /**
     * Clear all app data
     */
    clearAll() {
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith(this.prefix)
            );
            
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    /**
     * Get all keys with prefix
     */
    getAllKeys() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .map(key => key.replace(this.prefix, ''));
    }

    /**
     * Get storage usage statistics
     */
    getStorageStats() {
        let totalSize = 0;
        const stats = {};

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                const size = localStorage.getItem(key).length;
                totalSize += size;
                const dataKey = key.replace(this.prefix, '');
                stats[dataKey] = {
                    size: size,
                    sizeKB: Math.round(size / 1024 * 100) / 100
                };
            }
        });

        return {
            totalSize,
            totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
            totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
            breakdown: stats,
            available: this.getAvailableSpace()
        };
    }

    /**
     * Get available storage space
     */
    getAvailableSpace() {
        try {
            const testKey = 'storage_test';
            const testData = 'x'.repeat(1024); // 1KB
            let available = 0;

            while (available < 10240) { // Test up to 10MB
                try {
                    localStorage.setItem(testKey, testData.repeat(available + 1));
                    localStorage.removeItem(testKey);
                    available++;
                } catch (e) {
                    break;
                }
            }

            return available; // KB
        } catch (error) {
            return 0;
        }
    }

    /**
     * Simple encryption (for basic data protection)
     */
    encrypt(text) {
        try {
            // Simple XOR encryption (not cryptographically secure)
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            return btoa(result);
        } catch (error) {
            console.error('Encryption error:', error);
            return text;
        }
    }

    /**
     * Simple decryption
     */
    decrypt(encryptedText) {
        try {
            const text = atob(encryptedText);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            return result;
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedText;
        }
    }

    /**
     * Handle storage errors
     */
    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            this.handleQuotaExceeded();
        }
    }

    /**
     * Handle quota exceeded error
     */
    handleQuotaExceeded() {
        console.warn('Storage quota exceeded, attempting cleanup...');
        
        // Remove old backup files first
        const keys = this.getAllKeys();
        const backupKeys = keys.filter(key => key.startsWith('backup_'));
        
        // Sort by timestamp and remove oldest
        backupKeys.sort().slice(0, -3).forEach(key => {
            this.removeItem(key);
        });

        // If still having issues, show user notification
        if (window.toast) {
            window.toast.warning(
                'Storage Warning',
                'Storage space is running low. Consider backing up and clearing old data.'
            );
        }
    }

    /**
     * Create backup of all data
     */
    createBackup() {
        try {
            const backup = {
                version: this.version,
                timestamp: new Date().toISOString(),
                data: {}
            };

            // Get all app data
            const keys = this.getAllKeys().filter(key => 
                !key.startsWith('backup_') && 
                !key.startsWith('temp_') &&
                key !== 'app_version'
            );

            keys.forEach(key => {
                backup.data[key] = this.getItem(key);
            });

            return backup;
        } catch (error) {
            console.error('Backup creation error:', error);
            return null;
        }
    }

    /**
     * Restore from backup
     */
    restoreBackup(backup) {
        try {
            if (!backup || !backup.data) {
                throw new Error('Invalid backup format');
            }

            // Clear existing data (except backups)
            const keys = this.getAllKeys().filter(key => 
                !key.startsWith('backup_') && 
                key !== 'app_version'
            );
            keys.forEach(key => this.removeItem(key));

            // Restore data
            Object.entries(backup.data).forEach(([key, value]) => {
                this.setItem(key, value);
            });

            return true;
        } catch (error) {
            console.error('Backup restoration error:', error);
            return false;
        }
    }

    /**
     * Save backup to localStorage
     */
    saveBackup(name = null) {
        const backup = this.createBackup();
        if (!backup) return false;

        const backupName = name || `backup_${Date.now()}`;
        return this.setItem(backupName, backup);
    }

    /**
     * Get all saved backups
     */
    getBackups() {
        const keys = this.getAllKeys().filter(key => key.startsWith('backup_'));
        return keys.map(key => ({
            name: key,
            data: this.getItem(key),
            timestamp: this.getItem(key)?.timestamp
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Download backup as file
     */
    downloadBackup(filename = null) {
        const backup = this.createBackup();
        if (!backup) return false;

        const fileName = filename || `zovatu_backup_${new Date().toISOString().split('T')[0]}.json`;
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
    }

    /**
     * Import backup from file
     */
    async importBackup(file) {
        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            return this.restoreBackup(backup);
        } catch (error) {
            console.error('Backup import error:', error);
            return false;
        }
    }

    /**
     * Setup automatic backup
     */
    setupAutoBackup() {
        const settings = this.getItem('settings') || {};
        const autoBackupEnabled = settings.autoBackup !== false;
        const backupInterval = settings.backupInterval || 24; // hours

        if (!autoBackupEnabled) return;

        const lastBackup = this.getItem('last_auto_backup');
        const now = new Date();
        const shouldBackup = !lastBackup || 
            (now - new Date(lastBackup)) > (backupInterval * 60 * 60 * 1000);

        if (shouldBackup) {
            setTimeout(() => {
                this.saveBackup(`auto_backup_${Date.now()}`);
                this.setItem('last_auto_backup', now.toISOString());
                this.cleanupOldBackups();
            }, 5000); // Delay to avoid blocking app startup
        }

        // Schedule next backup
        setInterval(() => {
            if (this.getItem('settings')?.autoBackup !== false) {
                this.saveBackup(`auto_backup_${Date.now()}`);
                this.setItem('last_auto_backup', new Date().toISOString());
                this.cleanupOldBackups();
            }
        }, backupInterval * 60 * 60 * 1000);
    }

    /**
     * Cleanup old backups
     */
    cleanupOldBackups() {
        const backups = this.getBackups();
        const maxBackups = 10; // Keep last 10 backups

        if (backups.length > maxBackups) {
            const toDelete = backups.slice(maxBackups);
            toDelete.forEach(backup => {
                this.removeItem(backup.name);
            });
        }
    }

    /**
     * Export data to CSV
     */
    exportToCSV(dataType, data = null) {
        try {
            let csvData = '';
            let filename = '';

            switch (dataType) {
                case 'products':
                    data = data || this.getItem('products') || [];
                    csvData = this.convertProductsToCSV(data);
                    filename = 'products.csv';
                    break;
                case 'customers':
                    data = data || this.getItem('customers') || [];
                    csvData = this.convertCustomersToCSV(data);
                    filename = 'customers.csv';
                    break;
                case 'invoices':
                    data = data || this.getItem('invoices') || [];
                    csvData = this.convertInvoicesToCSV(data);
                    filename = 'invoices.csv';
                    break;
                default:
                    throw new Error('Invalid data type for CSV export');
            }

            this.downloadCSV(csvData, filename);
            return true;
        } catch (error) {
            console.error('CSV export error:', error);
            return false;
        }
    }

    /**
     * Convert products to CSV
     */
    convertProductsToCSV(products) {
        const headers = ['ID', 'Name', 'Barcode', 'Price', 'Cost', 'Stock', 'Unit', 'Category', 'Created'];
        const rows = products.map(product => [
            product.id,
            product.name,
            product.barcode,
            product.price,
            product.cost,
            product.stock,
            product.unit,
            product.category || '',
            product.createdAt
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    /**
     * Convert customers to CSV
     */
    convertCustomersToCSV(customers) {
        const headers = ['ID', 'Name', 'Phone', 'Email', 'Address', 'Total Purchases', 'Created'];
        const rows = customers.map(customer => [
            customer.id,
            customer.name,
            customer.phone,
            customer.email || '',
            customer.address || '',
            customer.totalPurchases || 0,
            customer.createdAt
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    /**
     * Convert invoices to CSV
     */
    convertInvoicesToCSV(invoices) {
        const headers = ['Invoice Number', 'Customer', 'Total', 'Status', 'Date'];
        const rows = invoices.map(invoice => [
            invoice.invoiceNumber,
            invoice.customerName || 'Walk-in Customer',
            invoice.total,
            invoice.status,
            invoice.createdAt
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    /**
     * Download CSV file
     */
    downloadCSV(csvData, filename) {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Search across all data
     */
    globalSearch(query) {
        const results = {
            products: [],
            customers: [],
            invoices: []
        };

        if (query.length < 2) return results;

        const lowerQuery = query.toLowerCase();

        // Search products
        const products = this.getItem('products') || [];
        results.products = products.filter(product => 
            product.name.toLowerCase().includes(lowerQuery) ||
            product.barcode.includes(query) ||
            (product.category && product.category.toLowerCase().includes(lowerQuery))
        );

        // Search customers
        const customers = this.getItem('customers') || [];
        results.customers = customers.filter(customer => 
            customer.name.toLowerCase().includes(lowerQuery) ||
            customer.phone.includes(query) ||
            (customer.email && customer.email.toLowerCase().includes(lowerQuery))
        );

        // Search invoices
        const invoices = this.getItem('invoices') || [];
        results.invoices = invoices.filter(invoice => 
            invoice.invoiceNumber.toLowerCase().includes(lowerQuery) ||
            (invoice.customerName && invoice.customerName.toLowerCase().includes(lowerQuery))
        );

        return results;
    }

    /**
     * Get data summary for dashboard
     */
    getDataSummary() {
        const products = this.getItem('products') || [];
        const customers = this.getItem('customers') || [];
        const invoices = this.getItem('invoices') || [];

        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalProfit = invoices.reduce((sum, inv) => {
            const profit = (inv.items || []).reduce((itemSum, item) => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    return itemSum + ((item.price - product.cost) * item.quantity);
                }
                return itemSum;
            }, 0);
            return sum + profit;
        }, 0);

        const lowStockProducts = products.filter(p => p.stock <= 10);
        const recentInvoices = invoices
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        return {
            totalProducts: products.length,
            totalCustomers: customers.length,
            totalInvoices: invoices.length,
            totalRevenue,
            totalProfit,
            lowStockProducts: lowStockProducts.length,
            recentInvoices
        };
    }

    /**
     * Validate data integrity
     */
    validateData() {
        const issues = [];

        try {
            // Check products
            const products = this.getItem('products') || [];
            products.forEach((product, index) => {
                if (!product.id) issues.push(`Product at index ${index} missing ID`);
                if (!product.name) issues.push(`Product ${product.id} missing name`);
                if (typeof product.price !== 'number') issues.push(`Product ${product.id} invalid price`);
            });

            // Check customers
            const customers = this.getItem('customers') || [];
            customers.forEach((customer, index) => {
                if (!customer.id) issues.push(`Customer at index ${index} missing ID`);
                if (!customer.name) issues.push(`Customer ${customer.id} missing name`);
            });

            // Check invoices
            const invoices = this.getItem('invoices') || [];
            invoices.forEach((invoice, index) => {
                if (!invoice.id) issues.push(`Invoice at index ${index} missing ID`);
                if (!invoice.invoiceNumber) issues.push(`Invoice ${invoice.id} missing number`);
                if (typeof invoice.total !== 'number') issues.push(`Invoice ${invoice.id} invalid total`);
            });

        } catch (error) {
            issues.push(`Data validation error: ${error.message}`);
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * Repair data issues
     */
    repairData() {
        try {
            let repaired = 0;

            // Repair products
            const products = this.getItem('products') || [];
            products.forEach(product => {
                if (!product.id) {
                    product.id = this.generateId('prod');
                    repaired++;
                }
                if (typeof product.price !== 'number') {
                    product.price = parseFloat(product.price) || 0;
                    repaired++;
                }
                if (typeof product.cost !== 'number') {
                    product.cost = parseFloat(product.cost) || 0;
                    repaired++;
                }
                if (typeof product.stock !== 'number') {
                    product.stock = parseInt(product.stock) || 0;
                    repaired++;
                }
            });
            this.setItem('products', products);

            // Repair customers
            const customers = this.getItem('customers') || [];
            customers.forEach(customer => {
                if (!customer.id) {
                    customer.id = this.generateId('cust');
                    repaired++;
                }
                if (typeof customer.totalPurchases !== 'number') {
                    customer.totalPurchases = parseFloat(customer.totalPurchases) || 0;
                    repaired++;
                }
            });
            this.setItem('customers', customers);

            // Repair invoices
            const invoices = this.getItem('invoices') || [];
            invoices.forEach(invoice => {
                if (!invoice.id) {
                    invoice.id = this.generateId('inv');
                    repaired++;
                }
                if (!invoice.invoiceNumber) {
                    invoice.invoiceNumber = `ZP-${Date.now()}`;
                    repaired++;
                }
                if (typeof invoice.total !== 'number') {
                    invoice.total = parseFloat(invoice.total) || 0;
                    repaired++;
                }
            });
            this.setItem('invoices', invoices);

            return repaired;
        } catch (error) {
            console.error('Data repair error:', error);
            return 0;
        }
    }

    /**
     * Generate unique ID
     */
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
    }
}

// Initialize storage when script loads
if (typeof window !== 'undefined') {
    window.ZovatuStorage = ZovatuStorage;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZovatuStorage;
}

