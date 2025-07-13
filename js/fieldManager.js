import { showToast, loadLanguage } from './utils.js';

const mandatoryFields = [
  { key: "name", label: "প্রোডাক্ট নাম", icon: "fas fa-tag" },
  { key: "code", label: "প্রোডাক্ট কোড", icon: "fas fa-barcode" },
  { key: "price", label: "মূল্য প্রাইস (৳)", icon: "fas fa-money-bill" },
  { key: "wa", label: "WhatsApp নম্বর", icon: "fab fa-whatsapp" },
  { key: "images", label: "ছবির লিংক", icon: "fas fa-image" }
];

const optionalFields = [
  { key: "offer", label: "অফার প্রাইস (ঐচ্ছিক)", icon: "fas fa-percent" },
  { key: "unit", label: "ইউনিট (যেমন: পিস, কেজি)", icon: "fas fa-weight" },
  { key: "qty", label: "পরিমাণ (Qty)", icon: "fas fa-sort-numeric-up" },
  { key: "brand", label: "ব্র্যান্ড / কোম্পানি", icon: "fas fa-building" },
  { key: "size", label: "সাইজ অপশন", icon: "fas fa-expand-arrows-alt" },
  { key: "color", label: "রঙ অপশন", icon: "fas fa-palette" },
  { key: "delivery", label: "ডেলিভারি টাইম", icon: "fas fa-truck" },
  { key: "status", label: "স্ট্যাটাস", icon: "fas fa-info-circle" },
  { key: "category", label: "ক্যাটাগরি", icon: "fas fa-list" },
  { key: "desc", label: "প্রোডাক্ট বর্ণনা", icon: "fas fa-align-left" },
  { key: "video", label: "ভিডিও লিংক (YouTube)", icon: "fab fa-youtube" },
  { key: "customFields", label: "কাস্টম তথ্য", icon: "fas fa-plus-circle" }
];

const form = document.getElementById("fieldManagerForm");

export function renderFields() {
  const savedVisibility = JSON.parse(localStorage.getItem("fieldVisibility") || "{}");
  form.innerHTML = "";

  // Add header section
  const headerDiv = document.createElement("div");
  headerDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #2a2a2a; border-radius: 10px;">
      <h2 style="color: #00bfff; margin: 0 0 10px 0; font-size: 24px;">
        <i class="fas fa-cog"></i> ফিল্ড কাস্টমাইজেশন
      </h2>
      <p style="color: #ccc; margin: 0; font-size: 16px;">
        আপনার প্রয়োজন অনুযায়ী ফর্ম ফিল্ডগুলো চালু বা বন্ধ করুন
      </p>
    </div>
  `;
  form.appendChild(headerDiv);

  // Mandatory fields section
  const mandatorySection = document.createElement("div");
  mandatorySection.innerHTML = `
    <h3 style="color: #28a745; margin: 20px 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-lock"></i> বাধ্যতামূলক ফিল্ড
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
        <small style="color: #28a745; font-weight: bold;">(বাধ্যতামূলক)</small>
      </label>
      <input type="checkbox" checked disabled style="cursor: not-allowed;" />
    `;
    form.appendChild(div);
  });

  // Optional fields section
  const optionalSection = document.createElement("div");
  optionalSection.innerHTML = `
    <h3 style="color: #ffc107; margin: 30px 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-toggle-on"></i> ঐচ্ছিক ফিল্ড
    </h3>
    <p style="color: #888; margin-bottom: 20px; font-size: 14px;">
      নিচের ফিল্ডগুলো আপনার প্রয়োজন অনুযায়ী চালু বা বন্ধ করতে পারেন
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

  // Add preview section
  const previewSection = document.createElement("div");
  previewSection.innerHTML = `
    <div style="margin-top: 30px; padding: 20px; background: #2a2a2a; border-radius: 10px;">
      <h3 style="color: #00bfff; margin: 0 0 15px 0; font-size: 18px;">
        <i class="fas fa-eye"></i> প্রিভিউ
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
    <p><strong>সক্রিয় ফিল্ড সংখ্যা:</strong> ${activeFields.length}</p>
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
    showToast(`${changedCount}টি ফিল্ড আপডেট হয়েছে! ড্যাশবোর্ডে পরিবর্তন দেখুন।`);
  } else {
    showToast("কোনো পরিবর্তন হয়নি।");
  }
  
  // Add visual feedback
  const saveBtn = document.querySelector('.save-btn');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = '✓ সংরক্ষিত!';
  saveBtn.style.background = '#28a745';
  
  setTimeout(() => {
    saveBtn.textContent = originalText;
    saveBtn.style.background = '#28a745';
  }, 2000);
}

export function resetToDefault() {
  if (confirm("সব ফিল্ড ডিফল্ট অবস্থায় ফিরিয়ে আনতে চান?")) {
    localStorage.removeItem("fieldVisibility");
    renderFields();
    showToast("সব ফিল্ড ডিফল্ট অবস্থায় ফিরিয়ে আনা হয়েছে!");
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
  const savedLang = localStorage.getItem("language") || "bn";
  await loadLanguage(savedLang);
  
  renderFields();
});

