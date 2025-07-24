// Zovatu Billing Tool - Products Data Management
// Handles product operations, inventory management, and validation

class ProductsManager {
    constructor() {
        this.storage = window.billingStorage;
    }

    // Create a new product
    createProduct(shopId, productData) {
        // Validate required fields
        if (!productData.name || !productData.code || !productData.price) {
            throw new Error('Product name, code, and price are required');
        }

        // Check for duplicate product codes within the shop
        const existingProducts = this.storage.getProducts(shopId);
        if (existingProducts.some(product => product.code.toLowerCase() === productData.code.toLowerCase())) {
            throw new Error('A product with this code already exists in this shop');
        }

        // Create product object with defaults
        const product = {
            id: this.storage.generateId(),
            shop_id: shopId,
            name: productData.name.trim(),
            code: productData.code.trim().toUpperCase(),
            price: parseFloat(productData.price) || 0,
            stock: parseInt(productData.stock) || 0,
            unit: productData.unit?.trim() || 'pcs',
            brand: productData.brand?.trim() || '',
            color: productData.color?.trim() || '',
            size: productData.size?.trim() || '',
            barcode: productData.barcode?.trim() || '',
            description: productData.description?.trim() || '',
            category: productData.category?.trim() || 'General',
            cost_price: parseFloat(productData.cost_price) || 0,
            min_stock: parseInt(productData.min_stock) || 5,
            max_stock: parseInt(productData.max_stock) || 1000,
            is_active: productData.is_active !== false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            stats: {
                total_sold: 0,
                total_revenue: 0,
                last_sold: null
            }
        };

        // Save product
        if (this.storage.saveProduct(shopId, product)) {
            return product;
        } else {
            throw new Error('Failed to save product data');
        }
    }

