// ======= User Data & Auth System =======

// Initialize users array from localStorage or empty
let users = JSON.parse(localStorage.getItem("users") || "[]");

// Function to save users array to localStorage
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

// Add new user function
// Returns true if user added, false if username exists
function addUser(username, password, premium = true) {
  username = username.trim();
  password = password.trim();
  if (!username || !password) {
    alert("ইউজারনেম এবং পাসওয়ার্ড দিতে হবে।");
    return false;
  }
  const exists = users.find(u => u.username === username);
  if (exists) {
    alert("ইউজারনেমটি ইতিমধ্যেই ব্যবহৃত হচ্ছে!");
    return false;
  }
  users.push({ username, password, premium });
  saveUsers();
  alert("নতুন ইউজার সফলভাবে যুক্ত হয়েছে!");
  return true;
}

// Login function
function loginUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("ইউজারনেম এবং পাসওয়ার্ড লিখুন।");
    return;
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
    alert("লগইন সফল হয়েছে!");
    window.location.href = "dashboard.html";  // লগইন সফল হলে ড্যাশবোর্ডে নিয়ে যাবে
  } else {
    alert("ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে!");
  }
}

// Logout function
function logoutUser() {
  localStorage.removeItem("authUser");
  alert("সফলভাবে লগ আউট হয়েছে।");
  window.location.href = "login.html";
}

// Check login status - যে পেজে ব্যবহার করবেন সেখানে কল করবেন
function checkLogin() {
  const authUser = localStorage.getItem("authUser");
  if (!authUser) {
    window.location.href = "login.html";
  }
}

// Get current logged in user object or null
function getCurrentUser() {
  const authUser = localStorage.getItem("authUser");
  return authUser ? JSON.parse(authUser) : null;
}

// Example: Use this in admin page or wherever নতুন ইউজার যোগ করতে চান
// addUser("newuser", "newpassword");

// Export functions if using modules (optional)
// export { addUser, loginUser, logoutUser, checkLogin, getCurrentUser };
