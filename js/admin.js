// Enhanced Admin Panel for G9Tool
import { showToast } from './utils.js';

// Admin settings configuration
const adminSettings = {
  currency: {
    current: 'BDT',
    options: {
      'BDT': { symbol: '৳', name: 'Bangladeshi Taka' },
      'USD': { symbol: '$', name: 'US Dollar' },
      'EUR': { symbol: '€', name: 'Euro' },
      'GBP': { symbol: '£', name: 'British Pound' },
      'INR': { symbol: '₹', name: 'Indian Rupee' },
      'JPY': { symbol: '¥', name: 'Japanese Yen' },
      'CNY': { symbol: '¥', name: 'Chinese Yuan' },
      'CAD': { symbol: '$', name: 'Canadian Dollar' },
      'AUD': { symbol: '$', name: 'Australian Dollar' },
      'SAR': { symbol: '﷼', name: 'Saudi Riyal' },
      'AED': { symbol: 'د.إ', name: 'UAE Dirham' },
      'PKR': { symbol: '₨', name: 'Pakistani Rupee' }
    }
  },
  outputLanguage: 'en',
  whatsappLanguage: 'en',
  outputTheme: 'original'
};

// Language translations for admin
const adminTranslations = {
  en: {
    settings_configuration: "Settings & Configuration",
    currency_selection: "Currency Selection",
    output_language: "Output Language",
    whatsapp_language: "WhatsApp Message Language",
    output_theme: "Output Theme",
    current_settings: "Current Settings",
    currency: "Currency",
    output_lang: "Output Language",
    whatsapp_lang: "WhatsApp Language",
    theme: "Theme",
    product_statistics: "Product Statistics",
    total_products: "Total Products",
    verified_products: "Verified Products",
    pending_products: "Pending Products",
    saved_product_list: "Saved Product Management",
    search_product: "Search products (name or code)",
    export_json: "Export JSON",
    import_json: "Import JSON",
    settings_updated: "Settings updated successfully",
    export_success: "Data exported successfully",
    import_success: "Data imported successfully",
    import_error: "Error importing data",
    no_data_found: "No saved products found",
    confirm_delete: "Are you sure you want to delete this product?",
    product_deleted: "Product deleted successfully",
    product_verified: "Product verification status updated"
  },
  bn: {
    settings_configuration: "সেটিংস ও কনফিগারেশন",
    currency_selection: "মুদ্রা নির্বাচন",
    output_language: "আউটপুট ভাষা",
    whatsapp_language: "হোয়াটসঅ্যাপ মেসেজের ভাষা",
    output_theme: "আউটপুট থিম",
    current_settings: "বর্তমান সেটিংস",
    currency: "মুদ্রা",
    output_lang: "আউটপুট ভাষা",
    whatsapp_lang: "হোয়াটসঅ্যাপ ভাষা",
    theme: "থিম",
    product_statistics: "প্রোডাক্ট পরিসংখ্যান",
    total_products: "মোট প্রোডাক্ট",
    verified_products: "যাচাইকৃত প্রোডাক্ট",
    pending_products: "অপেক্ষমাণ প্রোডাক্ট",
    saved_product_list: "সংরক্ষিত প্রোডাক্ট ব্যবস্থাপনা",
    search_product: "প্রোডাক্ট খুঁজুন (নাম বা কোড)",
    export_json: "JSON এক্সপোর্ট",
    import_json: "JSON ইমপোর্ট",
    settings_updated: "সেটিংস সফলভাবে আপডেট হয়েছে",
    export_success: "ডেটা সফলভাবে এক্সপোর্ট হয়েছে",
    import_success: "ডেটা সফলভাবে ইমপোর্ট হয়েছে",
    import_error: "ডেটা ইমপোর্ট করতে ত্রুটি",
    no_data_found: "কোন সংরক্ষিত প্রোডাক্ট পাওয়া যায়নি",
    confirm_delete: "আপনি কি নিশ্চিত যে এই প্রোডাক্টটি মুছে ফেলতে চান?",
    product_deleted: "প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে",
    product_verified: "প্রোডাক্ট যাচাইকরণ স্ট্যাটাস আপডেট হয়েছে"
  }
};

// Get current language
function getCurrentLanguage() {
  return localStorage.getItem('language') || 'en';
}

// Get translation
function getTranslation(key) {
  const lang = getCurrentLanguage();
  return adminTranslations[lang][key] || adminTranslations.en[key] || key;
}

