let translations = {};

export const getVal = id => document.getElementById(id)?.value.trim();

export function showToast(message, type = "success") {
  // Remove existing toasts to prevent stacking
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
  
  // Enhanced toast styles
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transform: translateX(100%);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    cursor: pointer;
    max-width: 350px;
    word-wrap: break-word;
  `;
  
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 4000);

  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  });
}

export async function loadLanguage(lang) {
  try {
    // Try multiple possible paths for the language file
    const possiblePaths = [
      `./languages/${lang}.json`,
      `languages/${lang}.json`,
      `./js/../languages/${lang}.json`,
      `./${lang}.json`
    ];
    
    let response = null;
    let lastError = null;
    
    for (const path of possiblePaths) {
      try {
        response = await fetch(path);
        if (response.ok) {
          break;
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    if (!response || !response.ok) {
      // If all paths fail, create a minimal English translation object
      console.warn(`Could not load language file for ${lang}, using fallback`);
      translations = {
        "username_password_required": "Username and password are required",
        "user_not_found": "User not found",
        "login_successful": "Login successful",
        "invalid_credentials_or_not_premium": "Invalid credentials or user is not premium",
        "login_failed": "Login failed",
        "logout_successful": "Logout successful"
      };
      applyTranslations();
      document.documentElement.lang = lang;
      return true;
    }
    
    translations = await response.json();
    applyTranslations();
    
    // Update document language
    document.documentElement.lang = lang;
    
    return true;
  } catch (error) {
    console.error("Error loading language file:", error);
    // Use fallback translations instead of showing error
    translations = {
      "username_password_required": "Username and password are required",
      "user_not_found": "User not found", 
      "login_successful": "Login successful",
      "invalid_credentials_or_not_premium": "Invalid credentials or user is not premium",
      "login_failed": "Login failed",
      "logout_successful": "Logout successful"
    };
    applyTranslations();
    document.documentElement.lang = lang;
    return true;
  }
}

export function translateElement(key) {
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

