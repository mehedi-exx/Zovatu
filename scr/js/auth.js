// G9Tool Enhanced Authentication System v4.0

// ✅ Enhanced Login Function
function loginUser() {
  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  // Input validation
  if (!uname || !pass) {
    showLoginMessage("⚠️ ইউজারনেম ও পাসওয়ার্ড পূরণ করুন", "error");
    return;
  }

  // Show loading state
  const loginBtn = document.querySelector('.login-btn');
  const originalText = loginBtn.innerHTML;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> লগইন হচ্ছে...';
  loginBtn.disabled = true;

  // Attempt login
  fetch(`../data/${uname}.json`)
    .then(res => {
      if (!res.ok) {
        throw new Error("ইউজার পাওয়া যায়নি");
      }
      return res.json();
    })
    .then(data => {
      if (data.password === pass && data.isPremium) {
        // Store user info
        const userInfo = {
          username: uname,
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          sessionId: generateSessionId()
        };
        
        localStorage.setItem("loggedInUser", uname);
        localStorage.setItem("userSession", JSON.stringify(userInfo));
        
        showLoginMessage("✅ লগইন সফল! রিডাইরেক্ট হচ্ছে...", "success");
        
        // Redirect with delay
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        throw new Error("ইউজার তথ্য সঠিক নয় অথবা প্রিমিয়াম ইউজার নন");
      }
    })
    .catch(error => {
      showLoginMessage("⚠️ লগইন ব্যর্থ: " + error.message, "error");
      
      // Reset button
      loginBtn.innerHTML = originalText;
      loginBtn.disabled = false;
      
      // Clear password field
      document.getElementById("password").value = "";
      document.getElementById("password").focus();
    });
}

// ✅ Generate Session ID
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ✅ Enhanced Message Display
function showLoginMessage(message, type = "info") {
  // Remove existing message
  const existingMsg = document.querySelector('.login-message');
  if (existingMsg) existingMsg.remove();
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'login-message';
  
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  };
  
  msgDiv.style = `
    background: ${colors[type] || colors.info};
    color: ${type === 'warning' ? '#000' : 'white'};
    padding: 12px 20px;
    border-radius: 8px;
    margin: 15px 0;
    text-align: center;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;
  
  msgDiv.textContent = message;
  
  const loginBox = document.querySelector('.login-box');
  const loginBtn = document.querySelector('.login-btn');
  loginBox.insertBefore(msgDiv, loginBtn);
  
  // Auto remove after 5 seconds for non-success messages
  if (type !== 'success') {
    setTimeout(() => {
      if (msgDiv.parentNode) {
        msgDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => msgDiv.remove(), 300);
      }
    }, 5000);
  }
}

// ✅ Session Management
function checkSession() {
  const username = localStorage.getItem("loggedInUser");
  const sessionData = localStorage.getItem("userSession");
  
  if (!username || !sessionData) {
    return false;
  }
  
  try {
    const session = JSON.parse(sessionData);
    const now = new Date();
    const loginTime = new Date(session.loginTime);
    const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
    
    // Session expires after 24 hours
    if (hoursSinceLogin > 24) {
      logout();
      return false;
    }
    
    // Update last activity
    session.lastActivity = now.toISOString();
    localStorage.setItem("userSession", JSON.stringify(session));
    
    return true;
  } catch (e) {
    logout();
    return false;
  }
}

// ✅ Enhanced Logout
function logout() {
  // Clear all user data
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("userSession");
  localStorage.removeItem("g9tool_autosave");
  
  // Show logout message
  if (typeof showToast === 'function') {
    showToast('সফলভাবে লগ আউট হয়েছে', 'info');
  }
  
  // Redirect to login
  setTimeout(() => {
    window.location.replace("index.html");
  }, 1000);
}

// ✅ Auto-logout on inactivity
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  
  // Auto-logout after 2 hours of inactivity
  inactivityTimer = setTimeout(() => {
    if (confirm('দীর্ঘ সময় নিষ্ক্রিয় থাকার কারণে আপনি লগ আউট হয়ে যাবেন। অব্যাহত রাখতে চান?')) {
      resetInactivityTimer();
    } else {
      logout();
    }
  }, 2 * 60 * 60 * 1000); // 2 hours
}

// ✅ Remember Me Functionality
function toggleRememberMe() {
  const checkbox = document.getElementById('rememberMe');
  if (checkbox && checkbox.checked) {
    const username = document.getElementById('username').value.trim();
    if (username) {
      localStorage.setItem('rememberedUser', username);
    }
  } else {
    localStorage.removeItem('rememberedUser');
  }
}

// ✅ Load Remembered User
function loadRememberedUser() {
  const remembered = localStorage.getItem('rememberedUser');
  if (remembered) {
    document.getElementById('username').value = remembered;
    const rememberCheckbox = document.getElementById('rememberMe');
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }
}

// ✅ Enhanced Security
function validateInput(input) {
  // Basic XSS prevention
  return input.replace(/[<>\"']/g, '');
}

// ✅ Keyboard Support
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    loginUser();
  }
}

// ✅ Initialize Authentication
document.addEventListener('DOMContentLoaded', () => {
  // Add CSS animations if not exists
  if (!document.getElementById('auth-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-20px); opacity: 0; }
      }
      .login-message {
        animation: slideIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Load remembered user
  loadRememberedUser();
  
  // Add event listeners
  const usernameField = document.getElementById('username');
  const passwordField = document.getElementById('password');
  const rememberCheckbox = document.getElementById('rememberMe');
  
  if (usernameField) {
    usernameField.addEventListener('keypress', handleKeyPress);
    usernameField.addEventListener('input', (e) => {
      e.target.value = validateInput(e.target.value);
    });
  }
  
  if (passwordField) {
    passwordField.addEventListener('keypress', handleKeyPress);
  }
  
  if (rememberCheckbox) {
    rememberCheckbox.addEventListener('change', toggleRememberMe);
  }
  
  // Check if already logged in
  if (checkSession() && window.location.pathname.includes('index.html')) {
    window.location.replace('dashboard.html');
  }
  
  // Set up inactivity timer for logged-in users
  if (checkSession()) {
    resetInactivityTimer();
    
    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });
  }
});

// ✅ Page Protection
function protectPage() {
  if (!checkSession()) {
    window.location.replace('index.html');
    return false;
  }
  return true;
}

// ✅ Export functions for global access
window.AuthSystem = {
  loginUser,
  logout,
  checkSession,
  protectPage,
  resetInactivityTimer
};

