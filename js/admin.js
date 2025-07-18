import { showToast, loadLanguage, translateElement } from './utils.js';

let currentSearchTerm = '';
let currentFilter = 'all';

// Check if user is logged in
function checkLogin() {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    window.location.href = "index.html";
    return;
  }
}

// Update statistics
function updateStatistics(drafts) {
  const totalProducts = drafts.length;
  const verifiedProducts = drafts.filter(draft => draft.verified).length;
  const pendingProducts = totalProducts - verifiedProducts;

  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("verifiedProducts").textContent = verifiedProducts;
  document.getElementById("pendingProducts").textContent = pendingProducts;
}

// Load settings from localStorage
function loadSettings() {
  const savedCurrency = localStorage.getItem("selectedCurrency") || "৳";
  const savedWhatsappLang = localStorage.getItem("whatsappLanguage") || "bn";
  
  document.getElementById("currencySelect").value = savedCurrency;
  document.getElementById("whatsappLangSelect").value = savedWhatsappLang;
}

// Save settings to localStorage
function saveSettings() {
  const currency = document.getElementById("currencySelect").value;
  const whatsappLang = document.getElementById("whatsappLangSelect").value;
  
  localStorage.setItem("selectedCurrency", currency);
  localStorage.setItem("whatsappLanguage", whatsappLang);
  
  showToast("Settings saved successfully", "success");
  renderDrafts(); // Re-render to update currency display
}

