// Load saved theme
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.remove('dark');
  document.body.classList.add('light');
  document.getElementById('themeToggle').textContent = '☀️';
}

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
});

document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('menu').classList.toggle('hidden');
});

document.getElementById('productForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const productName = document.getElementById('productName').value;
  const productCode = document.getElementById('productCode').value;
  const price = document.getElementById('price').value;
  const offerPrice = document.getElementById('offerPrice').value;
  const delivery = document.getElementById('deliveryTime').value;
  const stock = document.getElementById('stock').value;
  const category = document.getElementById('category').value;
  const desc = document.getElementById('description').value;
  const image = document.getElementById('imageUrl').value;
  const admin = document.getElementById('adminPhone').value;

  const waMessage = `📦 আমি একটি পণ্য অর্ডার করতে চাই:\n\n📌 পণ্যের নাম: ${productName}\n💰 মূল্য: ৳${price}${offerPrice ? ` (অফার: ৳${offerPrice})` : ""}\n🧾 কোড: ${productCode}\n\n📞 বিস্তারিত জানান।`;

  const output = `
<img src="${image}" style="max-width:100%;border-radius:10px;" />
<h2 style="text-align:center;">${productName}</h2>
<p style="text-align:center;">৳${offerPrice || price} ${offerPrice ? `→ <del>৳${price}</del>` : ""}</p>

<p style="text-align:center;">
  <a href="https://wa.me/${admin}?text=${encodeURIComponent(waMessage)}"
     style="background:#25D366;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">
    📲 অর্ডার করুন WhatsApp এ
  </a>
</p>

<ul>
  <li>🔢 কোড: ${productCode}</li>
  <li>📦 স্ট্যাটাস: ${stock}</li>
  <li>📁 ক্যাটাগরি: ${category}</li>
  ${delivery ? `<li>🚚 ডেলিভারি: ${delivery}</li>` : ""}
</ul>

${desc ? `<p>${desc}</p>` : ""}
<p style="display:none;"><a href="#"> {getProduct} $button={Price} $price={৳${offerPrice || price}} $sale={৳${price}} $icon={cart} $style={1} </a></p>
`;

  document.getElementById('output').textContent = output;
});

document.getElementById('copyBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('output').textContent);
  alert("✅ কপি হয়ে গেছে!");
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const blob = new Blob([document.getElementById('output').textContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "product-code.html";
  link.click();
});
