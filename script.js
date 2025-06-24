// 🌙 Default to dark mode using localStorage
if (!localStorage.getItem("mode")) {
  localStorage.setItem("mode", "dark");
}
document.body.classList.toggle("light-mode", localStorage.getItem("mode") === "light");

// 🌗 Toggle Light/Dark Mode
document.getElementById("modeToggle").addEventListener("click", function () {
  document.body.classList.toggle("light-mode");
  const currentMode = document.body.classList.contains("light-mode") ? "light" : "dark";
  localStorage.setItem("mode", currentMode);
  this.innerText = currentMode === "light" ? "🌙" : "☀️";
});

// 📂 Menu Toggle
document.getElementById("menuBtn").addEventListener("click", function () {
  document.querySelector(".sidebar").classList.toggle("show");
});

// 🧠 Helper to sanitize input
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));
}

// 📦 Generate Product Code
document.getElementById("generateBtn").addEventListener("click", function () {
  const title = escapeHTML(document.getElementById("productName").value.trim());
  const price = escapeHTML(document.getElementById("productPrice").value.trim());
  const offer = escapeHTML(document.getElementById("offerPrice").value.trim());
  const code = escapeHTML(document.getElementById("productCode").value.trim());
  const delivery = escapeHTML(document.getElementById("deliveryTime").value.trim());
  const stock = document.getElementById("stockStatus").value;
  const category = escapeHTML(document.getElementById("productCategory").value.trim());
  const description = escapeHTML(document.getElementById("productDesc").value.trim());
  const imageURL = document.getElementById("productImage").value.trim();

  if (!title || !price || !code || !category) {
    alert("Please fill all required fields (Name, Price, Code, Category).");
    return;
  }

  let html = ``;

  // 🖼️ Image section
  if (imageURL) {
    html += `<img src="${imageURL}" alt="${title}" style="max-width:100%;border-radius:10px;margin-bottom:10px;" />\n`;
  }

  // 🏷️ Title & Price
  html += `<h2 style="text-align:center;margin:5px 0;">${title}</h2>\n`;
  html += `<p style="text-align:center;font-size:16px;">৳${offer || price} → <strong style="color:#ff5252;">৳${price}</strong></p>\n`;

  // 🟢 WhatsApp Button
  const message = encodeURIComponent(
    `📦 আমি একটি পণ্য অর্ডার করতে চাই:\n\n🧾 পণ্যের নাম: *${title}*\n💰 মূল্য: _৳${price}_\n🔖 প্রোডাক্ট কোড: _${code}_\n\n📞 দয়া করে বিস্তারিত জানান।`
  );

  html += `<p style="text-align:center;margin:10px 0;">\n`;
  html += `  <a href="https://wa.me/8801627647776?text=${message}" target="_blank" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">📲 অর্ডার করুন WhatsApp এ</a>\n`;
  html += `</p>\n`;

  // 📃 Product Details
  html += `<h3>🧵 প্রোডাক্ট বিস্তারিত:</h3>\n<ul>\n`;
  html += `  <li>🔢 কোড: ${code}</li>\n`;
  html += `  <li>📦 স্ট্যাটাস: ${stock}</li>\n`;
  html += `  <li>📁 ক্যাটাগরি: ${category}</li>\n`;
  if (delivery) {
    html += `  <li>🚚 ডেলিভারি টাইম: ${delivery}</li>\n`;
  }
  html += `</ul>\n`;

  if (description) {
    html += `<p>${description}</p>\n`;
  }

  // 🔒 Hidden Shortcode (Amazen)
  html += `<p style="display:none;">\n`;
  html += `  <a href="#">\n    {getProduct} $button={Price} $price={৳${price}} ${offer ? `$sale={৳${offer}}` : ''} $icon={cart} $style={1}\n  </a>\n</p>\n`;

  const outputBox = document.getElementById("output");
  outputBox.innerText = html;
  outputBox.classList.add("show");
});

// 📋 Copy to Clipboard
document.getElementById("copyBtn").addEventListener("click", function () {
  const code = document.getElementById("output").innerText;
  if (!code) return alert("Please generate code first!");
  navigator.clipboard.writeText(code).then(() => alert("Copied to clipboard!"));
});

// 💾 Download as .txt
document.getElementById("downloadBtn").addEventListener("click", function () {
  const code = document.getElementById("output").innerText;
  if (!code) return alert("Generate your code first!");
  const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "product-post.html";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 🌄 Live Image Preview
document.getElementById("productImage").addEventListener("input", function () {
  const url = this.value.trim();
  const preview = document.getElementById("imagePreview");
  if (url) {
    preview.src = url;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
});
