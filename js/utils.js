// ZOVATU Utilities - Professional eCommerce Website Builder

// ===== TOAST NOTIFICATIONS =====
export function showToast(message, type = 'success', duration = 3000) {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Add icon based on type
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;
  
  // Add to DOM
  document.body.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
  
  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
}

// ===== UTILITY FUNCTIONS =====
export function getVal(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : '';
}

export function setVal(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value;
  }
}

export function copyToClipboard(text) {
  if (!text) {
    const output = document.getElementById('generatedHTML');
    text = output ? output.textContent : '';
  }
  
  if (!text) {
    showToast('No content to copy!', 'warning');
    return;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Failed to copy: ', err);
    showToast('Failed to copy to clipboard', 'error');
  });
}

// ===== LOCAL STORAGE HELPERS =====
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to storage:', error);
    showToast('Failed to save data', 'error');
    return false;
  }
}

export function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from storage:', error);
    return false;
  }
}

// ===== FORM HELPERS =====
export function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
    
    // Clear any custom fields
    const customFields = form.querySelectorAll('.custom-field-group');
    customFields.forEach(field => field.remove());
    
    // Reset image inputs
    const imageInputs = form.querySelector('#imageInputs');
    if (imageInputs) {
      imageInputs.innerHTML = `
        <div class="image-input-group">
          <input type="url" placeholder="Image URL 1" class="image-url">
          <button type="button" onclick="addImageInput()" class="add-image-btn">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      `;
    }
    
    showToast('Form cleared successfully!', 'info');
  }
}

export function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = 'var(--error)';
      isValid = false;
    } else {
      field.style.borderColor = '';
    }
  });
  
  if (!isValid) {
    showToast('Please fill in all required fields', 'warning');
  }
  
  return isValid;
}

// ===== STRING HELPERS =====
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatPrice(price) {
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}

export function formatCurrency(amount, currency = 'USD') {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(num);
}

// ===== DATE HELPERS =====
export function formatDate(date, format = 'short') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
  };
  
  return d.toLocaleDateString('en-US', options[format] || options.short);
}

export function getTimestamp() {
  return new Date().toISOString();
}

// ===== URL HELPERS =====
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (let [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// ===== DOWNLOAD HELPERS =====
export function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadHTML() {
  const output = document.getElementById('generatedHTML');
  if (!output || !output.textContent.trim()) {
    showToast('No HTML content to download!', 'warning');
    return;
  }
  
  const content = output.textContent;
  const filename = `zovatu-product-${Date.now()}.html`;
  downloadFile(content, filename, 'text/html');
  showToast('HTML file downloaded!', 'success');
}

// ===== ANIMATION HELPERS =====
export function fadeIn(element, duration = 300) {
  element.style.opacity = '0';
  element.style.display = 'block';
  
  let start = null;
  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const opacity = Math.min(progress / duration, 1);
    
    element.style.opacity = opacity;
    
    if (progress < duration) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

export function fadeOut(element, duration = 300) {
  let start = null;
  const initialOpacity = parseFloat(getComputedStyle(element).opacity);
  
  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const opacity = initialOpacity * (1 - Math.min(progress / duration, 1));
    
    element.style.opacity = opacity;
    
    if (progress < duration) {
      requestAnimationFrame(animate);
    } else {
      element.style.display = 'none';
    }
  }
  
  requestAnimationFrame(animate);
}

// ===== DEBOUNCE HELPER =====
export function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// ===== THROTTLE HELPER =====
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ===== DEVICE DETECTION =====
export function isMobile() {
  return window.innerWidth <= 768;
}

export function isTablet() {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
}

export function isDesktop() {
  return window.innerWidth > 1024;
}

// ===== PERFORMANCE HELPERS =====
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function lazyLoad(selector) {
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const src = element.dataset.src;
        if (src) {
          element.src = src;
          element.removeAttribute('data-src');
        }
        observer.unobserve(element);
      }
    });
  });
  
  elements.forEach(element => observer.observe(element));
}

// ===== SECURITY HELPERS =====
export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== ANALYTICS HELPERS =====
export function trackEvent(eventName, properties = {}) {
  // Basic event tracking - can be extended with analytics services
  console.log('Event tracked:', eventName, properties);
  
  // Example: Send to analytics service
  // analytics.track(eventName, properties);
}

export function trackPageView(pageName) {
  trackEvent('page_view', { page: pageName });
}

// ===== INITIALIZATION =====
export function initializeUtils() {
  // Track page view
  trackPageView(document.title);
  
  // Initialize lazy loading for images
  lazyLoad('img[data-src]');
  
  console.log('ZOVATU Utils initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUtils);
} else {
  initializeUtils();
}

