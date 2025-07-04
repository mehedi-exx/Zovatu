// auth.js

// ===== Login Function =====
function loginUser() {
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("⚠️ ইউজারনেম এবং পাসওয়ার্ড দিন");
    return;
  }

  fetch(`users/${username}.json`)
    .then(res => {
      if (!res.ok) throw new Error("User not found");
      return res.json();
    })
    .then(data => {
      if (data.password === password) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", data.username);
        window.location.href = "dashboard.html";
      } else {
        alert("❌ ভুল পাসওয়ার্ড!");
      }
    })
    .catch(() => {
      alert("❌ ইউজার পাওয়া যায়নি!");
    });
}

// ===== Logout Function =====
function logoutUser() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");
  localStorage.removeItem("editDraftId"); // draft edit state
  window.location.href = "login.html";
}

// ===== Auth Protection =====
function checkAuth() {
  if (!localStorage.getItem("loggedIn")) {
    window.location.href = "login.html";
  }
}

// Automatically protect pages (except login.html)
if (!location.pathname.endsWith("login.html")) {
  checkAuth();
}
