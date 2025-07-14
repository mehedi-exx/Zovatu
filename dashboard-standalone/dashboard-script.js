import { generateProduct, addImageInput, addCustomField, loadDraftToForm, applyFieldVisibility } from './js/productGenerator.js';
import { showToast, loadLanguage } from './js/utils.js';

let currentLanguage = localStorage.getItem("language") || "en";

// Initialize dashboard
window.addEventListener("DOMContentLoaded", async () => {
  // Check login status
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("../index.html");
    return;
  }

  // Load language
  await loadLanguage(currentLanguage);
  
  // Apply field visibility settings
  applyFieldVisibility();
  
  // Load draft if editing
  const editDraftId = localStorage.getItem("editDraftId");
  if (editDraftId) {
    loadDraftToForm(editDraftId);
  }

  // Set up event listeners
  setupEventListeners();
  
  // Update language selector
  updateLanguageSelector();
});

function setupEventListeners() {
  // Generate button
  document.getElementById("generateBtn").addEventListener("click", generateProduct);
  
  // Copy button
  document.getElementById("copyBtn").addEventListener("click", copyToClipboard);
  
  // Add image field button
  window.addImageField = addImageInput;
  
  // Add custom field button
  window.addCustomField = addCustomField;
}

function copyToClipboard() {
  const output = document.getElementById("output");
  if (!output || !output.textContent.trim()) {
    showToast("❌ কপি করার জন্য কোনো কন্টেন্ট নেই।", "error");
    return;
  }
  
  navigator.clipboard.writeText(output.textContent).then(() => {
    showToast("✅ কপি করা হয়েছে!", "success");
    
    // Visual feedback
    const copyBtn = document.getElementById("copyBtn");
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> কপি হয়েছে!';
    copyBtn.style.background = "#28a745";
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = "";
    }, 2000);
  }).catch(() => {
    showToast("❌ কপি করতে সমস্যা হয়েছে।", "error");
  });
}

// Language switching
window.switchLanguage = async function(lang) {
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  
  const success = await loadLanguage(lang);
  if (success) {
    updateLanguageSelector();
    showToast("✅ ভাষা পরিবর্তন করা হয়েছে!", "success");
  }
};

function updateLanguageSelector() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.lang === currentLanguage) {
      btn.classList.add('active');
    }
  });
}

// Sidebar functionality
window.toggleSidebar = function() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("active");
};

// Logout functionality
window.logout = function() {
  if (confirm("আপনি কি লগ আউট করতে চান?")) {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("editDraftId");
    window.location.replace("../index.html");
  }
};

// Theme download functionality
window.downloadTheme = function() {
  const btn = document.getElementById("downloadThemeBtn");
  const timer = document.getElementById("downloadTimer");
  
  btn.style.display = "none";
  timer.style.display = "block";
  
  let countdown = 5;
  timer.textContent = `ডাউনলোড শুরু হবে ${countdown} সেকেন্ডে...`;
  
  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      timer.textContent = `ডাউনলোড শুরু হবে ${countdown} সেকেন্ডে...`;
    } else {
      clearInterval(interval);
      timer.textContent = "ডাউনলোড শুরু হচ্ছে...";
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('G9 Theme Package - Coming Soon!');
      link.download = 'G9Theme.zip';
      link.click();
      
      setTimeout(() => {
        btn.style.display = "block";
        timer.style.display = "none";
        showToast("✅ থিম ডাউনলোড সম্পন্ন!", "success");
      }, 2000);
    }
  }, 1000);
};

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.querySelector(".menu-btn");
  
  if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
    sidebar.classList.remove("active");
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
  // Ctrl/Cmd + Enter to generate
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    generateProduct();
  }
  
  // Ctrl/Cmd + C to copy (when output is focused)
  if ((event.ctrlKey || event.metaKey) && event.key === 'c' && document.activeElement.id === 'output') {
    event.preventDefault();
    copyToClipboard();
  }
  
  // Escape to close sidebar
  if (event.key === 'Escape') {
    document.getElementById("sidebar").classList.remove("active");
  }
});

