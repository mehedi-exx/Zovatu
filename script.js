document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.body.classList.contains("light")
    ? (themeToggle.textContent = "☀️")
    : (themeToggle.textContent = "🌙");
});

document.getElementById("g9Form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = g9Form.name.value.trim();
  const code = g9Form.code.value.trim();
  const price = g9Form.price.value.trim();
  const offer = g9Form.offer.value.trim();
  const delivery = g9Form.delivery.value.trim();
  const stock = g9Form.stock.value;
  const category = g9Form.category.value.trim();
  const desc = g9Form.description.value.trim();
  const img = g9Form.image.value.trim();
  const admin = g9Form.admin.value.trim();

  if (!name || !code || !price || !img || !admin) {
    alert("অনুগ্রহ করে প্রয়োজনীয় ফিল্ড পূরণ করুন।");
    return;
  }

  const finalPrice = offer ? `৳${offer} → <strong style="color:#ff5252;">৳${price}</strong>` : `৳${price}`;
  const details = `
<img src="${img}" alt="${name}" style="max-width:100%;border-radius:10px;margin-bottom:10px;" />
<h2 style="text-align:center;margin:5px 0;">${name}</h2>
<p style="text-align:center;font-size:16px;">${finalPrice}</p>

<p style="text-align:center;margin:10px 0;">
  <a href="https://wa.me/${admin}?text=${encodeURIComponent(`📦 আমি একটি পণ্য অর্ডার করতে চাই:

🛍️ পণ্যের নাম: _${name}_
💰 মূল্য: _৳${price}_
🆔 প্রোডাক্ট কোড: _${code}_

📝 দয়া করে বিস্তারিত জানান।`)}" target="_blank" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    📲 অর্ডার করুন WhatsApp এ
  </a>
</p>

<h3>🧵 প্রোডাক্ট বিস্তারিত:</h3>
<ul>
  <li>🔢 কোড: ${code}</li>
  <li>📦 স্ট্যাটাস: ${stock}</li>
  <li>📁 ক্যাটাগরি: ${category}</li>
  ${delivery ? `<li>🚚 ডেলিভারি টাইম: ${delivery}</li>` : ""}
</ul>
${desc ? `<p>${desc}</p>` : ""}

<!-- ✅ Hidden Shortcode -->
<p style="display:none;">
  <a href="#">
    {getProduct} $button={Price} $price={৳${price}} ${offer ? `$sale={৳${offer}}` : ""} $icon={cart} $style={1}
  </a>
</p>
`;

  document.getElementById("output").innerText = finalPrice;
  document.getElementById("output").innerHTML = details;
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const code = document.getElementById("output").innerHTML;
  navigator.clipboard.writeText(code).then(() => alert("✅ কোড কপি হয়েছে"));
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const code = document.getElementById("output").innerHTML;
  const blob = new Blob([code], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "product.html";
  link.click();
});
