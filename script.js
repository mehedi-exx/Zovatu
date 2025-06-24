// Theme toggle system
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.getElementById("themeToggle").textContent =
    document.body.classList.contains("dark") ? "🌙" : "☀️";
});

// Generate HTML post content
document.getElementById("g9Form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("productName").value;
  const code = document.getElementById("productCode").value;
  const price = document.getElementById("price").value;
  const offer = document.getElementById("offerPrice").value;
  const delivery = document.getElementById("deliveryTime").value;
  const stock = document.getElementById("stock").value;
  const category = document.getElementById("category").value;
  const desc = document.getElementById("description").value;
  const img = document.getElementById("imageUrl").value;
  const phone = document.getElementById("adminNumber").value;

  let html = `
<img src="${img}" alt="${name}" style="max-width:100%;border-radius:10px;margin-bottom:10px;">
<h2 style="color:#d32f2f;">${offer ? `৳${offer}` : `৳${price}`}${offer ? ` <small style="text-decoration:line-through;color:#aaa;">৳${price}</small>` : ""}</h2>
<p><a href="https://wa.me/${phone}?text=${encodeURIComponent(`আমি একটি পণ্য অর্ডার করতে চাই:\n\nপণ্যের নাম: ${name}\nপ্রোডাক্ট কোড: ${code}\nমূল্য: ৳${offer || price}\nস্টক: ${stock}\nক্যাটাগরি: ${category}\n\nদয়া করে বিস্তারিত জানান।`)}" target="_blank" style="background:#25D366;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">📲 অর্ডার করুন WhatsApp এ</a></p>
<hr>
<h3>পণ্যের বিবরণ:</h3>
<ul>
  <li>কোড: ${code}</li>
  ${delivery ? `<li>ডেলিভারি টাইম: ${delivery}</li>` : ""}
  <li>স্টক: ${stock}</li>
  <li>ক্যাটাগরি: ${category}</li>
</ul>
${desc ? `<p>${desc}</p>` : ""}

<!-- Hidden Shortcode -->
<p style="display:none;">{getProduct} $button={Price} $price={৳${offer || price}} $sale={৳${price}} $icon={cart} $style={1}</p>
  `;

  document.getElementById("previewBox").textContent = html;
});

// Copy Button
document.getElementById("copyBtn").addEventListener("click", () => {
  const output = document.getElementById("previewBox").textContent;
  navigator.clipboard.writeText(output).then(() => {
    alert("Copied!");
  });
});

// Download Button
document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([document.getElementById("previewBox").textContent], {
    type: "text/html",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "product-post.html";
  a.click();
});
