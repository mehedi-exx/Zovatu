// Print Design Templates for Zovatu Billing System

export const printDesigns = {
  default: {
    name: "Default Design",
    generateHTML: (data, settings) => {
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
  },

  modern: {
    name: "Modern Design",
    generateHTML: (data, settings) => {
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
  },

  minimal: {
    name: "Minimal Design",
    generateHTML: (data, settings) => {
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
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { printDesigns };
}

