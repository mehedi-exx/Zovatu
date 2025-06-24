document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light");
    themeToggle.textContent = body.classList.contains("light") ? "☀️" : "🌙";
    localStorage.setItem("theme", body.classList.contains("light") ? "light" : "dark");
  });

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    body.classList.add("light");
    themeToggle.textContent = "☀️";
  }

  const form = document.getElementById("productForm");
  const output = document.getElementById("output");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.name.value;
    const code = form.code.value;
    const price = form.price.value;
    const offer = form.offer.value;
    const delivery = form.delivery.value;
    const stock = form.stock.value;
    const category = form.category.value;
    const desc = form.desc.value;
    const img = form.img.value;
    const admin = form.admin.value;

    const salePart = offer ? `<div style="text-decoration:line-through">৳${price}</div>
    <div style="color:green;font-weight:bold;">৳${offer} Offer Price</div>` :
    `<div style="font-weight:bold;">৳${price}</div>`;

    const deliveryText = delivery ? `<p><strong>Delivery Time:</strong> ${delivery}</p>` : '';
    const descText = desc ? `<p>${desc}</p>` : '';

    const html = `
<img src="${img}" alt="${name}" style="width:100%;max-width:400px;border-radius:10px;margin:auto;display:block;">
${salePart}
<p><strong>Product Code:</strong> ${code}</p>
<p><strong>Status:</strong> ${stock}</p>
<p><strong>Category:</strong> ${category}</p>
${deliveryText}
${descText}
<p style="text-align:center;">
  <a href="https://wa.me/${admin}?text=${encodeURIComponent(`আমি একটি পণ্য অর্ডার করতে চাই:\n\nপণ্যের নাম: ${name}\nপ্রোডাক্ট কোড: ${code}\nমূল্য: ৳${offer || price}\nদয়া করে বিস্তারিত জানান।`)}" target="_blank"
     style="background:#25D366;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">
    অর্ডার করুন WhatsApp এ
  </a>
</p>
<!-- {getProduct} $button={Price} $price={৳${offer || price}} $sale={৳${price}} $icon={cart} $style={1} -->
`;

    output.innerHTML = html;
  });

  document.getElementById("copy").addEventListener("click", () => {
    navigator.clipboard.writeText(output.innerHTML).then(() => {
      alert("Copied to clipboard!");
    });
  });

  document.getElementById("download").addEventListener("click", () => {
    const blob = new Blob([output.innerHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-post.html";
    a.click();
    URL.revokeObjectURL(url);
  });
});
