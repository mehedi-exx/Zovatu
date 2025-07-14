// Main Application Module
// Coordinates all components and modules

import { LanguageManager } from './languageManager.js';
import { themeManager } from './modules/themeManager.js';
import { validationManager } from './modules/validationManager.js';
import { sidebarComponent } from './components/sidebarComponent.js';
import { toastComponent } from './components/toastComponent.js';
import { showToast, getVal, loadTranslations, applyTranslations } from './utils.js';
import { generateProduct } from './productGenerator.js';

class G9ToolApp {
  constructor() {
    this.languageManager = null;
    this.isInitialized = false;
    this.currentPage = this.getCurrentPage();
  }

  async init() {
    try {
      // Initialize language manager
      this.languageManager = new LanguageManager();
      window.languageManager = this.languageManager;
      
      // Initialize theme manager
      window.themeManager = themeManager;
      
      // Initialize validation manager
      window.validationManager = validationManager;
      
      // Initialize sidebar component
      window.sidebarComponent = sidebarComponent;
      
      // Initialize toast component
      window.toastComponent = toastComponent;
      
      // Setup global functions for backward compatibility
      this.setupGlobalFunctions();
      
      // Initialize page-specific functionality
      await this.initializePage();
      
      // Setup real-time validation
      validationManager.setupRealTimeValidation();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Mark as initialized
      this.isInitialized = true;
      
      console.log('G9Tool App initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize G9Tool App:', error);
      this.showErrorToast('Failed to initialize application');
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('admin.html')) return 'admin';
    if (path.includes('dashboard.html')) return 'dashboard';
    if (path.includes('index.html') || path === '/') return 'login';
    return 'unknown';
  }

  async initializePage() {
    switch (this.currentPage) {
      case 'admin':
        await this.initializeAdminPage();
        break;
      case 'dashboard':
        await this.initializeDashboardPage();
        break;
      case 'login':
        await this.initializeLoginPage();
        break;
    }
  }

  async initializeAdminPage() {
    // Load admin-specific functionality
    try {
      const { default: adminModule } = await import('./admin.js');
      if (adminModule && adminModule.init) {
        adminModule.init();
      }
    } catch (error) {
      console.warn('Admin module not found or failed to load:', error);
    }
  }

  async initializeDashboardPage() {
    // Initialize dashboard-specific functionality
    this.setupFormHandlers();
    this.setupDraftManagement();
    this.loadSavedDrafts();
  }

  async initializeLoginPage() {
    // Initialize login-specific functionality
    this.setupLoginHandlers();
  }

  setupGlobalFunctions() {
    // Expose functions globally for backward compatibility
    window.showToast = (message, type, duration) => {
      toastComponent.show(message, type, duration);
    };
    
    window.toggleSidebar = () => {
      sidebarComponent.toggle();
    };
    
    window.toggleTheme = () => {
      themeManager.toggleTheme();
    };
    
    window.validateForm = () => {
      return validationManager.validateForm();
    };
    
    window.clearForm = this.clearForm.bind(this);
    window.saveDraft = this.saveDraft.bind(this);
    window.loadDraft = this.loadDraft.bind(this);
    window.deleteDraft = this.deleteDraft.bind(this);
  }

  setupEventListeners() {
    // Generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
      generateBtn.addEventListener('click', this.handleGenerate.bind(this));
    }

