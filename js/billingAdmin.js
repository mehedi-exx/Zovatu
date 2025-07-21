document.addEventListener("DOMContentLoaded", () => {
  // Initialize admin panel
  loadStats();
  loadSettings();
  updateShopControls();
  setDefaultDate();
  applyFilter();

  // Global functions for HTML onclick handlers
  window.openShop = openShop;
  window.closeShop = closeShop;
  window.updateDateFilter = updateDateFilter;
  window.applyFilter = applyFilter;
  window.resetFilter = resetFilter;
  window.printFilteredHistory = printFilteredHistory;
  window.printAllHistory = printAllHistory;
  window.saveShopDetails = saveShopDetails;
  window.savePrintSettings = savePrintSettings;
  window.exportData = exportData;
  window.importData = importData;
  window.autoBackup = autoBackup;
  window.clearAllData = clearAllData;
  window.closeModal = closeModal;
  window.saveModalShopDetails = saveModalShopDetails;
  window.closeShopDetailsModal = closeShopDetailsModal;

  function loadStats() {
    // Load today's sales
    const today = new Date().toISOString().split('T')[0];
    const todaySales = parseFloat(localStorage.getItem(`daily_${today}`)) || 0;
    document.getElementById("todaySales").textContent = `৳${todaySales.toFixed(2)}`;

    // Load this month's sales
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthSales = parseFloat(localStorage.getItem(`monthly_${currentMonth}`)) || 0;
    document.getElementById("monthSales").textContent = `৳${monthSales.toFixed(2)}`;

    // Load total transactions
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    document.getElementById("totalTransactions").textContent = salesHistory.length;
  }

  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {
      shopName: "",
      shopAddress: "",
      shopPhone: "",
      shopEmail: "",
      enablePrint: true,
      defaultPrintDesign: "default",
      defaultPaperSize: "thermal"
    };

    // Load shop details
    document.getElementById("shopName").value = settings.shopName || "";
    document.getElementById("shopAddress").value = settings.shopAddress || "";
    document.getElementById("shopPhone").value = settings.shopPhone || "";
    document.getElementById("shopEmail").value = settings.shopEmail || "";

    // Load print settings
    document.getElementById("enablePrint").checked = settings.enablePrint;
    document.getElementById("defaultPrintDesign").value = settings.defaultPrintDesign;
    document.getElementById("defaultPaperSize").value = settings.defaultPaperSize;
  }

  function updateShopControls() {
    const shopOpen = localStorage.getItem("shopOpen") === "true";
    const openBtn = document.getElementById("openShopBtn");
    const closeBtn = document.getElementById("closeShopBtn");

    if (shopOpen) {
      openBtn.disabled = true;
      openBtn.textContent = "🏪 Shop is Open";
      closeBtn.disabled = false;
      closeBtn.textContent = "🔒 Close Shop";
    } else {
      openBtn.disabled = false;
      openBtn.textContent = "🏪 Open Shop";
      closeBtn.disabled = true;
      closeBtn.textContent = "🔒 Shop is Closed";
    }
  }

  function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("filterDate").value = today;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById("filterMonth").value = currentMonth;
    
    const currentYear = new Date().getFullYear();
    document.getElementById("filterYear").value = currentYear;
  }

  function openShop() {
    localStorage.setItem("shopOpen", "true");
    localStorage.setItem("shopOpenTime", new Date().toISOString());
    updateShopControls();
    showNotification("Shop opened successfully! Ready for billing.", "success");
  }

  function closeShop() {
    showConfirmModal(
      "Close Shop",
      "Are you sure you want to close the shop? This will automatically backup today's data.",
      () => {
        // Close shop
        localStorage.setItem("shopOpen", "false");
        
        // Auto backup today's data
        const today = new Date().toISOString().split('T')[0];
        autoBackupDaily(today);
        
        updateShopControls();
        showNotification("Shop closed successfully! Daily data has been backed up.", "success");
        
        // Redirect to main billing tool after a delay
        setTimeout(() => {
          if (confirm("Shop has been closed. Would you like to return to the main billing tool?")) {
            window.location.href = "billingTool.html";
          }
        }, 2000);
      }
    );
  }

  function updateDateFilter() {
    const filterType = document.getElementById("filterType").value;
    
    // Hide all date groups
    document.getElementById("dateGroup").style.display = "none";
    document.getElementById("monthGroup").style.display = "none";
    document.getElementById("yearGroup").style.display = "none";
    document.getElementById("startDateGroup").style.display = "none";
    document.getElementById("endDateGroup").style.display = "none";

    // Show relevant date group
    switch (filterType) {
      case "daily":
        document.getElementById("dateGroup").style.display = "block";
        break;
      case "monthly":
        document.getElementById("monthGroup").style.display = "block";
        break;
      case "yearly":
        document.getElementById("yearGroup").style.display = "block";
        break;
      case "custom":
        document.getElementById("startDateGroup").style.display = "block";
        document.getElementById("endDateGroup").style.display = "block";
        break;
    }
  }

  function applyFilter() {
    const filterType = document.getElementById("filterType").value;
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    
    let filteredData = [];
    
    switch (filterType) {
      case "daily":
        const selectedDate = document.getElementById("filterDate").value;
        if (selectedDate) {
          filteredData = salesHistory.filter(transaction => 
            transaction.date === new Date(selectedDate).toLocaleDateString()
          );
        }
        break;
        
      case "monthly":
        const selectedMonth = document.getElementById("filterMonth").value;
        if (selectedMonth) {
          const [year, month] = selectedMonth.split('-');
          filteredData = salesHistory.filter(transaction => {
            const transactionDate = new Date(transaction.timestamp);
            return transactionDate.getFullYear() == year && 
                   (transactionDate.getMonth() + 1) == month;
          });
        }
        break;
        
      case "yearly":
        const selectedYear = document.getElementById("filterYear").value;
        if (selectedYear) {
          filteredData = salesHistory.filter(transaction => {
            const transactionDate = new Date(transaction.timestamp);
            return transactionDate.getFullYear() == selectedYear;
          });
        }
        break;
        
      case "custom":
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
          
          filteredData = salesHistory.filter(transaction => {
            const transactionDate = new Date(transaction.timestamp);
            return transactionDate >= start && transactionDate <= end;
          });
        }
        break;
    }
    
    displayHistory(filteredData);
  }

  function resetFilter() {
    document.getElementById("filterType").value = "daily";
    setDefaultDate();
    updateDateFilter();
    applyFilter();
  }

  function displayHistory(data) {
    const historyContent = document.getElementById("historyContent");
    
    if (data.length === 0) {
      historyContent.innerHTML = '<div class="no-data">No sales data found for the selected period.</div>';
      return;
    }

    // Calculate totals
    const totalSales = data.reduce((sum, transaction) => sum + transaction.bill, 0);
    const totalPaid = data.reduce((sum, transaction) => sum + transaction.paid, 0);
    const totalChange = data.reduce((sum, transaction) => sum + transaction.change, 0);

    let html = `
      <div style="background: #2a2a2a; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #444;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; text-align: center;">
          <div>
            <div style="font-size: 18px; font-weight: 700; color: #4CAF50;">৳${totalSales.toFixed(2)}</div>
            <div style="font-size: 12px; color: #888; text-transform: uppercase;">Total Sales</div>
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 700; color: #2196F3;">৳${totalPaid.toFixed(2)}</div>
            <div style="font-size: 12px; color: #888; text-transform: uppercase;">Total Paid</div>
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 700; color: #FF9800;">৳${totalChange.toFixed(2)}</div>
            <div style="font-size: 12px; color: #888; text-transform: uppercase;">Total Change</div>
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 700; color: #9C27B0;">${data.length}</div>
            <div style="font-size: 12px; color: #888; text-transform: uppercase;">Transactions</div>
          </div>
        </div>
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
    `;

    data.forEach(transaction => {
      html += `
        <tr>
          <td>${transaction.date}</td>
          <td>${transaction.time}</td>
          <td>৳${transaction.bill.toFixed(2)}</td>
          <td>৳${transaction.paid.toFixed(2)}</td>
          <td>৳${transaction.change.toFixed(2)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    historyContent.innerHTML = html;
  }

  function printFilteredHistory() {
    const filterType = document.getElementById("filterType").value;
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    
    let filteredData = [];
    let periodTitle = "";
    
    switch (filterType) {
      case "daily":
        const selectedDate = document.getElementById("filterDate").value;
        if (selectedDate) {
          filteredData = salesHistory.filter(transaction => 
            transaction.date === new Date(selectedDate).toLocaleDateString()
          );
          periodTitle = `Daily Report - ${new Date(selectedDate).toLocaleDateString()}`;
        }
        break;
        
      case "monthly":
        const selectedMonth = document.getElementById("filterMonth").value;
        if (selectedMonth) {
          const [year, month] = selectedMonth.split('-');
          filteredData = salesHistory.filter(transaction => {
            const transactionDate = new Date(transaction.timestamp);
            return transactionDate.getFullYear() == year && 
                   (transactionDate.getMonth() + 1) == month;
          });
          periodTitle = `Monthly Report - ${new Date(selectedMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
        }
        break;
        
      case "yearly":
        const selectedYear = document.getElementById("filterYear").value;
        if (selectedYear) {
          filteredData = salesHistory.filter(transaction => {
            const transactionDate = new Date(transaction.timestamp);
            return transactionDate.getFullYear() == selectedYear;
          });
          periodTitle = `Yearly Report - ${selectedYear}`;
        }
        break;
        
      case "custom":
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          
          filteredData = salesHistory.filter(transaction => {
            const transactionDate = new Date(transaction.timestamp);
            return transactionDate >= start && transactionDate <= end;
          });
          periodTitle = `Custom Report - ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
        }
        break;
    }
    
    if (filteredData.length === 0) {
      showNotification("No data found for the selected period.", "error");
      return;
    }
    
    printSalesReport(filteredData, periodTitle);
  }

  function printAllHistory() {
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    
    if (salesHistory.length === 0) {
      showNotification("No sales history found.", "error");
      return;
    }
    
    printSalesReport(salesHistory, "Complete Sales History");
  }

  function printSalesReport(data, title) {
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {
      shopName: "Your Shop Name",
      shopAddress: "Shop Address",
      shopPhone: "Phone Number",
      shopEmail: ""
    };

    // Calculate totals
    const totalSales = data.reduce((sum, transaction) => sum + transaction.bill, 0);
    const totalPaid = data.reduce((sum, transaction) => sum + transaction.paid, 0);
    const totalChange = data.reduce((sum, transaction) => sum + transaction.change, 0);

    const printWindow = window.open('', '_blank');
    const reportHTML = generateSalesReportHTML(data, title, settings, {
      totalSales,
      totalPaid,
      totalChange,
      totalTransactions: data.length
    });
    
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  function generateSalesReportHTML(data, title, settings, totals) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
            font-size: 12px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .shop-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .shop-info {
            font-size: 12px;
            margin-bottom: 5px;
          }
          .report-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            background: #f5f5f5;
            padding: 10px;
            border: 1px solid #ddd;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
            background: #f9f9f9;
            padding: 15px;
            border: 1px solid #ddd;
          }
          .summary-item {
            text-align: center;
          }
          .summary-value {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
          }
          .summary-label {
            font-size: 10px;
            color: #7f8c8d;
            text-transform: uppercase;
            margin-top: 5px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .table th,
          .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .table th {
            background: #f5f5f5;
            font-weight: bold;
            text-align: center;
          }
          .table td {
            text-align: center;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #7f8c8d;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          .generated-info {
            margin-top: 20px;
            font-size: 10px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">${settings.shopName || 'Your Shop Name'}</div>
          <div class="shop-info">${settings.shopAddress || 'Shop Address'}</div>
          <div class="shop-info">Phone: ${settings.shopPhone || 'Phone Number'}</div>
          ${settings.shopEmail ? `<div class="shop-info">Email: ${settings.shopEmail}</div>` : ''}
        </div>
        
        <div class="report-title">${title}</div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">৳${totals.totalSales.toFixed(2)}</div>
            <div class="summary-label">Total Sales</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">৳${totals.totalPaid.toFixed(2)}</div>
            <div class="summary-label">Total Paid</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">৳${totals.totalChange.toFixed(2)}</div>
            <div class="summary-label">Total Change</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${totals.totalTransactions}</div>
            <div class="summary-label">Transactions</div>
          </div>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Date</th>
              <th>Time</th>
              <th>Bill Amount</th>
              <th>Amount Paid</th>
              <th>Change Given</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((transaction, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${transaction.date}</td>
                <td>${transaction.time}</td>
                <td>৳${transaction.bill.toFixed(2)}</td>
                <td>৳${transaction.paid.toFixed(2)}</td>
                <td>৳${transaction.change.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <div>Thank you for using Zovatu Billing System</div>
          <div class="generated-info">
            Report generated on: ${new Date().toLocaleString()}<br>
            Total records: ${data.length}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  function saveShopDetails() {
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {};
    
    settings.shopName = document.getElementById("shopName").value;
    settings.shopAddress = document.getElementById("shopAddress").value;
    settings.shopPhone = document.getElementById("shopPhone").value;
    settings.shopEmail = document.getElementById("shopEmail").value;
    
    localStorage.setItem("billingSettings", JSON.stringify(settings));
    showNotification("Shop details saved successfully!", "success");
  }

  function savePrintSettings() {
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {};
    
    settings.enablePrint = document.getElementById("enablePrint").checked;
    settings.defaultPrintDesign = document.getElementById("defaultPrintDesign").value;
    settings.defaultPaperSize = document.getElementById("defaultPaperSize").value;
    
    localStorage.setItem("billingSettings", JSON.stringify(settings));
    showNotification("Print settings saved successfully!", "success");
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

  function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          if (importData.salesHistory) {
            localStorage.setItem("salesHistory", JSON.stringify(importData.salesHistory));
          }
          
          if (importData.settings) {
            localStorage.setItem("billingSettings", JSON.stringify(importData.settings));
          }
          
          // Reload the page to reflect changes
          showNotification("Data imported successfully! Reloading page...", "success");
          setTimeout(() => {
            location.reload();
          }, 2000);
          
        } catch (error) {
          showNotification("Error importing data. Please check the file format.", "error");
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }

  function autoBackup() {
    const today = new Date().toISOString().split('T')[0];
    autoBackupDaily(today);
    showNotification("Auto backup completed successfully!", "success");
  }

  function autoBackupDaily(date) {
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {};
    
    // Filter data for the specific date
    const dailyData = salesHistory.filter(transaction => 
      transaction.date === new Date(date).toLocaleDateString()
    );
    
    const backupData = {
      date: date,
      salesHistory: dailyData,
      settings: settings,
      backupDate: new Date().toISOString(),
      type: "daily_backup"
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `zovatu-daily-backup-${date}.json`;
    link.click();
  }

  function clearAllData() {
    showConfirmModal(
      "Clear All Data",
      "Are you sure you want to clear all sales data? This action cannot be undone. It's recommended to export your data first.",
      () => {
        localStorage.removeItem("salesHistory");
        
        // Clear daily and monthly totals
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith("daily_") || key.startsWith("monthly_")) {
            localStorage.removeItem(key);
          }
        });
        
        loadStats();
        applyFilter();
        showNotification("All sales data cleared successfully!", "success");
      }
    );
  }

  function showConfirmModal(title, message, onConfirm) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;
    document.getElementById("confirmYes").onclick = () => {
      onConfirm();
      closeModal();
    };
    document.getElementById("confirmModal").style.display = "block";
  }

  function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
  }

  function saveModalShopDetails() {
    const settings = JSON.parse(localStorage.getItem("billingSettings")) || {};
    
    settings.shopName = document.getElementById("modalShopName").value;
    settings.shopAddress = document.getElementById("modalShopAddress").value;
    settings.shopPhone = document.getElementById("modalShopPhone").value;
    settings.shopEmail = document.getElementById("modalShopEmail").value;
    
    localStorage.setItem("billingSettings", JSON.stringify(settings));
    closeShopDetailsModal();
    loadSettings();
    showNotification("Shop details saved successfully!", "success");
  }

  function closeShopDetailsModal() {
    document.getElementById("shopDetailsModal").style.display = "none";
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
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
    }, 4000);
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

  // Auto-refresh stats every 30 seconds
  setInterval(loadStats, 30000);
});

