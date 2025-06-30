document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // ইউজারনেম ও পাসওয়ার্ড যাচাই (এইটা তোমার নিজস্ব শর্ত অনুযায়ী ঠিক করো)
  const validUsername = "admin";
  const validPassword = "1234";

  if (username === validUsername && password === validPassword) {
    // ✅ লগইন সফল → sessionStorage এ ইউজার সেট করো
    sessionStorage.setItem("loggedInUser", username);

    // ড্যাশবোর্ডে নিয়ে যাও
    window.location.href = "dashboard.html";
  } else {
    alert("❌ ভুল ইউজারনেম অথবা পাসওয়ার্ড!");
  }
});
