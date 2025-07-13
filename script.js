import { showToast, getVal, loadLanguage, translateElement } from './js/utils.js';
import { generateProduct, addImageInput, addCustomField, saveDraft, loadDraftToForm, applyFieldVisibility } from './js/productGenerator.js';

// ✅ Sidebar Toggle
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}

// ✅ Logout
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.replace("index.html");
}

// ✅ Theme and Language Switching
function applyTheme(theme) {
  document.body.classList.remove("dark-mode", "light-mode");
  document.body.classList.add(theme + "-mode");
  localStorage.setItem("theme", theme);
}

async function applyLanguage(lang, showToastOnUpdate = false) {
  await loadLanguage(lang);
  localStorage.setItem("language", lang);
  if (showToastOnUpdate) {
    showToast(translateElement("language_changed") + `: ${lang}`);
  }
}

// ✅ Event Listeners
window.addEventListener("DOMContentLoaded", async () => {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
  }

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  const savedLang = localStorage.getItem("language") || "bn";
  await applyLanguage(savedLang, false); // Initial load, no toast
  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener("change", async (e) => await applyLanguage(e.target.value, true)); // User change, show toast
  }

  // Apply field visibility after DOM is loaded and language is set
  applyFieldVisibility();

  // Attach event listeners for functions moved to productGenerator.js
  document.getElementById("generateBtn").addEventListener("click", generateProduct);
  document.getElementById("copyBtn")?.addEventListener("click", () => {
    const output = document.getElementById("output").textContent;
    navigator.clipboard.writeText(output).then(() => {
      showToast(translateElement("copied_successfully"));
    });
  });
  document.querySelector("button[onclick=\"addCustomField()\"]").addEventListener("click", addCustomField);
  document.querySelector("button[onclick=\"addImageField()\"]").addEventListener("click", addImageInput);

  const draftId = localStorage.getItem("editDraftId");
  if (draftId) loadDraftToForm(draftId);
});

// Expose functions to global scope for HTML onclick attributes
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.addImageField = addImageInput;
window.addCustomField = addCustomField;





// ✅ Theme Download Functionality
function downloadTheme() {
  const downloadBtn = document.getElementById("downloadThemeBtn");
  const downloadTimer = document.getElementById("downloadTimer");
  let timeLeft = 5;

  downloadBtn.disabled = true;
  downloadTimer.style.display = "block";
  downloadTimer.textContent = `ডাউনলোড শুরু হচ্ছে ${timeLeft} সেকেন্ড পর...`;

  const timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      downloadTimer.textContent = `ডাউনলোড শুরু হচ্ছে ${timeLeft} সেকেন্ড পর...`;
    } else {
      clearInterval(timerInterval);
      downloadTimer.style.display = "none";
      
      if (confirm("আপনি কি থিমটি ডাউনলোড করতে চান?")) {
        // Simulate download - in a real scenario, this would be a fetch to a theme file
        const a = document.createElement("a");
        a.href = "https://github.com/mehedi-exx/G9-Tool/releases/download/G9Tool/G9Tool.xml";
        a.download = "G9Tool_Theme.html";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("থিম ডাউনলোড শুরু হয়েছে!");
      } else {
        showToast("ডাউনলোড বাতিল করা হয়েছে।");
      }
      downloadBtn.disabled = false;
    }
  }, 1000);
}

// Expose to global scope
window.downloadTheme = downloadTheme;


