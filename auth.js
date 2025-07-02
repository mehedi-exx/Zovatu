// ✅ auth.js
function loginUser() {
  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!uname || !pass) {
    alert("⚠️ ইউজারনেম ও পাসওয়ার্ড পূরণ করুন");
    return;
  }

  fetch("users/users.json")
    .then(res => {
      if (!res.ok) {
        throw new Error("⚠️ ইউজার ডেটা লোড করা যায়নি");
      }
      return res.json();
    })
    .then(users => {
      const data = users[uname];
      if (!data) {
        alert("❌ ইউজার নেই");
        return;
      }

      if (data.password === pass && data.isPremium) {
        // ✅ সেভ ইনফো লোকালস্টোরেজে
        localStorage.setItem("loggedInUser", uname);

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 100);
      } else {
        alert("❌ ভুল পাসওয়ার্ড বা প্রিমিয়াম এক্সেস নেই");
      }
    })
    .catch(err => {
      alert("⚠️ লগইন ব্যর্থ: " + err.message);
    });
}
