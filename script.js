document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "light") {
    document.body.classList.add("light");
  }

  const form = document.getElementById("productForm");
  const preview = document.getElementById("previewBox");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      name: form.productName.value,
      code: form.productCode.value,
      price: form.price.value,
      offer: form.offerPrice.value,
      delivery: form.delivery.value,
      stock: form.stock.value,
      category: form.category.value,
      desc: form.description.value,
      img: form.imageUrl.value,
      whatsapp: form.whatsapp.value
    };

    const html = `
<img src="${data.img}" alt="${data.name}" style="max-width:100%;border-radius:10px;" />
<h2 style="text-align:center;margin:5px 0;">${data.name}</h2>
<p style="text-align:center;font-size:16px;">৳${data.price} ${data.offer ? `→ <strong style="color:#ff5252;">৳${data.offer}</strong>` : ''}</p>
<p style="text-align:center;">
  <a href="https://wa.me/${data.whatsapp}?text=📦 অর্ডার করতে চাই:\n\n🔖 নাম: ${data.name}\n💰 মূল্য: ৳${data.offer || data.price}\n🆔 কোড: ${data.code}" 
     target="_blank" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    📲 WhatsApp এ অর্ডার করুন
  </a>
</p>
<h3>🧵 বিস্তারিত:</h3>
<ul>
  <li>🆔 কোড: ${data.code}</li>
  <li>📦 স্ট্যাটাস: ${data.stock}</li>
  <li>📁 ক্যাটাগরি: ${data.category}</li>
  <li>🚚 ডেলিভারি: ${data.delivery || "N/A"}</li>
</ul>
<p>${data.desc}</p>
<p style="display:none;">
  <a href="#">{getProduct} $button={Price} $price={৳${data.offer || data.price}} $sale={৳${data.price}} $icon={cart} $style={1}</a>
</p>`;

    preview.innerText = html;
    preview.style.display = "block";
  });

  document.getElementById("copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(preview.innerText);
    alert("Copied to clipboard!");
  });

  document.getElementById("downloadBtn").addEventListener("click", () => {
    const blob = new Blob([preview.innerText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "product.html";
    link.click();
  });
});
