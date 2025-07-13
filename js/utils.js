let translations = {};

export const getVal = id => document.getElementById(id)?.value.trim();

export function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    z-index: 9999;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export async function loadLanguage(lang) {
  try {
    const response = await fetch(`./languages/${lang}.json`);
    translations = await response.json();
    applyTranslations();
  } catch (error) {
    console.error("Error loading language file:", error);
  }
}

export function translateElement(key) {
  return translations[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.getAttribute("data-i18n");
    if (translations[key]) {
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = translations[key];
      } else {
        element.textContent = translations[key];
      }
    }
  });
}


