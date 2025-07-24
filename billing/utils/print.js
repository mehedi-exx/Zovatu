// Zovatu Billing Tool - Invoice Printing Utility
// Handles invoice printing with customizable templates and formats

class InvoicePrinter {
    constructor() {
        this.templates = this.getDefaultTemplates();
        this.settings = this.getDefaultSettings();
    }

    // Print invoice with specified template
    printInvoice(invoice, shopData, template = 'default', options = {}) {
        const templateConfig = this.templates[template] || this.templates.default;
        const printSettings = { ...this.settings, ...options };
        
        const htmlContent = this.generateInvoiceHTML(invoice, shopData, templateConfig, printSettings);
        this.openPrintWindow(htmlContent, printSettings);
    }

    // Generate invoice HTML content
    generateInvoiceHTML(invoice, shopData, template, settings) {
        const styles = this.generateCSS(template, settings);
        
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invoice ${invoice.invoice_number}</title>
                <style>${styles}</style>
            </head>
            <body>
                <div class="invoice-container">
                    ${this.generateHeader(shopData, template)}
                    ${this.generateInvoiceInfo(invoice, template)}
                    ${this.generateCustomerInfo(invoice, template)}
                    ${this.generateItemsTable(invoice, template)}
                    ${this.generateTotals(invoice, template)}
                    ${this.generateFooter(shopData, template, settings)}
                </div>
                <script>
                    window.onload = function() {
                        if (${settings.autoPrint}) {
                            window.print();
                        }
                        window.onafterprint = function() {
                            if (${settings.autoClose}) {
                                window.close();
                            }
                        };
                    };
                </script>
            </body>
            </html>
        `;
    }

    // Generate CSS styles
    generateCSS(template, settings) {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: ${template.fontFamily};
                font-size: ${template.fontSize};
                line-height: 1.4;
                color: ${template.textColor};
                background: white;
            }
            
            .invoice-container {
                max-width: ${settings.pageWidth};
                margin: 0 auto;
                padding: ${template.padding};
                background: white;
            }
            
            .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: ${template.borderStyle};
                padding-bottom: 15px;
            }
            
            .shop-logo {
                max-width: 120px;
                max-height: 80px;
                margin-bottom: 10px;
            }
            
            .shop-name {
                font-size: ${template.headerFontSize};
                font-weight: bold;
                color: ${template.primaryColor};
                margin-bottom: 5px;
            }
            
            .shop-details {
                font-size: ${template.subHeaderFontSize};
                color: ${template.secondaryColor};
                line-height: 1.3;
            }
            
            .invoice-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .invoice-details, .customer-details {
                flex: 1;
                min-width: 200px;
                margin-bottom: 15px;
            }
            
            .section-title {
                font-weight: bold;
                color: ${template.primaryColor};
                margin-bottom: 8px;
                font-size: ${template.sectionTitleSize};
            }
            
            .detail-row {
                margin-bottom: 3px;
                display: flex;
                justify-content: space-between;
            }
            
            .detail-label {
                font-weight: 500;
                min-width: 100px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                border: ${template.tableBorder};
            }
            
            .items-table th,
            .items-table td {
                padding: ${template.cellPadding};
                text-align: left;
                border-bottom: ${template.cellBorder};
            }
            
            .items-table th {
                background-color: ${template.headerBackground};
                color: ${template.headerTextColor};
                font-weight: bold;
                font-size: ${template.tableHeaderSize};
            }
            
            .items-table td {
                font-size: ${template.tableCellSize};
            }
            
            .text-right {
                text-align: right !important;
            }
            
            .text-center {
                text-align: center !important;
            }
            
            .totals-section {
                margin-left: auto;
                width: 300px;
                margin-bottom: 20px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px solid #eee;
            }
            
            .total-row.final {
                border-bottom: 2px solid ${template.primaryColor};
                font-weight: bold;
                font-size: 1.1em;
                color: ${template.primaryColor};
            }
            
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 15px;
                border-top: ${template.borderStyle};
                font-size: ${template.footerFontSize};
                color: ${template.secondaryColor};
            }
            
            .footer-message {
                margin-bottom: 10px;
                font-style: italic;
            }
            
            .qr-code {
                margin: 15px 0;
            }
            
            .qr-code img {
                width: 80px;
                height: 80px;
            }
            
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
                
                .invoice-container {
                    max-width: none;
                    margin: 0;
                    padding: 15px;
                }
                
                .no-print {
                    display: none !important;
                }
                
                .page-break {
                    page-break-before: always;
                }
            }
            
            @media screen and (max-width: 600px) {
                .invoice-info {
                    flex-direction: column;
                }
                
                .invoice-details, .customer-details {
                    margin-bottom: 20px;
                }
                
                .items-table {
                    font-size: 12px;
                }
                
                .totals-section {
                    width: 100%;
                }
            }
        `;
    }

