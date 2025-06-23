function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("themeToggle");
  body.classList.toggle("light");
  btn.textContent = body.classList.contains("light") ? "☀️" : "🌙";
}

function toggleMenu() {
  document.getElementById("menu").classList.toggle("show");
}

document.getElementById("g9Form").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const sku = document.getElementById("sku").value;
  const price = document.getElementById("price").value;
  const offer = document.getElementById("offer").value || price;
  const delivery = document.getElementById("delivery").value || "২-৫ দিন";
  const stock = document.getElementById("stock").value;
  const category = document.getElementById("category").value;
  const desc = document.getElementById("description").value;
  const image = document.getElementById("image").value;
  const wp = document.getElementById("whatsapp").value;

  const message = `📦 আমি একটি পণ্য অর্ডার করতে আগ্রহী:\n\n🛍️ *পণ্যের নাম:* _${name}_\n💰 *মূল্য:* _৳${offer}_\n🔢 *প্রোডাক্ট কোড:* _${sku}_\n\n📞 দয়া করে বিস্তারিত জানান।`;

  const html = `
<img src="${image}" alt="${name}" style="max-width:100%;border-radius:10px;margin-bottom:10px;" />
<h2 style="text-align:center;margin:5px 0;">${name}</h2>
<p style="text-align:center;font-size:16px;">৳${price} → <strong style="color:#ff5252;">৳${offer}</strong></p>

<p style="text-align:center;margin:10px 0;">
  <a href="https://wa.me/${wp}?text=${encodeURIComponent(message)}"
     target="_blank"
     style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    📲 অর্ডার করুন WhatsApp এ
  </a>
</p>

<h3>🧵 প্রোডাক্ট বিস্তারিত:</h3>
<ul>
  <li>🔢 কোড: ${sku}</li>
  <li>📦 স্ট্যাটাস: ${stock}</li>
  <li>📁 ক্যাটাগরি: ${category}</li>
  <li>🚚 ডেলিভারি টাইম: ${delivery}</li>
</ul>
<p>${desc}</p>

<p style="display:none;">
  <a href="#">
    {getProduct} $button={Price} $price={৳${offer}} $sale={৳${price}} $icon={cart} $style={1}
  </a>
</p>
`;

  document.getElementById("output").textContent = html;
});

function copyOutput() {
  const content = document.getElementById("output").textContent;
  navigator.clipboard.writeText(content).then(() => {
    alert("✅ কোড কপি হয়েছে!");
  });
}

function downloadOutput() {
  const content = document.getElementById("output").textContent;
  const blob = new Blob([content], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "product-post.html";
  a.click();
}
