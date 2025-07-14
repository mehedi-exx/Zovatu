// Enhanced Language Management System for G9Tool
// Handles UI language, output language, and WhatsApp message language

class LanguageManager {
  constructor() {
    this.translations = {};
    this.currentUILanguage = 'en'; // Default to English as per requirements
    this.currentOutputLanguage = 'bn'; // Default output language
    this.currentWhatsAppLanguage = 'bn'; // Default WhatsApp language
    this.currencySettings = {
      code: 'BDT',
      symbol: '৳'
    };
    
    this.init();
  }

  async init() {
    // Load saved settings from localStorage
    this.loadSettings();
    
    // Load translations for current UI language
    await this.loadTranslations(this.currentUILanguage);
    
    // Apply translations to current page
    this.applyTranslations();
    
    // Update language toggle buttons
    this.updateLanguageButtons();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  loadSettings() {
    // Load UI language (default: English)
    this.currentUILanguage = localStorage.getItem('language') || 'en';
    
    // Load output language (for generated content)
    this.currentOutputLanguage = localStorage.getItem('outputLanguage') || 'bn';
    
    // Load WhatsApp message language
    this.currentWhatsAppLanguage = localStorage.getItem('whatsappLanguage') || 'bn';
    
    // Load currency settings
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'BDT';
    this.setCurrency(savedCurrency);
  }

  saveSettings() {
    localStorage.setItem('language', this.currentUILanguage);
    localStorage.setItem('outputLanguage', this.currentOutputLanguage);
    localStorage.setItem('whatsappLanguage', this.currentWhatsAppLanguage);
    localStorage.setItem('selectedCurrency', this.currencySettings.code);
  }

  async loadTranslations(lang) {
    try {
      const response = await fetch(`./languages/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language file: ${lang}.json`);
      }
      this.translations = await response.json();
      document.documentElement.lang = lang;
      return true;
    } catch (error) {
      console.error("Error loading language file:", error);
      this.showToast(`Language loading failed: ${error.message}`, "error");
      return false;
    }
  }

  applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.getAttribute("data-i18n");
      if (this.translations[key]) {
        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
          element.placeholder = this.translations[key];
        } else {
          element.textContent = this.translations[key];
        }
      }
    });
  }

  updateLanguageButtons() {
    // Update UI language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.lang === this.currentUILanguage) {
        btn.classList.add('active');
      }
    });

    // Update output language buttons
    document.querySelectorAll('[data-output-lang]').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.outputLang === this.currentOutputLanguage) {
        btn.classList.add('active');
      }
    });

    // Update WhatsApp language buttons
    document.querySelectorAll('[data-wa-lang]').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.waLang === this.currentWhatsAppLanguage) {
        btn.classList.add('active');
      }
    });
  }

  async switchUILanguage(lang) {
    if (lang === this.currentUILanguage) return;

    // Show loading state
    this.setLanguageButtonsLoading(true);

    try {
      // Load new translations
      const success = await this.loadTranslations(lang);
      if (success) {
        this.currentUILanguage = lang;
        this.saveSettings();
        this.applyTranslations();
        this.updateLanguageButtons();
        
        this.showToast(
          `${this.translate("language_changed")}: ${lang === 'bn' ? 'বাংলা' : 'English'}`,
          'success'
        );
      }
    } catch (error) {
      this.showToast("ভাষা পরিবর্তনে সমস্যা হয়েছে।", "error");
    } finally {
      this.setLanguageButtonsLoading(false);
    }
  }

  setOutputLanguage(lang) {
    this.currentOutputLanguage = lang;
    this.saveSettings();
    this.updateLanguageButtons();
    this.showToast(
      `Output language set to: ${lang === 'bn' ? 'বাংলা' : 'English'}`,
      'success'
    );
  }

  setWhatsAppLanguage(lang) {
    this.currentWhatsAppLanguage = lang;
    this.saveSettings();
    this.updateLanguageButtons();
    this.updateWhatsAppPreview();
    this.showToast(
      `WhatsApp language set to: ${lang === 'bn' ? 'বাংলা' : 'English'}`,
      'success'
    );
  }

  setCurrency(currencyCode) {
    const currencyMap = {
      'BDT': { symbol: '৳', name: 'Bangladeshi Taka' },
      'USD': { symbol: '$', name: 'US Dollar' },
      'EUR': { symbol: '€', name: 'Euro' },
      'GBP': { symbol: '£', name: 'British Pound' },
      'INR': { symbol: '₹', name: 'Indian Rupee' },
      'JPY': { symbol: '¥', name: 'Japanese Yen' },
      'CNY': { symbol: '¥', name: 'Chinese Yuan' },
      'CAD': { symbol: '$', name: 'Canadian Dollar' },
      'AUD': { symbol: '$', name: 'Australian Dollar' },
      'SAR': { symbol: '﷼', name: 'Saudi Riyal' },
      'AED': { symbol: 'د.إ', name: 'UAE Dirham' },
      'PKR': { symbol: '₨', name: 'Pakistani Rupee' }
    };

    this.currencySettings = {
      code: currencyCode,
      symbol: currencyMap[currencyCode]?.symbol || '৳',
      name: currencyMap[currencyCode]?.name || 'Bangladeshi Taka'
    };

    this.saveSettings();
    this.updateCurrencyPreview();
  }

  updateCurrencyPreview() {
    const currencyExample = document.getElementById('currencyExample');
    if (currencyExample) {
      currencyExample.textContent = `${this.currencySettings.symbol}1,500`;
    }
  }

  updateWhatsAppPreview() {
    const whatsappExample = document.getElementById('whatsappExample');
    if (whatsappExample) {
      if (this.currentWhatsAppLanguage === 'bn') {
        whatsappExample.textContent = '📦 আমি একটি পণ্য অর্ডার করতে চাই\n🔖 প্রোডাক্ট: [Product Name]\n💰 মূল্য: ৳[Price]';
      } else {
        whatsappExample.textContent = '📦 I want to order a product\n🔖 Product: [Product Name]\n💰 Price: $[Price]';
      }
    }
  }

  setLanguageButtonsLoading(loading) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.style.pointerEvents = loading ? 'none' : 'auto';
      btn.style.opacity = loading ? '0.7' : '1';
    });
  }

  setupEventListeners() {
    // UI Language buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.lang-btn[data-lang]')) {
        const btn = e.target.closest('.lang-btn[data-lang]');
        const lang = btn.dataset.lang;
        this.switchUILanguage(lang);
      }
    });

    // Output language buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-output-lang]')) {
        const btn = e.target.closest('[data-output-lang]');
        const lang = btn.dataset.outputLang;
        this.setOutputLanguage(lang);
      }
    });

    // WhatsApp language buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-wa-lang]')) {
        const btn = e.target.closest('[data-wa-lang]');
        const lang = btn.dataset.waLang;
        this.setWhatsAppLanguage(lang);
      }
    });

    // Currency selector
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        this.setCurrency(e.target.value);
      });
    }
  }

  // Helper methods
  translate(key) {
    return this.translations[key] || key;
  }

  formatPrice(price, includeSymbol = true) {
    const formattedPrice = parseFloat(price).toLocaleString();
    return includeSymbol ? `${this.currencySettings.symbol}${formattedPrice}` : formattedPrice;
  }

  generateWhatsAppMessage(productData) {
    const { name, code, price, offer, category, delivery } = productData;
    const finalPrice = offer || price;

    if (this.currentWhatsAppLanguage === 'bn') {
      return `📦 আমি একটি পণ্য অর্ডার করতে চাই
🔖 প্রোডাক্ট: ${name}
💰 মূল্য: ${this.formatPrice(finalPrice)}
🧾 কোড: ${code}
📁 ক্যাটাগরি: ${category || 'N/A'}
🚚 ডেলিভারি: ${delivery || 'N/A'}`;
    } else {
      return `📦 I want to order a product
🔖 Product: ${name}
💰 Price: ${this.formatPrice(finalPrice)}
🧾 Code: ${code}
📁 Category: ${category || 'N/A'}
🚚 Delivery: ${delivery || 'N/A'}`;
    }
  }

  showToast(message, type = "success") {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    });

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "fas fa-info-circle";
    if (type === "success") icon = "fas fa-check-circle";
    else if (type === "error") icon = "fas fa-times-circle";
    else if (type === "warning") icon = "fas fa-exclamation-triangle";
    else if (type === "info") icon = "fas fa-info-circle";

    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 100);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 400);
    }, 4000);

    // Click to dismiss
    toast.addEventListener('click', () => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 400);
    });
  }

  // Public API methods
  getCurrentUILanguage() {
    return this.currentUILanguage;
  }

  getCurrentOutputLanguage() {
    return this.currentOutputLanguage;
  }

  getCurrentWhatsAppLanguage() {
    return this.currentWhatsAppLanguage;
  }

  getCurrencySettings() {
    return this.currencySettings;
  }
}

// Create global instance
window.languageManager = new LanguageManager();

// Export for module usage
export default LanguageManager;
export { LanguageManager };

