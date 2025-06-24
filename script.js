document.getElementById("toggleTheme").onclick = function () {
  const body = document.body;
  const icon = document.getElementById("toggleTheme");
  body.classList.toggle("dark");
  body.classList.toggle("light");
  const isDark = body.classList.contains("dark");
  icon.textContent = isDark ? "🌙" : "☀️";
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

document.getElementById("menuToggle").onclick = function () {
  document.getElementById("sidebar").classList.toggle("show");
};

window.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.remove("light", "dark");
  document.body.classList.add(savedTheme);
  document.getElementById("toggleTheme").textContent = savedTheme === "dark" ? "🌙" : "☀️";
});

document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("productName").value;
  const code = document.getElementById("productCode").value;
  const price = document.getElementById("price").value;
  const offer = document.getElementById("offerPrice").value;
  const delivery = document.getElementById("deliveryTime").value;
  const stock = document.getElementById("stock").value;
  const cat = document.getElementById("category").value;
  const desc = document.getElementById("description").value;
  const img = document.getElementById("imageUrl").value;
  const phone = document.getElementById("adminNumber").value;

  const html = `
<img src="${img}" alt="${name}" style="max-width:100%;border-radius:10px;margin-bottom:10px;" />
<h2 style="text-align:center;margin:5px 0;">${name}</h2>
<p style="text-align:center;font-size:16px;">৳${price} ${offer ? `→ <strong style="color:#ff5252;">৳${offer}</strong>` : ""}</p>
<p style="text-align:center;">
  <a href="https://wa.me/${phone}?text=${encodeURIComponent(`📦 আমি একটি পণ্য অর্ডার করতে চাই:\n\n🧾 প্রোডাক্টের নাম: ${name}\n💰 মূল্য: ${offer || price}\n🔖 প্রোডাক্ট কোড: ${code}\n\n📞 দয়া করে বিস্তারিত জানান।`)}"
     target="_blank"
     style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    📲 অর্ডার করুন WhatsApp এ
  </a>
</p>
<h3>🧵 প্রোডাক্ট বিস্তারিত:</h3>
<ul>
  <li>🔢 কোড: ${code}</li>
  <li>📦 স্ট্যাটাস: ${stock}</li>
  <li>📁 ক্যাটাগরি: ${cat}</li>
  <li>🚚 ডেলিভারি টাইম: ${delivery || "N/A"}</li>
</ul>
<p>${desc}</p>
<p style="display:none;">
  <a href="#">{getProduct} $button={Price} $price={৳${offer || price}} $sale={৳${price}} $icon={cart} $style={1}</a>
</p>
`;

  const output = document.getElementById("output");
  output.textContent = html;
  document.getElementById("outputBox").style.display = "block";
});

document.getElementById("copyBtn").onclick = function () {
  const code = document.getElementById("output").textContent;
  navigator.clipboard.writeText(code);
  alert("✅ Copied!");
};

document.getElementById("downloadBtn").onclick = function () {
  const blob = new Blob([document.getElementById("output").textContent], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "product.html";
  a.click();
};
