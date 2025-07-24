// Zovatu Billing Tool - Users/Salesmen Data Management
// Handles salesman operations, permissions, and user management

class UsersManager {
    constructor() {
        this.storage = window.billingStorage;
    }

    // Create a new salesman
    createSalesman(shopId, salesmanData) {
        // Validate required fields
        if (!salesmanData.name || !salesmanData.email) {
            throw new Error('Salesman name and email are required');
        }

        // Check for duplicate email within the shop
        const existingSalesmen = this.storage.getSalesmen(shopId);
        if (existingSalesmen.some(salesman => salesman.email.toLowerCase() === salesmanData.email.toLowerCase())) {
            throw new Error('A salesman with this email already exists in this shop');
        }

        // Create salesman object with defaults
        const salesman = {
            id: this.storage.generateId(),
            shop_id: shopId,
            name: salesmanData.name.trim(),
            email: salesmanData.email.trim().toLowerCase(),
            phone: salesmanData.phone?.trim() || '',
            address: salesmanData.address?.trim() || '',
            hire_date: salesmanData.hire_date || new Date().toISOString(),
            is_active: salesmanData.is_active !== false,
            permissions: {
                can_view_invoices: salesmanData.permissions?.can_view_invoices !== false,
                can_edit_invoices: salesmanData.permissions?.can_edit_invoices || false,
                can_print_invoices: salesmanData.permissions?.can_print_invoices !== false,
                can_manage_products: salesmanData.permissions?.can_manage_products || false,
                can_view_reports: salesmanData.permissions?.can_view_reports || false,
                can_manage_customers: salesmanData.permissions?.can_manage_customers || false,
                can_process_returns: salesmanData.permissions?.can_process_returns || false,
                can_apply_discounts: salesmanData.permissions?.can_apply_discounts || false,
                max_discount_percent: parseFloat(salesmanData.permissions?.max_discount_percent) || 0
            },
            settings: {
                default_payment_method: salesmanData.settings?.default_payment_method || 'cash',
                auto_print_invoices: salesmanData.settings?.auto_print_invoices || false,
                require_customer_info: salesmanData.settings?.require_customer_info || false
            },
            stats: {
                total_sales: 0,
                total_invoices: 0,
                total_customers: 0,
                average_order_value: 0,
                last_login: null,
                last_sale: null
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Save salesman
        if (this.storage.saveSalesman(shopId, salesman)) {
            return salesman;
        } else {
            throw new Error('Failed to save salesman data');
        }
    }

    // Update existing salesman
    updateSalesman(shopId, salesmanId, updateData) {
        const salesman = this.storage.getSalesman(shopId, salesmanId);
        if (!salesman) {
            throw new Error('Salesman not found');
        }

        // Validate email uniqueness if email is being changed
        if (updateData.email && updateData.email !== salesman.email) {
            const existingSalesmen = this.storage.getSalesmen(shopId);
            if (existingSalesmen.some(s => s.id !== salesmanId && s.email.toLowerCase() === updateData.email.toLowerCase())) {
                throw new Error('A salesman with this email already exists');
            }
        }

        // Update salesman data
        const updatedSalesman = {
            ...salesman,
            ...updateData,
            id: salesman.id, // Ensure ID doesn't change
            shop_id: salesman.shop_id, // Ensure shop_id doesn't change
            created_at: salesman.created_at, // Preserve creation date
            updated_at: new Date().toISOString(),
            permissions: {
                ...salesman.permissions,
                ...updateData.permissions
            },
            settings: {
                ...salesman.settings,
                ...updateData.settings
            },
            stats: {
                ...salesman.stats,
                ...updateData.stats
            }
        };

        if (this.storage.saveSalesman(shopId, updatedSalesman)) {
            return updatedSalesman;
        } else {
            throw new Error('Failed to update salesman data');
        }
    }

    // Delete salesman
    deleteSalesman(shopId, salesmanId) {
        const salesman = this.storage.getSalesman(shopId, salesmanId);
        if (!salesman) {
            throw new Error('Salesman not found');
        }

        // Check if salesman has any invoices
        const invoices = this.storage.getInvoices(shopId);
        const salesmanInvoices = invoices.filter(invoice => invoice.salesman_id === salesmanId);
        
        if (salesmanInvoices.length > 0) {
            throw new Error('Cannot delete salesman with existing invoices. Deactivate instead.');
        }

        if (this.storage.deleteSalesman(shopId, salesmanId)) {
            return true;
        } else {
            throw new Error('Failed to delete salesman');
        }
    }

    // Deactivate salesman (soft delete)
    deactivateSalesman(shopId, salesmanId) {
        return this.updateSalesman(shopId, salesmanId, { 
            is_active: false,
            deactivated_at: new Date().toISOString()
        });
    }

    // Activate salesman
    activateSalesman(shopId, salesmanId) {
        const updateData = { 
            is_active: true,
            deactivated_at: null
        };
        return this.updateSalesman(shopId, salesmanId, updateData);
    }

    // Get salesman with calculated statistics
    getSalesmanWithStats(shopId, salesmanId) {
        const salesman = this.storage.getSalesman(shopId, salesmanId);
        if (!salesman) {
            return null;
        }

        // Calculate statistics from invoices
        const invoices = this.storage.getInvoices(shopId);
        const salesmanInvoices = invoices.filter(invoice => 
            invoice.salesman_id === salesmanId && !invoice.voided_at
        );

        const totalSales = salesmanInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
        const totalInvoices = salesmanInvoices.length;
        const averageOrderValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;

        // Get unique customers
        const uniqueCustomers = new Set();
        salesmanInvoices.forEach(invoice => {
            if (invoice.customer_name && invoice.customer_name !== 'Walk-in Customer') {
                uniqueCustomers.add(invoice.customer_name.toLowerCase());
            }
        });

        const lastSale = salesmanInvoices.length > 0 ? 
            salesmanInvoices.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null;

        return {
            ...salesman,
            stats: {
                ...salesman.stats,
                total_sales: totalSales,
                total_invoices: totalInvoices,
                total_customers: uniqueCustomers.size,
                average_order_value: averageOrderValue,
                last_sale: lastSale
            }
        };
    }

    // Get all salesmen with statistics
    getAllSalesmenWithStats(shopId) {
        const salesmen = this.storage.getSalesmen(shopId);
        return salesmen.map(salesman => this.getSalesmanWithStats(shopId, salesman.id));
    }

    // Get active salesmen only
    getActiveSalesmen(shopId) {
        const salesmen = this.storage.getSalesmen(shopId);
        return salesmen.filter(salesman => salesman.is_active);
    }

    // Check salesman permissions
    hasPermission(shopId, salesmanId, permission) {
        const salesman = this.storage.getSalesman(shopId, salesmanId);
        if (!salesman || !salesman.is_active) {
            return false;
        }
        return salesman.permissions[permission] || false;
    }

    // Update salesman permissions
    updatePermissions(shopId, salesmanId, permissions) {
        return this.updateSalesman(shopId, salesmanId, { permissions });
    }

    // Validate salesman data
    validateSalesmanData(salesmanData) {
        const errors = [];

        if (!salesmanData.name || salesmanData.name.trim().length < 2) {
            errors.push('Salesman name must be at least 2 characters long');
        }

        if (!salesmanData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(salesmanData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (salesmanData.phone && !/^[\+]?[0-9\-\(\)\s]+$/.test(salesmanData.phone)) {
            errors.push('Please enter a valid phone number');
        }

        if (salesmanData.permissions?.max_discount_percent) {
            const maxDiscount = parseFloat(salesmanData.permissions.max_discount_percent);
            if (maxDiscount < 0 || maxDiscount > 100) {
                errors.push('Maximum discount percent must be between 0 and 100');
            }
        }

        return errors;
    }

    // Search salesmen
    searchSalesmen(shopId, query) {
        const salesmen = this.storage.getSalesmen(shopId);
        const searchTerm = query.toLowerCase();
        
        return salesmen.filter(salesman => 
            salesman.name.toLowerCase().includes(searchTerm) ||
            salesman.email.toLowerCase().includes(searchTerm) ||
            (salesman.phone && salesman.phone.includes(searchTerm))
        );
    }

    // Get salesman performance for a period
    getSalesmanPerformance(shopId, salesmanId, period = 'month') {
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
            invoice.salesman_id === salesmanId &&
            new Date(invoice.date) >= startDate &&
            !invoice.voided_at
        );

        const totalSales = periodInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
        const averageOrderValue = periodInvoices.length > 0 ? totalSales / periodInvoices.length : 0;

        // Daily breakdown
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
            totalInvoices: periodInvoices.length,
            totalSales,
            averageOrderValue,
            dailyBreakdown,
            startDate: startDate.toISOString(),
            endDate: now.toISOString()
        };
    }

    // Get top performing salesmen
    getTopPerformers(shopId, period = 'month', limit = 10) {
        const salesmen = this.getAllSalesmenWithStats(shopId);
        
        // Get performance for each salesman
        const performanceData = salesmen.map(salesman => {
            const performance = this.getSalesmanPerformance(shopId, salesman.id, period);
            return {
                ...salesman,
                performance
            };
        });

        // Sort by total sales in the period
        return performanceData
            .sort((a, b) => b.performance.totalSales - a.performance.totalSales)
            .slice(0, limit);
    }

    // Record salesman login
    recordLogin(shopId, salesmanId) {
        return this.updateSalesman(shopId, salesmanId, {
            stats: {
                last_login: new Date().toISOString()
            }
        });
    }

    // Get salesman activity log
    getSalesmanActivity(shopId, salesmanId, limit = 50) {
        const invoices = this.storage.getInvoices(shopId);
        const salesmanInvoices = invoices
            .filter(invoice => invoice.salesman_id === salesmanId)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

        return salesmanInvoices.map(invoice => ({
            type: 'invoice',
            action: invoice.voided_at ? 'voided' : 'created',
            date: invoice.date,
            details: {
                invoice_number: invoice.invoice_number,
                customer_name: invoice.customer_name,
                total_amount: invoice.total_amount,
                void_reason: invoice.void_reason
            }
        }));
    }

    // Export salesmen data
    exportSalesmen(shopId, format = 'json') {
        const salesmen = this.getAllSalesmenWithStats(shopId);
        
        if (format === 'csv') {
            return this.convertSalesmenToCSV(salesmen);
        }
        
        return {
            salesmen,
            exportDate: new Date().toISOString(),
            shopId
        };
    }

    // Convert salesmen to CSV
    convertSalesmenToCSV(salesmen) {
        const headers = [
            'ID', 'Name', 'Email', 'Phone', 'Hire Date', 'Status', 
            'Total Sales', 'Total Invoices', 'Total Customers', 'Average Order Value',
            'Can View Invoices', 'Can Edit Invoices', 'Can Print Invoices', 
            'Can Manage Products', 'Max Discount %'
        ];
        
        const rows = salesmen.map(salesman => [
            salesman.id,
            salesman.name,
            salesman.email,
            salesman.phone,
            new Date(salesman.hire_date).toLocaleDateString(),
            salesman.is_active ? 'Active' : 'Inactive',
            salesman.stats.total_sales,
            salesman.stats.total_invoices,
            salesman.stats.total_customers,
            salesman.stats.average_order_value,
            salesman.permissions.can_view_invoices ? 'Yes' : 'No',
            salesman.permissions.can_edit_invoices ? 'Yes' : 'No',
            salesman.permissions.can_print_invoices ? 'Yes' : 'No',
            salesman.permissions.can_manage_products ? 'Yes' : 'No',
            salesman.permissions.max_discount_percent
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    // Get permission templates
    getPermissionTemplates() {
        return {
            'cashier': {
                name: 'Cashier',
                permissions: {
                    can_view_invoices: true,
                    can_edit_invoices: false,
                    can_print_invoices: true,
                    can_manage_products: false,
                    can_view_reports: false,
                    can_manage_customers: false,
                    can_process_returns: false,
                    can_apply_discounts: true,
                    max_discount_percent: 5
                }
            },
            'sales_associate': {
                name: 'Sales Associate',
                permissions: {
                    can_view_invoices: true,
                    can_edit_invoices: true,
                    can_print_invoices: true,
                    can_manage_products: true,
                    can_view_reports: false,
                    can_manage_customers: true,
                    can_process_returns: true,
                    can_apply_discounts: true,
                    max_discount_percent: 10
                }
            },
            'manager': {
                name: 'Manager',
                permissions: {
                    can_view_invoices: true,
                    can_edit_invoices: true,
                    can_print_invoices: true,
                    can_manage_products: true,
                    can_view_reports: true,
                    can_manage_customers: true,
                    can_process_returns: true,
                    can_apply_discounts: true,
                    max_discount_percent: 25
                }
            }
        };
    }

    // Apply permission template
    applyPermissionTemplate(shopId, salesmanId, templateName) {
        const templates = this.getPermissionTemplates();
        const template = templates[templateName];
        
        if (!template) {
            throw new Error('Invalid permission template');
        }

        return this.updatePermissions(shopId, salesmanId, template.permissions);
    }

    // Get salesmen summary for dashboard
    getSalesmenSummary(shopId) {
        const salesmen = this.getAllSalesmenWithStats(shopId);
        const activeSalesmen = salesmen.filter(s => s.is_active);
        
        const totalSales = salesmen.reduce((sum, salesman) => sum + salesman.stats.total_sales, 0);
        const totalInvoices = salesmen.reduce((sum, salesman) => sum + salesman.stats.total_invoices, 0);
        
        return {
            totalSalesmen: salesmen.length,
            activeSalesmen: activeSalesmen.length,
            totalSales,
            totalInvoices,
            averagePerformance: activeSalesmen.length > 0 ? totalSales / activeSalesmen.length : 0,
            topPerformer: salesmen.length > 0 ? 
                salesmen.sort((a, b) => b.stats.total_sales - a.stats.total_sales)[0] : null
        };
    }
}

// Create global users manager instance
window.usersManager = new UsersManager();

