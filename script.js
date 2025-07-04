// ✅ Toast Notification
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style = `
    position: fixed; bottom: 20px; left: 50%;
    transform: translateX(-50%);
    background: #28a745; color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    z-index: 9999;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ✅ Generate Product HTML
document.getElementById("generateBtn").addEventListener("click", () => {
  const get = id => document.getElementById(id)?.value.trim();
  const name = get("name"), code = get("code"), price = parseFloat(get("price"));
  const offer = parseFloat(get("offer")), unit = get("unit"), qty = get("qty");
  const brand = get("brand"), size = get("size"), color = get("color");
  const delivery = get("delivery"), status = get("status"), category = get("category");
  const desc = get("desc"), video = get("video"), wa = get("wa");
  const imgs = document.querySelectorAll(".img-url");

  if (!name || !code || isNaN(price) || !imgs[0]?.value || !wa) {
    alert("প্রোডাক্ট নাম, কোড, প্রাইস, প্রথম ছবি ও WhatsApp নম্বর বাধ্যতামূলক।");
    return;
  }

  const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;

  // ✅ Thumbnail HTML
  const mainImg = imgs[0].value.trim();
  let thumbHTML = "";
  imgs.forEach((input, i) => {
    const url = input.value.trim();
    if (url) {
      thumbHTML += `<img src="${url}" style="width:60px;height:60px;border-radius:6px;cursor:pointer;border:2px solid ${i === 0 ? 'green' : 'transparent'};" onclick="document.getElementById('mainImg').src=this.src;document.querySelectorAll('#thumbs img').forEach(img=>img.style.border='2px solid transparent');this.style.border='2px solid green';">`;
    }
  });

  // ✅ Custom Fields
  let customHTML = "";
  document.querySelectorAll(".custom-field-group").forEach(group => {
    const key = group.querySelector(".custom-key").value.trim();
    const value = group.querySelector(".custom-value").value.trim();
    if (key && value) customHTML += `<li>🔧 ${key}: ${value}</li>`;
  });

  // ✅ YouTube Video
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

  // ✅ Product HTML Output
  const html = `
<div style="text-align:center;">
  <img id="mainImg" src="${mainImg}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">
  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">${thumbHTML}</div>
  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:18px;">${offer ? `<span style="text-decoration:line-through;color:#aaa;margin-right:6px;">৳${price}</span><span style="color:red;font-weight:bold;">৳${offer}</span><small style="color:limegreen;">(-${discount}%)</small>` : `<span style="color:red;font-weight:bold;">৳${price}</span>`}</p>
  <div style="margin:20px 0;">
    <a href="https://wa.me/${wa}?text=📦 আমি একটি পণ্য অর্ডার করতে চাই%0A🔖 প্রোডাক্ট: ${name}%0A💰 মূল্য: ${offer || price}৳%0A🧾 কোড: ${code}%0A📁 ক্যাটাগরি: ${category}%0A🚚 ডেলিভারি: ${delivery}" 
       target="_blank"
       style="display:inline-block;background: linear-gradient(135deg, #25D366, #128C7E);color:#fff;padding:14px 32px;border-radius:50px;font-weight:bold;font-size:17px;text-decoration:none;box-shadow: 0 4px 10px rgba(0,0,0,0.15);transition: all 0.3s ease;">
      Order Now
    </a>
  </div>
  <ul style="list-style:none;padding:0;margin:15px auto;text-align:left;max-width:500px;">
    ${code ? `<li>🔢 কোড: ${code}</li>` : ""}
    ${status ? `<li>📦 স্ট্যাটাস: ${status}</li>` : ""}
    ${category ? `<li>📁 ক্যাটাগরি: ${category}</li>` : ""}
    ${delivery ? `<li>🚚 ডেলিভারি টাইম: ${delivery}</li>` : ""}
    ${brand ? `<li>🏷️ ব্র্যান্ড: ${brand}</li>` : ""}
    ${(size || color) ? `<li>📐 সাইজ: ${size || 'N/A'} | 🎨 রঙ: ${color || 'N/A'}</li>` : ""}
    ${customHTML}
  </ul>
  ${desc ? `<div style="border:1px solid #eee;padding:15px;border-radius:10px;max-width:500px;margin:auto;margin-bottom:20px;"><p style="margin:0;"><strong>Description:</strong><br>${desc}</p></div>` : ""}
  ${videoEmbed}
  <p style="display:none;"><a href="#">{getProduct} $price={৳${offer || price}} $sale={৳${price}} $style={1}</a></p>
