// Enhanced G9Tool Dashboard Script
import { showToast } from './utils.js';
import { adminSettings } from './admin.js';

// Form data management
let formData = {};
let editingDraftIndex = null;

// Language translations for dashboard
const dashboardTranslations = {
  en: {
    basic_information: "Basic Information",
    product_details: "Product Details",
    product_images: "Product Images",
    delivery_contact: "Delivery & Contact",
    custom_fields: "Custom Fields",
    product_name: "Product Name",
    product_code: "Product Code",
    price: "Price",
    offer_price: "Offer Price (Optional)",
    unit: "Unit (e.g., piece, kg)",
    quantity: "Quantity (Qty)",
    brand_company: "Brand / Company",
    size_option: "Size Options",
    color_option: "Color Options",
    category: "Category",
    status: "Status",
    product_description: "Product Description",
    youtube_video_link: "Video Link (YouTube)",
    image_url: "Image URL",
    add_more_images: "Add More Images",
    delivery_time: "Delivery Time",
    whatsapp_number: "WhatsApp Number (8801XXXXXXXXXX)",
    custom_field_title: "Title (e.g., Warranty)",
    custom_field_value: "Value (e.g., 3 months)",
    add_custom_info: "Add Custom Information",
    generate: "Generate",
    copy: "Copy",
    save_draft: "Save Draft",
    clear_form: "Clear Form",
    generated_output: "Generated Output",
    live_preview: "Live Preview",
    form_validation_error: "Please fill in all required fields",
    output_generated: "Product code generated successfully",
    output_copied: "Output copied to clipboard",
    draft_saved: "Draft saved successfully",
    form_cleared: "Form cleared successfully",
    required_field: "This field is required"
  },
  bn: {
    basic_information: "মৌলিক তথ্য",
    product_details: "প্রোডাক্ট বিবরণ",
    product_images: "প্রোডাক্ট ছবি",
    delivery_contact: "ডেলিভারি ও যোগাযোগ",
    custom_fields: "কাস্টম ফিল্ড",
    product_name: "প্রোডাক্ট নাম",
    product_code: "প্রোডাক্ট কোড",
    price: "মূল্য (৳)",
    offer_price: "অফার মূল্য (ঐচ্ছিক)",
    unit: "ইউনিট (যেমনঃ পিস, কেজি)",
    quantity: "পরিমাণ (Qty)",
    brand_company: "ব্র্যান্ড / কোম্পানি",
    size_option: "সাইজ অপশন",
    color_option: "রঙ অপশন",
    category: "ক্যাটাগরি",
    status: "স্ট্যাটাস",
    product_description: "প্রোডাক্ট বর্ণনা",
    youtube_video_link: "ভিডিও লিংক (YouTube)",
    image_url: "ছবির লিংক (Image URL)",
    add_more_images: "আরও ছবি যোগ করুন",
    delivery_time: "ডেলিভারি টাইম",
    whatsapp_number: "WhatsApp নম্বর (8801XXXXXXXXXX)",
    custom_field_title: "শিরোনাম যেমন: ওয়ারেন্টি",
    custom_field_value: "মান যেমন: ৩ মাস",
    add_custom_info: "কাস্টম তথ্য যোগ করুন",
    generate: "জেনারেট",
    copy: "কপি করুন",
    save_draft: "ড্রাফট সেভ করুন",
    clear_form: "ফর্ম ক্লিয়ার করুন",
    generated_output: "জেনারেটেড আউটপুট",
    live_preview: "লাইভ প্রিভিউ",
    form_validation_error: "অনুগ্রহ করে সকল প্রয়োজনীয় ফিল্ড পূরণ করুন",
    output_generated: "প্রোডাক্ট কোড সফলভাবে জেনারেট হয়েছে",
    output_copied: "আউটপুট ক্লিপবোর্ডে কপি হয়েছে",
    draft_saved: "ড্রাফট সফলভাবে সেভ হয়েছে",
    form_cleared: "ফর্ম সফলভাবে ক্লিয়ার হয়েছে",
    required_field: "এই ফিল্ডটি প্রয়োজনীয়"
  }
};

