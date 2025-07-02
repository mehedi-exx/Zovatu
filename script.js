// ✅ প্রোডাক্ট HTML তৈরি ও সেভ
document.getElementById("generateBtn").addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const code = document.getElementById("code").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const offer = parseFloat(document.getElementById("offer").value);
  const unit = document.getElementById("unit").value.trim();
  const qty = parseFloat(document.getElementById("qty").value);
  const brand = document.getElementById("brand").value.trim();
  const size = document.getElementById("size").value.trim();
  const color = document.getElementById("color").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const status = document.getElementById("status").value.trim();
  const category = document.getElementById("category").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const video = document.getElementById("video").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const imgs = document.querySelectorAll(".img-url");

  if (!name || !code || isNaN(price) || !imgs[0].value || !wa) {
    alert("⚠️ প্রোডাক্ট নাম, কোড, প্রাইস, প্রথম ছবি ও WhatsApp নম্বর বাধ্যতামূলক।");
    return;
  }

  const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;

  // ✅ থাম্বনেইল ইমেজ
  let thumbHTML = "";
  const mainImg = imgs[0].value.trim();
  imgs.forEach((input, i) => {
    const url = input.value.trim();
    if (url) {
      thumbHTML += `<img src="${url}" style="width:60px;height:60px;border-radius:6px;cursor:pointer;border:2px solid ${i === 0 ? 'green' : 'transparent'};" onclick="document.getElementById('mainImg').src=this.src;document.querySelectorAll('#thumbs img').forEach(img=>img.style.border='2px solid transparent');this.style.border='2px solid green';">`;
    }
  });

  // ✅ কাস্টম তথ্য
  const customFields = document.querySelectorAll(".custom-field-group");
  let customHTML = "";
  customFields.forEach(group => {
    const key = group.querySelector(".custom-key").value.trim();
    const value = group.querySelector(".custom-value").value.trim();
    if (key && value) {
      customHTML += `<li>🔧 ${key}: ${value}</li>`;
    }
  });

  // ✅ ইউটিউব ভিডিও
  let videoEmbed = "";
  if (video.includes("youtube.com") || video.includes("youtu.be")) {
    let videoId = "";
    if (video.includes("youtube.com/watch?v=")) {
      videoId = video.split("v=")[1].split("&")[0];
    } else if (video.includes("youtu.be/")) {
      videoId = video.split("youtu.be/")[1];
    }
    if (videoId) {
      videoEmbed = `<div style="margin-top:10px;"><iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    }
  }

  // ✅ HTML তৈরির অংশ
  const html = `
<div style="text-align:center;">
  <img id="mainImg" src="${mainImg}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">
  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">${thumbHTML}</div>
  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:18px;">
    ${offer ? `
      <span style="text-decoration:line-through;color:#aaa;margin-right:6px;">৳${price}</span>
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
    ${customHTML}
  </ul>
  <div style="border:1px solid #eee;padding:15px;border-radius:10px;max-width:500px;margin:auto;margin-bottom:20px;">
    <p style="margin:0;"><strong>Description:</strong><br>${desc || ""}</p>
  </div>
  ${videoEmbed}
</div>
`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;

  // ✅ লোকালস্টোরেজে প্রোডাক্ট সংরক্ষণ
  const uname = localStorage.getItem("loggedInUser") || "guest";
  const saved = JSON.parse(localStorage.getItem("g9tool_data")) || [];
  saved.push({ name, code, price, offer, desc });
  localStorage.setItem("g9tool_data", JSON.stringify(saved));

  alert("✅ প্রোডাক্ট কোড তৈরি এবং সংরক্ষিত হয়েছে!");
});

// ✅ আরও ছবি ইনপুট
function addImageInput() {
  const container = document.getElementById("imageInputs");
  const inputs = container.querySelectorAll(".img-url");
  if (inputs.length >= 5) return;
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

// ✅ কপি
document.getElementById("copyBtn").addEventListener("click", () => {
  const output = document.getElementById("output").textContent;
  navigator.clipboard.writeText(output)
    .then(() => alert("✅ কোড কপি হয়েছে!"))
    .catch(() => alert("❌ কপি করা যায়নি"));
});

// ✅ রিসেট
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("সব তথ্য মুছে ফেলবেন?")) {
    document.querySelector("form").reset();
    document.getElementById("preview").innerHTML = "";
    document.getElementById("output").textContent = "";
  }
});
