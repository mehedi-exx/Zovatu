import { getVal, showToast } from './utils.js';

export function generateProduct() {
  const name = getVal("name"), code = getVal("code"), price = parseFloat(getVal("price"));
  const offer = parseFloat(getVal("offer")), unit = getVal("unit"), qty = getVal("qty");
  const brand = getVal("brand"), size = getVal("size"), color = getVal("color");
  const delivery = getVal("delivery"), status = getVal("status"), category = getVal("category");
  const desc = getVal("desc"), video = getVal("video"), wa = getVal("wa");
  const imgs = document.querySelectorAll(".img-url");

  // Enhanced validation
  if (!name || !code || isNaN(price) || !imgs[0]?.value || !wa) {
    showToast("❌ প্রোডাক্ট নাম, কোড, প্রাইস, প্রথম ছবি ও WhatsApp নম্বর বাধ্যতামূলক।");
    highlightMissingFields();
    return;
  }

  // WhatsApp number validation
  if (!wa.match(/^8801[0-9]{9}$/)) {
    showToast("❌ WhatsApp নম্বর সঠিক ফরম্যাটে দিন (8801XXXXXXXXX)");
    document.getElementById("wa").focus();
    return;
  }

  const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;
  const mainImg = imgs[0].value.trim();
  
  // Generate thumbnail HTML with improved styling
  let thumbHTML = "";
  imgs.forEach((input, i) => {
    const url = input.value.trim();
    if (url) {
      thumbHTML += `
        <img src="${url}" 
             style="width:60px;height:60px;border-radius:8px;cursor:pointer;
                    border:3px solid ${i === 0 ? '#28a745' : 'transparent'};
                    transition:all 0.3s ease;object-fit:cover;" 
             onclick="changeMainImage(this, '${url}')"
             onmouseover="this.style.transform='scale(1.1)'"
             onmouseout="this.style.transform='scale(1)'">`;
    }
  });

  // Generate custom fields HTML
  let customHTML = "";
  document.querySelectorAll(".custom-field-group").forEach(group => {
    const key = group.querySelector(".custom-key").value.trim();
    const value = group.querySelector(".custom-value").value.trim();
    if (key && value) {
      customHTML += `<li><i class="fas fa-check-circle" style="color:#28a745;margin-right:8px;"></i><strong>${key}:</strong> ${value}</li>`;
    }
  });

  // Enhanced video embedding
  let videoEmbed = "";
  if (video && (video.includes("youtube.com") || video.includes("youtu.be"))) {
    let videoId = "";
    if (video.includes("youtube.com/watch?v=")) {
      videoId = video.split("v=")[1].split("&")[0];
    } else if (video.includes("youtu.be/")) {
      videoId = video.split("youtu.be/")[1];
    }
    if (videoId) {
      videoEmbed = `
        <div style="margin:20px 0;padding:15px;background:#f8f9fa;border-radius:10px;">
          <h3 style="margin:0 0 10px 0;color:#333;"><i class="fab fa-youtube" style="color:#ff0000;margin-right:8px;"></i>প্রোডাক্ট ভিডিও</h3>
          <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
            <iframe src="https://www.youtube.com/embed/${videoId}" 
                    style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:8px;" 
                    allowfullscreen></iframe>
          </div>
        </div>`;
    }
  }

  // Enhanced product HTML with better styling
  const html = `
<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;background:#fff;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.1);overflow:hidden;">
  <!-- Product Images -->
  <div style="position:relative;background:#f8f9fa;padding:20px;text-align:center;">
    <img id="mainImg" src="${mainImg}" 
         style="width:100%;max-width:400px;height:300px;object-fit:cover;border-radius:12px;
                box-shadow:0 8px 25px rgba(0,0,0,0.15);transition:transform 0.3s ease;"
         onmouseover="this.style.transform='scale(1.02)'"
         onmouseout="this.style.transform='scale(1)'">
    
    ${thumbHTML ? `
    <div id="thumbs" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:15px;padding:10px;">
      ${thumbHTML}
    </div>` : ''}
  </div>

  <!-- Product Info -->
  <div style="padding:25px;">
    <h1 style="margin:0 0 15px 0;color:#2c3e50;font-size:28px;font-weight:700;line-height:1.3;">${name}</h1>
    
    <!-- Price Section -->
    <div style="margin:20px 0;text-align:center;padding:15px;background:linear-gradient(135deg,#e8f5e8,#f0f8f0);border-radius:10px;">
      ${offer ? `
        <div style="font-size:18px;color:#6c757d;margin-bottom:5px;">
          <span style="text-decoration:line-through;">৳${price.toLocaleString()}</span>
          <span style="background:#dc3545;color:white;padding:2px 8px;border-radius:12px;font-size:14px;margin-left:8px;">-${discount}%</span>
        </div>
        <div style="font-size:32px;color:#28a745;font-weight:bold;">৳${offer.toLocaleString()}</div>
      ` : `
        <div style="font-size:32px;color:#28a745;font-weight:bold;">৳${price.toLocaleString()}</div>
      `}
      ${unit ? `<div style="color:#6c757d;margin-top:5px;">প্রতি ${unit}</div>` : ''}
    </div>

    <!-- Order Button -->
    <div style="text-align:center;margin:25px 0;">
      <a href="https://wa.me/${wa}?text=${encodeURIComponent(`🛒 নতুন অর্ডার\n📦 প্রোডাক্ট: ${name}\n🏷️ কোড: ${code}\n💰 মূল্য: ৳${offer || price}\n${qty ? `📊 পরিমাণ: ${qty}` : ''}\n${category ? `📁 ক্যাটাগরি: ${category}` : ''}\n${delivery ? `🚚 ডেলিভারি: ${delivery}` : ''}\n\n📞 অর্ডার করতে চাই`)}" 
         target="_blank"
         style="display:inline-block;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;
                padding:18px 40px;border-radius:50px;font-weight:bold;font-size:18px;
                text-decoration:none;box-shadow:0 6px 20px rgba(37,211,102,0.3);
                transition:all 0.3s ease;border:none;cursor:pointer;"
         onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 25px rgba(37,211,102,0.4)'"
         onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 6px 20px rgba(37,211,102,0.3)'">
        <i class="fab fa-whatsapp" style="margin-right:10px;font-size:20px;"></i>
        অর্ডার করুন
      </a>
    </div>

    <!-- Product Details -->
    <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin:20px 0;">
      <h3 style="margin:0 0 15px 0;color:#2c3e50;font-size:20px;display:flex;align-items:center;">
        <i class="fas fa-info-circle" style="color:#17a2b8;margin-right:10px;"></i>
        প্রোডাক্ট বিবরণ
      </h3>
      <ul style="list-style:none;padding:0;margin:0;">
        ${code ? `<li style="padding:8px 0;border-bottom:1px solid #e9ecef;"><i class="fas fa-barcode" style="color:#6f42c1;margin-right:10px;width:20px;"></i><strong>কোড:</strong> ${code}</li>` : ""}
        ${status ? `<li style="padding:8px 0;border-bottom:1px solid #e9ecef;"><i class="fas fa-check-circle" style="color:#28a745;margin-right:10px;width:20px;"></i><strong>স্ট্যাটাস:</strong> ${status}</li>` : ""}
        ${category ? `<li style="padding:8px 0;border-bottom:1px solid #e9ecef;"><i class="fas fa-folder" style="color:#fd7e14;margin-right:10px;width:20px;"></i><strong>ক্যাটাগরি:</strong> ${category}</li>` : ""}
        ${delivery ? `<li style="padding:8px 0;border-bottom:1px solid #e9ecef;"><i class="fas fa-truck" style="color:#20c997;margin-right:10px;width:20px;"></i><strong>ডেলিভারি:</strong> ${delivery}</li>` : ""}
        ${brand ? `<li style="padding:8px 0;border-bottom:1px solid #e9ecef;"><i class="fas fa-building" style="color:#6c757d;margin-right:10px;width:20px;"></i><strong>ব্র্যান্ড:</strong> ${brand}</li>` : ""}
        ${qty ? `<li style="padding:8px 0;border-bottom:1px solid #e9ecef;"><i class="fas fa-sort-numeric-up" style="color:#007bff;margin-right:10px;width:20px;"></i><strong>পরিমাণ:</strong> ${qty}</li>` : ""}
        ${size ? `<li style="padding:8px 0;border-bottom:1px solid #e9ecef;"><i class="fas fa-expand-arrows-alt" style="color:#e83e8c;margin-right:10px;width:20px;"></i><strong>সাইজ:</strong> ${size}</li>` : ""}
        ${color ? `<li style="padding:8px 0;border-bottom:1px solid #e9ecef;"><i class="fas fa-palette" style="color:#f39c12;margin-right:10px;width:20px;"></i><strong>রঙ:</strong> ${color}</li>` : ""}
        ${customHTML}
      </ul>
    </div>

    ${desc ? `
    <div style="background:#fff;border:2px solid #e9ecef;padding:20px;border-radius:12px;margin:20px 0;">
      <h3 style="margin:0 0 15px 0;color:#2c3e50;font-size:20px;display:flex;align-items:center;">
        <i class="fas fa-align-left" style="color:#17a2b8;margin-right:10px;"></i>
        বিস্তারিত বর্ণনা
      </h3>
      <p style="margin:0;line-height:1.6;color:#495057;font-size:16px;">${desc}</p>
    </div>` : ""}

    ${videoEmbed}

    <!-- Footer -->
    <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:2px solid #e9ecef;">
      <p style="margin:0;color:#6c757d;font-size:14px;">
        <i class="fas fa-shield-alt" style="color:#28a745;margin-right:5px;"></i>
        ১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি
      </p>
    </div>
  </div>
</div>

<script>
function changeMainImage(thumb, src) {
  document.getElementById('mainImg').src = src;
  document.querySelectorAll('#thumbs img').forEach(img => img.style.border = '3px solid transparent');
  thumb.style.border = '3px solid #28a745';
}
</script>

<style>
@media (max-width: 768px) {
  .product-container { margin: 10px; }
  .product-title { font-size: 24px !important; }
  .price-text { font-size: 28px !important; }
  .order-btn { padding: 15px 30px !important; font-size: 16px !important; }
  #thumbs img { width: 50px !important; height: 50px !important; }
}
</style>
`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
  saveDraft();
  showToast("✅ প্রোডাক্ট সফলভাবে তৈরি হয়েছে!");
  
  // Add success animation
  const generateBtn = document.getElementById("generateBtn");
  generateBtn.style.background = "#28a745";
  generateBtn.innerHTML = '<i class="fas fa-check"></i> সম্পন্ন!';
  setTimeout(() => {
    generateBtn.style.background = "";
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> জেনারেট';
  }, 2000);
}

