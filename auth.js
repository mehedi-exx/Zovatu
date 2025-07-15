import { showToast, loadLanguage, translateElement, getStorageItem, setStorageItem } from './js/utils.js';

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
  loginBtn.innerHTML = '<div class="loading"></div> <span>' + translateElement("logging_in") + '...</span>';
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
        loginBtn.innerHTML = '<i class="fas fa-check"></i> <span>' + translateElement("login_successful") + '!</span>';
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
      loginBtn.innerHTML = '<i class="fas fa-times"></i> <span>' + translateElement("login_failed") + '</span>';
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
  await loadLanguage(savedLang);

  // Apply saved theme on load
  const savedTheme = getStorageItem("theme", "dark");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }
  updateThemeToggleIcon(savedTheme);
});

// Function to toggle theme (defined in index.html, but called from here)
function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const currentTheme = document.body.classList.contains("light-mode") ? "light" : "dark";
  setStorageItem("theme", currentTheme);
  updateThemeToggleIcon(currentTheme);
}

function updateThemeToggleIcon(theme) {
  const toggleButton = document.querySelector(".theme-toggle");
  if (toggleButton) {
    if (theme === "light") {
      toggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      toggleButton.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }
}

window.loginUser = loginUser;
window.toggleTheme = toggleTheme;
window.updateThemeToggleIcon = updateThemeToggleIcon;


