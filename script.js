// Theme toggle and persistence
function toggleMode() {
  const body = document.body;
  body.classList.toggle("light");
  localStorage.setItem("theme", body.classList.contains("light") ? "light" : "dark");
}

// Menu toggle
function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("show");
}

// On load: apply saved theme
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");
});

// Generate HTML
function generateCode() {
  const title = document.getElementById("title").value.trim();
  const price = document.getElementById("price").value.trim();
  const offer = document.getElementById("offer").value.trim();
  const code = document.getElementById("code").value.trim();
  const category = document.getElementById("category").value.trim();
  const stock = document.getElementById("stock").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const desc = document.getElementById("desc").value.trim();

  if (!title || !price || !code || !category || !stock || !desc) {
    alert("Please fill in all required fields.");
    return;
  }

  const hiddenShortcode = `{getProduct} $button={Price} $price={৳${offer || price}} $sale={৳${price}} $icon={cart} $style={1}`;
  const output = `
<h2 style="text-align:center;margin:5px 0;">${title}</h2>
<p style="text-align:center;font-size:16px;">৳${price} → <strong style="color:#ff5252;">৳${offer || price}</strong></p>
<p style="text-align:center;margin:10px 0;">
  <a href="https://wa.me/8801627647776?text=📦 I want to order:%0A%0A📌 Name: *${title}*%0A💰 Price: ৳${offer || price}%0A🔖 Code: ${code}%0A🗂️ Category: ${category}%0A📦 Stock: ${stock}${delivery ? `%0A🚚 Delivery: ${delivery}` : ''}%0A%0APlease confirm the details."
     target="_blank"
     style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    📲 Order via WhatsApp
  </a>
</p>

<h3>🧵 Product Details:</h3>
<ul>
  <li>🔢 Code: ${code}</li>
  <li>📦 Status: ${stock}</li>
  <li>📁 Category: ${category}</li>
  ${delivery ? `<li>🚚 Delivery: ${delivery}</li>` : ""}
</ul>
<p>${desc}</p>

<!-- ✅ Hidden Shortcode -->
<p style="display:none;">
  <a href="#">${hiddenShortcode}</a>
</p>`;

  const box = document.getElementById("outputBox");
  box.innerText = output;
  box.classList.add("show");
}

// Copy Code
function copyCode() {
  const text = document.getElementById("outputBox").innerText;
  if (!text.trim()) return alert("Nothing to copy!");
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  });
}

// Download Code
function downloadCode() {
  const text = document.getElementById("outputBox").innerText;
  if (!text.trim()) return alert("Nothing to download!");
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "product-post.html";
  link.click();
}
