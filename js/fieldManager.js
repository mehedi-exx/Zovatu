import { showToast, loadLanguage, translateElement } from './utils.js';

const mandatoryFields = [
  { key: "product_name", icon: "fas fa-tag" },
  { key: "product_code", icon: "fas fa-barcode" },
  { key: "price", icon: "fas fa-money-bill" },
  { key: "whatsapp_number", icon: "fab fa-whatsapp" },
  { key: "image_url", icon: "fas fa-image" }
];

const optionalFields = [
  { key: "offer_price", icon: "fas fa-percent" },
  { key: "unit", icon: "fas fa-weight" },
  { key: "quantity", icon: "fas fa-sort-numeric-up" },
  { key: "brand_company", icon: "fas fa-building" },
  { key: "size_option", icon: "fas fa-expand-arrows-alt" },
  { key: "color_option", icon: "fas fa-palette" },
  { key: "delivery_time", icon: "fas fa-truck" },
  { key: "status", icon: "fas fa-info-circle" },
  { key: "category", icon: "fas fa-list" },
  { key: "product_description", icon: "fas fa-align-left" },
  { key: "youtube_video_link", icon: "fab fa-youtube" },
  { key: "add_custom_info", icon: "fas fa-plus-circle" }
];

const form = document.getElementById("fieldManagerForm");

export async function renderFields() {
  const savedVisibility = JSON.parse(localStorage.getItem("fieldVisibility") || "{}");
  form.innerHTML = "";

  // Add header section
  const headerDiv = document.createElement("div");
  headerDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #2a2a2a; border-radius: 10px;">
      <h2 style="color: #00bfff; margin: 0 0 10px 0; font-size: 24px;">
        <i class="fas fa-cog"></i> <span data-lang="field_customize"></span>
      </h2>
      <p style="color: #ccc; margin: 0; font-size: 16px;">
        <span data-lang="field_customize_description"></span>
      </p>
    </div>
  `;
  form.appendChild(headerDiv);

  // Mandatory fields section
  const mandatorySection = document.createElement("div");
  mandatorySection.innerHTML = `
    <h3 style="color: #28a745; margin: 20px 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-lock"></i> <span data-lang="mandatory_fields"></span>
    </h3>
  `;
  form.appendChild(mandatorySection);

  mandatoryFields.forEach(field => {
    const div = document.createElement("div");
    div.className = "field-group";
    div.style.opacity = "0.7";
    div.innerHTML = `
      <label class="field-label">
        <i class="${field.icon}" style="color: #28a745; margin-right: 8px;"></i>
        <span data-lang="${field.key}"></span> 
        <small style="color: #28a745; font-weight: bold;" data-lang="mandatory"></small>
      </label>
      <input type="checkbox" checked disabled style="cursor: not-allowed;" />
    `;
    form.appendChild(div);
  });

  // Optional fields section
  const optionalSection = document.createElement("div");
  optionalSection.innerHTML = `
    <h3 style="color: #ffc107; margin: 30px 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-toggle-on"></i> <span data-lang="optional_fields"></span>
    </h3>
    <p style="color: #888; margin-bottom: 20px; font-size: 14px;">
      <span data-lang="optional_fields_description"></span>
    </p>
  `;
  form.appendChild(optionalSection);

  optionalFields.forEach(field => {
    const div = document.createElement("div");
    div.className = "field-group";

    const isChecked = savedVisibility[field.key] !== false;
    div.innerHTML = `
      <label class="field-label" for="${field.key}">
        <i class="${field.icon}" style="color: #00bfff; margin-right: 8px;"></i>
        <span data-lang="${field.key}"></span>
      </label>
      <input type="checkbox" id="${field.key}" ${isChecked ? "checked" : ""} onchange="updateFieldPreview()" />
    `;
    form.appendChild(div);
  });

  // Add preview section
  const previewSection = document.createElement("div");
  previewSection.innerHTML = `
    <div style="margin-top: 30px; padding: 20px; background: #2a2a2a; border-radius: 10px;">
      <h3 style="color: #00bfff; margin: 0 0 15px 0; font-size: 18px;">
        <i class="fas fa-eye"></i> <span data-lang="preview"></span>
      </h3>
      <div id="fieldPreview" style="color: #ccc; font-size: 14px;"></div>
    </div>
  `;
  form.appendChild(previewSection);

  updateFieldPreview();
  await translateElement(document.body);
}

export function updateFieldPreview() {
  const previewDiv = document.getElementById("fieldPreview");
  if (!previewDiv) return;

  const savedVisibility = JSON.parse(localStorage.getItem("fieldVisibility") || "{}");
  let activeFields = [...mandatoryFields];
  
  optionalFields.forEach(field => {
    const checkbox = document.getElementById(field.key);
    if (checkbox && checkbox.checked) {
      activeFields.push(field);
    }
  });

  // Translate field labels for preview
  const currentLanguageData = JSON.parse(localStorage.getItem("languageData") || "{}");
  const translatedActiveFields = activeFields.map(field => {
    return {
      ...field,
      label: currentLanguageData[field.key] || field.key // Use translated label or key as fallback
    };
  });

  previewDiv.innerHTML = `
    <p><strong data-lang="active_fields_count"></strong>: ${translatedActiveFields.length}</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">
      ${translatedActiveFields.map(field => `
        <div style="background: #333; padding: 8px 12px; border-radius: 6px; font-size: 13px;">
          <i class="${field.icon}" style="color: ${mandatoryFields.some(mf => mf.key === field.key) ? '#28a745' : '#00bfff'}; margin-right: 6px;"></i>
          ${field.label}
        </div>
      `).join("")}
    </div>
  `;
  translateElement(previewDiv);
}

export function saveSettings() {
  const newVisibility = {};
  let changedCount = 0;
  
  optionalFields.forEach(field => {
    const checkbox = document.getElementById(field.key);
    const oldValue = JSON.parse(localStorage.getItem("fieldVisibility") || "{}")[field.key];
    const newValue = checkbox.checked;
    
    newVisibility[field.key] = newValue;
    
    if (oldValue !== newValue) {
      changedCount++;
    }
  });

  localStorage.setItem("fieldVisibility", JSON.stringify(newVisibility));
  
  if (changedCount > 0) {
    showToast(`${changedCount} <span data-lang="fields_updated_message"></span>`);
  } else {
    showToast("<span data-lang="no_changes_made"></span>");
  }
  
  // Add visual feedback
  const saveBtn = document.querySelector(".save-btn");
  const originalText = saveBtn.textContent;
  saveBtn.textContent = "✓ <span data-lang="saved"></span>!";
  saveBtn.style.background = "#28a745";
  
  setTimeout(() => {
    saveBtn.textContent = originalText;
    saveBtn.style.background = "#28a745";
    translateElement(saveBtn);
  }, 2000);
}

export function resetToDefault() {
  if (confirm("Are you sure you want to reset all fields to default?")) {
    localStorage.removeItem("fieldVisibility");
    renderFields();
    showToast("<span data-lang="fields_reset_message"></span>");
  }
}

// Expose functions to global scope for onclick handlers
window.saveSettings = saveSettings;
window.updateFieldPreview = updateFieldPreview;
window.resetToDefault = resetToDefault;

export function checkLogin() {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  checkLogin();
  
  // Load language
  const savedLang = localStorage.getItem("language") || "en"; // Default to English
  await loadLanguage(savedLang);
  
  renderFields();
});