function highlightMissingFields() {
  const requiredFields = ['name', 'code', 'price', 'wa'];
  const firstImgInput = document.querySelector('.img-url');
  
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      field.style.border = '2px solid #dc3545';
      field.style.animation = 'shake 0.5s';
      setTimeout(() => {
        field.style.border = '';
        field.style.animation = '';
      }, 2000);
    }
  });
  
  if (!firstImgInput?.value.trim()) {
    firstImgInput.style.border = '2px solid #dc3545';
    firstImgInput.style.animation = 'shake 0.5s';
    setTimeout(() => {
      firstImgInput.style.border = '';
      firstImgInput.style.animation = '';
    }, 2000);
  }
}

export function addImageInput() {
  const container = document.getElementById("imageInputs");
  const currentInputs = container.querySelectorAll(".img-url");
  
  if (currentInputs.length >= 5) {
    showToast("⚠️ সর্বোচ্চ ৫টি ছবি যোগ করা যাবে।");
    return;
  }
  
  const input = document.createElement("input");
  input.type = "url";
  input.className = "img-url";
  input.placeholder = `ছবির লিংক ${currentInputs.length + 1} (Image URL)`;
  input.style.marginTop = "10px";
  
  // Add remove button for additional images
  if (currentInputs.length > 0) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "10px";
    wrapper.style.alignItems = "center";
    wrapper.style.marginTop = "10px";
    
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.style.background = "#dc3545";
    removeBtn.style.color = "white";
    removeBtn.style.border = "none";
    removeBtn.style.borderRadius = "50%";
    removeBtn.style.width = "30px";
    removeBtn.style.height = "30px";
    removeBtn.style.cursor = "pointer";
    removeBtn.onclick = () => wrapper.remove();
    
    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    container.appendChild(wrapper);
  } else {
    container.appendChild(input);
  }
  
  showToast("✅ নতুন ছবির ফিল্ড যোগ করা হয়েছে।");
}

