import { showToast, loadLanguage } from './utils.js';

let currentSearchTerm = '';
let currentFilter = 'all';

export function renderDrafts(customDrafts = null) {
  const drafts = customDrafts || JSON.parse(localStorage.getItem("drafts") || "[]");
  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || '';
  
  // Filter drafts based on search term if no custom drafts provided
  const filteredDrafts = customDrafts || drafts.filter(draft => {
    const searchableText = `${draft.name} ${draft.code} ${draft.brand} ${draft.category} ${draft.desc || ''}`.toLowerCase();
    return searchableText.includes(searchTerm);
  });

  // Update statistics
  updateStatistics(drafts);

  const container = document.getElementById("draftList");
  if (!container) return;

  if (filteredDrafts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;background:#1f1f1f;border-radius:12px;margin:20px 0;">
        <i class="fas fa-inbox" style="font-size:64px;color:#666;margin-bottom:20px;"></i>
        <h3 style="color:#ccc;margin:0 0 10px 0;">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
        <p style="color:#888;margin:0;">${searchTerm ? 'অনুসন্ধানের ফলাফল খালি' : 'এখনো কোনো প্রোডাক্ট সংরক্ষণ করা হয়নি'}</p>
      </div>
    `;
    return;
  }

  // Sort drafts by timestamp (newest first)
  filteredDrafts.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  container.innerHTML = filteredDrafts.map(draft => {
    const createdDate = draft.timestamp ? new Date(draft.timestamp).toLocaleDateString('bn-BD') : 'অজানা';
    const isVerified = draft.verified || false;
    const currencySymbol = localStorage.getItem("selectedCurrency") || "৳";

    return `
      <div class="draft-item" data-id="${draft.id}">
        <div class="draft-header">
          <div class="draft-name">
            ${draft.name || 'নামহীন প্রোডাক্ট'}
            ${isVerified ? '<span style="color:#28a745;margin-left:8px;" title="ভেরিফাইড">✔</span>' : '<span style="color:#ffc107;margin-left:8px;" title="পেন্ডিং">⏳</span>'}
          </div>
          <div style="font-size:12px;color:#888;">
            ${createdDate}
          </div>
        </div>

        <div class="draft-meta">
          <div class="meta-item">
            <div class="meta-label">প্রোডাক্ট কোড</div>
            <div class="meta-value">${draft.code || 'N/A'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">মূল্য</div>
            <div class="meta-value">
              ${draft.offer ? `<span style="text-decoration:line-through;color:#888;">${currencySymbol}${draft.price}</span> <span style="color:#28a745;">${currencySymbol}${draft.offer}</span>` : `${currencySymbol}${draft.price || '0'}`}
            </div>
          </div>
          <div class="meta-item">
            <div class="meta-label">ব্র্যান্ড</div>
            <div class="meta-value">${draft.brand || 'N/A'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">ক্যাটাগরি</div>
            <div class="meta-value">${draft.category || 'N/A'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">স্ট্যাটাস</div>
            <div class="meta-value">${draft.status || 'N/A'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">ছবি সংখ্যা</div>
            <div class="meta-value">${(draft.images || []).length}টি</div>
          </div>
        </div>

        <div class="actions">
          <button class="edit-btn" onclick="editDraft(${draft.id})" title="এডিট করুন">
            এডিট
          </button>
          <button class="preview-btn" onclick="togglePreview(${draft.id})" title="প্রিভিউ দেখুন">
            প্রিভিউ
          </button>
          <button class="verify-btn ${isVerified ? 'verified' : ''}" onclick="toggleVerification(${draft.id})" title="${isVerified ? 'ভেরিফিকেশন বাতিল' : 'ভেরিফাই করুন'}">
            ${isVerified ? 'আনভেরিফাই' : 'ভেরিফাই'}
          </button>
          <button class="delete-btn" onclick="deleteDraft(${draft.id})" title="ডিলিট করুন">
            ডিলিট
          </button>
        </div>

        <div class="preview" id="preview-${draft.id}" style="display:none;">
          <h4 style="color:#00bfff;margin:0 0 15px 0;">প্রোডাক্ট প্রিভিউ</h4>
          
          ${draft.images && draft.images.length > 0 ? `
            <div style="margin-bottom:15px;">
              <strong style="color:#ccc;">প্রোডাক্ট ছবি:</strong><br>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                ${draft.images.map(img => `<img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #444;">`).join('')}
              </div>
            </div>
          ` : ''}
          
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
            ${draft.desc ? `
              <div>
                <strong style="color:#ccc;">বর্ণনা:</strong><br>
                <span style="color:#aaa;font-size:14px;">${draft.desc.substring(0, 100)}${draft.desc.length > 100 ? '...' : ''}</span>
              </div>
            ` : ''}
            
            ${draft.video ? `
              <div>
                <strong style="color:#ccc;">ভিডিও:</strong><br>
                <a href="${draft.video}" target="_blank" style="color:#00bfff;font-size:14px;">
                  ভিডিও দেখুন
                </a>
              </div>
            ` : ''}
            
            ${draft.customFields && draft.customFields.length > 0 ? `
              <div>
                <strong style="color:#ccc;">কাস্টম তথ্য:</strong><br>
                ${draft.customFields.map(field => `<div style="font-size:14px;color:#aaa;margin:2px 0;">${field.key}: ${field.value}</div>`).join('')}
              </div>
            ` : ''}
          </div>
          
          <div style="margin-top:15px;padding-top:15px;border-top:1px solid #444;">
            <strong style="color:#ccc;">WhatsApp অর্ডার লিংক:</strong><br>
            <a href="https://wa.me/${draft.wa}?text=${encodeURIComponent(`New Order\nProduct: ${draft.name}\nCode: ${draft.code}\nPrice: ${currencySymbol}${draft.offer || draft.price}`)}" 
               target="_blank" style="color:#25D366;font-size:14px;">
              WhatsApp এ অর্ডার করুন
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateStatistics(drafts) {
  const totalProducts = drafts.length;
  const verifiedProducts = drafts.filter(draft => draft.verified).length;
  const pendingProducts = totalProducts - verifiedProducts;

  const totalElement = document.getElementById("totalProducts");
  const verifiedElement = document.getElementById("verifiedProducts");
  const pendingElement = document.getElementById("pendingProducts");

  if (totalElement) totalElement.textContent = totalProducts;
  if (verifiedElement) verifiedElement.textContent = verifiedProducts;
  if (pendingElement) pendingElement.textContent = pendingProducts;
}

export function editDraft(id) {
  localStorage.setItem("editDraftId", id);
  window.location.href = "dashboard.html";
}

export function deleteDraft(id) {
  if (!confirm("আপনি কি নিশ্চিত যে এই প্রোডাক্টটি ডিলিট করতে চান?")) return;
  
  let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  drafts = drafts.filter(draft => draft.id != id);
  localStorage.setItem("drafts", JSON.stringify(drafts));
  
  renderDrafts();
  showToast('প্রোডাক্ট ডিলিট করা হয়েছে।');
}

export function togglePreview(id) {
  const preview = document.getElementById(`preview-${id}`);
  const button = document.querySelector(`button[onclick="togglePreview(${id})"]`);
  
  if (preview.style.display === "none") {
    preview.style.display = "block";
    button.innerHTML = 'লুকান';
    button.style.background = "#6c757d";
  } else {
    preview.style.display = "none";
    button.innerHTML = 'প্রিভিউ';
    button.style.background = "#6f42c1";
  }
}

export function toggleVerification(id) {
  let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const draftIndex = drafts.findIndex(draft => draft.id == id);
  
  if (draftIndex !== -1) {
    drafts[draftIndex].verified = !drafts[draftIndex].verified;
    localStorage.setItem("drafts", JSON.stringify(drafts));
    
    const isVerified = drafts[draftIndex].verified;
    showToast(isVerified ? 'প্রোডাক্ট ভেরিফাই করা হয়েছে।' : 'প্রোডাক্ট আনভেরিফাই করা হয়েছে।');
    
    renderDrafts();
  }
}

export function exportDrafts() {
  const drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  
  if (drafts.length === 0) {
    showToast('এক্সপোর্ট করার জন্য কোনো ডেটা নেই।');
    return;
  }
  
  const dataStr = JSON.stringify(drafts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `G9Tool_Products_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showToast('ডেটা সফলভাবে এক্সপোর্ট করা হয়েছে।');
}

export function importDrafts() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  
  if (!file) {
    showToast('অনুগ্রহ করে একটি JSON ফাইল নির্বাচন করুন।');
    return;
  }
  
  if (file.type !== "application/json") {
    showToast('শুধুমাত্র JSON ফাইল সাপোর্ট করা হয়।');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedData)) {
        throw new Error("Invalid data format");
      }
      
      // Validate data structure
      const isValidData = importedData.every(item => 
        item.hasOwnProperty('id') && 
        item.hasOwnProperty('name') && 
        item.hasOwnProperty('code')
      );
      
      if (!isValidData) {
        throw new Error("Invalid data structure");
      }
      
      // Merge with existing data
      const existingDrafts = JSON.parse(localStorage.getItem("drafts") || "[]");
      const mergedDrafts = [...existingDrafts];
      
      let importedCount = 0;
      let updatedCount = 0;
      
      importedData.forEach(importedDraft => {
        const existingIndex = mergedDrafts.findIndex(draft => draft.id === importedDraft.id);
        
        if (existingIndex !== -1) {
          mergedDrafts[existingIndex] = importedDraft;
          updatedCount++;
        } else {
          mergedDrafts.push(importedDraft);
          importedCount++;
        }
      });
      
      localStorage.setItem("drafts", JSON.stringify(mergedDrafts));
      renderDrafts();
      
      showToast(`ইমপোর্ট সম্পন্ন! নতুন: ${importedCount}টি, আপডেট: ${updatedCount}টি`);
      
    } catch (error) {
      showToast('ফাইল ইমপোর্ট করতে সমস্যা হয়েছে। সঠিক JSON ফাইল নিশ্চিত করুন।');
      console.error("Import error:", error);
    }
  };
  
  reader.readAsText(file);
  fileInput.value = ''; // Clear the input
}

export function filterProducts(filter) {
  currentFilter = filter;
  renderDrafts();
}

export function bulkAction(action) {
  const checkboxes = document.querySelectorAll('.draft-checkbox:checked');
  const selectedIds = Array.from(checkboxes).map(cb => cb.value);
  
  if (selectedIds.length === 0) {
    showToast('অনুগ্রহ করে কমপক্ষে একটি প্রোডাক্ট নির্বাচন করুন।');
    return;
  }
  
  if (action === 'delete') {
    if (!confirm(`আপনি কি নিশ্চিত যে ${selectedIds.length}টি প্রোডাক্ট ডিলিট করতে চান?`)) return;
    
    let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
    drafts = drafts.filter(draft => !selectedIds.includes(draft.id.toString()));
    localStorage.setItem("drafts", JSON.stringify(drafts));
    
    showToast(`${selectedIds.length}টি প্রোডাক্ট ডিলিট করা হয়েছে।`);
  } else if (action === 'verify') {
    let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
    drafts.forEach(draft => {
      if (selectedIds.includes(draft.id.toString())) {
        draft.verified = true;
      }
    });
    localStorage.setItem("drafts", JSON.stringify(drafts));
    
    showToast(`${selectedIds.length}টি প্রোডাক্ট ভেরিফাই করা হয়েছে।`);
  }
  
  renderDrafts();
}

// New functions for currency and WhatsApp language settings
export function saveSettings() {
  const currencySelect = document.getElementById("currencySelect");
  const whatsappLangSelect = document.getElementById("whatsappLangSelect");

  if (currencySelect) {
    localStorage.setItem("selectedCurrency", currencySelect.value);
  }
  if (whatsappLangSelect) {
    localStorage.setItem("whatsappLanguage", whatsappLangSelect.value);
  }
  showToast('সেটিংস সংরক্ষণ করা হয়েছে।');
}

export function loadSettings() {
  const currencySelect = document.getElementById("currencySelect");
  const whatsappLangSelect = document.getElementById("whatsappLangSelect");

  if (currencySelect) {
    currencySelect.value = localStorage.getItem("selectedCurrency") || "৳";
  }
  if (whatsappLangSelect) {
    whatsappLangSelect.value = localStorage.getItem("whatsappLanguage") || "bn";
  }
}

// Expose functions to global scope
window.editDraft = editDraft;
window.deleteDraft = deleteDraft;
window.togglePreview = togglePreview;
window.toggleVerification = toggleVerification;
window.exportDrafts = exportDrafts;
window.importDrafts = importDrafts;
window.renderDrafts = renderDrafts;
window.filterProducts = filterProducts;
window.bulkAction = bulkAction;
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;

export function checkLogin() {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
  }
}

// Initialize admin panel
window.addEventListener("DOMContentLoaded", async () => {
  checkLogin();
  
  // Load language
  const savedLang = localStorage.getItem("language") || "en";
  await loadLanguage(savedLang);
  
  loadSettings(); // Load settings on page load
  renderDrafts();
  
  // Add search functionality with debounce
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        renderDrafts();
      }, 300);
    });
  }
  
  // Auto-refresh every 30 seconds
  setInterval(() => {
    renderDrafts();
  }, 30000);
});




