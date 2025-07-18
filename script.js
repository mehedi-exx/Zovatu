import { generateProduct, addImageInput, addCustomField, saveDraft, loadDraftToForm, applyFieldVisibility } from './js/productGenerator.js';
import { showToast, loadLanguage, translateElement } from './js/utils.js';

// Enhanced Sidebar Toggle with Animation
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

// Enhanced Logout with Confirmation
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    const logoutBtn = document.querySelector('a[onclick="logout()"]');
    if (logoutBtn) {
      logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
    }
    
    setTimeout(() => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("editDraftId");
      showToast("Successfully logged out.", "success");
      window.location.replace("index.html");
    }, 1000);
  }
}

// Enhanced Theme Management
function applyTheme(theme) {
  document.body.classList.remove("dark-mode", "light-mode");
  document.body.classList.add(theme + "-mode");
  localStorage.setItem("theme", theme);
  
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.innerHTML = theme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
}

// Update Currency Symbol in Price Fields
function updateCurrencySymbol() {
  const currency = localStorage.getItem("selectedCurrency") || "৳";
  const priceField = document.getElementById("price");
  const offerField = document.getElementById("offer");
  
  if (priceField) {
    priceField.placeholder = `Price (${currency})`;
  }
  if (offerField) {
    offerField.placeholder = `Offer Price (${currency}) (Optional)`;
  }
}

// Enhanced Copy Functionality
async function copyToClipboard() {
  const output = document.getElementById("output").textContent;
  const copyBtn = document.getElementById("copyBtn");
  
  if (!output.trim()) {
    showToast("No code to copy. Please generate product first.", "warning");
    return;
  }
  
  try {
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Copying...';
    copyBtn.disabled = true;
    
    await navigator.clipboard.writeText(output);
    
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyBtn.style.background = "#28a745";
    showToast("Code copied successfully!", "success");
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = "";
      copyBtn.disabled = false;
    }, 2000);
    
  } catch (error) {
    copyBtn.innerHTML = '<i class="fas fa-times"></i> Failed!';
    copyBtn.style.background = "#dc3545";
    showToast("Failed to copy code.", "error");
    
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      copyBtn.style.background = "";
      copyBtn.disabled = false;
    }, 2000);
  }
}

// Enhanced Form Validation
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
  
  // Clear previous errors
  document.querySelectorAll('.form-error').forEach(el => {
    el.classList.remove('form-error');
  });
  document.querySelectorAll('.error-message').forEach(el => el.remove());
  
  // Validate required fields
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
  
  // Validate first image
  if (!firstImgInput?.value.trim()) {
    firstImgInput.classList.add('form-error');
    addErrorMessage(firstImgInput, 'At least one image is required');
    errors.push('Product Image');
    isValid = false;
  }
  
  // Validate WhatsApp number format
  const waInput = document.getElementById('wa');
  if (waInput.value.trim() && !waInput.value.match(/^8801[0-9]{9}$/)) {
    waInput.classList.add('form-error');
    addErrorMessage(waInput, 'Correct format: 8801XXXXXXXXX');
    isValid = false;
  }
  
  // Validate price
  const priceInput = document.getElementById('price');
  const price = parseFloat(priceInput.value);
  if (priceInput.value.trim() && (isNaN(price) || price <= 0)) {
    priceInput.classList.add('form-error');
    addErrorMessage(priceInput, 'Enter valid price');
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

// Enhanced Auto-save Functionality
let autoSaveInterval;

function startAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  autoSaveInterval = setInterval(() => {
    const name = document.getElementById("name")?.value.trim();
    const code = document.getElementById("code")?.value.trim();
    
    if (name && code) {
      saveDraft();
      showToast("Auto-save completed", "info");
    }
  }, 30000);
}

function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// Enhanced Theme Download with Progress
function downloadTheme() {
  const downloadBtn = document.getElementById("downloadThemeBtn");
  const downloadTimer = document.getElementById("downloadTimer");
  let timeLeft = 5;

  downloadBtn.disabled = true;
  downloadBtn.classList.add('loading');
  downloadTimer.style.display = "block";
  
  const updateTimer = () => {
    downloadTimer.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;color:#ffc107;">
        <i class="fas fa-clock"></i>
        <span>Download starting in ${timeLeft} seconds...</span>
      </div>
      <div class="progress-bar" style="margin-top:8px;">
        <div class="progress-fill" style="width:${((5-timeLeft)/5)*100}%;"></div>
      </div>
    `;
  };
  
  updateTimer();

  const timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      updateTimer();
    } else {
      clearInterval(timerInterval);
      downloadTimer.style.display = "none";
      downloadBtn.classList.remove('loading');
      
      const confirmDownload = confirm(`🎨 Download Zovatu Theme\n\nThis theme is specially designed for your Blogger site.\n\n✅ Compatible with Zovatu\n✅ Responsive Design\n✅ Fast Loading\n✅ SEO Optimized\n\nDo you want to download?`);
      
      if (confirmDownload) {
        const a = document.createElement("a");
        a.href = "https://github.com/mehedi-exx/G9-Tool/releases/download/Zovatu/Zovatu.xml";
        a.download = "Zovatu_Theme.xml";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> Download Complete!';
        downloadBtn.style.background = "#28a745";
        showToast("🎉 Theme downloaded successfully!", "success");
        
        setTimeout(() => {
          downloadBtn.innerHTML = '<i class="fab fa-blogger-b"></i> Download Theme';
          downloadBtn.style.background = "";
        }, 3000);
      } else {
        showToast("Download cancelled.", "info");
      }
      
      downloadBtn.disabled = false;
    }
  }, 1000);
}

// Enhanced Keyboard Shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generateProduct();
    }
    
    // Ctrl/Cmd + S to save draft
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveDraft();
      showToast("Draft saved!", "success");
    }
    
    // Escape to close sidebar
    if (e.key === 'Escape') {
      const sidebar = document.getElementById("sidebar");
      if (sidebar.classList.contains("open")) {
        toggleSidebar();
      }
    }
  });
}

// Enhanced Event Listeners
window.addEventListener("DOMContentLoaded", async () => {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
    return;
  }

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  const savedLang = localStorage.getItem("language") || "en";
  await loadLanguage(savedLang);

  applyFieldVisibility();
  updateCurrencySymbol(); // Update currency symbols on page load

  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      const validation = validateForm();
      if (validation.isValid) {
        generateProduct();
      } else {
        showToast(`Please fill the following fields: ${validation.errors.join(', ')}`, "error");
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
    showToast("Draft loaded. Edit and update.", "info");
  }
  
  const formInputs = document.querySelectorAll('input, textarea, select');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('form-error', 'form-success');
      const errorMsg = input.parentNode.querySelector('.error-message');
      if (errorMsg) errorMsg.remove();
    });
  });

  // Listen for storage changes to update currency symbols
  window.addEventListener('storage', (e) => {
    if (e.key === 'selectedCurrency') {
      updateCurrencySymbol();
    }
  });
});

window.addEventListener("beforeunload", () => {
  stopAutoSave();
});

// Expose functions to global scope
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.addImageField = addImageInput;
window.addCustomField = addCustomField;
window.downloadTheme = downloadTheme;
window.copyToClipboard = copyToClipboard;
window.validateForm = validateForm;
window.updateCurrencySymbol = updateCurrencySymbol;

