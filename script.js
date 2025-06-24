function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById('themeToggle');
  if (body.classList.contains('dark')) {
    body.classList.replace('dark', 'light');
    icon.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.replace('light', 'dark');
    icon.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  }
}

function toggleMenu() {
  document.getElementById('menu').classList.toggle('hidden');
}

function copyCode() {
  const output = document.getElementById('output');
  navigator.clipboard.writeText(output.textContent);
  alert('Copied to clipboard!');
}

function downloadCode() {
  const code = document.getElementById('output').textContent;
  const blob = new Blob([code], { type: 'text/html' });
  const link = document.createElement('a');
  link.download = "product-post.html";
  link.href = URL.createObjectURL(blob);
  link.click();
}

function generateCode(data) {
  const priceLine = data.offerPrice
    ? `${data.offerPrice}৳ <s>${data.mainPrice}৳</s>`
    : `${data.mainPrice}৳`;

  const delivery = data.delivery ? `<li>🚚 ডেলিভারি: ${data.delivery}</li>` : "";
  const description = data.description ? `<p>${data.description}</p>` : "";

  return `
<!-- ✅ Product Image -->
<img src="${data.image}" alt="${data.name}" style="display:block;margin:auto;border-radius:10px;max-width:100%;" />

<!-- ✅ Price -->
<div style="text-align:center; margin:10px 0;">
  <strong style="font-size:22px;">${priceLine}</strong>
</div>

<!-- ✅ WhatsApp Button -->
<p style="text-align:center;">
  <a href="https://wa.me/${data.phone}?text=${encodeURIComponent(`আমি একটি পণ্য অর্ডার করতে চাই:\n\nপণ্যের নাম: ${data.name}\nমূল্য: ${data.offerPrice || data.mainPrice}৳\nপ্রোডাক্ট কোড: ${data.code}\nক্যাটাগরি: ${data.category}\n\nদয়া করে বিস্তারিত জানান।`)}"
    style="background:#25D366;padding:12px 25px;border-radius:6px;color:white;text-decoration:none;font-weight:bold;">
    📩 অর্ডার করুন
  </a>
</p>

<h2>${data.name}</h2>
${description}
<ul>
  <li>📦 স্ট্যাটাস: ${data.stock}</li>
  ${delivery}
</ul>

<!-- Hidden Shortcode for Amazen Theme -->
<p style="display:none;">
  {getProduct} $button={Price} $price={${data.offerPrice || data.mainPrice}} $sale={${data.mainPrice}} $icon={cart} $style={1}
</p>
`;
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("g9Form");
  const output = document.getElementById("output");
  const theme = localStorage.getItem('theme') || 'dark';
  document.body.className = theme;
  document.getElementById("themeToggle").textContent = theme === "dark" ? "🌙" : "☀️";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = {
      name: form.productName.value,
      code: form.productCode.value,
      mainPrice: form.mainPrice.value,
      offerPrice: form.offerPrice.value,
      delivery: form.delivery.value,
      image: form.imageLink.value,
      phone: form.whatsappNumber.value,
      stock: form.stock.value,
      category: form.category.value,
      description: form.description.value
    };

    output.textContent = generateCode(data);
  });
});
