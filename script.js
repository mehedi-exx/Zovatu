// ✅ Enhanced G9Tool JavaScript v4.0 with Modern Features

// ✅ Enhanced Toast Notification with Animation
function showToast(message, type = 'success') {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = 'toast';
  
  // Different colors for different types
  const colors = {
    success: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    error: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
    info: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    warning: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)'
  };
  
  toast.style.background = colors[type] || colors.success;
  document.body.appendChild(toast);
  
  // Auto remove with fade out animation
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add slide out animation
const style = document.createElement('style');
style.textContent = `
  @keyframes toastSlideOut {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ✅ Enhanced Utility Functions
const getVal = id => document.getElementById(id)?.value.trim();
const setVal = (id, val) => {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
};

// ✅ Loading State Management
function setLoadingState(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<span class="loading-spinner"></span> প্রক্রিয়াকরণ...`;
  } else {
    button.disabled = false;
    button.innerHTML = button.getAttribute('data-original-text');
  }
}

// ✅ Enhanced Form Validation
function validateForm() {
  const name = getVal("name");
  const code = getVal("code");
  const price = parseFloat(getVal("price"));
  const wa = getVal("wa");
  const imgs = document.querySelectorAll(".img-url");
  const firstImg = imgs[0]?.value.trim();

  const errors = [];

  if (!name) errors.push("প্রোডাক্ট নাম");
  if (!code) errors.push("প্রোডাক্ট কোড");
  if (!price || isNaN(price)) errors.push("সঠিক মূল্য");
  if (!firstImg) errors.push("প্রথম ছবির লিংক");
  if (!wa) errors.push("WhatsApp নম্বর");

  if (errors.length > 0) {
    showToast(`অনুপস্থিত: ${errors.join(", ")}`, 'error');
    return false;
  }

  // Validate WhatsApp number format
  if (!/^880\d{10}$/.test(wa.replace(/\D/g, ''))) {
    showToast("WhatsApp নম্বর সঠিক ফরম্যাটে দিন (8801XXXXXXXXXX)", 'warning');
    return false;
  }

  return true;
}

