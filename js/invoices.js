/**
 * Zovatu Pro - Invoice Management System
 * Handles invoice generation, viewing, printing, and management
 */

class ZovatuInvoices {
    constructor() {
        this.invoices = zovatuStorage.getItem("invoices") || [];
        this.products = zovatuStorage.getItem("products") || [];
        this.customers = zovatuStorage.getItem("customers") || [];
        this.settings = zovatuStorage.getItem("settings") || {};
        this.currentInvoice = null;
    }

    /**
     * Initialize invoice management
     */
    init() {
        this.setupEventListeners();
        this.loadInvoices();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search invoices
        const searchInput = document.getElementById("invoiceSearch");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => this.handleSearch(e.target.value));
        }

        // Sort invoices
        const sortSelect = document.getElementById("sortInvoices");
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) => this.sortInvoices(e.target.value));
        }

        // Filter invoices by date range
        const dateFilterSelect = document.getElementById("invoiceDateFilter");
        if (dateFilterSelect) {
            dateFilterSelect.addEventListener("change", (e) => this.filterInvoicesByDate(e.target.value));
        }

        // Export invoices
        const exportBtn = document.getElementById("exportInvoicesBtn");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => this.exportInvoices());
        }
    }

    /**
     * Load and display invoices
     */
    loadInvoices() {
        const container = document.getElementById("invoicesContainer");
        if (!container) return;

        if (this.invoices.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        container.innerHTML = this.invoices.map(invoice => this.createInvoiceCard(invoice)).join("");
        this.updateInvoiceStats();
    }

    /**
     * Create invoice card HTML
     */
    createInvoiceCard(invoice) {
        const currencySymbol = this.settings.currencySymbol || "৳";
        const customer = this.customers.find(c => c.id === invoice.customerId);
        const customerName = customer ? customer.name : "Walk-in Customer";
        const date = new Date(invoice.createdAt).toLocaleDateString();
        const time = new Date(invoice.createdAt).toLocaleTimeString();

        return `
            <div class="invoice-card" data-invoice-id="${invoice.id}">
                <div class="invoice-card-header">
                    <h3 class="invoice-number">Invoice #${invoice.invoiceNumber}</h3>
                    <div class="invoice-status ${invoice.status || "paid"}">
                        ${invoice.status || "Paid"}
                    </div>
                </div>
                <div class="invoice-card-body">
                    <div class="invoice-customer">
                        <i class="fas fa-user"></i>
                        <span>${customerName}</span>
                    </div>
                    <div class="invoice-date">
                        <i class="fas fa-calendar"></i>
                        <span>${date} at ${time}</span>
                    </div>
                    <div class="invoice-total">
                        Total: ${currencySymbol}${invoice.total.toFixed(2)}
                    </div>
                    <div class="invoice-items-summary">
                        ${invoice.items.length} item(s)
                    </div>
                </div>
                <div class="invoice-card-footer">
                    <button class="btn btn-sm btn-primary" onclick="zovatuInvoices.viewInvoice("${invoice.id}")">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="zovatuInvoices.printInvoice("${invoice.id}")">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="zovatuInvoices.deleteInvoice("${invoice.id}")">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get empty state HTML
     */
    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-file-invoice"></i>
                </div>
                <h3>No Invoices Found</h3>
                <p>Start by creating a new bill to generate your first invoice.</p>
                <button class="btn btn-primary" onclick="zovatuApp.navigateToPage("billing")">
                    <i class="fas fa-plus"></i>
                    Create New Bill
                </button>
            </div>
        `;
    }

    /**
     * View invoice details in a modal
     */
    viewInvoice(invoiceId) {
        this.currentInvoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!this.currentInvoice) return;

        const modal = document.getElementById("invoiceDetailModal");
        const content = document.getElementById("invoiceDetailContent");
        if (!modal || !content) return;

        const currencySymbol = this.settings.currencySymbol || "৳";
        const customer = this.customers.find(c => c.id === this.currentInvoice.customerId);
        const customerName = customer ? customer.name : "Walk-in Customer";
        const date = new Date(this.currentInvoice.createdAt).toLocaleDateString();
        const time = new Date(this.currentInvoice.createdAt).toLocaleTimeString();

        let itemsHtml = this.currentInvoice.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${currencySymbol}${item.price.toFixed(2)}</td>
                <td>${currencySymbol}${item.total.toFixed(2)}</td>
            </tr>
        `).join("");

        content.innerHTML = `
            <div class="invoice-detail-header">
                <h3>Invoice #${this.currentInvoice.invoiceNumber}</h3>
                <div class="invoice-meta">
                    <span><i class="fas fa-user"></i> ${customerName}</span>
                    <span><i class="fas fa-calendar"></i> ${date} ${time}</span>
                </div>
            </div>
            <div class="invoice-detail-body">
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
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="invoice-summary-details">
                    <p>Subtotal: ${currencySymbol}${this.currentInvoice.subtotal.toFixed(2)}</p>
                    <p>Tax (${this.currentInvoice.taxRate || 0}%): ${currencySymbol}${this.currentInvoice.taxAmount.toFixed(2)}</p>
                    <p>Discount: ${currencySymbol}${this.currentInvoice.discountAmount.toFixed(2)}</p>
                    <h4>Grand Total: ${currencySymbol}${this.currentInvoice.total.toFixed(2)}</h4>
                    <p>Amount Paid: ${currencySymbol}${this.currentInvoice.amountPaid.toFixed(2)}</p>
                    <p>Change: ${currencySymbol}${this.currentInvoice.changeAmount.toFixed(2)}</p>
                    <p>Payment Method: ${this.currentInvoice.paymentMethod}</p>
                </div>
            </div>
            <div class="invoice-detail-footer">
                <button class="btn btn-primary" onclick="zovatuInvoices.printInvoice("${this.currentInvoice.id}")">
                    <i class="fas fa-print"></i> Print Invoice
                </button>
                <button class="btn btn-secondary" onclick="zovatuInvoices.closeInvoiceDetailModal()">
                    Close
                </button>
            </div>
        `;

        modal.style.display = "flex";
    }

    /**
     * Close invoice detail modal
     */
    closeInvoiceDetailModal() {
        const modal = document.getElementById("invoiceDetailModal");
        if (modal) {
            modal.style.display = "none";
        }
        this.currentInvoice = null;
    }

    /**
     * Print invoice (placeholder for actual print functionality)
     */
    printInvoice(invoiceId) {
        // This would trigger a print dialog or generate a PDF
        zovatuUtils.showNotification("Printing functionality coming soon!", "info");
        console.log("Printing invoice:", invoiceId);
    }

    /**
     * Delete invoice
     */
    deleteInvoice(invoiceId) {
        if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return;

        this.invoices = this.invoices.filter(inv => inv.id !== invoiceId);
        zovatuStorage.setItem("invoices", this.invoices);
        this.loadInvoices();
        zovatuUtils.showNotification("Invoice deleted successfully", "success");
    }

    /**
     * Handle search
     */
    handleSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.filterInvoices(query);
        }, 300);
    }

    /**
     * Filter invoices based on search query
     */
    filterInvoices(query) {
        const container = document.getElementById("invoicesContainer");
        if (!container) return;

        let filteredInvoices = this.invoices;

        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            filteredInvoices = this.invoices.filter(invoice => 
                invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
                (invoice.customerId && this.customers.find(c => c.id === invoice.customerId)?.name.toLowerCase().includes(searchTerm)) ||
                invoice.items.some(item => item.name.toLowerCase().includes(searchTerm))
            );
        }

        if (filteredInvoices.length === 0) {
            container.innerHTML = this.getEmptyState();
        } else {
            container.innerHTML = filteredInvoices.map(invoice => this.createInvoiceCard(invoice)).join("");
        }
    }

    /**
     * Sort invoices
     */
    sortInvoices(sortBy) {
        let sortedInvoices = [...this.invoices];

        switch (sortBy) {
            case "date_desc":
                sortedInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "date_asc":
                sortedInvoices.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "total_desc":
                sortedInvoices.sort((a, b) => b.total - a.total);
                break;
            case "total_asc":
                sortedInvoices.sort((a, b) => a.total - b.total);
                break;
            case "invoice_number":
                sortedInvoices.sort((a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber));
                break;
        }

        const container = document.getElementById("invoicesContainer");
        if (container) {
            container.innerHTML = sortedInvoices.map(invoice => this.createInvoiceCard(invoice)).join("");
        }
    }

    /**
     * Filter invoices by date range
     */
    filterInvoicesByDate(range) {
        const container = document.getElementById("invoicesContainer");
        if (!container) return;

        let filteredInvoices = [...this.invoices];
        const now = new Date();

        switch (range) {
            case "today":
                filteredInvoices = filteredInvoices.filter(inv => {
                    const invoiceDate = new Date(inv.createdAt);
                    return invoiceDate.toDateString() === now.toDateString();
                });
                break;
            case "last_7_days":
                const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
                filteredInvoices = filteredInvoices.filter(inv => new Date(inv.createdAt) >= sevenDaysAgo);
                break;
            case "last_30_days":
                const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
                filteredInvoices = filteredInvoices.filter(inv => new Date(inv.createdAt) >= thirtyDaysAgo);
                break;
            case "this_month":
                filteredInvoices = filteredInvoices.filter(inv => {
                    const invoiceDate = new Date(inv.createdAt);
                    return invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
                });
                break;
            case "this_year":
                filteredInvoices = filteredInvoices.filter(inv => new Date(inv.createdAt).getFullYear() === now.getFullYear());
                break;
            case "all":
            default:
                // No filter needed
                break;
        }

        if (filteredInvoices.length === 0) {
            container.innerHTML = this.getEmptyState();
        } else {
            container.innerHTML = filteredInvoices.map(invoice => this.createInvoiceCard(invoice)).join("");
        }
    }

    /**
     * Update invoice statistics
     */
    updateInvoiceStats() {
        const totalInvoices = this.invoices.length;
        const totalRevenue = this.invoices.reduce((sum, inv) => sum + inv.total, 0);
        const paidInvoices = this.invoices.filter(inv => inv.status === "paid").length;
        const pendingInvoices = this.invoices.filter(inv => inv.status === "pending").length;

        this.updateElement("totalInvoicesCount", totalInvoices);
        this.updateElement("totalRevenueAmount", `${this.settings.currencySymbol || "৳"}${totalRevenue.toFixed(2)}`);
        this.updateElement("paidInvoicesCount", paidInvoices);
        this.updateElement("pendingInvoicesCount", pendingInvoices);
    }

    /**
     * Export invoices to JSON (can be extended to CSV/PDF)
     */
    exportInvoices() {
        const data = JSON.stringify(this.invoices, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoices_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        zovatuUtils.showNotification("Invoices exported successfully!", "success");
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
}

// Initialize invoices when page loads
document.addEventListener("pageChange", (e) => {
    if (e.detail.page === "invoices") {
        if (!window.zovatuInvoices) {
            window.zovatuInvoices = new ZovatuInvoices();
        } else {
            window.zovatuInvoices.loadInvoices();
        }
    }
});

// Make available globally
if (typeof window !== "undefined") {
    window.ZovatuInvoices = ZovatuInvoices;
}


