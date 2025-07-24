/* ===================================
   Zovatu Smart Billing Tool - Invoices Data
   Invoice and Billing Management Module
   =================================== */

// Invoice management class
class InvoiceManager {
    constructor() {
        this.currentInvoice = null;
        this.init();
    }

    // Initialize invoice manager
    init() {
        this.resetCurrentInvoice();
    }

    // Reset current invoice
    resetCurrentInvoice() {
        this.currentInvoice = {
            id: null,
            invoiceNumber: null,
            shopId: null,
            customerId: null,
            customerInfo: {
                name: '',
                phone: '',
                email: '',
                address: ''
            },
            items: [],
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            total: 0,
            paymentMethod: 'cash',
            paymentStatus: 'pending',
            notes: '',
            createdAt: null,
            updatedAt: null
        };
    }

    // Get all invoices for current shop
    getAllInvoices(shopId = null) {
        const currentShopId = shopId || (ZovatuShops.getCurrentShop()?.id);
        if (!currentShopId) return [];
        
        return ZovatuStore.getInvoices(currentShopId);
    }

    // Create new invoice
    createInvoice(invoiceData = null) {
        const currentShop = ZovatuShops.getCurrentShop();
        if (!currentShop) {
            ZovatuUtils.showToast('Please select a shop first', 'error');
            return null;
        }

        const invoice = invoiceData || {
            shopId: currentShop.id,
            customerId: null,
            customerInfo: {
                name: '',
                phone: '',
                email: '',
                address: ''
            },
            items: [],
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            total: 0,
            paymentMethod: 'cash',
            paymentStatus: 'pending',
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const success = ZovatuStore.addInvoice(invoice);
        if (success) {
            this.currentInvoice = { ...invoice };
            return invoice;
        } else {
            ZovatuUtils.showToast('Failed to create invoice', 'error');
            return null;
        }
    }

    // Update invoice
    updateInvoice(invoiceId, updates) {
        const success = ZovatuStore.updateInvoice(invoiceId, {
            ...updates,
            updatedAt: new Date().toISOString()
        });

        if (success) {
            // Update current invoice if it's the one being updated
            if (this.currentInvoice && this.currentInvoice.id === invoiceId) {
                this.currentInvoice = { ...this.currentInvoice, ...updates };
            }
            return true;
        } else {
            ZovatuUtils.showToast('Failed to update invoice', 'error');
            return false;
        }
    }

    // Delete invoice
    deleteInvoice(invoiceId) {
        const invoice = ZovatuStore.getInvoices().find(inv => inv.id === invoiceId);
        if (!invoice) return false;

        // Restore stock for all items in the invoice
        invoice.items.forEach(item => {
            if (item.productId) {
                ZovatuProducts.updateStock(
                    item.productId, 
                    item.quantity, 
                    'add', 
                    `Invoice ${invoice.invoiceNumber} deleted`
                );
            }
        });

        const success = ZovatuStore.deleteInvoice(invoiceId);
        if (success) {
            ZovatuUtils.showToast('Invoice deleted successfully!', 'success');
            return true;
        } else {
            ZovatuUtils.showToast('Failed to delete invoice', 'error');
            return false;
        }
    }

    // Get current invoice
    getCurrentInvoice() {
        return this.currentInvoice;
    }

    // Set current invoice
    setCurrentInvoice(invoice) {
        this.currentInvoice = invoice ? { ...invoice } : null;
    }

    // Add item to current invoice
    addItem(item) {
        if (!this.currentInvoice) {
            this.resetCurrentInvoice();
        }

        // Check if item already exists
        const existingItemIndex = this.currentInvoice.items.findIndex(
            existingItem => existingItem.productId === item.productId || 
            (existingItem.name === item.name && !item.productId)
        );

        if (existingItemIndex !== -1) {
            // Update existing item quantity
            this.currentInvoice.items[existingItemIndex].quantity += item.quantity || 1;
            this.currentInvoice.items[existingItemIndex].total = 
                this.currentInvoice.items[existingItemIndex].quantity * 
                this.currentInvoice.items[existingItemIndex].price;
        } else {
            // Add new item
            const newItem = {
                id: ZovatuUtils.generateId('item_'),
                productId: item.productId || null,
                name: item.name,
                sku: item.sku || '',
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                unit: item.unit || 'pcs',
                total: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
            };
            this.currentInvoice.items.push(newItem);
        }

        this.calculateTotals();
        return true;
    }

    // Remove item from current invoice
    removeItem(itemId) {
        if (!this.currentInvoice) return false;

        const itemIndex = this.currentInvoice.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.currentInvoice.items.splice(itemIndex, 1);
            this.calculateTotals();
            return true;
        }
        return false;
    }

