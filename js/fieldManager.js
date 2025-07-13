import { showToast } from './utils.js';

const mandatoryFields = [
  { key: "name", label: "প্রোডাক্ট নাম" },
  { key: "code", label: "প্রোডাক্ট কোড" },
  { key: "price", label: "মূল্য প্রাইস (৳)" },
  { key: "wa", label: "WhatsApp নম্বর (8801XXXXXXXXXX)" },
  { key: "images", label: "ছবির লিংক" }
];

const optionalFields = [
  { key: "offer", label: "অফার প্রাইস (ঐচ্ছিক)" },
  { key: "unit", label: "ইউনিট (যেমন: পিস, কেজি)" },
  { key: "qty", label: "পরিমাণ (Qty)" },
  { key: "brand", label: "ব্র্যান্ড / কোম্পানি" },
  { key: "size", label: "সাইজ অপশন (যেমন: S, M, L)" },
  { key: "color", label: "রঙ অপশন (যেমন: লাল, সবুজ)" },
  { key: "delivery", label: "ডেলিভারি টাইম" },
  { key: "status", label: "স্ট্যাটাস" },
  { key: "category", label: "ক্যাটাগরি" },
  { key: "desc", label: "প্রোডাক্ট বর্ণনা" },
  { key: "video", label: "ভিডিও লিংক (YouTube)" },
  { key: "customFields", label: "কাস্টম তথ্য" }
];

const form = document.getElementById("fieldManagerForm");

export function renderFields() {
  const savedVisibility = JSON.parse(localStorage.getItem("fieldVisibility") || "{}");
  form.innerHTML = "";

  mandatoryFields.forEach(field => {
    const div = document.createElement("div");
    div.className = "field-group";
    div.innerHTML = `
      <label class="field-label">${field.label} <small style="color:#0f0;">(বাধ্যতামূলক)</small></label>
      <input type="checkbox" checked disabled />
    `;
    form.appendChild(div);
  });

  optionalFields.forEach(field => {
    const div = document.createElement("div");
    div.className = "field-group";

    const isChecked = savedVisibility[field.key] !== false;
    div.innerHTML = `
      <label class="field-label" for="${field.key}">${field.label}</label>
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
  showToast("আপডেট সফল হয়েছে!");
}

// Expose function to global scope for onclick handler
window.saveSettings = saveSettings;

export function checkLogin() {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  checkLogin();
  renderFields();
});


