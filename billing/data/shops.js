/* ===================================
   Zovatu Smart Billing Tool - Shops Data
   Shop Management Data Module
   =================================== */

// Shop management class
class ShopManager {
    constructor() {
        this.currentShop = null;
        this.init();
    }

    // Initialize shop manager
    init() {
        this.loadCurrentShop();
    }

    // Load current shop from session
    loadCurrentShop() {
        const session = ZovatuStore.getCurrentSession();
        if (session && session.shopId) {
            this.currentShop = ZovatuStore.getShop(session.shopId);
        }
    }

    // Get all shops
    getAllShops() {
        return ZovatuStore.getShops();
    }

    // Get active shops
    getActiveShops() {
        return ZovatuStore.getShops().filter(shop => shop.isActive);
    }

    // Create new shop
    createShop(shopData) {
        const shop = {
            name: shopData.name,
            type: shopData.type || 'retail',
            address: shopData.address || '',
            phone: shopData.phone || '',
            email: shopData.email || '',
            website: shopData.website || '',
            description: shopData.description || '',
            logo: shopData.logo || '',
            settings: {
                currency: shopData.currency || 'BDT',
                taxRate: shopData.taxRate || 0,
                discountRate: shopData.discountRate || 0,
                autoCalculateTax: shopData.autoCalculateTax || false,
                allowDiscount: shopData.allowDiscount || true,
                requireCustomerInfo: shopData.requireCustomerInfo || false,
                printReceipt: shopData.printReceipt || true,
                ...shopData.settings
            },
            stats: {
                totalSales: 0,
                totalOrders: 0,
                totalProducts: 0,
                totalCustomers: 0,
                lastSaleDate: null
            },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const success = ZovatuStore.addShop(shop);
        if (success) {
            ZovatuUtils.showToast('Shop created successfully!', 'success');
            return shop;
        } else {
            ZovatuUtils.showToast('Failed to create shop', 'error');
            return null;
        }
    }

    // Update shop
    updateShop(shopId, updates) {
        const success = ZovatuStore.updateShop(shopId, {
            ...updates,
            updatedAt: new Date().toISOString()
        });

        if (success) {
            // Update current shop if it's the one being updated
            if (this.currentShop && this.currentShop.id === shopId) {
                this.currentShop = ZovatuStore.getShop(shopId);
            }
            ZovatuUtils.showToast('Shop updated successfully!', 'success');
            return true;
        } else {
            ZovatuUtils.showToast('Failed to update shop', 'error');
            return false;
        }
    }

    // Delete shop
    deleteShop(shopId) {
        // Check if shop has any data
        const products = ZovatuStore.getProducts(shopId);
        const invoices = ZovatuStore.getInvoices(shopId);

        if (products.length > 0 || invoices.length > 0) {
            const confirmDelete = confirm(
                'This shop has products and/or invoices. Deleting it will remove all associated data. Are you sure?'
            );
            if (!confirmDelete) return false;
        }

        // Delete associated data
        products.forEach(product => ZovatuStore.deleteProduct(product.id));
        invoices.forEach(invoice => ZovatuStore.deleteInvoice(invoice.id));

        // Delete shop
        const success = ZovatuStore.deleteShop(shopId);
        if (success) {
            // Clear current shop if it's the one being deleted
            if (this.currentShop && this.currentShop.id === shopId) {
                this.setCurrentShop(null);
            }
            ZovatuUtils.showToast('Shop deleted successfully!', 'success');
            return true;
        } else {
            ZovatuUtils.showToast('Failed to delete shop', 'error');
            return false;
        }
    }

    // Set current shop
    setCurrentShop(shopId) {
        if (shopId) {
            const shop = ZovatuStore.getShop(shopId);
            if (shop) {
                this.currentShop = shop;
                // Update session
                const session = ZovatuStore.getCurrentSession();
                ZovatuStore.setCurrentSession({
                    ...session,
                    shopId: shopId
                });
                ZovatuUtils.showToast(`Switched to ${shop.name}`, 'success');
                return true;
            }
        } else {
            this.currentShop = null;
            // Update session
            const session = ZovatuStore.getCurrentSession();
            ZovatuStore.setCurrentSession({
                ...session,
                shopId: null
            });
        }
        return false;
    }

    // Get current shop
    getCurrentShop() {
        return this.currentShop;
    }

    // Get shop statistics
    getShopStats(shopId) {
        const shop = ZovatuStore.getShop(shopId);
        if (!shop) return null;

        const products = ZovatuStore.getProducts(shopId);
        const invoices = ZovatuStore.getInvoices(shopId);

        const totalSales = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
        const totalOrders = invoices.length;
        const totalProducts = products.length;

        // Calculate customers (unique customer IDs from invoices)
        const uniqueCustomers = new Set(
            invoices
                .filter(invoice => invoice.customerId)
                .map(invoice => invoice.customerId)
        );
        const totalCustomers = uniqueCustomers.size;

        // Get last sale date
        const lastSaleDate = invoices.length > 0 
            ? invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
            : null;

        const stats = {
            totalSales,
            totalOrders,
            totalProducts,
            totalCustomers,
            lastSaleDate,
            averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
        };

        // Update shop stats in storage
        this.updateShop(shopId, { stats });

        return stats;
    }

    // Get shop performance data
    getShopPerformance(shopId, days = 30) {
        const invoices = ZovatuStore.getInvoices(shopId);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentInvoices = invoices.filter(invoice => 
            new Date(invoice.createdAt) >= cutoffDate
        );

        // Group by date
        const dailySales = {};
        recentInvoices.forEach(invoice => {
            const date = ZovatuUtils.formatDate(invoice.createdAt, 'YYYY-MM-DD');
            if (!dailySales[date]) {
                dailySales[date] = { sales: 0, orders: 0 };
            }
            dailySales[date].sales += invoice.total || 0;
            dailySales[date].orders += 1;
        });

        return dailySales;
    }

    // Validate shop data
    validateShopData(shopData) {
        const errors = [];

        if (!shopData.name || shopData.name.trim().length < 2) {
            errors.push('Shop name must be at least 2 characters long');
        }

        if (shopData.email && !ZovatuUtils.validateEmail(shopData.email)) {
            errors.push('Invalid email address');
        }

        if (shopData.phone && !ZovatuUtils.validatePhone(shopData.phone)) {
            errors.push('Invalid phone number');
        }

        // Check for duplicate shop name
        const existingShops = this.getAllShops();
        const duplicateName = existingShops.find(shop => 
            shop.name.toLowerCase() === shopData.name.toLowerCase() &&
            shop.id !== shopData.id
        );

        if (duplicateName) {
            errors.push('Shop name already exists');
        }

        return errors;
    }

    // Export shop data
    exportShopData(shopId) {
        const shop = ZovatuStore.getShop(shopId);
        if (!shop) return null;

        const products = ZovatuStore.getProducts(shopId);
        const invoices = ZovatuStore.getInvoices(shopId);
        const stats = this.getShopStats(shopId);

        const exportData = {
            shop,
            products,
            invoices,
            stats,
            exportDate: new Date().toISOString()
        };

        const filename = `${shop.name.replace(/[^a-zA-Z0-9]/g, '_')}_export_${ZovatuUtils.formatDate(new Date(), 'YYYY-MM-DD')}.json`;
        const jsonString = ZovatuUtils.stringifyJSON(exportData);
        
        ZovatuUtils.downloadFile(jsonString, filename, 'application/json');
        return true;
    }

    // Import shop data
    importShopData(file, callback) {
        ZovatuUtils.uploadFile(file, (data, file) => {
            try {
                const importData = JSON.parse(data);
                
                if (!importData.shop) {
                    callback(false, 'Invalid shop data file');
                    return;
                }

                // Generate new IDs to avoid conflicts
                const newShopId = ZovatuUtils.generateId('shop_');
                importData.shop.id = newShopId;
                importData.shop.name = `${importData.shop.name} (Imported)`;

                // Add shop
                const success = ZovatuStore.addShop(importData.shop);
                if (!success) {
                    callback(false, 'Failed to import shop');
                    return;
                }

                // Import products
                if (importData.products && importData.products.length > 0) {
                    importData.products.forEach(product => {
                        product.id = ZovatuUtils.generateId('prod_');
                        product.shopId = newShopId;
                        ZovatuStore.addProduct(product);
                    });
                }

                // Import invoices
                if (importData.invoices && importData.invoices.length > 0) {
                    importData.invoices.forEach(invoice => {
                        invoice.id = ZovatuUtils.generateId('inv_');
                        invoice.shopId = newShopId;
                        ZovatuStore.addInvoice(invoice);
                    });
                }

                callback(true, 'Shop data imported successfully!');
            } catch (error) {
                callback(false, 'Invalid file format');
            }
        });
    }

    // Get shop types
    getShopTypes() {
        return [
            { value: 'retail', label: 'Retail Store', icon: 'fas fa-store' },
            { value: 'restaurant', label: 'Restaurant', icon: 'fas fa-utensils' },
            { value: 'pharmacy', label: 'Pharmacy', icon: 'fas fa-pills' },
            { value: 'grocery', label: 'Grocery Store', icon: 'fas fa-shopping-basket' },
            { value: 'electronics', label: 'Electronics', icon: 'fas fa-laptop' },
            { value: 'clothing', label: 'Clothing Store', icon: 'fas fa-tshirt' },
            { value: 'bookstore', label: 'Bookstore', icon: 'fas fa-book' },
            { value: 'hardware', label: 'Hardware Store', icon: 'fas fa-tools' },
            { value: 'beauty', label: 'Beauty Salon', icon: 'fas fa-cut' },
            { value: 'automotive', label: 'Automotive', icon: 'fas fa-car' },
            { value: 'other', label: 'Other', icon: 'fas fa-building' }
        ];
    }

    // Search shops
    searchShops(query) {
        const shops = this.getAllShops();
        const searchTerm = query.toLowerCase();
        
        return shops.filter(shop => 
            shop.name.toLowerCase().includes(searchTerm) ||
            shop.type.toLowerCase().includes(searchTerm) ||
            shop.address.toLowerCase().includes(searchTerm) ||
            shop.description.toLowerCase().includes(searchTerm)
        );
    }
}

// Create global shop manager instance
const ZovatuShops = new ShopManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShopManager, ZovatuShops };
}

