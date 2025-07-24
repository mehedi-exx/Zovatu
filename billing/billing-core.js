/**
 * Zovatu Smart Billing Tool - Core Billing Logic
 * Handles all billing calculations, validations, and business logic
 */

class ZovatuBillingCore {
    constructor(storage) {
        this.storage = storage;
        this.currentCart = [];
        this.currentMode = 'ultra';
        this.currencies = this.initializeCurrencies();
        this.initializeCore();
    }

    /**
     * Initialize core billing system
     */
    initializeCore() {
        const settings = this.storage.getSettings();
        this.currentMode = settings.billingMode;
        this.currentCurrency = settings.currency;
    }

    /**
     * Initialize supported currencies
     */
    initializeCurrencies() {
        return {
            USD: { symbol: '$', name: 'US Dollar', rate: 1 },
            EUR: { symbol: '€', name: 'Euro', rate: 0.85 },
            BDT: { symbol: '৳', name: 'Bangladeshi Taka', rate: 110 },
            INR: { symbol: '₹', name: 'Indian Rupee', rate: 83 },
            GBP: { symbol: '£', name: 'British Pound', rate: 0.79 },
            JPY: { symbol: '¥', name: 'Japanese Yen', rate: 150 }
        };
    }

    /**
     * Simple Mode Billing
     */
    calculateSimpleBill(customerPayment, billAmount) {
        const validation = this.validateSimpleBill(customerPayment, billAmount);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const change = customerPayment - billAmount;
        const profit = billAmount * 0.1; // Assume 10% profit margin for simple mode

        const bill = {
            mode: 'simple',
            customerPayment: parseFloat(customerPayment),
            billAmount: parseFloat(billAmount),
            change: change,
            total: parseFloat(billAmount),
            profit: profit,
            currency: this.currentCurrency,
            items: [],
            timestamp: new Date().toISOString()
        };

        return { success: true, bill };
    }

