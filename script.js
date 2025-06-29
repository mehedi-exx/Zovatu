document.getElementById("generateBtn").addEventListener("click", generateCode);
document.getElementById("copyBtn").addEventListener("click", copyCode);

function addImageInput() {
  const container = document.getElementById("imageInputs");
  const input = document.createElement("input");
  input.type = "url";
  input.placeholder = "ছবির লিংক (Image URL)";
  input.classList.add("img-url");
  container.appendChild(input);
}

function generateCode() {
  const name = document.getElementById("name").value.trim();
  const code = document.getElementById("code").value.trim();
  const price = parseFloat(document.getElementById("price").value.trim());
  const offer = parseFloat(document.getElementById("offer").value.trim()) || null;
  const unit = document.getElementById("unit").value.trim();
  const qty = parseInt(document.getElementById("qty").value.trim()) || 1;
  const brand = document.getElementById("brand").value.trim();
  const size = document.getElementById("size").value.trim();
  const color = document.getElementById("color").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const status = document.getElementById("status").value.trim();
  const category = document.getElementById("category").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const video = document.getElementById("video").value.trim();
  const images = Array.from(document.getElementsByClassName("img-url"))
                      .map(input => input.value.trim()).filter(url => url);

  if (!name || !code || !price || !images.length || !wa) {
    alert("⚠️ প্রোডাক্ট নাম, কোড, প্রাইস, ছবি ও WhatsApp নম্বর দিন!");
    return;
  }

  const total = price * qty;
  const offerText = offer
    ? `<span style="text-decoration:line-through;color:#999;">৳${price}</span> <b style="color:#0f0;">৳${offer}</b>`
    : `৳${price}`;
  const discount = offer
    ? ` <small style="color:#0f0;">(${Math.round((1 - offer / price) * 100)}% ছাড়)</small>`
    : '';

  let html = `<div class="product-box" style="text-align:center;background:#222;padding:15px;border-radius:10px;">`;

  // Main Image + Thumbs
  html += `<div class="image-slider">`;
  html += `<img src="${images[0]}" alt="${name}" style="max-width:100%;border-radius:10px;margin-bottom:10px;">`;
  if (images.length > 1) {
    html += `<div id="thumbs" style="margin-top:10px;">`;
    images.forEach(img => {
      html += `<img src="${img}" onclick="this.closest('.product-box').querySelector('img').src='${img}'" style="width:60px;height:60px;border-radius:6px;margin:4px;cursor:pointer;">`;
    });
    html += `</div>`;
  }
  html += `</div>`;

  // Title + Price
  html += `<h3 style="margin:10px 0;">${name}</h3>`;
  html += `<p style="font-size:18px;">${offerText}${discount}</p>`;

  // WhatsApp Button
  const message = `আমি ${name} (${code}) কিনতে চাই।`;
  html += `<a href="https://wa.me/${wa}?text=${encodeURIComponent(message)}" target="_blank" style="display:inline-block;margin:10px 0;padding:10px 20px;background:#25d366;color:#fff;border-radius:6px;text-decoration:none;">WhatsApp অর্ডার</a>`;

  // Details List
  html += `<ul style="text-align:left;list-style:none;padding:0;margin:10px auto;max-width:300px;">`;
  if (code) html += `<li><b>কোড:</b> ${code}</li>`;
  if (status) html += `<li><b>স্ট্যাটাস:</b> ${status}</li>`;
  if (category) html += `<li><b>ক্যাটাগরি:</b> ${category}</li>`;
  if (delivery) html += `<li><b>ডেলিভারি:</b> ${delivery}</li>`;
  if (brand) html += `<li><b>ব্র্যান্ড:</b> ${brand}</li>`;
  if (size) html += `<li><b>সাইজ:</b> ${size}</li>`;
  if (color) html += `<li><b>রঙ:</b> ${color}</li>`;
  if (unit && qty) html += `<li><b>পরিমাণ:</b> ${qty} ${unit}</li>`;
  html += `</ul>`;

  // Description + Video
  if (desc) html += `<p style="margin-top:10px;text-align:left;">${desc}</p>`;
  if (video) html += `<div style="margin-top:15px;"><iframe width="100%" height="200" src="${video}" frameborder="0" allowfullscreen></iframe></div>`;

  // Hidden shortcode
  html += `<div style="display:none;">{getProduct}</div>`;
  html += `</div>`;

  // Show output
  document.getElementById("output").innerText = html;
  document.getElementById("preview").innerHTML = html;
}

function copyCode() {
  const code = document.getElementById("output").innerText;
  navigator.clipboard.writeText(code).then(() => {
    alert("✅ কোড কপি হয়েছে!");
  });
}
