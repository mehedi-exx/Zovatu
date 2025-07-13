let translations = {};

export const getVal = id => document.getElementById(id)?.value.trim();

export function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    const newContainer = document.createElement("div");
    newContainer.id = "toast-container";
    document.body.appendChild(newContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;

  if (type === "success") {
    toast.querySelector("i").className = "fas fa-check-circle";
  } else if (type === "error") {
    toast.querySelector("i").className = "fas fa-times-circle";
  } else if (type === "warning") {
    toast.querySelector("i").className = "fas fa-exclamation-triangle";
  } else if (type === "info") {
    toast.querySelector("i").className = "fas fa-info-circle";
  }

  document.getElementById("toast-container").appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 3000);
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


