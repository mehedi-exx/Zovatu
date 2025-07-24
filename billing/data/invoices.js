// Zovatu Billing Tool - Invoices Data Management
// Handles invoice operations, billing calculations, and reporting

class InvoicesManager {
    constructor() {
        this.storage = window.billingStorage;
    }

    // Create a new invoice
    createInvoice(shopId, invoiceData) {
        // Validate required fields
        if (!invoiceData.items || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
            throw new Error('Invoice must have at least one item');
        }

        if (!invoiceData.total_amount || parseFloat(invoiceData.total_amount) <= 0) {
            throw new Error('Invoice total amount must be greater than 0');
        }

        // Generate invoice number if not provided
        const invoiceNumber = invoiceData.invoice_number || this.generateInvoiceNumber(shopId);

        // Check for duplicate invoice numbers
        const existingInvoices = this.storage.getInvoices(shopId);
        if (existingInvoices.some(invoice => invoice.invoice_number === invoiceNumber)) {
            throw new Error('An invoice with this number already exists');
        }

        // Calculate totals
        const calculations = this.calculateInvoiceTotals(invoiceData.items, invoiceData.discount, invoiceData.tax_rate);

        // Create invoice object
        const invoice = {
            id: this.storage.generateId(),
            shop_id: shopId,
            invoice_number: invoiceNumber,
            date: invoiceData.date || new Date().toISOString(),
            customer_name: invoiceData.customer_name?.trim() || 'Walk-in Customer',
            customer_phone: invoiceData.customer_phone?.trim() || '',
            customer_email: invoiceData.customer_email?.trim() || '',
            customer_address: invoiceData.customer_address?.trim() || '',
            items: invoiceData.items.map(item => ({
                product_id: item.product_id,
                name: item.name?.trim() || '',
                quantity: parseInt(item.quantity) || 1,
                unit_price: parseFloat(item.unit_price) || 0,
                total: parseFloat(item.total) || (parseInt(item.quantity) * parseFloat(item.unit_price)),
                discount: parseFloat(item.discount) || 0,
                tax_rate: parseFloat(item.tax_rate) || 0
            })),
            subtotal: calculations.subtotal,
            discount_amount: calculations.discount_amount,
            tax_amount: calculations.tax_amount,
            total_amount: calculations.total_amount,
            amount_received: parseFloat(invoiceData.amount_received) || calculations.total_amount,
            change_returned: parseFloat(invoiceData.change_returned) || 0,
            payment_method: invoiceData.payment_method || 'cash',
            status: invoiceData.status || 'paid',
            notes: invoiceData.notes?.trim() || '',
            salesman_id: invoiceData.salesman_id || 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            printed_at: null,
            voided_at: null,
            void_reason: null
        };

        // Update product stock
        this.updateProductStock(shopId, invoice.items);

        // Save invoice
        if (this.storage.saveInvoice(shopId, invoice)) {
            return invoice;
        } else {
            throw new Error('Failed to save invoice data');
        }
    }