    // Generate header section
    generateHeader(shopData, template) {
        const logoHtml = shopData.logo ? 
            `<img src="${shopData.logo}" alt="${shopData.name}" class="shop-logo">` : '';
        
        return `
            <div class="header">
                ${logoHtml}
                <div class="shop-name">${shopData.name}</div>
                <div class="shop-details">
                    ${shopData.address}<br>
                    Phone: ${shopData.phone}
                    ${shopData.email ? `<br>Email: ${shopData.email}` : ''}
                    ${shopData.website ? `<br>Website: ${shopData.website}` : ''}
                </div>
            </div>
        `;
    }

    // Generate invoice information section
    generateInvoiceInfo(invoice, template) {
        const invoiceDate = new Date(invoice.date).toLocaleDateString();
        const invoiceTime = new Date(invoice.date).toLocaleTimeString();
        
        return `
            <div class="invoice-info">
                <div class="invoice-details">
                    <div class="section-title">Invoice Details</div>
                    <div class="detail-row">
                        <span class="detail-label">Invoice #:</span>
                        <span>${invoice.invoice_number}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span>${invoiceDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time:</span>
                        <span>${invoiceTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment:</span>
                        <span>${this.formatPaymentMethod(invoice.payment_method)}</span>
                    </div>
                    ${invoice.salesman_id && invoice.salesman_id !== 'admin' ? 
                        `<div class="detail-row">
                            <span class="detail-label">Salesman:</span>
                            <span>${invoice.salesman_id}</span>
                        </div>` : ''
                    }
                </div>
            </div>
        `;
    }

    // Generate customer information section
    generateCustomerInfo(invoice, template) {
        if (!invoice.customer_name || invoice.customer_name === 'Walk-in Customer') {
            return '';
        }
        
        return `
            <div class="customer-details">
                <div class="section-title">Customer Details</div>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span>${invoice.customer_name}</span>
                </div>
                ${invoice.customer_phone ? 
                    `<div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span>${invoice.customer_phone}</span>
                    </div>` : ''
                }
                ${invoice.customer_email ? 
                    `<div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span>${invoice.customer_email}</span>
                    </div>` : ''
                }
                ${invoice.customer_address ? 
                    `<div class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span>${invoice.customer_address}</span>
                    </div>` : ''
                }
            </div>
        `;
    }

    // Generate items table
    generateItemsTable(invoice, template) {
        const itemsHtml = invoice.items.map((item, index) => `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.name}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${this.formatCurrency(item.unit_price)}</td>
                <td class="text-right">${this.formatCurrency(item.total)}</td>
            </tr>
        `).join('');
        
        return `
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="text-center" style="width: 50px;">#</th>
                        <th>Item Description</th>
                        <th class="text-center" style="width: 80px;">Qty</th>
                        <th class="text-right" style="width: 100px;">Unit Price</th>
                        <th class="text-right" style="width: 100px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        `;
    }