    // Update existing product
    updateProduct(shopId, productId, updateData) {
        const product = this.storage.getProduct(shopId, productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Validate code uniqueness if code is being changed
        if (updateData.code && updateData.code !== product.code) {
            const existingProducts = this.storage.getProducts(shopId);
            if (existingProducts.some(p => p.id !== productId && p.code.toLowerCase() === updateData.code.toLowerCase())) {
                throw new Error('A product with this code already exists');
            }
        }

        // Update product data
        const updatedProduct = {
            ...product,
            ...updateData,
            id: product.id, // Ensure ID doesn't change
            shop_id: product.shop_id, // Ensure shop_id doesn't change
            created_at: product.created_at, // Preserve creation date
            updated_at: new Date().toISOString(),
            stats: {
                ...product.stats,
                ...updateData.stats
            }
        };

        // Ensure numeric fields are properly typed
        if (updateData.price !== undefined) updatedProduct.price = parseFloat(updateData.price) || 0;
        if (updateData.stock !== undefined) updatedProduct.stock = parseInt(updateData.stock) || 0;
        if (updateData.cost_price !== undefined) updatedProduct.cost_price = parseFloat(updateData.cost_price) || 0;
        if (updateData.min_stock !== undefined) updatedProduct.min_stock = parseInt(updateData.min_stock) || 0;
        if (updateData.max_stock !== undefined) updatedProduct.max_stock = parseInt(updateData.max_stock) || 0;

        if (this.storage.saveProduct(shopId, updatedProduct)) {
            return updatedProduct;
        } else {
            throw new Error('Failed to update product data');
        }
    }

    // Delete product
    deleteProduct(shopId, productId) {
        const product = this.storage.getProduct(shopId, productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (this.storage.deleteProduct(shopId, productId)) {
            return true;
        } else {
            throw new Error('Failed to delete product');
        }
    }

    // Get product with calculated statistics
    getProductWithStats(shopId, productId) {
        const product = this.storage.getProduct(shopId, productId);
        if (!product) {
            return null;
        }

        // Calculate additional stats from invoices
        const invoices = this.storage.getInvoices(shopId);
        let totalSold = 0;
        let totalRevenue = 0;
        let lastSold = null;

        invoices.forEach(invoice => {
            invoice.items?.forEach(item => {
                if (item.product_id === productId) {
                    totalSold += item.quantity || 0;
                    totalRevenue += item.total || 0;
                    if (!lastSold || new Date(invoice.date) > new Date(lastSold)) {
                        lastSold = invoice.date;
                    }
                }
            });
        });

        return {
            ...product,
            stats: {
                ...product.stats,
                total_sold: totalSold,
                total_revenue: totalRevenue,
                last_sold: lastSold,
                profit_margin: product.price > 0 ? ((product.price - product.cost_price) / product.price * 100) : 0,
                stock_status: this.getStockStatus(product),
                turnover_rate: this.calculateTurnoverRate(product, totalSold)
            }
        };
    }

    // Get all products with statistics
    getAllProductsWithStats(shopId) {
        const products = this.storage.getProducts(shopId);
        return products.map(product => this.getProductWithStats(shopId, product.id));
    }

    // Update stock quantity
    updateStock(shopId, productId, quantity, operation = 'set') {
        const product = this.storage.getProduct(shopId, productId);
        if (!product) {
            throw new Error('Product not found');
        }

        let newStock;
        switch (operation) {
            case 'add':
                newStock = product.stock + quantity;
                break;
            case 'subtract':
                newStock = product.stock - quantity;
                break;
            case 'set':
            default:
                newStock = quantity;
                break;
        }

        if (newStock < 0) {
            throw new Error('Stock cannot be negative');
        }

        return this.updateProduct(shopId, productId, { stock: newStock });
    }

    // Get stock status
    getStockStatus(product) {
        if (product.stock <= 0) {
            return 'out_of_stock';
        } else if (product.stock <= product.min_stock) {
            return 'low_stock';
        } else if (product.stock >= product.max_stock) {
            return 'overstock';
        } else {
            return 'in_stock';
        }
    }

    // Calculate turnover rate
    calculateTurnoverRate(product, totalSold) {
        const daysSinceCreated = Math.max(1, Math.floor((Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)));
        return totalSold / daysSinceCreated;
    }

    // Validate product data
    validateProductData(productData) {
        const errors = [];

        if (!productData.name || productData.name.trim().length < 2) {
            errors.push('Product name must be at least 2 characters long');
        }

        if (!productData.code || productData.code.trim().length < 1) {
            errors.push('Product code is required');
        }

        if (!productData.price || parseFloat(productData.price) <= 0) {
            errors.push('Product price must be greater than 0');
        }

        if (productData.stock && parseInt(productData.stock) < 0) {
            errors.push('Stock quantity cannot be negative');
        }

        if (productData.cost_price && parseFloat(productData.cost_price) < 0) {
            errors.push('Cost price cannot be negative');
        }

        if (productData.min_stock && parseInt(productData.min_stock) < 0) {
            errors.push('Minimum stock cannot be negative');
        }

        if (productData.max_stock && parseInt(productData.max_stock) < 0) {
            errors.push('Maximum stock cannot be negative');
        }

        if (productData.min_stock && productData.max_stock && parseInt(productData.min_stock) > parseInt(productData.max_stock)) {
            errors.push('Minimum stock cannot be greater than maximum stock');
        }

        return errors;
    }

    // Search products
    searchProducts(shopId, query) {
        return this.storage.searchProducts(shopId, query);
    }

    // Get products by category
    getProductsByCategory(shopId, category) {
        const products = this.storage.getProducts(shopId);
        return products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Get low stock products
    getLowStockProducts(shopId) {
        const products = this.storage.getProducts(shopId);
        return products.filter(product => product.stock <= product.min_stock);
    }

    // Get out of stock products
    getOutOfStockProducts(shopId) {
        const products = this.storage.getProducts(shopId);
        return products.filter(product => product.stock <= 0);
    }

    // Get top selling products
    getTopSellingProducts(shopId, limit = 10) {
        const products = this.getAllProductsWithStats(shopId);
        return products
            .sort((a, b) => b.stats.total_sold - a.stats.total_sold)
            .slice(0, limit);
    }

    // Get most profitable products
    getMostProfitableProducts(shopId, limit = 10) {
        const products = this.getAllProductsWithStats(shopId);
        return products
            .sort((a, b) => b.stats.total_revenue - a.stats.total_revenue)
            .slice(0, limit);
    }

    // Get all categories
    getCategories(shopId) {
        const products = this.storage.getProducts(shopId);
        const categories = [...new Set(products.map(product => product.category))];
        return categories.sort();
    }

    // Get all brands
    getBrands(shopId) {
        const products = this.storage.getProducts(shopId);
        const brands = [...new Set(products.map(product => product.brand).filter(brand => brand))];
        return brands.sort();
    }

    // Generate barcode
    generateBarcode(type = 'EAN13') {
        switch (type) {
            case 'EAN13':
                return this.generateEAN13();
            case 'CODE128':
                return this.generateCode128();
            case 'UPC':
                return this.generateUPC();
            default:
                return this.generateEAN13();
        }
    }

    // Generate EAN-13 barcode
    generateEAN13() {
        // Generate 12 random digits
        let code = '';
        for (let i = 0; i < 12; i++) {
            code += Math.floor(Math.random() * 10);
        }
        
        // Calculate check digit
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        
        return code + checkDigit;
    }

    // Generate Code 128 barcode
    generateCode128() {
        const timestamp = Date.now().toString();
        return timestamp.slice(-10); // Last 10 digits of timestamp
    }

    // Generate UPC barcode
    generateUPC() {
        // Generate 11 random digits
        let code = '';
        for (let i = 0; i < 11; i++) {
            code += Math.floor(Math.random() * 10);
        }
        
        // Calculate check digit
        let sum = 0;
        for (let i = 0; i < 11; i++) {
            sum += parseInt(code[i]) * (i % 2 === 0 ? 3 : 1);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        
        return code + checkDigit;
    }

    // Export products data
    exportProducts(shopId, format = 'json') {
        const products = this.getAllProductsWithStats(shopId);
        
        if (format === 'csv') {
            return this.convertToCSV(products);
        }
        
        return {
            products,
            exportDate: new Date().toISOString(),
            shopId
        };
    }

    // Convert products to CSV format
    convertToCSV(products) {
        const headers = [
            'ID', 'Name', 'Code', 'Price', 'Stock', 'Unit', 'Brand', 
            'Color', 'Size', 'Barcode', 'Category', 'Cost Price', 
            'Min Stock', 'Max Stock', 'Total Sold', 'Total Revenue'
        ];
        
        const rows = products.map(product => [
            product.id,
            product.name,
            product.code,
            product.price,
            product.stock,
            product.unit,
            product.brand,
            product.color,
            product.size,
            product.barcode,
            product.category,
            product.cost_price,
            product.min_stock,
            product.max_stock,
            product.stats.total_sold,
            product.stats.total_revenue
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    // Import products from CSV
    importFromCSV(shopId, csvData) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        const products = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
                const productData = {};
                
                headers.forEach((header, index) => {
                    productData[header.toLowerCase().replace(' ', '_')] = values[index];
                });
                
                try {
                    const product = this.createProduct(shopId, productData);
                    products.push(product);
                } catch (error) {
                    console.warn(`Failed to import product ${productData.name}: ${error.message}`);
                }
            }
        }
        
        return products;
    }

    // Get inventory summary
    getInventorySummary(shopId) {
        const products = this.getAllProductsWithStats(shopId);
        
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
        const totalCostValue = products.reduce((sum, product) => sum + (product.cost_price * product.stock), 0);
        const lowStockCount = products.filter(product => product.stock <= product.min_stock).length;
        const outOfStockCount = products.filter(product => product.stock <= 0).length;
        
        return {
            totalProducts,
            totalValue,
            totalCostValue,
            potentialProfit: totalValue - totalCostValue,
            lowStockCount,
            outOfStockCount,
            categories: this.getCategories(shopId).length,
            brands: this.getBrands(shopId).length
        };
    }
}

// Create global products manager instance
window.productsManager = new ProductsManager();

