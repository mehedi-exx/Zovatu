# Zovatu Smart Billing Tool

**Version 2.0** - A comprehensive, professional billing and inventory management system designed for small to medium businesses.

## 🌟 Overview

Zovatu Smart Billing Tool is a powerful, client-side billing software that transforms your business operations with advanced features including shop management, product inventory, invoice generation, barcode support, and comprehensive reporting. Built with modern web technologies, it offers a seamless experience across all devices while maintaining data security through local storage.

## ✨ Key Features

### 🏪 Multi-Shop Management
- Create and manage multiple shops from a single interface
- Individual data isolation for each shop
- Shop-specific settings and customization
- Easy shop switching with preserved data integrity

### 📦 Advanced Product Management
- Comprehensive product catalog with categories and brands
- Real-time inventory tracking with low-stock alerts
- Barcode generation and scanning support
- Bulk import/export functionality
- Product search and filtering capabilities

### 🧾 Professional Invoice System
- Multiple invoice templates (Default, Minimal, Colorful)
- Customizable invoice designs with shop branding
- QR code integration for digital receipts
- Print-ready formats for thermal and standard printers
- Invoice history and search functionality

### 👥 Salesman Management
- Role-based access control with permission templates
- Performance tracking and sales analytics
- Individual salesman statistics and reporting
- Flexible permission system (Cashier, Sales Associate, Manager)

### 📊 Advanced Reporting
- Real-time sales analytics and performance metrics
- Daily, weekly, monthly, and yearly reports
- Top-selling products and customer analysis
- Profit margin calculations and inventory valuation
- Visual charts and graphs for data insights

### 🔧 Customization & Settings
- Flexible invoice templates and branding options
- Custom field management for products and customers
- Print settings and paper size configurations
- Backup and restore functionality
- Multi-language support preparation

### 📱 Modern User Interface
- Responsive design for desktop, tablet, and mobile
- Intuitive navigation with professional styling
- Dark/light theme support
- Touch-friendly interface for point-of-sale use
- Keyboard shortcuts for efficient operation

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or database installation required
- Works offline after initial load

### Installation

1. **Download the Package**
   ```bash
   # Extract the Zovatu-main.zip file to your desired location
   unzip Zovatu-main.zip
   cd Zovatu-main
   ```

2. **Local Development Server (Optional)**
   ```bash
   # For local testing, start a simple HTTP server
   python3 -m http.server 8080
   # Or use Node.js
   npx http-server -p 8080
   ```

3. **GitHub Pages Deployment**
   - Upload files to your GitHub repository
   - Enable GitHub Pages in repository settings
   - Access via `https://yourusername.github.io/repository-name`

### First Time Setup

1. **Access the Application**
   - Open `index.html` in your web browser
   - Use default credentials: `admin` / `admin123`

2. **Create Your First Shop**
   - Navigate to "Billing Tool" from the sidebar
   - Fill in shop details (name, address, phone)
   - Upload shop logo (optional)
   - Click "Create Shop"

3. **Add Products**
   - Go to "Products" tab in the billing dashboard
   - Click "Add Product" to create your inventory
   - Generate barcodes for products if needed

4. **Start Billing**
   - Use the "Billing" tab for point-of-sale operations
   - Add products to cart and process payments
   - Print invoices and receipts

## 📖 Detailed Usage Guide

### Shop Management

The multi-shop feature allows you to manage different business locations or departments separately. Each shop maintains its own:

- Product inventory and pricing
- Customer database and transaction history
- Salesman accounts and permissions
- Settings and customization preferences
- Invoice numbering and templates

To switch between shops, use the "Switch Shop" button in the billing dashboard. All data remains isolated and secure for each shop.

### Product Management

The product management system provides comprehensive inventory control:

**Adding Products:**
1. Navigate to the Products section
2. Click "Add Product" button
3. Fill in required information:
   - Product name and description
   - Unique product code
   - Purchase and selling prices
   - Stock quantity and units
   - Category and brand information
   - Barcode (auto-generated if empty)

**Inventory Tracking:**
- Real-time stock updates with each sale
- Low stock alerts when inventory falls below minimum levels
- Stock adjustment capabilities for manual corrections
- Inventory valuation and profit margin calculations

