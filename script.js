// Menu Toggle for Sidebar
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
}

// Logout Functionality
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// Add Image URL Input
function addImageInput() {
  const container = document.getElementById("imageInputs");
  const input = document.createElement("input");
  input.type = "url";
  input.className = "img-url";
  input.placeholder = "ছবির লিংক (Image URL)";
  container.appendChild(input);
}

// Add Custom Field for Product
function addCustomField() {
  const container = document.getElementById("customFields");
  const group = document.createElement("div");
  group.className = "custom-field-group";
  group.innerHTML = `
    <input type="text" class="custom-key" placeholder="শিরোনাম">
    <input type="text" class="custom-value" placeholder="মান">
  `;
  container.appendChild(group);
}

// Generate Product Code
document.getElementById("generateBtn").addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const code = document.getElementById("code").value.trim();
  const price = document.getElementById("price").value.trim();
  const offer = document.getElementById("offer").value.trim();
  const unit = document.getElementById("unit").value.trim();
  const qty = document.getElementById("qty").value.trim();
  const brand = document.getElementById("brand").value.trim();
  const size = document.getElementById("size").value.trim();
  const color = document.getElementById("color").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const status = document.getElementById("status").value.trim();
  const category = document.getElementById("category").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const video = document.getElementById("video").value.trim();
  const wa = document.getElementById("wa").value.trim();

  const images = Array.from(document.querySelectorAll(".img-url")).map(i => i.value.trim()).filter(Boolean);
  const custom = Array.from(document.querySelectorAll(".custom-field-group")).map(group => {
    const key = group.querySelector(".custom-key").value.trim();
    const value = group.querySelector(".custom-value").value.trim();
    return key && value ? { key, value } : null;
  }).filter(Boolean);

  if (!name || !code || !price || !wa) {
    alert("⚠️ প্রোডাক্ট নাম, কোড, প্রাইস ও WhatsApp নম্বর অবশ্যই পূরণ করুন");
    return;
  }

  const user = localStorage.getItem("loggedInUser");
  const allData = JSON.parse(localStorage.getItem("g9tool_data") || "{}");
  const saved = allData[user] || [];

  const product = {
    name, code, price, offer, unit, qty, brand, size, color,
    delivery, status, category, desc, video, wa, images, custom
  };

  const editIndex = localStorage.getItem("editIndex");

  if (editIndex !== null) {
    saved[parseInt(editIndex)] = product;
    localStorage.removeItem("editIndex");
    alert("✅ প্রোডাক্ট সফলভাবে আপডেট হয়েছে");
  } else {
    saved.push(product);
    alert("✅ প্রোডাক্ট সফলভাবে সংরক্ষণ হয়েছে");
  }

  allData[user] = saved;
  localStorage.setItem("g9tool_data", JSON.stringify(allData));

  generateCode(product);
});

// Generate Product Code Output
function generateCode(product) {
  const out = document.getElementById("output");
  const imagesHtml = product.images.map(url => `<img src="${url}" style="max-width:100px;margin:5px;">`).join('');
  const customHtml = product.custom.map(pair => `<li>${pair.key}: ${pair.value}</li>`).join('');

  out.innerHTML = `
    <div>
      <h2>${product.name}</h2>
      <p>কোড: ${product.code}</p>
      <p>মূল্য: ৳${product.price} ${product.offer ? `(অফার: ৳${product.offer})` : ''}</p>
      <p>ব্র্যান্ড: ${product.brand || ''}</p>
      <p>সাইজ: ${product.size || ''}</p>
      <p>রঙ: ${product.color || ''}</p>
      <p>ডেলিভারি: ${product.delivery || ''}</p>
      <p>স্ট্যাটাস: ${product.status || ''}</p>
      <p>ক্যাটাগরি: ${product.category || ''}</p>
      <p>বর্ণনা: ${product.desc}</p>
      <p>WhatsApp: ${product.wa}</p>
      ${product.video ? `<p>ভিডিও: <a href="${product.video}" target="_blank">দেখুন</a></p>` : ''}
      <div>${imagesHtml}</div>
      ${customHtml ? `<ul>${customHtml}</ul>` : ''}
    </div>
  `;
}

// Copy Generated Code to Clipboard
document.getElementById("copyBtn").addEventListener("click", () => {
  const temp = document.createElement("textarea");
  temp.value = document.getElementById("output").innerText;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  alert("✅ কপি সম্পন্ন!");
});

// Edit Existing Product
const editId = new URLSearchParams(window.location.search).get('edit');
if (editId !== null) {
  const user = localStorage.getItem("loggedInUser");
  const allData = JSON.parse(localStorage.getItem("g9tool_data") || "{}");
  const saved = allData[user] || [];
  const product = saved[editId];

  if (product) {
    document.getElementById("name").value = product.name || "";
    document.getElementById("code").value = product.code || "";
    document.getElementById("price").value = product.price || "";
    document.getElementById("offer").value = product.offer || "";
    document.getElementById("unit").value = product.unit || "";
    document.getElementById("qty").value = product.qty || "";
    document.getElementById("brand").value = product.brand || "";
    document.getElementById("size").value = product.size || "";
    document.getElementById("color").value = product.color || "";
    document.getElementById("delivery").value = product.delivery || "";
    document.getElementById("status").value = product.status || "";
    document.getElementById("category").value = product.category || "";
    document.getElementById("desc").value = product.desc || "";
    document.getElementById("video").value = product.video || "";
    document.getElementById("wa").value = product.wa || "";

    const imageInputs = document.getElementById("imageInputs");
    imageInputs.innerHTML = '';
    (product.images || []).forEach(url => {
      const div = document.createElement("div");
      div.className = "image-group";
      div.innerHTML = `<input type="url" class="img-url" value="${url}" placeholder="ছবির লিংক (Image URL)">`;
      imageInputs.appendChild(div);
    });

    const customFields = document.getElementById("customFields");
    customFields.innerHTML = '';
    (product.custom || []).forEach(field => {
      const div = document.createElement("div");
      div.className = "custom-field-group";
      div.innerHTML = `
        <input type="text" class="custom-key" value="${field.key}" placeholder="শিরোনাম">
        <input type="text" class="custom-value" value="${field.value}" placeholder="মান">
      `;
      customFields.appendChild(div);
    });

    localStorage.setItem("editIndex", editId);
  }
}
