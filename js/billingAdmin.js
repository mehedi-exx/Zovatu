document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const dailySalesEl = document.getElementById("dailySales");
  const monthlySalesEl = document.getElementById("monthlySales");
  const totalTransactionsEl = document.getElementById("totalTransactions");
  const filterTypeEl = document.getElementById("filterType");
  const selectedDateEl = document.getElementById("selectedDate");
  const selectedMonthEl = document.getElementById("selectedMonth");
  const selectedYearEl = document.getElementById("selectedYear");
  const fromDateEl = document.getElementById("fromDate");
  const toDateEl = document.getElementById("toDate");
  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const historyContentEl = document.getElementById("historyContent");
  const printHistoryBtn = document.getElementById("printHistoryBtn");
  
  // Settings elements
  const shopNameEl = document.getElementById("shopName");
  const shopAddressEl = document.getElementById("shopAddress");
  const shopPhoneEl = document.getElementById("shopPhone");
  const shopEmailEl = document.getElementById("shopEmail");
  const printToggleEl = document.getElementById("printToggle");
  const printDesignEl = document.getElementById("printDesign");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  
  // Data management buttons
  const exportDataBtn = document.getElementById("exportDataBtn");
  const backupDataBtn = document.getElementById("backupDataBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");
  
  let currentFilteredData = [];
  
  // Initialize
  loadSettings();
  updateSummaryStats();
  setupFilterHandlers();
  setupEventListeners();
  applyCurrentFilter();
  
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {
      shopName: "Your Shop Name",
      shopAddress: "Shop Address",
      shopPhone: "Phone Number",
      shopEmail: "shop@example.com",
      enablePrint: true,
      design: "default"
    };
    
    shopNameEl.value = settings.shopName || "";
    shopAddressEl.value = settings.shopAddress || "";
    shopPhoneEl.value = settings.shopPhone || "";
    shopEmailEl.value = settings.shopEmail || "";
    printToggleEl.value = settings.enablePrint ? "true" : "false";
    printDesignEl.value = settings.design || "default";
  }
  
  function saveSettings() {
    const settings = {
      shopName: shopNameEl.value,
      shopAddress: shopAddressEl.value,
      shopPhone: shopPhoneEl.value,
      shopEmail: shopEmailEl.value,
      enablePrint: printToggleEl.value === "true",
      design: printDesignEl.value
    };
    
    localStorage.setItem("billingSettings", JSON.stringify(settings));
    showNotification("Settings saved successfully!", "success");
  }
  
  function updateSummaryStats() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const dailyTotal = parseFloat(localStorage.getItem(`daily_${today}`)) || 0;
    const monthlyTotal = parseFloat(localStorage.getItem(`monthly_${currentMonth}`)) || 0;
    
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    const totalTransactions = salesHistory.length;
    
    dailySalesEl.textContent = `৳${dailyTotal.toFixed(2)}`;
    monthlySalesEl.textContent = `৳${monthlyTotal.toFixed(2)}`;
    totalTransactionsEl.textContent = totalTransactions;
  }
  
  function setupFilterHandlers() {
    filterTypeEl.addEventListener("change", () => {
      const filterType = filterTypeEl.value;
      
      // Hide all filter groups
      document.getElementById("dateGroup").style.display = "none";
      document.getElementById("monthGroup").style.display = "none";
      document.getElementById("yearGroup").style.display = "none";
      document.getElementById("customFromGroup").style.display = "none";
      document.getElementById("customToGroup").style.display = "none";
      
      // Show relevant filter group
      switch (filterType) {
        case "daily":
          document.getElementById("dateGroup").style.display = "flex";
          selectedDateEl.value = new Date().toISOString().split('T')[0];
          break;
        case "monthly":
          document.getElementById("monthGroup").style.display = "flex";
          selectedMonthEl.value = new Date().toISOString().slice(0, 7);
          break;
        case "yearly":
          document.getElementById("yearGroup").style.display = "flex";
          selectedYearEl.value = new Date().getFullYear();
          break;
        case "custom":
          document.getElementById("customFromGroup").style.display = "flex";
          document.getElementById("customToGroup").style.display = "flex";
          break;
      }
    });
    
    // Set default date
    selectedDateEl.value = new Date().toISOString().split('T')[0];
  }
  
  function setupEventListeners() {
    applyFilterBtn.addEventListener("click", applyCurrentFilter);
    printHistoryBtn.addEventListener("click", printSalesHistory);
    saveSettingsBtn.addEventListener("click", saveSettings);
    exportDataBtn.addEventListener("click", exportData);
    backupDataBtn.addEventListener("click", backupData);
    clearDataBtn.addEventListener("click", clearAllData);
  }
  
  function applyCurrentFilter() {
    const filterType = filterTypeEl.value;
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    
    let filteredData = [];
    
    switch (filterType) {
      case "daily":
        const selectedDate = selectedDateEl.value;
        filteredData = salesHistory.filter(record => record.date === selectedDate);
        break;
        
      case "monthly":
        const selectedMonth = selectedMonthEl.value;
        filteredData = salesHistory.filter(record => record.date.startsWith(selectedMonth));
        break;
        
      case "yearly":
        const selectedYear = selectedYearEl.value;
        filteredData = salesHistory.filter(record => record.date.startsWith(selectedYear));
        break;
        
      case "custom":
        const fromDate = fromDateEl.value;
        const toDate = toDateEl.value;
        if (fromDate && toDate) {
          filteredData = salesHistory.filter(record => {
            return record.date >= fromDate && record.date <= toDate;
          });
        }
        break;
        
      default:
        filteredData = salesHistory;
    }
    
    currentFilteredData = filteredData;
    displaySalesHistory(filteredData);
  }
  
  function displaySalesHistory(data) {
    if (data.length === 0) {
      historyContentEl.innerHTML = '<div class="no-data">No sales data found for the selected period.</div>';
      return;
    }
    
    const totalAmount = data.reduce((sum, record) => sum + record.bill, 0);
    
    const tableHTML = `
      <div style="margin-bottom: 15px; color: #FFA500; font-weight: 600;">
        Total Records: ${data.length} | Total Amount: ৳${totalAmount.toFixed(2)}
      </div>
      <table class="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Bill Amount</th>
            <th>Amount Paid</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(record => `
            <tr>
              <td>${record.date}</td>
              <td>${record.time}</td>
              <td>৳${record.bill.toFixed(2)}</td>
              <td>৳${record.paid.toFixed(2)}</td>
              <td>৳${record.change.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    historyContentEl.innerHTML = tableHTML;
  }
  
  function printSalesHistory() {
    if (currentFilteredData.length === 0) {
      showNotification("No data to print!", "error");
      return;
    }
    
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {
      shopName: "Your Shop Name",
      shopAddress: "Shop Address",
      shopPhone: "Phone Number"
    };
    
    const printWindow = window.open('', '_blank');
    const printHTML = generateHistoryPrintHTML(currentFilteredData, settings);
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
  
  function generateHistoryPrintHTML(data, settings) {
    const totalAmount = data.reduce((sum, record) => sum + record.bill, 0);
    const filterType = filterTypeEl.value;
    let periodText = "";
    
    switch (filterType) {
      case "daily":
        periodText = `Daily Report - ${selectedDateEl.value}`;
        break;
      case "monthly":
        periodText = `Monthly Report - ${selectedMonthEl.value}`;
        break;
      case "yearly":
        periodText = `Yearly Report - ${selectedYearEl.value}`;
        break;
      case "custom":
        periodText = `Custom Report - ${fromDateEl.value} to ${toDateEl.value}`;
        break;
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales History Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .shop-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .shop-info {
            font-size: 14px;
            margin-bottom: 2px;
          }
          .report-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .summary {
            background: #f5f5f5;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
          }
          .summary-item {
            display: inline-block;
            margin-right: 30px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background: #f5f5f5;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">${settings.shopName || 'Your Shop Name'}</div>
          <div class="shop-info">${settings.shopAddress || 'Shop Address'}</div>
          <div class="shop-info">Phone: ${settings.shopPhone || 'Phone Number'}</div>
        </div>
        
        <div class="report-title">${periodText}</div>
        
        <div class="summary">
          <div class="summary-item">Total Transactions: ${data.length}</div>
          <div class="summary-item">Total Sales: ৳${totalAmount.toFixed(2)}</div>
          <div class="summary-item">Generated: ${new Date().toLocaleString()}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Bill Amount</th>
              <th>Amount Paid</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(record => `
              <tr>
                <td>${record.date}</td>
                <td>${record.time}</td>
                <td>৳${record.bill.toFixed(2)}</td>
                <td>৳${record.paid.toFixed(2)}</td>
                <td>৳${record.change.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <div>Report generated by Zovatu Billing System</div>
          <div>© ${new Date().getFullYear()} - All rights reserved</div>
        </div>
      </body>
      </html>
    `;
  }
  
  function exportData() {
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {};
    
    const exportData = {
      salesHistory,
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `zovatu-billing-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification("Data exported successfully!", "success");
  }
  
  function backupData() {
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {};
    
    // Create CSV format for easy viewing
    let csvContent = "Date,Time,Bill Amount,Amount Paid,Change\\n";
    salesHistory.forEach(record => {
      csvContent += `${record.date},${record.time},${record.bill},${record.paid},${record.change}\\n`;
    });
    
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvBlob);
    link.download = `zovatu-billing-backup-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification("Backup created successfully!", "success");
  }
  
  function clearAllData() {
    if (confirm("Are you sure you want to clear all sales data? This action cannot be undone.")) {
      localStorage.removeItem("salesHistory");
      
      // Clear daily and monthly totals
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("daily_") || key.startsWith("monthly_")) {
          localStorage.removeItem(key);
        }
      });
      
      updateSummaryStats();
      applyCurrentFilter();
      showNotification("All data cleared successfully!", "success");
    }
  }
  
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
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
});

