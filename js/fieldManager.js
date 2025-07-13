import { showToast, loadLanguage, translateElement } from './utils.js';

const mandatoryFields = [
  { key: "name", label: "product_name" },
  { key: "code", label: "product_code" },
  { key: "price", label: "price" },
  { key: "wa", label: "whatsapp_number" },
  { key: "images", label: "image_url" }
];

const optionalFields = [
  { key: "offer", label: "offer_price" },
  { key: "unit", label: "unit" },
  { key: "qty", label: "quantity" },
  { key: "brand", label: "brand_company" },
  { key: "size", label: "size_option" },
  { key: "color", label: "color_option" },
  { key: "delivery", label: "delivery_time" },
  { key: "status", label: "status" },
  { key: "category", label: "category" },
  { key: "desc", label: "product_description" },
  { key: "video", label: "youtube_video_link" },
  { key: "customFields", label: "custom_fields" }
];

const form = document.getElementById("fieldManagerForm");
let savedVisibility = {};

export function renderFields() {
  form.innerHTML = "";
  savedVisibility = JSON.parse(localStorage.getItem("fieldVisibility") || "{}");

  mandatoryFields.forEach(field => {
    const div = document.createElement("div");
    div.className = "field-group";
    div.innerHTML = `
      <label class="field-label">${translateElement(field.label)} <small style="color:#0f0;">(${translateElement("mandatory")})</small></label>
      <input type="checkbox" checked disabled />
    `;
    form.appendChild(div);
  });

  optionalFields.forEach(field => {
    const div = document.createElement("div");
    div.className = "field-group";

    const isChecked = savedVisibility[field.key] !== false;
    div.innerHTML = `
      <label class="field-label" for="${field.key}">${translateElement(field.label)}</label>
      <input type="checkbox" id="${field.key}" ${isChecked ? "checked" : ""} />
    `;
    form.appendChild(div);
  });
}

export function saveSettings() {
  const newVisibility = {};
  optionalFields.forEach(field => {
    const checkbox = document.getElementById(field.key);
    newVisibility[field.key] = checkbox.checked;
  });

  localStorage.setItem("fieldVisibility", JSON.stringify(newVisibility));
  showToast(translateElement("update_successful"));
}

export function checkLogin() {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  checkLogin();
  const savedLang = localStorage.getItem("language") || "bn";
  await loadLanguage(savedLang);
  renderFields();
});

// Expose functions to global scope for HTML onclick attributes
window.saveSettings = saveSettings;
window.renderFields = renderFields;
window.checkLogin = checkLogin;




// Expose functions to global scope
window.saveSettings = saveSettings;
window.renderFields = renderFields;
window.checkLogin = checkLogin;


