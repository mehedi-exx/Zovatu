// 🔄 Theme toggle and store preference
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  document.body.classList.toggle("dark");
  const current = document.body.classList.contains("light-mode") ? "light" : "dark";
  localStorage.setItem("theme", current);
  themeToggle.textContent = current === "light" ? "🌙" : "☀️";
});

// ⏯ Apply saved theme from localStorage
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark");
    themeToggle.textContent = "🌙";
  } else {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
});

// 📱 Sidebar (Menu) toggle
const menuBtn = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// 🛠️ Generate HTML Preview
document.getElementById("generate").addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const code = document.getElementById("code").value.trim();
  const price = document.getElementById("price").value.trim();
  const offer = document.getElementById("offer").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const stock = document.getElementById("stock").value.trim();
  const category = document.getElementById("category").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const image = document.getElementById("image").value.trim();
  const admin = document.getElementById("admin").value.trim();

  if (!name || !code || !price || !admin) {
    alert("📛 অনুগ্রহ করে প্রোডাক্ট নাম, কোড, প্রাইস এবং অ্যাডমিন নম্বর দিন!");
    return;
  }

  const html = `
<!-- ✅ Product Image & Title -->
<div style="text-align:center;">
  ${image ? `<img src="${image}" style="max-width:100%;border-radius:10px;margin-bottom:10px;" alt="${name}" />` : ""}
  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:16px;">৳${offer || price}${offer ? ` → <strong style="color:#ff5252;">৳${offer}</strong>` : ""}</p>
</div>

<!-- ✅ WhatsApp Order Button -->
<p style="text-align:center;margin:10px 0;">
  <a href="https://wa.me/${admin}?text=${encodeURIComponent(
    `📦 আমি একটি পণ্য অর্ডার করতে চাই:\n\n🔖 প্রোডাক্ট: ${name}\n💰 মূল্য: ৳${offer || price}\n🧾 কোড: ${code}\n📁 ক্যাটাগরি: ${category || 'N/A'}\n🚚 ডেলিভারি টাইম: ${delivery || 'N/A'}\n\nদয়া করে বিস্তারিত জানান।`
  )}"
    target="_blank"
    style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    📲 অর্ডার করুন WhatsApp এ
  </a>
</p>

<!-- ✅ Details List -->
<ul>
  <li>🔢 কোড: ${code}</li>
  <li>📦 স্ট্যাটাস: ${stock}</li>
  <li>📁 ক্যাটাগরি: ${category || "N/A"}</li>
  <li>🚚 ডেলিভারি টাইম: ${delivery || "N/A"}</li>
</ul>

<!-- ✅ Description -->
<p>${desc || ""}</p>

<!-- ✅ Hidden Shortcode (Amazen Theme Support) -->
<p style="display:none;">
  <a href="#">
    {getProduct} $button={Price} $price={৳${offer || price}} $sale={৳${price}} $icon={cart} $style={1}
  </a>
</p>
`;

  const output = document.getElementById("output");
  output.innerText = html;
  output.classList.add("show");
});

// 📋 Copy Button
document.getElementById("copy").addEventListener("click", () => {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ কোড কপি করা হয়েছে!");
  });
});

// ⬇️ Download Button
document.getElementById("download").addEventListener("click", () => {
  const content = document.getElementById("output").innerText;
  const blob = new Blob([content], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "product-post.html";
  link.click();
});