    // Generate totals section
    generateTotals(invoice, template) {
        return `
            <div class="totals-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${this.formatCurrency(invoice.subtotal)}</span>
                </div>
                ${invoice.discount_amount > 0 ? 
                    `<div class="total-row">
                        <span>Discount:</span>
                        <span>-${this.formatCurrency(invoice.discount_amount)}</span>
                    </div>` : ''
                }
                ${invoice.tax_amount > 0 ? 
                    `<div class="total-row">
                        <span>Tax:</span>
                        <span>${this.formatCurrency(invoice.tax_amount)}</span>
                    </div>` : ''
                }
                <div class="total-row final">
                    <span>Total Amount:</span>
                    <span>${this.formatCurrency(invoice.total_amount)}</span>
                </div>
                ${invoice.amount_received !== invoice.total_amount ? 
                    `<div class="total-row">
                        <span>Amount Received:</span>
                        <span>${this.formatCurrency(invoice.amount_received)}</span>
                    </div>
                    <div class="total-row">
                        <span>Change:</span>
                        <span>${this.formatCurrency(invoice.change_returned)}</span>
                    </div>` : ''
                }
            </div>
        `;
    }

    // Generate footer section
    generateFooter(shopData, template, settings) {
        const footerMessage = settings.footerMessage || 'Thank you for your business!';
        const qrCodeHtml = settings.includeQRCode ? this.generateQRCode(shopData) : '';
        
        return `
            <div class="footer">
                <div class="footer-message">${footerMessage}</div>
                ${qrCodeHtml}
                <div>Powered by Zovatu Billing System</div>
            </div>
        `;
    }

