let imgCount = 1;

function addImageInput() {
  if (imgCount < 5) {
    const newInput = document.createElement("input");
    newInput.type = "url";
    newInput.className = "img-url";
    newInput.placeholder = `ছবির লিংক (Image URL) ${imgCount + 1}`;
    document.getElementById("imageInputs").appendChild(newInput);
    imgCount++;
  }
}

document.getElementById("generateBtn").addEventListener("click", function () {
  const name = document.getElementById("name").value.trim();
  const code = document.getElementById("code").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const offer = parseFloat(document.getElementById("offer").value);
  const unit = document.getElementById("unit").value.trim();
  const qty = document.getElementById("qty").value.trim();
  const brand = document.getElementById("brand").value.trim();
  const size = document.getElementById("size").value.trim();
  const color = document.getElementById("color").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const status = document.getElementById("status").value.trim();
  const category = document.getElementById("category").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const video = document.getElementById("video").value.trim();
  const images = Array.from(document.querySelectorAll(".img-url"))
    .map(i => i.value.trim())
    .filter(Boolean);

  // Required check
  if (!name || !code || !price || !status || !category || !images.length || !wa) {
    alert("⚠️ সব প্রয়োজনীয় ইনপুট পূরণ করুন");
    return;
  }

  const total = unit && qty ? ` (${unit} × ${qty})` : "";
  const firstImg = images[0];

  let thumbs = images.map((src, i) => {
    return `<img src="${src}" onclick="changeImage(this)" style="width:60px;height:60px;border-radius:6px;cursor:pointer;border:2px solid ${i === 0 ? 'green' : 'transparent'};">`;
  }).join("");

  let finalPrice = `৳${price}${total}`;
  if (!isNaN(offer) && offer < price) {
    const discount = Math.round(((price - offer) / price) * 100);
    finalPrice = `
<del style="color:#aaa; margin-right:6px;">৳${price}${total}</del>
<span style="color:red;font-weight:bold;">৳${offer}</span>
<small style="color:limegreen;">(${discount}% ছাড়)</small>
    `;
  }

  const waText = encodeURIComponent(`📦 আমি একটি পণ্য অর্ডার করতে চাই
🔖 প্রোডাক্ট: ${name}
💰 মূল্য: ৳${offer || price}
🧾 কোড: ${code}
📁 ক্যাটাগরি: ${category}
🏷️ ব্র্যান্ড: ${brand}
📏 সাইজ: ${size}
🎨 রঙ: ${color}
📦 পরিমাণ: ${qty} ${unit}
💳 পেমেন্ট: ক্যাশ অন ডেলিভারি
🚚 ডেলিভারি টাইম: ${delivery}`);

  const waLink = `https://wa.me/${wa}?text=${waText}`;

  const videoEmbed = video
    ? `<div style="margin-top:15px;text-align:center;"><iframe width="100%" height="250" src="${video.replace("watch?v=", "embed/")}" frameborder="0" allowfullscreen></iframe></div>`
    : "";

  const html = `
<div style="text-align:center;">
  <img id="mainImg" src="${firstImg}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">
  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
    ${thumbs}
  </div>

  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:18px;">${finalPrice}</p>
</div>

<p style="text-align:center;margin:10px 0;">
  <a href="${waLink}" target="_blank" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    📲 অর্ডার করুন WhatsApp এ
  </a>
</p>

<ul style="list-style:none;padding:0;margin:15px 0;text-align:left;max-width:500px;margin:auto;">
  <li>🔢 কোড: ${code}</li>
  <li>📦 স্ট্যাটাস: ${status}</li>
  <li>📁 ক্যাটাগরি: ${category}</li>
  ${brand ? `<li>🏷️ ব্র্যান্ড: ${brand}</li>` : ""}
  ${size ? `<li>📏 সাইজ: ${size}</li>` : ""}
  ${color ? `<li>🎨 রঙ: ${color}</li>` : ""}
  ${unit && qty ? `<li>📦 পরিমাণ: ${qty} ${unit}</li>` : ""}
  <li>🚚 ডেলিভারি টাইম: ${delivery}</li>
</ul>

<p>${desc}</p>
${videoEmbed}

<p style="display:none;">
  <a href="#">
    {getProduct} $price={৳${offer || price}}${!isNaN(offer) && offer < price ? ` $sale={৳${price}}` : ""}
  </a>
</p>

<script>
function changeImage(el) {
  document.getElementById('mainImg').src = el.src;
  let all = document.querySelectorAll('#thumbs img');
  all.forEach(img => img.style.border = '2px solid transparent');
  el.style.border = '2px solid green';
}
<\/script>
`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
});

document.getElementById("copyBtn").addEventListener("click", function () {
  const code = document.getElementById("output").textContent;
  navigator.clipboard.writeText(code).then(() => {
    alert("✅ কোড কপি হয়েছে!");
  });
});
