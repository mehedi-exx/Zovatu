/**
 * Zovatu Pro - Dashboard System
 * Handles dashboard analytics, charts, and statistics
 */

class ZovatuDashboard {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.settings = zovatuStorage.getItem('settings') || {};
        
        this.init();
    }

    /**
     * Initialize dashboard
     */
    init() {
        this.loadDashboardData();
        this.initializeCharts();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    /**
     * Load dashboard data
     */
    loadDashboardData() {
        const invoices = zovatuStorage.getItem('invoices') || [];
        const products = zovatuStorage.getItem('products') || [];
        const customers = zovatuStorage.getItem('customers') || [];

        // Calculate statistics
        this.stats = this.calculateStatistics(invoices, products, customers);
        
        // Update UI
        this.updateStatistics();
        this.updateRecentActivities();
    }

    /**
     * Calculate dashboard statistics
     */
    calculateStatistics(invoices, products, customers) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        // Filter recent invoices
        const recentInvoices = invoices.filter(inv => new Date(inv.createdAt) >= thirtyDaysAgo);
        const weeklyInvoices = invoices.filter(inv => new Date(inv.createdAt) >= sevenDaysAgo);

        // Calculate totals
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const monthlyRevenue = recentInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const weeklyRevenue = weeklyInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

        // Calculate profit
        const totalProfit = this.calculateProfit(invoices, products);
        const monthlyProfit = this.calculateProfit(recentInvoices, products);

        // Calculate growth rates
        const revenueGrowth = this.calculateGrowthRate(weeklyRevenue, monthlyRevenue);
        const orderGrowth = this.calculateGrowthRate(weeklyInvoices.length, recentInvoices.length);

        // Low stock products
        const lowStockProducts = products.filter(p => p.stock <= 10);

        // Top products
        const topProducts = this.getTopProducts(invoices, products);

        // Recent customers
        const recentCustomers = customers.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);

        return {
            totalRevenue,
            monthlyRevenue,
            weeklyRevenue,
            totalProfit,
            monthlyProfit,
            totalOrders: invoices.length,
            monthlyOrders: recentInvoices.length,
            weeklyOrders: weeklyInvoices.length,
            totalProducts: products.length,
            totalCustomers: customers.length,
            recentCustomers: recentCustomers.length,
            lowStockProducts: lowStockProducts.length,
            topProducts,
            revenueGrowth,
            orderGrowth,
            customerGrowth: this.calculateGrowthRate(recentCustomers.length, customers.length),
            averageOrderValue: recentInvoices.length > 0 ? monthlyRevenue / recentInvoices.length : 0,
            salesData: this.prepareSalesData(invoices),
            productSalesData: this.prepareProductSalesData(invoices, products)
        };
    }

    /**
     * Calculate profit from invoices
     */
    calculateProfit(invoices, products) {
        return invoices.reduce((totalProfit, invoice) => {
            const invoiceProfit = (invoice.items || []).reduce((itemProfit, item) => {
                const product = products.find(p => p.id === item.productId);
                if (product && product.cost) {
                    return itemProfit + ((item.price - product.cost) * item.quantity);
                }
                return itemProfit;
            }, 0);
            return totalProfit + invoiceProfit;
        }, 0);
    }

    /**
     * Calculate growth rate
     */
    calculateGrowthRate(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    /**
     * Get top selling products
     */
    getTopProducts(invoices, products) {
        const productSales = {};

        invoices.forEach(invoice => {
            (invoice.items || []).forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        productId: item.productId,
                        name: item.name,
                        totalQuantity: 0,
                        totalRevenue: 0
                    };
                }
                productSales[item.productId].totalQuantity += item.quantity;
                productSales[item.productId].totalRevenue += item.total;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);
    }

    /**
     * Prepare sales data for charts
     */
    prepareSalesData(invoices) {
        const salesByDate = {};
        const now = new Date();
        
        // Initialize last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const dateKey = date.toISOString().split('T')[0];
            salesByDate[dateKey] = { revenue: 0, orders: 0 };
        }

        // Aggregate sales data
        invoices.forEach(invoice => {
            const dateKey = invoice.createdAt.split('T')[0];
            if (salesByDate[dateKey]) {
                salesByDate[dateKey].revenue += invoice.total || 0;
                salesByDate[dateKey].orders += 1;
            }
        });

        return Object.entries(salesByDate).map(([date, data]) => ({
            date,
            revenue: data.revenue,
            orders: data.orders
        }));
    }

    /**
     * Prepare product sales data for charts
     */
    prepareProductSalesData(invoices, products) {
        const productSales = {};

        invoices.forEach(invoice => {
            (invoice.items || []).forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.total;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const currencySymbol = this.settings.currencySymbol || '৳';

        // Update stat cards
        this.updateElement('totalRevenue', `${currencySymbol}${this.formatNumber(this.stats.totalRevenue)}`);
        this.updateElement('totalOrders', this.formatNumber(this.stats.totalOrders));
        this.updateElement('totalProducts', this.formatNumber(this.stats.totalProducts));
        this.updateElement('totalCustomers', this.formatNumber(this.stats.totalCustomers));

        // Update growth indicators
        this.updateGrowthIndicator('revenue', this.stats.revenueGrowth);
        this.updateGrowthIndicator('orders', this.stats.orderGrowth);
        this.updateGrowthIndicator('customers', this.stats.customerGrowth);
    }

    /**
     * Update growth indicator
     */
    updateGrowthIndicator(type, growth) {
        const indicator = document.querySelector(`.stat-card.${type} .stat-change`);
        if (!indicator) return;

        const formattedGrowth = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        indicator.textContent = formattedGrowth;

        // Update classes
        indicator.classList.remove('positive', 'negative', 'neutral');
        if (growth > 0) {
            indicator.classList.add('positive');
        } else if (growth < 0) {
            indicator.classList.add('negative');
        } else {
            indicator.classList.add('neutral');
        }
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        this.initializeSalesChart();
        this.initializeProductsChart();
    }

    /**
     * Initialize sales chart
     */
    initializeSalesChart() {
        const canvas = document.getElementById('salesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts.sales) {
            this.charts.sales.destroy();
        }

        const salesData = this.stats.salesData || [];
        const labels = salesData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const revenueData = salesData.map(item => item.revenue);
        const ordersData = salesData.map(item => item.orders);

        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Revenue',
                        data: revenueData,
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Orders',
                        data: ordersData,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Revenue: ${context.parsed.y.toLocaleString()}`;
                                } else {
                                    return `Orders: ${context.parsed.y}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Revenue'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Orders'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    /**
     * Initialize products chart
     */
    initializeProductsChart() {
        const canvas = document.getElementById('productsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts.products) {
            this.charts.products.destroy();
        }

        const productData = this.stats.productSalesData || [];
        const labels = productData.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name);
        const data = productData.map(item => item.revenue);
        
        // Generate colors
        const colors = this.generateChartColors(productData.length);

        this.charts.products = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    /**
     * Generate chart colors
     */
    generateChartColors(count) {
        const baseColors = [
            'rgb(99, 102, 241)',   // Primary
            'rgb(34, 197, 94)',    // Success
            'rgb(251, 191, 36)',   // Warning
            'rgb(239, 68, 68)',    // Error
            'rgb(59, 130, 246)',   // Info
            'rgb(168, 85, 247)',   // Purple
            'rgb(236, 72, 153)',   // Pink
            'rgb(20, 184, 166)',   // Teal
            'rgb(245, 101, 101)',  // Red
            'rgb(52, 211, 153)'    // Emerald
        ];

        const background = [];
        const border = [];

        for (let i = 0; i < count; i++) {
            const color = baseColors[i % baseColors.length];
            background.push(color.replace('rgb', 'rgba').replace(')', ', 0.8)'));
            border.push(color);
        }

        return { background, border };
    }

    /**
     * Update recent activities
     */
    updateRecentActivities() {
        const activitiesContainer = document.getElementById('recentActivities');
        if (!activitiesContainer) return;

        const invoices = zovatuStorage.getItem('invoices') || [];
        const products = zovatuStorage.getItem('products') || [];
        const customers = zovatuStorage.getItem('customers') || [];

        // Get recent activities
        const activities = this.getRecentActivities(invoices, products, customers);

        if (activities.length === 0) {
            activitiesContainer.innerHTML = `
                <div class="empty-activities">
                    <i class="fas fa-chart-line"></i>
                    <h3>No Recent Activities</h3>
                    <p>Start making sales to see activities here</p>
                </div>
            `;
            return;
        }

        activitiesContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                ${activity.amount ? `<div class="activity-amount">${activity.amount}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Get recent activities
     */
    getRecentActivities(invoices, products, customers) {
        const activities = [];
        const currencySymbol = this.settings.currencySymbol || '৳';

        // Recent sales
        const recentInvoices = invoices
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        recentInvoices.forEach(invoice => {
            activities.push({
                type: 'sale',
                icon: 'fas fa-shopping-cart',
                title: `Sale #${invoice.invoiceNumber}`,
                description: `Sold to ${invoice.customerName}`,
                time: this.formatRelativeTime(invoice.createdAt),
                amount: `${currencySymbol}${invoice.total.toFixed(2)}`
            });
        });

        // Recent products (if any were added recently)
        const recentProducts = products
            .filter(p => p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        recentProducts.forEach(product => {
            activities.push({
                type: 'product',
                icon: 'fas fa-box',
                title: 'Product Added',
                description: `${product.name} added to inventory`,
                time: this.formatRelativeTime(product.createdAt)
            });
        });

        // Recent customers
        const recentCustomers = customers
            .filter(c => c.createdAt && new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        recentCustomers.forEach(customer => {
            activities.push({
                type: 'customer',
                icon: 'fas fa-user-plus',
                title: 'New Customer',
                description: `${customer.name} joined`,
                time: this.formatRelativeTime(customer.createdAt)
            });
        });

        // Sort all activities by time
        return activities
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 10);
    }

    /**
     * Format relative time
     */
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Chart period selector
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => {
                this.updateChartPeriod(parseInt(e.target.value));
            });
        }

        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Refresh button (if exists)
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }
    }

    /**
     * Update chart period
     */
    updateChartPeriod(days) {
        // Recalculate data for the selected period
        const invoices = zovatuStorage.getItem('invoices') || [];
        const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        const filteredInvoices = invoices.filter(inv => new Date(inv.createdAt) >= cutoffDate);

        // Update sales data
        this.stats.salesData = this.prepareSalesDataForPeriod(filteredInvoices, days);
        
        // Reinitialize sales chart
        this.initializeSalesChart();
    }

    /**
     * Prepare sales data for specific period
     */
    prepareSalesDataForPeriod(invoices, days) {
        const salesByDate = {};
        const now = new Date();
        
        // Initialize period
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const dateKey = date.toISOString().split('T')[0];
            salesByDate[dateKey] = { revenue: 0, orders: 0 };
        }

        // Aggregate sales data
        invoices.forEach(invoice => {
            const dateKey = invoice.createdAt.split('T')[0];
            if (salesByDate[dateKey]) {
                salesByDate[dateKey].revenue += invoice.total || 0;
                salesByDate[dateKey].orders += 1;
            }
        });

        return Object.entries(salesByDate).map(([date, data]) => ({
            date,
            revenue: data.revenue,
            orders: data.orders
        }));
    }

    /**
     * Handle quick actions
     */
    handleQuickAction(action) {
        switch (action) {
            case 'new-bill':
                if (window.zovatuApp) {
                    window.zovatuApp.navigateToPage('billing');
                }
                break;
            case 'add-product':
                if (window.zovatuApp) {
                    window.zovatuApp.navigateToPage('products');
                }
                break;
            case 'add-customer':
                if (window.zovatuApp) {
                    window.zovatuApp.navigateToPage('customers');
                }
                break;
            case 'view-reports':
                if (window.zovatuApp) {
                    window.zovatuApp.navigateToPage('reports');
                }
                break;
        }
    }

    /**
     * Start auto refresh
     */
    startAutoRefresh() {
        // Refresh dashboard every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.refreshDashboard();
        }, 5 * 60 * 1000);
    }

    /**
     * Stop auto refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Refresh dashboard
     */
    refreshDashboard() {
        this.loadDashboardData();
        this.initializeCharts();
        
        // Show refresh indicator
        this.showRefreshIndicator();
    }

    /**
     * Show refresh indicator
     */
    showRefreshIndicator() {
        // Create temporary refresh indicator
        const indicator = document.createElement('div');
        indicator.className = 'refresh-indicator';
        indicator.innerHTML = '<i class="fas fa-sync-alt animate-spin"></i> Dashboard updated';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-600);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 3000);
    }

    /**
     * Format number with commas
     */
    formatNumber(number) {
        return number.toLocaleString();
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
     * Destroy dashboard
     */
    destroy() {
        // Stop auto refresh
        this.stopAutoRefresh();
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        this.charts = {};
    }

    /**
     * Export dashboard data
     */
    exportDashboardData() {
        const data = {
            statistics: this.stats,
            exportedAt: new Date().toISOString(),
            period: '30 days'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Get dashboard summary for reports
     */
    getDashboardSummary() {
        return {
            totalRevenue: this.stats.totalRevenue,
            totalOrders: this.stats.totalOrders,
            totalProducts: this.stats.totalProducts,
            totalCustomers: this.stats.totalCustomers,
            averageOrderValue: this.stats.averageOrderValue,
            topProducts: this.stats.topProducts,
            revenueGrowth: this.stats.revenueGrowth,
            orderGrowth: this.stats.orderGrowth,
            generatedAt: new Date().toISOString()
        };
    }
}

// Initialize dashboard when page loads
document.addEventListener('pageChange', (e) => {
    if (e.detail.page === 'dashboard') {
        if (!window.dashboard) {
            window.dashboard = new ZovatuDashboard();
        } else {
            window.dashboard.refreshDashboard();
        }
    }
});

// Cleanup when leaving dashboard
document.addEventListener('pageChange', (e) => {
    if (e.detail.previousPage === 'dashboard' && window.dashboard) {
        window.dashboard.stopAutoRefresh();
    }
});

// Make available globally
if (typeof window !== 'undefined') {
    window.ZovatuDashboard = ZovatuDashboard;
}

