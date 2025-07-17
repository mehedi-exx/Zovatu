import { showToast } from './utils.js';

let currentSearchTerm = '';
let currentFilter = 'all';

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

// ... (বাকি সব ফাংশন অপরিবর্তিত আছে, শুধুমাত্র বাংলা মুছে ফেলা হয়েছে)

window.addEventListener("DOMContentLoaded", () => {
  checkLogin();

  // Removed loadLanguage()

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

  setInterval(renderDrafts, 30000);
});
