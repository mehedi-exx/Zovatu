/* ===================================
   Zovatu Smart Billing Tool - Billing Interface
   Main Billing System JavaScript
   =================================== */

// Billing interface class
class BillingInterface {
    constructor() {
        this.currentMode = 'simple';
        this.calculator = {
            display: '',
            operation: null,
            previousValue: null,
            waitingForNewValue: false
        };
        this.init();
    }

    // Initialize billing interface
    init() {
        this.setupEventListeners();
        this.loadShops();
        this.updateInterface();
    }

    // Setup event listeners
    setupEventListeners() {
        // Mode switching
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Shop selector
        const shopBtn = document.getElementById('shopBtn');
        if (shopBtn) {
            shopBtn.addEventListener('click', () => {
                ZovatuUtils.toggleDropdown(document.querySelector('.shop-selector'));
            });
        }

        // Create shop button
        const createShopBtn = document.getElementById('createShopBtn');
        if (createShopBtn) {
            createShopBtn.addEventListener('click', () => {
                this.showCreateShopModal();
            });
        }

        // Calculator buttons (Simple Mode)
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.key;
                this.handleCalculatorInput(key);
            });
        });

        // Product search (Ultra Mode)
        const productSearch = document.getElementById('productSearch');
        if (productSearch) {
            productSearch.addEventListener('input', ZovatuUtils.debounce((e) => {
                this.searchProducts(e.target.value);
            }, 300));
        }

        // Barcode scan button
        const barcodeScanBtn = document.getElementById('barcodeScanBtn');
        if (barcodeScanBtn) {
            barcodeScanBtn.addEventListener('click', () => {
                this.showBarcodeScanner();
            });
        }

        // Bill actions
        const clearBillBtn = document.getElementById('clearBillBtn');
        if (clearBillBtn) {
            clearBillBtn.addEventListener('click', () => {
                this.clearBill();
            });
        }

        const printBillBtn = document.getElementById('printBillBtn');
        if (printBillBtn) {
            printBillBtn.addEventListener('click', () => {
                this.printBill();
            });
        }

        const completeBillBtn = document.getElementById('completeBillBtn');
        if (completeBillBtn) {
            completeBillBtn.addEventListener('click', () => {
                this.completeBill();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    // Switch billing mode
    switchMode(mode) {
        this.currentMode = mode;
        
        // Update tab appearance
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        // Show/hide mode content
        document.querySelectorAll('.billing-mode').forEach(modeEl => {
            modeEl.classList.remove('active');
        });
        document.getElementById(`${mode}Mode`).classList.add('active');

        // Reset calculator if switching to simple mode
        if (mode === 'simple') {
            this.resetCalculator();
        }

        // Load products if switching to ultra mode
        if (mode === 'ultra') {
            this.loadProducts();
        }

        ZovatuUtils.showToast(`Switched to ${mode} mode`, 'info');
    }

    // Load shops
    loadShops() {
        const shops = ZovatuShops.getActiveShops();
        const shopList = document.getElementById('shopList');
        const currentShop = ZovatuShops.getCurrentShop();

        if (shopList) {
            shopList.innerHTML = '';
            
            shops.forEach(shop => {
                const shopItem = document.createElement('button');
                shopItem.className = 'dropdown-item';
                shopItem.innerHTML = `
                    <i class="fas fa-store"></i>
                    <div>
                        <div>${shop.name}</div>
                        <small>${shop.type}</small>
                    </div>
                `;
                shopItem.addEventListener('click', () => {
                    this.selectShop(shop.id);
                });
                shopList.appendChild(shopItem);
            });
        }

        // Update shop button
        const shopBtn = document.getElementById('shopBtn');
        if (shopBtn) {
            if (currentShop) {
                shopBtn.innerHTML = `
                    <i class="fas fa-store"></i>
                    <span>${currentShop.name}</span>
                    <i class="fas fa-chevron-down"></i>
                `;
            } else {
                shopBtn.innerHTML = `
                    <i class="fas fa-store"></i>
                    <span>Select Shop</span>
                    <i class="fas fa-chevron-down"></i>
                `;
            }
        }

        // Show shop selection screen if no shop selected
        if (!currentShop) {
            this.showShopSelectionScreen();
        } else {
            this.hideShopSelectionScreen();
        }
    }

    // Select shop
    selectShop(shopId) {
        ZovatuShops.setCurrentShop(shopId);
        this.loadShops();
        this.updateInterface();
        ZovatuUtils.closeAllDropdowns();
    }

    // Show shop selection screen
    showShopSelectionScreen() {
        const selectionScreen = document.getElementById('shopSelectionScreen');
        const billingContent = document.getElementById('billingContent');
        
        if (selectionScreen && billingContent) {
            selectionScreen.style.display = 'flex';
            billingContent.style.display = 'none';
        }

        this.loadShopCards();
    }

    // Hide shop selection screen
    hideShopSelectionScreen() {
        const selectionScreen = document.getElementById('shopSelectionScreen');
        const billingContent = document.getElementById('billingContent');
        
        if (selectionScreen && billingContent) {
            selectionScreen.style.display = 'none';
            billingContent.style.display = 'block';
        }
    }

    // Load shop cards
    loadShopCards() {
        const shops = ZovatuShops.getActiveShops();
        const shopCards = document.getElementById('shopCards');
        
        if (shopCards) {
            shopCards.innerHTML = '';
            
            shops.forEach(shop => {
                const shopCard = document.createElement('div');
                shopCard.className = 'shop-card';
                shopCard.innerHTML = `
                    <div class="shop-card-icon">
                        <i class="fas fa-store"></i>
                    </div>
                    <div class="shop-card-name">${shop.name}</div>
                    <div class="shop-card-type">${ZovatuUtils.capitalize(shop.type)}</div>
                `;
                shopCard.addEventListener('click', () => {
                    this.selectShop(shop.id);
                });
                shopCards.appendChild(shopCard);
            });

            // Add create shop card
            const createCard = document.createElement('div');
            createCard.className = 'shop-card create-shop-main';
            createCard.innerHTML = `
                <div class="shop-card-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <div class="shop-card-name">Create New Shop</div>
                <div class="shop-card-type">Add a new shop</div>
            `;
            createCard.addEventListener('click', () => {
                this.showCreateShopModal();
            });
            shopCards.appendChild(createCard);
        }
    }

    // Show create shop modal
    showCreateShopModal() {
        ZovatuUtils.showModal('createShopModal');
        this.setupCreateShopForm();
    }

    // Setup create shop form
    setupCreateShopForm() {
        const form = document.getElementById('createShopForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createShop();
            });
        }

        // Load shop types
        const shopTypeSelect = document.getElementById('shopType');
        if (shopTypeSelect) {
            const shopTypes = ZovatuShops.getShopTypes();
            shopTypeSelect.innerHTML = shopTypes.map(type => 
                `<option value="${type.value}">${type.label}</option>`
            ).join('');
        }
    }

    // Create shop
    createShop() {
        const form = document.getElementById('createShopForm');
        const formData = new FormData(form);
        
        const shopData = {
            name: formData.get('shopName'),
            type: formData.get('shopType'),
            address: formData.get('shopAddress'),
            phone: formData.get('shopPhone'),
            email: formData.get('shopEmail'),
            currency: formData.get('currency') || 'BDT'
        };

        // Validate shop data
        const errors = ZovatuShops.validateShopData(shopData);
        if (errors.length > 0) {
            ZovatuUtils.showToast(errors[0], 'error');
            return;
        }

        // Create shop
        const shop = ZovatuShops.createShop(shopData);
        if (shop) {
            ZovatuUtils.hideModal('createShopModal');
            form.reset();
            this.selectShop(shop.id);
        }
    }

    // Calculator functions (Simple Mode)
    resetCalculator() {
        this.calculator = {
            display: '0',
            operation: null,
            previousValue: null,
            waitingForNewValue: false
        };
        this.updateCalculatorDisplay();
    }

    // Handle calculator input
    handleCalculatorInput(key) {
        switch (key) {
            case 'clear':
                this.resetCalculator();
                break;
            case 'backspace':
                this.calculatorBackspace();
                break;
            case 'equals':
                this.calculatorEquals();
                break;
            case 'add-item':
                this.addCalculatorItem();
                break;
            case '+':
            case '-':
            case '*':
            case '/':
                this.calculatorOperation(key);
                break;
            case '.':
                this.calculatorDecimal();
                break;
            default:
                if (!isNaN(key)) {
                    this.calculatorNumber(key);
                }
                break;
        }
    }

    // Calculator number input
    calculatorNumber(num) {
        if (this.calculator.waitingForNewValue) {
            this.calculator.display = num;
            this.calculator.waitingForNewValue = false;
        } else {
            this.calculator.display = this.calculator.display === '0' ? num : this.calculator.display + num;
        }
        this.updateCalculatorDisplay();
    }

    // Calculator decimal input
    calculatorDecimal() {
        if (this.calculator.waitingForNewValue) {
            this.calculator.display = '0.';
            this.calculator.waitingForNewValue = false;
        } else if (this.calculator.display.indexOf('.') === -1) {
            this.calculator.display += '.';
        }
        this.updateCalculatorDisplay();
    }

    // Calculator operation
    calculatorOperation(op) {
        const inputValue = parseFloat(this.calculator.display);

        if (this.calculator.previousValue === null) {
            this.calculator.previousValue = inputValue;
        } else if (this.calculator.operation) {
            const currentValue = this.calculator.previousValue || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.calculator.operation);

            this.calculator.display = String(newValue);
            this.calculator.previousValue = newValue;
            this.updateCalculatorDisplay();
        }

        this.calculator.waitingForNewValue = true;
        this.calculator.operation = op;
    }

    // Calculator equals
    calculatorEquals() {
        const inputValue = parseFloat(this.calculator.display);

        if (this.calculator.previousValue !== null && this.calculator.operation) {
            const newValue = this.performCalculation(this.calculator.previousValue, inputValue, this.calculator.operation);
            this.calculator.display = String(newValue);
            this.calculator.previousValue = null;
            this.calculator.operation = null;
            this.calculator.waitingForNewValue = true;
            this.updateCalculatorDisplay();
        }
    }

    // Calculator backspace
    calculatorBackspace() {
        if (this.calculator.display.length > 1) {
            this.calculator.display = this.calculator.display.slice(0, -1);
        } else {
            this.calculator.display = '0';
        }
        this.updateCalculatorDisplay();
    }

    // Perform calculation
    performCalculation(firstValue, secondValue, operation) {
        switch (operation) {
            case '+':
                return firstValue + secondValue;
            case '-':
                return firstValue - secondValue;
            case '*':
                return firstValue * secondValue;
            case '/':
                return secondValue !== 0 ? firstValue / secondValue : 0;
            default:
                return secondValue;
        }
    }

    // Update calculator display
    updateCalculatorDisplay() {
        const displayInput = document.getElementById('calculatorDisplay');
        if (displayInput) {
            displayInput.value = this.calculator.display;
        }
    }

    // Add calculator item to bill
    addCalculatorItem() {
        const amount = parseFloat(this.calculator.display);
        if (amount > 0) {
            const item = {
                name: 'Manual Entry',
                price: amount,
                quantity: 1,
                unit: 'pcs'
            };
            
            ZovatuInvoices.addItem(item);
            this.updateBillDisplay();
            this.resetCalculator();
            ZovatuUtils.showToast('Item added to bill', 'success');
        }
    }

    // Load products (Ultra Mode)
    loadProducts() {
        const products = ZovatuProducts.getActiveProducts();
        this.displayProducts(products);
    }

    // Search products
    searchProducts(query) {
        if (query.trim() === '') {
            this.loadProducts();
            return;
        }

        const products = ZovatuProducts.searchProducts(query);
        this.displayProducts(products);
    }

    // Display products
    displayProducts(products) {
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) return;

        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="empty-products">
                    <i class="fas fa-box-open"></i>
                    <p>No products found</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <i class="fas fa-box"></i>
                </div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">${ZovatuUtils.formatCurrency(product.price)}</div>
                <div class="product-stock">Stock: ${product.stock} ${product.unit}</div>
            `;
            
            productCard.addEventListener('click', () => {
                this.addProductToCart(product);
            });
            
            productGrid.appendChild(productCard);
        });
    }

    // Add product to cart
    addProductToCart(product) {
        if (product.isTrackStock && product.stock <= 0) {
            ZovatuUtils.showToast('Product is out of stock', 'error');
            return;
        }

        const item = {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            quantity: 1,
            unit: product.unit
        };

        ZovatuInvoices.addItem(item);
        this.updateBillDisplay();
        ZovatuUtils.showToast(`${product.name} added to cart`, 'success');
    }

    // Update bill display
    updateBillDisplay() {
        const currentInvoice = ZovatuInvoices.getCurrentInvoice();
        this.updateBillItems(currentInvoice.items);
        this.updateBillTotals(currentInvoice);
    }

    // Update bill items
    updateBillItems(items) {
        const billItems = document.getElementById('billItems');
        const cartItems = document.getElementById('cartItems');
        
        const itemsHTML = items.length === 0 ? `
            <div class="empty-bill">
                <i class="fas fa-shopping-cart"></i>
                <p>No items in bill</p>
            </div>
        ` : items.map(item => `
            <div class="bill-item" data-item-id="${item.id}">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">${item.quantity} × ${ZovatuUtils.formatCurrency(item.price)}</div>
                </div>
                <div class="item-price">${ZovatuUtils.formatCurrency(item.total)}</div>
                <button class="item-remove" onclick="billingInterface.removeItem('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        if (billItems) billItems.innerHTML = itemsHTML;
        if (cartItems) cartItems.innerHTML = itemsHTML;
    }

    // Update bill totals
    updateBillTotals(invoice) {
        const currency = ZovatuShops.getCurrentShop()?.settings?.currency || 'BDT';
        
        // Update subtotal
        const subtotalElements = document.querySelectorAll('.subtotal-amount');
        subtotalElements.forEach(el => {
            el.textContent = ZovatuUtils.formatCurrency(invoice.subtotal, currency);
        });

        // Update tax
        const taxElements = document.querySelectorAll('.tax-amount');
        taxElements.forEach(el => {
            el.textContent = ZovatuUtils.formatCurrency(invoice.taxAmount, currency);
        });

        // Update discount
        const discountElements = document.querySelectorAll('.discount-amount');
        discountElements.forEach(el => {
            el.textContent = ZovatuUtils.formatCurrency(invoice.discountAmount, currency);
        });

        // Update total
        const totalElements = document.querySelectorAll('.total-amount');
        totalElements.forEach(el => {
            el.textContent = ZovatuUtils.formatCurrency(invoice.total, currency);
        });

        // Update cart count
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = invoice.items.length;
        }
    }

    // Remove item from bill
    removeItem(itemId) {
        ZovatuInvoices.removeItem(itemId);
        this.updateBillDisplay();
        ZovatuUtils.showToast('Item removed from bill', 'info');
    }

    // Clear bill
    clearBill() {
        if (confirm('Are you sure you want to clear the bill?')) {
            ZovatuInvoices.resetCurrentInvoice();
            this.updateBillDisplay();
            ZovatuUtils.showToast('Bill cleared', 'info');
        }
    }

    // Complete bill
    completeBill() {
        const currentInvoice = ZovatuInvoices.getCurrentInvoice();
        if (!currentInvoice || currentInvoice.items.length === 0) {
            ZovatuUtils.showToast('Cannot complete empty bill', 'error');
            return;
        }

        const completedInvoice = ZovatuInvoices.completeInvoice();
        if (completedInvoice) {
            this.updateBillDisplay();
            
            // Ask if user wants to print
            if (confirm('Bill completed successfully! Do you want to print the invoice?')) {
                ZovatuInvoices.printInvoice(completedInvoice.id);
            }
        }
    }

    // Print bill
    printBill() {
        const currentInvoice = ZovatuInvoices.getCurrentInvoice();
        if (!currentInvoice || currentInvoice.items.length === 0) {
            ZovatuUtils.showToast('Cannot print empty bill', 'error');
            return;
        }

        // Create temporary invoice for printing
        const tempInvoice = {
            ...currentInvoice,
            id: 'temp_' + Date.now(),
            invoiceNumber: 'TEMP-' + Date.now(),
            createdAt: new Date().toISOString()
        };

        const shop = ZovatuShops.getCurrentShop();
        const settings = ZovatuStore.getSettings();
        
        const printContent = ZovatuInvoices.generatePrintContent(tempInvoice, shop, settings);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    // Show barcode scanner
    showBarcodeScanner() {
        ZovatuUtils.showToast('Barcode scanner feature coming soon!', 'info');
        // TODO: Implement barcode scanner functionality
    }

    // Show settings modal
    showSettingsModal() {
        ZovatuUtils.showModal('settingsModal');
        this.loadSettings();
    }

    // Load settings
    loadSettings() {
        const settings = ZovatuStore.getSettings();
        const currentShop = ZovatuShops.getCurrentShop();
        
        // Load general settings
        const currencySelect = document.getElementById('settingsCurrency');
        if (currencySelect) {
            currencySelect.value = currentShop?.settings?.currency || settings.currency || 'BDT';
        }

        const taxRateInput = document.getElementById('settingsTaxRate');
        if (taxRateInput) {
            taxRateInput.value = currentShop?.settings?.taxRate || settings.taxRate || 0;
        }

        const discountRateInput = document.getElementById('settingsDiscountRate');
        if (discountRateInput) {
            discountRateInput.value = currentShop?.settings?.discountRate || settings.discountRate || 0;
        }
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case 'F1':
                e.preventDefault();
                this.switchMode('simple');
                break;
            case 'F2':
                e.preventDefault();
                this.switchMode('ultra');
                break;
            case 'F9':
                e.preventDefault();
                this.completeBill();
                break;
            case 'F10':
                e.preventDefault();
                this.printBill();
                break;
            case 'Escape':
                this.clearBill();
                break;
        }

        // Calculator shortcuts for simple mode
        if (this.currentMode === 'simple') {
            if (e.key >= '0' && e.key <= '9') {
                this.handleCalculatorInput(e.key);
            } else if (['+', '-', '*', '/'].includes(e.key)) {
                this.handleCalculatorInput(e.key);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.handleCalculatorInput('equals');
            } else if (e.key === '.') {
                this.handleCalculatorInput('.');
            } else if (e.key === 'Backspace') {
                this.handleCalculatorInput('backspace');
            }
        }
    }

    // Update interface
    updateInterface() {
        this.updateBillDisplay();
        
        // Update shop status
        const shopStatus = document.getElementById('shopStatus');
        const currentShop = ZovatuShops.getCurrentShop();
        
        if (shopStatus && currentShop) {
            shopStatus.textContent = `${currentShop.name} - ${ZovatuUtils.capitalize(currentShop.type)}`;
        }
    }
}

// Initialize billing interface when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the billing page
    if (document.getElementById('billingContent')) {
        window.billingInterface = new BillingInterface();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BillingInterface;
}

