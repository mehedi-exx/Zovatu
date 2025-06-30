document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (username === "admin" && password === "1234") {
        sessionStorage.setItem("loggedInUser", username);
        window.location.href = "dashboard.html";
      } else {
        alert("❌ ভুল ইউজারনেম বা পাসওয়ার্ড!");
      }
    });
  }
});