    // Generate QR code for shop contact
    generateQRCode(shopData) {
        const contactInfo = `${shopData.name}\n${shopData.address}\nPhone: ${shopData.phone}`;
        const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(contactInfo)}`;
        
        return `
            <div class="qr-code">
                <img src="${qrCodeURL}" alt="Shop Contact QR Code">
            </div>
        `;
    }

    // Open print window
    openPrintWindow(htmlContent, settings) {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        if (!settings.autoPrint) {
            // Add print button if auto-print is disabled
            const printButton = printWindow.document.createElement('button');
            printButton.textContent = 'Print Invoice';
            printButton.className = 'no-print';
            printButton.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                z-index: 1000;
            `;
            printButton.onclick = () => printWindow.print();
            printWindow.document.body.appendChild(printButton);
        }
    }

    // Format currency
    formatCurrency(amount, currency = 'BDT') {
        const formatted = parseFloat(amount || 0).toFixed(2);
        return currency === 'BDT' ? `৳${formatted}` : `${currency} ${formatted}`;
    }

    // Format payment method
    formatPaymentMethod(method) {
        const methods = {
            'cash': 'Cash',
            'card': 'Card',
            'mobile': 'Mobile Banking',
            'bank': 'Bank Transfer',
            'credit': 'Credit'
        };
        return methods[method] || method;
    }

    // Get default templates
    getDefaultTemplates() {
        return {
            default: {
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                headerFontSize: '24px',
                subHeaderFontSize: '12px',
                sectionTitleSize: '16px',
                tableHeaderSize: '13px',
                tableCellSize: '12px',
                footerFontSize: '11px',
                textColor: '#333',
                primaryColor: '#007bff',
                secondaryColor: '#666',
                headerBackground: '#f8f9fa',
                headerTextColor: '#333',
                borderStyle: '2px solid #007bff',
                tableBorder: '1px solid #ddd',
                cellBorder: '1px solid #eee',
                cellPadding: '8px 12px',
                padding: '20px'
            },
            minimal: {
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: '13px',
                headerFontSize: '20px',
                subHeaderFontSize: '11px',
                sectionTitleSize: '14px',
                tableHeaderSize: '12px',
                tableCellSize: '11px',
                footerFontSize: '10px',
                textColor: '#000',
                primaryColor: '#000',
                secondaryColor: '#555',
                headerBackground: '#fff',
                headerTextColor: '#000',
                borderStyle: '1px solid #000',
                tableBorder: '1px solid #000',
                cellBorder: '1px solid #ccc',
                cellPadding: '6px 8px',
                padding: '15px'
            },
            colorful: {
                fontFamily: 'Verdana, Arial, sans-serif',
                fontSize: '14px',
                headerFontSize: '26px',
                subHeaderFontSize: '12px',
                sectionTitleSize: '16px',
                tableHeaderSize: '13px',
                tableCellSize: '12px',
                footerFontSize: '11px',
                textColor: '#2c3e50',
                primaryColor: '#e74c3c',
                secondaryColor: '#7f8c8d',
                headerBackground: '#e74c3c',
                headerTextColor: '#fff',
                borderStyle: '3px solid #e74c3c',
                tableBorder: '2px solid #e74c3c',
                cellBorder: '1px solid #bdc3c7',
                cellPadding: '10px 12px',
                padding: '25px'
            }
        };
    }

    // Get default settings
    getDefaultSettings() {
        return {
            pageWidth: '210mm', // A4 width
            autoPrint: true,
            autoClose: true,
            includeQRCode: false,
            footerMessage: 'Thank you for your business!',
            template: 'default'
        };
    }

    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    // Add custom template
    addTemplate(name, template) {
        this.templates[name] = { ...this.templates.default, ...template };
    }

    // Print receipt (smaller format)
    printReceipt(invoice, shopData, options = {}) {
        const receiptSettings = {
            pageWidth: '80mm', // Thermal printer width
            autoPrint: true,
            autoClose: true,
            includeQRCode: false,
            footerMessage: 'Thank you!',
            template: 'minimal'
        };
        
        const settings = { ...receiptSettings, ...options };
        this.printInvoice(invoice, shopData, 'minimal', settings);
    }

    // Print barcode labels
    printBarcodeLabels(products, options = {}) {
        const defaultOptions = {
            labelsPerRow: 3,
            labelWidth: '60mm',
            labelHeight: '30mm',
            includeName: true,
            includePrice: true,
            barcodeHeight: '15mm'
        };
        
        const config = { ...defaultOptions, ...options };
        const htmlContent = this.generateBarcodeLabelsHTML(products, config);
        this.openPrintWindow(htmlContent, { autoPrint: false, autoClose: false });
    }

    // Generate barcode labels HTML
    generateBarcodeLabelsHTML(products, config) {
        const labelsHtml = products.map(product => {
            const barcodeDataURL = window.barcodeGenerator ? 
                window.barcodeGenerator.generateBarcode(product.barcode || product.code, 'CODE128', {
                    width: 1,
                    height: 40,
                    displayValue: false
                }) : '';
            
            return `
                <div class="barcode-label">
                    ${config.includeName ? `<div class="product-name">${product.name}</div>` : ''}
                    <div class="barcode-container">
                        ${barcodeDataURL ? `<img src="${barcodeDataURL}" alt="Barcode">` : ''}
                        <div class="barcode-text">${product.barcode || product.code}</div>
                    </div>
                    ${config.includePrice ? `<div class="product-price">${this.formatCurrency(product.price)}</div>` : ''}
                </div>
            `;
        }).join('');
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Barcode Labels</title>
                <style>
                    body {
                        margin: 0;
                        padding: 10px;
                        font-family: Arial, sans-serif;
                    }
                    .labels-container {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 5px;
                    }
                    .barcode-label {
                        width: ${config.labelWidth};
                        height: ${config.labelHeight};
                        border: 1px solid #ccc;
                        padding: 5px;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        page-break-inside: avoid;
                    }
                    .product-name {
                        font-size: 10px;
                        font-weight: bold;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .barcode-container {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    .barcode-container img {
                        max-width: 100%;
                        height: ${config.barcodeHeight};
                    }
                    .barcode-text {
                        font-size: 8px;
                        margin-top: 2px;
                    }
                    .product-price {
                        font-size: 12px;
                        font-weight: bold;
                        color: #e74c3c;
                    }
                    @media print {
                        body { margin: 0; padding: 5px; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="labels-container">
                    ${labelsHtml}
                </div>
            </body>
            </html>
        `;
    }
}

// Create global invoice printer instance
window.invoicePrinter = new InvoicePrinter();

