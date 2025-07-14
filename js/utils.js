import { LanguageManager } from './languageManager.js';

let translations = {};
let languageManager = null;

export const getVal = id => document.getElementById(id)?.value.trim();

export function showToast(message, type = "success") {
  // Use language manager's toast if available
  if (window.languageManager) {
    window.languageManager.showToast(message, type);
    return;
  }

  // Fallback toast implementation
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

  setTimeout(() => toast.classList.add("show"), 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 400);
  }, 4000);

  toast.addEventListener('click', () => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 400);
  });
}

export async function loadLanguage(lang) {
  try {
    const response = await fetch(`./languages/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load language file: ${lang}.json`);
    }
    translations = await response.json();
    applyTranslations();
    
    // Update document language
    document.documentElement.lang = lang;
    
    return true;
  } catch (error) {
    console.error("Error loading language file:", error);
    showToast(`Language loading failed: ${error.message}`, "error");
    return false;
  }
}

export function translateElement(key) {
  // Use language manager's translate if available
  if (window.languageManager) {
    return window.languageManager.translate(key);
  }
  return translations[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.getAttribute("data-i18n");
    if (translations[key]) {
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = translations[key];
      } else {
        element.textContent = translations[key];
      }
    }
  });
}

// Enhanced form validation utilities
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^8801[0-9]{9}$/;
  return phoneRegex.test(phone);
}

export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Enhanced localStorage utilities
export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    showToast('Storage operation failed', 'error');
    return false;
  }
}

export function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Storage retrieval error:', error);
    return defaultValue;
  }
}

// Enhanced error handling
export function handleError(error, context = '') {
  console.error(`Error in ${context}:`, error);
  showToast(`An error occurred${context ? ` in ${context}` : ''}: ${error.message}`, 'error');
}

// Performance monitoring
export function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}

// Currency formatting utility
export function formatPrice(price, includeSymbol = true) {
  if (window.languageManager) {
    return window.languageManager.formatPrice(price, includeSymbol);
  }
  
  // Fallback formatting
  const formattedPrice = parseFloat(price).toLocaleString();
  return includeSymbol ? `৳${formattedPrice}` : formattedPrice;
}

// WhatsApp message generation utility
export function generateWhatsAppMessage(productData) {
  if (window.languageManager) {
    return window.languageManager.generateWhatsAppMessage(productData);
  }
  
  // Fallback message generation
  const { name, code, price, offer, category, delivery } = productData;
  const finalPrice = offer || price;
  
  return `📦 আমি একটি পণ্য অর্ডার করতে চাই
🔖 প্রোডাক্ট: ${name}
💰 মূল্য: ৳${finalPrice}
🧾 কোড: ${code}
📁 ক্যাটাগরি: ${category || 'N/A'}
🚚 ডেলিভারি: ${delivery || 'N/A'}`;
}

