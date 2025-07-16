// ZOVATU Authentication - Professional eCommerce Website Builder

import { showToast, saveToStorage, loadFromStorage } from './js/utils.js';

// ===== AUTHENTICATION CONSTANTS =====
const AUTH_CONFIG = {
  maxAttempts: 3,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
};

// ===== DEFAULT USERS =====
const defaultUsers = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrator',
    email: 'admin@zovatu.com',
    createdAt: new Date().toISOString(),
    lastLogin: null,
    isActive: true
  }
};

// ===== AUTHENTICATION FUNCTIONS =====
function initializeUsers() {
  const existingUsers = loadFromStorage('users');
  if (!existingUsers) {
    saveToStorage('users', defaultUsers);
  }
}

function getUsers() {
  return loadFromStorage('users') || defaultUsers;
}

function saveUsers(users) {
  return saveToStorage('users', users);
}

function validateCredentials(username, password) {
  if (!username || !password) {
    return { success: false, message: 'Username and password are required' };
  }
  
  if (username.length < 3) {
    return { success: false, message: 'Username must be at least 3 characters' };
  }
  
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }
  
  return { success: true };
}

function checkLoginAttempts(username) {
  const attempts = loadFromStorage('loginAttempts') || {};
  const userAttempts = attempts[username];
  
  if (!userAttempts) return { allowed: true };
  
  const now = Date.now();
  const timeSinceLastAttempt = now - userAttempts.lastAttempt;
  
  // Reset attempts if lockout period has passed
  if (timeSinceLastAttempt > AUTH_CONFIG.lockoutDuration) {
    delete attempts[username];
    saveToStorage('loginAttempts', attempts);
    return { allowed: true };
  }
  
  // Check if user is locked out
  if (userAttempts.count >= AUTH_CONFIG.maxAttempts) {
    const remainingTime = Math.ceil((AUTH_CONFIG.lockoutDuration - timeSinceLastAttempt) / 60000);
    return { 
      allowed: false, 
      message: `Account locked. Try again in ${remainingTime} minutes.` 
    };
  }
  
  return { allowed: true, attempts: userAttempts.count };
}

function recordLoginAttempt(username, success) {
  const attempts = loadFromStorage('loginAttempts') || {};
  
  if (success) {
    // Clear attempts on successful login
    delete attempts[username];
  } else {
    // Increment failed attempts
    if (!attempts[username]) {
      attempts[username] = { count: 0, lastAttempt: 0 };
    }
    attempts[username].count++;
    attempts[username].lastAttempt = Date.now();
  }
  
  saveToStorage('loginAttempts', attempts);
}

function authenticateUser(username, password) {
  // Check login attempts
  const attemptCheck = checkLoginAttempts(username);
  if (!attemptCheck.allowed) {
    return { success: false, message: attemptCheck.message };
  }
  
  // Validate input
  const validation = validateCredentials(username, password);
  if (!validation.success) {
    return validation;
  }
  
  // Get users
  const users = getUsers();
  const user = users[username];
  
  // Check if user exists and is active
  if (!user || !user.isActive) {
    recordLoginAttempt(username, false);
    return { success: false, message: 'Invalid username or password' };
  }
  
  // Check password
  if (user.password !== password) {
    recordLoginAttempt(username, false);
    return { success: false, message: 'Invalid username or password' };
  }
  
  // Update last login
  user.lastLogin = new Date().toISOString();
  users[username] = user;
  saveUsers(users);
  
  // Record successful login
  recordLoginAttempt(username, true);
  
  // Create session
  const session = {
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email,
    loginTime: new Date().toISOString(),
    expiresAt: new Date(Date.now() + AUTH_CONFIG.sessionDuration).toISOString()
  };
  
  saveToStorage('loggedInUser', session);
  
  return { success: true, user: session };
}

function isAuthenticated() {
  const session = loadFromStorage('loggedInUser');
  
  if (!session) return false;
  
  // Check if session has expired
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  
  if (now > expiresAt) {
    // Session expired
    logout();
    return false;
  }
  
  return true;
}

function getCurrentUser() {
  if (!isAuthenticated()) return null;
  return loadFromStorage('loggedInUser');
}

function logout() {
  const user = getCurrentUser();
  if (user) {
    console.log(`User ${user.username} logged out`);
  }
  
  // Clear session data
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('autoSaveData');
  localStorage.removeItem('editDraftId');
  
  return true;
}

function extendSession() {
  const session = getCurrentUser();
  if (!session) return false;
  
  // Extend session by updating expiration time
  session.expiresAt = new Date(Date.now() + AUTH_CONFIG.sessionDuration).toISOString();
  saveToStorage('loggedInUser', session);
  
  return true;
}

// ===== LOGIN FORM HANDLING =====
function handleLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!username || !password) {
      showToast('Please enter both username and password', 'warning');
      return;
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = authenticateUser(username, password);
      
      if (result.success) {
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        showToast(result.message, 'error');
        
        // Clear password field on error
        const passwordField = document.getElementById('password');
        if (passwordField) {
          passwordField.value = '';
          passwordField.focus();
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('An error occurred during login. Please try again.', 'error');
    } finally {
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
  
  // Handle Enter key in password field
  const passwordField = document.getElementById('password');
  if (passwordField) {
    passwordField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
      }
    });
  }
}

// ===== ROUTE PROTECTION =====
function protectRoute() {
  // Skip protection for login page
  if (window.location.pathname.includes('index.html') || 
      window.location.pathname === '/' || 
      window.location.pathname === '') {
    return;
  }
  
  if (!isAuthenticated()) {
    showToast('Please log in to access this page', 'warning');
    window.location.href = 'index.html';
    return;
  }
  
  // Extend session on page access
  extendSession();
}

// ===== SESSION MONITORING =====
function setupSessionMonitoring() {
  // Check session every 5 minutes
  setInterval(() => {
    if (!isAuthenticated() && !window.location.pathname.includes('index.html')) {
      showToast('Your session has expired. Please log in again.', 'warning');
      window.location.href = 'index.html';
    }
  }, 5 * 60 * 1000);
  
  // Extend session on user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  let lastActivity = Date.now();
  
  events.forEach(event => {
    document.addEventListener(event, () => {
      const now = Date.now();
      // Only extend session if 5 minutes have passed since last activity
      if (now - lastActivity > 5 * 60 * 1000) {
        extendSession();
        lastActivity = now;
      }
    }, { passive: true });
  });
}

// ===== SECURITY FEATURES =====
function setupSecurityFeatures() {
  // Prevent multiple tabs with same session
  window.addEventListener('storage', (e) => {
    if (e.key === 'loggedInUser' && e.newValue === null) {
      // User logged out in another tab
      if (getCurrentUser()) {
        showToast('You have been logged out from another tab', 'info');
        window.location.href = 'index.html';
      }
    }
  });
  
  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    // Clear any temporary sensitive data
    sessionStorage.clear();
  });
}

// ===== INITIALIZATION =====
function initializeAuth() {
  // Initialize default users
  initializeUsers();
  
  // Setup route protection
  protectRoute();
  
  // Setup login form if present
  handleLoginForm();
  
  // Setup session monitoring
  setupSessionMonitoring();
  
  // Setup security features
  setupSecurityFeatures();
  
  console.log('ZOVATU Authentication initialized');
}

// ===== EXPORT FUNCTIONS =====
window.authenticateUser = authenticateUser;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.logout = logout;

// ===== AUTO-INITIALIZATION =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
  initializeAuth();
}