// Get current language
function getCurrentLanguage() {
  return localStorage.getItem('language') || 'en';
}

// Get translation
function getTranslation(key) {
  const lang = getCurrentLanguage();
  return dashboardTranslations[lang][key] || dashboardTranslations.en[key] || key;
}

// Get current currency symbol
function getCurrencySymbol() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  const currency = settings.currency?.current || 'BDT';
  const currencyOptions = {
    'BDT': '৳', 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
    'JPY': '¥', 'CNY': '¥', 'CAD': '$', 'AUD': '$', 'SAR': '﷼',
    'AED': 'د.إ', 'PKR': '₨'
  };
  return currencyOptions[currency] || '৳';
}

// Collect form data
function collectFormData() {
  const data = {
    name: document.getElementById('name').value.trim(),
    code: document.getElementById('code').value.trim(),
    price: document.getElementById('price').value.trim(),
    offer: document.getElementById('offer').value.trim(),
    unit: document.getElementById('unit').value.trim(),
    qty: document.getElementById('qty').value.trim(),
    brand: document.getElementById('brand').value.trim(),
    size: document.getElementById('size').value.trim(),
    color: document.getElementById('color').value.trim(),
    category: document.getElementById('category').value.trim(),
    status: document.getElementById('status').value.trim(),
    desc: document.getElementById('desc').value.trim(),
    video: document.getElementById('video').value.trim(),
    delivery: document.getElementById('delivery').value.trim(),
    wa: document.getElementById('wa').value.trim(),
    images: [],
    customFields: []
  };

  // Collect image URLs
  document.querySelectorAll('.img-url').forEach(input => {
    const url = input.value.trim();
    if (url) data.images.push(url);
  });

  // Collect custom fields
  document.querySelectorAll('.custom-field-group').forEach(group => {
    const key = group.querySelector('.custom-key').value.trim();
    const value = group.querySelector('.custom-value').value.trim();
    if (key && value) {
      data.customFields.push({ key, value });
    }
  });

  return data;
}

// Validate form data
function validateFormData(data) {
  const requiredFields = ['name', 'price', 'wa'];
  const missingFields = [];

  requiredFields.forEach(field => {
    if (!data[field]) {
      missingFields.push(field);
    }
  });

  // Validate WhatsApp number format
  if (data.wa && !data.wa.match(/^880\d{10}$/)) {
    showToast('WhatsApp number must be in format: 8801XXXXXXXXXX', 'error');
    return false;
  }

  if (missingFields.length > 0) {
    showToast(getTranslation('form_validation_error'), 'error');
    return false;
  }

  return true;
}

// Generate product output
function generateProductOutput(data) {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  const outputLang = settings.outputLanguage || 'en';
  const currencySymbol = getCurrencySymbol();
  
  // Generate based on output language
  if (outputLang === 'bn') {
    return generateBengaliOutput(data, currencySymbol);
  } else {
    return generateEnglishOutput(data, currencySymbol);
  }
}

