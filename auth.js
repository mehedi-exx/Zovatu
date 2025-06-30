document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  let attempt = 0;
  const maxAttempts = 5;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = sanitize(document.getElementById("username").value.trim());
    const password = sanitize(document.getElementById("password").value.trim());

    const validUsername = "admin";
    const validPassword = "1234";

    if (attempt >= maxAttempts) {
      alert("🚫 অনেকবার ভুল চেষ্টা করেছেন! দয়া করে পরে আবার চেষ্টা করুন।");
      return;
    }

    if (username === validUsername && password === validPassword) {
      sessionStorage.setItem("loggedInUser", username);
      alert("✅ সফলভাবে লগইন হয়েছে!");
      window.location.href = "dashboard.html";
    } else {
      attempt++;
      alert(`❌ ভুল ইউজারনেম বা পাসওয়ার্ড! বাকি সুযোগ: ${maxAttempts - attempt}`);
    }
  });

  function sanitize(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});