    // Update existing invoice
    updateInvoice(shopId, invoiceId, updateData) {
        const invoice = this.storage.getInvoice(shopId, invoiceId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Prevent updating voided invoices
        if (invoice.voided_at) {
            throw new Error('Cannot update a voided invoice');
        }

        // Validate invoice number uniqueness if changed
        if (updateData.invoice_number && updateData.invoice_number !== invoice.invoice_number) {
            const existingInvoices = this.storage.getInvoices(shopId);
            if (existingInvoices.some(inv => inv.id !== invoiceId && inv.invoice_number === updateData.invoice_number)) {
                throw new Error('An invoice with this number already exists');
            }
        }

        // Restore original stock if items are being changed
        if (updateData.items) {
            this.restoreProductStock(shopId, invoice.items);
        }

        // Recalculate totals if items changed
        let calculations = {
            subtotal: invoice.subtotal,
            discount_amount: invoice.discount_amount,
            tax_amount: invoice.tax_amount,
            total_amount: invoice.total_amount
        };

        if (updateData.items) {
            calculations = this.calculateInvoiceTotals(updateData.items, updateData.discount, updateData.tax_rate);
        }

        // Update invoice data
        const updatedInvoice = {
            ...invoice,
            ...updateData,
            id: invoice.id, // Ensure ID doesn't change
            shop_id: invoice.shop_id, // Ensure shop_id doesn't change
            created_at: invoice.created_at, // Preserve creation date
            updated_at: new Date().toISOString(),
            ...calculations
        };

        // Update product stock with new items
        if (updateData.items) {
            this.updateProductStock(shopId, updatedInvoice.items);
        }

        if (this.storage.saveInvoice(shopId, updatedInvoice)) {
            return updatedInvoice;
        } else {
            throw new Error('Failed to update invoice data');
        }
    }

    // Void an invoice
    voidInvoice(shopId, invoiceId, reason) {
        const invoice = this.storage.getInvoice(shopId, invoiceId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        if (invoice.voided_at) {
            throw new Error('Invoice is already voided');
        }

        // Restore product stock
        this.restoreProductStock(shopId, invoice.items);

        // Update invoice as voided
        const voidedInvoice = {
            ...invoice,
            status: 'voided',
            voided_at: new Date().toISOString(),
            void_reason: reason?.trim() || 'No reason provided',
            updated_at: new Date().toISOString()
        };

        if (this.storage.saveInvoice(shopId, voidedInvoice)) {
            return voidedInvoice;
        } else {
            throw new Error('Failed to void invoice');
        }
    }

    // Delete invoice (permanent)
    deleteInvoice(shopId, invoiceId) {
        const invoice = this.storage.getInvoice(shopId, invoiceId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Restore product stock if not already voided
        if (!invoice.voided_at) {
            this.restoreProductStock(shopId, invoice.items);
        }

        if (this.storage.deleteInvoice(shopId, invoiceId)) {
            return true;
        } else {
            throw new Error('Failed to delete invoice');
        }
    }

    // Generate invoice number
    generateInvoiceNumber(shopId) {
        const shop = this.storage.getShop(shopId);
        const settings = shop?.settings || this.storage.getSettings();
        const prefix = settings.invoice_prefix || 'INV-';
        const year = new Date().getFullYear();
        const invoices = this.storage.getInvoices(shopId);
        const count = invoices.length + 1;
        return `${prefix}${year}-${count.toString().padStart(4, '0')}`;
    }

    // Calculate invoice totals
    calculateInvoiceTotals(items, discountPercent = 0, taxRate = 0) {
        const subtotal = items.reduce((sum, item) => {
            const itemTotal = (parseInt(item.quantity) || 1) * (parseFloat(item.unit_price) || 0);
            return sum + itemTotal;
        }, 0);

        const discount_amount = subtotal * (parseFloat(discountPercent) || 0) / 100;
        const taxable_amount = subtotal - discount_amount;
        const tax_amount = taxable_amount * (parseFloat(taxRate) || 0) / 100;
        const total_amount = taxable_amount + tax_amount;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount_amount: parseFloat(discount_amount.toFixed(2)),
            tax_amount: parseFloat(tax_amount.toFixed(2)),
            total_amount: parseFloat(total_amount.toFixed(2))
        };
    }

    // Update product stock after sale
    updateProductStock(shopId, items) {
        items.forEach(item => {
            if (item.product_id && item.product_id !== 'quick_sale') {
                try {
                    const product = this.storage.getProduct(shopId, item.product_id);
                    if (product) {
                        const newStock = Math.max(0, product.stock - (parseInt(item.quantity) || 1));
                        this.storage.saveProduct(shopId, { ...product, stock: newStock });
                    }
                } catch (error) {
                    console.warn(`Failed to update stock for product ${item.product_id}:`, error);
                }
            }
        });
    }

    // Restore product stock (for voids/returns)
    restoreProductStock(shopId, items) {
        items.forEach(item => {
            if (item.product_id && item.product_id !== 'quick_sale') {
                try {
                    const product = this.storage.getProduct(shopId, item.product_id);
                    if (product) {
                        const newStock = product.stock + (parseInt(item.quantity) || 1);
                        this.storage.saveProduct(shopId, { ...product, stock: newStock });
                    }
                } catch (error) {
                    console.warn(`Failed to restore stock for product ${item.product_id}:`, error);
                }
            }
        });
    }

    // Get invoices with filters
    getInvoices(shopId, filters = {}) {
        return this.storage.getInvoices(shopId, filters);
    }

    // Search invoices
    searchInvoices(shopId, query) {
        return this.storage.searchInvoices(shopId, query);
    }

    // Get invoice statistics
    getInvoiceStats(shopId, period = 'month') {
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
            new Date(invoice.date) >= startDate && !invoice.voided_at
        );

        const totalSales = periodInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
        const totalInvoices = periodInvoices.length;
        const averageOrderValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;
        const totalTax = periodInvoices.reduce((sum, invoice) => sum + (invoice.tax_amount || 0), 0);
        const totalDiscount = periodInvoices.reduce((sum, invoice) => sum + (invoice.discount_amount || 0), 0);

        // Payment method breakdown
        const paymentMethods = {};
        periodInvoices.forEach(invoice => {
            const method = invoice.payment_method || 'cash';
            paymentMethods[method] = (paymentMethods[method] || 0) + invoice.total_amount;
        });

        // Daily breakdown for charts
        const dailyBreakdown = {};
        periodInvoices.forEach(invoice => {
            const date = new Date(invoice.date).toDateString();
            if (!dailyBreakdown[date]) {
                dailyBreakdown[date] = { sales: 0, count: 0 };
            }
            dailyBreakdown[date].sales += invoice.total_amount;
            dailyBreakdown[date].count += 1;
        });

        return {
            period,
            totalSales,
            totalInvoices,
            averageOrderValue,
            totalTax,
            totalDiscount,
            paymentMethods,
            dailyBreakdown,
            startDate: startDate.toISOString(),
            endDate: now.toISOString()
        };
    }

    // Get top customers
    getTopCustomers(shopId, limit = 10) {
        const invoices = this.storage.getInvoices(shopId);
        const customers = {};

        invoices.forEach(invoice => {
            if (invoice.customer_name && invoice.customer_name !== 'Walk-in Customer' && !invoice.voided_at) {
                const key = invoice.customer_name.toLowerCase();
                if (!customers[key]) {
                    customers[key] = {
                        name: invoice.customer_name,
                        phone: invoice.customer_phone,
                        email: invoice.customer_email,
                        totalSpent: 0,
                        totalInvoices: 0,
                        lastPurchase: null
                    };
                }
                customers[key].totalSpent += invoice.total_amount;
                customers[key].totalInvoices += 1;
                if (!customers[key].lastPurchase || new Date(invoice.date) > new Date(customers[key].lastPurchase)) {
                    customers[key].lastPurchase = invoice.date;
                }
            }
        });

        return Object.values(customers)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, limit);
    }

