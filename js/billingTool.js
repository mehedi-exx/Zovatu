document.addEventListener("DOMContentLoaded", () => {
  // State management
  let currentStep = 0; // 0: paid amount, 1: bill amount, 2: change (auto-calculated)
  let values = {
    paid: 0,
    bill: 0,
    change: 0
  };
  let currentInput = "";
  let shopOpen = false;
  let lastTransactionData = null;

  // DOM Elements
  const shopStatus = document.getElementById("shopStatus");
  const shopStatusText = document.getElementById("shopStatusText");
  const openShopContainer = document.getElementById("openShopContainer");
  const calculatorContainer = document.getElementById("calculatorContainer");
  const displayLabel = document.getElementById("displayLabel");
  const paidBox = document.getElementById("paidBox");
  const billBox = document.getElementById("billBox");
  const changeBox = document.getElementById("changeBox");
  const nextBtn = document.getElementById("nextBtn");
  const generateBtn = document.getElementById("generateBtn");
  const successModal = document.getElementById("successModal");
  const printPreviewModal = document.getElementById("printPreviewModal");

  // Initialize
  checkShopStatus();
  updateDisplay();

  // Global functions for HTML onclick handlers
  window.openShop = openShop;
  window.inputNumber = inputNumber;
  window.clearInput = clearInput;
  window.nextStep = nextStep;
  window.generateBill = generateBill;
  window.closeModal = closeModal;
  window.showPrintPreview = showPrintPreview;
  window.closePrintPreview = closePrintPreview;
  window.updatePreview = updatePreview;
  window.printReceipt = printReceipt;
  window.downloadPDF = downloadPDF;
  window.openAdminPanel = openAdminPanel;

  function checkShopStatus() {
    const shopOpenStatus = localStorage.getItem("shopOpen");
    shopOpen = shopOpenStatus === "true";
    
    if (shopOpen) {
      shopStatusText.textContent = "Shop Open";
      shopStatus.classList.remove("closed");
      openShopContainer.style.display = "none";
      calculatorContainer.style.display = "block";
    } else {
      shopStatusText.textContent = "Shop Closed";
      shopStatus.classList.add("closed");
      openShopContainer.style.display = "block";
      calculatorContainer.style.display = "none";
    }
  }

  function openShop() {
    shopOpen = true;
    localStorage.setItem("shopOpen", "true");
    
    // Record shop opening time
    const now = new Date();
    localStorage.setItem("shopOpenTime", now.toISOString());
    
    checkShopStatus();
    showNotification("Shop opened successfully! Ready for billing.", "success");
  }

  function inputNumber(num) {
    if (!shopOpen) return;
    
    if (currentInput === "0") {
      currentInput = num.toString();
    } else {
      currentInput += num.toString();
    }
    
    updateCurrentBox();
    updateButtons();
  }

  function clearInput() {
    if (!shopOpen) return;
    
    currentInput = "0";
    updateCurrentBox();
    updateButtons();
  }

  function updateCurrentBox() {
    const displayValue = currentInput || "0";
    
    switch (currentStep) {
      case 0:
        paidBox.textContent = displayValue;
        values.paid = parseFloat(currentInput) || 0;
        break;
      case 1:
        billBox.textContent = displayValue;
        values.bill = parseFloat(currentInput) || 0;
        calculateChange();
        break;
    }
  }

  function calculateChange() {
    values.change = values.paid - values.bill;
    changeBox.textContent = values.change.toFixed(2);
    
    if (values.change < 0) {
      changeBox.style.color = "#f44336";
    } else {
      changeBox.style.color = "#4CAF50";
    }
  }

  function nextStep() {
    if (!shopOpen) return;
    
    if (currentStep === 0 && values.paid > 0) {
      currentStep = 1;
      currentInput = "0";
      updateDisplay();
      updateButtons();
    } else if (currentStep === 1 && values.bill > 0) {
      // Auto-calculate change and enable generate button
      calculateChange();
      updateButtons();
    }
  }

  function updateDisplay() {
    // Reset all boxes
    paidBox.classList.remove("active", "filled");
    billBox.classList.remove("active", "filled");
    changeBox.classList.remove("active", "filled");

    switch (currentStep) {
      case 0:
        displayLabel.textContent = "Enter customer payment amount";
        paidBox.classList.add("active");
        if (values.paid > 0) paidBox.classList.add("filled");
        break;
      case 1:
        displayLabel.textContent = "Enter total bill amount";
        billBox.classList.add("active");
        if (values.paid > 0) paidBox.classList.add("filled");
        if (values.bill > 0) billBox.classList.add("filled");
        break;
    }
  }

  function updateButtons() {
    const hasValidPaid = values.paid > 0;
    const hasValidBill = values.bill > 0;
    
    nextBtn.disabled = (currentStep === 0 && !hasValidPaid) || (currentStep === 1);
    generateBtn.disabled = !hasValidPaid || !hasValidBill;
    
    if (currentStep === 1 && hasValidBill) {
      nextBtn.style.display = "none";
      generateBtn.style.display = "block";
      generateBtn.disabled = false;
    } else if (currentStep === 0) {
      nextBtn.style.display = "block";
      generateBtn.style.display = "none";
    }
  }

  function generateBill() {
    if (!shopOpen || values.paid <= 0 || values.bill <= 0) return;

    // Save transaction
    const transaction = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      paid: values.paid,
      bill: values.bill,
      change: values.change,
      timestamp: new Date().toISOString()
    };

    saveTransaction(transaction);
    lastTransactionData = transaction;

    // Update modal
    document.getElementById("modalPaid").textContent = values.paid.toFixed(2);
    document.getElementById("modalBill").textContent = values.bill.toFixed(2);
    document.getElementById("modalChange").textContent = values.change.toFixed(2);

    // Check if print is enabled
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {};
    const printBtn = document.getElementById("printBtn");
    
    if (settings.enablePrint) {
      printBtn.style.display = "inline-block";
    } else {
      printBtn.style.display = "none";
    }

    // Show success modal
    successModal.style.display = "block";

    // Reset for next transaction
    resetCalculator();
  }

  function saveTransaction(transaction) {
    // Save to sales history
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    salesHistory.push(transaction);
    localStorage.setItem("salesHistory", JSON.stringify(salesHistory));

    // Update daily total
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `daily_${today}`;
    const currentDaily = parseFloat(localStorage.getItem(dailyKey)) || 0;
    localStorage.setItem(dailyKey, (currentDaily + transaction.bill).toString());

    // Update monthly total
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyKey = `monthly_${currentMonth}`;
    const currentMonthly = parseFloat(localStorage.getItem(monthlyKey)) || 0;
    localStorage.setItem(monthlyKey, (currentMonthly + transaction.bill).toString());
  }

  function resetCalculator() {
    currentStep = 0;
    currentInput = "0";
    values = { paid: 0, bill: 0, change: 0 };
    
    paidBox.textContent = "0";
    billBox.textContent = "0";
    changeBox.textContent = "0";
    changeBox.style.color = "#fff";
    
    updateDisplay();
    updateButtons();
  }

  function closeModal() {
    successModal.style.display = "none";
  }

  function showPrintPreview() {
    if (!lastTransactionData) return;
    
    printPreviewModal.style.display = "block";
    updatePreview();
  }

  function closePrintPreview() {
    printPreviewModal.style.display = "none";
  }

  function updatePreview() {
    if (!lastTransactionData) return;
    
    const paperSize = document.getElementById("paperSize").value;
    const design = document.getElementById("printDesign").value;
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {
      shopName: "Your Shop Name",
      shopAddress: "Shop Address",
      shopPhone: "Phone Number",
      shopEmail: ""
    };

    const previewContent = generateReceiptPreview(lastTransactionData, settings, design, paperSize);
    document.getElementById("receiptPreview").innerHTML = previewContent;
  }

  function generateReceiptPreview(data, settings, design, paperSize) {
    const width = paperSize === "thermal" ? "200px" : "100%";
    
    switch (design) {
      case "modern":
        return generateModernPreview(data, settings, width);
      case "minimal":
        return generateMinimalPreview(data, settings, width);
      default:
        return generateDefaultPreview(data, settings, width);
    }
  }

  function generateDefaultPreview(data, settings, width) {
    return `
      <div style="width: ${width}; margin: 0 auto; font-family: 'Courier New', monospace; font-size: 11px;">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
          <div style="font-weight: bold; font-size: 14px;">${settings.shopName || 'Your Shop Name'}</div>
          <div style="font-size: 10px;">${settings.shopAddress || 'Shop Address'}</div>
          <div style="font-size: 10px;">Phone: ${settings.shopPhone || 'Phone Number'}</div>
          ${settings.shopEmail ? `<div style="font-size: 10px;">Email: ${settings.shopEmail}</div>` : ''}
        </div>
        
        <div style="margin: 8px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span>Date:</span>
            <span>${data.date}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Time:</span>
            <span>${data.time}</span>
          </div>
        </div>
        
        <div style="margin: 8px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span>Bill Amount:</span>
            <span>৳${data.bill.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Amount Paid:</span>
            <span>৳${data.paid.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px dashed #000; padding-top: 5px; font-weight: bold;">
            <span>Change:</span>
            <span>৳${data.change.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 10px; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px;">
          <div>Thank you for your business!</div>
          <div>Powered by Zovatu</div>
        </div>
      </div>
    `;
  }

  function generateModernPreview(data, settings, width) {
    return `
      <div style="width: ${width}; margin: 0 auto; font-family: Arial, sans-serif; font-size: 11px;">
        <div style="text-align: center; background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
          <div style="font-weight: bold; font-size: 16px; color: #2c3e50;">${settings.shopName || 'Your Shop Name'}</div>
          <div style="font-size: 10px; color: #7f8c8d;">${settings.shopAddress || 'Shop Address'}</div>
          <div style="font-size: 10px; color: #7f8c8d;">📞 ${settings.shopPhone || 'Phone Number'}</div>
          ${settings.shopEmail ? `<div style="font-size: 10px; color: #7f8c8d;">📧 ${settings.shopEmail}</div>` : ''}
        </div>
        
        <div style="background: #f9f9f9; padding: 8px; border-radius: 3px; margin-bottom: 8px;">
          <div style="font-weight: bold; color: #34495e; margin-bottom: 5px;">Transaction Details</div>
          <div style="display: flex; justify-content: space-between;">
            <span>📅 Date:</span>
            <span>${data.date}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>🕐 Time:</span>
            <span>${data.time}</span>
          </div>
        </div>
        
        <div style="background: #f9f9f9; padding: 8px; border-radius: 3px; margin-bottom: 8px;">
          <div style="font-weight: bold; color: #34495e; margin-bottom: 5px;">Payment Summary</div>
          <div style="display: flex; justify-content: space-between;">
            <span>Bill Amount:</span>
            <span>৳${data.bill.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Amount Paid:</span>
            <span>৳${data.paid.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; background: #3498db; color: white; padding: 5px; border-radius: 3px; margin-top: 5px; font-weight: bold;">
            <span>Change Given:</span>
            <span>৳${data.change.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="text-align: center; font-size: 10px; color: #7f8c8d;">
          <div style="font-weight: bold; color: #27ae60; margin-bottom: 3px;">Thank you for your business! 🙏</div>
          <div>Powered by Zovatu Billing System</div>
        </div>
      </div>
    `;
  }

  function generateMinimalPreview(data, settings, width) {
    return `
      <div style="width: ${width}; margin: 0 auto; font-family: Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.4;">
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-size: 18px; font-weight: 300; letter-spacing: 1px; margin-bottom: 8px; text-transform: uppercase;">${settings.shopName || 'Your Shop Name'}</div>
          <div style="font-size: 10px; color: #666; margin-bottom: 2px;">${settings.shopAddress || 'Shop Address'}</div>
          <div style="font-size: 10px; color: #666; margin-bottom: 2px;">${settings.shopPhone || 'Phone Number'}</div>
          ${settings.shopEmail ? `<div style="font-size: 10px; color: #666;">${settings.shopEmail}</div>` : ''}
        </div>
        
        <div style="border-top: 1px solid #000; margin: 10px 0;"></div>
        
        <div style="text-align: center; font-size: 10px; color: #666; margin-bottom: 10px;">
          ${data.date} • ${data.time}
        </div>
        
        <div style="margin: 10px 0;">
          <div style="display: flex; justify-content: space-between; margin: 6px 0; font-weight: 300;">
            <span>BILL AMOUNT</span>
            <span>৳${data.bill.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 6px 0; font-weight: 300;">
            <span>AMOUNT PAID</span>
            <span>৳${data.paid.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px solid #000; font-weight: 600; font-size: 12px;">
            <span>CHANGE</span>
            <span>৳${data.change.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="border-top: 1px solid #000; margin: 15px 0;"></div>
        
        <div style="text-align: center; font-size: 9px; color: #999; font-weight: 300;">
          <div>THANK YOU</div>
          <div style="margin-top: 3px;">ZOVATU</div>
        </div>
      </div>
    `;
  }

  function printReceipt() {
    if (!lastTransactionData) return;
    
    const paperSize = document.getElementById("paperSize").value;
    const design = document.getElementById("printDesign").value;
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {
      shopName: "Your Shop Name",
      shopAddress: "Shop Address",
      shopPhone: "Phone Number",
      shopEmail: ""
    };

    const printWindow = window.open('', '_blank');
    const receiptHTML = generateReceiptHTML(lastTransactionData, settings, design, paperSize);
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    
    closePrintPreview();
  }

  function downloadPDF() {
    if (!lastTransactionData) return;
    
    const paperSize = document.getElementById("paperSize").value;
    const design = document.getElementById("printDesign").value;
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {
      shopName: "Your Shop Name",
      shopAddress: "Shop Address",
      shopPhone: "Phone Number",
      shopEmail: ""
    };

    // Create a temporary window for PDF generation
    const printWindow = window.open('', '_blank');
    const receiptHTML = generateReceiptHTML(lastTransactionData, settings, design, paperSize);
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Trigger print dialog which allows saving as PDF
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
    
    closePrintPreview();
  }

  function generateReceiptHTML(data, settings, design, paperSize) {
    const pageWidth = paperSize === "thermal" ? "58mm" : paperSize === "a4" ? "210mm" : "8.5in";
    const pageHeight = paperSize === "thermal" ? "auto" : paperSize === "a4" ? "297mm" : "11in";
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${data.date} ${data.time}</title>
        <style>
          @page {
            size: ${pageWidth} ${pageHeight};
            margin: ${paperSize === "thermal" ? "5mm" : "10mm"};
          }
          body {
            font-family: ${design === "minimal" ? "'Helvetica', 'Arial', sans-serif" : design === "modern" ? "'Arial', sans-serif" : "'Courier New', monospace"};
            margin: 0;
            padding: ${paperSize === "thermal" ? "5px" : "10px"};
            background: white;
            color: black;
            font-size: ${paperSize === "thermal" ? "10px" : "12px"};
            line-height: 1.4;
          }
          .receipt {
            width: 100%;
            max-width: ${paperSize === "thermal" ? "48mm" : "100%"};
            margin: 0 auto;
          }
          ${getDesignStyles(design)}
        </style>
      </head>
      <body>
        <div class="receipt">
          ${generateReceiptContent(data, settings, design)}
        </div>
      </body>
      </html>
    `;
  }

  function getDesignStyles(design) {
    switch (design) {
      case "modern":
        return `
          .header {
            text-align: center;
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
          }
          .shop-name {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .shop-info {
            font-size: 10px;
            color: #7f8c8d;
            margin-bottom: 2px;
          }
          .section {
            background: #f9f9f9;
            padding: 8px;
            border-radius: 3px;
            margin-bottom: 8px;
          }
          .section-title {
            font-weight: bold;
            color: #34495e;
            margin-bottom: 5px;
          }
          .total {
            background: #3498db;
            color: white;
            padding: 5px;
            border-radius: 3px;
            margin-top: 5px;
            font-weight: bold;
          }
        `;
      case "minimal":
        return `
          .header {
            text-align: center;
            margin-bottom: 15px;
          }
          .shop-name {
            font-size: 18px;
            font-weight: 300;
            letter-spacing: 1px;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          .shop-info {
            font-size: 10px;
            color: #666;
            margin-bottom: 2px;
            font-weight: 300;
          }
          .divider {
            border-top: 1px solid #000;
            margin: 10px 0;
          }
          .date-time {
            text-align: center;
            font-size: 10px;
            color: #666;
            margin-bottom: 10px;
          }
          .total {
            font-weight: 600;
            font-size: 12px;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid #000;
          }
        `;
      default:
        return `
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .shop-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .shop-info {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .total {
            border-top: 1px dashed #000;
            padding-top: 5px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 8px;
            font-size: 10px;
          }
        `;
    }
  }

  function generateReceiptContent(data, settings, design) {
    switch (design) {
      case "modern":
        return `
          <div class="header">
            <div class="shop-name">${settings.shopName || 'Your Shop Name'}</div>
            <div class="shop-info">${settings.shopAddress || 'Shop Address'}</div>
            <div class="shop-info">📞 ${settings.shopPhone || 'Phone Number'}</div>
            ${settings.shopEmail ? `<div class="shop-info">📧 ${settings.shopEmail}</div>` : ''}
          </div>
          
          <div class="section">
            <div class="section-title">Transaction Details</div>
            <div style="display: flex; justify-content: space-between;">
              <span>📅 Date:</span>
              <span>${data.date}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>🕐 Time:</span>
              <span>${data.time}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Payment Summary</div>
            <div style="display: flex; justify-content: space-between;">
              <span>Bill Amount:</span>
              <span>৳${data.bill.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Amount Paid:</span>
              <span>৳${data.paid.toFixed(2)}</span>
            </div>
            <div class="total">
              <div style="display: flex; justify-content: space-between;">
                <span>Change Given:</span>
                <span>৳${data.change.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 10px; color: #7f8c8d;">
            <div style="font-weight: bold; color: #27ae60; margin-bottom: 3px;">Thank you for your business! 🙏</div>
            <div>Powered by Zovatu Billing System</div>
          </div>
        `;
      case "minimal":
        return `
          <div class="header">
            <div class="shop-name">${settings.shopName || 'Your Shop Name'}</div>
            <div class="shop-info">${settings.shopAddress || 'Shop Address'}</div>
            <div class="shop-info">${settings.shopPhone || 'Phone Number'}</div>
            ${settings.shopEmail ? `<div class="shop-info">${settings.shopEmail}</div>` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div class="date-time">
            ${data.date} • ${data.time}
          </div>
          
          <div>
            <div style="display: flex; justify-content: space-between; margin: 6px 0; font-weight: 300;">
              <span>BILL AMOUNT</span>
              <span>৳${data.bill.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 6px 0; font-weight: 300;">
              <span>AMOUNT PAID</span>
              <span>৳${data.paid.toFixed(2)}</span>
            </div>
            <div class="total">
              <div style="display: flex; justify-content: space-between;">
                <span>CHANGE</span>
                <span>৳${data.change.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div style="text-align: center; font-size: 9px; color: #999; font-weight: 300;">
            <div>THANK YOU</div>
            <div style="margin-top: 3px;">ZOVATU</div>
          </div>
        `;
      default:
        return `
          <div class="header">
            <div class="shop-name">${settings.shopName || 'Your Shop Name'}</div>
            <div class="shop-info">${settings.shopAddress || 'Shop Address'}</div>
            <div class="shop-info">Phone: ${settings.shopPhone || 'Phone Number'}</div>
            ${settings.shopEmail ? `<div class="shop-info">Email: ${settings.shopEmail}</div>` : ''}
          </div>
          
          <div style="margin: 8px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>Date:</span>
              <span>${data.date}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Time:</span>
              <span>${data.time}</span>
            </div>
          </div>
          
          <div style="margin: 8px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>Bill Amount:</span>
              <span>৳${data.bill.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Amount Paid:</span>
              <span>৳${data.paid.toFixed(2)}</span>
            </div>
            <div class="total">
              <div style="display: flex; justify-content: space-between;">
                <span>Change:</span>
                <span>৳${data.change.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div>Thank you for your business!</div>
            <div>Powered by Zovatu</div>
          </div>
        `;
    }
  }

  function openAdminPanel() {
    window.location.href = "billingAdmin.html";
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `;
    
    switch (type) {
      case "success":
        notification.style.background = "#4CAF50";
        break;
      case "error":
        notification.style.background = "#f44336";
        break;
      default:
        notification.style.background = "#2196F3";
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
});

