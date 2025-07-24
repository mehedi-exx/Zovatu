/* ===================================
   Zovatu Smart Billing Tool - Products Data
   Product Management Data Module
   =================================== */

// Product management class
class ProductManager {
    constructor() {
        this.init();
    }

    // Initialize product manager
    init() {
        // Any initialization logic
    }

    // Get all products for current shop
    getAllProducts(shopId = null) {
        const currentShopId = shopId || (ZovatuShops.getCurrentShop()?.id);
        if (!currentShopId) return [];
        
        return ZovatuStore.getProducts(currentShopId);
    }

    // Get active products
    getActiveProducts(shopId = null) {
        return this.getAllProducts(shopId).filter(product => product.isActive);
    }

    // Create new product
    createProduct(productData) {
        const currentShop = ZovatuShops.getCurrentShop();
        if (!currentShop) {
            ZovatuUtils.showToast('Please select a shop first', 'error');
            return null;
        }

        const product = {
            shopId: currentShop.id,
            name: productData.name,
            sku: productData.sku || this.generateSKU(productData.name),
            barcode: productData.barcode || '',
            category: productData.category || '',
            description: productData.description || '',
            price: parseFloat(productData.price) || 0,
            cost: parseFloat(productData.cost) || 0,
            stock: parseInt(productData.stock) || 0,
            minStock: parseInt(productData.minStock) || 0,
            maxStock: parseInt(productData.maxStock) || 0,
            unit: productData.unit || 'pcs',
            weight: parseFloat(productData.weight) || 0,
            dimensions: productData.dimensions || '',
            image: productData.image || '',
            tags: productData.tags || [],
            supplier: productData.supplier || '',
            location: productData.location || '',
            notes: productData.notes || '',
            isActive: true,
            isFeatured: productData.isFeatured || false,
            isTrackStock: productData.isTrackStock !== false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const success = ZovatuStore.addProduct(product);
        if (success) {
            ZovatuUtils.showToast('Product created successfully!', 'success');
            return product;
        } else {
            ZovatuUtils.showToast('Failed to create product', 'error');
            return null;
        }
    }

    // Update product
    updateProduct(productId, updates) {
        const success = ZovatuStore.updateProduct(productId, {
            ...updates,
            updatedAt: new Date().toISOString()
        });

        if (success) {
            ZovatuUtils.showToast('Product updated successfully!', 'success');
            return true;
        } else {
            ZovatuUtils.showToast('Failed to update product', 'error');
            return false;
        }
    }

    // Delete product
    deleteProduct(productId) {
        // Check if product is used in any invoices
        const invoices = ZovatuStore.getInvoices();
        const productInUse = invoices.some(invoice => 
            invoice.items && invoice.items.some(item => item.productId === productId)
        );

        if (productInUse) {
            const confirmDelete = confirm(
                'This product is used in existing invoices. Deleting it may affect invoice data. Are you sure?'
            );
            if (!confirmDelete) return false;
        }

        const success = ZovatuStore.deleteProduct(productId);
        if (success) {
            ZovatuUtils.showToast('Product deleted successfully!', 'success');
            return true;
        } else {
            ZovatuUtils.showToast('Failed to delete product', 'error');
            return false;
        }
    }

    // Get product by ID
    getProduct(productId) {
        return ZovatuStore.getProduct(productId);
    }

    // Search products
    searchProducts(query, shopId = null) {
        const currentShopId = shopId || (ZovatuShops.getCurrentShop()?.id);
        if (!currentShopId) return [];
        
        return ZovatuStore.searchProducts(query, currentShopId);
    }

    // Get products by category
    getProductsByCategory(category, shopId = null) {
        const products = this.getAllProducts(shopId);
        return products.filter(product => 
            product.category && product.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Get low stock products
    getLowStockProducts(shopId = null) {
        const products = this.getAllProducts(shopId);
        return products.filter(product => 
            product.isTrackStock && 
            product.stock <= product.minStock &&
            product.isActive
        );
    }

    // Get out of stock products
    getOutOfStockProducts(shopId = null) {
        const products = this.getAllProducts(shopId);
        return products.filter(product => 
            product.isTrackStock && 
            product.stock <= 0 &&
            product.isActive
        );
    }

    // Update stock
    updateStock(productId, quantity, operation = 'set', reason = '') {
        const product = this.getProduct(productId);
        if (!product) return false;

        let newStock = product.stock;
        
        switch (operation) {
            case 'add':
                newStock += quantity;
                break;
            case 'subtract':
                newStock -= quantity;
                break;
            case 'set':
                newStock = quantity;
                break;
            default:
                return false;
        }

        // Ensure stock doesn't go negative
        newStock = Math.max(0, newStock);

        const success = this.updateProduct(productId, { 
            stock: newStock,
            lastStockUpdate: new Date().toISOString(),
            lastStockReason: reason
        });

        if (success) {
            // Log stock movement
            this.logStockMovement(productId, operation, quantity, newStock, reason);
        }

        return success;
    }

    // Log stock movement
    logStockMovement(productId, operation, quantity, newStock, reason) {
        const movements = ZovatuStore.get('stockMovements') || [];
        const movement = {
            id: ZovatuUtils.generateId('mov_'),
            productId,
            operation,
            quantity,
            newStock,
            reason,
            timestamp: new Date().toISOString(),
            userId: ZovatuAuth.getCurrentUser()?.id
        };

        movements.push(movement);
        ZovatuStore.set('stockMovements', movements);
    }

    // Get stock movements
    getStockMovements(productId = null, limit = 50) {
        const movements = ZovatuStore.get('stockMovements') || [];
        let filteredMovements = movements;

        if (productId) {
            filteredMovements = movements.filter(movement => movement.productId === productId);
        }

        return filteredMovements
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    // Generate SKU
    generateSKU(productName) {
        const prefix = productName.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 3).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    // Generate barcode
    generateBarcode() {
        // Generate a simple 13-digit barcode (EAN-13 format)
        let barcode = '';
        for (let i = 0; i < 12; i++) {
            barcode += Math.floor(Math.random() * 10);
        }
        
        // Calculate check digit
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(barcode[i]);
            sum += (i % 2 === 0) ? digit : digit * 3;
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        
        return barcode + checkDigit;
    }

    // Validate product data
    validateProductData(productData) {
        const errors = [];

        if (!productData.name || productData.name.trim().length < 2) {
            errors.push('Product name must be at least 2 characters long');
        }

        if (productData.price && (isNaN(productData.price) || parseFloat(productData.price) < 0)) {
            errors.push('Price must be a valid positive number');
        }

        if (productData.cost && (isNaN(productData.cost) || parseFloat(productData.cost) < 0)) {
            errors.push('Cost must be a valid positive number');
        }

        if (productData.stock && (isNaN(productData.stock) || parseInt(productData.stock) < 0)) {
            errors.push('Stock must be a valid positive number');
        }

        // Check for duplicate SKU
        if (productData.sku) {
            const currentShop = ZovatuShops.getCurrentShop();
            if (currentShop) {
                const existingProducts = this.getAllProducts(currentShop.id);
                const duplicateSKU = existingProducts.find(product => 
                    product.sku === productData.sku &&
                    product.id !== productData.id
                );

                if (duplicateSKU) {
                    errors.push('SKU already exists');
                }
            }
        }

        return errors;
    }

    // Get product categories
    getProductCategories(shopId = null) {
        const products = this.getAllProducts(shopId);
        const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
        return categories.sort();
    }

    // Get product units
    getProductUnits() {
        return [
            { value: 'pcs', label: 'Pieces' },
            { value: 'kg', label: 'Kilograms' },
            { value: 'g', label: 'Grams' },
            { value: 'l', label: 'Liters' },
            { value: 'ml', label: 'Milliliters' },
            { value: 'm', label: 'Meters' },
            { value: 'cm', label: 'Centimeters' },
            { value: 'box', label: 'Box' },
            { value: 'pack', label: 'Pack' },
            { value: 'bottle', label: 'Bottle' },
            { value: 'bag', label: 'Bag' },
            { value: 'dozen', label: 'Dozen' }
        ];
    }

    // Calculate profit margin
    calculateProfitMargin(cost, price) {
        if (!cost || !price || cost <= 0) return 0;
        return ((price - cost) / cost) * 100;
    }

    // Get product statistics
    getProductStats(shopId = null) {
        const products = this.getAllProducts(shopId);
        const activeProducts = products.filter(product => product.isActive);
        const lowStockProducts = this.getLowStockProducts(shopId);
        const outOfStockProducts = this.getOutOfStockProducts(shopId);

        const totalValue = products.reduce((sum, product) => 
            sum + (product.stock * product.cost), 0
        );

        const categories = this.getProductCategories(shopId);

        return {
            totalProducts: products.length,
            activeProducts: activeProducts.length,
            inactiveProducts: products.length - activeProducts.length,
            lowStockProducts: lowStockProducts.length,
            outOfStockProducts: outOfStockProducts.length,
            totalCategories: categories.length,
            totalInventoryValue: totalValue
        };
    }

    // Export products
    exportProducts(shopId = null, format = 'json') {
        const products = this.getAllProducts(shopId);
        const shop = ZovatuShops.getCurrentShop();
        
        if (format === 'csv') {
            return this.exportProductsCSV(products, shop);
        } else {
            return this.exportProductsJSON(products, shop);
        }
    }

    // Export products as JSON
    exportProductsJSON(products, shop) {
        const exportData = {
            shop: shop ? { id: shop.id, name: shop.name } : null,
            products,
            exportDate: new Date().toISOString(),
            totalProducts: products.length
        };

        const filename = `products_${shop ? shop.name.replace(/[^a-zA-Z0-9]/g, '_') : 'all'}_${ZovatuUtils.formatDate(new Date(), 'YYYY-MM-DD')}.json`;
        const jsonString = ZovatuUtils.stringifyJSON(exportData);
        
        ZovatuUtils.downloadFile(jsonString, filename, 'application/json');
        return true;
    }

    // Export products as CSV
    exportProductsCSV(products, shop) {
        const headers = [
            'Name', 'SKU', 'Barcode', 'Category', 'Price', 'Cost', 
            'Stock', 'Unit', 'Description', 'Status'
        ];

        const csvData = [
            headers.join(','),
            ...products.map(product => [
                `"${product.name}"`,
                `"${product.sku}"`,
                `"${product.barcode}"`,
                `"${product.category}"`,
                product.price,
                product.cost,
                product.stock,
                `"${product.unit}"`,
                `"${product.description}"`,
                product.isActive ? 'Active' : 'Inactive'
            ].join(','))
        ].join('\n');

        const filename = `products_${shop ? shop.name.replace(/[^a-zA-Z0-9]/g, '_') : 'all'}_${ZovatuUtils.formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
        
        ZovatuUtils.downloadFile(csvData, filename, 'text/csv');
        return true;
    }

    // Import products
    importProducts(file, callback) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'json') {
            this.importProductsJSON(file, callback);
        } else if (fileExtension === 'csv') {
            this.importProductsCSV(file, callback);
        } else {
            callback(false, 'Unsupported file format. Please use JSON or CSV.');
        }
    }

    // Import products from JSON
    importProductsJSON(file, callback) {
        ZovatuUtils.uploadFile(file, (data, file) => {
            try {
                const importData = JSON.parse(data);
                const products = importData.products || importData;
                
                if (!Array.isArray(products)) {
                    callback(false, 'Invalid file format');
                    return;
                }

                const currentShop = ZovatuShops.getCurrentShop();
                if (!currentShop) {
                    callback(false, 'Please select a shop first');
                    return;
                }

                let imported = 0;
                let errors = 0;

                products.forEach(productData => {
                    productData.shopId = currentShop.id;
                    const validationErrors = this.validateProductData(productData);
                    
                    if (validationErrors.length === 0) {
                        const success = ZovatuStore.addProduct({
                            ...productData,
                            id: ZovatuUtils.generateId('prod_'),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                        
                        if (success) {
                            imported++;
                        } else {
                            errors++;
                        }
                    } else {
                        errors++;
                    }
                });

                callback(true, `Imported ${imported} products successfully. ${errors} errors.`);
            } catch (error) {
                callback(false, 'Invalid JSON file format');
            }
        });
    }

    // Import products from CSV
    importProductsCSV(file, callback) {
        ZovatuUtils.uploadFile(file, (data, file) => {
            try {
                const lines = data.split('\n');
                const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
                
                const currentShop = ZovatuShops.getCurrentShop();
                if (!currentShop) {
                    callback(false, 'Please select a shop first');
                    return;
                }

                let imported = 0;
                let errors = 0;

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
                    
                    const productData = {
                        shopId: currentShop.id,
                        name: values[0] || '',
                        sku: values[1] || this.generateSKU(values[0] || ''),
                        barcode: values[2] || '',
                        category: values[3] || '',
                        price: parseFloat(values[4]) || 0,
                        cost: parseFloat(values[5]) || 0,
                        stock: parseInt(values[6]) || 0,
                        unit: values[7] || 'pcs',
                        description: values[8] || '',
                        isActive: values[9] !== 'Inactive'
                    };

                    const validationErrors = this.validateProductData(productData);
                    
                    if (validationErrors.length === 0) {
                        const success = ZovatuStore.addProduct({
                            ...productData,
                            id: ZovatuUtils.generateId('prod_'),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                        
                        if (success) {
                            imported++;
                        } else {
                            errors++;
                        }
                    } else {
                        errors++;
                    }
                }

                callback(true, `Imported ${imported} products successfully. ${errors} errors.`);
            } catch (error) {
                callback(false, 'Invalid CSV file format');
            }
        });
    }
}

// Create global product manager instance
const ZovatuProducts = new ProductManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProductManager, ZovatuProducts };
}

