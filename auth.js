import { showToast, loadLanguage, translateElement } from './js/utils.js';

// Add loading animation CSS
const loadingCSS = `
.loading {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = loadingCSS;
document.head.appendChild(style);

function loginUser() {
  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const loginBtn = document.getElementById("loginBtn");

  if (!uname || !pass) {
    showToast(translateElement("username_password_required"), "error");
    return;
  }

  // Show loading effect
  const originalContent = loginBtn.innerHTML;
  loginBtn.innerHTML = '<div class="loading"></div> <span>Logging in...</span>';
  loginBtn.disabled = true;
  loginBtn.style.opacity = '0.8';

  fetch(`users/${uname}.json`)
    .then(res => {
      if (!res.ok) {
        throw new Error(translateElement("user_not_found"));
      }
      return res.json();
    })
    .then(data => {
      if (data.password === pass && data.isPremium) {
        localStorage.setItem("loggedInUser", uname);
        
        // Success state
        loginBtn.innerHTML = '<i class="fas fa-check"></i> <span>Login Successful!</span>';
        loginBtn.style.background = '#10b981';
        showToast(translateElement("login_successful"), "success");
        
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        throw new Error(translateElement("invalid_credentials_or_not_premium"));
      }
    })
    .catch(error => {
      // Error state
      loginBtn.innerHTML = '<i class="fas fa-times"></i> <span>Login Failed</span>';
      loginBtn.style.background = '#ef4444';
      showToast(`${translateElement("login_failed")}: ${error.message}`, "error");
      
      // Reset button after 2 seconds
      setTimeout(() => {
        loginBtn.innerHTML = originalContent;
        loginBtn.style.background = '';
        loginBtn.style.opacity = '1';
        loginBtn.disabled = false;
      }, 2000);
    });
}

// Add Enter key support for login
document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loginUser();
      }
    });
  });
});

window.addEventListener("DOMContentLoaded", async () => {
  const savedLang = localStorage.getItem("language") || "en"; // Set default language to English
  await 
});

window.loginUser = loginUser;
