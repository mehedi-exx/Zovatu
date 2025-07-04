// auth.js

// 🔐 Check if user is authenticated
function checkAuth() {
  const user = localStorage.getItem("g9user");
  const isLoginPage = location.pathname.endsWith("login.html");

  if (!user && !isLoginPage) {
    // Not logged in, redirect to login
    location.href = "login.html";
  }
}

// 🔓 Log out function
function logout() {
  localStorage.removeItem("g9user");
  location.href = "login.html";
}

// 🔑 Login function
function loginUser() {
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("ইউজারনেম ও পাসওয়ার্ড দিতে হবে");
    return;
  }

  const userPath = `users/${username}.json`;

  fetch(userPath)
    .then(response => {
      if (!response.ok) {
        throw new Error("ইউজার পাওয়া যায়নি");
      }
      return response.json();
    })
    .then(data => {
      if (data.username === username && data.password === password) {
        localStorage.setItem("g9user", JSON.stringify(data));
        location.href = "dashboard.html";
      } else {
        alert("ভুল পাসওয়ার্ড!");
      }
    })
    .catch(err => {
      console.error("Login error:", err);
      alert("ইউজারনেম বা পাসওয়ার্ড ভুল!");
    });
}

// ✅ Auto-run: Block access if not logged in
checkAuth();
