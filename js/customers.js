/**
 * Zovatu Pro - Customer Management System
 * Handles customer CRUD operations, purchase history, and analytics
 */

class ZovatuCustomers {
    constructor() {
        this.customers = zovatuStorage.getItem('customers') || [];
        this.currentCustomer = null;
        this.searchTimeout = null;
        this.settings = zovatuStorage.getItem('settings') || {};
        
        this.init();
    }

    /**
     * Initialize customer management
     */
    init() {
        this.setupEventListeners();
        this.loadCustomers();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add customer button
        const addCustomerBtn = document.getElementById('addCustomerBtn');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => this.showCustomerModal());
        }

        // Search customers
        const searchInput = document.getElementById('customerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Sort customers
        const sortSelect = document.getElementById('sortCustomers');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortCustomers(e.target.value));
        }

        // Import/Export buttons
        const importBtn = document.getElementById('importCustomersBtn');
        const exportBtn = document.getElementById('exportCustomersBtn');
        
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importCustomers());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCustomers());
        }

        // Customer form submission
        const customerForm = document.getElementById('customerForm');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => this.handleCustomerSubmit(e));
        }

        // Customer type change
        const customerType = document.getElementById('customerType');
        if (customerType) {
            customerType.addEventListener('change', (e) => this.handleCustomerTypeChange(e.target.value));
        }
    }

    /**
     * Load and display customers
     */
    loadCustomers() {
        const container = document.getElementById('customersContainer');
        if (!container) return;

        if (this.customers.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        container.innerHTML = this.customers.map(customer => this.createCustomerCard(customer)).join('');
        this.updateCustomerStats();
    }

    /**
     * Create customer card HTML
     */
    createCustomerCard(customer) {
        const currencySymbol = this.settings.currencySymbol || '৳';
        const totalPurchases = this.calculateTotalPurchases(customer.id);
        const lastPurchase = this.getLastPurchaseDate(customer.id);
        const customerSince = customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A';
        
        return `
            <div class="customer-card" data-customer-id="${customer.id}">
                <div class="customer-card-header">
                    <div class="customer-avatar">
                        ${customer.avatar ? 
                            `<img src="${customer.avatar}" alt="${customer.name}">` :
                            `<div class="avatar-placeholder">
                                <i class="fas fa-user"></i>
                            </div>`
                        }
                        <div class="customer-status ${customer.status || 'active'}">
                            <i class="fas fa-circle"></i>
                        </div>
                    </div>
                    
                    <div class="customer-actions">
                        <button class="action-btn edit-btn" onclick="zovatuCustomers.editCustomer('${customer.id}')" title="Edit Customer">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="zovatuCustomers.deleteCustomer('${customer.id}')" title="Delete Customer">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-btn history-btn" onclick="zovatuCustomers.showPurchaseHistory('${customer.id}')" title="Purchase History">
                            <i class="fas fa-history"></i>
                        </button>
                    </div>
                </div>
                
                <div class="customer-card-body">
                    <h3 class="customer-name">${customer.name}</h3>
                    
                    <div class="customer-type ${customer.type || 'regular'}">
                        <i class="fas ${this.getCustomerTypeIcon(customer.type)}"></i>
                        <span>${this.getCustomerTypeLabel(customer.type)}</span>
                    </div>
                    
                    <div class="customer-details">
                        ${customer.email ? 
                            `<div class="detail-row">
                                <i class="fas fa-envelope"></i>
                                <span>${customer.email}</span>
                            </div>` : ''
                        }
                        
                        ${customer.phone ? 
                            `<div class="detail-row">
                                <i class="fas fa-phone"></i>
                                <span>${customer.phone}</span>
                            </div>` : ''
                        }
                        
                        ${customer.address ? 
                            `<div class="detail-row">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${customer.address.length > 50 ? customer.address.substring(0, 50) + '...' : customer.address}</span>
                            </div>` : ''
                        }
                        
                        ${customer.company ? 
                            `<div class="detail-row">
                                <i class="fas fa-building"></i>
                                <span>${customer.company}</span>
                            </div>` : ''
                        }
                    </div>
                </div>
                
                <div class="customer-card-footer">
                    <div class="customer-stats">
                        <div class="stat-item">
                            <div class="stat-value">${currencySymbol}${totalPurchases.toFixed(2)}</div>
                            <div class="stat-label">Total Purchases</div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-value">${this.getOrderCount(customer.id)}</div>
                            <div class="stat-label">Orders</div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-value">${lastPurchase || 'Never'}</div>
                            <div class="stat-label">Last Purchase</div>
                        </div>
                    </div>
                    
                    <div class="customer-meta">
                        <small class="customer-since">
                            <i class="fas fa-calendar"></i>
                            Customer since: ${customerSince}
                        </small>
                    </div>
                    
                    <div class="quick-actions">
                        <button class="btn btn-sm btn-primary" onclick="zovatuCustomers.createBillForCustomer('${customer.id}')">
                            <i class="fas fa-plus"></i>
                            New Bill
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="zovatuCustomers.sendMessage('${customer.id}')">
                            <i class="fas fa-envelope"></i>
                            Message
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get customer type icon
     */
    getCustomerTypeIcon(type) {
        const icons = {
            'regular': 'fa-user',
            'vip': 'fa-crown',
            'wholesale': 'fa-warehouse',
            'corporate': 'fa-building'
        };
        return icons[type] || 'fa-user';
    }

    /**
     * Get customer type label
     */
    getCustomerTypeLabel(type) {
        const labels = {
            'regular': 'Regular',
            'vip': 'VIP',
            'wholesale': 'Wholesale',
            'corporate': 'Corporate'
        };
        return labels[type] || 'Regular';
    }

    /**
     * Calculate total purchases for customer
     */
    calculateTotalPurchases(customerId) {
        const invoices = zovatuStorage.getItem('invoices') || [];
        return invoices
            .filter(invoice => invoice.customerId === customerId)
            .reduce((total, invoice) => total + (invoice.total || 0), 0);
    }

    /**
     * Get last purchase date for customer
     */
    getLastPurchaseDate(customerId) {
        const invoices = zovatuStorage.getItem('invoices') || [];
        const customerInvoices = invoices
            .filter(invoice => invoice.customerId === customerId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (customerInvoices.length > 0) {
            return new Date(customerInvoices[0].createdAt).toLocaleDateString();
        }
        return null;
    }

    /**
     * Get order count for customer
     */
    getOrderCount(customerId) {
        const invoices = zovatuStorage.getItem('invoices') || [];
        return invoices.filter(invoice => invoice.customerId === customerId).length;
    }

    /**
     * Get empty state HTML
     */
    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3>No Customers Found</h3>
                <p>Start by adding your first customer to the database</p>
                <button class="btn btn-primary" onclick="zovatuCustomers.showCustomerModal()">
                    <i class="fas fa-plus"></i>
                    Add First Customer
                </button>
            </div>
        `;
    }

    /**
     * Show customer modal
     */
    showCustomerModal(customerId = null) {
        this.currentCustomer = customerId ? this.customers.find(c => c.id === customerId) : null;
        
        const modal = document.getElementById('customerModal');
        const form = document.getElementById('customerForm');
        const title = document.getElementById('customerModalTitle');
        
        if (!modal || !form) return;

        // Set modal title
        if (title) {
            title.textContent = this.currentCustomer ? 'Edit Customer' : 'Add New Customer';
        }

        // Reset form
        form.reset();

        // Populate form if editing
        if (this.currentCustomer) {
            this.populateCustomerForm(this.currentCustomer);
        }

        // Show modal
        modal.style.display = 'flex';
    }

    /**
     * Populate customer form
     */
    populateCustomerForm(customer) {
        const form = document.getElementById('customerForm');
        if (!form) return;

        // Basic fields
        const fields = ['name', 'email', 'phone', 'address', 'company', 'type', 'notes'];
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && customer[field] !== undefined) {
                input.value = customer[field];
            }
        });

        // Handle customer type change
        this.handleCustomerTypeChange(customer.type || 'regular');
    }

    /**
     * Handle customer type change
     */
    handleCustomerTypeChange(type) {
        const corporateFields = document.getElementById('corporateFields');
        if (corporateFields) {
            corporateFields.style.display = type === 'corporate' ? 'block' : 'none';
        }
    }

    /**
     * Handle customer form submission
     */
    handleCustomerSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const customerData = {};
        
        // Extract form data
        for (let [key, value] of formData.entries()) {
            customerData[key] = value;
        }

        // Validate required fields
        if (!customerData.name) {
            zovatuUtils.showNotification('Customer name is required', 'error');
            return;
        }

        // Generate ID for new customer
        if (!this.currentCustomer) {
            customerData.id = zovatuUtils.generateId();
            customerData.createdAt = new Date().toISOString();
            customerData.status = 'active';
        } else {
            customerData.id = this.currentCustomer.id;
            customerData.createdAt = this.currentCustomer.createdAt;
            customerData.status = this.currentCustomer.status;
            customerData.updatedAt = new Date().toISOString();
        }

        // Save customer
        this.saveCustomer(customerData);
    }

    /**
     * Save customer
     */
    saveCustomer(customerData) {
        try {
            if (this.currentCustomer) {
                // Update existing customer
                const index = this.customers.findIndex(c => c.id === this.currentCustomer.id);
                if (index !== -1) {
                    this.customers[index] = { ...this.customers[index], ...customerData };
                }
            } else {
                // Add new customer
                this.customers.push(customerData);
            }

            // Save to storage
            zovatuStorage.setItem('customers', this.customers);

            // Reload customers
            this.loadCustomers();

            // Close modal
            this.closeCustomerModal();

            // Show success message
            const action = this.currentCustomer ? 'updated' : 'added';
            zovatuUtils.showNotification(`Customer ${action} successfully`, 'success');

            // Reset current customer
            this.currentCustomer = null;

        } catch (error) {
            console.error('Error saving customer:', error);
            zovatuUtils.showNotification('Error saving customer', 'error');
        }
    }

    /**
     * Close customer modal
     */
    closeCustomerModal() {
        const modal = document.getElementById('customerModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentCustomer = null;
    }

    /**
     * Edit customer
     */
    editCustomer(customerId) {
        this.showCustomerModal(customerId);
    }

    /**
     * Delete customer
     */
    deleteCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        // Check if customer has orders
        const orderCount = this.getOrderCount(customerId);
        if (orderCount > 0) {
            const confirmMessage = `"${customer.name}" has ${orderCount} order(s). Are you sure you want to delete this customer? This action cannot be undone.`;
            if (!confirm(confirmMessage)) return;
        } else {
            if (!confirm(`Are you sure you want to delete "${customer.name}"?`)) return;
        }

        this.customers = this.customers.filter(c => c.id !== customerId);
        zovatuStorage.setItem('customers', this.customers);
        this.loadCustomers();
        zovatuUtils.showNotification('Customer deleted successfully', 'success');
    }

    /**
     * Show purchase history
     */
    showPurchaseHistory(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        const invoices = zovatuStorage.getItem('invoices') || [];
        const customerInvoices = invoices
            .filter(invoice => invoice.customerId === customerId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const modal = document.getElementById('purchaseHistoryModal');
        const container = document.getElementById('purchaseHistoryContainer');
        const customerName = document.getElementById('historyCustomerName');

        if (!modal || !container) return;

        // Set customer name
        if (customerName) {
            customerName.textContent = customer.name;
        }

        // Generate history HTML
        if (customerInvoices.length === 0) {
            container.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>No Purchase History</h3>
                    <p>This customer hasn't made any purchases yet.</p>
                </div>
            `;
        } else {
            container.innerHTML = customerInvoices.map(invoice => this.createHistoryItem(invoice)).join('');
        }

        // Show modal
        modal.style.display = 'flex';
    }

    /**
     * Create purchase history item
     */
    createHistoryItem(invoice) {
        const currencySymbol = this.settings.currencySymbol || '৳';
        const date = new Date(invoice.createdAt).toLocaleDateString();
        const time = new Date(invoice.createdAt).toLocaleTimeString();
        
        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="invoice-info">
                        <h4>Invoice #${invoice.invoiceNumber}</h4>
                        <div class="invoice-date">${date} at ${time}</div>
                    </div>
                    <div class="invoice-total">${currencySymbol}${invoice.total.toFixed(2)}</div>
                </div>
                
                <div class="history-details">
                    <div class="items-summary">
                        <strong>${invoice.items.length} item(s):</strong>
                        ${invoice.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                    </div>
                    
                    <div class="payment-info">
                        <span class="payment-method">
                            <i class="fas fa-credit-card"></i>
                            ${invoice.paymentMethod || 'Cash'}
                        </span>
                        <span class="payment-status ${invoice.paymentStatus || 'paid'}">
                            ${invoice.paymentStatus || 'Paid'}
                        </span>
                    </div>
                </div>
                
                <div class="history-actions">
                    <button class="btn btn-sm btn-secondary" onclick="zovatuCustomers.viewInvoice('${invoice.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="zovatuCustomers.printInvoice('${invoice.id}')">
                        <i class="fas fa-print"></i>
                        Print
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Create bill for customer
     */
    createBillForCustomer(customerId) {
        // Navigate to billing page with customer pre-selected
        if (window.zovatuApp) {
            window.zovatuApp.navigateToPage('billing');
            // Set customer after navigation
            setTimeout(() => {
                const customerSelect = document.getElementById('billCustomer');
                if (customerSelect) {
                    customerSelect.value = customerId;
                    customerSelect.dispatchEvent(new Event('change'));
                }
            }, 100);
        }
    }

    /**
     * Send message to customer
     */
    sendMessage(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        // Simple implementation - could be enhanced with SMS/Email integration
        const message = prompt(`Send message to ${customer.name}:`);
        if (message) {
            // Here you would integrate with SMS/Email service
            zovatuUtils.showNotification('Message functionality coming soon!', 'info');
        }
    }

    /**
     * Handle search
     */
    handleSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.filterCustomers(query);
        }, 300);
    }

    /**
     * Filter customers based on search query
     */
    filterCustomers(query) {
        const container = document.getElementById('customersContainer');
        if (!container) return;

        let filteredCustomers = this.customers;

        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            filteredCustomers = this.customers.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
                (customer.phone && customer.phone.includes(searchTerm)) ||
                (customer.company && customer.company.toLowerCase().includes(searchTerm))
            );
        }

        if (filteredCustomers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No Customers Found</h3>
                    <p>No customers match your search criteria</p>
                </div>
            `;
        } else {
            container.innerHTML = filteredCustomers.map(customer => this.createCustomerCard(customer)).join('');
        }
    }

    /**
     * Sort customers
     */
    sortCustomers(sortBy) {
        let sortedCustomers = [...this.customers];

        switch (sortBy) {
            case 'name':
                sortedCustomers.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'date':
                sortedCustomers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'purchases':
                sortedCustomers.sort((a, b) => this.calculateTotalPurchases(b.id) - this.calculateTotalPurchases(a.id));
                break;
            case 'type':
                sortedCustomers.sort((a, b) => (a.type || 'regular').localeCompare(b.type || 'regular'));
                break;
        }

        // Update display
        const container = document.getElementById('customersContainer');
        if (container) {
            container.innerHTML = sortedCustomers.map(customer => this.createCustomerCard(customer)).join('');
        }
    }

    /**
     * Update customer statistics
     */
    updateCustomerStats() {
        const totalCustomers = this.customers.length;
        const activeCustomers = this.customers.filter(c => c.status === 'active').length;
        const vipCustomers = this.customers.filter(c => c.type === 'vip').length;
        
        // Update stats if elements exist
        this.updateElement('totalCustomers', totalCustomers);
        this.updateElement('activeCustomers', activeCustomers);
        this.updateElement('vipCustomers', vipCustomers);
    }

    /**
     * Import customers
     */
    importCustomers() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (Array.isArray(data)) {
                        // Validate and import customers
                        const validCustomers = data.filter(customer => customer.name);
                        validCustomers.forEach(customer => {
                            if (!customer.id) customer.id = zovatuUtils.generateId();
                            if (!customer.createdAt) customer.createdAt = new Date().toISOString();
                        });
                        
                        this.customers = [...this.customers, ...validCustomers];
                        zovatuStorage.setItem('customers', this.customers);
                        this.loadCustomers();
                        
                        zovatuUtils.showNotification(`${validCustomers.length} customers imported successfully`, 'success');
                    }
                } catch (error) {
                    zovatuUtils.showNotification('Error importing customers', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    /**
     * Export customers
     */
    exportCustomers() {
        const data = JSON.stringify(this.customers, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * View invoice
     */
    viewInvoice(invoiceId) {
        // Navigate to invoice view
        if (window.zovatuApp) {
            window.zovatuApp.navigateToPage('invoices');
            // Highlight specific invoice
            setTimeout(() => {
                const invoiceElement = document.querySelector(`[data-invoice-id="${invoiceId}"]`);
                if (invoiceElement) {
                    invoiceElement.scrollIntoView({ behavior: 'smooth' });
                    invoiceElement.classList.add('highlight');
                    setTimeout(() => invoiceElement.classList.remove('highlight'), 2000);
                }
            }, 100);
        }
    }

    /**
     * Print invoice
     */
    printInvoice(invoiceId) {
        // Implementation for printing invoice
        zovatuUtils.showNotification('Print functionality coming soon!', 'info');
    }

    /**
     * Update element content safely
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * Get customer by ID
     */
    getCustomerById(customerId) {
        return this.customers.find(c => c.id === customerId);
    }

    /**
     * Get customers for dropdown
     */
    getCustomersForDropdown() {
        return this.customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            type: customer.type || 'regular'
        }));
    }

    /**
     * Get customer analytics
     */
    getCustomerAnalytics() {
        const invoices = zovatuStorage.getItem('invoices') || [];
        
        return {
            totalCustomers: this.customers.length,
            activeCustomers: this.customers.filter(c => c.status === 'active').length,
            customerTypes: this.getCustomerTypeDistribution(),
            topCustomers: this.getTopCustomers(invoices),
            newCustomersThisMonth: this.getNewCustomersThisMonth(),
            averageOrderValue: this.getAverageOrderValue(invoices),
            customerRetentionRate: this.getCustomerRetentionRate(invoices)
        };
    }

    /**
     * Get customer type distribution
     */
    getCustomerTypeDistribution() {
        const distribution = {};
        this.customers.forEach(customer => {
            const type = customer.type || 'regular';
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Get top customers by purchase amount
     */
    getTopCustomers(invoices, limit = 5) {
        const customerPurchases = {};
        
        invoices.forEach(invoice => {
            if (invoice.customerId) {
                if (!customerPurchases[invoice.customerId]) {
                    customerPurchases[invoice.customerId] = {
                        customerId: invoice.customerId,
                        totalAmount: 0,
                        orderCount: 0
                    };
                }
                customerPurchases[invoice.customerId].totalAmount += invoice.total || 0;
                customerPurchases[invoice.customerId].orderCount += 1;
            }
        });

        return Object.values(customerPurchases)
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, limit)
            .map(data => {
                const customer = this.getCustomerById(data.customerId);
                return {
                    ...data,
                    customerName: customer ? customer.name : 'Unknown Customer'
                };
            });
    }

    /**
     * Get new customers this month
     */
    getNewCustomersThisMonth() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        return this.customers.filter(customer => 
            customer.createdAt && new Date(customer.createdAt) >= startOfMonth
        ).length;
    }

    /**
     * Get average order value
     */
    getAverageOrderValue(invoices) {
        if (invoices.length === 0) return 0;
        const totalValue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
        return totalValue / invoices.length;
    }

    /**
     * Get customer retention rate
     */
    getCustomerRetentionRate(invoices) {
        // Simple retention calculation: customers who made purchases in last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentCustomers = new Set();
        
        invoices.forEach(invoice => {
            if (invoice.customerId && new Date(invoice.createdAt) >= thirtyDaysAgo) {
                recentCustomers.add(invoice.customerId);
            }
        });

        return this.customers.length > 0 ? (recentCustomers.size / this.customers.length) * 100 : 0;
    }
}

// Initialize customers when page loads
document.addEventListener('pageChange', (e) => {
    if (e.detail.page === 'customers') {
        if (!window.zovatuCustomers) {
            window.zovatuCustomers = new ZovatuCustomers();
        } else {
            window.zovatuCustomers.loadCustomers();
        }
    }
});

// Make available globally
if (typeof window !== 'undefined') {
    window.ZovatuCustomers = ZovatuCustomers;
}