// ✅ Enhanced Generate Product HTML with Loading
document.getElementById("generateBtn").addEventListener("click", async () => {
  const generateBtn = document.getElementById("generateBtn");
  generateBtn.setAttribute('data-original-text', generateBtn.innerHTML);
  
  if (!validateForm()) return;
  
  setLoadingState(generateBtn, true);
  
  // Simulate processing time for better UX
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const name = getVal("name"), code = getVal("code"), price = parseFloat(getVal("price"));
    const offer = parseFloat(getVal("offer")), brand = getVal("brand"), size = getVal("size");
    const color = getVal("color"), delivery = getVal("delivery"), status = getVal("status");
    const category = getVal("category"), desc = getVal("desc"), video = getVal("video");
    const wa = getVal("wa");
    const imgs = document.querySelectorAll(".img-url");

    const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;

    const mainImg = imgs[0].value.trim();
    let thumbHTML = "";
    imgs.forEach((input, i) => {
      const url = input.value.trim();
      if (url) {
        thumbHTML += `<img src="${url}" style="width:60px;height:60px;border-radius:8px;cursor:pointer;border:2px solid ${i === 0 ? '#00bfff' : 'transparent'};transition:all 0.3s ease;margin:2px;" onclick="switchMainImage(this, '${url}')" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">`;
      }
    });

    let customHTML = "";
    document.querySelectorAll(".custom-field-group").forEach(group => {
      const key = group.querySelector(".custom-key").value.trim();
      const value = group.querySelector(".custom-value").value.trim();
      if (key && value) {
        customHTML += `<li style="margin:5px 0;padding:5px;background:rgba(0,191,255,0.1);border-radius:5px;">🔧 ${key}: <strong>${value}</strong></li>`;
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
        videoEmbed = `<div style="margin-top:15px;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.3);"><iframe width="100%" height="250" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe></div>`;
      }
    }

    const html = `
<div style="text-align:center;font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:linear-gradient(135deg,#f8f9fa 0%,#e9ecef 100%);border-radius:15px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,0.1);">
  <img id="mainImg" src="${mainImg}" style="width:100%;max-width:500px;border-radius:15px;border:3px solid #00bfff;margin-bottom:15px;transition:all 0.3s ease;box-shadow:0 8px 25px rgba(0,0,0,0.15);" onload="this.style.opacity='1'" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
  <div id="thumbs" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:15px;padding:10px;background:rgba(255,255,255,0.5);border-radius:10px;">${thumbHTML}</div>
  <h2 style="margin:10px 0;color:#2c3e50;font-size:28px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,0.1);">${name}</h2>
  <p style="font-size:22px;margin:15px 0;">
    ${offer ? `<span style="text-decoration:line-through;color:#6c757d;margin-right:10px;font-size:18px;">৳${price}</span><span style="color:#e74c3c;font-weight:bold;font-size:26px;">৳${offer}</span><small style="color:#27ae60;font-weight:600;background:#d4edda;padding:2px 8px;border-radius:15px;margin-left:8px;">-${discount}% ছাড়</small>` : `<span style="color:#e74c3c;font-weight:bold;font-size:26px;">৳${price}</span>`}
  </p>
  <div style="margin:25px 0;">
    <a href="https://wa.me/${wa}?text=📦 আমি একটি পণ্য অর্ডার করতে চাই%0A🔖 প্রোডাক্ট: ${name}%0A💰 মূল্য: ${offer || price}৳%0A🧾 কোড: ${code}%0A📁 ক্যাটাগরি: ${category}%0A🚚 ডেলিভারি: ${delivery}" 
       target="_blank"
       style="display:inline-block;background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);color:#fff;padding:16px 40px;border-radius:50px;font-weight:bold;font-size:18px;text-decoration:none;box-shadow: 0 6px 20px rgba(37,211,102,0.3);transition: all 0.3s ease;text-transform:uppercase;letter-spacing:1px;"
       onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 25px rgba(37,211,102,0.4)'"
       onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 6px 20px rgba(37,211,102,0.3)'">
      🛒 অর্ডার করুন
    </a>
  </div>
  <ul style="list-style:none;padding:0;margin:20px auto;text-align:left;max-width:500px;background:rgba(255,255,255,0.7);border-radius:12px;padding:20px;">
    ${code ? `<li style="margin:8px 0;padding:8px;background:rgba(0,123,255,0.1);border-radius:6px;border-left:4px solid #007bff;">🔢 <strong>কোড:</strong> ${code}</li>` : ""}
    ${status ? `<li style="margin:8px 0;padding:8px;background:rgba(40,167,69,0.1);border-radius:6px;border-left:4px solid #28a745;">📦 <strong>স্ট্যাটাস:</strong> ${status}</li>` : ""}
    ${category ? `<li style="margin:8px 0;padding:8px;background:rgba(255,193,7,0.1);border-radius:6px;border-left:4px solid #ffc107;">📁 <strong>ক্যাটাগরি:</strong> ${category}</li>` : ""}
    ${delivery ? `<li style="margin:8px 0;padding:8px;background:rgba(23,162,184,0.1);border-radius:6px;border-left:4px solid #17a2b8;">🚚 <strong>ডেলিভারি:</strong> ${delivery}</li>` : ""}
    ${brand ? `<li style="margin:8px 0;padding:8px;background:rgba(108,117,125,0.1);border-radius:6px;border-left:4px solid #6c757d;">🏷️ <strong>ব্র্যান্ড:</strong> ${brand}</li>` : ""}
    ${(size || color) ? `<li style="margin:8px 0;padding:8px;background:rgba(220,53,69,0.1);border-radius:6px;border-left:4px solid #dc3545;">📐 <strong>সাইজ:</strong> ${size || "N/A"} | 🎨 <strong>রঙ:</strong> ${color || "N/A"}</li>` : ""}
    ${customHTML}
  </ul>
  ${desc ? `<div style="border:2px solid #dee2e6;padding:20px;border-radius:12px;max-width:500px;margin:20px auto;background:rgba(255,255,255,0.8);"><p style="margin:0;color:#495057;line-height:1.6;"><strong style="color:#2c3e50;">বিবরণ:</strong><br><br>${desc}</p></div>` : ""}
  ${videoEmbed}
  <p style="display:none;"><a href="#">{getProduct} $price={৳${offer || price}} $sale={৳${price}} $style={1}</a></p>
</div>

<script>
function switchMainImage(thumb, url) {
  document.getElementById('mainImg').src = url;
  document.querySelectorAll('#thumbs img').forEach(img => img.style.border = '2px solid transparent');
  thumb.style.border = '2px solid #00bfff';
}
</script>
`;

    document.getElementById("output").textContent = html;
    document.getElementById("preview").innerHTML = html;
    saveDraft();
    showToast("✅ প্রোডাক্ট সফলভাবে তৈরি হয়েছে!", 'success');
    
  } catch (error) {
    showToast("❌ প্রোডাক্ট তৈরিতে সমস্যা হয়েছে", 'error');
    console.error(error);
  } finally {
    setLoadingState(generateBtn, false);
  }
});

