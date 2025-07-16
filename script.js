// ZOVATU Main JavaScript - Professional eCommerce Website Builder

import { showToast, getVal, copyToClipboard, saveToStorage, loadFromStorage } from './js/utils.js';
import { generateProduct, addImageInput, addCustomField, saveDraft, loadDraftToForm } from './js/productGenerator.js';

// ===== GLOBAL VARIABLES =====
let currentUser = null;

// ===== SIDEBAR FUNCTIONALITY =====
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const isOpen = sidebar?.classList.contains("open");
  
  if (!sidebar) return;
  
  if (isOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  
  sidebar.classList.add("open");
  
  // Add backdrop for mobile
  const backdrop = document.createElement("div");
  backdrop.className = "sidebar-backdrop";
  backdrop.onclick = closeSidebar;
  document.body.appendChild(backdrop);
  
  // Trigger backdrop animation
  setTimeout(() => backdrop.classList.add("show"), 10);
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.querySelector(".sidebar-backdrop");
  
  if (sidebar) {
    sidebar.classList.remove("open");
  }
  
  if (backdrop) {
    backdrop.classList.remove("show");
    setTimeout(() => backdrop.remove(), 300);
  }
}

// ===== AUTHENTICATION =====
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    const logoutBtn = document.querySelector('a[onclick="logout()"]');
    if (logoutBtn) {
      logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
    }
    
    setTimeout(() => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("editDraftId");
      showToast("Successfully logged out!", "success");
      window.location.replace("index.html");
    }, 1000);
  }
}

// ===== FORM HANDLING =====
function handleProductForm() {
  const form = document.getElementById('productForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
      submitBtn.disabled = true;
      
      // Generate product
      await generateProduct();
      
      showToast("Product generated successfully!", "success");
    } catch (error) {
      console.error('Error generating product:', error);
      showToast("Failed to generate product. Please try again.", "error");
    } finally {
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ===== THEME DOWNLOAD =====
function downloadTheme() {
  const btn = document.querySelector('.download-theme-btn');
  if (!btn) return;
  
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
  btn.disabled = true;
  
  setTimeout(() => {
    // Create download link
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('ZOVATU Theme Package');
    link.download = 'zovatu-theme.zip';
    link.click();
    
    showToast("Theme download started!", "success");
    
    // Reset button
    btn.innerHTML = originalText;
    btn.disabled = false;
  }, 2000);
}

// ===== KEYBOARD SHORTCUTS =====
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save draft
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveDraft();
    }
    
    // Escape to close sidebar
    if (e.key === 'Escape') {
      closeSidebar();
    }
    
    // Ctrl/Cmd + Enter to generate product
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const form = document.getElementById('productForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
    }
  });
}

// ===== FORM VALIDATION =====
function setupFormValidation() {
  const inputs = document.querySelectorAll('input[required], textarea[required]');
  
  inputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
  });
}

function validateField(e) {
  const field = e.target;
  const value = field.value.trim();
  
  if (!value && field.required) {
    showFieldError(field, 'This field is required');
    return false;
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, 'Please enter a valid email address');
      return false;
    }
  }
  
  // URL validation
  if (field.type === 'url' && value) {
    try {
      new URL(value);
    } catch {
      showFieldError(field, 'Please enter a valid URL');
      return false;
    }
  }
  
  // Number validation
  if (field.type === 'number' && value) {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      showFieldError(field, 'Please enter a valid positive number');
      return false;
    }
  }
  
  clearFieldError(field);
  return true;
}

function showFieldError(field, message) {
  field.style.borderColor = 'var(--error)';
  
  // Remove existing error message
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Add error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.style.cssText = `
    color: var(--error);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  `;
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.style.borderColor = '';
  const errorDiv = field.parentNode.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// ===== AUTO-SAVE FUNCTIONALITY =====
function setupAutoSave() {
  const form = document.getElementById('productForm');
  if (!form) return;
  
  const inputs = form.querySelectorAll('input, textarea, select');
  let autoSaveTimeout;
  
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        saveFormData();
      }, 2000); // Auto-save after 2 seconds of inactivity
    });
  });
}

function saveFormData() {
  const form = document.getElementById('productForm');
  if (!form) return;
  
  const formData = new FormData(form);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  
  saveToStorage('autoSaveData', data);
}

function loadFormData() {
  const data = loadFromStorage('autoSaveData');
  if (!data) return;
  
  Object.keys(data).forEach(key => {
    const field = document.getElementById(key);
    if (field && data[key]) {
      field.value = data[key];
    }
  });
}

// ===== RESPONSIVE MENU HANDLING =====
function setupResponsiveMenu() {
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  
  function handleMediaChange(e) {
    if (!e.matches) {
      // Desktop view - close sidebar
      closeSidebar();
    }
  }
  
  mediaQuery.addListener(handleMediaChange);
  handleMediaChange(mediaQuery);
}

// ===== PERFORMANCE OPTIMIZATION =====
function optimizeImages() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Add loading="lazy" for better performance
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Add error handling
    img.addEventListener('error', () => {
      img.style.display = 'none';
      console.warn('Failed to load image:', img.src);
    });
  });
}

// ===== ACCESSIBILITY IMPROVEMENTS =====
function setupAccessibility() {
  // Add ARIA labels to buttons without text
  const iconButtons = document.querySelectorAll('button:not([aria-label])');
  iconButtons.forEach(btn => {
    const icon = btn.querySelector('i');
    if (icon && !btn.textContent.trim()) {
      const classes = icon.className;
      if (classes.includes('fa-bars') || classes.includes('menu')) {
        btn.setAttribute('aria-label', 'Toggle menu');
      } else if (classes.includes('fa-plus')) {
        btn.setAttribute('aria-label', 'Add item');
      } else if (classes.includes('fa-download')) {
        btn.setAttribute('aria-label', 'Download');
      }
    }
  });
  
  // Improve focus management
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  currentUser = loadFromStorage('loggedInUser');
  
  // Initialize components
  setupKeyboardShortcuts();
  setupFormValidation();
  setupAutoSave();
  setupResponsiveMenu();
  setupAccessibility();
  optimizeImages();
  
  // Load saved form data
  loadFormData();
  
  // Handle product form
  handleProductForm();
  
  // Setup download theme button
  const downloadBtn = document.querySelector('.download-theme-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadTheme);
  }
  
  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.querySelector('.menu-btn');
    
    if (sidebar && sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !menuBtn?.contains(e.target)) {
      closeSidebar();
    }
  });
  
  console.log('ZOVATU initialized successfully!');
});

// ===== GLOBAL FUNCTIONS =====
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.addImageInput = addImageInput;
window.addCustomField = addCustomField;
window.saveDraft = saveDraft;
window.copyToClipboard = copyToClipboard;

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  showToast('An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  showToast('An error occurred while processing your request.', 'error');
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