    validateSimpleBill(customerPayment, billAmount) {
        const errors = [];

        if (!customerPayment || customerPayment <= 0) {
            errors.push('Customer payment must be greater than 0');
        }

        if (!billAmount || billAmount <= 0) {
            errors.push('Bill amount must be greater than 0');
        }

        if (customerPayment && billAmount && customerPayment < billAmount) {
            errors.push('Customer payment cannot be less than bill amount');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Ultra Mode Billing - Cart Management
     */
    addToCart(barcode, quantity = 1) {
        const product = this.storage.getProductByBarcode(barcode);
        if (!product) {
            return { success: false, error: 'Product not found' };
        }

        if (product.stock < quantity) {
            return { success: false, error: 'Insufficient stock' };
        }

        // Check if product already in cart
        const existingItemIndex = this.currentCart.findIndex(item => item.productId === product.id);
        
        if (existingItemIndex >= 0) {
            // Update quantity
            const newQuantity = this.currentCart[existingItemIndex].quantity + quantity;
            if (newQuantity > product.stock) {
                return { success: false, error: 'Insufficient stock for requested quantity' };
            }
            this.currentCart[existingItemIndex].quantity = newQuantity;
            this.currentCart[existingItemIndex].total = newQuantity * product.sellingPrice;
        } else {
            // Add new item
            const cartItem = {
                productId: product.id,
                barcode: product.barcode,
                name: product.name,
                costPrice: product.costPrice,
                sellingPrice: product.sellingPrice,
                quantity: quantity,
                total: quantity * product.sellingPrice,
                profit: quantity * (product.sellingPrice - product.costPrice)
            };
            this.currentCart.push(cartItem);
        }

        return { success: true, cart: this.currentCart };
    }

    removeFromCart(productId) {
        this.currentCart = this.currentCart.filter(item => item.productId !== productId);
        return { success: true, cart: this.currentCart };
    }

    updateCartItemQuantity(productId, quantity) {
        const itemIndex = this.currentCart.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            return { success: false, error: 'Item not found in cart' };
        }

        const product = this.storage.getProductById(productId);
        if (!product) {
            return { success: false, error: 'Product not found' };
        }

        if (quantity > product.stock) {
            return { success: false, error: 'Insufficient stock' };
        }

        if (quantity <= 0) {
            return this.removeFromCart(productId);
        }

        this.currentCart[itemIndex].quantity = quantity;
        this.currentCart[itemIndex].total = quantity * product.sellingPrice;
        this.currentCart[itemIndex].profit = quantity * (product.sellingPrice - product.costPrice);

        return { success: true, cart: this.currentCart };
    }

    clearCart() {
        this.currentCart = [];
        return { success: true, cart: this.currentCart };
    }

    getCart() {
        return this.currentCart;
    }

    /**
     * Cart Calculations
     */
    calculateCartTotals() {
        const subtotal = this.currentCart.reduce((sum, item) => sum + item.total, 0);
        const totalProfit = this.currentCart.reduce((sum, item) => sum + item.profit, 0);
        const discount = 0; // Can be implemented later
        const total = subtotal - discount;

        return {
            subtotal: this.formatCurrency(subtotal),
            discount: this.formatCurrency(discount),
            total: this.formatCurrency(total),
            totalProfit: this.formatCurrency(totalProfit),
            itemCount: this.currentCart.length,
            totalQuantity: this.currentCart.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    /**
     * Checkout Process
     */
    processCheckout(customerPayment) {
        if (this.currentCart.length === 0) {
            return { success: false, error: 'Cart is empty' };
        }

        const totals = this.calculateCartTotals();
        const totalAmount = this.parseCurrency(totals.total);
        
        const validation = this.validateCheckout(customerPayment, totalAmount);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const change = customerPayment - totalAmount;
        const profit = this.parseCurrency(totals.totalProfit);

        const bill = {
            mode: 'ultra',
            items: [...this.currentCart],
            subtotal: this.parseCurrency(totals.subtotal),
            discount: this.parseCurrency(totals.discount),
            total: totalAmount,
            customerPayment: parseFloat(customerPayment),
            change: change,
            profit: profit,
            currency: this.currentCurrency,
            timestamp: new Date().toISOString()
        };

        // Clear cart after successful checkout
        this.clearCart();

        return { success: true, bill };
    }

    validateCheckout(customerPayment, totalAmount) {
        const errors = [];

        if (!customerPayment || customerPayment <= 0) {
            errors.push('Customer payment must be greater than 0');
        }

        if (customerPayment < totalAmount) {
            errors.push('Customer payment cannot be less than total amount');
        }

        // Check stock availability for all items
        for (const item of this.currentCart) {
            const product = this.storage.getProductById(item.productId);
            if (!product) {
                errors.push(`Product ${item.name} not found`);
                continue;
            }
            if (product.stock < item.quantity) {
                errors.push(`Insufficient stock for ${item.name}. Available: ${product.stock}, Required: ${item.quantity}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Bill Generation and Formatting
     */
    generateBillHTML(bill) {
        const shopProfile = this.storage.getShopProfile();
        const billNumber = bill.billNumber || 'N/A';
        const date = new Date(bill.timestamp).toLocaleString();

        let itemsHTML = '';
        if (bill.mode === 'ultra' && bill.items && bill.items.length > 0) {
            itemsHTML = `
                <div class="bill-items">
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bill.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${this.formatCurrency(item.sellingPrice)}</td>
                                    <td>${this.formatCurrency(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="bill-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${this.formatCurrency(bill.subtotal)}</span>
                    </div>
                    ${bill.discount > 0 ? `
                        <div class="total-row">
                            <span>Discount:</span>
                            <span>-${this.formatCurrency(bill.discount)}</span>
                        </div>
                    ` : ''}
                    <div class="total-row total-final">
                        <span>Total:</span>
                        <span>${this.formatCurrency(bill.total)}</span>
                    </div>
                </div>
            `;
        } else {
            itemsHTML = `
                <div class="bill-simple">
                    <div class="total-row total-final">
                        <span>Bill Amount:</span>
                        <span>${this.formatCurrency(bill.total)}</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="bill-receipt">
                <div class="bill-header">
                    <h2>${shopProfile?.shopName || 'Shop Name'}</h2>
                    <p>${shopProfile?.shopAddress || 'Shop Address'}</p>
                    <p>Phone: ${shopProfile?.shopMobile || 'N/A'}</p>
                    ${shopProfile?.shopEmail ? `<p>Email: ${shopProfile.shopEmail}</p>` : ''}
                </div>
                
                <div class="bill-info">
                    <div class="bill-row">
                        <span>Bill No:</span>
                        <span>${billNumber}</span>
                    </div>
                    <div class="bill-row">
                        <span>Date:</span>
                        <span>${date}</span>
                    </div>
                    <div class="bill-row">
                        <span>Mode:</span>
                        <span>${bill.mode === 'ultra' ? 'Ultra Mode' : 'Simple Mode'}</span>
                    </div>
                </div>
                
                ${itemsHTML}
                
                <div class="bill-payment">
                    <div class="payment-row">
                        <span>Customer Payment:</span>
                        <span>${this.formatCurrency(bill.customerPayment)}</span>
                    </div>
                    <div class="payment-row">
                        <span>Change:</span>
                        <span>${this.formatCurrency(bill.change)}</span>
                    </div>
                </div>
                
                <div class="bill-footer">
                    <p>Thank you for your business!</p>
                    <p>Powered by Zovatu Smart Billing</p>
                    <div class="bill-barcode" id="billBarcode"></div>
                </div>
            </div>
        `;
    }

    /**
     * Product Management
     */
    addProduct(productData) {
        const validation = this.storage.validateProduct(productData);
        if (validation.length > 0) {
            return { success: false, errors: validation };
        }

        const product = this.storage.saveProduct(productData);
        return { success: true, product };
    }

    updateProduct(id, updates) {
        const validation = this.storage.validateProduct({ ...this.storage.getProductById(id), ...updates });
        if (validation.length > 0) {
            return { success: false, errors: validation };
        }

        const product = this.storage.updateProduct(id, updates);
        if (!product) {
            return { success: false, error: 'Product not found' };
        }

        return { success: true, product };
    }

    deleteProduct(id) {
        const success = this.storage.deleteProduct(id);
        return { success };
    }

    searchProducts(query) {
        return this.storage.searchProducts(query);
    }

    /**
     * Low Stock Alerts
     */
    checkLowStockAlerts() {
        const lowStockProducts = this.storage.getLowStockProducts();
        return lowStockProducts;
    }

    /**
     * Currency Management
     */
    setCurrency(currencyCode) {
        if (!this.currencies[currencyCode]) {
            return { success: false, error: 'Unsupported currency' };
        }

        this.currentCurrency = {
            code: currencyCode,
            symbol: this.currencies[currencyCode].symbol,
            name: this.currencies[currencyCode].name
        };

        this.storage.updateSettings({
            currency: this.currentCurrency
        });

        return { success: true, currency: this.currentCurrency };
    }

    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return `${this.currentCurrency.symbol}${amount.toFixed(2)}`;
    }

    parseCurrency(formattedAmount) {
        if (typeof formattedAmount === 'number') {
            return formattedAmount;
        }
        // Remove currency symbol and parse
        const cleaned = formattedAmount.replace(/[^\d.-]/g, '');
        return parseFloat(cleaned) || 0;
    }

    /**
     * Billing Mode Management
     */
    setBillingMode(mode) {
        if (!['simple', 'ultra'].includes(mode)) {
            return { success: false, error: 'Invalid billing mode' };
        }

        this.currentMode = mode;
        this.storage.updateSettings({ billingMode: mode });
        
        // Clear cart when switching modes
        this.clearCart();

        return { success: true, mode };
    }

    getBillingMode() {
        return this.currentMode;
    }

    /**
     * Analytics and Reporting
     */
    generateSalesReport(dateFrom, dateTo) {
        const bills = this.storage.filterBills({
            dateFrom: dateFrom ? new Date(dateFrom).toISOString() : null,
            dateTo: dateTo ? new Date(dateTo).toISOString() : null
        });

        const totalSales = bills.reduce((sum, bill) => sum + bill.total, 0);
        const totalProfit = bills.reduce((sum, bill) => sum + (bill.profit || 0), 0);
        const totalBills = bills.length;

        const modeBreakdown = bills.reduce((acc, bill) => {
            acc[bill.mode] = (acc[bill.mode] || 0) + 1;
            return acc;
        }, {});

        return {
            dateFrom,
            dateTo,
            totalSales: this.formatCurrency(totalSales),
            totalProfit: this.formatCurrency(totalProfit),
            totalBills,
            averageBillValue: this.formatCurrency(totalSales / totalBills || 0),
            modeBreakdown,
            bills
        };
    }

    getDashboardStats() {
        const analytics = this.storage.getAnalytics();
        const shopStatus = this.storage.getShopStatus();
        const lowStockProducts = this.checkLowStockAlerts();

        return {
            totalSales: this.formatCurrency(analytics.totalSales),
            totalProfit: this.formatCurrency(analytics.totalProfit),
            stockValue: this.formatCurrency(analytics.stockValue),
            productCount: analytics.productCount,
            dailySales: this.formatCurrency(shopStatus.dailySales),
            dailyProfit: this.formatCurrency(shopStatus.dailyProfit),
            lowStockCount: lowStockProducts.length,
            shopStatus: shopStatus.isOpen ? 'Open' : 'Closed'
        };
    }

    /**
     * Barcode Generation and Validation
     */
    generateBarcode() {
        return this.storage.generateBarcode();
    }

    validateBarcode(barcode) {
        // Basic barcode validation
        if (!barcode || barcode.length < 8) {
            return { isValid: false, error: 'Barcode must be at least 8 characters' };
        }

        // Check if barcode already exists
        const existingProduct = this.storage.getProductByBarcode(barcode);
        if (existingProduct) {
            return { isValid: false, error: 'Barcode already exists' };
        }

        return { isValid: true };
    }

    /**
     * Print Management
     */
    printBill(bill) {
        const billHTML = this.generateBillHTML(bill);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill - ${bill.billNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .bill-receipt { max-width: 400px; margin: 0 auto; }
                    .bill-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                    .bill-header h2 { margin: 0; font-size: 18px; }
                    .bill-header p { margin: 2px 0; font-size: 12px; }
                    .bill-info, .bill-payment { margin: 15px 0; }
                    .bill-row, .payment-row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    .items-table th, .items-table td { border-bottom: 1px solid #ddd; padding: 5px; text-align: left; }
                    .items-table th { background-color: #f5f5f5; }
                    .bill-totals { border-top: 2px solid #000; padding-top: 10px; margin-top: 15px; }
                    .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total-final { font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 5px; }
                    .bill-footer { text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
                    .bill-footer p { margin: 5px 0; font-size: 12px; }
                    @media print {
                        body { margin: 0; }
                        .bill-receipt { max-width: none; }
                    }
                </style>
            </head>
            <body>
                ${billHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    /**
     * Utility Methods
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString();
    }

    calculateProfitMargin(costPrice, sellingPrice) {
        if (costPrice <= 0) return 0;
        return ((sellingPrice - costPrice) / costPrice * 100).toFixed(2);
    }

    /**
     * Validation Helpers
     */
    isValidNumber(value, min = 0) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min;
    }

    isValidString(value, minLength = 1) {
        return typeof value === 'string' && value.trim().length >= minLength;
    }

    /**
     * Error Handling
     */
    handleError(error, context = '') {
        console.error(`Billing Core Error ${context}:`, error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred',
            context
        };
    }
}

// Export for use in other modules
window.ZovatuBillingCore = ZovatuBillingCore;