    // Get sales by salesman
    getSalesBySalesman(shopId, period = 'month') {
        const invoices = this.storage.getInvoices(shopId);
        const salesmen = this.storage.getSalesmen(shopId);
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
            new Date(invoice.date) >= startDate && !invoice.voided_at
        );

        const salesmanStats = {};
        
        // Initialize with all salesmen
        salesmen.forEach(salesman => {
            salesmanStats[salesman.id] = {
                id: salesman.id,
                name: salesman.name,
                totalSales: 0,
                totalInvoices: 0,
                averageOrderValue: 0
            };
        });

        // Add admin if not exists
        if (!salesmanStats['admin']) {
            salesmanStats['admin'] = {
                id: 'admin',
                name: 'Admin',
                totalSales: 0,
                totalInvoices: 0,
                averageOrderValue: 0
            };
        }

        // Calculate stats
        periodInvoices.forEach(invoice => {
            const salesmanId = invoice.salesman_id || 'admin';
            if (!salesmanStats[salesmanId]) {
                salesmanStats[salesmanId] = {
                    id: salesmanId,
                    name: 'Unknown',
                    totalSales: 0,
                    totalInvoices: 0,
                    averageOrderValue: 0
                };
            }
            salesmanStats[salesmanId].totalSales += invoice.total_amount;
            salesmanStats[salesmanId].totalInvoices += 1;
        });

