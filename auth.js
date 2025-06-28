async function login() {
  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("login-error");

  if (!uname || !pass) {
    errorBox.textContent = "⚠️ ইউজারনেম এবং পাসওয়ার্ড দিন।";
    return;
  }

  try {
    const res = await fetch(`user/user-${uname}.json`);
    const data = await res.json();

    if (data.username === uname && data.password === pass && data.isPremium) {
      localStorage.setItem("loggedInUser", uname);
      window.location.href = "index.html";
    } else {
      errorBox.textContent = "❌ ইউজারনেম বা পাসওয়ার্ড ভুল বা আপনি প্রিমিয়াম নন।";
    }
  } catch (e) {
    errorBox.textContent = "❌ ইউজার খুঁজে পাওয়া যায়নি।";
  }
}
