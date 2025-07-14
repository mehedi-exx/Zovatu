// Validation Management Module
// Handles form validation and error display

export class ValidationManager {
  constructor() {
    this.rules = {
      required: (value) => value.trim() !== '',
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: (value) => /^8801[0-9]{9}$/.test(value),
      url: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      number: (value) => !isNaN(value) && value > 0,
      minLength: (value, min) => value.length >= min,
      maxLength: (value, max) => value.length <= max
    };

    this.messages = {
      bn: {
        required: 'এই ক্ষেত্রটি বাধ্যতামূলক',
        email: 'সঠিক ইমেইল ঠিকানা দিন',
        phone: 'সঠিক ফরম্যাট: 8801XXXXXXXXX',
        url: 'সঠিক URL দিন',
        number: 'সঠিক সংখ্যা দিন',
        minLength: 'কমপক্ষে {min} অক্ষর প্রয়োজন',
        maxLength: 'সর্বোচ্চ {max} অক্ষর অনুমোদিত'
      },
      en: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        phone: 'Correct format: 8801XXXXXXXXX',
        url: 'Please enter a valid URL',
        number: 'Please enter a valid number',
        minLength: 'Minimum {min} characters required',
        maxLength: 'Maximum {max} characters allowed'
      }
    };
  }

  validateField(element, rules = []) {
    const value = element.value.trim();
    const errors = [];

    for (const rule of rules) {
      if (typeof rule === 'string') {
        // Simple rule like 'required'
        if (!this.rules[rule](value)) {
          errors.push(this.getMessage(rule));
        }
      } else if (typeof rule === 'object') {
        // Rule with parameters like { rule: 'minLength', value: 3 }
        if (!this.rules[rule.rule](value, rule.value)) {
          errors.push(this.getMessage(rule.rule, rule.value));
        }
      }
    }

    this.displayValidation(element, errors);
    return errors.length === 0;
  }

  validateForm() {
    const requiredFields = [
      { id: 'name', rules: ['required'] },
      { id: 'code', rules: ['required'] },
      { id: 'price', rules: ['required', 'number'] },
      { id: 'wa', rules: ['required', 'phone'] }
    ];

    const firstImgInput = document.querySelector('.img-url');
    let isValid = true;
    const errors = [];

    // Clear previous errors
    this.clearAllErrors();

    // Validate required fields
    requiredFields.forEach(field => {
      const element = document.getElementById(field.id);
      if (element) {
        const fieldValid = this.validateField(element, field.rules);
        if (!fieldValid) {
          errors.push(this.getFieldLabel(field.id));
          isValid = false;
        }
      }
    });

    // Validate first image
    if (firstImgInput && !firstImgInput.value.trim()) {
      this.displayValidation(firstImgInput, [this.getMessage('required')]);
      errors.push('প্রোডাক্ট ছবি');
      isValid = false;
    } else if (firstImgInput && firstImgInput.value.trim()) {
      const urlValid = this.validateField(firstImgInput, ['url']);
      if (!urlValid) {
        errors.push('প্রোডাক্ট ছবি');
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  displayValidation(element, errors) {
    // Remove existing error messages
    const existingError = element.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Remove validation classes
    element.classList.remove('form-error', 'form-success');

    if (errors.length > 0) {
      // Add error class and message
      element.classList.add('form-error');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errors[0]}`;
      element.parentNode.insertBefore(errorDiv, element.nextSibling);
    } else if (element.value.trim()) {
      // Add success class for valid fields
      element.classList.add('form-success');
    }
  }

  clearAllErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
      el.classList.remove('form-error');
    });
    document.querySelectorAll('.form-success').forEach(el => {
      el.classList.remove('form-success');
    });
    document.querySelectorAll('.error-message').forEach(el => el.remove());
  }

  getMessage(rule, value = null) {
    const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
    let message = this.messages[currentLang][rule] || this.messages.en[rule];
    
    if (value !== null) {
      message = message.replace(`{${rule.replace(/[A-Z]/g, letter => letter.toLowerCase())}}`, value);
    }
    
    return message;
  }

  getFieldLabel(fieldId) {
    const labels = {
      bn: {
        name: 'প্রোডাক্ট নাম',
        code: 'প্রোডাক্ট কোড',
        price: 'মূল্য',
        wa: 'WhatsApp নম্বর'
      },
      en: {
        name: 'Product Name',
        code: 'Product Code',
        price: 'Price',
        wa: 'WhatsApp Number'
      }
    };

    const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
    return labels[currentLang][fieldId] || labels.en[fieldId];
  }

  // Real-time validation setup
  setupRealTimeValidation() {
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('form-error', 'form-success');
        const errorMsg = input.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      });

      input.addEventListener('blur', () => {
        // Validate on blur for better UX
        const fieldId = input.id;
        if (fieldId === 'name' || fieldId === 'code') {
          this.validateField(input, ['required']);
        } else if (fieldId === 'price' || fieldId === 'offer' || fieldId === 'qty') {
          if (input.value.trim()) {
            this.validateField(input, ['number']);
          }
        } else if (fieldId === 'wa') {
          if (input.value.trim()) {
            this.validateField(input, ['phone']);
          }
        } else if (input.classList.contains('img-url')) {
          if (input.value.trim()) {
            this.validateField(input, ['url']);
          }
        } else if (fieldId === 'video') {
          if (input.value.trim()) {
            this.validateField(input, ['url']);
          }
        }
      });
    });
  }
}

// Export singleton instance
export const validationManager = new ValidationManager();