    // Copy button
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', this.handleCopy.bind(this));
    }

    // Form inputs for auto-save
    const formInputs = document.querySelectorAll('#formFields input, #formFields textarea, #formFields select');
    formInputs.forEach(input => {
      input.addEventListener('input', this.debounce(this.autoSaveDraft.bind(this), 2000));
    });
  }

  setupFormHandlers() {
    // Add image field functionality
    window.addImageField = () => {
      const imageInputs = document.getElementById('imageInputs');
      const newImageGroup = document.createElement('div');
      newImageGroup.className = 'form-group';
      newImageGroup.innerHTML = `
        <label>অতিরিক্ত ছবি</label>
        <div class="input-with-icon">
          <span class="input-icon">
            <i class="fas fa-image"></i>
          </span>
          <input type="url" class="img-url" placeholder="ছবির লিংক (Image URL)" data-i18n="image_url">
        </div>
        <button type="button" class="remove-field-btn" onclick="this.parentElement.remove()">
          <i class="fas fa-trash"></i>
        </button>
      `;
      imageInputs.appendChild(newImageGroup);
    };

    // Add custom field functionality
    window.addCustomField = () => {
      const customFields = document.getElementById('customFields');
      const newCustomGroup = document.createElement('div');
      newCustomGroup.className = 'custom-field-group';
      newCustomGroup.innerHTML = `
        <div class="form-group">
          <input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি" data-i18n="custom_field_title">
        </div>
        <div class="form-group">
          <input type="text" class="custom-value" placeholder="মান যেমন: ৩ মাস" data-i18n="custom_field_value">
        </div>
        <button type="button" class="remove-field-btn" onclick="this.parentElement.remove()">
          <i class="fas fa-trash"></i>
        </button>
      `;
      customFields.appendChild(newCustomGroup);
    };
  }

  async handleGenerate() {
    try {
      // Show loading state
      const generateBtn = document.getElementById('generateBtn');
      const originalText = generateBtn.innerHTML;
      generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> জেনারেট করা হচ্ছে...';
      generateBtn.disabled = true;

      // Validate form
      const validation = validationManager.validateForm();
      if (!validation.isValid) {
        const currentLang = this.languageManager.getCurrentUILanguage();
        const message = currentLang === 'bn' ? 
          `দয়া করে নিম্নলিখিত ক্ষেত্রগুলি সঠিকভাবে পূরণ করুন: ${validation.errors.join(', ')}` :
          `Please fill the following fields correctly: ${validation.errors.join(', ')}`;
        
        toastComponent.error(message, 6000);
        return;
      }

      // Generate product
      const result = await generateProduct();
      
      if (result.success) {
        // Display output
        document.getElementById('output').innerHTML = result.output;
        document.getElementById('preview').innerHTML = result.preview;
        
        // Show success message
        const currentLang = this.languageManager.getCurrentUILanguage();
        const message = currentLang === 'bn' ? 
          'প্রোডাক্ট কোড সফলভাবে জেনারেট হয়েছে!' :
          'Product code generated successfully!';
        
        toastComponent.success(message);
        
        // Auto-save as draft
        this.autoSaveDraft();
        
      } else {
        throw new Error(result.error || 'Generation failed');
      }

    } catch (error) {
      console.error('Generation error:', error);
      const currentLang = this.languageManager.getCurrentUILanguage();
      const message = currentLang === 'bn' ? 
        'কোড জেনারেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' :
        'Failed to generate code. Please try again.';
      
      toastComponent.error(message);
    } finally {
      // Restore button state
      const generateBtn = document.getElementById('generateBtn');
      generateBtn.innerHTML = originalText;
      generateBtn.disabled = false;
    }
  }

  async handleCopy() {
    try {
      const output = document.getElementById('output');
      if (!output || !output.textContent.trim()) {
        const currentLang = this.languageManager.getCurrentUILanguage();
        const message = currentLang === 'bn' ? 
          'কপি করার জন্য কোন কোড নেই। প্রথমে জেনারেট করুন।' :
          'No code to copy. Please generate first.';
        
        toastComponent.warning(message);
        return;
      }

      await navigator.clipboard.writeText(output.textContent);
      
      const currentLang = this.languageManager.getCurrentUILanguage();
      const message = currentLang === 'bn' ? 
        'কোড সফলভাবে কপি হয়েছে!' :
        'Code copied successfully!';
      
      toastComponent.success(message);

    } catch (error) {
      console.error('Copy error:', error);
      const currentLang = this.languageManager.getCurrentUILanguage();
      const message = currentLang === 'bn' ? 
        'কপি করতে সমস্যা হয়েছে।' :
        'Failed to copy code.';
      
      toastComponent.error(message);
    }
  }

  clearForm() {
    const currentLang = this.languageManager.getCurrentUILanguage();
    const confirmMessage = currentLang === 'bn' ? 
      "আপনি কি নিশ্চিত যে ফর্মটি পরিষ্কার করতে চান? সমস্ত তথ্য মুছে যাবে।" :
      "Are you sure you want to clear the form? All information will be lost.";
      
    if (confirm(confirmMessage)) {
      // Clear all form fields
      document.querySelectorAll('#formFields input, #formFields textarea, #formFields select').forEach(field => {
        field.value = '';
        field.classList.remove('form-error', 'form-success');
      });
      
      // Clear validation errors
      validationManager.clearAllErrors();
      
      // Reset dynamic fields
      this.resetDynamicFields();
      
      // Clear output
      document.getElementById('output').innerHTML = '';
      document.getElementById('preview').innerHTML = '';
      
      // Show success message
      const successMessage = currentLang === 'bn' ? 
        "ফর্ম সফলভাবে পরিষ্কার করা হয়েছে।" :
        "Form cleared successfully.";
      toastComponent.success(successMessage);
      
      // Focus on first input
      document.getElementById('name')?.focus();
    }
  }

  resetDynamicFields() {
    // Reset image inputs
    const imageInputs = document.getElementById('imageInputs');
    if (imageInputs) {
      imageInputs.innerHTML = `
        <div class="form-group">
          <label data-i18n="first_image_label">প্রধান ছবি *</label>
          <div class="input-with-icon">
            <span class="input-icon">
              <i class="fas fa-image"></i>
            </span>
            <input type="url" class="img-url" placeholder="ছবির লিংক (Image URL)" data-i18n="image_url" required>
          </div>
          <div class="field-hint" data-i18n="image_hint">প্রোডাক্টের প্রধান ছবির URL</div>
        </div>
      `;
    }
    
    // Reset custom fields
    const customFields = document.getElementById('customFields');
    if (customFields) {
      customFields.innerHTML = `
        <div class="custom-field-group">
          <div class="form-group">
            <input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি" data-i18n="custom_field_title">
          </div>
          <div class="form-group">
            <input type="text" class="custom-value" placeholder="মান যেমন: ৩ মাস" data-i18n="custom_field_value">
          </div>
        </div>
      `;
    }
  }

  // Draft management methods
  saveDraft() {
    try {
      const formData = this.getFormData();
      const draftId = Date.now().toString();
      const draft = {
        id: draftId,
        name: formData.name || 'Unnamed Product',
        data: formData,
        timestamp: new Date().toISOString(),
        verified: false
      };

      const drafts = JSON.parse(localStorage.getItem('g9tool_drafts') || '[]');
      drafts.unshift(draft);
      
      // Keep only last 50 drafts
      if (drafts.length > 50) {
        drafts.splice(50);
      }
      
      localStorage.setItem('g9tool_drafts', JSON.stringify(drafts));
      
      const currentLang = this.languageManager.getCurrentUILanguage();
      const message = currentLang === 'bn' ? 
        'ড্রাফট সফলভাবে সংরক্ষণ করা হয়েছে!' :
        'Draft saved successfully!';
      
      toastComponent.success(message);
      
    } catch (error) {
      console.error('Save draft error:', error);
      toastComponent.error('Failed to save draft');
    }
  }

  autoSaveDraft() {
    // Auto-save without notification
    try {
      const formData = this.getFormData();
      if (Object.values(formData).some(value => value && value.toString().trim())) {
        const autoSave = {
          data: formData,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('g9tool_autosave', JSON.stringify(autoSave));
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }

  loadDraft(draftId) {
    try {
      const drafts = JSON.parse(localStorage.getItem('g9tool_drafts') || '[]');
      const draft = drafts.find(d => d.id === draftId);
      
      if (draft) {
        this.setFormData(draft.data);
        toastComponent.success('Draft loaded successfully');
      }
    } catch (error) {
      console.error('Load draft error:', error);
      toastComponent.error('Failed to load draft');
    }
  }

  deleteDraft(draftId) {
    try {
      const drafts = JSON.parse(localStorage.getItem('g9tool_drafts') || '[]');
      const updatedDrafts = drafts.filter(d => d.id !== draftId);
      localStorage.setItem('g9tool_drafts', JSON.stringify(updatedDrafts));
      
      toastComponent.success('Draft deleted successfully');
      this.loadSavedDrafts(); // Refresh draft list
    } catch (error) {
      console.error('Delete draft error:', error);
      toastComponent.error('Failed to delete draft');
    }
  }

  getFormData() {
    const data = {};
    document.querySelectorAll('#formFields input, #formFields textarea, #formFields select').forEach(field => {
      if (field.id) {
        data[field.id] = field.value;
      }
    });
    
    // Get image URLs
    data.images = Array.from(document.querySelectorAll('.img-url')).map(input => input.value).filter(url => url.trim());
    
    // Get custom fields
    data.customFields = [];
    document.querySelectorAll('.custom-field-group').forEach(group => {
      const key = group.querySelector('.custom-key')?.value;
      const value = group.querySelector('.custom-value')?.value;
      if (key && value) {
        data.customFields.push({ key, value });
      }
    });
    
    return data;
  }

  setFormData(data) {
    // Set basic fields
    Object.keys(data).forEach(key => {
      const field = document.getElementById(key);
      if (field && typeof data[key] === 'string') {
        field.value = data[key];
      }
    });
    
    // Set images
    if (data.images && data.images.length > 0) {
      const imageInputs = document.getElementById('imageInputs');
      imageInputs.innerHTML = '';
      
      data.images.forEach((url, index) => {
        const imageGroup = document.createElement('div');
        imageGroup.className = 'form-group';
        imageGroup.innerHTML = `
          <label>${index === 0 ? 'প্রধান ছবি *' : 'অতিরিক্ত ছবি'}</label>
          <div class="input-with-icon">
            <span class="input-icon">
              <i class="fas fa-image"></i>
            </span>
            <input type="url" class="img-url" value="${url}" placeholder="ছবির লিংক (Image URL)">
          </div>
          ${index > 0 ? '<button type="button" class="remove-field-btn" onclick="this.parentElement.remove()"><i class="fas fa-trash"></i></button>' : ''}
        `;
        imageInputs.appendChild(imageGroup);
      });
    }
    
    // Set custom fields
    if (data.customFields && data.customFields.length > 0) {
      const customFields = document.getElementById('customFields');
      customFields.innerHTML = '';
      
      data.customFields.forEach(field => {
        const customGroup = document.createElement('div');
        customGroup.className = 'custom-field-group';
        customGroup.innerHTML = `
          <div class="form-group">
            <input type="text" class="custom-key" value="${field.key}" placeholder="শিরোনাম">
          </div>
          <div class="form-group">
            <input type="text" class="custom-value" value="${field.value}" placeholder="মান">
          </div>
          <button type="button" class="remove-field-btn" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
          </button>
        `;
        customFields.appendChild(customGroup);
      });
    }
  }

  loadSavedDrafts() {
    // This would populate a drafts list in the UI
    // Implementation depends on UI design
  }

  setupDraftManagement() {
    // Setup draft-related UI and event listeners
  }

  setupLoginHandlers() {
    // Setup login form handlers
  }

  // Utility methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  showErrorToast(message) {
    toastComponent.error(message);
  }

  // Public API
  getState() {
    return {
      isInitialized: this.isInitialized,
      currentPage: this.currentPage,
      languageManager: this.languageManager,
      themeManager: themeManager,
      validationManager: validationManager,
      sidebarComponent: sidebarComponent,
      toastComponent: toastComponent
    };
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  window.g9ToolApp = new G9ToolApp();
  await window.g9ToolApp.init();
});

// Export for module usage
export default G9ToolApp;

