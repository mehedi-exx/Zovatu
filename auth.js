async function loginUser() {
  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!uname || !pass) {
    alert("⚠️ ইউজারনেম এবং পাসওয়ার্ড দিন!");
    return;
  }

  try {
    const res = await fetch(`users/${uname}.json`);
    if (!res.ok) throw new Error("User not found");
    const data = await res.json();

    if (data.username === uname && data.password === pass && data.isPremium) {
      localStorage.setItem("g9tool_user", uname);
      window.location.href = "dashboard.html";
    } else {
      alert("❌ ইউজারনেম বা পাসওয়ার্ড ভুল অথবা প্রিমিয়াম এক্সেস নেই!");
    }
  } catch (err) {
    alert("❌ ইউজার খুঁজে পাওয়া যায়নি!");
  }
}
