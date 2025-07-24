# Zovatu Smart Billing Tool - User Manual

## Table of Contents

1. [Getting Started](#getting-started)
2. [Login and Authentication](#login-and-authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Shop Management](#shop-management)
5. [Product Management](#product-management)
6. [Billing System](#billing-system)
7. [Invoice Management](#invoice-management)
8. [Admin Panel](#admin-panel)
9. [Reports and Analytics](#reports-and-analytics)
10. [Settings and Configuration](#settings-and-configuration)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## Getting Started

### System Requirements
- Modern web browser (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- JavaScript enabled
- Local Storage enabled
- Minimum screen resolution: 320px width

### Installation
1. Extract the Zovatu Smart Billing Tool files
2. Open `index.html` in your web browser
3. Use demo credentials to get started

### Demo Credentials
- **Administrator**: 
  - Username: `admin`
  - Password: `admin123`
- **Regular User**: 
  - Username: `mehedi`
  - Password: `mehedi123`

---

## Login and Authentication

### Logging In
1. Open the application in your web browser
2. Enter your username and password
3. Click "Sign In" or use the demo buttons for quick access
4. Check "Remember me" to stay logged in

### Password Security
- Use strong passwords with at least 8 characters
- Include uppercase, lowercase, numbers, and special characters
- Change passwords regularly
- Don't share credentials with unauthorized users

### Session Management
- Sessions automatically expire after inactivity
- You'll be redirected to login if your session expires
- Use "Remember me" for convenience on trusted devices

---

## Dashboard Overview

### Main Dashboard Features
- **Quick Stats**: Today's sales, total orders, customers, and products
- **Sales Overview**: Graphical representation of sales trends
- **Quick Actions**: New Sale, View Reports buttons
- **Navigation Menu**: Access to all modules

### Navigation
- **Dashboard**: Main overview page
- **Billing Tool**: Access billing functionality
- **Admin Panel**: Administrative functions
- **Field Manager**: Product and inventory management
- **Tutorial**: Help and guidance

### User Profile
- Access profile settings from the top-right menu
- Update personal information
- Change password
- Logout option

---

## Shop Management

### Creating a New Shop
1. Go to Billing Tool
2. Click "Create New Shop"
3. Fill in shop details:
   - Shop name
   - Business type
   - Address
   - Phone number
   - Email address
4. Configure shop settings:
   - Currency
   - Tax rate
   - Default discount
5. Click "Create Shop"

### Managing Existing Shops
1. Click "Select Shop" in the billing tool
2. Choose from existing shops
3. Edit shop details by clicking the edit icon
4. Activate/deactivate shops as needed

### Shop Settings
- **Currency**: Set default currency for the shop
- **Tax Rate**: Configure tax percentage
- **Discount Rate**: Set default discount percentage
- **Business Hours**: Set operating hours
- **Contact Information**: Update contact details

---

## Product Management

### Adding Products
1. Navigate to the billing tool
2. Select a shop
3. Click "Add Product" or use the product management interface
4. Fill in product details:
   - Product name
   - SKU (Stock Keeping Unit)
   - Barcode (auto-generated if not provided)
   - Category
   - Price
   - Cost
   - Stock quantity
   - Unit of measurement

### Product Categories
- Create custom categories for better organization
- Assign products to categories
- Filter products by category
- Manage category hierarchy

### Barcode Management
- Automatic barcode generation for new products
- Support for multiple barcode formats (CODE128, EAN-13, etc.)
- Print product labels with barcodes
- Scan barcodes for quick product lookup

### Stock Management
- Track current stock levels
- Set low-stock alerts
- Update stock quantities
- View stock movement history

---

## Billing System

### Billing Modes

#### Simple Mode
- Calculator-style interface
- Quick transactions for known amounts
- Three-step process:
  1. Enter amount received from customer
  2. Enter total bill amount
  3. Calculate and display change
- Generate receipt with minimal details

#### Ultra Mode
- Full-featured billing system
- Product search and selection
- Shopping cart functionality
- Real-time calculations
- Comprehensive invoice generation

### Using Simple Mode
1. Select "Simple Mode" in the billing tool
2. Enter the amount received from customer
3. Click "Next"
4. Enter the total bill amount
5. Click "Next" to see change amount
6. Click "Generate" to create receipt

### Using Ultra Mode
1. Select "Ultra Mode" in the billing tool
2. Search for products by name, SKU, or barcode
3. Add products to cart
4. Adjust quantities as needed
5. Apply discounts or taxes
6. Select payment method
7. Process payment and generate invoice

### Payment Methods
- Cash
- Credit Card
- Debit Card
- Digital Wallet
- Bank Transfer
- Custom payment methods

### Discounts and Taxes
- Apply percentage or fixed amount discounts
- Automatic tax calculation based on shop settings
- Item-level or invoice-level discounts
- Tax-inclusive or tax-exclusive pricing

---

## Invoice Management

### Invoice Generation
- Automatic invoice numbering
- Professional invoice templates
- Customer information capture
- Itemized billing with totals
- Tax and discount breakdowns

### Invoice Templates
1. **Standard**: Professional business invoice
2. **Thermal**: Optimized for thermal printers
3. **Minimal**: Simple receipt format
4. **Detailed**: Comprehensive invoice with terms

### Printing Options
- Print directly from browser
- PDF export for digital sharing
- Thermal printer support
- Custom paper sizes
- Batch printing capabilities

### Invoice History
- View all generated invoices
- Search invoices by number, date, or customer
- Reprint previous invoices
- Export invoice data

---

## Admin Panel

### Business Overview
- Total shops, revenue, transactions, and users
- Revenue trends and analytics
- Performance metrics
- Growth indicators

### Shop Management
- View all shops
- Edit shop details
- Activate/deactivate shops
- Shop performance analytics

### Product Management
- Bulk product operations
- Category management
- Stock level monitoring
- Product performance reports

### Sales Analytics
- Daily, weekly, monthly, and yearly reports
- Sales trends and patterns
- Top-selling products
- Customer analytics

### User Management
- Add/remove users
- Assign roles and permissions
- User activity monitoring
- Access control settings

### Reports
- Generate comprehensive reports
- Export data to Excel/PDF
- Custom date range selection
- Automated report scheduling

### Settings
- System configuration
- Backup and restore
- Security settings
- Integration options

---

## Reports and Analytics

### Sales Reports
- **Daily Sales**: Today's transaction summary
- **Weekly Sales**: 7-day sales overview
- **Monthly Sales**: Monthly performance analysis
- **Yearly Sales**: Annual business review

### Product Reports
- **Top Selling Products**: Best performers
- **Low Stock Alert**: Products needing restock
- **Product Performance**: Sales by product
- **Category Analysis**: Performance by category

### Financial Reports
- **Revenue Analysis**: Income trends
- **Profit Margins**: Profitability analysis
- **Tax Reports**: Tax collection summary
- **Payment Method Analysis**: Payment preferences

### Custom Reports
- Select custom date ranges
- Filter by shop, product, or category
- Export reports in multiple formats
- Schedule automated reports

---

## Settings and Configuration

### General Settings
- **Language**: Interface language selection
- **Currency**: Default currency settings
- **Date Format**: Date display preferences
- **Number Format**: Number formatting options

### Shop Settings
- **Business Information**: Company details
- **Tax Configuration**: Tax rates and rules
- **Discount Policies**: Default discount settings
- **Invoice Settings**: Invoice templates and numbering

### User Preferences
- **Theme**: Light/dark mode selection
- **Notifications**: Alert preferences
- **Default Shop**: Auto-select shop on login
- **Dashboard Layout**: Customize dashboard widgets

### Security Settings
- **Password Policy**: Password requirements
- **Session Timeout**: Auto-logout settings
- **Access Control**: User permissions
- **Audit Logs**: Activity tracking

### Backup and Restore
- **Manual Backup**: Export all data
- **Automatic Backup**: Scheduled backups
- **Data Import**: Import from other systems
- **Reset Options**: Clear all data

---

## Troubleshooting

### Common Issues

#### Login Problems
**Problem**: Cannot log in with correct credentials
**Solution**: 
1. Clear browser cache and cookies
2. Ensure JavaScript is enabled
3. Try incognito/private browsing mode
4. Check for browser updates

#### Data Not Saving
**Problem**: Changes are not being saved
**Solution**:
1. Check browser storage settings
2. Ensure sufficient storage space
3. Disable browser extensions temporarily
4. Try a different browser

#### Print Issues
**Problem**: Invoices not printing correctly
**Solution**:
1. Check printer settings and drivers
2. Verify browser print permissions
3. Try different invoice templates
4. Use PDF export as alternative

#### Performance Issues
**Problem**: Application running slowly
**Solution**:
1. Close unnecessary browser tabs
2. Clear browser cache
3. Disable browser extensions
4. Restart the browser

### Browser Compatibility
- **Chrome**: Recommended browser, full feature support
- **Firefox**: Good compatibility, regular testing
- **Safari**: Compatible with minor limitations
- **Edge**: Full support on recent versions

### Mobile Issues
- **Touch Responsiveness**: Ensure touch events are working
- **Screen Size**: Some features optimized for larger screens
- **Keyboard**: Use on-screen keyboard for input
- **Orientation**: Both portrait and landscape supported

---

## FAQ

### General Questions

**Q: Is internet connection required?**
A: No, the application works offline. All data is stored locally in your browser.

**Q: Can I use this on multiple devices?**
A: Each device maintains its own data. For data synchronization, you'll need to export/import data manually.

**Q: How secure is my data?**
A: All data is stored locally on your device. No data is transmitted to external servers.

**Q: Can I customize the invoice templates?**
A: Yes, you can modify the templates or create custom ones by editing the template files.

### Technical Questions

**Q: What browsers are supported?**
A: Modern browsers with ES6+ support: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+.

**Q: How much data can I store?**
A: Limited by browser's local storage capacity, typically 5-10MB per domain.

**Q: Can I integrate with other systems?**
A: The application supports data export/import. Custom integrations require development work.

**Q: Is there a mobile app?**
A: Currently web-based only, but the responsive design works well on mobile devices.

### Business Questions

**Q: Can I manage multiple shops?**
A: Yes, the system supports unlimited shops with individual settings and data.

**Q: How do I backup my data?**
A: Use the backup feature in settings to export all data as JSON files.

**Q: Can multiple users access the same data?**
A: Currently, each browser session maintains separate data. Multi-user access requires shared device or data export/import.

**Q: Is there customer support?**
A: Documentation and guides are provided. For technical support, contact support@zovatu.com.

---

## Contact and Support

### Getting Help
- **Documentation**: This user manual and README.md
- **Technical Issues**: Check troubleshooting section first
- **Feature Requests**: Contact development team
- **Bug Reports**: Provide detailed steps to reproduce

### Contact Information
- **Email**: support@zovatu.com
- **Website**: [Zovatu Official Website]
- **Documentation**: Latest guides and updates

### Community
- **User Forums**: Share tips and get help from other users
- **Feature Discussions**: Suggest and vote on new features
- **Best Practices**: Learn from experienced users

---

**© 2024 Zovatu. All rights reserved.**

*This manual is for Zovatu Smart Billing Tool v2.0 Professional Edition. For the latest version of this manual, visit our website or check for updates within the application.*

