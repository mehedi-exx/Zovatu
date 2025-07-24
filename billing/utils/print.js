/* ===================================
   Zovatu Smart Billing Tool - Print Utility
   Invoice and Receipt Printing
   =================================== */

// Print utility class
class PrintUtils {
    constructor() {
        this.templates = {};
        this.init();
    }

    // Initialize print utility
    init() {
        this.loadPrintTemplates();
    }

    // Load print templates
    loadPrintTemplates() {
        this.templates = {
            standard: this.getStandardTemplate(),
            thermal: this.getThermalTemplate(),
            minimal: this.getMinimalTemplate(),
            detailed: this.getDetailedTemplate()
        };
    }

    // Print invoice
    printInvoice(invoice, shop, options = {}) {
        const defaultOptions = {
            template: 'standard',
            paperSize: 'A4',
            includeBarcode: true,
            includeQR: false,
            copies: 1
        };

        const config = { ...defaultOptions, ...options };
        const template = this.templates[config.template] || this.templates.standard;
        
        const printContent = this.generatePrintContent(invoice, shop, template, config);
        this.openPrintWindow(printContent, `Invoice ${invoice.invoiceNumber}`);
    }

    // Generate print content
    generatePrintContent(invoice, shop, template, options) {
        const currency = shop?.settings?.currency || 'BDT';
        const barcodeDataURL = options.includeBarcode ? 
            ZovatuBarcode.generateBarcodeDataURL(invoice.invoiceNumber || invoice.id) : '';
        const qrDataURL = options.includeQR ? 
            ZovatuBarcode.generateInvoiceQRCode(invoice, shop).toDataURL() : '';

        return template({
            invoice,
            shop,
            currency,
            barcodeDataURL,
            qrDataURL,
            options,
            utils: ZovatuUtils
        });
    }

