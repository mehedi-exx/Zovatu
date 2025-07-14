import { showToast, getVal, loadLanguage, translateElement } from './js/utils.js';
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
  const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
  const confirmMessage = currentLang === 'bn' ? 
    "আপনি কি নিশ্চিত যে লগ আউট করতে চান?" : 
    "Are you sure you want to logout?";
    
  if (confirm(confirmMessage)) {
    const logoutBtn = document.querySelector('a[onclick="logout()"]');
    if (logoutBtn) {
      const loadingText = currentLang === 'bn' ? 
        '<i class="fas fa-spinner fa-spin"></i> লগ আউট হচ্ছে...' :
        '<i class="fas fa-spinner fa-spin"></i> Logging out...';
      logoutBtn.innerHTML = loadingText;
    }
    
    setTimeout(() => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("editDraftId");
      const successMessage = currentLang === 'bn' ? 
        "সফলভাবে লগ আউট হয়েছে।" : 
        "Successfully logged out.";
      showToast(successMessage);
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

// ✅ Enhanced Copy Functionality
async function copyToClipboard() {
  const output = document.getElementById("output").textContent;
  const copyBtn = document.getElementById("copyBtn");
  
  if (!output.trim()) {
    const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
    const warningMessage = currentLang === 'bn' ? 
      "কপি করার জন্য কোনো কোড নেই। প্রথমে প্রোডাক্ট জেনারেট করুন।" :
      "No code to copy. Please generate a product first.";
    showToast(warningMessage, "warning");
    return;
  }
  
  try {
    const originalText = copyBtn.innerHTML;
    const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
    
    const loadingText = currentLang === 'bn' ? 
      '<i class="fas fa-spinner fa-spin"></i> কপি হচ্ছে...' :
      '<i class="fas fa-spinner fa-spin"></i> Copying...';
    copyBtn.innerHTML = loadingText;
    copyBtn.disabled = true;
    
    await navigator.clipboard.writeText(output);
    
    const successText = currentLang === 'bn' ? 
      '<i class="fas fa-check"></i> কপি হয়েছে!' :
      '<i class="fas fa-check"></i> Copied!';
    copyBtn.innerHTML = successText;
    copyBtn.style.background = "#28a745";
    
    const successMessage = currentLang === 'bn' ? 
      "কোড সফলভাবে কপি হয়েছে!" :
      "Code copied successfully!";
    showToast(successMessage, "success");
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = "";
      copyBtn.disabled = false;
    }, 2000);
    
  } catch (error) {
    const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
    const errorText = currentLang === 'bn' ? 
      '<i class="fas fa-times"></i> ব্যর্থ!' :
      '<i class="fas fa-times"></i> Failed!';
    copyBtn.innerHTML = errorText;
    copyBtn.style.background = "#dc3545";
    
    const errorMessage = currentLang === 'bn' ? 
      "কপি করতে সমস্যা হয়েছে।" :
      "Failed to copy.";
    showToast(errorMessage, "error");
    
    setTimeout(() => {
      const originalText = currentLang === 'bn' ? 
        '<i class="fas fa-copy"></i> কপি করুন' :
        '<i class="fas fa-copy"></i> Copy';
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = "";
      copyBtn.disabled = false;
    }, 2000);
  }
}

// ✅ Enhanced Form Validation
function validateForm() {
  const requiredFields = [
    { id: 'name', label: 'প্রোডাক্ট নাম' },
    { id: 'code', label: 'প্রোডাক্ট কোড' },
    { id: 'price', label: 'মূল্য' },
    { id: 'wa', label: 'WhatsApp নম্বর' }
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
      addErrorMessage(element, `${field.label} বাধ্যতামূলক`);
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
    addErrorMessage(firstImgInput, 'কমপক্ষে একটি ছবি প্রয়োজন');
    errors.push('প্রোডাক্ট ছবি');
    isValid = false;
  }
  
  // Validate WhatsApp number format
  const waInput = document.getElementById('wa');
  if (waInput.value.trim() && !waInput.value.match(/^8801[0-9]{9}$/)) {
    waInput.classList.add('form-error');
    addErrorMessage(waInput, 'সঠিক ফরম্যাট: 8801XXXXXXXXX');
    isValid = false;
  }
  
  // Validate price
  const priceInput = document.getElementById('price');
  const price = parseFloat(priceInput.value);
  if (priceInput.value.trim() && (isNaN(price) || price <= 0)) {
    priceInput.classList.add('form-error');
    addErrorMessage(priceInput, 'সঠিক মূল্য দিন');
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
      const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
      const message = currentLang === 'bn' ? 
        "স্বয়ংক্রিয় সংরক্ষণ সম্পন্ন" :
        "Auto-save completed";
      showToast(message, "info");
    }
  }, 30000);
}

