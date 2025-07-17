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
  if (confirm("আপনি কি নিশ্চিত যে লগ আউট করতে চান?")) {
    const logoutBtn = document.querySelector('a[onclick="logout()"]');
    if (logoutBtn) {
      logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> লগ আউট হচ্ছে...';
    }
    
    setTimeout(() => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("editDraftId");
      showToast("সফলভাবে লগ আউট হয়েছে।");
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

// ✅ Professional Language Switching
function switchLanguage(lang) {
  // Update active button state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    }
  });
  
  // Apply language with smooth transition
  applyLanguage(lang, true);
}

// ✅ Enhanced Language Management
async function applyLanguage(lang, showToastOnUpdate = false) {
  try {
    // Show loading state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.7';
    });
    
    await 
    localStorage.setItem("language", lang);
    
    // Update active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      }
    });
    
    if (showToastOnUpdate) {
      showToast(translateElement("language_changed") + `: ${lang === 'bn' ? '' : 'English'}`);
    }
  } catch (error) {
    showToast("ভাষা পরিবর্তনে সমস্যা হয়েছে।", "error");
  } finally {
    // Restore button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
    });
  }
}

// ✅ Update Currency Symbol in Price Fields
function updateCurrencySymbol() {
  const currency = localStorage.getItem("selectedCurrency") || "৳";
  const priceField = document.getElementById("price");
  const offerField = document.getElementById("offer");
  
  if (priceField) {
    priceField.placeholder = `মূল্য (${currency})`;
  }
  if (offerField) {
    offerField.placeholder = `অফার মূল্য (${currency}) (ঐচ্ছিক)`;
  }
}

// ✅ Enhanced Copy Functionality
async function copyToClipboard() {
  const output = document.getElementById("output").textContent;
  const copyBtn = document.getElementById("copyBtn");
  
  if (!output.trim()) {
    showToast("কপি করার জন্য কোনো কোড নেই। প্রথমে প্রোডাক্ট জেনারেট করুন।", "warning");
    return;
  }
  
  try {
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> কপি হচ্ছে...';
    copyBtn.disabled = true;
    
    await navigator.clipboard.writeText(output);
    
    copyBtn.innerHTML = '<i class="fas fa-check"></i> কপি হয়েছে!';
    copyBtn.style.background = "#28a745";
    showToast("কোড সফলভাবে কপি হয়েছে!", "success");
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = "";
      copyBtn.disabled = false;
    }, 2000);
    
  } catch (error) {
    copyBtn.innerHTML = '<i class="fas fa-times"></i> ব্যর্থ!';
    copyBtn.style.background = "#dc3545";
    showToast("কপি করতে সমস্যা হয়েছে।", "error");
    
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fas fa-copy"></i> কপি করুন';
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
      showToast("স্বয়ংক্রিয় সংরক্ষণ সম্পন্ন", "info");
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
    downloadTimer.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;color:#ffc107;">
        <i class="fas fa-clock"></i>
        <span>ডাউনলোড শুরু হচ্ছে ${timeLeft} সেকেন্ড পর...</span>
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
      
      const confirmDownload = confirm(`🎨 Zovatu থিম ডাউনলোড করুন\n\nএই থিমটি আপনার ব্লগার সাইটের জন্য বিশেষভাবে ডিজাইন করা হয়েছে।\n\n✅ Zovatu এর সাথে সামঞ্জস্যপূর্ণ\n✅ রেসপনসিভ ডিজাইন\n✅ দ্রুত লোডিং\n✅ SEO অপ্টিমাইজড\n\nআপনি কি ডাউনলোড করতে চান?`);
      
      if (confirmDownload) {
        const a = document.createElement("a");
        a.href = "https://github.com/mehedi-exx/G9-Tool/releases/download/Zovatu/Zovatu.xml";
        a.download = "Zovatu_Theme.xml";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> ডাউনলোড সম্পন্ন!';
        downloadBtn.style.background = "#28a745";
        showToast("🎉 থিম সফলভাবে ডাউনলোড হয়েছে!", "success");
        
        setTimeout(() => {
          downloadBtn.innerHTML = '<i class="fab fa-blogger-b"></i> ডাউনলোড থিম';
          downloadBtn.style.background = "";
        }, 3000);
      } else {
        showToast("ডাউনলোড বাতিল করা হয়েছে।", "info");
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
      showToast("ড্রাফট সংরক্ষিত হয়েছে!", "success");
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

  const savedLang = localStorage.getItem("language") || "en"; // Default to English
  await applyLanguage(savedLang, false);
  
  // Initialize language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.lang === savedLang) {
      btn.classList.add('active');
    }
  });

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
        showToast(`অনুগ্রহ করে নিম্নলিখিত ক্ষেত্রগুলি পূরণ করুন: ${validation.errors.join(', ')}`, "error");
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
    showToast("ড্রাফট লোড করা হয়েছে। এডিট করুন এবং আপডেট করুন।", "info");
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

// ✅ Expose functions to global scope
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.addImageField = addImageInput;
window.addCustomField = addCustomField;
window.downloadTheme = downloadTheme;
window.copyToClipboard = copyToClipboard;
window.validateForm = validateForm;
window.switchLanguage = switchLanguage;
window.updateCurrencySymbol = updateCurrencySymbol;

