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
  const currentLang = localStorage.getItem("language") || "en";
  const confirmMessage = currentLang === "bn" ? "আপনি কি নিশ্চিত যে লগ আউট করতে চান?" : "Are you sure you want to logout?";
  const loggingOutMessage = currentLang === "bn" ? "লগ আউট হচ্ছে..." : "Logging out...";
  const successMessage = currentLang === "bn" ? "সফলভাবে লগ আউট হয়েছে।" : "Successfully logged out.";
  
  if (confirm(confirmMessage)) {
    const logoutBtn = document.querySelector('a[onclick="logout()"]');
    if (logoutBtn) {
      logoutBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loggingOutMessage}`;
    }
    
    setTimeout(() => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("editDraftId");
      showToast(successMessage);
      window.location.replace("index.html");
    }, 1000);
  }
}

// ✅ Enhanced Language Switching with Persistence
async function switchLanguage() {
  const currentLang = localStorage.getItem("language") || "en";
  const newLang = currentLang === "en" ? "bn" : "en";
  
  // Show loading state
  const langBtn = document.querySelector('a[onclick="switchLanguage()"]');
  if (langBtn) {
    const originalContent = langBtn.innerHTML;
    langBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    try {
      await loadLanguage(newLang);
      localStorage.setItem("language", newLang);
      
      // Update currency symbol based on language
      updateCurrencySymbol();
      
      // Re-apply field visibility after language change
      applyFieldVisibility();
      
      showToast(newLang === "bn" ? "ভাষা পরিবর্তন করা হয়েছে" : "Language changed successfully");
    } catch (error) {
      showToast("Language switching failed", "error");
      langBtn.innerHTML = originalContent;
    }
  }
}

// ✅ Update Currency Symbol Based on Settings
function updateCurrencySymbol() {
  const savedCurrency = localStorage.getItem("selectedCurrency") || "৳";
  const priceInputs = document.querySelectorAll('input[placeholder*="৳"], input[placeholder*="$"], input[placeholder*="€"], input[placeholder*="£"], input[placeholder*="₹"], input[placeholder*="¥"], input[placeholder*="₽"], input[placeholder*="₩"]');
  
  priceInputs.forEach(input => {
    const currentPlaceholder = input.placeholder;
    // Replace any currency symbol with the selected one
    const newPlaceholder = currentPlaceholder.replace(/[৳$€£₹¥₽₩]/g, savedCurrency);
    input.placeholder = newPlaceholder;
  });
}

// ✅ Enhanced Theme Switching
function switchTheme() {
  const currentTheme = localStorage.getItem("theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.body.classList.remove(`${currentTheme}-theme`);
  document.body.classList.add(`${newTheme}-theme`);
  
  localStorage.setItem("theme", newTheme);
  
  const themeBtn = document.querySelector('a[onclick="switchTheme()"]');
  if (themeBtn) {
    const icon = newTheme === "dark" ? "fas fa-moon" : "fas fa-sun";
    const text = newTheme === "dark" ? "Dark Mode" : "Light Mode";
    themeBtn.innerHTML = `<i class="${icon}"></i> ${text}`;
  }
  
  showToast(`${newTheme === "dark" ? "Dark" : "Light"} mode activated`);
}

// ✅ Enhanced Search Functionality
function searchProducts() {
  const searchTerm = getVal("searchInput").toLowerCase();
  const productCards = document.querySelectorAll(".product-card");
  let visibleCount = 0;
  
  productCards.forEach(card => {
    const productName = card.querySelector(".product-name")?.textContent.toLowerCase() || "";
    const productCode = card.querySelector(".product-code")?.textContent.toLowerCase() || "";
    
    if (productName.includes(searchTerm) || productCode.includes(searchTerm)) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });
  
  // Update search results count
  const resultsCount = document.getElementById("searchResults");
  if (resultsCount) {
    const currentLang = localStorage.getItem("language") || "en";
    const message = currentLang === "bn" ? 
      `${visibleCount}টি পণ্য পাওয়া গেছে` : 
      `${visibleCount} products found`;
    resultsCount.textContent = message;
  }
}

// ✅ Enhanced Login Check
function checkLogin() {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
  }
}

// ✅ Enhanced Initialization
window.addEventListener("DOMContentLoaded", async () => {
  checkLogin();
  
  // Load saved language (default to English)
  const savedLang = localStorage.getItem("language") || "en";
  await loadLanguage(savedLang);
  
  // Apply saved theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.add(`${savedTheme}-theme`);
  
  // Update currency symbols
  updateCurrencySymbol();
  
  // Apply field visibility
  applyFieldVisibility();
  
  // Initialize search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", searchProducts);
  }
  
  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.focus();
    }
    
    // Escape to close sidebar
    if (e.key === "Escape") {
      const sidebar = document.getElementById("sidebar");
      if (sidebar && sidebar.classList.contains("open")) {
        toggleSidebar();
      }
    }
  });
});

// ✅ Expose functions to global scope
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.switchLanguage = switchLanguage;
window.switchTheme = switchTheme;
window.searchProducts = searchProducts;
window.generateProduct = generateProduct;
window.addImageInput = addImageInput;
window.addCustomField = addCustomField;
window.saveDraft = saveDraft;
window.loadDraftToForm = loadDraftToForm;