        // Calculate average order values
        Object.values(salesmanStats).forEach(stats => {
            stats.averageOrderValue = stats.totalInvoices > 0 ? stats.totalSales / stats.totalInvoices : 0;
        });

        return Object.values(salesmanStats).sort((a, b) => b.totalSales - a.totalSales);
    }

    // Validate invoice data
    validateInvoiceData(invoiceData) {
        const errors = [];

        if (!invoiceData.items || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
            errors.push('Invoice must have at least one item');
        }

        if (invoiceData.items) {
            invoiceData.items.forEach((item, index) => {
                if (!item.name || item.name.trim().length === 0) {
                    errors.push(`Item ${index + 1}: Name is required`);
                }
                if (!item.quantity || parseInt(item.quantity) <= 0) {
                    errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
                }
                if (!item.unit_price || parseFloat(item.unit_price) <= 0) {
                    errors.push(`Item ${index + 1}: Unit price must be greater than 0`);
                }
            });
        }

        if (invoiceData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoiceData.customer_email)) {
            errors.push('Please enter a valid email address');
        }

        if (invoiceData.amount_received && parseFloat(invoiceData.amount_received) < 0) {
            errors.push('Amount received cannot be negative');
        }

        return errors;
    }

    // Export invoices
    exportInvoices(shopId, format = 'json', filters = {}) {
        const invoices = this.storage.getInvoices(shopId, filters);
        
        if (format === 'csv') {
            return this.convertInvoicesToCSV(invoices);
        }
        
        return {
            invoices,
            exportDate: new Date().toISOString(),
            shopId,
            filters
        };
    }

    // Convert invoices to CSV
    convertInvoicesToCSV(invoices) {
        const headers = [
            'Invoice Number', 'Date', 'Customer Name', 'Customer Phone', 
            'Subtotal', 'Discount', 'Tax', 'Total Amount', 'Amount Received', 
            'Change Returned', 'Payment Method', 'Status', 'Salesman'
        ];
        
        const rows = invoices.map(invoice => [
            invoice.invoice_number,
            new Date(invoice.date).toLocaleDateString(),
            invoice.customer_name,
            invoice.customer_phone,
            invoice.subtotal,
            invoice.discount_amount,
            invoice.tax_amount,
            invoice.total_amount,
            invoice.amount_received,
            invoice.change_returned,
            invoice.payment_method,
            invoice.status,
            invoice.salesman_id
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    // Mark invoice as printed
    markAsPrinted(shopId, invoiceId) {
        const invoice = this.storage.getInvoice(shopId, invoiceId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        const updatedInvoice = {
            ...invoice,
            printed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        return this.storage.saveInvoice(shopId, updatedInvoice);
    }

    // Get invoice summary for dashboard
    getInvoiceSummary(shopId) {
        const invoices = this.storage.getInvoices(shopId);
        const today = new Date().toDateString();
        
        const todayInvoices = invoices.filter(invoice => 
            new Date(invoice.date).toDateString() === today && !invoice.voided_at
        );
        
        const totalInvoices = invoices.filter(invoice => !invoice.voided_at).length;
        const totalSales = invoices.reduce((sum, invoice) => 
            invoice.voided_at ? sum : sum + (invoice.total_amount || 0), 0
        );
        const todaySales = todayInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
        
        return {
            totalInvoices,
            totalSales,
            todayInvoices: todayInvoices.length,
            todaySales,
            averageOrderValue: totalInvoices > 0 ? totalSales / totalInvoices : 0,
            lastInvoice: invoices.length > 0 ? invoices[0] : null
        };
    }
}

// Create global invoices manager instance
window.invoicesManager = new InvoicesManager();

