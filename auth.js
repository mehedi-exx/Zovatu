// auth.js

// লগইন ফাংশন
function loginUser() {
  const usernameInput = document.getElementById("username").value.trim();
  const passwordInput = document.getElementById("password").value;

  // এখানে আপনার ইউজারনেম-পাসওয়ার্ড ভ্যালিডেশন করুন
  // উদাহরণস্বরূপ:
  const validUsers = {
    "admin": "admin123",
    "user1": "password1",
    // প্রয়োজনে আরও ব্যবহারকারী যুক্ত করুন
  };

  if (!usernameInput || !passwordInput) {
    alert("অনুগ্রহ করে ইউজারনেম ও পাসওয়ার্ড প্রদান করুন।");
    return;
  }

  if (validUsers[usernameInput] && validUsers[usernameInput] === passwordInput) {
    // লগইন সফল
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", usernameInput);
    // লগইন পেজ থেকে ড্যাশবোর্ডে নিয়ে যান
    window.location.href = "dashboard.html";
  } else {
    alert("ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।");
  }
}

// পেজ লোডে লগইন স্টেট চেক
function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    // লগইন না থাকলে লগইন পেজে রিডাইরেক্ট
    window.location.href = "login.html";
  }
}

// লগআউট ফাংশন
function logoutUser() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  localStorage.removeItem("editDraftId"); // যদি প্রয়োজন মনে করেন
  // অন্য প্রয়োজনীয় localStorage ডাটা মুছে ফেলুন

  // লগইন পেজে নিয়ে যান
  window.location.href = "login.html";
}

// DOMContentLoaded ইভেন্টে লগইন চেক করার জন্য
document.addEventListener("DOMContentLoaded", () => {
  // যদি এই পেজটি লগইন পেজ না হয়, তাহলে চেক করবেন
  if (!window.location.href.includes("login.html")) {
    checkAuth();
  }
});

// যদি আপনার sidebar বা অন্য কোনো জায়গায় লগআউট বাটন থাকে তাহলে নিচের মত কল করুন:
// <button onclick="logoutUser()">লগ আউট</button>
