/* ===================================
   Zovatu Smart Billing Tool - Barcode Utility
   Barcode Generation and Management
   =================================== */

// Barcode utility class
class BarcodeUtils {
    constructor() {
        this.init();
    }

    // Initialize barcode utility
    init() {
        // Load JsBarcode library if not already loaded
        this.loadBarcodeLibrary();
    }

    // Load JsBarcode library
    loadBarcodeLibrary() {
        if (typeof JsBarcode === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
            script.onload = () => {
                console.log('JsBarcode library loaded successfully');
            };
            script.onerror = () => {
                console.error('Failed to load JsBarcode library');
            };
            document.head.appendChild(script);
        }
    }

    // Generate barcode
    generateBarcode(text, options = {}) {
        const defaultOptions = {
            format: 'CODE128',
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 14,
            textAlign: 'center',
            textPosition: 'bottom',
            textMargin: 2,
            fontOptions: '',
            font: 'monospace',
            background: '#ffffff',
            lineColor: '#000000',
            margin: 10,
            marginTop: undefined,
            marginBottom: undefined,
            marginLeft: undefined,
            marginRight: undefined
        };

        const config = { ...defaultOptions, ...options };

        // Create canvas element
        const canvas = document.createElement('canvas');
        
        try {
            if (typeof JsBarcode !== 'undefined') {
                JsBarcode(canvas, text, config);
                return canvas;
            } else {
                console.error('JsBarcode library not loaded');
                return this.generateFallbackBarcode(text);
            }
        } catch (error) {
            console.error('Error generating barcode:', error);
            return this.generateFallbackBarcode(text);
        }
    }

    // Generate fallback barcode (simple text representation)
    generateFallbackBarcode(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 300;
        canvas.height = 100;
        
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        ctx.fillStyle = '#000000';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        return canvas;
    }

    // Generate barcode as data URL
    generateBarcodeDataURL(text, options = {}) {
        const canvas = this.generateBarcode(text, options);
        return canvas.toDataURL('image/png');
    }

    // Generate barcode as blob
    generateBarcodeBlob(text, options = {}) {
        return new Promise((resolve) => {
            const canvas = this.generateBarcode(text, options);
            canvas.toBlob(resolve, 'image/png');
        });
    }

    // Generate product barcode
    generateProductBarcode(product, options = {}) {
        const barcodeText = product.barcode || product.sku || product.id;
        const defaultOptions = {
            format: 'CODE128',
            width: 1.5,
            height: 60,
            displayValue: true,
            fontSize: 12
        };

        return this.generateBarcode(barcodeText, { ...defaultOptions, ...options });
    }

    // Generate invoice barcode
    generateInvoiceBarcode(invoice, options = {}) {
        const barcodeText = invoice.invoiceNumber || invoice.id;
        const defaultOptions = {
            format: 'CODE128',
            width: 2,
            height: 80,
            displayValue: true,
            fontSize: 14
        };

        return this.generateBarcode(barcodeText, { ...defaultOptions, ...options });
    }

    // Generate QR code (using a simple QR code implementation)
    generateQRCode(text, size = 200) {
        // For a full implementation, you would use a QR code library
        // This is a placeholder that creates a simple pattern
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = size;
        canvas.height = size;
        
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // Draw simple pattern (placeholder for actual QR code)
        ctx.fillStyle = '#000000';
        const cellSize = size / 25;
        
        for (let i = 0; i < 25; i++) {
            for (let j = 0; j < 25; j++) {
                if ((i + j) % 3 === 0) {
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                }
            }
        }
        
        // Add text in center
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR', size / 2, size / 2);
        
        return canvas;
    }

    // Generate invoice QR code with payment info
    generateInvoiceQRCode(invoice, shop) {
        const qrData = {
            invoice: invoice.invoiceNumber,
            shop: shop.name,
            amount: invoice.total,
            date: ZovatuUtils.formatDate(invoice.createdAt, 'DD/MM/YYYY')
        };
        
        const qrText = JSON.stringify(qrData);
        return this.generateQRCode(qrText);
    }

    // Get supported barcode formats
    getSupportedFormats() {
        return [
            { value: 'CODE128', label: 'Code 128', description: 'Most common format, supports all ASCII characters' },
            { value: 'CODE39', label: 'Code 39', description: 'Alphanumeric format, widely supported' },
            { value: 'EAN13', label: 'EAN-13', description: '13-digit European Article Number' },
            { value: 'EAN8', label: 'EAN-8', description: '8-digit European Article Number' },
            { value: 'UPC', label: 'UPC-A', description: '12-digit Universal Product Code' },
            { value: 'ITF14', label: 'ITF-14', description: '14-digit Interleaved 2 of 5' },
            { value: 'MSI', label: 'MSI', description: 'Modified Plessey code' },
            { value: 'pharmacode', label: 'Pharmacode', description: 'Pharmaceutical binary code' }
        ];
    }

