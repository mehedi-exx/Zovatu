# G9Tool - Professional Product Generator

A powerful, responsive web application for generating professional product listings with multiple themes and comprehensive admin features.

## 🚀 Features

### Core Functionality
- **Product Generation**: Create professional product listings with customizable fields
- **Multi-Language Support**: Full Bengali and English language support
- **Theme System**: Three professional themes (Old Version, Professional V1, Professional V2)
- **Admin Panel**: Complete product management with statistics and controls
- **Field Customization**: Customize which form fields are displayed
- **Responsive Design**: 100% mobile and desktop friendly

### Admin Features
- **Currency Selection**: Support for 50+ international currencies
- **Output Language Control**: Set product description language
- **WhatsApp Message Language**: Control WhatsApp message language
- **Product Statistics**: View total, verified, and pending products
- **Product Management**: Edit, preview, verify, and delete products
- **Import/Export**: JSON import and export functionality

### Technical Features
- **Progressive Web App (PWA)**: Installable on mobile devices
- **Dark/Light Mode**: Theme switching capability
- **Local Storage**: Persistent data storage
- **Service Worker**: Offline functionality
- **Responsive UI**: Professional gradient design system

## 📁 File Structure

```
G9Tool-Final/
├── index.html              # Login page
├── dashboard.html           # Main product generation interface
├── admin.html              # Admin panel for product management
├── fieldManager.html       # Field customization interface
├── tutorial.html           # User tutorial page
├── style.css               # Main stylesheet with all themes
├── auth.js                 # Authentication logic
├── script.js               # Main dashboard functionality
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for PWA
├── js/
│   ├── admin.js            # Admin panel functionality
│   ├── productGenerator.js # Product generation logic
│   └── utils.js            # Utility functions
├── languages/
│   ├── en.json             # English translations
│   └── bn.json             # Bengali translations
├── users/
│   └── admin.json          # User data storage
└── assets/
    └── icons/              # PWA icons
```

## 🛠️ Installation & Setup

### Local Development
1. Clone or download the project files
2. Open a terminal in the project directory
3. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open `http://localhost:8000` in your browser

### GitHub Pages Deployment
1. Upload all files to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the main branch as source
4. Access your tool at `https://yourusername.github.io/repository-name`

### Web Server Deployment
1. Upload all files to your web server
2. Ensure the server supports static file serving
3. Access the tool through your domain

## 👤 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 🎨 Theme System

### Old Version Theme (Default)
- Dark background with orange accents
- Classic product card design
- Consistent with original G9Tool aesthetic

### Professional V1 Theme
- Modern blue gradient design
- Enhanced visual elements
- Professional business appearance

### Professional V2 Theme
- Dark navy theme with red accents
- Premium look and feel
- Corporate-style design

## 🌐 Language Support

### Interface Languages
- **Bengali (বাংলা)**: Complete Bengali interface
- **English**: Full English interface

### Output Languages
- Product descriptions can be generated in Bengali or English
- WhatsApp messages support both languages
- Admin-controlled language settings

## 💰 Currency Support

The tool supports 50+ international currencies including:
- ৳ BDT (Bangladesh Taka)
- $ USD (US Dollar)
- ₹ INR (Indian Rupee)
- € EUR (Euro)
- £ GBP (British Pound)
- And many more...

## 📱 Mobile Features

### Progressive Web App (PWA)
- Install on mobile home screen
- Offline functionality
- Native app-like experience
- Push notification support

### Responsive Design
- Touch-friendly interface
- Mobile-optimized forms
- Adaptive layouts
- Gesture support

## 🔧 Admin Panel Features

### Product Statistics
- Total products count
- Verified products tracking
- Pending products management

### Product Management
- **Edit**: Modify existing products
- **Preview**: View product before publishing
- **Verify**: Mark products as verified
- **Delete**: Remove unwanted products

### Data Management
- **Export**: Download products as JSON
- **Import**: Upload product data
- **Search**: Find products by name or code

### Settings Control
- Currency selection for pricing
- Output language configuration
- WhatsApp message language setting

## 🎯 Usage Guide

### Creating a Product
1. Login with admin credentials
2. Fill in product details (name, code, price, etc.)
3. Add product images and descriptions
4. Set WhatsApp contact number
5. Click "Generate" to create the product
6. Copy the generated code or view live preview

### Managing Products
1. Access Admin Panel from sidebar
2. View product statistics and listings
3. Use search to find specific products
4. Edit, verify, or delete products as needed
5. Export data for backup or import new data

### Customizing Fields
1. Go to Field Customize section
2. Select which form fields to display
3. Hide unnecessary fields for cleaner interface
4. Save settings for persistent customization

## 🔒 Security Features

- Secure login system
- Local data storage
- No external dependencies for core functionality
- Client-side data processing

## 🌟 Best Practices

### For Users
- Regularly backup product data using export feature
- Use high-quality images for better product presentation
- Fill all relevant fields for comprehensive product listings
- Verify products before final use

### For Developers
- Maintain the modular file structure
- Follow the established coding patterns
- Test on multiple devices and browsers
- Keep language files updated

## 🐛 Troubleshooting

### Common Issues
1. **Login not working**: Check username/password case sensitivity
2. **Images not loading**: Verify image URLs are accessible
3. **Language not switching**: Clear browser cache and reload
4. **Mobile display issues**: Ensure viewport meta tag is present

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the tutorial section in the app
- Review this documentation

## 🔄 Version History

### v2.0.0 (Current)
- Added multi-theme support
- Implemented admin panel
- Added currency selection
- Enhanced mobile responsiveness
- Added PWA features
- Improved language system

### v1.0.0 (Original)
- Basic product generation
- Simple admin features
- Bengali language support
- Basic responsive design

---

**G9Tool** - Professional Product Generator for Modern E-commerce

