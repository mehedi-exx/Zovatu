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

async function applyLanguage(lang) {
  await loadLanguage(lang);
  localStorage.setItem("language", lang);
  showToast(translateElement("language_changed") + `: ${lang}`);
}

// ✅ Event Listeners
window.addEventListener("DOMContentLoaded", async () => {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
  }
  applyFieldVisibility();

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));
  }

  const savedLang = localStorage.getItem("language") || "bn";
  await applyLanguage(savedLang);
  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener("change", (e) => applyLanguage(e.target.value));
  }

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