// Load admin settings from localStorage
function loadAdminSettings() {
  const saved = localStorage.getItem('adminSettings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(adminSettings, parsed);
    } catch (error) {
      console.error('Error loading admin settings:', error);
    }
  }
  updateSettingsUI();
}

// Save admin settings to localStorage
function saveAdminSettings() {
  localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
  updateSettingsPreview();
  showToast(getTranslation('settings_updated'), 'success');
}

// Update settings UI
function updateSettingsUI() {
  const currencySelect = document.getElementById('currencySelect');
  const outputLanguageSelect = document.getElementById('outputLanguageSelect');
  const whatsappLanguageSelect = document.getElementById('whatsappLanguageSelect');
  const outputThemeSelect = document.getElementById('outputThemeSelect');

  if (currencySelect) currencySelect.value = adminSettings.currency.current;
  if (outputLanguageSelect) outputLanguageSelect.value = adminSettings.outputLanguage;
  if (whatsappLanguageSelect) whatsappLanguageSelect.value = adminSettings.whatsappLanguage;
  if (outputThemeSelect) outputThemeSelect.value = adminSettings.outputTheme;

  updateSettingsPreview();
}

// Update settings preview
function updateSettingsPreview() {
  const currentCurrency = document.getElementById('currentCurrency');
  const currentOutputLang = document.getElementById('currentOutputLang');
  const currentWhatsappLang = document.getElementById('currentWhatsappLang');
  const currentTheme = document.getElementById('currentTheme');

  if (currentCurrency) {
    const currency = adminSettings.currency.options[adminSettings.currency.current];
    currentCurrency.textContent = `${currency.symbol} ${adminSettings.currency.current}`;
  }

  if (currentOutputLang) {
    currentOutputLang.textContent = adminSettings.outputLanguage === 'bn' ? 'বাংলা' : 'English';
  }

  if (currentWhatsappLang) {
    currentWhatsappLang.textContent = adminSettings.whatsappLanguage === 'bn' ? 'বাংলা' : 'English';
  }

  if (currentTheme) {
    const themes = {
      'original': 'Original',
      'professional': 'Professional',
      'modern': 'Modern'
    };
    currentTheme.textContent = themes[adminSettings.outputTheme] || 'Original';
  }
}

// Currency update handler
window.updateCurrency = function() {
  const select = document.getElementById('currencySelect');
  if (select) {
    adminSettings.currency.current = select.value;
    saveAdminSettings();
  }
};

// Output language update handler
window.updateOutputLanguage = function() {
  const select = document.getElementById('outputLanguageSelect');
  if (select) {
    adminSettings.outputLanguage = select.value;
    saveAdminSettings();
  }
};

// WhatsApp language update handler
window.updateWhatsappLanguage = function() {
  const select = document.getElementById('whatsappLanguageSelect');
  if (select) {
    adminSettings.whatsappLanguage = select.value;
    saveAdminSettings();
  }
};

// Output theme update handler
window.updateOutputTheme = function() {
  const select = document.getElementById('outputThemeSelect');
  if (select) {
    adminSettings.outputTheme = select.value;
    saveAdminSettings();
  }
};

// Get saved drafts
function getSavedDrafts() {
  const drafts = localStorage.getItem('savedDrafts');
  return drafts ? JSON.parse(drafts) : [];
}

// Save drafts
function saveDrafts(drafts) {
  localStorage.setItem('savedDrafts', JSON.stringify(drafts));
  updateStatistics();
}

// Update statistics
function updateStatistics() {
  const drafts = getSavedDrafts();
  const totalProducts = drafts.length;
  const verifiedProducts = drafts.filter(draft => draft.verified).length;
  const pendingProducts = totalProducts - verifiedProducts;

  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('verifiedProducts').textContent = verifiedProducts;
  document.getElementById('pendingProducts').textContent = pendingProducts;
}