// Render drafts/products
export function renderDrafts(customDrafts = null) {
  const drafts = customDrafts || JSON.parse(localStorage.getItem("drafts") || "[]");
  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || '';
  
  const filteredDrafts = customDrafts || drafts.filter(draft => {
    const searchableText = `${draft.name} ${draft.code} ${draft.brand} ${draft.category} ${draft.desc || ''}`.toLowerCase();
    return searchableText.includes(searchTerm);
  });

  updateStatistics(drafts);

  const container = document.getElementById("draftList");
  if (!container) return;

  if (filteredDrafts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;background:#1f1f1f;border-radius:12px;margin:20px 0;">
        <i class="fas fa-inbox" style="font-size:64px;color:#666;margin-bottom:20px;"></i>
        <h3 style="color:#ccc;margin:0 0 10px 0;">No products found</h3>
        <p style="color:#888;margin:0;">${searchTerm ? 'No results for your search' : 'You have not saved any products yet'}</p>
      </div>
    `;
    return;
  }

  filteredDrafts.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  container.innerHTML = filteredDrafts.map(draft => {
    const createdDate = draft.timestamp ? new Date(draft.timestamp).toLocaleDateString('en-US') : 'Unknown';
    const isVerified = draft.verified || false;
    const currencySymbol = localStorage.getItem("selectedCurrency") || "৳";

    return `
      <div class="draft-item" data-id="${draft.id}">
        <div class="draft-header">
          <div class="draft-name">
            ${draft.name || 'Unnamed Product'}
            ${isVerified ? '<span style="color:#28a745;margin-left:8px;" title="Verified">✔</span>' : '<span style="color:#ffc107;margin-left:8px;" title="Pending">⏳</span>'}
          </div>
          <div style="font-size:12px;color:#888;">
            ${createdDate}
          </div>
        </div>

        <div class="draft-meta">
          <div class="meta-item">
            <div class="meta-label">Product Code</div>
            <div class="meta-value">${draft.code || 'N/A'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Price</div>
            <div class="meta-value">
              ${draft.offer ? `<span style="text-decoration:line-through;color:#888;">${currencySymbol}${draft.price}</span> <span style="color:#28a745;">${currencySymbol}${draft.offer}</span>` : `${currencySymbol}${draft.price || '0'}`}
            </div>
          </div>
          <div class="meta-item"><div class="meta-label">Brand</div><div class="meta-value">${draft.brand || 'N/A'}</div></div>
          <div class="meta-item"><div class="meta-label">Category</div><div class="meta-value">${draft.category || 'N/A'}</div></div>
          <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value">${draft.status || 'N/A'}</div></div>
          <div class="meta-item"><div class="meta-label">Images</div><div class="meta-value">${(draft.images || []).length}</div></div>
        </div>

        <div class="actions">
          <button class="edit-btn" onclick="editDraft(${draft.id})" title="Edit">Edit</button>
          <button class="preview-btn" onclick="togglePreview(${draft.id})" title="Preview">Preview</button>
          <button class="verify-btn ${isVerified ? 'verified' : ''}" onclick="toggleVerification(${draft.id})" title="${isVerified ? 'Unverify' : 'Verify'}">
            ${isVerified ? 'Unverify' : 'Verify'}
          </button>
          <button class="delete-btn" onclick="deleteDraft(${draft.id})" title="Delete">Delete</button>
        </div>

        <div class="preview" id="preview-${draft.id}" style="display:none;">
          <h4 style="color:#00bfff;margin:0 0 15px 0;">Product Preview</h4>
          
          ${draft.images?.length ? `
            <div style="margin-bottom:15px;">
              <strong style="color:#ccc;">Product Images:</strong><br>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                ${draft.images.map(img => `<img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #444;">`).join('')}
              </div>
            </div>
          ` : ''}
          
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
            ${draft.desc ? `
              <div><strong style="color:#ccc;">Description:</strong><br><span style="color:#aaa;font-size:14px;">${draft.desc.substring(0, 100)}${draft.desc.length > 100 ? '...' : ''}</span></div>
            ` : ''}
            ${draft.video ? `
              <div><strong style="color:#ccc;">Video:</strong><br><a href="${draft.video}" target="_blank" style="color:#00bfff;font-size:14px;">View Video</a></div>
            ` : ''}
            ${draft.customFields?.length ? `
              <div><strong style="color:#ccc;">Custom Info:</strong><br>${draft.customFields.map(field => `<div style="font-size:14px;color:#aaa;margin:2px 0;">${field.key}: ${field.value}</div>`).join('')}</div>
            ` : ''}
          </div>
          
          <div style="margin-top:15px;padding-top:15px;border-top:1px solid #444;">
            <strong style="color:#ccc;">WhatsApp Order Link:</strong><br>
            <a href="https://wa.me/${draft.wa}?text=${encodeURIComponent(`New Order\nProduct: ${draft.name}\nCode: ${draft.code}\nPrice: ${currencySymbol}${draft.offer || draft.price}`)}" target="_blank" style="color:#25D366;font-size:14px;">
              Order via WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Edit draft function
function editDraft(id) {
  const drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const draft = drafts.find(d => d.id === id);
  
  if (!draft) {
    showToast("Product not found", "error");
    return;
  }
  
  // Store the draft to edit in localStorage
  localStorage.setItem("editingDraft", JSON.stringify(draft));
  
  // Redirect to dashboard with edit mode
  window.location.href = "dashboard.html?edit=" + id;
}

// Toggle preview function
function togglePreview(id) {
  const preview = document.getElementById(`preview-${id}`);
  if (preview) {
    preview.style.display = preview.style.display === 'none' ? 'block' : 'none';
  }
}

// Toggle verification function
function toggleVerification(id) {
  const drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const draftIndex = drafts.findIndex(d => d.id === id);
  
  if (draftIndex === -1) {
    showToast("Product not found", "error");
    return;
  }
  
  drafts[draftIndex].verified = !drafts[draftIndex].verified;
  localStorage.setItem("drafts", JSON.stringify(drafts));
  
  showToast(`Product ${drafts[draftIndex].verified ? 'verified' : 'unverified'} successfully`, "success");
  renderDrafts();
}

// Delete draft function
function deleteDraft(id) {
  if (!confirm("Are you sure you want to delete this product?")) {
    return;
  }
  
  const drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const filteredDrafts = drafts.filter(d => d.id !== id);
  
  localStorage.setItem("drafts", JSON.stringify(filteredDrafts));
  showToast("Product deleted successfully", "success");
  renderDrafts();
}

// Export drafts function
function exportDrafts() {
  const drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  
  if (drafts.length === 0) {
    showToast("No products to export", "warning");
    return;
  }
  
  const dataStr = JSON.stringify(drafts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `zovatu-products-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showToast("Products exported successfully", "success");
}

// Import drafts function
function importDrafts() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  
  if (!file) {
    showToast("Please select a file", "warning");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedData)) {
        throw new Error("Invalid file format");
      }
      
      const existingDrafts = JSON.parse(localStorage.getItem("drafts") || "[]");
      const mergedDrafts = [...existingDrafts];
      
      let importedCount = 0;
      importedData.forEach(item => {
        // Check if product with same ID already exists
        if (!mergedDrafts.find(d => d.id === item.id)) {
          mergedDrafts.push({
            ...item,
            timestamp: item.timestamp || new Date().toISOString()
          });
          importedCount++;
        }
      });
      
      localStorage.setItem("drafts", JSON.stringify(mergedDrafts));
      showToast(`${importedCount} products imported successfully`, "success");
      renderDrafts();
      
    } catch (error) {
      showToast("Error importing file: " + error.message, "error");
    }
  };
  
  reader.readAsText(file);
  fileInput.value = ''; // Reset file input
}

// Make functions globally available
window.editDraft = editDraft;
window.togglePreview = togglePreview;
window.toggleVerification = toggleVerification;
window.deleteDraft = deleteDraft;
window.exportDrafts = exportDrafts;
window.importDrafts = importDrafts;
window.saveSettings = saveSettings;

// Initialize when DOM is loaded
window.addEventListener("DOMContentLoaded", async () => {
  checkLogin();
  
  // Load language
  const savedLang = localStorage.getItem("language") || "en";
  await loadLanguage(savedLang);
  
  loadSettings();
  renderDrafts();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(renderDrafts, 300);
    });
  }

  // Auto-refresh every 30 seconds
  setInterval(renderDrafts, 30000);
});

