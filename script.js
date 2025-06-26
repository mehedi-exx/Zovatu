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
  const name = document.getElementById("name").value;
  const code = document.getElementById("code").value;
  const price = parseFloat(document.getElementById("price").value);
  const offer = parseFloat(document.getElementById("offer").value);
  const delivery = document.getElementById("delivery").value || "N/A";
  const status = document.getElementById("status").value;
  const category = document.getElementById("category").value;
  const desc = document.getElementById("desc").value;
  const wa = document.getElementById("wa").value;
  const images = Array.from(document.querySelectorAll(".img-url")).map(
    (i) => i.value
  ).filter(Boolean);

  if (!name || !code || !price || !status || !category || !images.length || !wa) {
    alert("⚠️ সব প্রয়োজনীয় ইনপুট পূরণ করুন");
    return;
  }

  let finalPrice = `৳${price}`;
  if (!isNaN(offer) && offer < price) {
    const discount = Math.round(((price - offer) / price) * 100);
    finalPrice = `<del style="text-decoration: line-through;">৳${price}</del> <span style="color:red;font-weight:bold;">৳${offer}</span> <small style="color:#0f0">(${discount}% ছাড়)</small>`;
  }

  const waText = encodeURIComponent(`📦 আমি একটি পণ্য অর্ডার করতে চাই:
🔖 প্রোডাক্ট: ${name}
💰 মূল্য: ৳${offer || price}
🧾 কোড: ${code}
📁 ক্যাটাগরি: ${category}
🚚 ডেলিভারি টাইম: ${delivery}`);
  const waLink = `https://wa.me/${wa}?text=${waText}`;

  // স্লাইডার HTML তৈরি
  let sliderHTML = `<div class="g9-slider-wrapper">`;
  images.forEach((_, i) => {
    sliderHTML += `<input type="radio" name="slider" id="img${i + 1}" ${
      i === 0 ? "checked" : ""
    }>`;
  });

  sliderHTML += `<div class="g9-main">`;
  images.forEach((src, i) => {
    sliderHTML += `<img src="${src}" class="g9-main-image img${i + 1}">`;
  });
  sliderHTML += `</div><div class="g9-thumbnails">`;
  images.forEach((src, i) => {
    sliderHTML += `<label for="img${i + 1}"><img src="${src}"></label>`;
  });
  sliderHTML += `</div></div>`;

  const html = `
<div style="text-align:center;">
  ${sliderHTML}
  <h2 style="margin:5px 0;">${name}</h2>
  <p>${finalPrice}</p>
</div>
<p style="text-align:center;margin:10px 0;">
  <a href="${waLink}" target="_blank" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    📲 অর্ডার করুন WhatsApp এ
  </a>
</p>
<ul>
  <li>🔢 কোড: ${code}</li>
  <li>📦 স্ট্যাটাস: ${status}</li>
  <li>📁 ক্যাটাগরি: ${category}</li>
  <li>🚚 ডেলিভারি টাইম: ${delivery}</li>
</ul>
<p>${desc}</p>
<p style="display:none;">
  <a href="#">
    {getProduct} $button={Price} $price={৳${offer || price}} $sale={৳${price}} $icon={cart} $style={1}
  </a>
</p>`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
});

document.getElementById("copyBtn").addEventListener("click", function () {
  const code = document.getElementById("output").textContent;
  navigator.clipboard.writeText(code).then(() => {
    alert("✅ কোড কপি হয়েছে!");
  });
});
