document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  const output = document.getElementById("output");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const sideNav = document.getElementById("sideNav");

  // Load theme from localStorage
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  menuToggle.addEventListener("click", () => {
    sideNav.classList.toggle("show");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.name.value;
    const code = form.code.value;
    const price = form.price.value;
    const sale = form.sale.value;
    const delivery = form.delivery.value;
    const stock = form.stock.value;
    const cat = form.category.value;
    const desc = form.desc.value;
    const image = form.image.value;
    const phone = form.whatsapp.value;

    const productHTML = `
<!-- ✅ Product Image -->
<img src="${image}" alt="${name}" style="max-width:100%;border-radius:10px;margin-bottom:10px;" />
<h2 style="text-align:center;margin:5px 0;">${name}</h2>
<p style="text-align:center;font-size:16px;">৳${price}${sale ? ` → <strong style="color:#ff5252;">৳${sale}</strong>` : ""}</p>
<p style="text-align:center;margin:10px 0;">
  <a href="https://wa.me/${phone}?text=${encodeURIComponent(`📦 আমি একটি পণ্য অর্ডার করতে চাই:\n\n🛍️ পণ্যের নাম: ${name}\n💰 মূল্য: ৳${sale || price}\n🔖 কোড: ${code}\n\n📞 বিস্তারিত জানান`) }"
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
  ${delivery ? `<li>🚚 ডেলিভারি টাইম: ${delivery}</li>` : ""}
</ul>
${desc ? `<p>${desc}</p>` : ""}

<!-- ✅ Hidden Shortcode -->
<p style="display:none;">
  <a href="#">
    {getProduct} $button={Price} $price={৳${sale || price}} $sale={৳${price}} $icon={cart} $style={1}
  </a>
</p>`;

    output.textContent = productHTML;
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(output.textContent).then(() => alert("Copied!"));
  });

  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([output.textContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "product.html";
    link.click();
  });
});