export function addCustomField() {
  const container = document.getElementById("customFields");
  const currentFields = container.querySelectorAll(".custom-field-group");
  
  if (currentFields.length >= 10) {
    showToast("⚠️ সর্বোচ্চ ১০টি কাস্টম ফিল্ড যোগ করা যাবে।");
    return;
  }
  
  const group = document.createElement("div");
  group.className = "custom-field-group";
  group.style.display = "flex";
  group.style.gap = "10px";
  group.style.alignItems = "center";
  group.style.marginTop = "10px";
  
  group.innerHTML = `
    <input type="text" class="custom-key" placeholder="শিরোনাম (যেমন: ওয়ারেন্টি)" style="flex: 1;">
    <input type="text" class="custom-value" placeholder="মান (যেমন: ৬ মাস)" style="flex: 1;">
    <button type="button" onclick="this.parentElement.remove(); showToast('কাস্টম ফিল্ড মুছে ফেলা হয়েছে।')" 
            style="background:#dc3545;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(group);
  showToast("✅ নতুন কাস্টম ফিল্ড যোগ করা হয়েছে।");
}

export function saveDraft() {
  const draft = {
    id: localStorage.getItem("editDraftId") || Date.now(),
    timestamp: new Date().toISOString(),
    name: getVal("name"), 
    code: getVal("code"), 
    price: getVal("price"), 
    offer: getVal("offer"),
    unit: getVal("unit"),
    qty: getVal("qty"),
    brand: getVal("brand"), 
    size: getVal("size"), 
    color: getVal("color"),
    delivery: getVal("delivery"), 
    status: getVal("status"), 
    category: getVal("category"),
    desc: getVal("desc"), 
    video: getVal("video"), 
    wa: getVal("wa"),
    images: [...document.querySelectorAll(".img-url")].map(i => i.value.trim()).filter(Boolean),
    customFields: [...document.querySelectorAll(".custom-field-group")].map(group => ({
      key: group.querySelector(".custom-key").value.trim(),
      value: group.querySelector(".custom-value").value.trim()
    })).filter(field => field.key && field.value),
    verified: false
  };

  let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const index = drafts.findIndex(d => d.id == draft.id);
  
  if (index !== -1) {
    drafts[index] = { ...drafts[index], ...draft };
  } else {
    drafts.push(draft);
  }
  
  localStorage.setItem("drafts", JSON.stringify(drafts));
  localStorage.removeItem("editDraftId");
}

export function loadDraftToForm(id) {
  const draft = JSON.parse(localStorage.getItem("drafts") || "[]").find(d => d.id == id);
  if (!draft) return;
  
  localStorage.setItem("editDraftId", id);
  
  // Clear existing form
  document.getElementById("imageInputs").innerHTML = '<input type="url" class="img-url" placeholder="ছবির লিংক (Image URL)">';
  document.getElementById("customFields").innerHTML = '<div class="custom-field-group"><input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি"><input type="text" class="custom-value" placeholder="মান যেমন: ৩ মাস"></div>';
  
  // Load basic fields
  const fieldIds = ['name', 'code', 'price', 'offer', 'unit', 'qty', 'brand', 'size', 'color', 'delivery', 'status', 'category', 'desc', 'video', 'wa'];
  fieldIds.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element && draft[fieldId]) {
      element.value = draft[fieldId];
    }
  });

  // Load images
  const imgContainer = document.getElementById("imageInputs");
  imgContainer.innerHTML = "";
  if (draft.images && draft.images.length > 0) {
    draft.images.forEach((url, index) => {
      if (index === 0) {
        const input = document.createElement("input");
        input.type = "url";
        input.className = "img-url";
        input.placeholder = "ছবির লিংক (Image URL)";
        input.value = url;
        imgContainer.appendChild(input);
      } else {
        addImageInput();
        const inputs = imgContainer.querySelectorAll(".img-url");
        inputs[inputs.length - 1].value = url;
      }
    });
  } else {
    const input = document.createElement("input");
    input.type = "url";
    input.className = "img-url";
    input.placeholder = "ছবির লিংক (Image URL)";
    imgContainer.appendChild(input);
  }

  // Load custom fields
  const customContainer = document.getElementById("customFields");
  customContainer.innerHTML = "";
  if (draft.customFields && draft.customFields.length > 0) {
    draft.customFields.forEach(field => {
      addCustomField();
      const groups = customContainer.querySelectorAll(".custom-field-group");
      const lastGroup = groups[groups.length - 1];
      lastGroup.querySelector(".custom-key").value = field.key;
      lastGroup.querySelector(".custom-value").value = field.value;
    });
  } else {
    addCustomField();
  }
  
  showToast("✅ ড্রাফট লোড করা হয়েছে।");
}

export function applyFieldVisibility() {
  const fieldVisibility = JSON.parse(localStorage.getItem("fieldVisibility") || "{}");
  
  const fieldMapping = {
    offer: "offer",
    unit: "unit", 
    qty: "qty",
    brand: "brand",
    size: "size",
    color: "color",
    delivery: "delivery",
    status: "status",
    category: "category",
    desc: "desc",
    video: "video",
    customFields: "customFields"
  };

  Object.keys(fieldMapping).forEach(fieldKey => {
    const element = document.getElementById(fieldMapping[fieldKey]);
    if (element) {
      if (fieldVisibility[fieldKey] === false) {
        element.style.display = "none";
        // Also hide the label if it exists
        const label = document.querySelector(`label[for="${fieldMapping[fieldKey]}"]`);
        if (label) label.style.display = "none";
      } else {
        element.style.display = "";
        const label = document.querySelector(`label[for="${fieldMapping[fieldKey]}"]`);
        if (label) label.style.display = "";
      }
    }
  });

  // Handle custom fields buttons
  const addCustomBtn = document.querySelector('button[onclick*="addCustomField"]');
  const addImageBtn = document.querySelector('button[onclick*="addImageField"]');
  
  if (fieldVisibility.customFields === false && addCustomBtn) {
    addCustomBtn.style.display = "none";
  } else if (addCustomBtn) {
    addCustomBtn.style.display = "";
  }
}

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
`;
document.head.appendChild(style);

