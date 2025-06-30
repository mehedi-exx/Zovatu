function loginUser() {
  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (uname === "" || pass === "") {
    alert("⚠️ ইউজারনেম ও পাসওয়ার্ড দিন!");
    return;
  }

  fetch(`users/${uname}.json`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("ইউজার খুঁজে পাওয়া যায়নি!");
      }
      return res.json();
    })
    .then((data) => {
      if (data.password === pass) {
        sessionStorage.setItem("loggedInUser", uname);
        window.location.href = "dashboard.html";
      } else {
        alert("❌ পাসওয়ার্ড ভুল!");
      }
    })
    .catch((err) => {
      alert("❌ ইউজার খুঁজে পাওয়া যায়নি!");
    });
}

function logoutUser() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}
