// Zovatu Billing Tool - Shops Data Management
// Handles shop-specific operations and data validation

class ShopsManager {
    constructor() {
        this.storage = window.billingStorage;
    }

    // Create a new shop
    createShop(shopData) {
        // Validate required fields
        if (!shopData.name || !shopData.address || !shopData.phone) {
            throw new Error('Shop name, address, and phone are required');
        }

        // Check for duplicate shop names
        const existingShops = this.storage.getShops();
        if (existingShops.some(shop => shop.name.toLowerCase() === shopData.name.toLowerCase())) {
            throw new Error('A shop with this name already exists');
        }

        // Create shop object with defaults
        const shop = {
            id: this.storage.generateId(),
            name: shopData.name.trim(),
            address: shopData.address.trim(),
            phone: shopData.phone.trim(),
            logo: shopData.logo || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            settings: {
                invoice_prefix: shopData.settings?.invoice_prefix || 'INV-',
                currency: shopData.settings?.currency || 'BDT',
                auto_backup_enabled: shopData.settings?.auto_backup_enabled !== false,
                print_enabled: shopData.settings?.print_enabled !== false,
                tax_rate: shopData.settings?.tax_rate || 0,
                discount_enabled: shopData.settings?.discount_enabled || false
            },
            stats: {
                total_sales: 0,
                total_invoices: 0,
                total_products: 0,
                total_customers: 0
            }
        };

        // Save shop
        if (this.storage.saveShop(shop)) {
            return shop;
        } else {
            throw new Error('Failed to save shop data');
        }
    }

    // Update existing shop
    updateShop(shopId, updateData) {
        const shop = this.storage.getShop(shopId);
        if (!shop) {
            throw new Error('Shop not found');
        }

        // Validate name uniqueness if name is being changed
        if (updateData.name && updateData.name !== shop.name) {
            const existingShops = this.storage.getShops();
            if (existingShops.some(s => s.id !== shopId && s.name.toLowerCase() === updateData.name.toLowerCase())) {
                throw new Error('A shop with this name already exists');
            }
        }

        // Update shop data
        const updatedShop = {
            ...shop,
            ...updateData,
            id: shop.id, // Ensure ID doesn't change
            created_at: shop.created_at, // Preserve creation date
            updated_at: new Date().toISOString(),
            settings: {
                ...shop.settings,
                ...updateData.settings
            }
        };

        if (this.storage.saveShop(updatedShop)) {
            return updatedShop;
        } else {
            throw new Error('Failed to update shop data');
        }
    }

    // Delete shop and all related data
    deleteShop(shopId) {
        const shop = this.storage.getShop(shopId);
        if (!shop) {
            throw new Error('Shop not found');
        }

        // Check if this is the current shop
        const currentShopId = this.storage.getData('currentShop');
        if (currentShopId === shopId) {
            this.storage.removeData('currentShop');
        }

        // Delete shop and all related data
        if (this.storage.deleteShop(shopId)) {
            return true;
        } else {
            throw new Error('Failed to delete shop');
        }
    }

    // Get shop with calculated statistics
    getShopWithStats(shopId) {
        const shop = this.storage.getShop(shopId);
        if (!shop) {
            return null;
        }

        const stats = this.storage.getShopStats(shopId);
        return {
            ...shop,
            stats: {
                ...shop.stats,
                ...stats
            }
        };
    }

    // Get all shops with statistics
    getAllShopsWithStats() {
        const shops = this.storage.getShops();
        return shops.map(shop => this.getShopWithStats(shop.id));
    }

    // Validate shop data
    validateShopData(shopData) {
        const errors = [];

        if (!shopData.name || shopData.name.trim().length < 2) {
            errors.push('Shop name must be at least 2 characters long');
        }

        if (!shopData.address || shopData.address.trim().length < 5) {
            errors.push('Shop address must be at least 5 characters long');
        }

        if (!shopData.phone || !/^[\+]?[0-9\-\(\)\s]+$/.test(shopData.phone)) {
            errors.push('Please enter a valid phone number');
        }

        if (shopData.settings?.tax_rate && (shopData.settings.tax_rate < 0 || shopData.settings.tax_rate > 100)) {
            errors.push('Tax rate must be between 0 and 100');
        }

        return errors;
    }

    // Search shops
    searchShops(query) {
        const shops = this.storage.getShops();
        const searchTerm = query.toLowerCase();
        
        return shops.filter(shop => 
            shop.name.toLowerCase().includes(searchTerm) ||
            shop.address.toLowerCase().includes(searchTerm) ||
            shop.phone.includes(searchTerm)
        );
    }

    // Get shop performance metrics
    getShopPerformance(shopId, period = 'month') {
        const shop = this.storage.getShop(shopId);
        if (!shop) {
            return null;
        }

        const invoices = this.storage.getInvoices(shopId);
        const now = new Date();
        let startDate;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const periodInvoices = invoices.filter(invoice => 
            new Date(invoice.date) >= startDate
        );

        const totalSales = periodInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
        const averageOrderValue = periodInvoices.length > 0 ? totalSales / periodInvoices.length : 0;

        return {
            period,
            totalInvoices: periodInvoices.length,
            totalSales,
            averageOrderValue,
            startDate: startDate.toISOString(),
            endDate: now.toISOString()
        };
    }

    // Export shop data
    exportShopData(shopId) {
        const shop = this.storage.getShop(shopId);
        if (!shop) {
            throw new Error('Shop not found');
        }

        return {
            shop,
            products: this.storage.getProducts(shopId),
            invoices: this.storage.getInvoices(shopId),
            salesmen: this.storage.getSalesmen(shopId),
            exportDate: new Date().toISOString()
        };
    }

    // Import shop data
    importShopData(shopData) {
        try {
            // Validate data structure
            if (!shopData.shop || !shopData.shop.name) {
                throw new Error('Invalid shop data format');
            }

            // Create or update shop
            const shop = this.createShop(shopData.shop);

            // Import products
            if (shopData.products && Array.isArray(shopData.products)) {
                shopData.products.forEach(product => {
                    product.shop_id = shop.id;
                    this.storage.saveProduct(shop.id, product);
                });
            }

            // Import invoices
            if (shopData.invoices && Array.isArray(shopData.invoices)) {
                shopData.invoices.forEach(invoice => {
                    invoice.shop_id = shop.id;
                    this.storage.saveInvoice(shop.id, invoice);
                });
            }

            // Import salesmen
            if (shopData.salesmen && Array.isArray(shopData.salesmen)) {
                shopData.salesmen.forEach(salesman => {
                    salesman.shop_id = shop.id;
                    this.storage.saveSalesman(shop.id, salesman);
                });
            }

            return shop;
        } catch (error) {
            throw new Error(`Failed to import shop data: ${error.message}`);
        }
    }

    // Get shop summary for dashboard
    getShopSummary(shopId) {
        const shop = this.storage.getShop(shopId);
        if (!shop) {
            return null;
        }

        const stats = this.storage.getShopStats(shopId);
        const performance = this.getShopPerformance(shopId, 'month');

        return {
            id: shop.id,
            name: shop.name,
            address: shop.address,
            phone: shop.phone,
            logo: shop.logo,
            stats,
            performance,
            lastUpdated: shop.updated_at
        };
    }
}

// Create global shops manager instance
window.shopsManager = new ShopsManager();

