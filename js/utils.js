// Enhanced Utility Functions for G9Tool
// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Toast icons
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  toast.innerHTML = `
    <div class="toast-content">
      <i class="${icons[type] || icons.info}"></i>
      <span>${message}</span>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Add to page
  document.body.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, duration);

  // Add click to close
  toast.addEventListener('click', () => toast.remove());
}

// Language management
const translations = {
  en: {},
  bn: {}
};

// Load language file
async function loadLanguage(lang) {
  try {
    const response = await fetch(`languages/${lang}.json`);
    if (response.ok) {
      translations[lang] = await response.json();
      localStorage.setItem('language', lang);
      updatePageLanguage(lang);
      
      // Dispatch language change event
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
}

// Update page language
function updatePageLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = translations[lang]?.[key] || translations.en?.[key] || key;
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else {
      element.textContent = translation;
    }
  });
}

// Get translation
function getTranslation(key, lang = null) {
  const currentLang = lang || localStorage.getItem('language') || 'en';
  return translations[currentLang]?.[key] || translations.en?.[key] || key;
}

// Theme management
function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update theme toggle button
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    const icon = themeBtn.querySelector('i');
    if (icon) {
      icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update theme toggle button
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    const icon = themeBtn.querySelector('i');
    if (icon) {
      icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

// Language toggle
function toggleLanguage() {
  const currentLang = localStorage.getItem('language') || 'en';
  const newLang = currentLang === 'en' ? 'bn' : 'en';
  loadLanguage(newLang);
  
  // Update language toggle button
  const langBtn = document.querySelector('.language-toggle');
  if (langBtn) {
    const text = langBtn.querySelector('span');
    if (text) {
      text.textContent = newLang === 'en' ? 'EN' : 'বাং';
    }
  }
}

// Form validation
function validateField(field, rules = {}) {
  const value = field.value.trim();
  const errors = [];

  if (rules.required && !value) {
    errors.push('This field is required');
  }

  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.message || 'Invalid format');
  }

  if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors.push('Invalid email format');
  }

  if (rules.phone && value && !/^880\d{10}$/.test(value)) {
    errors.push('Phone number must be in format: 8801XXXXXXXXXX');
  }

  // Update field UI
  const fieldGroup = field.closest('.field-group') || field.parentElement;
  const errorElement = fieldGroup.querySelector('.field-error');
  
  if (errors.length > 0) {
    field.classList.add('error');
    if (errorElement) {
      errorElement.textContent = errors[0];
      errorElement.style.display = 'block';
    }
    return false;
  } else {
    field.classList.remove('error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    return true;
  }
}

// Format currency
function formatCurrency(amount, currency = 'BDT') {
  const symbols = {
    'BDT': '৳', 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
    'JPY': '¥', 'CNY': '¥', 'CAD': '$', 'AUD': '$', 'SAR': '﷼',
    'AED': 'د.إ', 'PKR': '₨'
  };
  
  const symbol = symbols[currency] || '৳';
  return `${symbol}${parseFloat(amount).toLocaleString()}`;
}

// Format date
function formatDate(date, lang = 'en') {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', options);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    showToast('Failed to copy', 'error');
    return false;
  }
}

// Generate unique ID
function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

// Storage helpers
const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

// Initialize utilities
function initUtils() {
  // Initialize theme
  initTheme();
  
  // Load saved language
  const savedLang = localStorage.getItem('language') || 'en';
  loadLanguage(savedLang);
  
  // Add global event listeners
  document.addEventListener('click', (e) => {
    // Theme toggle
    if (e.target.closest('.theme-toggle')) {
      e.preventDefault();
      toggleTheme();
    }
    
    // Language toggle
    if (e.target.closest('.language-toggle')) {
      e.preventDefault();
      toggleLanguage();
    }
  });
  
  // Add CSS for toast notifications
  if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        animation: slideIn 0.3s ease-out;
      }
      
      .toast-success { border-left: 4px solid #10b981; }
      .toast-error { border-left: 4px solid #ef4444; }
      .toast-warning { border-left: 4px solid #f59e0b; }
      .toast-info { border-left: 4px solid #3b82f6; }
      
      .toast-content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }
      
      .toast-content i {
        font-size: 16px;
      }
      
      .toast-success i { color: #10b981; }
      .toast-error i { color: #ef4444; }
      .toast-warning i { color: #f59e0b; }
      .toast-info i { color: #3b82f6; }
      
      .toast-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }
      
      .toast-close:hover {
        background: var(--hover-bg);
        color: var(--text-primary);
      }
      
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
      
      .field-error {
        color: #ef4444;
        font-size: 12px;
        margin-top: 4px;
        display: none;
      }
      
      .field-group input.error,
      .field-group textarea.error,
      .field-group select.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUtils);
} else {
  initUtils();
}

// Export functions for use in other modules
export {
  showToast,
  loadLanguage,
  getTranslation,
  toggleTheme,
  toggleLanguage,
  validateField,
  formatCurrency,
  formatDate,
  debounce,
  copyToClipboard,
  generateId,
  storage
};