**Barcode Support:**
- Multiple barcode formats (CODE128, EAN-13, EAN-8, UPC, CODE39)
- Automatic barcode generation for new products
- Barcode label printing for inventory management
- Barcode scanning integration (camera-based)

### Invoice and Billing

The billing system offers flexible invoice creation and management:

**Creating Invoices:**
1. Select products from inventory or use quick sale
2. Adjust quantities and apply discounts
3. Add customer information (optional)
4. Choose payment method
5. Generate and print invoice

**Invoice Templates:**
- **Default Template:** Professional design with company branding
- **Minimal Template:** Clean, simple layout for basic receipts
- **Colorful Template:** Eye-catching design with brand colors

**Payment Processing:**
- Multiple payment methods (Cash, Card, Mobile Banking, Bank Transfer)
- Split payments and change calculation
- Credit sales with due tracking
- Payment history and reconciliation

### Salesman Management

Control access and track performance with the salesman management system:

**Permission Templates:**
- **Cashier:** Basic billing and receipt printing
- **Sales Associate:** Full billing with product management
- **Manager:** Complete access including reports and settings

**Performance Tracking:**
- Individual sales statistics and targets
- Commission calculations and reporting
- Activity logs and audit trails
- Performance comparisons and rankings

### Reporting and Analytics

Comprehensive reporting provides business insights:

**Sales Reports:**
- Daily, weekly, monthly, and yearly summaries
- Sales by product, category, and salesman
- Payment method analysis and trends
- Customer purchase patterns and loyalty metrics

**Inventory Reports:**
- Stock levels and movement analysis
- Low stock and overstock identification
- Product performance and profitability
- Supplier and purchase order tracking

**Financial Reports:**
- Profit and loss statements
- Cash flow analysis and projections
- Tax reporting and compliance support
- Expense tracking and categorization

## 🔧 Configuration

### Settings Management

Access settings through the gear icon in the billing dashboard:

**Shop Settings:**
- Business information and contact details
- Logo upload and branding customization
- Invoice prefixes and numbering schemes
- Tax rates and discount policies

**Print Settings:**
- Paper size and orientation preferences
- Printer selection and configuration
- Template customization and layout options
- Auto-print and receipt settings

**System Settings:**
- Language and localization preferences
- Currency format and decimal places
- Date and time format settings
- Backup and sync configurations

### Data Management

**Backup and Restore:**
- Automatic daily backups to local storage
- Manual backup creation and download
- Data export in JSON and CSV formats
- Import functionality for data migration

**Data Security:**
- Local storage encryption for sensitive data
- User session management and timeouts
- Access logging and audit trails
- Data validation and integrity checks

## 🛠️ Technical Specifications

### System Requirements

**Minimum Requirements:**
- Modern web browser with JavaScript enabled
- 2GB RAM for smooth operation
- 100MB free storage space
- Internet connection for initial setup

**Recommended Requirements:**
- Latest version of Chrome, Firefox, or Safari
- 4GB RAM for optimal performance
- 500MB free storage space
- Stable internet connection for updates

### Browser Compatibility

| Browser | Minimum Version | Recommended |
|---------|----------------|-------------|
| Chrome | 70+ | Latest |
| Firefox | 65+ | Latest |
| Safari | 12+ | Latest |
| Edge | 79+ | Latest |

### Data Storage

The application uses browser local storage for data persistence:

- **Capacity:** Up to 10MB per domain (varies by browser)
- **Persistence:** Data remains until manually cleared
- **Security:** Encrypted storage for sensitive information
- **Backup:** Automatic and manual backup options available

### Performance Optimization

- Lazy loading for large product catalogs
- Efficient search algorithms for quick data retrieval
- Optimized rendering for smooth user experience
- Memory management for long-running sessions

## 🔒 Security Features

### Data Protection

- Client-side encryption for sensitive data
- Secure session management with automatic timeouts
- Input validation and sanitization
- Protection against common web vulnerabilities

### Access Control

- Role-based permission system
- User authentication and authorization
- Activity logging and audit trails
- Secure password policies and requirements

