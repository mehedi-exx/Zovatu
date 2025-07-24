class ZovatuReports {
    constructor() {
        this.invoices = zovatuStorage.getItem('invoices') || [];
        this.products = zovatuStorage.getItem('products') || [];
        this.customers = zovatuStorage.getItem('customers') || [];
        this.settings = zovatuStorage.getItem('settings') || {};
    }

    init() {
        this.renderReports();
    }

    renderReports() {
        this.renderSalesSummary();
        this.renderProductPerformance();
        this.renderCustomerInsights();
    }

    renderSalesSummary() {
        const container = document.getElementById('sales-summary-container');
        if (!container) return;

        const totalSales = this.invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalInvoices = this.invoices.length;
        const averageOrderValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;

        const summaryHtml = `
            <div class="summary-card">
                <h4>Total Revenue</h4>
                <p>${this.settings.currencySymbol || '$'}${totalSales.toFixed(2)}</p>
            </div>
            <div class="summary-card">
                <h4>Total Orders</h4>
                <p>${totalInvoices}</p>
            </div>
            <div class="summary-card">
                <h4>Average Order Value</h4>
                <p>${this.settings.currencySymbol || '$'}${averageOrderValue.toFixed(2)}</p>
            </div>
        `;
        container.innerHTML = summaryHtml;
    }

    renderProductPerformance() {
        const container = document.getElementById('product-performance-container');
        if (!container) return;

        const productSales = {};
        this.invoices.forEach(invoice => {
            invoice.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.total;
            });
        });

        const sortedProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity Sold</th>
                        <th>Total Revenue</th>
                    </tr>
                </thead>
                <tbody>
        `;

        sortedProducts.forEach(product => {
            tableHtml += `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${this.settings.currencySymbol || '$'}${product.revenue.toFixed(2)}</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
    }

    renderCustomerInsights() {
        const container = document.getElementById('customer-insights-container');
        if (!container) return;

        const customerData = this.customers.map(customer => {
            const customerInvoices = this.invoices.filter(inv => inv.customerId === customer.id);
            const totalSpent = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
            return { ...customer, totalSpent, orderCount: customerInvoices.length };
        }).sort((a, b) => b.totalSpent - a.totalSpent);

        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Total Spent</th>
                        <th>Number of Orders</th>
                    </tr>
                </thead>
                <tbody>
        `;

        customerData.forEach(customer => {
            tableHtml += `
                <tr>
                    <td>${customer.name}</td>
                    <td>${this.settings.currencySymbol || '$'}${customer.totalSpent.toFixed(2)}</td>
                    <td>${customer.orderCount}</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('reports-page')) { // Check if we are on the reports page
        const zovatuReports = new ZovatuReports();
    }
});


