document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1;
  let currentValue = "";
  let values = { paid: 0, bill: 0, change: 0 };
  
  const displayScreen = document.getElementById("displayScreen");
  const boxes = [
    document.getElementById("box1"),
    document.getElementById("box2"),
    document.getElementById("box3")
  ];
  const valueSpans = [
    document.getElementById("value1"),
    document.getElementById("value2"),
    document.getElementById("value3")
  ];
  const nextBtn = document.getElementById("nextBtn");
  const generateBtn = document.getElementById("generateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const numberBtns = document.querySelectorAll(".calc-btn.number");
  const successPopup = document.getElementById("successPopup");
  const closePopupBtn = document.getElementById("closePopupBtn");
  const printBtn = document.getElementById("printBtn");
  
  const messages = [
    "Enter customer payment amount",
    "Enter total bill amount",
    "Change amount will be calculated"
  ];
  
  // Initialize
  updateDisplay();
  checkPrintSettings();
  
  // Number button event listeners
  numberBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const number = btn.getAttribute("data-number");
      if (currentStep < 3) {
        currentValue += number;
        updateCurrentBox();
      }
    });
  });
  
  // Clear button
  clearBtn.addEventListener("click", () => {
    currentValue = "";
    updateCurrentBox();
  });
  
  // Next button
  nextBtn.addEventListener("click", () => {
    if (currentStep < 3 && currentValue !== "") {
      saveCurrentValue();
      currentStep++;
      currentValue = "";
      updateDisplay();
      updateBoxStates();
      
      if (currentStep === 3) {
        calculateChange();
        nextBtn.style.display = "none";
        generateBtn.disabled = false;
      }
    }
  });
  
  // Generate button
  generateBtn.addEventListener("click", () => {
    saveBillRecord();
    showSuccessPopup();
  });
  
  // Close popup
  closePopupBtn.addEventListener("click", () => {
    closePopup();
  });
  
  // Print button
  printBtn.addEventListener("click", () => {
    printReceipt();
  });
  
  function updateDisplay() {
    displayScreen.textContent = messages[currentStep - 1];
  }
  
  function updateCurrentBox() {
    if (currentStep <= 3) {
      valueSpans[currentStep - 1].textContent = currentValue || "0";
    }
  }
  
  function updateBoxStates() {
    boxes.forEach((box, index) => {
      box.classList.toggle("active", index === currentStep - 1);
    });
  }
  
  function saveCurrentValue() {
    const value = parseFloat(currentValue) || 0;
    switch (currentStep) {
      case 1:
        values.paid = value;
        break;
      case 2:
        values.bill = value;
        break;
    }
  }
  
  function calculateChange() {
    values.change = values.paid - values.bill;
    valueSpans[2].textContent = values.change.toFixed(2);
    
    if (values.change < 0) {
      displayScreen.textContent = `Insufficient payment! Need ৳${Math.abs(values.change).toFixed(2)} more`;
      displayScreen.style.color = "#ff4444";
    } else {
      displayScreen.textContent = `Change: ৳${values.change.toFixed(2)}`;
      displayScreen.style.color = "#00ff00";
    }
  }
  
  function saveBillRecord() {
    const now = new Date();
    const record = {
      id: Date.now(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString(),
      paid: values.paid,
      bill: values.bill,
      change: values.change,
      timestamp: now.getTime()
    };
    
    // Save to localStorage
    let salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    salesHistory.push(record);
    localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
    
    // Update daily/monthly totals
    updateSalesTotals(record);
  }
  
  function updateSalesTotals(record) {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    let dailyTotal = parseFloat(localStorage.getItem(`daily_${today}`)) || 0;
    let monthlyTotal = parseFloat(localStorage.getItem(`monthly_${currentMonth}`)) || 0;
    
    dailyTotal += record.bill;
    monthlyTotal += record.bill;
    
    localStorage.setItem(`daily_${today}`, dailyTotal.toString());
    localStorage.setItem(`monthly_${currentMonth}`, monthlyTotal.toString());
  }
  
  function showSuccessPopup() {
    document.getElementById("popupPaid").textContent = values.paid.toFixed(2);
    document.getElementById("popupBill").textContent = values.bill.toFixed(2);
    document.getElementById("popupChange").textContent = values.change.toFixed(2);
    
    successPopup.style.display = "flex";
  }
  
  function closePopup() {
    successPopup.style.display = "none";
    resetCalculator();
  }
  
  function resetCalculator() {
    currentStep = 1;
    currentValue = "";
    values = { paid: 0, bill: 0, change: 0 };
    
    valueSpans.forEach(span => span.textContent = "0");
    updateDisplay();
    updateBoxStates();
    
    nextBtn.style.display = "block";
    generateBtn.disabled = true;
    displayScreen.style.color = "#00ff00";
  }
  
  function checkPrintSettings() {
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || { enablePrint: true };
    if (settings.enablePrint) {
      printBtn.style.display = "inline-block";
    } else {
      printBtn.style.display = "none";
    }
  }
  
  function printReceipt() {
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {
      shopName: "Your Shop Name",
      shopAddress: "Shop Address",
      shopPhone: "Phone Number",
      shopEmail: "",
      design: "default"
    };
    
    const printWindow = window.open('', '_blank');
    const receiptHTML = generateReceiptHTML(settings);
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
  
  function generateReceiptHTML(settings) {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    
    const receiptData = {
      date: date,
      time: time,
      bill: values.bill,
      paid: values.paid,
      change: values.change
    };
    
    // Use different designs based on settings
    switch (settings.design) {
      case "modern":
        return generateModernReceipt(receiptData, settings);
      case "minimal":
        return generateMinimalReceipt(receiptData, settings);
      default:
        return generateDefaultReceipt(receiptData, settings);
    }
  }
  
  function generateDefaultReceipt(data, settings) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
            font-size: 12px;
          }
          .receipt {
            max-width: 300px;
            margin: 0 auto;
            border: 1px solid #000;
            padding: 15px;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .shop-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .shop-info {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .transaction-info {
            margin: 10px 0;
          }
          .line-item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total {
            border-top: 1px dashed #000;
            padding-top: 5px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 1px dashed #000;
            padding-top: 10px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="shop-name">${settings.shopName || 'Your Shop Name'}</div>
            <div class="shop-info">${settings.shopAddress || 'Shop Address'}</div>
            <div class="shop-info">Phone: ${settings.shopPhone || 'Phone Number'}</div>
            ${settings.shopEmail ? `<div class="shop-info">Email: ${settings.shopEmail}</div>` : ''}
          </div>
          
          <div class="transaction-info">
            <div class="line-item">
              <span>Date:</span>
              <span>${data.date}</span>
            </div>
            <div class="line-item">
              <span>Time:</span>
              <span>${data.time}</span>
            </div>
          </div>
          
          <div class="transaction-info">
            <div class="line-item">
              <span>Bill Amount:</span>
              <span>৳${data.bill.toFixed(2)}</span>
            </div>
            <div class="line-item">
              <span>Amount Paid:</span>
              <span>৳${data.paid.toFixed(2)}</span>
            </div>
            <div class="line-item total">
              <span>Change:</span>
              <span>৳${data.change.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <div>Thank you for your business!</div>
            <div>Powered by Zovatu</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  function generateModernReceipt(data, settings) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
            font-size: 12px;
          }
          .receipt {
            max-width: 320px;
            margin: 0 auto;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .shop-name {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
          }
          .shop-info {
            font-size: 11px;
            color: #7f8c8d;
            margin-bottom: 3px;
          }
          .transaction-section {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #34495e;
            margin-bottom: 10px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
          }
          .line-item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
          }
          .line-item:not(:last-child) {
            border-bottom: 1px dotted #bdc3c7;
          }
          .total {
            background: #3498db;
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            background: white;
            border-radius: 8px;
            padding: 15px;
            font-size: 11px;
            color: #7f8c8d;
          }
          .thank-you {
            font-size: 14px;
            color: #27ae60;
            font-weight: bold;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="shop-name">${settings.shopName || 'Your Shop Name'}</div>
            <div class="shop-info">${settings.shopAddress || 'Shop Address'}</div>
            <div class="shop-info">📞 ${settings.shopPhone || 'Phone Number'}</div>
            ${settings.shopEmail ? `<div class="shop-info">📧 ${settings.shopEmail}</div>` : ''}
          </div>
          
          <div class="transaction-section">
            <div class="section-title">Transaction Details</div>
            <div class="line-item">
              <span>📅 Date:</span>
              <span>${data.date}</span>
            </div>
            <div class="line-item">
              <span>🕐 Time:</span>
              <span>${data.time}</span>
            </div>
          </div>
          
          <div class="transaction-section">
            <div class="section-title">Payment Summary</div>
            <div class="line-item">
              <span>Bill Amount:</span>
              <span>৳${data.bill.toFixed(2)}</span>
            </div>
            <div class="line-item">
              <span>Amount Paid:</span>
              <span>৳${data.paid.toFixed(2)}</span>
            </div>
            <div class="total">
              <div class="line-item" style="margin: 0; border: none;">
                <span>Change Given:</span>
                <span>৳${data.change.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="thank-you">Thank you for your business! 🙏</div>
            <div>Powered by Zovatu Billing System</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  function generateMinimalReceipt(data, settings) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #000;
            font-size: 11px;
            line-height: 1.4;
          }
          .receipt {
            max-width: 280px;
            margin: 0 auto;
            padding: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .shop-name {
            font-size: 20px;
            font-weight: 300;
            letter-spacing: 2px;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .shop-info {
            font-size: 10px;
            color: #666;
            margin-bottom: 3px;
            font-weight: 300;
          }
          .divider {
            border-top: 1px solid #000;
            margin: 15px 0;
          }
          .transaction-info {
            margin: 15px 0;
          }
          .line-item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-weight: 300;
          }
          .line-item.total {
            font-weight: 600;
            font-size: 12px;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #000;
          }
          .footer {
            text-align: center;
            margin-top: 25px;
            font-size: 9px;
            color: #999;
            font-weight: 300;
          }
          .date-time {
            font-size: 10px;
            color: #666;
            text-align: center;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
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
          
          <div class="transaction-info">
            <div class="line-item">
              <span>BILL AMOUNT</span>
              <span>৳${data.bill.toFixed(2)}</span>
            </div>
            <div class="line-item">
              <span>AMOUNT PAID</span>
              <span>৳${data.paid.toFixed(2)}</span>
            </div>
            <div class="line-item total">
              <span>CHANGE</span>
              <span>৳${data.change.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <div>THANK YOU</div>
            <div style="margin-top: 5px;">ZOVATU</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
});