function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// ✅ Enhanced Theme Download with Progress
function downloadTheme() {
  const downloadBtn = document.getElementById("downloadThemeBtn");
  const downloadTimer = document.getElementById("downloadTimer");
  let timeLeft = 5;

  downloadBtn.disabled = true;
  downloadBtn.classList.add('loading');
  downloadTimer.style.display = "block";
  
  const updateTimer = () => {
    const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
    const timerText = currentLang === 'bn' ? 
      `ডাউনলোড শুরু হচ্ছে ${timeLeft} সেকেন্ড পর...` :
      `Download starting in ${timeLeft} seconds...`;
      
    downloadTimer.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;color:#ffc107;">
        <i class="fas fa-clock"></i>
        <span>${timerText}</span>
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
      
      const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
      const confirmMessage = currentLang === 'bn' ? 
        `🎨 G9Tool থিম ডাউনলোড করুন\n\nএই থিমটি আপনার ব্লগার সাইটের জন্য বিশেষভাবে ডিজাইন করা হয়েছে।\n\n✅ G9Tool এর সাথে সামঞ্জস্যপূর্ণ\n✅ রেসপনসিভ ডিজাইন\n✅ দ্রুত লোডিং\n✅ SEO অপ্টিমাইজড\n\nআপনি কি ডাউনলোড করতে চান?` :
        `🎨 Download G9Tool Theme\n\nThis theme is specially designed for your Blogger site.\n\n✅ Compatible with G9Tool\n✅ Responsive Design\n✅ Fast Loading\n✅ SEO Optimized\n\nDo you want to download?`;
      
      const confirmDownload = confirm(confirmMessage);
      
      if (confirmDownload) {
        const a = document.createElement("a");
        a.href = "https://github.com/mehedi-exx/G9-Tool/releases/download/G9Tool/G9Tool.xml";
        a.download = "G9Tool_Theme.xml";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        const successText = currentLang === 'bn' ? 
          '<i class="fas fa-check"></i> ডাউনলোড সম্পন্ন!' :
          '<i class="fas fa-check"></i> Download Complete!';
        downloadBtn.innerHTML = successText;
        downloadBtn.style.background = "#28a745";
        
        const successMessage = currentLang === 'bn' ? 
          "🎉 থিম সফলভাবে ডাউনলোড হয়েছে!" :
          "🎉 Theme downloaded successfully!";
        showToast(successMessage, "success");
        
        setTimeout(() => {
          const originalText = currentLang === 'bn' ? 
            '<i class="fab fa-blogger-b"></i> ডাউনলোড থিম' :
            '<i class="fab fa-blogger-b"></i> Download Theme';
          downloadBtn.innerHTML = originalText;
          downloadBtn.style.background = "";
        }, 3000);
      } else {
        const cancelMessage = currentLang === 'bn' ? 
          "ডাউনলোড বাতিল করা হয়েছে।" :
          "Download cancelled.";
        showToast(cancelMessage, "info");
      }
      
      downloadBtn.disabled = false;
    }
  }, 1000);
}

// ✅ Enhanced Keyboard Shortcuts
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
      const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
      const message = currentLang === 'bn' ? 
        "ড্রাফট সংরক্ষিত হয়েছে!" :
        "Draft saved!";
      showToast(message, "success");
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

