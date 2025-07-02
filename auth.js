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
      const user = users[uname];
      if (!user) {
        alert("❌ ইউজার নেই");
        return;
      }

      if (user.password === pass && user.isPremium) {
        localStorage.setItem("loggedInUser", uname);
        alert("✅ সফলভাবে লগইন হয়েছে!");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 100);
      } else {
        alert("❌ পাসওয়ার্ড ভুল অথবা আপনি প্রিমিয়াম ইউজার নন");
      }
    })
    .catch(error => {
      alert("🚫 লগইন ব্যর্থ: " + error.message);
    });
}
