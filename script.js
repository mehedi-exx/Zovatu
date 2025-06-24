// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");
const form = document.getElementById("productForm");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

// 🌙 Theme toggle system
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  const mode = document.body.classList.contains("dark") ? "🌙" : "☀️";
  themeToggle.textContent = mode;
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};

// ☰ Menu toggle
menuToggle.onclick = () => {
  sideMenu.style.display = sideMenu.style.display === "block" ? "none" : "block";
};

// 🚀 On load set theme from localStorage
window.onload = () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.add(savedTheme);
  themeToggle.textContent = savedTheme === "dark" ? "🌙" : "☀️";
};

// ✅ Generate HTML
form.onsubmit = (e) => {
  e.preventDefault();

  const name = document.getElementById("pname").value.trim();
  const code = document.getElementById("sku").value.trim();
  const price = document.getElementById("price").value.trim();
  const offer = document.getElementById("offer").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const stock = document.getElementById("stock").value;
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();
  const image = document.getElementById("image").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();

  // ✅ HTML Template
  const html = `
<img src="${image}" alt="${name}" style="max-width:100%;border-radius:10px;margin-bottom:10px;" />
<h2 style="text-align:center;margin:5px 0;">${name}</h2>
<p style="text-align:center;font-size:16px;">৳${price}${offer ? ` → <strong style="color:#ff5252;">৳${offer}</strong>` : ""}</p>

<p style="text-align:center;margin:10px 0;">
  <a href="https://wa.me/${whatsapp}?text=${encodeURIComponent(
    `📦 আমি একটি পণ্য অর্ডার করতে চাই:\n\n🔖 পণ্যের নাম: ${name}\n💰 মূল্য: ৳${offer || price}\n🔢 প্রোডাক্ট কোড: ${code}\n\n📞 দয়া করে বিস্তারিত জানান।`
  )}"
     target="_blank"
     style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    📲 অর্ডার করুন WhatsApp এ
  </a>
</p>

<h3>🧵 প্রোডাক্ট বিস্তারিত:</h3>
<ul>
  <li>🔢 কোড: ${code}</li>
  <li>📦 স্ট্যাটাস: ${stock}</li>
  <li>📁 ক্যাটাগরি: ${category}</li>
  <li>🚚 ডেলিভারি টাইম: ${delivery || "N/A"}</li>
</ul>

<p>${description || ""}</p>

<!-- ✅ Hidden Shortcode -->
<p style="display:none;">
  <a href="#">{getProduct} $button={Price} $price={৳${offer || price}} $sale={৳${price}} $icon={cart} $style={1}</a>
</p>`;

  output.innerHTML = html;
};

// 📋 Copy to clipboard
copyBtn.onclick = () => {
  const temp = document.createElement("textarea");
  temp.value = output.innerHTML;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  alert("✅ কোড কপি করা হয়েছে!");
};

// ⬇️ Download as HTML
downloadBtn.onclick = () => {
  const blob = new Blob([output.innerHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product.html";
  a.click();
};