// ✅ Enhanced Event Listeners
window.addEventListener("DOMContentLoaded", async () => {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
    return;
  }

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  // Wait for language manager to initialize
  if (window.languageManager) {
    await window.languageManager.init();
  } else {
    // Fallback to old language system
    const savedLang = localStorage.getItem("language") || "en";
    await loadLanguage(savedLang);
  }

  applyFieldVisibility();

  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      const validation = validateForm();
      if (validation.isValid) {
        generateProduct();
      } else {
        const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
        const errorMessage = currentLang === 'bn' ? 
          `অনুগ্রহ করে নিম্নলিখিত ক্ষেত্রগুলি পূরণ করুন: ${validation.errors.join(', ')}` :
          `Please fill in the following fields: ${validation.errors.join(', ')}`;
        showToast(errorMessage, "error");
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
    const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
    const message = currentLang === 'bn' ? 
      "ড্রাফট লোড করা হয়েছে। এডিট করুন এবং আপডেট করুন।" :
      "Draft loaded. Edit and update.";
    showToast(message, "info");
  }
  
  const formInputs = document.querySelectorAll('input, textarea, select');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('form-error', 'form-success');
      const errorMsg = input.parentNode.querySelector('.error-message');
      if (errorMsg) errorMsg.remove();
    });
  });
});

window.addEventListener("beforeunload", () => {
  stopAutoSave();
});

// ✅ Expose functions to global scope
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.addImageField = addImageInput;
window.addCustomField = addCustomField;
window.downloadTheme = downloadTheme;
window.copyToClipboard = copyToClipboard;
window.validateForm = validateForm;


// ✅ Enhanced Theme Toggle Function
function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  applyTheme(newTheme);
  
  const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
  const message = currentLang === 'bn' ? 
    `থিম পরিবর্তন করা হয়েছে: ${newTheme === 'dark' ? 'ডার্ক মোড' : 'লাইট মোড'}` :
    `Theme changed to: ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`;
  showToast(message, "info");
}

// ✅ Expose theme toggle to global scope
window.toggleTheme = toggleTheme;


// ✅ Clear Form Function
function clearForm() {
  const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
  const confirmMessage = currentLang === 'bn' ? 
    "আপনি কি নিশ্চিত যে ফর্মটি পরিষ্কার করতে চান? সমস্ত তথ্য মুছে যাবে।" :
    "Are you sure you want to clear the form? All information will be lost.";
    
  if (confirm(confirmMessage)) {
    // Clear all input fields
    document.querySelectorAll('#formFields input, #formFields textarea, #formFields select').forEach(field => {
      field.value = '';
      field.classList.remove('form-error', 'form-success');
    });
    
    // Clear error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Reset image inputs to just one
    const imageInputs = document.getElementById('imageInputs');
    imageInputs.innerHTML = `
      <div class="form-group">
        <label data-i18n="first_image_label">প্রধান ছবি *</label>
        <div class="input-with-icon">
          <span class="input-icon">
            <i class="fas fa-image"></i>
          </span>
          <input type="url" class="img-url" placeholder="ছবির লিংক (Image URL)" data-i18n="image_url" required>
        </div>
        <div class="field-hint" data-i18n="image_hint">প্রোডাক্টের প্রধান ছবির URL</div>
      </div>
    `;
    
    // Reset custom fields to just one
    const customFields = document.getElementById('customFields');
    customFields.innerHTML = `
      <div class="custom-field-group">
        <div class="form-group">
          <input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি" data-i18n="custom_field_title">
        </div>
        <div class="form-group">
          <input type="text" class="custom-value" placeholder="মান যেমন: ৩ মাস" data-i18n="custom_field_value">
        </div>
      </div>
    `;
    
    // Clear output
    document.getElementById('output').innerHTML = '';
    document.getElementById('preview').innerHTML = '';
    
    // Show success message
    const successMessage = currentLang === 'bn' ? 
      "ফর্ম সফলভাবে পরিষ্কার করা হয়েছে।" :
      "Form cleared successfully.";
    showToast(successMessage, "success");
    
    // Focus on first input
    document.getElementById('name').focus();
  }
}

// ✅ Expose clear form to global scope
window.clearForm = clearForm;

