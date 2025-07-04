// ======= Config =======
const USER_FOLDER_PATH = 'users/'; // Folder where each user JSON file is stored
const LOGGED_IN_KEY = 'loggedInUser';

// ======= Login Function =======
function loginUser() {
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("⚠️ ইউজারনেম এবং পাসওয়ার্ড দিন।");
    return;
  }

  fetch(`${USER_FOLDER_PATH}${username}.json`)
    .then(res => {
      if (!res.ok) throw new Error("❌ ইউজার পাওয়া যায়নি");
      return res.json();
    })
    .then(userData => {
      if (userData.password === password) {
        localStorage.setItem(LOGGED_IN_KEY, username);
        window.location.href = "dashboard.html";
      } else {
        alert("❌ পাসওয়ার্ড ভুল");
      }
    })
    .catch(err => {
      alert("❌ ইউজার পাওয়া যায়নি");
      console.error(err);
    });
}

// ======= Logout Function =======
function logoutUser() {
  localStorage.removeItem(LOGGED_IN_KEY);
  window.location.href = "login.html";
}

// ======= Access Protection =======
function protectPage() {
  const currentPage = window.location.pathname;
  const isLoggedIn = !!localStorage.getItem(LOGGED_IN_KEY);

  if (!isLoggedIn && !currentPage.includes("login.html")) {
    window.location.href = "login.html";
  }

  if (isLoggedIn && currentPage.includes("login.html")) {
    window.location.href = "dashboard.html";
  }
}

// Call this function on all protected pages
protectPage();
