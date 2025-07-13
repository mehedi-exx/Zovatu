import { showToast, loadLanguage, translateElement } from './js/utils.js';

function loginUser() {
  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!uname || !pass) {
    showToast(translateElement("username_password_required"));
    return;
  }

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
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 100);
      } else {
        showToast(translateElement("invalid_credentials_or_not_premium"));
      }
    })
    .catch(error => {
      showToast(`${translateElement("login_failed")}: ${error.message}`);
    });
}

window.addEventListener("DOMContentLoaded", async () => {
  const savedLang = localStorage.getItem("language") || "bn";
  await loadLanguage(savedLang);
});

window.loginUser = loginUser;


