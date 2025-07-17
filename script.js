import { showToast, getVal, translateElement } from './js/utils.js';
import { generateProduct, addImageInput, addCustomField, saveDraft, loadDraftToForm, applyFieldVisibility } from './js/productGenerator.js';

// ✅ Enhanced Sidebar Toggle with Animation
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const isOpen = sidebar.classList.contains("open");
  
  if (isOpen) {
    sidebar.classList.remove("open");
  } else {
    sidebar.classList.add("open");
  }
  
  // Add backdrop for mobile
  if (!isOpen) {
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
    `;
    backdrop.onclick = toggleSidebar;
    document.body.appendChild(backdrop);
  } else {
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (backdrop) backdrop.remove();
  }
}

// ✅ Enhanced Logout with Confirmation
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    const logoutBtn = document.querySelector('a[onclick="logout()"]');
    if (logoutBtn) {
      logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
    }
    
    setTimeout(() => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("editDraftId");
      showToast("Successfully logged out.");
      window.location.replace("index.html");
    }, 1000);
  }
}

// ✅ Enhanced Theme Management
function applyTheme(theme) {
  document.body.classList.remove("dark-mode", "light-mode");
  document.body.classList.add(theme + "-mode");
  localStorage.setItem("theme", theme);
  
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.innerHTML = theme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
}

// ✅ Update Currency Symbol in Price Fields
function updateCurrencySymbol() {
  const currency = localStorage.getItem("selectedCurrency") || "$";
  const priceField = document.getElementById("price");
  const offerField = document.getElementById("offer");
  
  if (priceField) {
    priceField.placeholder = `Price (${currency})`;
  }
  if (offerField) {
    offerField.placeholder = `Offer Price (${currency}) (Optional)`;
  }
}

// ✅ Enhanced Copy Functionality
async function copyToClipboard() {
  const output = document.getElementById("output").textContent;
  const copyBtn = document.getElementById("copyBtn");
  
  if (!output.trim()) {
    showToast("No code to copy. Generate a product first.", "warning");
    return;
  }
  
  try {
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Copying...';
    copyBtn.disabled = true;
    
    await navigator.clipboard.writeText(output);
    
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyBtn.style.background = "#28a745";
    showToast("Copied successfully!", "success");
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = "";
      copyBtn.disabled = false;
    }, 2000);
    
  } catch (error) {
    copyBtn.innerHTML = '<i class="fas fa-times"></i> Failed!';
    copyBtn.style.background = "#dc3545";
    showToast("Failed to copy.", "error");
    
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      copyBtn.style.background = "";
      copyBtn.disabled = false;
    }, 2000);
  }
}

// ✅ Enhanced Form Validation
function validateForm() {
  const requiredFields = [
    { id: 'name', label: 'Product Name' },
    { id: 'code', label: 'Product Code' },
    { id: 'price', label: 'Price' },
    { id: 'wa', label: 'WhatsApp Number' }
  ];
  
  const firstImgInput = document.querySelector('.img-url');
  let isValid = true;
  const errors = [];

  document.querySelectorAll('.form-error').forEach(el => {
    el.classList.remove('form-error');
  });
  document.querySelectorAll('.error-message').forEach(el => el.remove());

  requiredFields.forEach(field => {
    const element = document.getElementById(field.id);
    const value = element.value.trim();
    
    if (!value) {
      element.classList.add('form-error');
      addErrorMessage(element, `${field.label} is required`);
      errors.push(field.label);
      isValid = false;
    } else {
      element.classList.add('form-success');
      element.classList.remove('form-error');
    }
  });

  if (!firstImgInput?.value.trim()) {
    firstImgInput.classList.add('form-error');
    addErrorMessage(firstImgInput, 'At least one image is required');
    errors.push('Product Image');
    isValid = false;
  }

  const waInput = document.getElementById('wa');
  if (waInput.value.trim() && !waInput.value.match(/^8801[0-9]{9}$/)) {
    waInput.classList.add('form-error');
    addErrorMessage(waInput, 'Correct format: 8801XXXXXXXXX');
    isValid = false;
  }

  const priceInput = document.getElementById('price');
  const price = parseFloat(priceInput.value);
  if (priceInput.value.trim() && (isNaN(price) || price <= 0)) {
    priceInput.classList.add('form-error');
    addErrorMessage(priceInput, 'Enter a valid price');
    isValid = false;
  }

  return { isValid, errors };
}

function addErrorMessage(element, message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  element.parentNode.insertBefore(errorDiv, element.nextSibling);
}

// ✅ Enhanced Auto-save Functionality
let autoSaveInterval;

function startAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  autoSaveInterval = setInterval(() => {
    const name = getVal("name");
    const code = getVal("code");
    
    if (name && code) {
      saveDraft();
      showToast("Auto-saved", "info");
    }
  }, 30000);
}

function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generateProduct();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveDraft();
      showToast("Draft saved!", "success");
    }

    if (e.key === 'Escape') {
      const sidebar = document.getElementById("sidebar");
      if (sidebar.classList.contains("open")) {
        toggleSidebar();
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
    return;
  }

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  applyFieldVisibility();
  updateCurrencySymbol();

  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");

  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      const validation = validateForm();
      if (validation.isValid) {
        generateProduct();
      } else {
        showToast(`Please complete the following fields: ${validation.errors.join(', ')}`, "error");
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyToClipboard);
  }

  setupKeyboardShortcuts();
  startAutoSave();

  const draftId = localStorage.getItem("editDraftId");
  if (draftId) {
    loadDraftToForm(draftId);
    showToast("Draft loaded. You can now edit and update.", "info");
  }

  const formInputs = document.querySelectorAll('input, textarea, select');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('form-error', 'form-success');
      const errorMsg = input.parentNode.querySelector('.error-message');
      if (errorMsg) errorMsg.remove();
    });
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'selectedCurrency') {
      updateCurrencySymbol();
    }
  });
});

window.addEventListener("beforeunload", () => {
  stopAutoSave();
});

window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.addImageField = addImageInput;
window.addCustomField = addCustomField;
window.copyToClipboard = copyToClipboard;
window.validateForm = validateForm;
window.updateCurrencySymbol = updateCurrencySymbol;