    // Validate barcode text for format
    validateBarcodeText(text, format) {
        const validations = {
            CODE128: () => text.length > 0 && text.length <= 80,
            CODE39: () => /^[A-Z0-9\-. $/+%]*$/.test(text) && text.length <= 43,
            EAN13: () => /^\d{12,13}$/.test(text),
            EAN8: () => /^\d{7,8}$/.test(text),
            UPC: () => /^\d{11,12}$/.test(text),
            ITF14: () => /^\d{13,14}$/.test(text),
            MSI: () => /^\d+$/.test(text),
            pharmacode: () => /^\d+$/.test(text) && parseInt(text) >= 3 && parseInt(text) <= 131070
        };

        const validator = validations[format];
        return validator ? validator() : false;
    }

    // Generate EAN-13 check digit
    generateEAN13CheckDigit(code) {
        if (code.length !== 12) return null;
        
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(code[i]);
            sum += (i % 2 === 0) ? digit : digit * 3;
        }
        
        return (10 - (sum % 10)) % 10;
    }

    // Generate valid EAN-13 code
    generateEAN13Code(prefix = '200') {
        // Start with prefix (country code or company prefix)
        let code = prefix.padEnd(12, '0');
        
        // Generate random digits for the remaining positions
        for (let i = prefix.length; i < 12; i++) {
            code = code.substring(0, i) + Math.floor(Math.random() * 10) + code.substring(i + 1);
        }
        
        // Add check digit
        const checkDigit = this.generateEAN13CheckDigit(code);
        return code + checkDigit;
    }

    // Print barcode
    printBarcode(canvas, title = '') {
        const printWindow = window.open('', '_blank');
        const dataURL = canvas.toDataURL('image/png');
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Barcode</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        text-align: center;
                    }
                    .barcode-container {
                        margin: 20px auto;
                        max-width: 400px;
                    }
                    .barcode-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .barcode-image {
                        max-width: 100%;
                        height: auto;
                        border: 1px solid #ddd;
                        padding: 10px;
                        background: white;
                    }
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="barcode-container">
                    ${title ? `<div class="barcode-title">${title}</div>` : ''}
                    <img src="${dataURL}" alt="Barcode" class="barcode-image">
                </div>
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
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    }

    // Download barcode as image
    downloadBarcode(canvas, filename = 'barcode.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // Create barcode label with product info
    createProductLabel(product, options = {}) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const width = options.width || 300;
        const height = options.height || 200;
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Draw border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 5, width - 10, height - 10);
        
        // Generate barcode
        const barcodeCanvas = this.generateProductBarcode(product, {
            width: 1,
            height: 40,
            displayValue: false
        });
        
        // Draw barcode
        const barcodeY = height - 80;
        ctx.drawImage(barcodeCanvas, 20, barcodeY, width - 40, 50);
        
        // Draw product name
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(product.name, width / 2, 30);
        
        // Draw price
        ctx.font = 'bold 18px Arial';
        ctx.fillText(ZovatuUtils.formatCurrency(product.price), width / 2, 60);
        
        // Draw SKU
        ctx.font = '12px Arial';
        ctx.fillText(product.sku, width / 2, 90);
        
        // Draw barcode number
        ctx.font = '10px monospace';
        ctx.fillText(product.barcode || product.sku, width / 2, height - 15);
        
        return canvas;
    }

    // Batch generate product labels
    batchGenerateLabels(products, options = {}) {
        const labels = [];
        
        products.forEach(product => {
            const label = this.createProductLabel(product, options);
            labels.push({
                product,
                canvas: label,
                dataURL: label.toDataURL('image/png')
            });
        });
        
        return labels;
    }

    // Print batch labels
    printBatchLabels(labels, title = 'Product Labels') {
        const printWindow = window.open('', '_blank');
        
        const labelHTML = labels.map(label => `
            <div class="label-item">
                <img src="${label.dataURL}" alt="${label.product.name}">
            </div>
        `).join('');
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Labels</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .labels-container {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 10px;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    .label-item {
                        text-align: center;
                        page-break-inside: avoid;
                    }
                    .label-item img {
                        max-width: 100%;
                        height: auto;
                        border: 1px solid #ddd;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .no-print { display: none; }
                        .labels-container {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="labels-container">
                    ${labelHTML}
                </div>
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
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    }
}

// Create global barcode utility instance
const ZovatuBarcode = new BarcodeUtils();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BarcodeUtils, ZovatuBarcode };
}

