// ======= ✅ Toast Notification System =======
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#28a745",
    color: "white",
    padding: "12px 20px",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    zIndex: "9999"
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ======= ✅ Product Generate Button =======
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

  if (!name || !code || isNaN(price) || !imgs[0]?.value || !wa) {
    alert("প্রোডাক্ট নাম, কোড, প্রাইস, প্রথম ছবি ও WhatsApp নম্বর বাধ্যতামূলক।");
    return;
  }

  const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;

  // ✅ Thumbnail Images
  let thumbHTML = "";
  const mainImg = imgs[0].value.trim();
  imgs.forEach((input, i) => {
    const url = input.value.trim();
    if (url) {
      thumbHTML += `<img src="${url}" style="width:60px;height:60px;border-radius:6px;cursor:pointer;border:2px solid ${i === 0 ? 'green' : 'transparent'};" onclick="document.getElementById('mainImg').src=this.src;document.querySelectorAll('#thumbs img').forEach(img=>img.style.border='2px solid transparent');this.style.border='2px solid green';">`;
    }
  });

  // ✅ Custom Fields
  const customFields = document.querySelectorAll(".custom-field-group");
  let customHTML = "";
  customFields.forEach(group => {
    const key = group.querySelector(".custom-key").value.trim();
    const value = group.querySelector(".custom-value").value.trim();
    if (key && value) {
      customHTML += `<li>🔧 ${key}: ${value}</li>`;
    }
  });

  // ✅ YouTube Video Embed
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

  // ✅ Professional WhatsApp Button
  const whatsappBtn = `
  <div style="margin:20px 0;">
    <a href="https://wa.me/${wa}?text=📦 আমি একটি পণ্য অর্ডার করতে চাই%0A🔖 প্রোডাক্ট: ${name}%0A💰 মূল্য: ${offer || price}৳%0A🧾 কোড: ${code}%0A📁 ক্যাটাগরি: ${category}%0A🚚 ডেলিভারি: ${delivery}" 
       target="_blank"
       style="display:flex;align-items:center;justify-content:center;gap:10px;background:#25D366;color:#fff;padding:14px 28px;border-radius:12px;font-weight:bold;text-decoration:none;font-size:18px;box-shadow:0 4px 10px rgba(0,0,0,0.1);transition:0.3s;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="height:24px;width:24px;">
      WhatsApp এ অর্ডার করুন
    </a>
  </div>`;

  // ✅ Final HTML Output
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
  ${whatsappBtn}
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
  <p style="display:none;"><a href="#">{getProduct} $price={৳${offer || price}} $sale={৳${price}} $style={1}</a></p>
</div>`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;

  saveDraft();
  showToast("✅ প্রোডাক্ট সফলভাবে জেনারেট হয়েছে");
});

// ======= ✅ Copy Button =======
document.getElementById("copyBtn")?.addEventListener("click", () => {
  const outputText = document.getElementById("output").textContent;
  navigator.clipboard.writeText(outputText).then(() => {
    showToast("✅ কপি করা হয়েছে");
  });
});

// ======= ✅ Save Draft to localStorage =======
function saveDraft() {
  const draft = {
    id: localStorage.getItem("editDraftId") || Date.now(),
    name: document.getElementById("name").value.trim(),
    code: document.getElementById("code").value.trim(),
    price: document.getElementById("price").value,
    offer: document.getElementById("offer").value,
    unit: document.getElementById("unit").value,
    qty: document.getElementById("qty").value,
    brand: document.getElementById("brand").value,
    size: document.getElementById("size").value,
    color: document.getElementById("color").value,
    delivery: document.getElementById("delivery").value,
    status: document.getElementById("status").value,
    category: document.getElementById("category").value,
    desc: document.getElementById("desc").value,
    video: document.getElementById("video").value,
    wa: document.getElementById("wa").value,
    images: Array.from(document.querySelectorAll(".img-url")).map(i => i.value.trim()).filter(Boolean),
    customFields: Array.from(document.querySelectorAll(".custom-field-group")).map(group => ({
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

// ======= ✅ Load Draft to Form =======
function loadDraftToForm(id) {
  const drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const draft = drafts.find(d => d.id == id);
  if (!draft) return;

  const setValue = (id, val) => document.getElementById(id).value = val || "";

  setValue("name", draft.name);
  setValue("code", draft.code);
  setValue("price", draft.price);
  setValue("offer", draft.offer);
  setValue("unit", draft.unit);
  setValue("qty", draft.qty);
  setValue("brand", draft.brand);
  setValue("size", draft.size);
  setValue("color", draft.color);
  setValue("delivery", draft.delivery);
  setValue("status", draft.status);
  setValue("category", draft.category);
  setValue("desc", draft.desc);
  setValue("video", draft.video);
  setValue("wa", draft.wa);

  const imgContainer = document.getElementById("imageInputs");
  imgContainer.innerHTML = "";
  (draft.images || []).forEach(url => {
    const input = document.createElement("input");
    input.type = "url";
    input.className = "img-url";
    input.placeholder = "ছবির লিংক (Image URL)";
    input.value = url;
    imgContainer.appendChild(input);
  });

  const customContainer = document.getElementById("customFields");
  customContainer.innerHTML = "";
  (draft.customFields || []).forEach(field => {
    const group = document.createElement("div");
    group.className = "custom-field-group";
    group.innerHTML = `
      <input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি" value="${field.key}">
      <input type="text" class="custom-value" placeholder="মান যেমন: ৩ মাস" value="${field.value}">
    `;
    customContainer.appendChild(group);
  });
}

// ======= ✅ Hidden Field Control =======
function applyFieldVisibility() {
  const hiddenFields = JSON.parse(localStorage.getItem("hiddenFields") || "[]");
  hiddenFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

// ======= ✅ On Page Load =======
window.addEventListener("DOMContentLoaded", () => {
  applyFieldVisibility();
  const draftId = localStorage.getItem("editDraftId");
  if (draftId) loadDraftToForm(draftId);
});