// Generate Bengali output
function generateBengaliOutput(data, currencySymbol) {
  let output = `🛍️ *${data.name}*\n\n`;
  
  if (data.code) output += `📦 *প্রোডাক্ট কোড:* ${data.code}\n`;
  
  // Price section
  if (data.offer && data.offer !== data.price) {
    output += `💰 *মূল্য:* ~~${currencySymbol}${data.price}~~ ${currencySymbol}${data.offer}\n`;
    output += `🎉 *ছাড়:* ${currencySymbol}${data.price - data.offer}\n`;
  } else {
    output += `💰 *মূল্য:* ${currencySymbol}${data.price}\n`;
  }
  
  if (data.unit) output += `📏 *ইউনিট:* ${data.unit}\n`;
  if (data.qty) output += `📊 *পরিমাণ:* ${data.qty}\n`;
  if (data.brand) output += `🏷️ *ব্র্যান্ড:* ${data.brand}\n`;
  if (data.size) output += `📐 *সাইজ:* ${data.size}\n`;
  if (data.color) output += `🎨 *রঙ:* ${data.color}\n`;
  if (data.category) output += `📂 *ক্যাটাগরি:* ${data.category}\n`;
  if (data.status) output += `✅ *স্ট্যাটাস:* ${data.status}\n`;
  
  if (data.desc) {
    output += `\n📝 *বিবরণ:*\n${data.desc}\n`;
  }
  
  // Custom fields
  if (data.customFields.length > 0) {
    output += `\n🔧 *অতিরিক্ত তথ্য:*\n`;
    data.customFields.forEach(field => {
      output += `• *${field.key}:* ${field.value}\n`;
    });
  }
  
  if (data.delivery) output += `\n🚚 *ডেলিভারি:* ${data.delivery}\n`;
  
  output += `\n📞 *অর্ডার করতে যোগাযোগ করুন:*\n`;
  output += `https://wa.me/${data.wa}\n`;
  
  if (data.video) {
    output += `\n🎥 *ভিডিও দেখুন:* ${data.video}\n`;
  }
  
  return output;
}

// Generate English output
function generateEnglishOutput(data, currencySymbol) {
  let output = `🛍️ *${data.name}*\n\n`;
  
  if (data.code) output += `📦 *Product Code:* ${data.code}\n`;
  
  // Price section
  if (data.offer && data.offer !== data.price) {
    output += `💰 *Price:* ~~${currencySymbol}${data.price}~~ ${currencySymbol}${data.offer}\n`;
    output += `🎉 *Discount:* ${currencySymbol}${data.price - data.offer}\n`;
  } else {
    output += `💰 *Price:* ${currencySymbol}${data.price}\n`;
  }
  
  if (data.unit) output += `📏 *Unit:* ${data.unit}\n`;
  if (data.qty) output += `📊 *Quantity:* ${data.qty}\n`;
  if (data.brand) output += `🏷️ *Brand:* ${data.brand}\n`;
  if (data.size) output += `📐 *Size:* ${data.size}\n`;
  if (data.color) output += `🎨 *Color:* ${data.color}\n`;
  if (data.category) output += `📂 *Category:* ${data.category}\n`;
  if (data.status) output += `✅ *Status:* ${data.status}\n`;
  
  if (data.desc) {
    output += `\n📝 *Description:*\n${data.desc}\n`;
  }
  
  // Custom fields
  if (data.customFields.length > 0) {
    output += `\n🔧 *Additional Information:*\n`;
    data.customFields.forEach(field => {
      output += `• *${field.key}:* ${field.value}\n`;
    });
  }
  
  if (data.delivery) output += `\n🚚 *Delivery:* ${data.delivery}\n`;
  
  output += `\n📞 *Contact for Order:*\n`;
  output += `https://wa.me/${data.wa}\n`;
  
  if (data.video) {
    output += `\n🎥 *Watch Video:* ${data.video}\n`;
  }
  
  return output;
}