// Enhanced search function
export function searchDrafts() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  
  if (!query) {
    renderDrafts();
    return;
  }
  
  // Enhanced search with multiple fields and fuzzy matching
  const filteredDrafts = drafts.filter(draft => {
    const searchFields = [
      draft.name,
      draft.code,
      draft.brand,
      draft.category,
      draft.desc
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Support for multiple search terms
    const searchTerms = query.split(' ').filter(term => term.length > 0);
    
    return searchTerms.every(term => 
      searchFields.includes(term) || 
      searchFields.includes(term.replace(/[aeiou]/g, '')) // Simple fuzzy matching
    );
  });
  
  renderDrafts(filteredDrafts);
  
  // Show search results count
  showSearchResults(filteredDrafts.length, query);
}

function showSearchResults(count, query) {
  let searchInfo = document.getElementById("searchInfo");
  
  if (!searchInfo) {
    searchInfo = document.createElement('div');
    searchInfo.id = 'searchInfo';
    searchInfo.style.cssText = `
      background: #2a2a2a;
      color: #ccc;
      padding: 8px 16px;
      border-radius: 6px;
      margin: 10px 0;
      font-size: 14px;
      border-left: 3px solid #4CAF50;
      display: none;
    `;
    
    const searchContainer = document.querySelector('#searchInput').parentNode;
    searchContainer.appendChild(searchInfo);
  }
  
  if (count > 0) {
    searchInfo.innerHTML = `${count}টি ফলাফল পাওয়া গেছে "${query}" এর জন্য`;
    searchInfo.style.display = 'block';
  } else {
    searchInfo.innerHTML = `"${query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি`;
    searchInfo.style.display = 'block';
    searchInfo.style.borderLeftColor = '#ff9800';
  }
}


