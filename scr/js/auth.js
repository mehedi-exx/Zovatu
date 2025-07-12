function loginUser() {
  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!uname || !pass) {
    alert("⚠️ ইউজারনেম ও পাসওয়ার্ড পূরণ করুন");
    return;
  }

  fetch(`../data/${uname}.json`)
    .then(res => {
      if (!res.ok) {
        throw new Error("ইউজার পাওয়া যায়নি");
      }
      return res.json();
    })
    .then(data => {
      if (data.password === pass && data.isPremium) {
        // লোকালস্টোরেজে ইউজার তথ্য সংরক্ষণ
        localStorage.setItem("loggedInUser", uname);

        // একটু ডিলে দিয়ে রিডাইরেক্ট, যাতে লোকালস্টোরেজ সেভ হয়
        setTimeout(() => {
          window.location.href = "../dashboard.html";
        }, 100);
      } else {
        alert("❌ ইউজার তথ্য সঠিক নয় অথবা প্রিমিয়াম ইউজার নন");
      }
    })
    .catch(error => {
      alert("⚠️ লগইন ব্যর্থ: " + error.message);
    });
}


