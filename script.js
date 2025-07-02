document.getElementById("generateBtn").addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const code = document.getElementById("code").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const offer = parseFloat(document.getElementById("offer").value);
  const wa = document.getElementById("wa").value.trim();
  const imgs = [...document.querySelectorAll(".img-url")].map(i => i.value.trim()).filter(Boolean);
  const category = document.getElementById("category").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const status = document.getElementById("status").value.trim();
  const brand = document.getElementById("brand").value.trim();
  const size = document.getElementById("size").value.trim();
  const color = document.getElementById("color").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const video = document.getElementById("video").value.trim();

  if (!name || !code || !price || !imgs[0] || !wa) {
    alert("❌ প্রোডাক্ট নাম, কোড, প্রাইস, প্রথম ছবি ও WhatsApp নম্বর দিতে হবে।");
    return;
  }

  const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;

  // থাম্বনেইল HTML
  let thumbHTML = "";
  imgs.forEach((url, i) => {
    thumbHTML += `<img src="${url}" style="width:60px;height:60px;border-radius:6px;cursor:pointer;border:2px solid ${i === 0 ? 'green' : 'transparent'};" onclick="document.getElementById('mainImg').src=this.src;document.querySelectorAll('#thumbs img').forEach(i=>i.style.border='2px solid transparent');this.style.border='2px solid green';">`;
  });

  // কাস্টম তথ্য HTML
  const customFields = document.querySelectorAll(".custom-field-group");
  let customHTML = "";
  customFields.forEach(group => {
    const key = group.querySelector(".custom-key").value.trim();
    const val = group.querySelector(".custom-value").value.trim();
    if (key && val) {
      customHTML += `<li>🔧 ${key}: ${val}</li>`;
    }
  });

  // ইউটিউব ভিডিও
  let videoEmbed = "";
  if (video.includes("youtube.com") || video.includes("youtu.be")) {
    let videoId = "";
    if (video.includes("watch?v=")) {
      videoId = video.split("v=")[1].split("&")[0];
    } else if (video.includes("youtu.be/")) {
      videoId = video.split("youtu.be/")[1].split("?")[0];
    }
    if (videoId) {
      videoEmbed = `<div style="margin-top:10px;"><iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    }
  }

  const html = `
<div style="text-align:center;">
  <img id="mainImg" src="${imgs[0]}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">
  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">${thumbHTML}</div>
  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:18px;">
    ${offer ? `<span style="text-decoration:line-through;color:#aaa;margin-right:6px;">৳${price}</span>
               <span style="color:red;font-weight:bold;">৳${offer}</span>
               <small style="color:limegreen;">(-${discount}%)</small>` :
               `<span style="color:red;font-weight:bold;">৳${price}</span>`}
  </p>
  <div style="margin:20px 0;">
    <a href="https://wa.me/${wa}?text=📦 আমি একটি পণ্য অর্ডার করতে চাই%0A🔖 প্রোডাক্ট: ${name}%0A💰 মূল্য: ${offer || price}৳%0A🧾 কোড: ${code}%0A📁 ক্যাটাগরি: ${category}%0A🚚 ডেলিভারি: ${delivery}" 
       target="_blank"
       style="display:inline-flex;align-items:center;gap:10px;padding:14px 26px;font-size:17px;font-weight:600;color:#fff;background:linear-gradient(135deg,#25D366,#128C7E);border:none;border-radius:50px;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:all 0.3s ease;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="height:22px;width:22px;">
      অর্ডার করুন WhatsApp এ
    </a>
  </div>
  <ul style="list-style:none;padding:0;margin:15px auto;text-align:left;max-width:500px;">
    <li>🔢 কোড: ${code}</li>
    <li>📦 স্ট্যাটাস: ${status || 'Available'}</li>
    <li>📁 ক্যাটাগরি: ${category}</li>
    <li>🚚 ডেলিভারি টাইম: ${delivery}</li>
    <li>🏷️ ব্র্যান্ড: ${brand}</li>
    <li>📐 সাইজ: ${size} | 🎨 রঙ: ${color}</li>
    ${customHTML}
  </ul>
  <div style="border:1px solid #eee;padding:15px;border-radius:10px;max-width:500px;margin:auto;margin-bottom:20px;">
    <p style="margin:0;"><strong>Description:</strong><br>${desc}</p>
  </div>
  ${videoEmbed}
  <p style="display:none;"><a href="#">{getProduct} $price={৳${offer || price}} $sale={৳${price}} $style={1}</a></p>
</div>`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
});

// ✅ কপি বাটন
document.getElementById("copyBtn").addEventListener("click", () => {
  const code = document.getElementById("output").textContent;
  if (!code) {
    alert("❌ আগে কোড জেনারেট করুন");
    return;
  }
  navigator.clipboard.writeText(code)
    .then(() => alert("✅ কোড কপি হয়েছে!"))
    .catch(() => alert("❌ কপি করা যায়নি"));
});