</div>
`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
  saveDraft();
  showToast("✅ প্রোডাক্ট তৈরি হয়েছে");
});

// ✅ Add Image Input
function addImageInput() {
  const container = document.getElementById("imageInputs");
  if (container.querySelectorAll(".img-url").length >= 5) return;
  const input = document.createElement("input");
  input.type = "url";
  input.className = "img-url";
  input.placeholder = "ছবির লিংক (Image URL)";
  container.appendChild(input);
}

// ✅ Add Custom Field
function addCustomField() {
  const container = document.getElementById("customFields");
  const group = document.createElement("div");
  group.className = "custom-field-group";
  group.innerHTML = `
    <input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি">
    <input type="text" class="custom-value" placeholder="মান যেমন: ৬ মাস">
  `;
  container.appendChild(group);
}

// ✅ Copy Output Button
document.getElementById("copyBtn")?.addEventListener("click", () => {
  const output = document.getElementById("output").textContent;
  navigator.clipboard.writeText(output).then(() => {
    showToast("✅ কপি করা হয়েছে");
  });
});

// ✅ Save Draft
function saveDraft() {
  const draft = {
    id: localStorage.getItem("editDraftId") || Date.now(),
    name: get("name"), code: get("code"), price: get("price"), offer: get("offer"),
    unit: get("unit"), qty: get("qty"), brand: get("brand"), size: get("size"),
    color: get("color"), delivery: get("delivery"), status: get("status"),
    category: get("category"), desc: get("desc"), video: get("video"), wa: get("wa"),
    images: [...document.querySelectorAll(".img-url")].map(i => i.value.trim()).filter(Boolean),
    customFields: [...document.querySelectorAll(".custom-field-group")].map(group => ({
      key: group.querySelector(".custom-key").value.trim(),
      value: group.querySelector(".custom-value").value.trim()
    }))
  };

  let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const index = drafts.findIndex(d => d.id == draft.id);
  if (index !== -1) drafts[index] = draft;
  else drafts.push(draft);
  localStorage.setItem("drafts", JSON.stringify(drafts));
  localStorage.removeItem("editDraftId");
}

// ✅ Load Draft to Form
function loadDraftToForm(id) {
  const draft = JSON.parse(localStorage.getItem("drafts") || "[]").find(d => d.id == id);
  if (!draft) return;

  const set = (id, val) => document.getElementById(id).value = val || "";
  for (let key in draft) if (typeof draft[key] === 'string') set(key, draft[key]);

  const imgContainer = document.getElementById("imageInputs");
  imgContainer.innerHTML = "";
  draft.images.forEach(url => {
    const input = document.createElement("input");
    input.type = "url";
    input.className = "img-url";
    input.placeholder = "ছবির লিংক (Image URL)";
    input.value = url;
    imgContainer.appendChild(input);
  });

  const customContainer = document.getElementById("customFields");
  customContainer.innerHTML = "";
  draft.customFields.forEach(field => {
    const group = document.createElement("div");
    group.className = "custom-field-group";
    group.innerHTML = `<input type="text" class="custom-key" value="${field.key}"><input type="text" class="custom-value" value="${field.value}">`;
    customContainer.appendChild(group);
  });
}

// ✅ Field Visibility Control
function applyFieldVisibility() {
  const hiddenFields = JSON.parse(localStorage.getItem("hiddenFields") || "[]");
  hiddenFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

// ✅ On Load
window.addEventListener("DOMContentLoaded", () => {
  applyFieldVisibility();
  const draftId = localStorage.getItem("editDraftId");
  if (draftId) loadDraftToForm(draftId);
});
