function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
}

// ✅ ছবি ইনপুট
function addImageInput() {
  const container = document.getElementById("imageInputs");
  const input = document.createElement("input");
  input.type = "url";
  input.className = "img-url";
  input.placeholder = "ছবির লিংক (Image URL)";
  container.appendChild(input);
}

// ✅ কাস্টম তথ্য ইনপুট
function addCustomField() {
  const container = document.getElementById("customFields");
  const group = document.createElement("div");
  group.className = "custom-field-group";
  group.innerHTML = `
    <input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি">
    <input type="text" class="custom-value" placeholder="মান যেমন: ৩ মাস">
  `;
  container.appendChild(group);
}

// ✅ রিসেট
function formReset() {
  if (!confirm("আপনি কি ফর্ম রিসেট করতে চান?")) return;

  document.querySelectorAll("input, textarea").forEach(el => el.value = "");
  document.getElementById("imageInputs").innerHTML = `
    <div class="image-group">
      <input type="url" class="img-url" placeholder="ছবির লিংক (Image URL)">
    </div>
  `;
  document.getElementById("customFields").innerHTML = `
    <div class="custom-field-group">
      <input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি">
      <input type="text" class="custom-value" placeholder="মান যেমন: ৩ মাস">
    </div>
  `;
  localStorage.removeItem("formDraft");
  document.getElementById("output").textContent = "";
  document.getElementById("preview").innerHTML = "";
}

// ✅ কোড জেনারেট
document.getElementById("generateBtn").addEventListener("click", () => {
  const get = id => document.getElementById(id)?.value.trim();
  const name = get("name");
  const code = get("code");
  const price = parseFloat(get("price"));
  const offer = parseFloat(get("offer")) || null;
  const unit = get("unit");
  const qty = get("qty");
  const brand = get("brand");
  const size = get("size");
  const color = get("color");
  const delivery = get("delivery");
  const status = get("status");
  const category = get("category");
  const desc = get("desc");
  const video = get("video");
  const wa = get("wa");
  const imgs = [...document.querySelectorAll(".img-url")].map(input => input.value.trim()).filter(Boolean);

  if (!name || !code || !price || !wa || !imgs[0]) {
    alert("❌ প্রোডাক্ট নাম, কোড, প্রাইস, প্রথম ছবি ও WhatsApp নম্বর দিতে হবে!");
    return;
  }

  // ✅ কোড ডুপ্লিকেট চেক
  const user = localStorage.getItem("loggedInUser") || "guest";
  const key = `g9_products_${user}`;
  const products = JSON.parse(localStorage.getItem(key) || "[]");
  const editIndex = localStorage.getItem("edit_product_index");

  const duplicate = products.some((p, i) => i != editIndex && p.code === code);
  if (duplicate) {
    alert("⚠️ এই কোড দিয়ে ইতিমধ্যে একটি প্রোডাক্ট তৈরি হয়েছে!");
    return;
  }

  const discount = offer ? Math.round(((price - offer) / price) * 100) : 0;
  const mainImg = imgs[0];
  let thumbHTML = "";

  imgs.forEach((url, i) => {
    const border = i === 0 ? "green" : "transparent";
    thumbHTML += `<img src="${url}" style="width:60px;height:60px;border-radius:6px;cursor:pointer;border:2px solid ${border};" onclick="document.getElementById('mainImg').src=this.src;document.querySelectorAll('#thumbs img').forEach(img=>img.style.border='2px solid transparent');this.style.border='2px solid green';">`;
  });

  const customFields = [...document.querySelectorAll(".custom-field-group")].map(group => {
    const key = group.querySelector(".custom-key")?.value.trim();
    const val = group.querySelector(".custom-value")?.value.trim();
    return key && val ? `<li>🔧 ${key}: ${val}</li>` : "";
  }).join("");

  let videoEmbed = "";
  if (video.includes("youtube.com") || video.includes("youtu.be")) {
    let id = "";
    if (video.includes("v=")) id = video.split("v=")[1].split("&")[0];
    if (video.includes("youtu.be/")) id = video.split("youtu.be/")[1];
    if (id) videoEmbed = `<div style="margin-top:10px;"><iframe width="100%" height="200" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe></div>`;
  }

  const html = `
<div style="text-align:center;">
  <img id="mainImg" src="${mainImg}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">
  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">${thumbHTML}</div>
  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:18px;">
    ${offer ? `<span style="text-decoration:line-through;color:#aaa;margin-right:6px;">৳${price}</span>
               <span style="color:red;font-weight:bold;">৳${offer}</span>
               <small style="color:limegreen;">(-${discount}%)</small>`
             : `<span style="color:red;font-weight:bold;">৳${price}</span>`}
  </p>
  <p style="text-align:center;margin:10px 0;">
    <a href="https://wa.me/${wa}?text=📦 আমি একটি পণ্য অর্ডার করতে চাই%0A🔖 প্রোডাক্ট: ${name}%0A💰 মূল্য: ${offer || price}৳%0A🧾 কোড: ${code}%0A📁 ক্যাটাগরি: ${category}%0A🚚 ডেলিভারি: ${delivery}" 
       target="_blank"
       style="display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:16px;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="height:20px;width:20px;">
      অর্ডার করুন WhatsApp এ
    </a>
  </p>
  <ul style="list-style:none;padding:0;margin:15px auto;text-align:left;max-width:500px;">
    <li>🔢 কোড: ${code}</li>
    <li>📦 স্ট্যাটাস: ${status || "IN STOCK"}</li>
    <li>📁 ক্যাটাগরি: ${category || "N/A"}</li>
    <li>🚚 ডেলিভারি টাইম: ${delivery || "N/A"}</li>
    <li>🏷️ ব্র্যান্ড: ${brand || "N/A"}</li>
    <li>📐 সাইজ: ${size || "N/A"} | 🎨 রঙ: ${color || "N/A"}</li>
    ${customFields}
  </ul>
  <div style="border:1px solid #eee;padding:15px;border-radius:10px;max-width:500px;margin:auto;margin-bottom:20px;">
    <p style="margin:0;"><strong>Description:</strong><br>${desc || ""}</p>
  </div>
  ${videoEmbed}
  <p style="display:none;"><a href="#">{getProduct} $price={৳${offer || price}} $sale={৳${price}} $style={1}</a></p>
</div>
`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;

  const product = {
    name, code, price, offer, unit, qty, brand, size, color,
    delivery, status, category, desc, video, wa, imgs,
    custom: [...document.querySelectorAll(".custom-field-group")].map(g => {
      const k = g.querySelector(".custom-key")?.value.trim();
      const v = g.querySelector(".custom-value")?.value.trim();
      return k && v ? { key: k, value: v } : null;
    }).filter(Boolean)
  };

  if (editIndex !== null) {
    products[parseInt(editIndex)] = product;
    localStorage.removeItem("edit_product_index");
  } else {
    products.push(product);
  }

  localStorage.setItem(key, JSON.stringify(products));
  alert("✅ প্রোডাক্ট সেভ হয়েছে!");
});

// ✅ কপি বাটন
document.getElementById("copyBtn").addEventListener("click", () => {
  const html = document.getElementById("output").textContent;
  navigator.clipboard.writeText(html)
    .then(() => alert("✅ কোড কপি হয়েছে!"))
    .catch(() => alert("❌ কপি করা যায়নি"));
});
