// ZOVATU Utilities - Optimized for English-only

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
    setTimeout(() => toast.remove(), 300);
  }, 4000);

  // Click to dismiss
  toast.onclick = () => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  };
}

// Enhanced form validation
export function validateForm(requiredFields) {
  const errors = [];
  
  requiredFields.forEach(fieldId => {
    const value = getVal(fieldId);
    if (!value) {
      const field = document.getElementById(fieldId);
      const label = field?.placeholder || fieldId;
      errors.push(`${label} is required`);
      
      // Add visual feedback
      if (field) {
        field.style.borderColor = '#f44336';
        field.addEventListener('input', () => {
          field.style.borderColor = '';
        }, { once: true });
      }
    }
  });
  
  return errors;
}

// Enhanced copy to clipboard
export function copyToClipboard(text, successMessage = "Copied to clipboard!") {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage, "success");
    }).catch(() => {
      fallbackCopyTextToClipboard(text, successMessage);
    });
  } else {
    fallbackCopyTextToClipboard(text, successMessage);
  }
}

function fallbackCopyTextToClipboard(text, successMessage) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast(successMessage, "success");
  } catch (err) {
    showToast("Failed to copy. Please copy manually.", "error");
  }
  
  document.body.removeChild(textArea);
}

// Enhanced local storage with error handling
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Storage save failed:', error);
    showToast("Failed to save data. Storage might be full.", "error");
    return false;
  }
}

export function loadFromStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Storage load failed:', error);
    return defaultValue;
  }
}

// Enhanced URL validation
export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// Enhanced phone number validation
export function isValidPhone(phone) {
  const phoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Enhanced email validation
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Format currency
export function formatCurrency(amount, currency = '$') {
  return `${currency}${parseFloat(amount).toFixed(2)}`;
}

// Format date
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Debounce function for search
export function debounce(func, wait) {
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

// Enhanced error handling
export function handleError(error, context = '') {
  console.error(`Error in ${context}:`, error);
  showToast(`An error occurred${context ? ` in ${context}` : ''}. Please try again.`, "error");
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('loggedInUser');
}

// Redirect to login if not authenticated
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

