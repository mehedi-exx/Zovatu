import { showToast } from './utils.js';

const mandatoryFields = [
  { key: "name", label: "Product Name", icon: "fas fa-tag" },
  { key: "code", label: "Product Code", icon: "fas fa-barcode" },
  { key: "price", label: "Price (৳)", icon: "fas fa-money-bill" },
  { key: "wa", label: "WhatsApp Number", icon: "fab fa-whatsapp" },
  { key: "images", label: "Image Link", icon: "fas fa-image" }
];

const optionalFields = [
  { key: "offer", label: "Offer Price (Optional)", icon: "fas fa-percent" },
  { key: "unit", label: "Unit (e.g., pcs, kg)", icon: "fas fa-weight" },
  { key: "qty", label: "Quantity (Qty)", icon: "fas fa-sort-numeric-up" },
  { key: "brand", label: "Brand / Company", icon: "fas fa-building" },
  { key: "size", label: "Size Option", icon: "fas fa-expand-arrows-alt" },
  { key: "color", label: "Color Option", icon: "fas fa-palette" },
  { key: "delivery", label: "Delivery Time", icon: "fas fa-truck" },
  { key: "status", label: "Status", icon: "fas fa-info-circle" },
  { key: "category", label: "Category", icon: "fas fa-list" },
  { key: "desc", label: "Product Description", icon: "fas fa-align-left" },
  { key: "video", label: "Video Link (YouTube)", icon: "fab fa-youtube" },
  { key: "customFields", label: "Custom Info", icon: "fas fa-plus-circle" }
];

const form = document.getElementById("fieldManagerForm");

export function renderFields() {
  const savedVisibility = JSON.parse(localStorage.getItem("fieldVisibility") || "{}");
  form.innerHTML = "";

  const headerDiv = document.createElement("div");
  headerDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #2a2a2a; border-radius: 10px;">
      <h2 style="color: #00bfff; margin: 0 0 10px 0; font-size: 24px;">
        <i class="fas fa-cog"></i> Field Customization
      </h2>
      <p style="color: #ccc; margin: 0; font-size: 16px;">
        Enable or disable form fields as per your needs
      </p>
    </div>
  `;
  form.appendChild(headerDiv);

  const mandatorySection = document.createElement("div");
  mandatorySection.innerHTML = `
    <h3 style="color: #28a745; margin: 20px 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-lock"></i> Mandatory Fields
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
        ${field.label} 
        <small style="color: #28a745; font-weight: bold;">(Required)</small>
      </label>
      <input type="checkbox" checked disabled style="cursor: not-allowed;" />
    `;
    form.appendChild(div);
  });

  const optionalSection = document.createElement("div");
  optionalSection.innerHTML = `
    <h3 style="color: #ffc107; margin: 30px 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-toggle-on"></i> Optional Fields
    </h3>
    <p style="color: #888; margin-bottom: 20px; font-size: 14px;">
      You can enable or disable the following fields based on your preference
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
        ${field.label}
      </label>
      <input type="checkbox" id="${field.key}" ${isChecked ? "checked" : ""} onchange="updateFieldPreview()" />
    `;
    form.appendChild(div);
  });

  const previewSection = document.createElement("div");
  previewSection.innerHTML = `
    <div style="margin-top: 30px; padding: 20px; background: #2a2a2a; border-radius: 10px;">
      <h3 style="color: #00bfff; margin: 0 0 15px 0; font-size: 18px;">
        <i class="fas fa-eye"></i> Preview
      </h3>
      <div id="fieldPreview" style="color: #ccc; font-size: 14px;"></div>
    </div>
  `;
  form.appendChild(previewSection);

  updateFieldPreview();
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

  previewDiv.innerHTML = `
    <p><strong>Active Fields:</strong> ${activeFields.length}</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">
      ${activeFields.map(field => `
        <div style="background: #333; padding: 8px 12px; border-radius: 6px; font-size: 13px;">
          <i class="${field.icon}" style="color: ${mandatoryFields.includes(field) ? '#28a745' : '#00bfff'}; margin-right: 6px;"></i>
          ${field.label}
        </div>
      `).join('')}
    </div>
  `;
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
    showToast(`${changedCount} field(s) updated! Check dashboard for changes.`);
  } else {
    showToast("No changes made.");
  }

  const saveBtn = document.querySelector('.save-btn');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = '✓ Saved!';
  saveBtn.style.background = '#28a745';

  setTimeout(() => {
    saveBtn.textContent = originalText;
    saveBtn.style.background = '#28a745';
  }, 2000);
}

export function resetToDefault() {
  if (confirm("Do you want to reset all fields to default?")) {
    localStorage.removeItem("fieldVisibility");
    renderFields();
    showToast("All fields have been reset to default!");
  }
}

window.saveSettings = saveSettings;
window.updateFieldPreview = updateFieldPreview;
window.resetToDefault = resetToDefault;

export function checkLogin() {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  checkLogin();
  renderFields();
});
