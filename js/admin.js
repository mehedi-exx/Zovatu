import { showToast, loadLanguage, translateElement } from './utils.js';

export function getDrafts() {
  return JSON.parse(localStorage.getItem("drafts") || "[]");
}

export function saveDrafts(drafts) {
  localStorage.setItem("drafts", JSON.stringify(drafts));
}

export function renderDrafts() {
  const drafts = getDrafts();
  const search = document.getElementById("searchInput").value.toLowerCase();
  const list = document.getElementById("draftList");
  list.innerHTML = "";

  const filtered = drafts.filter(d => d.name.toLowerCase().includes(search) || d.code.toLowerCase().includes(search));

  if (!filtered.length) {
    list.innerHTML = `<p>❌ ${translateElement("no_drafts_found")}</p>`;
    return;
  }

  filtered.forEach(d => {
    const div = document.createElement("div");
    div.className = "draft-item";
    div.innerHTML = `
      <div class="draft-header">
        <div class="draft-name">🔖 ${d.name} (${d.code})</div>
        <div class="actions">
          <button onclick="editDraft(${d.id})" data-i18n="edit"><i class="fas fa-edit"></i> ${translateElement("edit")}</button>
          <button onclick="deleteDraft(${d.id})" data-i18n="delete"><i class="fas fa-trash"></i> ${translateElement("delete")}</button>
          <button onclick="previewDraft(${d.id})" data-i18n="preview"><i class="fas fa-eye"></i> ${translateElement("preview")}</button>
          <button onclick="verifyDraft(${d.id})" class="verify-btn ${d.verified ? 'verified' : ''}"><i class="fas fa-check-circle"></i> ${d.verified ? translateElement('verified') : translateElement('verify')}</button>
        </div>
      </div>
      <div class="preview" id="preview-${d.id}" style="display:none;"></div>
    `;
    list.appendChild(div);
  });
}

export function editDraft(id) {
  localStorage.setItem("editDraftId", id);
  window.location.href = "dashboard.html";
}

export function deleteDraft(id) {
  if (confirm(translateElement("confirm_delete"))) {
    const drafts = getDrafts().filter(d => d.id !== id);
    saveDrafts(drafts);
    renderDrafts();
    showToast(translateElement("draft_deleted_successfully"));
  }
}

export function previewDraft(id) {
  const previewBox = document.getElementById("preview-" + id);
  if (previewBox.style.display === "block") {
    previewBox.style.display = "none";
    previewBox.innerHTML = "";
    return;
  }

  const drafts = getDrafts();
  const d = drafts.find(d => d.id === id);
  if (!d) return;

  const html = `
    <p><strong>${translateElement("product_name")}:</strong> ${d.name}</p>
    <p><strong>${translateElement("product_code")}:</strong> ${d.code}</p>
    <p><strong>${translateElement("price")}:</strong> ৳${d.price}</p>
    <p><strong>${translateElement("offer_price")}:</strong> ৳${d.offer || translateElement("not_available")}</p>
    <p><strong>${translateElement("whatsapp_number")}:</strong> ${d.wa}</p>
    <p><strong>${translateElement("product_description")}:</strong> ${d.desc}</p>
    ${d.images && d.images.length > 0 ? `<p><strong>${translateElement("images")}:</strong></p>${d.images.map(img => `<img src="${img}" style="width:100px; height:100px; margin:5px; border-radius:5px;">`).join('')}` : ''}
    ${d.customFields && d.customFields.length > 0 ? `<p><strong>${translateElement("custom_fields")}:</strong></p><ul>${d.customFields.map(cf => `<li>${cf.key}: ${cf.value}</li>`).join('')}</ul>` : ''}
  `;
  previewBox.innerHTML = html;
  previewBox.style.display = "block";
}

export function exportDrafts() {
  const data = getDrafts();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "drafts.json";
  a.click();
  showToast(translateElement("export_successful"));
}

export function importDrafts() {
  const file = document.getElementById("importFile").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      const existing = getDrafts();
      const merged = [...existing, ...imported.map(d => ({ ...d, id: Date.now() + Math.random() }))];
      saveDrafts(merged);
      showToast(translateElement("data_import_successful"));
      renderDrafts();
    } catch (e) {
      showToast(translateElement("import_failed"));
    }
  };
  reader.readAsText(file);
}

export function verifyDraft(id) {
  let drafts = getDrafts();
  const index = drafts.findIndex(d => d.id === id);
  if (index !== -1) {
    drafts[index].verified = !drafts[index].verified;
    saveDrafts(drafts);
    renderDrafts();
    showToast(translateElement(drafts[index].verified ? "draft_verified" : "draft_unverified"));
  }
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
  renderDrafts();
});




// Expose functions to global scope for HTML onclick attributes
window.getDrafts = getDrafts;
window.saveDrafts = saveDrafts;
window.renderDrafts = renderDrafts;
window.editDraft = editDraft;
window.deleteDraft = deleteDraft;
window.previewDraft = previewDraft;
window.exportDrafts = exportDrafts;
window.importDrafts = importDrafts;
window.verifyDraft = verifyDraft;
window.checkLogin = checkLogin;




// Expose functions to global scope
window.getDrafts = getDrafts;
window.saveDrafts = saveDrafts;
window.renderDrafts = renderDrafts;
window.editDraft = editDraft;
window.deleteDraft = deleteDraft;
window.previewDraft = previewDraft;
window.exportDrafts = exportDrafts;
window.importDrafts = importDrafts;
window.verifyDraft = verifyDraft;
window.checkLogin = checkLogin;