// ✅ Enhanced Add Image Input with Animation
function addImageInput() {
  const container = document.getElementById("imageInputs");
  const currentInputs = container.querySelectorAll(".img-url");
  
  if (currentInputs.length >= 5) {
    showToast("সর্বোচ্চ ৫টি ছবি যোগ করা যাবে", 'warning');
    return;
  }
  
  const input = document.createElement("input");
  input.type = "url";
  input.className = "img-url";
  input.placeholder = `ছবির লিংক ${currentInputs.length + 1} (Image URL)`;
  input.style.opacity = "0";
  input.style.transform = "translateY(-10px)";
  
  container.appendChild(input);
  
  // Animate in
  setTimeout(() => {
    input.style.transition = "all 0.3s ease";
    input.style.opacity = "1";
    input.style.transform = "translateY(0)";
  }, 10);
  
  showToast("নতুন ছবির ক্ষেত্র যোগ করা হয়েছে", 'info');
}

// ✅ Enhanced Add Custom Field with Animation
function addCustomField() {
  const container = document.getElementById("customFields");
  const currentFields = container.querySelectorAll(".custom-field-group");
  
  if (currentFields.length >= 10) {
    showToast("সর্বোচ্চ ১০টি কাস্টম ফিল্ড যোগ করা যাবে", 'warning');
    return;
  }
  
  const group = document.createElement("div");
  group.className = "custom-field-group";
  group.style.opacity = "0";
  group.style.transform = "translateY(-10px)";
  group.innerHTML = `
    <input type="text" class="custom-key" placeholder="শিরোনাম (যেমন: ওয়ারেন্টি)">
    <input type="text" class="custom-value" placeholder="মান (যেমন: ৬ মাস)">
    <button type="button" onclick="removeCustomField(this)" style="background:#dc3545;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;font-size:14px;" title="মুছে ফেলুন">🗑️</button>
  `;
  
  container.appendChild(group);
  
  // Animate in
  setTimeout(() => {
    group.style.transition = "all 0.3s ease";
    group.style.opacity = "1";
    group.style.transform = "translateY(0)";
  }, 10);
  
  showToast("নতুন কাস্টম ফিল্ড যোগ করা হয়েছে", 'info');
}

// ✅ Remove Custom Field with Animation
function removeCustomField(button) {
  const group = button.parentElement;
  group.style.transition = "all 0.3s ease";
  group.style.opacity = "0";
  group.style.transform = "translateY(-10px)";
  
  setTimeout(() => {
    group.remove();
    showToast("কাস্টম ফিল্ড মুছে ফেলা হয়েছে", 'info');
  }, 300);
}

// ✅ Enhanced Copy Output Button with Animation
document.getElementById("copyBtn")?.addEventListener("click", async () => {
  const copyBtn = document.getElementById("copyBtn");
  const output = document.getElementById("output").textContent;
  
  if (!output.trim()) {
    showToast("কপি করার জন্য কোনো কন্টেন্ট নেই", 'warning');
    return;
  }
  
  copyBtn.setAttribute('data-original-text', copyBtn.innerHTML);
  setLoadingState(copyBtn, true);
  
  try {
    await navigator.clipboard.writeText(output);
    showToast("✅ সফলভাবে কপি করা হয়েছে!", 'success');
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = output;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast("✅ কপি করা হয়েছে!", 'success');
  } finally {
    setTimeout(() => setLoadingState(copyBtn, false), 500);
  }
});

// ✅ Enhanced Save Draft with Auto-save
function saveDraft() {
  const draft = {
    id: localStorage.getItem("editDraftId") || Date.now(),
    timestamp: new Date().toISOString(),
    name: getVal("name"), 
    code: getVal("code"), 
    price: getVal("price"), 
    offer: getVal("offer"),
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
      key: group.querySelector(".custom-key")?.value.trim() || "",
      value: group.querySelector(".custom-value")?.value.trim() || ""
    })).filter(field => field.key && field.value)
  };

  let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
  const index = drafts.findIndex(d => d.id == draft.id);
  
  if (index !== -1) {
    drafts[index] = draft;
  } else {
    drafts.unshift(draft); // Add to beginning
  }
  
  // Keep only last 20 drafts
  if (drafts.length > 20) {
    drafts = drafts.slice(0, 20);
  }
  
  localStorage.setItem("drafts", JSON.stringify(drafts));
  localStorage.removeItem("editDraftId");
}

// ✅ Auto-save functionality
let autoSaveTimeout;
function autoSave() {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    const name = getVal("name");
    if (name) { // Only auto-save if there's a product name
      saveDraft();
      console.log("Auto-saved draft");
    }
  }, 2000); // Auto-save after 2 seconds of inactivity
}

// Add auto-save listeners to form inputs
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', autoSave);
  });
});