// Generate live preview
function generateLivePreview(data) {
  const currencySymbol = getCurrencySymbol();
  
  let preview = `<div class="product-preview">`;
  preview += `<h3>${data.name || 'Product Name'}</h3>`;
  
  if (data.images.length > 0) {
    preview += `<div class="preview-images">`;
    data.images.forEach(img => {
      preview += `<img src="${img}" alt="Product" style="max-width: 100px; max-height: 100px; margin: 5px; border-radius: 5px;" onerror="this.style.display='none'">`;
    });
    preview += `</div>`;
  }
  
  preview += `<div class="preview-details">`;
  if (data.code) preview += `<p><strong>Code:</strong> ${data.code}</p>`;
  
  if (data.offer && data.offer !== data.price) {
    preview += `<p><strong>Price:</strong> <del>${currencySymbol}${data.price}</del> <span style="color: #4CAF50; font-weight: bold;">${currencySymbol}${data.offer}</span></p>`;
  } else if (data.price) {
    preview += `<p><strong>Price:</strong> <span style="color: #4CAF50; font-weight: bold;">${currencySymbol}${data.price}</span></p>`;
  }
  
  if (data.brand) preview += `<p><strong>Brand:</strong> ${data.brand}</p>`;
  if (data.category) preview += `<p><strong>Category:</strong> ${data.category}</p>`;
  if (data.desc) preview += `<p><strong>Description:</strong> ${data.desc}</p>`;
  
  if (data.customFields.length > 0) {
    preview += `<div class="custom-fields">`;
    data.customFields.forEach(field => {
      preview += `<p><strong>${field.key}:</strong> ${field.value}</p>`;
    });
    preview += `</div>`;
  }
  
  preview += `</div></div>`;
  
  return preview;
}

// Add image field
window.addImageField = function() {
  const container = document.getElementById('imageInputs');
  const div = document.createElement('div');
  div.innerHTML = `
    <input type="url" class="img-url" placeholder="${getTranslation('image_url')}" data-i18n="image_url">
    <button type="button" onclick="this.parentElement.remove()" title="Remove">
      <i class="fas fa-times"></i>
    </button>
  `;
  container.appendChild(div);
};

// Add custom field
window.addCustomField = function() {
  const container = document.getElementById('customFields');
  const div = document.createElement('div');
  div.className = 'custom-field-group';
  div.innerHTML = `
    <input type="text" class="custom-key" placeholder="${getTranslation('custom_field_title')}" data-i18n="custom_field_title">
    <input type="text" class="custom-value" placeholder="${getTranslation('custom_field_value')}" data-i18n="custom_field_value">
    <button type="button" onclick="this.parentElement.remove()" title="Remove">
      <i class="fas fa-times"></i>
    </button>
  `;
  container.appendChild(div);
};

// Generate button handler
document.getElementById('generateBtn').addEventListener('click', function() {
  const btn = this;
  const originalContent = btn.innerHTML;
  
  // Show loading
  btn.innerHTML = '<div class="loading"></div> <span>Generating...</span>';
  btn.disabled = true;
  
  setTimeout(() => {
    const data = collectFormData();
    
    if (validateFormData(data)) {
      const output = generateProductOutput(data);
      const preview = generateLivePreview(data);
      
      document.getElementById('outputContent').innerHTML = `<pre>${output}</pre>`;
      document.getElementById('previewContent').innerHTML = preview;
      
      // Success state
      btn.innerHTML = '<i class="fas fa-check"></i> <span>Generated!</span>';
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      
      showToast(getTranslation('output_generated'), 'success');
      
      // Reset button
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.background = '';
        btn.disabled = false;
      }, 2000);
    } else {
      // Error state
      btn.innerHTML = '<i class="fas fa-times"></i> <span>Error!</span>';
      btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.background = '';
        btn.disabled = false;
      }, 2000);
    }
  }, 1000);
});

// Copy button handler
document.getElementById('copyBtn').addEventListener('click', function() {
  const outputContent = document.getElementById('outputContent').textContent;
  
  if (outputContent.trim()) {
    navigator.clipboard.writeText(outputContent).then(() => {
      const btn = this;
      const originalContent = btn.innerHTML;
      
      btn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      
      showToast(getTranslation('output_copied'), 'success');
      
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.background = '';
      }, 2000);
    });
  } else {
    showToast('No output to copy', 'warning');
  }
});