    // Standard template
    getStandardTemplate() {
        return ({ invoice, shop, currency, barcodeDataURL, qrDataURL, options, utils }) => `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.invoiceNumber}</title>
                <meta charset="UTF-8">
                <style>
                    ${this.getCommonStyles()}
                    ${this.getStandardStyles()}
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <!-- Header -->
                    <div class="invoice-header">
                        <div class="shop-info">
                            <h1 class="shop-name">${shop?.name || 'Shop Name'}</h1>
                            <div class="shop-details">
                                ${shop?.address ? `<div>${shop.address}</div>` : ''}
                                ${shop?.phone ? `<div>Phone: ${shop.phone}</div>` : ''}
                                ${shop?.email ? `<div>Email: ${shop.email}</div>` : ''}
                            </div>
                        </div>
                        <div class="invoice-info">
                            <h2>INVOICE</h2>
                            <div class="invoice-details">
                                <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
                                <div><strong>Date:</strong> ${utils.formatDate(invoice.createdAt, 'DD/MM/YYYY')}</div>
                                <div><strong>Time:</strong> ${utils.formatDate(invoice.createdAt, 'HH:mm')}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Info -->
                    ${invoice.customerInfo.name ? `
                    <div class="customer-section">
                        <h3>Bill To:</h3>
                        <div class="customer-info">
                            <div><strong>${invoice.customerInfo.name}</strong></div>
                            ${invoice.customerInfo.phone ? `<div>Phone: ${invoice.customerInfo.phone}</div>` : ''}
                            ${invoice.customerInfo.email ? `<div>Email: ${invoice.customerInfo.email}</div>` : ''}
                            ${invoice.customerInfo.address ? `<div>Address: ${invoice.customerInfo.address}</div>` : ''}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Items Table -->
                    <div class="items-section">
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoice.items.map(item => `
                                    <tr>
                                        <td>
                                            <div class="item-name">${item.name}</div>
                                            ${item.sku ? `<div class="item-sku">SKU: ${item.sku}</div>` : ''}
                                        </td>
                                        <td>${item.quantity} ${item.unit}</td>
                                        <td>${utils.formatCurrency(item.price, currency)}</td>
                                        <td>${utils.formatCurrency(item.total, currency)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Totals -->
                    <div class="totals-section">
                        <div class="totals-table">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>${utils.formatCurrency(invoice.subtotal, currency)}</span>
                            </div>
                            ${invoice.taxAmount > 0 ? `
                            <div class="total-row">
                                <span>Tax:</span>
                                <span>${utils.formatCurrency(invoice.taxAmount, currency)}</span>
                            </div>
                            ` : ''}
                            ${invoice.discountAmount > 0 ? `
                            <div class="total-row">
                                <span>Discount:</span>
                                <span>-${utils.formatCurrency(invoice.discountAmount, currency)}</span>
                            </div>
                            ` : ''}
                            <div class="total-row grand-total">
                                <span>Total:</span>
                                <span>${utils.formatCurrency(invoice.total, currency)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Info -->
                    <div class="payment-section">
                        <div><strong>Payment Method:</strong> ${utils.capitalize(invoice.paymentMethod)}</div>
                        <div><strong>Status:</strong> ${utils.capitalize(invoice.paymentStatus)}</div>
                    </div>

                    <!-- Notes -->
                    ${invoice.notes ? `
                    <div class="notes-section">
                        <h4>Notes:</h4>
                        <p>${invoice.notes}</p>
                    </div>
                    ` : ''}

                    <!-- Barcode/QR -->
                    <div class="codes-section">
                        ${barcodeDataURL ? `
                        <div class="barcode">
                            <img src="${barcodeDataURL}" alt="Invoice Barcode">
                        </div>
                        ` : ''}
                        ${qrDataURL ? `
                        <div class="qr-code">
                            <img src="${qrDataURL}" alt="Invoice QR Code">
                        </div>
                        ` : ''}
                    </div>

                    <!-- Footer -->
                    <div class="invoice-footer">
                        <div class="footer-text">
                            <p>Thank you for your business!</p>
                            <p class="generated-by">Generated by Zovatu Smart Billing Tool</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Thermal template (for thermal printers)
    getThermalTemplate() {
        return ({ invoice, shop, currency, barcodeDataURL, options, utils }) => `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt ${invoice.invoiceNumber}</title>
                <meta charset="UTF-8">
                <style>
                    ${this.getCommonStyles()}
                    ${this.getThermalStyles()}
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <!-- Header -->
                    <div class="receipt-header">
                        <h1>${shop?.name || 'Shop Name'}</h1>
                        ${shop?.address ? `<div>${shop.address}</div>` : ''}
                        ${shop?.phone ? `<div>${shop.phone}</div>` : ''}
                        <div class="separator">================================</div>
                    </div>

                    <!-- Invoice Info -->
                    <div class="receipt-info">
                        <div>Invoice: ${invoice.invoiceNumber}</div>
                        <div>Date: ${utils.formatDate(invoice.createdAt, 'DD/MM/YYYY HH:mm')}</div>
                        <div class="separator">--------------------------------</div>
                    </div>

                    <!-- Items -->
                    <div class="receipt-items">
                        ${invoice.items.map(item => `
                            <div class="receipt-item">
                                <div class="item-line">
                                    <span class="item-name">${item.name}</span>
                                </div>
                                <div class="item-line">
                                    <span>${item.quantity} x ${utils.formatCurrency(item.price, currency)}</span>
                                    <span class="item-total">${utils.formatCurrency(item.total, currency)}</span>
                                </div>
                            </div>
                        `).join('')}
                        <div class="separator">--------------------------------</div>
                    </div>

                    <!-- Totals -->
                    <div class="receipt-totals">
                        <div class="total-line">
                            <span>Subtotal:</span>
                            <span>${utils.formatCurrency(invoice.subtotal, currency)}</span>
                        </div>
                        ${invoice.taxAmount > 0 ? `
                        <div class="total-line">
                            <span>Tax:</span>
                            <span>${utils.formatCurrency(invoice.taxAmount, currency)}</span>
                        </div>
                        ` : ''}
                        ${invoice.discountAmount > 0 ? `
                        <div class="total-line">
                            <span>Discount:</span>
                            <span>-${utils.formatCurrency(invoice.discountAmount, currency)}</span>
                        </div>
                        ` : ''}
                        <div class="separator">================================</div>
                        <div class="total-line grand-total">
                            <span>TOTAL:</span>
                            <span>${utils.formatCurrency(invoice.total, currency)}</span>
                        </div>
                        <div class="separator">================================</div>
                    </div>

                    <!-- Payment -->
                    <div class="receipt-payment">
                        <div>Payment: ${utils.capitalize(invoice.paymentMethod)}</div>
                    </div>

                    <!-- Barcode -->
                    ${barcodeDataURL ? `
                    <div class="receipt-barcode">
                        <img src="${barcodeDataURL}" alt="Barcode">
                    </div>
                    ` : ''}

                    <!-- Footer -->
                    <div class="receipt-footer">
                        <div class="separator">--------------------------------</div>
                        <div class="center">Thank you for your business!</div>
                        <div class="center small">Powered by Zovatu</div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Minimal template
    getMinimalTemplate() {
        return ({ invoice, shop, currency, options, utils }) => `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt ${invoice.invoiceNumber}</title>
                <meta charset="UTF-8">
                <style>
                    ${this.getCommonStyles()}
                    ${this.getMinimalStyles()}
                </style>
            </head>
            <body>
                <div class="minimal-container">
                    <h2>${shop?.name || 'Shop Name'}</h2>
                    <p>Invoice: ${invoice.invoiceNumber} | ${utils.formatDate(invoice.createdAt, 'DD/MM/YYYY')}</p>
                    
                    <table>
                        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                        ${invoice.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${utils.formatCurrency(item.price, currency)}</td>
                                <td>${utils.formatCurrency(item.total, currency)}</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <div class="total">
                        <strong>Total: ${utils.formatCurrency(invoice.total, currency)}</strong>
                    </div>
                    
                    <p class="footer">Thank you!</p>
                </div>
            </body>
            </html>
        `;
    }

    // Detailed template
    getDetailedTemplate() {
        return ({ invoice, shop, currency, barcodeDataURL, qrDataURL, options, utils }) => `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Detailed Invoice ${invoice.invoiceNumber}</title>
                <meta charset="UTF-8">
                <style>
                    ${this.getCommonStyles()}
                    ${this.getDetailedStyles()}
                </style>
            </head>
            <body>
                <div class="detailed-container">
                    <!-- Letterhead -->
                    <div class="letterhead">
                        <div class="company-logo">
                            <div class="logo-placeholder">${shop?.name?.charAt(0) || 'S'}</div>
                        </div>
                        <div class="company-info">
                            <h1>${shop?.name || 'Shop Name'}</h1>
                            <div class="company-details">
                                ${shop?.address ? `<div>${shop.address}</div>` : ''}
                                ${shop?.phone ? `<div>Tel: ${shop.phone}</div>` : ''}
                                ${shop?.email ? `<div>Email: ${shop.email}</div>` : ''}
                            </div>
                        </div>
                        <div class="invoice-badge">
                            <h2>INVOICE</h2>
                            <div class="invoice-number">#${invoice.invoiceNumber}</div>
                        </div>
                    </div>

                    <!-- Invoice Details -->
                    <div class="invoice-details-section">
                        <div class="invoice-meta">
                            <div class="meta-group">
                                <label>Invoice Date:</label>
                                <span>${utils.formatDate(invoice.createdAt, 'DD MMMM YYYY')}</span>
                            </div>
                            <div class="meta-group">
                                <label>Due Date:</label>
                                <span>${utils.formatDate(invoice.createdAt, 'DD MMMM YYYY')}</span>
                            </div>
                            <div class="meta-group">
                                <label>Payment Terms:</label>
                                <span>Due on Receipt</span>
                            </div>
                        </div>
                        
                        ${invoice.customerInfo.name ? `
                        <div class="billing-info">
                            <h3>Bill To:</h3>
                            <div class="customer-details">
                                <div class="customer-name">${invoice.customerInfo.name}</div>
                                ${invoice.customerInfo.address ? `<div>${invoice.customerInfo.address}</div>` : ''}
                                ${invoice.customerInfo.phone ? `<div>Phone: ${invoice.customerInfo.phone}</div>` : ''}
                                ${invoice.customerInfo.email ? `<div>Email: ${invoice.customerInfo.email}</div>` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Items Table -->
                    <div class="items-section">
                        <table class="detailed-table">
                            <thead>
                                <tr>
                                    <th class="item-col">Description</th>
                                    <th class="qty-col">Qty</th>
                                    <th class="rate-col">Rate</th>
                                    <th class="amount-col">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoice.items.map((item, index) => `
                                    <tr>
                                        <td class="item-description">
                                            <div class="item-name">${item.name}</div>
                                            ${item.sku ? `<div class="item-sku">SKU: ${item.sku}</div>` : ''}
                                        </td>
                                        <td class="text-center">${item.quantity} ${item.unit}</td>
                                        <td class="text-right">${utils.formatCurrency(item.price, currency)}</td>
                                        <td class="text-right">${utils.formatCurrency(item.total, currency)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Summary -->
                    <div class="summary-section">
                        <div class="summary-table">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span>${utils.formatCurrency(invoice.subtotal, currency)}</span>
                            </div>
                            ${invoice.taxAmount > 0 ? `
                            <div class="summary-row">
                                <span>Tax:</span>
                                <span>${utils.formatCurrency(invoice.taxAmount, currency)}</span>
                            </div>
                            ` : ''}
                            ${invoice.discountAmount > 0 ? `
                            <div class="summary-row">
                                <span>Discount:</span>
                                <span>-${utils.formatCurrency(invoice.discountAmount, currency)}</span>
                            </div>
                            ` : ''}
                            <div class="summary-row total-row">
                                <span>Total Amount:</span>
                                <span>${utils.formatCurrency(invoice.total, currency)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Information -->
                    <div class="payment-info">
                        <h4>Payment Information</h4>
                        <div class="payment-details">
                            <div>Payment Method: ${utils.capitalize(invoice.paymentMethod)}</div>
                            <div>Payment Status: ${utils.capitalize(invoice.paymentStatus)}</div>
                        </div>
                    </div>

                    <!-- Terms and Conditions -->
                    <div class="terms-section">
                        <h4>Terms & Conditions</h4>
                        <ul>
                            <li>Payment is due within 30 days of invoice date</li>
                            <li>Late payments may incur additional charges</li>
                            <li>Goods sold are not returnable without prior approval</li>
                        </ul>
                    </div>

                    <!-- Codes -->
                    <div class="codes-section">
                        ${barcodeDataURL ? `
                        <div class="barcode-section">
                            <img src="${barcodeDataURL}" alt="Invoice Barcode">
                        </div>
                        ` : ''}
                        ${qrDataURL ? `
                        <div class="qr-section">
                            <img src="${qrDataURL}" alt="Invoice QR Code">
                        </div>
                        ` : ''}
                    </div>

                    <!-- Footer -->
                    <div class="detailed-footer">
                        <div class="footer-content">
                            <p>Thank you for your business!</p>
                            <p class="small-text">This is a computer-generated invoice and does not require a signature.</p>
                            <p class="small-text">Generated by Zovatu Smart Billing Tool</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Common styles
    getCommonStyles() {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.4;
                color: #333;
                background: white;
            }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            
            @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
                .page-break { page-break-before: always; }
            }
        `;
    }

    // Standard styles
    getStandardStyles() {
        return `
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
            }
            
            .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #eee;
            }
            
            .shop-name {
                font-size: 28px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            
            .shop-details {
                color: #666;
                line-height: 1.6;
            }
            
            .invoice-info h2 {
                font-size: 24px;
                color: #e74c3c;
                margin-bottom: 10px;
            }
            
            .invoice-details {
                text-align: right;
                color: #666;
            }
            
            .customer-section {
                margin-bottom: 30px;
            }
            
            .customer-section h3 {
                color: #2c3e50;
                margin-bottom: 10px;
                font-size: 16px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            
            .items-table th,
            .items-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .items-table th {
                background-color: #f8f9fa;
                font-weight: bold;
                color: #2c3e50;
            }
            
            .items-table td:last-child,
            .items-table th:last-child {
                text-align: right;
            }
            
            .item-sku {
                font-size: 12px;
                color: #666;
                margin-top: 4px;
            }
            
            .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 30px;
            }
            
            .totals-table {
                min-width: 300px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            
            .grand-total {
                font-weight: bold;
                font-size: 18px;
                color: #2c3e50;
                border-bottom: 2px solid #2c3e50;
                margin-top: 10px;
            }
            
            .payment-section,
            .notes-section {
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 5px;
            }
            
            .codes-section {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin: 30px 0;
            }
            
            .barcode img,
            .qr-code img {
                max-width: 200px;
                height: auto;
            }
            
            .invoice-footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
            }
            
            .generated-by {
                font-size: 12px;
                margin-top: 10px;
            }
        `;
    }

    // Thermal styles
    getThermalStyles() {
        return `
            .receipt-container {
                width: 80mm;
                margin: 0 auto;
                padding: 5mm;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
            }
            
            .receipt-header h1 {
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .receipt-header div {
                text-align: center;
                margin-bottom: 2px;
            }
            
            .separator {
                text-align: center;
                margin: 5px 0;
                font-family: monospace;
            }
            
            .receipt-info {
                margin-bottom: 10px;
            }
            
            .receipt-item {
                margin-bottom: 8px;
            }
            
            .item-line {
                display: flex;
                justify-content: space-between;
                margin-bottom: 2px;
            }
            
            .item-name {
                font-weight: bold;
            }
            
            .item-total {
                font-weight: bold;
            }
            
            .total-line {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
            }
            
            .grand-total {
                font-weight: bold;
                font-size: 14px;
            }
            
            .receipt-barcode {
                text-align: center;
                margin: 10px 0;
            }
            
            .receipt-barcode img {
                max-width: 100%;
                height: auto;
            }
            
            .center {
                text-align: center;
            }
            
            .small {
                font-size: 10px;
            }
        `;
    }

    // Minimal styles
    getMinimalStyles() {
        return `
            .minimal-container {
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
                font-family: Arial, sans-serif;
            }
            
            h2 {
                text-align: center;
                margin-bottom: 10px;
            }
            
            p {
                text-align: center;
                margin-bottom: 20px;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            th {
                background-color: #f2f2f2;
            }
            
            .total {
                text-align: right;
                font-size: 16px;
                margin-bottom: 20px;
            }
            
            .footer {
                text-align: center;
                font-style: italic;
            }
        `;
    }

    // Detailed styles
    getDetailedStyles() {
        return `
            .detailed-container {
                max-width: 900px;
                margin: 0 auto;
                padding: 40px;
                background: white;
            }
            
            .letterhead {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                margin-bottom: 40px;
                padding-bottom: 30px;
                border-bottom: 3px solid #2c3e50;
            }
            
            .company-logo {
                flex: 0 0 80px;
            }
            
            .logo-placeholder {
                width: 80px;
                height: 80px;
                background: #3498db;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                font-weight: bold;
                border-radius: 50%;
            }
            
            .company-info {
                flex: 1;
                margin-left: 30px;
            }
            
            .company-info h1 {
                font-size: 32px;
                color: #2c3e50;
                margin-bottom: 15px;
            }
            
            .company-details {
                color: #666;
                line-height: 1.8;
            }
            
            .invoice-badge {
                text-align: right;
                background: #e74c3c;
                color: white;
                padding: 20px;
                border-radius: 10px;
            }
            
            .invoice-badge h2 {
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .invoice-number {
                font-size: 18px;
                font-weight: bold;
            }
            
            .invoice-details-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }
            
            .invoice-meta {
                flex: 1;
            }
            
            .meta-group {
                margin-bottom: 10px;
            }
            
            .meta-group label {
                font-weight: bold;
                color: #2c3e50;
                display: inline-block;
                width: 120px;
            }
            
            .billing-info {
                flex: 1;
                margin-left: 40px;
            }
            
            .billing-info h3 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 18px;
            }
            
            .customer-name {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 5px;
            }
            
            .detailed-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                border: 1px solid #ddd;
            }
            
            .detailed-table th {
                background: #f8f9fa;
                padding: 15px;
                font-weight: bold;
                color: #2c3e50;
                border-bottom: 2px solid #ddd;
            }
            
            .detailed-table td {
                padding: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .item-col { width: 50%; }
            .qty-col { width: 15%; text-align: center; }
            .rate-col { width: 17.5%; text-align: right; }
            .amount-col { width: 17.5%; text-align: right; }
            
            .item-description .item-name {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .item-sku {
                font-size: 12px;
                color: #666;
            }
            
            .summary-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 40px;
            }
            
            .summary-table {
                min-width: 350px;
                border: 1px solid #ddd;
                border-radius: 5px;
                overflow: hidden;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 20px;
                border-bottom: 1px solid #eee;
            }
            
            .total-row {
                background: #2c3e50;
                color: white;
                font-weight: bold;
                font-size: 18px;
            }
            
            .payment-info,
            .terms-section {
                margin-bottom: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .payment-info h4,
            .terms-section h4 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 16px;
            }
            
            .terms-section ul {
                margin-left: 20px;
            }
            
            .terms-section li {
                margin-bottom: 8px;
                color: #666;
            }
            
            .codes-section {
                display: flex;
                justify-content: space-around;
                margin: 40px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .barcode-section img,
            .qr-section img {
                max-width: 150px;
                height: auto;
            }
            
            .detailed-footer {
                text-align: center;
                margin-top: 50px;
                padding-top: 30px;
                border-top: 2px solid #eee;
            }
            
            .footer-content p {
                margin-bottom: 10px;
            }
            
            .small-text {
                font-size: 12px;
                color: #666;
            }
        `;
    }

    // Open print window
    openPrintWindow(content, title = 'Print') {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(content);
        printWindow.document.close();
        
        printWindow.onload = function() {
            printWindow.print();
            printWindow.onafterprint = function() {
                printWindow.close();
            };
        };
    }

    // Get available templates
    getAvailableTemplates() {
        return [
            {
                id: 'standard',
                name: 'Standard Invoice',
                description: 'Professional invoice format suitable for most businesses',
                preview: 'Standard layout with company header, itemized list, and totals'
            },
            {
                id: 'thermal',
                name: 'Thermal Receipt',
                description: 'Compact format optimized for thermal printers',
                preview: 'Narrow format perfect for receipt printers'
            },
            {
                id: 'minimal',
                name: 'Minimal Receipt',
                description: 'Simple and clean receipt format',
                preview: 'Basic layout with essential information only'
            },
            {
                id: 'detailed',
                name: 'Detailed Invoice',
                description: 'Comprehensive invoice with terms and conditions',
                preview: 'Professional letterhead with detailed formatting'
            }
        ];
    }

    // Print test page
    printTestPage(template = 'standard') {
        const testInvoice = {
            invoiceNumber: 'TEST-001',
            createdAt: new Date().toISOString(),
            customerInfo: {
                name: 'Test Customer',
                phone: '+1234567890',
                email: 'test@example.com',
                address: '123 Test Street, Test City'
            },
            items: [
                {
                    name: 'Test Product 1',
                    sku: 'TEST-001',
                    quantity: 2,
                    unit: 'pcs',
                    price: 10.00,
                    total: 20.00
                },
                {
                    name: 'Test Product 2',
                    sku: 'TEST-002',
                    quantity: 1,
                    unit: 'pcs',
                    price: 15.00,
                    total: 15.00
                }
            ],
            subtotal: 35.00,
            taxAmount: 3.50,
            discountAmount: 0,
            total: 38.50,
            paymentMethod: 'cash',
            paymentStatus: 'completed',
            notes: 'This is a test invoice for print template testing.'
        };

        const testShop = {
            name: 'Test Shop',
            address: '456 Shop Street, Shop City, 12345',
            phone: '+1234567890',
            email: 'shop@example.com'
        };

        this.printInvoice(testInvoice, testShop, { template });
    }
}

// Create global print utility instance
const ZovatuPrint = new PrintUtils();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PrintUtils, ZovatuPrint };
}

