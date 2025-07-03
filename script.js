// ========== ✅ Utility Functions ==========
function $(id) {
  return document.getElementById(id);
}
function createInput({ type = "text", className = "", placeholder = "", value = "" }) {
  const input = document.createElement("input");
  input.type = type;
  input.className = className;
  input.placeholder = placeholder;
  input.value = value;
  return input;
}

// ========== ✅ Validation ==========
function validateForm() {
  const name = $("name").value.trim();
  const code = $("code").value.trim();
  const price = parseFloat($("price").value);
  const wa = $("wa").value.trim();
  const imgs = document.querySelectorAll(".img-url");
  if (!name || !code || isNaN(price) || !imgs[0].value || !wa) {
    alert("প্রোডাক্ট নাম, কোড, প্রাইস, প্রথম ছবি ও WhatsApp নম্বর বাধ্যতামূলক।");
    return false;
  }
  return true;
}

// ========== ✅ HTML Generator ==========
function generateProductHTML() {
  const get = id => $(id).value.trim();
  const imgs = document.querySelectorAll(".img-url");
  const customFields = document.querySelectorAll(".custom-field-group");

  const name = get("name"), code = get("code"), price = parseFloat(get("price"));
  const offer = parseFloat(get("offer")), wa = get("wa");
  const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;
  const mainImg = imgs[0].value.trim();

  const thumbHTML = Array.from(imgs).map((input, i) => {
    const url = input.value.trim();
    if (!url) return "";
    return `<img src="${url}" style="width:60px;height:60px;border-radius:6px;cursor:pointer;border:2px solid ${i === 0 ? 'green' : 'transparent'};" onclick="document.getElementById('mainImg').src=this.src;document.querySelectorAll('#thumbs img').forEach(img=>img.style.border='2px solid transparent');this.style.border='2px solid green';">`;
  }).join("");

  const customHTML = Array.from(customFields).map(group => {
    const key = group.querySelector(".custom-key").value.trim();
    const value = group.querySelector(".custom-value").value.trim();
    return key && value ? `<li>🔧 ${key}: ${value}</li>` : "";
  }).join("");

  let videoEmbed = "";
  const video = get("video");
  if (video.includes("youtube.com") || video.includes("youtu.be")) {
    let videoId = "";
    if (video.includes("v=")) {
      videoId = video.split("v=")[1].split("&")[0];
    } else {
      videoId = video.split("youtu.be/")[1];
    }
    if (videoId) {
      videoEmbed = `<div style="margin-top:10px;"><iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    }
  }

  return `
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
    <a href="https://wa.me/${wa}?text=📦 আমি একটি পণ্য অর্ডার করতে চাই%0A🔖 প্রোডাক্ট: ${name}%0A💰 মূল্য: ${offer || price}৳%0A🧾 কোড: ${code}%0A📁 ক্যাটাগরি: ${get("category")}%0A🚚 ডেলিভারি: ${get("delivery")}" 
       target="_blank"
       style="display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:16px;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="height:20px;width:20px;">
      অর্ডার করুন WhatsApp এ
    </a>
  </p>
  <ul style="list-style:none;padding:0;margin:15px auto;text-align:left;max-width:500px;">
    <li>🔢 কোড: ${code}</li>
    <li>📦 স্ট্যাটাস: ${get("status") || "IN STOCK"}</li>
    <li>📁 ক্যাটাগরি: ${get("category") || "N/A"}</li>
    <li>🚚 ডেলিভারি টাইম: ${get("delivery") || "N/A"}</li>
    <li>🏷️ ব্র্যান্ড: ${get("brand") || "N/A"}</li>
    <li>📐 সাইজ: ${get("size") || "N/A"} | 🎨 রঙ: ${get("color") || "N/A"}</li>
    ${customHTML}
  </ul>
  <div style="border:1px solid #eee;padding:15px;border-radius:10px;max-width:500px;margin:auto;margin-bottom:20px;">
    <p style="margin:0;"><strong>Description:</strong><br>${get("desc")}</p>
  </div>
  ${videoEmbed}
  <p style="display:none;"><a href="#">getProduct $price={৳${offer || price}} $sale={৳${price}} $style={1}</a></p>
</div>`;
}

// ========== ✅ Draft Save System ==========
function saveDraft() {
  const draft = {
    name: $("name").value.trim(),
    code: $("code").value.trim(),
    price: $("price").value,
    offer: $("offer").value,
    unit: $("unit").value,
    qty: $("qty").value,
    brand: $("brand").value,
    size: $("size").value,
    color: $("color").value,
    delivery: $("delivery").value,
    status: $("status").value,
    category: $("category").value,
    desc: $("desc").value,
    video: $("video").value,
    wa: $("wa").value,
    images: Array.from(document.querySelectorAll(".img-url")).map(i => i.value.trim()).filter(Boolean),
    customFields: Array.from(document.querySelectorAll(".custom-field-group")).map(group => ({
      key: group.querySelector(".custom-key").value.trim(),
      value: group.querySelector(".custom-value").value.trim()
    }))
  };

  let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const editId = localStorage.getItem("editDraftId");
  const isDuplicate = drafts.some(d => d.code === draft.code && (!editId || d.id != editId));
  if (isDuplicate) return alert("⚠️ এই কোড ব্যবহার করে আগেই একটি প্রোডাক্ট সেভ করা হয়েছে।");

  if (editId) {
    const index = drafts.findIndex(d => d.id == editId);
    if (index !== -1) {
      draft.id = drafts[index].id;
      drafts[index] = draft;
    }
    localStorage.removeItem("editDraftId");
  } else {
    draft.id = Date.now();
    drafts.push(draft);
  }

  localStorage.setItem("drafts", JSON.stringify(drafts));
  alert("✅ প্রোডাক্ট সেভ হয়েছে!");
}

// ========== ✅ Form Load/Redirect ==========
function loadDraftToForm(draftId) {
  const drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const draft = drafts.find(d => d.id == draftId);
  if (!draft) return alert("❌ Draft খুঁজে পাওয়া যায়নি");

  const set = (id, val) => $(id).value = val || "";
  set("name", draft.name); set("code", draft.code); set("price", draft.price);
  set("offer", draft.offer); set("unit", draft.unit); set("qty", draft.qty);
  set("brand", draft.brand); set("size", draft.size); set("color", draft.color);
  set("delivery", draft.delivery); set("status", draft.status); set("category", draft.category);
  set("desc", draft.desc); set("video", draft.video); set("wa", draft.wa);

  const imageContainer = $("imageInputs");
  imageContainer.innerHTML = "";
  (draft.images || []).forEach(url => {
    imageContainer.appendChild(createInput({ type: "url", className: "img-url", placeholder: "ছবির লিংক (Image URL)", value: url }));
  });

  const customContainer = $("customFields");
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

function editDraft(id) {
  localStorage.setItem("editDraftId", id);
  window.location.href = "dashboard.html";
}

// ========== ✅ Input Adders ==========
function addImageInput() {
  const container = $("imageInputs");
  if (container.querySelectorAll(".img-url").length >= 5) return;
  container.appendChild(createInput({ type: "url", className: "img-url", placeholder: "ছবির লিংক (Image URL)" }));
}

function addCustomField() {
  const container = $("customFields");
  const group = document.createElement("div");
  group.className = "custom-field-group";
  group.innerHTML = `
    <input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি">
    <input type="text" class="custom-value" placeholder="মান যেমন: ৩ মাস">
  `;
  container.appendChild(group);
}

// ========== ✅ Copy & Menu ==========
function toggleMenu() {
  $("sidebar").classList.toggle("active");
}

// ========== ✅ DOM Events ==========
document.addEventListener("DOMContentLoaded", () => {
  const draftId = localStorage.getItem("editDraftId");
  if (draftId) {
    loadDraftToForm(draftId);
    localStorage.removeItem("editDraftId");
  }
});

$("copyBtn").addEventListener("click", () => {
  const output = $("output").textContent;
  navigator.clipboard.writeText(output)
    .then(() => alert("✅ কোড কপি হয়েছে!"))
    .catch(() => alert("❌ কপি করা যায়নি"));
});

$("generateBtn").addEventListener("click", () => {
  if (!validateForm()) return;
  const html = generateProductHTML();
  $("output").textContent = html;
  $("preview").innerHTML = html;
  saveDraft();
});