### Privacy Compliance

- No data transmission to external servers
- Local data storage with user control
- GDPR-compliant data handling practices
- Transparent privacy policies and data usage

## 🚨 Troubleshooting

### Common Issues

**Application Won't Load:**
1. Check browser compatibility and JavaScript settings
2. Clear browser cache and cookies
3. Disable browser extensions that might interfere
4. Try accessing from an incognito/private window

**Data Not Saving:**
1. Ensure sufficient browser storage space
2. Check if local storage is enabled
3. Verify no browser restrictions on data storage
4. Try refreshing the page and re-entering data

**Print Issues:**
1. Check printer connectivity and drivers
2. Verify browser print permissions
3. Try different print templates
4. Ensure paper size matches template settings

**Performance Problems:**
1. Close unnecessary browser tabs
2. Clear browser cache and temporary files
3. Restart the browser application
4. Check available system memory

### Error Messages

**"Shop creation failed":**
- Verify all required fields are completed
- Check for duplicate shop names
- Ensure valid phone number format
- Try refreshing the page and retry

**"Product not found":**
- Verify product exists in current shop
- Check product code spelling and format
- Refresh the product list
- Try searching with different criteria

**"Invoice generation error":**
- Ensure at least one product is added
- Verify customer information format
- Check payment amount calculations
- Try using a different invoice template

### Getting Help

For additional support and assistance:

1. **Documentation:** Refer to the comprehensive user manual
2. **Community:** Join the Zovatu user community forums
3. **Support:** Contact technical support for complex issues
4. **Updates:** Check for application updates and patches

## 📋 Changelog

### Version 2.0 (Current)
- **New Features:**
  - Multi-shop management system
  - Advanced barcode generation and printing
  - Professional invoice templates
  - Salesman management with permissions
  - Comprehensive reporting and analytics
  - Modern responsive user interface

- **Improvements:**
  - Enhanced data storage and backup
  - Improved performance and stability
  - Better mobile device support
  - Advanced search and filtering
  - Customizable settings and preferences

- **Bug Fixes:**
  - Resolved calculation errors in complex invoices
  - Fixed print formatting issues
  - Improved data validation and error handling
  - Enhanced browser compatibility

### Version 1.0 (Previous)
- Basic billing and invoice generation
- Simple product management
- Basic reporting features
- Single shop operation
- Standard print functionality

## 🤝 Contributing

We welcome contributions to improve Zovatu Smart Billing Tool:

### Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/zovatu-billing.git
   cd zovatu-billing
   ```

2. **Development Environment**
   - Use any modern code editor (VS Code, Sublime Text, Atom)
   - Install browser developer tools extensions
   - Set up local HTTP server for testing

3. **Code Standards**
   - Follow JavaScript ES6+ standards
   - Use consistent indentation and formatting
   - Comment complex functions and algorithms
   - Write descriptive variable and function names

### Contribution Guidelines

- **Bug Reports:** Use GitHub issues with detailed descriptions
- **Feature Requests:** Propose new features with use cases
- **Code Contributions:** Submit pull requests with clear descriptions
- **Documentation:** Help improve user guides and technical docs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Libraries

- **Font Awesome:** Icons and visual elements
- **Chart.js:** Data visualization and reporting charts
- **QR Code Generator:** QR code creation for receipts
- **Barcode Generator:** Multiple barcode format support

## 📞 Support and Contact

### Technical Support
- **Email:** support@zovatu.com
- **Documentation:** [User Manual](docs/user-manual.md)
- **FAQ:** [Frequently Asked Questions](docs/faq.md)

### Business Inquiries
- **Sales:** sales@zovatu.com
- **Partnerships:** partners@zovatu.com
- **Custom Development:** custom@zovatu.com

### Community
- **Forum:** [Zovatu Community](https://community.zovatu.com)
- **Discord:** [Join our Discord](https://discord.gg/zovatu)
- **Social Media:** Follow us on Twitter [@ZovatuBilling](https://twitter.com/ZovatuBilling)

---

**Developed with ❤️ by the Zovatu Team**

*Empowering businesses with smart billing solutions since 2024*

