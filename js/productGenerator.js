import { getVal, showToast } from './utils.js';

// Helper function to validate URLs
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function generateProduct() {
  const name = getVal("name"), code = getVal("code"), price = parseFloat(getVal("price"));
  const offer = parseFloat(getVal("offer")), unit = getVal("unit"), qty = getVal("qty");
  const brand = getVal("brand"), size = getVal("size"), color = getVal("color");
  const delivery = getVal("delivery"), status = getVal("status"), category = getVal("category");
  const desc = getVal("desc"), video = getVal("video"), wa = getVal("wa");
  const imgs = document.querySelectorAll(".img-url");

  // Enhanced validation with specific error messages
  const errors = [];
  
  if (!name) errors.push("প্রোডাক্ট নাম");
  if (!code) errors.push("প্রোডাক্ট কোড");
  if (isNaN(price) || price <= 0) errors.push("সঠিক প্রাইস");
  if (!imgs[0]?.value.trim()) errors.push("প্রথম ছবির লিংক");
  if (!wa) errors.push("WhatsApp নম্বর");

  if (errors.length > 0) {
    showToast(`<i class="fas fa-exclamation-triangle"></i> অনুগ্রহ করে ${errors.join(", ")} দিন।`, "error");
    highlightMissingFields();
    return;
  }

  // Enhanced WhatsApp number validation
  if (!wa.match(/^8801[0-9]{9}$/)) {
    showToast('<i class="fas fa-exclamation-triangle"></i> WhatsApp নম্বর সঠিক ফরম্যাটে দিন (8801XXXXXXXXX)', "error");
    document.getElementById("wa").focus();
    return;
  }

  // Validate image URLs
  const invalidImages = [];
  imgs.forEach((input, index) => {
    const url = input.value.trim();
    if (url && !isValidURL(url)) {
      invalidImages.push(`ছবি ${index + 1}`);
    }
  });

  if (invalidImages.length > 0) {
    showToast(`<i class="fas fa-exclamation-triangle"></i> ${invalidImages.join(", ")} এর লিংক সঠিক নয়।`, "error");
    return;
  }

  // Validate offer price
  if (offer && (isNaN(offer) || offer >= price)) {
    showToast('<i class="fas fa-exclamation-triangle"></i> অফার প্রাইস মূল প্রাইসের চেয়ে কম হতে হবে।', "error");
    document.getElementById("offer").focus();
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

  // Generate HTML based on selected theme
  let html = generateOldVersionTheme();

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
  saveDraft();
  showToast('<i class="fas fa-check-circle"></i> প্রোডাক্ট সফলভাবে তৈরি হয়েছে!', "success");
  
  // Enhanced success animation with multiple visual feedback
  const generateBtn = document.getElementById("generateBtn");
  const originalContent = generateBtn.innerHTML;
  const originalBackground = generateBtn.style.background;
  
  // Success state with animation
  generateBtn.style.background = "linear-gradient(135deg, #28a745, #20c997)";
  generateBtn.innerHTML = '<i class="fas fa-check"></i> সম্পন্ন!';
  generateBtn.style.transform = "scale(1.05)";
  generateBtn.style.boxShadow = "0 6px 20px rgba(40, 167, 69, 0.4)";
  
  // Add pulse animation
  generateBtn.style.animation = "pulse 0.6s ease-in-out";
  
  // Reset after animation
  setTimeout(() => {
    generateBtn.style.background = originalBackground;
    generateBtn.innerHTML = originalContent;
    generateBtn.style.transform = "";
    generateBtn.style.boxShadow = "";
    generateBtn.style.animation = "";
  }, 2500);

  // Scroll to preview section smoothly
  const previewSection = document.getElementById("preview");
  if (previewSection) {
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Theme generation functions
  function generateOldVersionTheme() {
    return `
<div style="text-align:center;">
  <img id="mainImg" src="${mainImg}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">
  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">${thumbHTML}</div>

  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:18px;">
    ${offer ? `<span style="text-decoration:line-through;color:#aaa;margin-right:6px;">৳${price.toLocaleString()}</span><span style="color:red;font-weight:bold;">৳${offer.toLocaleString()}</span><small style="color:limegreen;">(-${discount}%)</small>` : `<span style="color:red;font-weight:bold;">৳${price.toLocaleString()}</span>`}
  </p>

  <div style="margin:20px 0;">
    <a href="https://wa.me/${wa}?text=${encodeURIComponent(`📦 আমি একটি পণ্য অর্ডার করতে চাই\n🔖 প্রোডাক্ট: ${name}\n💰 মূল্য: ${offer || price}৳\n🧾 কোড: ${code}\n📁 ক্যাটাগরি: ${category}\n🚚 ডেলিভারি: ${delivery}`)}" 
       target="_blank"
       style="display:inline-block;background: linear-gradient(135deg, #25D366, #128C7E);color:#fff;padding:14px 32px;border-radius:50px;font-weight:bold;font-size:17px;text-decoration:none;box-shadow: 0 4px 10px rgba(0,0,0,0.15);transition: all 0.3s ease;">
      Order Now
    </a>
  </div>
  <ul style="list-style:none;padding:0;margin:15px auto;text-align:left;max-width:500px;">
    ${code ? `<li><i class="fas fa-hashtag"></i> কোড: ${code}</li>` : ''}
    ${status ? `<li><i class="fas fa-box"></i> স্ট্যাটাস: ${status}</li>` : ''}
    ${category ? `<li><i class="fas fa-folder"></i> ক্যাটাগরি: ${category}</li>` : ''}
    ${delivery ? `<li><i class="fas fa-truck"></i> ডেলিভারি টাইম: ${delivery}</li>` : ''}
    ${customHTML}
  </ul>
  ${desc ? `<div style="border:1px solid #eee;padding:15px;border-radius:10px;max-width:500px;margin:auto;margin-bottom:20px;"><p style="margin:0;"><strong>Description:</strong><br>${desc}</p></div>` : ''}
  ${videoEmbed ? videoEmbed.replace(/border-radius:10px/g, 'border-radius:10px;max-width:500px;margin:auto;').replace(/background:#f8f9fa/g, 'background:#f5f5f5') : ''}
  
  <p style="display:none;"><a href="#">{getProduct} $price={৳${price}} $sale={৳${offer}} $style={1}</a></p>
</div>

<script>
function changeMainImage(thumb, src) {
  document.getElementById('mainImg').src = src;
  document.querySelectorAll('#thumbs img').forEach(img => img.style.border = '2px solid transparent');
  thumb.style.border = '2px solid green';
}
</script>`;
  }
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
    showToast('<i class="fas fa-exclamation-triangle"></i> সর্বোচ্চ ৫টি ছবি যোগ করা যাবে।');
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
  
  showToast('<i class="fas fa-check-circle"></i> নতুন ছবির ফিল্ড যোগ করা হয়েছে।');
}

export function addCustomField() {
  const container = document.getElementById("customFields");
  const currentFields = container.querySelectorAll(".custom-field-group");
  
  if (currentFields.length >= 10) {
    showToast('<i class="fas fa-exclamation-triangle"></i> সর্বোচ্চ ১০টি কাস্টম ফিল্ড যোগ করা যাবে।');
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
  showToast('<i class="fas fa-check-circle"></i> নতুন কাস্টম ফিল্ড যোগ করা হয়েছে।');
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
  
  showToast('<i class="fas fa-check-circle"></i> ড্রাফট লোড করা হয়েছে।');
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


