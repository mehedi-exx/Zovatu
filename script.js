// ✅ Toast Notification
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    z-index: 9999;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ✅ Utility
const getVal = id => document.getElementById(id)?.value.trim();

// ✅ Generate Product HTML
document.getElementById("generateBtn").addEventListener("click", () => {
  const name = getVal("name"), code = getVal("code"), price = parseFloat(getVal("price"));
  const offer = parseFloat(getVal("offer")), brand = getVal("brand"), size = getVal("size");
  const color = getVal("color"), delivery = getVal("delivery"), status = getVal("status");
  const category = getVal("category"), desc = getVal("desc"), video = getVal("video");
  const wa = getVal("wa");
  const imgs = document.querySelectorAll(".img-url");

  if (!name || !code || isNaN(price) || !imgs[0]?.value || !wa) {
    alert("প্রোডাক্ট নাম, কোড, প্রাইস, প্রথম ছবি ও WhatsApp নম্বর বাধ্যতামূলক।");
    return;
  }

  const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;

  const mainImg = imgs[0].value.trim();
  let thumbHTML = "";
  imgs.forEach((input, i) => {
    const url = input.value.trim();
    if (url) {
      thumbHTML += `<img src="${url}" style="width:60px;height:60px;border-radius:6px;cursor:pointer;border:2px solid ${i === 0 ? 'green' : 'transparent'};" onclick="document.getElementById('mainImg').src=this.src;document.querySelectorAll('#thumbs img').forEach(img=>img.style.border='2px solid transparent');this.style.border='2px solid green';">`;
    }
  });

  let customHTML = "";
  document.querySelectorAll(".custom-field-group").forEach(group => {
    const key = group.querySelector(".custom-key").value.trim();
    const value = group.querySelector(".custom-value").value.trim();
    if (key && value) {
      customHTML += `<li>🔧 ${key}: ${value}</li>`;
    }
  });

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

  const html = `
<div style="text-align:center;">
  <img id="mainImg" src="${mainImg}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">
  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">${thumbHTML}</div>
  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:18px;">
    ${offer ? `<span style="text-decoration:line-through;color:#aaa;margin-right:6px;">৳${price}</span><span style="color:red;font-weight:bold;">৳${offer}</span><small style="color:limegreen;">(-${discount}%)</small>` : `<span style="color:red;font-weight:bold;">৳${price}</span>`}
  </p>
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
    ${(size || color) ? `<li>📐 সাইজ: ${size || "N/A"} | 🎨 রঙ: ${color || "N/A"}</li>` : ""}
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
    name: getVal("name"), code: getVal("code"), price: getVal("price"), offer: getVal("offer"),
    brand: getVal("brand"), size: getVal("size"), color: getVal("color"),
    delivery: getVal("delivery"), status: getVal("status"), category: getVal("category"),
    desc: getVal("desc"), video: getVal("video"), wa: getVal("wa"),
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

// ✅ Draft Management
let currentPage = 1;
const itemsPerPage = 5;

function renderDrafts() {
  let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const searchTerm = document.getElementById("draftSearch").value.toLowerCase();
  const sortBy = document.getElementById("draftSort").value;

  // Filter
  if (searchTerm) {
    drafts = drafts.filter(d => d.name.toLowerCase().includes(searchTerm) || d.code.toLowerCase().includes(searchTerm));
  }

  // Sort
  drafts.sort((a, b) => {
    if (sortBy === "newest") return b.id - a.id;
    if (sortBy === "oldest") return a.id - b.id;
    if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
    if (sortBy === "nameDesc") return b.name.localeCompare(a.name);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(drafts.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedDrafts = drafts.slice(start, end);

  const draftListDiv = document.getElementById("draftList");
  draftListDiv.innerHTML = "";

  if (paginatedDrafts.length === 0) {
    draftListDiv.innerHTML = "<p style=\"text-align:center;\">কোনো ড্রাফট পাওয়া যায়নি।</p>";
    document.getElementById("pageInfo").textContent = "";
    document.getElementById("prevPage").disabled = true;
    document.getElementById("nextPage").disabled = true;
    return;
  }

  paginatedDrafts.forEach(draft => {
    const draftItem = document.createElement("div");
    draftItem.className = "draft-item";
    draftItem.innerHTML = `
      <h3>${draft.name} (${draft.code})</h3>
      <p>মূল্য: ৳${draft.price} ${draft.offer ? `(অফার: ৳${draft.offer})` : ""}</p>
      <p>সেভ করা হয়েছে: ${new Date(draft.id).toLocaleString()}</p>
      <button onclick="loadDraftToForm(${draft.id})">এডিট</button>
      <button onclick="deleteDraft(${draft.id})">ডিলিট</button>
    `;
    draftListDiv.appendChild(draftItem);
  });

  document.getElementById("pageInfo").textContent = `পৃষ্ঠা ${currentPage} এর ${totalPages}`; 
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

function deleteDraft(id) {
  let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  drafts = drafts.filter(d => d.id !== id);
  localStorage.setItem("drafts", JSON.stringify(drafts));
  showToast("✅ ড্রাফট ডিলিট হয়েছে");
  renderDrafts();
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderDrafts();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const totalPages = Math.ceil(drafts.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderDrafts();
  }
});

document.getElementById("draftSearch").addEventListener("keyup", renderDrafts);
document.getElementById("draftSort").addEventListener("change", () => {
  currentPage = 1; // Reset to first page on sort change
  renderDrafts();
});

// ✅ On Load
window.addEventListener("DOMContentLoaded", () => {
  applyFieldVisibility();
  const draftId = localStorage.getItem("editDraftId");
  if (draftId) loadDraftToForm(draftId);
  renderDrafts(); // Initial render of drafts
});

// ✅ Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) { // Ctrl or Cmd key
    if (e.key === "s") { // Ctrl/Cmd + S for Save Draft
      e.preventDefault();
      saveDraft();
      showToast("✅ ড্রাফট সেভ হয়েছে (Ctrl+S)");
    } else if (e.key === "g") { // Ctrl/Cmd + G for Generate
      e.preventDefault();
      document.getElementById("generateBtn").click();
    } else if (e.key === "c") { // Ctrl/Cmd + C for Copy
      e.preventDefault();
      document.getElementById("copyBtn").click();
    } else if (e.key === "l") { // Ctrl/Cmd + L for Clear
      e.preventDefault();
      clearForm();
      showToast("✅ ফর্ম ক্লিয়ার হয়েছে (Ctrl+L)");
    }
  }
});