    // Update item quantity
    updateItemQuantity(itemId, quantity) {
        if (!this.currentInvoice) return false;

        const item = this.currentInvoice.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = Math.max(1, parseInt(quantity) || 1);
            item.total = item.quantity * item.price;
            this.calculateTotals();
            return true;
        }
        return false;
    }

    // Calculate totals for current invoice
    calculateTotals() {
        if (!this.currentInvoice) return;

        const currentShop = ZovatuShops.getCurrentShop();
        const settings = currentShop?.settings || {};

        // Calculate subtotal
        this.currentInvoice.subtotal = this.currentInvoice.items.reduce(
            (sum, item) => sum + item.total, 0
        );

        // Calculate tax
        const taxRate = parseFloat(settings.taxRate) || 0;
        this.currentInvoice.taxAmount = (this.currentInvoice.subtotal * taxRate) / 100;

        // Calculate discount
        const discountRate = parseFloat(settings.discountRate) || 0;
        this.currentInvoice.discountAmount = (this.currentInvoice.subtotal * discountRate) / 100;

        // Calculate total
        this.currentInvoice.total = this.currentInvoice.subtotal + 
                                   this.currentInvoice.taxAmount - 
                                   this.currentInvoice.discountAmount;

        // Ensure total is not negative
        this.currentInvoice.total = Math.max(0, this.currentInvoice.total);
    }

    // Set customer info
    setCustomerInfo(customerInfo) {
        if (!this.currentInvoice) {
            this.resetCurrentInvoice();
        }
        this.currentInvoice.customerInfo = { ...customerInfo };
    }

    // Set payment method
    setPaymentMethod(method) {
        if (!this.currentInvoice) {
            this.resetCurrentInvoice();
        }
        this.currentInvoice.paymentMethod = method;
    }

    // Set notes
    setNotes(notes) {
        if (!this.currentInvoice) {
            this.resetCurrentInvoice();
        }
        this.currentInvoice.notes = notes;
    }

    // Complete invoice (save and finalize)
    completeInvoice() {
        if (!this.currentInvoice || this.currentInvoice.items.length === 0) {
            ZovatuUtils.showToast('Cannot complete empty invoice', 'error');
            return false;
        }

        const currentShop = ZovatuShops.getCurrentShop();
        if (!currentShop) {
            ZovatuUtils.showToast('Please select a shop first', 'error');
            return false;
        }

        // Update stock for all items
        this.currentInvoice.items.forEach(item => {
            if (item.productId) {
                ZovatuProducts.updateStock(
                    item.productId, 
                    item.quantity, 
                    'subtract', 
                    `Sale - Invoice ${this.currentInvoice.invoiceNumber || 'New'}`
                );
            }
        });

        // Set invoice data
        this.currentInvoice.shopId = currentShop.id;
        this.currentInvoice.paymentStatus = 'completed';
        this.currentInvoice.createdAt = new Date().toISOString();
        this.currentInvoice.updatedAt = new Date().toISOString();

        // Save invoice
        const success = ZovatuStore.addInvoice(this.currentInvoice);
        if (success) {
            ZovatuUtils.showToast('Invoice completed successfully!', 'success');
            
            // Reset for next invoice
            const completedInvoice = { ...this.currentInvoice };
            this.resetCurrentInvoice();
            
            return completedInvoice;
        } else {
            ZovatuUtils.showToast('Failed to complete invoice', 'error');
            return false;
        }
    }

    // Get invoice statistics
    getInvoiceStats(shopId = null, days = 30) {
        const invoices = this.getAllInvoices(shopId);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentInvoices = invoices.filter(invoice => 
            new Date(invoice.createdAt) >= cutoffDate
        );

        const totalSales = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
        const recentSales = recentInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
        
        const totalOrders = invoices.length;
        const recentOrders = recentInvoices.length;

        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        const recentAverageOrderValue = recentOrders > 0 ? recentSales / recentOrders : 0;

        return {
            totalSales,
            recentSales,
            totalOrders,
            recentOrders,
            averageOrderValue,
            recentAverageOrderValue,
            period: days
        };
    }

    // Get sales by date range
    getSalesByDateRange(startDate, endDate, shopId = null) {
        const invoices = this.getAllInvoices(shopId);
        const start = new Date(startDate);
        const end = new Date(endDate);

        const filteredInvoices = invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.createdAt);
            return invoiceDate >= start && invoiceDate <= end;
        });

        const totalSales = filteredInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
        const totalOrders = filteredInvoices.length;

        // Group by date
        const dailySales = {};
        filteredInvoices.forEach(invoice => {
            const date = ZovatuUtils.formatDate(invoice.createdAt, 'YYYY-MM-DD');
            if (!dailySales[date]) {
                dailySales[date] = { sales: 0, orders: 0 };
            }
            dailySales[date].sales += invoice.total || 0;
            dailySales[date].orders += 1;
        });

        return {
            totalSales,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
            dailySales,
            invoices: filteredInvoices
        };
    }

    // Get top selling products
    getTopSellingProducts(shopId = null, limit = 10) {
        const invoices = this.getAllInvoices(shopId);
        const productSales = {};

        invoices.forEach(invoice => {
            invoice.items.forEach(item => {
                const key = item.productId || item.name;
                if (!productSales[key]) {
                    productSales[key] = {
                        productId: item.productId,
                        name: item.name,
                        totalQuantity: 0,
                        totalSales: 0,
                        orderCount: 0
                    };
                }
                productSales[key].totalQuantity += item.quantity;
                productSales[key].totalSales += item.total;
                productSales[key].orderCount += 1;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, limit);
    }

    // Search invoices
    searchInvoices(query, shopId = null) {
        const invoices = this.getAllInvoices(shopId);
        const searchTerm = query.toLowerCase();

        return invoices.filter(invoice => 
            invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
            invoice.customerInfo.name.toLowerCase().includes(searchTerm) ||
            invoice.customerInfo.phone.includes(searchTerm) ||
            invoice.items.some(item => item.name.toLowerCase().includes(searchTerm))
        );
    }

    // Get payment methods
    getPaymentMethods() {
        return [
            { value: 'cash', label: 'Cash', icon: 'fas fa-money-bill-wave' },
            { value: 'card', label: 'Card', icon: 'fas fa-credit-card' },
            { value: 'mobile', label: 'Mobile Payment', icon: 'fas fa-mobile-alt' },
            { value: 'bank', label: 'Bank Transfer', icon: 'fas fa-university' },
            { value: 'check', label: 'Check', icon: 'fas fa-money-check' },
            { value: 'credit', label: 'Credit', icon: 'fas fa-handshake' }
        ];
    }

    // Export invoices
    exportInvoices(shopId = null, format = 'json', dateRange = null) {
        let invoices = this.getAllInvoices(shopId);
        
        // Filter by date range if provided
        if (dateRange && dateRange.start && dateRange.end) {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            invoices = invoices.filter(invoice => {
                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate >= start && invoiceDate <= end;
            });
        }

        const shop = ZovatuShops.getCurrentShop();
        
        if (format === 'csv') {
            return this.exportInvoicesCSV(invoices, shop);
        } else {
            return this.exportInvoicesJSON(invoices, shop);
        }
    }

    // Export invoices as JSON
    exportInvoicesJSON(invoices, shop) {
        const exportData = {
            shop: shop ? { id: shop.id, name: shop.name } : null,
            invoices,
            exportDate: new Date().toISOString(),
            totalInvoices: invoices.length,
            totalSales: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
        };

        const filename = `invoices_${shop ? shop.name.replace(/[^a-zA-Z0-9]/g, '_') : 'all'}_${ZovatuUtils.formatDate(new Date(), 'YYYY-MM-DD')}.json`;
        const jsonString = ZovatuUtils.stringifyJSON(exportData);
        
        ZovatuUtils.downloadFile(jsonString, filename, 'application/json');
        return true;
    }

    // Export invoices as CSV
    exportInvoicesCSV(invoices, shop) {
        const headers = [
            'Invoice Number', 'Date', 'Customer Name', 'Customer Phone', 
            'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'Payment Method', 'Status'
        ];

        const csvData = [
            headers.join(','),
            ...invoices.map(invoice => [
                `"${invoice.invoiceNumber}"`,
                `"${ZovatuUtils.formatDate(invoice.createdAt)}"`,
                `"${invoice.customerInfo.name}"`,
                `"${invoice.customerInfo.phone}"`,
                `"${invoice.items.length} items"`,
                invoice.subtotal,
                invoice.taxAmount,
                invoice.discountAmount,
                invoice.total,
                `"${invoice.paymentMethod}"`,
                `"${invoice.paymentStatus}"`
            ].join(','))
        ].join('\n');

        const filename = `invoices_${shop ? shop.name.replace(/[^a-zA-Z0-9]/g, '_') : 'all'}_${ZovatuUtils.formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
        
        ZovatuUtils.downloadFile(csvData, filename, 'text/csv');
        return true;
    }

    // Print invoice
    printInvoice(invoiceId) {
        const invoice = ZovatuStore.getInvoices().find(inv => inv.id === invoiceId);
        if (!invoice) {
            ZovatuUtils.showToast('Invoice not found', 'error');
            return false;
        }

        const shop = ZovatuStore.getShop(invoice.shopId);
        const settings = ZovatuStore.getSettings();

        // Generate print content
        const printContent = this.generatePrintContent(invoice, shop, settings);
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        
        return true;
    }

    // Generate print content
    generatePrintContent(invoice, shop, settings) {
        const currency = settings.currency || 'BDT';
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .shop-name { font-size: 24px; font-weight: bold; }
                .shop-info { margin: 10px 0; }
                .invoice-info { margin: 20px 0; }
                .customer-info { margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .totals { text-align: right; margin: 20px 0; }
                .total-row { margin: 5px 0; }
                .grand-total { font-weight: bold; font-size: 18px; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="shop-name">${shop?.name || 'Shop Name'}</div>
                <div class="shop-info">${shop?.address || ''}</div>
                <div class="shop-info">${shop?.phone || ''} | ${shop?.email || ''}</div>
            </div>
            
            <div class="invoice-info">
                <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
                <strong>Date:</strong> ${ZovatuUtils.formatDate(invoice.createdAt, 'DD/MM/YYYY HH:mm')}<br>
                <strong>Payment Method:</strong> ${invoice.paymentMethod}
            </div>
            
            ${invoice.customerInfo.name ? `
            <div class="customer-info">
                <strong>Customer:</strong> ${invoice.customerInfo.name}<br>
                ${invoice.customerInfo.phone ? `<strong>Phone:</strong> ${invoice.customerInfo.phone}<br>` : ''}
                ${invoice.customerInfo.address ? `<strong>Address:</strong> ${invoice.customerInfo.address}<br>` : ''}
            </div>
            ` : ''}
            
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity} ${item.unit}</td>
                            <td>${ZovatuUtils.formatCurrency(item.price, currency)}</td>
                            <td>${ZovatuUtils.formatCurrency(item.total, currency)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-row">Subtotal: ${ZovatuUtils.formatCurrency(invoice.subtotal, currency)}</div>
                ${invoice.taxAmount > 0 ? `<div class="total-row">Tax: ${ZovatuUtils.formatCurrency(invoice.taxAmount, currency)}</div>` : ''}
                ${invoice.discountAmount > 0 ? `<div class="total-row">Discount: -${ZovatuUtils.formatCurrency(invoice.discountAmount, currency)}</div>` : ''}
                <div class="total-row grand-total">Total: ${ZovatuUtils.formatCurrency(invoice.total, currency)}</div>
            </div>
            
            ${invoice.notes ? `<div style="margin-top: 30px;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
            
            <div style="text-align: center; margin-top: 40px; font-size: 12px;">
                Thank you for your business!<br>
                Generated by Zovatu Smart Billing Tool
            </div>
        </body>
        </html>
        `;
    }
}

// Create global invoice manager instance
const ZovatuInvoices = new InvoiceManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InvoiceManager, ZovatuInvoices };
}