// Render drafts list
function renderDrafts() {
  const drafts = getSavedDrafts();
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filteredDrafts = drafts.filter(draft => 
    draft.name.toLowerCase().includes(searchTerm) || 
    (draft.code && draft.code.toLowerCase().includes(searchTerm))
  );

  const draftList = document.getElementById('draftList');
  
  if (filteredDrafts.length === 0) {
    draftList.innerHTML = `
      <div class="no-data">
        <i class="fas fa-inbox"></i>
        <p>${getTranslation('no_data_found')}</p>
      </div>
    `;
    return;
  }

  draftList.innerHTML = filteredDrafts.map((draft, index) => `
    <div class="draft-item">
      <div class="draft-header">
        <div class="draft-name">
          <i class="fas fa-box"></i>
          ${draft.name}
          ${draft.verified ? '<i class="fas fa-check-circle" style="color: #4CAF50;" title="Verified"></i>' : '<i class="fas fa-clock" style="color: #ff9800;" title="Pending"></i>'}
        </div>
      </div>
      
      <div class="draft-meta">
        <div class="meta-item">
          <div class="meta-label">Product Code</div>
          <div class="meta-value">${draft.code || 'N/A'}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Price</div>
          <div class="meta-value">${draft.price ? adminSettings.currency.options[adminSettings.currency.current].symbol + draft.price : 'N/A'}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Category</div>
          <div class="meta-value">${draft.category || 'N/A'}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Created</div>
          <div class="meta-value">${new Date(draft.timestamp).toLocaleDateString()}</div>
        </div>
      </div>
      
      <div class="actions">
        <button class="edit-btn" onclick="editDraft(${index})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="preview-btn" onclick="togglePreview(${index})">
          <i class="fas fa-eye"></i> Preview
        </button>
        <button class="verify-btn ${draft.verified ? 'verified' : ''}" onclick="toggleVerification(${index})">
          <i class="fas fa-${draft.verified ? 'check-circle' : 'clock'}"></i> 
          ${draft.verified ? 'Verified' : 'Verify'}
        </button>
        <button class="delete-btn" onclick="deleteDraft(${index})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
      
      <div class="preview" id="preview-${index}" style="display: none;">
        <h4>Product Preview:</h4>
        <p><strong>Description:</strong> ${draft.desc || 'No description'}</p>
        ${draft.images && draft.images.length > 0 ? `
          <div class="image-preview">
            ${draft.images.map(img => `<img src="${img}" alt="Product image" onerror="this.style.display='none'">`).join('')}
          </div>
        ` : ''}
        ${draft.customFields && draft.customFields.length > 0 ? `
          <div class="custom-fields-preview">
            <strong>Custom Fields:</strong>
            ${draft.customFields.map(field => `<div>${field.key}: ${field.value}</div>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Toggle preview
window.togglePreview = function(index) {
  const preview = document.getElementById(`preview-${index}`);
  if (preview) {
    preview.style.display = preview.style.display === 'none' ? 'block' : 'none';
  }
};

// Edit draft
window.editDraft = function(index) {
  const drafts = getSavedDrafts();
  const draft = drafts[index];
  
  // Store draft data for editing
  localStorage.setItem('editingDraft', JSON.stringify({ index, data: draft }));
  
  // Redirect to dashboard
  window.location.href = 'dashboard.html';
};

// Delete draft
window.deleteDraft = function(index) {
  if (confirm(getTranslation('confirm_delete'))) {
    const drafts = getSavedDrafts();
    drafts.splice(index, 1);
    saveDrafts(drafts);
    renderDrafts();
    showToast(getTranslation('product_deleted'), 'success');
  }
};

// Toggle verification
window.toggleVerification = function(index) {
  const drafts = getSavedDrafts();
  drafts[index].verified = !drafts[index].verified;
  saveDrafts(drafts);
  renderDrafts();
  showToast(getTranslation('product_verified'), 'success');
};

// Export drafts
window.exportDrafts = function() {
  const drafts = getSavedDrafts();
  if (drafts.length === 0) {
    showToast(getTranslation('no_data_found'), 'warning');
    return;
  }

  const dataStr = JSON.stringify(drafts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `g9tool-products-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showToast(getTranslation('export_success'), 'success');
};

// Import drafts
window.importDrafts = function() {
  const fileInput = document.getElementById('importFile');
  const file = fileInput.files[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (Array.isArray(importedData)) {
        const existingDrafts = getSavedDrafts();
        const mergedDrafts = [...existingDrafts, ...importedData];
        saveDrafts(mergedDrafts);
        renderDrafts();
        showToast(getTranslation('import_success'), 'success');
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast(getTranslation('import_error'), 'error');
    }
  };
  
  reader.readAsText(file);
  fileInput.value = ''; // Reset file input
};

// Initialize admin panel
function initAdmin() {
  // Check if user is logged in
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (!loggedInUser) {
    window.location.href = 'index.html';
    return;
  }

  // Load settings and data
  loadAdminSettings();
  updateStatistics();
  renderDrafts();

  // Handle language changes
  window.addEventListener('languageChanged', () => {
    renderDrafts();
    updateStatistics();
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdmin);

// Export settings for use in other modules
export { adminSettings, getCurrentLanguage, getTranslation };

