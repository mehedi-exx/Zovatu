// Zovatu Billing Tool - Barcode Generation Utility
// Handles barcode generation for products using various formats

class BarcodeGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.initCanvas();
    }

    // Initialize canvas for barcode generation
    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // Generate barcode image as data URL
    generateBarcode(code, format = 'CODE128', options = {}) {
        const defaultOptions = {
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
            margin: 10
        };

        const config = { ...defaultOptions, ...options };

        try {
            switch (format.toUpperCase()) {
                case 'CODE128':
                    return this.generateCode128(code, config);
                case 'EAN13':
                    return this.generateEAN13(code, config);
                case 'EAN8':
                    return this.generateEAN8(code, config);
                case 'UPC':
                    return this.generateUPC(code, config);
                case 'CODE39':
                    return this.generateCode39(code, config);
                default:
                    return this.generateCode128(code, config);
            }
        } catch (error) {
            console.error('Barcode generation error:', error);
            return null;
        }
    }

    // Generate Code 128 barcode
    generateCode128(code, config) {
        const patterns = this.getCode128Patterns();
        const encoded = this.encodeCode128(code);
        
        if (!encoded) {
            throw new Error('Invalid Code 128 data');
        }

        return this.drawBarcode(encoded, config, code);
    }

    // Generate EAN-13 barcode
    generateEAN13(code, config) {
        if (code.length !== 13) {
            throw new Error('EAN-13 must be exactly 13 digits');
        }

        if (!/^\d+$/.test(code)) {
            throw new Error('EAN-13 must contain only digits');
        }

        const patterns = this.getEAN13Patterns();
        const encoded = this.encodeEAN13(code);
        
        return this.drawBarcode(encoded, config, code);
    }

    // Generate EAN-8 barcode
    generateEAN8(code, config) {
        if (code.length !== 8) {
            throw new Error('EAN-8 must be exactly 8 digits');
        }

        if (!/^\d+$/.test(code)) {
            throw new Error('EAN-8 must contain only digits');
        }

        const patterns = this.getEAN8Patterns();
        const encoded = this.encodeEAN8(code);
        
        return this.drawBarcode(encoded, config, code);
    }

    // Generate UPC barcode
    generateUPC(code, config) {
        if (code.length !== 12) {
            throw new Error('UPC must be exactly 12 digits');
        }

        if (!/^\d+$/.test(code)) {
            throw new Error('UPC must contain only digits');
        }

        const patterns = this.getUPCPatterns();
        const encoded = this.encodeUPC(code);
        
        return this.drawBarcode(encoded, config, code);
    }

    // Generate Code 39 barcode
    generateCode39(code, config) {
        if (!/^[A-Z0-9\-\.\$\/\+\%\s]*$/.test(code)) {
            throw new Error('Code 39 contains invalid characters');
        }

        const patterns = this.getCode39Patterns();
        const encoded = this.encodeCode39(code);
        
        return this.drawBarcode(encoded, config, code);
    }

    // Draw barcode on canvas
    drawBarcode(encoded, config, displayText) {
        const totalWidth = encoded.length * config.width + (config.margin * 2);
        const textHeight = config.displayValue ? config.fontSize + config.textMargin : 0;
        const totalHeight = config.height + textHeight + (config.margin * 2);

        this.canvas.width = totalWidth;
        this.canvas.height = totalHeight;

        // Clear canvas with background color
        this.ctx.fillStyle = config.background;
        this.ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Draw bars
        this.ctx.fillStyle = config.lineColor;
        let x = config.margin;

        for (let i = 0; i < encoded.length; i++) {
            if (encoded[i] === '1') {
                this.ctx.fillRect(x, config.margin, config.width, config.height);
            }
            x += config.width;
        }

        // Draw text if enabled
        if (config.displayValue && displayText) {
            this.ctx.fillStyle = config.lineColor;
            this.ctx.font = `${config.fontOptions} ${config.fontSize}px ${config.font}`;
            this.ctx.textAlign = config.textAlign;

            const textX = totalWidth / 2;
            const textY = config.margin + config.height + config.fontSize + config.textMargin;

            this.ctx.fillText(displayText, textX, textY);
        }

        return this.canvas.toDataURL('image/png');
    }

    // Encode Code 128
    encodeCode128(data) {
        const patterns = this.getCode128Patterns();
        let encoded = patterns.start; // Start pattern
        let checksum = 104; // Start B value
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const value = charCode - 32;
            
            if (value < 0 || value > 95) {
                return null; // Invalid character
            }
            
            encoded += patterns.data[value];
            checksum += value * (i + 1);
        }
        
        // Add checksum
        encoded += patterns.data[checksum % 103];
        
        // Add stop pattern
        encoded += patterns.stop;
        
        return encoded;
    }

    // Encode EAN-13
    encodeEAN13(data) {
        const patterns = this.getEAN13Patterns();
        let encoded = patterns.start;
        
        const firstDigit = parseInt(data[0]);
        const leftPattern = patterns.first[firstDigit];
        
        // Left group
        for (let i = 1; i <= 6; i++) {
            const digit = parseInt(data[i]);
            const patternType = leftPattern[i - 1];
            encoded += patterns.left[patternType][digit];
        }
        
        // Center guard
        encoded += patterns.center;
        
        // Right group
        for (let i = 7; i <= 12; i++) {
            const digit = parseInt(data[i]);
            encoded += patterns.right[digit];
        }
        
        // End guard
        encoded += patterns.end;
        
        return encoded;
    }

    // Encode EAN-8
    encodeEAN8(data) {
        const patterns = this.getEAN8Patterns();
        let encoded = patterns.start;
        
        // Left group
        for (let i = 0; i < 4; i++) {
            const digit = parseInt(data[i]);
            encoded += patterns.left[digit];
        }
        
        // Center guard
        encoded += patterns.center;
        
        // Right group
        for (let i = 4; i < 8; i++) {
            const digit = parseInt(data[i]);
            encoded += patterns.right[digit];
        }
        
        // End guard
        encoded += patterns.end;
        
        return encoded;
    }

    // Encode UPC
    encodeUPC(data) {
        // UPC is similar to EAN-13 with a leading zero
        return this.encodeEAN13('0' + data);
    }

    // Encode Code 39
    encodeCode39(data) {
        const patterns = this.getCode39Patterns();
        let encoded = patterns.start;
        
        for (let i = 0; i < data.length; i++) {
            const char = data[i];
            if (patterns.data[char]) {
                encoded += patterns.data[char] + '0'; // Inter-character gap
            }
        }
        
        encoded += patterns.start; // Stop pattern (same as start)
        
        return encoded;
    }

    // Get Code 128 patterns
    getCode128Patterns() {
        return {
            start: '11010010000',
            stop: '1100011101011',
            data: [
                '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
                '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
                '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
                '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
                '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
                '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
                '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
                '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
                '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
                '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
                '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
                '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
                '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
                '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
                '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
                '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
                '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
                '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
                '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
                '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
                '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
                '11010011100', '1100011101011'
            ]
        };
    }

    // Get EAN-13 patterns
    getEAN13Patterns() {
        return {
            start: '101',
            center: '01010',
            end: '101',
            first: [
                'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
                'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
            ],
            left: {
                L: ['0001101', '0011001', '0010011', '0111101', '0100011',
                    '0110001', '0101111', '0111011', '0110111', '0001011'],
                G: ['0100111', '0110011', '0011011', '0100001', '0011101',
                    '0111001', '0000101', '0010001', '0001001', '0010111']
            },
            right: ['1110010', '1100110', '1101100', '1000010', '1011100',
                   '1001110', '1010000', '1000100', '1001000', '1110100']
        };
    }

    // Get EAN-8 patterns
    getEAN8Patterns() {
        return {
            start: '101',
            center: '01010',
            end: '101',
            left: ['0001101', '0011001', '0010011', '0111101', '0100011',
                  '0110001', '0101111', '0111011', '0110111', '0001011'],
            right: ['1110010', '1100110', '1101100', '1000010', '1011100',
                   '1001110', '1010000', '1000100', '1001000', '1110100']
        };
    }

    // Get UPC patterns (same as EAN-13)
    getUPCPatterns() {
        return this.getEAN13Patterns();
    }

    // Get Code 39 patterns
    getCode39Patterns() {
        return {
            start: '1000101110111010',
            data: {
                '0': '101001101101', '1': '110100101011', '2': '101100101011',
                '3': '110110010101', '4': '101001101011', '5': '110100110101',
                '6': '101100110101', '7': '101001011011', '8': '110100101101',
                '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
                'C': '110110100101', 'D': '101011001011', 'E': '110101100101',
                'F': '101101100101', 'G': '101010011011', 'H': '110101001101',
                'I': '101101001101', 'J': '101011001101', 'K': '110101010011',
                'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
                'O': '110101101001', 'P': '101101101001', 'Q': '101010110011',
                'R': '110101011001', 'S': '101101011001', 'T': '101011011001',
                'U': '110010101011', 'V': '100110101011', 'W': '110011010101',
                'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
                '-': '100101011011', '.': '110010101101', ' ': '100110101101',
                '$': '100100100101', '/': '100100101001', '+': '100101001001',
                '%': '101001001001'
            }
        };
    }

    // Validate barcode format
    validateFormat(code, format) {
        switch (format.toUpperCase()) {
            case 'CODE128':
                return code.length > 0 && code.length <= 80;
            case 'EAN13':
                return /^\d{13}$/.test(code);
            case 'EAN8':
                return /^\d{8}$/.test(code);
            case 'UPC':
                return /^\d{12}$/.test(code);
            case 'CODE39':
                return /^[A-Z0-9\-\.\$\/\+\%\s]*$/.test(code) && code.length <= 43;
            default:
                return false;
        }
    }

    // Generate random barcode for testing
    generateRandomBarcode(format = 'CODE128') {
        switch (format.toUpperCase()) {
            case 'EAN13':
                return this.generateRandomEAN13();
            case 'EAN8':
                return this.generateRandomEAN8();
            case 'UPC':
                return this.generateRandomUPC();
            case 'CODE39':
                return this.generateRandomCode39();
            case 'CODE128':
            default:
                return this.generateRandomCode128();
        }
    }

    // Generate random EAN-13
    generateRandomEAN13() {
        let code = '';
        for (let i = 0; i < 12; i++) {
            code += Math.floor(Math.random() * 10);
        }
        
        // Calculate check digit
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        
        return code + checkDigit;
    }

    // Generate random EAN-8
    generateRandomEAN8() {
        let code = '';
        for (let i = 0; i < 7; i++) {
            code += Math.floor(Math.random() * 10);
        }
        
        // Calculate check digit
        let sum = 0;
        for (let i = 0; i < 7; i++) {
            sum += parseInt(code[i]) * (i % 2 === 0 ? 3 : 1);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        
        return code + checkDigit;
    }

    // Generate random UPC
    generateRandomUPC() {
        let code = '';
        for (let i = 0; i < 11; i++) {
            code += Math.floor(Math.random() * 10);
        }
        
        // Calculate check digit
        let sum = 0;
        for (let i = 0; i < 11; i++) {
            sum += parseInt(code[i]) * (i % 2 === 0 ? 3 : 1);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        
        return code + checkDigit;
    }

    // Generate random Code 39
    generateRandomCode39() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        const length = Math.floor(Math.random() * 10) + 5; // 5-14 characters
        
        for (let i = 0; i < length; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return code;
    }

    // Generate random Code 128
    generateRandomCode128() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        const length = Math.floor(Math.random() * 15) + 5; // 5-19 characters
        
        for (let i = 0; i < length; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return code;
    }

    // Download barcode as image
    downloadBarcode(dataURL, filename = 'barcode.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Print barcode
    printBarcode(dataURL) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Barcode</title>
                    <style>
                        body { margin: 0; padding: 20px; text-align: center; }
                        img { max-width: 100%; height: auto; }
                        @media print {
                            body { margin: 0; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <img src="${dataURL}" alt="Barcode" />
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
        `);
        printWindow.document.close();
    }
}

// Create global barcode generator instance
window.barcodeGenerator = new BarcodeGenerator();