// Save draft button handler
document.getElementById('saveDraftBtn').addEventListener('click', function() {
  const data = collectFormData();
  
  if (data.name) {
    const drafts = JSON.parse(localStorage.getItem('savedDrafts') || '[]');
    
    const draftData = {
      ...data,
      timestamp: new Date().toISOString(),
      verified: false
    };
    
    if (editingDraftIndex !== null) {
      // Update existing draft
      drafts[editingDraftIndex] = draftData;
      editingDraftIndex = null;
      localStorage.removeItem('editingDraft');
    } else {
      // Add new draft
      drafts.push(draftData);
    }
    
    localStorage.setItem('savedDrafts', JSON.stringify(drafts));
    
    const btn = this;
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-check"></i> <span>Saved!</span>';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    
    showToast(getTranslation('draft_saved'), 'success');
    
    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.style.background = '';
    }, 2000);
  } else {
    showToast('Product name is required to save draft', 'error');
  }
});

// Clear form button handler
document.getElementById('clearFormBtn').addEventListener('click', function() {
  if (confirm('Are you sure you want to clear the form?')) {
    // Clear all input fields
    document.querySelectorAll('input, textarea, select').forEach(field => {
      field.value = '';
    });
    
    // Reset image inputs to one
    const imageContainer = document.getElementById('imageInputs');
    imageContainer.innerHTML = `
      <div>
        <input type="url" class="img-url" placeholder="Image URL" data-i18n="image_url">
        <button type="button" onclick="this.parentElement.remove()" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Reset custom fields to one
    const customContainer = document.getElementById('customFields');
    customContainer.innerHTML = `
      <div class="custom-field-group">
        <input type="text" class="custom-key" placeholder="Title (e.g., Warranty)" data-i18n="custom_field_title">
        <input type="text" class="custom-value" placeholder="Value (e.g., 3 months)" data-i18n="custom_field_value">
        <button type="button" onclick="this.parentElement.remove()" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Clear output
    document.getElementById('outputContent').innerHTML = '';
    document.getElementById('previewContent').innerHTML = '';
    
    showToast(getTranslation('form_cleared'), 'success');
  }
});

// Load draft for editing
function loadDraftForEditing() {
  const editingData = localStorage.getItem('editingDraft');
  if (editingData) {
    try {
      const { index, data } = JSON.parse(editingData);
      editingDraftIndex = index;
      
      // Fill form with draft data
      Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element && typeof data[key] === 'string') {
          element.value = data[key];
        }
      });
      
      // Load images
      if (data.images && data.images.length > 0) {
        const imageContainer = document.getElementById('imageInputs');
        imageContainer.innerHTML = '';
        data.images.forEach(img => {
          const div = document.createElement('div');
          div.innerHTML = `
            <input type="url" class="img-url" value="${img}" placeholder="Image URL">
            <button type="button" onclick="this.parentElement.remove()" title="Remove">
              <i class="fas fa-times"></i>
            </button>
          `;
          imageContainer.appendChild(div);
        });
      }
      
      // Load custom fields
      if (data.customFields && data.customFields.length > 0) {
        const customContainer = document.getElementById('customFields');
        customContainer.innerHTML = '';
        data.customFields.forEach(field => {
          const div = document.createElement('div');
          div.className = 'custom-field-group';
          div.innerHTML = `
            <input type="text" class="custom-key" value="${field.key}" placeholder="Title">
            <input type="text" class="custom-value" value="${field.value}" placeholder="Value">
            <button type="button" onclick="this.parentElement.remove()" title="Remove">
              <i class="fas fa-times"></i>
            </button>
          `;
          customContainer.appendChild(div);
        });
      }
      
      showToast('Draft loaded for editing', 'info');
    } catch (error) {
      console.error('Error loading draft:', error);
      localStorage.removeItem('editingDraft');
    }
  }
}

// Initialize dashboard
function initDashboard() {
  // Check if user is logged in
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (!loggedInUser) {
    window.location.href = 'index.html';
    return;
  }
  
  // Load draft for editing if exists
  loadDraftForEditing();
  
  // Handle language changes
  window.addEventListener('languageChanged', () => {
    // Update placeholders and labels
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = getTranslation(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

