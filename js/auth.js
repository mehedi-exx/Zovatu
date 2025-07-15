// Enhanced Authentication System for G9Tool
import { showToast } from './utils.js';

// Language translations for auth
const authTranslations = {
  en: {
    login: "Login",
    username: "Username",
    password: "Password",
    login_button: "Login",
    login_description: "Access your G9Tool Premium account",
    premium_access_contact: "Contact for premium access:",
    invalid_credentials: "Invalid username or password",
    login_success: "Login successful! Redirecting...",
    please_wait: "Please wait...",
    logging_in: "Logging in...",
    username_password_required: "Username and password are required",
    login_failed: "Login failed"
  },
  bn: {
    login: "লগইন",
    username: "ইউজারনেম",
    password: "পাসওয়ার্ড",
    login_button: "লগইন",
    login_description: "আপনার G9Tool প্রিমিয়াম অ্যাকাউন্ট অ্যাক্সেস করুন",
    premium_access_contact: "প্রিমিয়াম এক্সেস নিতে যোগাযোগ করুন:",
    invalid_credentials: "ভুল ইউজারনেম বা পাসওয়ার্ড",
    login_success: "লগইন সফল! রিডাইরেক্ট করা হচ্ছে...",
    please_wait: "অনুগ্রহ করে অপেক্ষা করুন...",
    logging_in: "লগইন করা হচ্ছে...",
    username_password_required: "ইউজারনেম এবং পাসওয়ার্ড প্রয়োজন",
    login_failed: "লগইন ব্যর্থ"
  }
};

// Get current language
function getCurrentLanguage() {
  return localStorage.getItem('language') || 'en';
}

// Get translation
function getTranslation(key) {
  const lang = getCurrentLanguage();
  return authTranslations[lang][key] || authTranslations.en[key] || key;
}

// Update UI text based on language
function updateUIText() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(key);
    
    if (element.tagName === 'INPUT') {
      element.placeholder = translation;
    } else {
      element.textContent = translation;
    }
  });
}

// Valid credentials (in production, this should be server-side)
const validCredentials = [
  { username: "admin", password: "admin123" },
  { username: "user", password: "user123" },
  { username: "demo", password: "demo123" },
  { username: "test", password: "test123" }
];

// Enhanced login function
async function loginUser() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = loginBtn.querySelector('span');
  const loginBtnIcon = loginBtn.querySelector('i');

  // Validation
  if (!username || !password) {
    showToast(getTranslation('username_password_required'), 'error');
    return;
  }

  // Show loading state
  loginBtn.disabled = true;
  loginBtnIcon.className = 'loading-spinner';
  loginBtnText.textContent = getTranslation('logging_in');

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check credentials
    const isValid = validCredentials.some(cred => 
      cred.username === username && cred.password === password
    );

    if (isValid) {
      // Store login info
      localStorage.setItem('loggedInUser', username);
      localStorage.setItem('userSession', JSON.stringify({
        username: username,
        loginTime: new Date().toISOString(),
        sessionId: generateSessionId()
      }));

      // Success feedback
      showToast(getTranslation('login_success'), 'success');
      loginBtnIcon.className = 'fas fa-check';
      loginBtnText.textContent = getTranslation('login_success');
      loginBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } else {
      // Error feedback
      showToast(getTranslation('invalid_credentials'), 'error');
      
      // Show error state
      loginBtnIcon.className = 'fas fa-times';
      loginBtnText.textContent = getTranslation('login_failed');
      loginBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      
      // Reset button after delay
      setTimeout(() => {
        loginBtnIcon.className = 'fas fa-sign-in-alt';
        loginBtnText.textContent = getTranslation('login_button');
        loginBtn.style.background = '';
        loginBtn.disabled = false;
        
        // Clear password field
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
      }, 2000);
    }

  } catch (error) {
    console.error('Login error:', error);
    showToast(getTranslation('login_failed'), 'error');
    
    // Reset button
    loginBtnIcon.className = 'fas fa-sign-in-alt';
    loginBtnText.textContent = getTranslation('login_button');
    loginBtn.style.background = '';
    loginBtn.disabled = false;
  }
}

// Generate session ID
function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Enhanced keyboard support
function setupKeyboardSupport() {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  // Enter key support
  [usernameInput, passwordInput].forEach(input => {
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          loginUser();
        }
      });
    }
  });

  // Focus management
  if (usernameInput) {
    usernameInput.focus();
  }
}

// Check if already logged in
function checkExistingSession() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  const userSession = localStorage.getItem('userSession');
  
  if (loggedInUser && userSession) {
    try {
      const session = JSON.parse(userSession);
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
      
      // Session valid for 24 hours
      if (hoursDiff < 24) {
        showToast('Redirecting to dashboard...', 'info');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
        return true;
      } else {
        // Clear expired session
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userSession');
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('userSession');
    }
  }
  return false;
}

// Language change handler
function handleLanguageChange() {
  window.addEventListener('languageChanged', (e) => {
    updateUIText();
  });
}

// Initialize authentication system
function initAuth() {
  // Check existing session first
  if (checkExistingSession()) {
    return;
  }

  // Setup UI
  updateUIText();
  setupKeyboardSupport();
  handleLanguageChange();

  // Auto-focus username field after a short delay
  setTimeout(() => {
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
      usernameInput.focus();
    }
  }, 500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

// Global function for backward compatibility
window.loginUser = loginUser;

// Export for use in other modules
export { loginUser, checkExistingSession, getCurrentLanguage, getTranslation };