// ✅ Enhanced Load Draft to Form
function loadDraftToForm(id) {
  const draft = JSON.parse(localStorage.getItem("drafts") || "[]").find(d => d.id == id);
  if (!draft) {
    showToast("ড্রাফট খুঁজে পাওয়া যায়নি", 'error');
    return;
  }

  // Load basic fields
  for (let key in draft) {
    if (typeof draft[key] === "string" && key !== 'timestamp') {
      setVal(key, draft[key]);
    }
  }

  // Load images
  const imgContainer = document.getElementById("imageInputs");
  imgContainer.innerHTML = "";
  (draft.images || []).forEach((url, index) => {
    const input = document.createElement("input");
    input.type = "url";
    input.className = "img-url";
    input.placeholder = `ছবির লিংক ${index + 1} (Image URL)`;
    input.value = url;
    imgContainer.appendChild(input);
  });

  // Load custom fields
  const customContainer = document.getElementById("customFields");
  customContainer.innerHTML = "";
  (draft.customFields || []).forEach(field => {
    const group = document.createElement("div");
    group.className = "custom-field-group";
    group.innerHTML = `
      <input type="text" class="custom-key" value="${field.key}" placeholder="শিরোনাম">
      <input type="text" class="custom-value" value="${field.value}" placeholder="মান">
      <button type="button" onclick="removeCustomField(this)" style="background:#dc3545;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;font-size:14px;" title="মুছে ফেলুন">🗑️</button>
    `;
    customContainer.appendChild(group);
  });

  localStorage.setItem("editDraftId", id);
  showToast("ড্রাফট লোড করা হয়েছে", 'success');
}

// ✅ Enhanced Field Visibility Control
function applyFieldVisibility() {
  const hiddenFields = JSON.parse(localStorage.getItem("hiddenFields") || "[]");
  hiddenFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "none";
      el.style.opacity = "0";
    }
  });
}

// ✅ Reset Form with Confirmation
function resetForm() {
  if (confirm("আপনি কি নিশ্চিত যে সব তথ্য মুছে ফেলতে চান?")) {
    document.querySelectorAll('input, textarea').forEach(input => {
      input.value = '';
    });
    
    // Reset image inputs to just one
    const imgContainer = document.getElementById("imageInputs");
    imgContainer.innerHTML = '<input type="url" class="img-url" placeholder="ছবির লিংক (Image URL)">';
    
    // Reset custom fields
    const customContainer = document.getElementById("customFields");
    customContainer.innerHTML = `
      <div class="custom-field-group">
        <input type="text" class="custom-key" placeholder="শিরোনাম যেমন: ওয়ারেন্টি">
        <input type="text" class="custom-value" placeholder="মান যেমন: ৩ মাস">
      </div>
    `;
    
    // Clear output and preview
    document.getElementById("output").textContent = '';
    document.getElementById("preview").innerHTML = '';
    
    localStorage.removeItem("editDraftId");
    showToast("ফর্ম রিসেট করা হয়েছে", 'info');
  }
}

// ✅ Enhanced Page Load Handler
window.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (!localStorage.getItem("loggedInUser")) {
    window.location.replace("index.html");
    return;
  }
  
  // Apply field visibility
  applyFieldVisibility();
  
  // Load draft if editing
  const draftId = localStorage.getItem("editDraftId");
  if (draftId) {
    loadDraftToForm(draftId);
  }
  
  // Add reset button if it doesn't exist
  if (!document.getElementById("resetBtn")) {
    const resetBtn = document.createElement("button");
    resetBtn.id = "resetBtn";
    resetBtn.innerHTML = '<i class="fas fa-undo"></i> রিসেট';
    resetBtn.onclick = resetForm;
    
    const generateBtn = document.getElementById("generateBtn");
    generateBtn.parentNode.insertBefore(resetBtn, generateBtn.nextSibling);
  }
  
  // Set original button texts for loading states
  document.querySelectorAll('button').forEach(btn => {
    if (!btn.getAttribute('data-original-text')) {
      btn.setAttribute('data-original-text', btn.innerHTML);
    }
  });
  
  console.log("G9Tool Enhanced v4.0 loaded successfully!");
});

// ✅ Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter to generate
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    document.getElementById("generateBtn").click();
  }
  
  // Ctrl+S to save draft
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveDraft();
    showToast("ড্রাফট সংরক্ষিত হয়েছে", 'info');
  }
  
  // Escape to close sidebar
  if (e.key === 'Escape') {
    const sidebar = document.getElementById("sidebar");
    if (sidebar && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
    }
  }
});

// ✅ Export functions for global access
window.addImageInput = addImageInput;
window.addCustomField = addCustomField;
window.removeCustomField = removeCustomField;
window.loadDraftToForm = loadDraftToForm;
window.resetForm = resetForm;

