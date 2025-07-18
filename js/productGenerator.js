import { showToast } from './utils.js';

// Helper function to get element value
function getVal(id) {
  return document.getElementById(id)?.value.trim() || '';
}

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
  const currency = localStorage.getItem("selectedCurrency") || "৳"; // Get selected currency
  const whatsappLang = localStorage.getItem("whatsappLanguage") || "en"; // Get selected WhatsApp language

  // Enhanced validation with specific error messages
  const errors = [];
  
  if (!name) errors.push("Product Name");
  if (!code) errors.push("Product Code");
  if (isNaN(price) || price <= 0) errors.push("Valid Price");
  if (!imgs[0]?.value.trim()) errors.push("First Image Link");
  if (!wa) errors.push("WhatsApp Number");

  if (errors.length > 0) {
    showToast(`Please provide ${errors.join(", ")}.`, "error");
    highlightMissingFields();
    return;
  }

  // Enhanced WhatsApp number validation
  if (!wa.match(/^8801[0-9]{9}$/)) {
    showToast("Please provide WhatsApp number in correct format (8801XXXXXXXXX)", "error");
    document.getElementById("wa").focus();
    return;
  }

  // Validate image URLs
  const invalidImages = [];
  imgs.forEach((input, index) => {
    const url = input.value.trim();
    if (url && !isValidURL(url)) {
      invalidImages.push(`Image ${index + 1}`);
    }
  });

  if (invalidImages.length > 0) {
    showToast(`${invalidImages.join(", ")} link(s) are not valid.`, "error");
    return;
  }

  // Validate offer price
  if (offer && (isNaN(offer) || offer >= price)) {
    showToast("Offer price must be less than the main price.", "error");
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
      customHTML += `<li><strong>${key}:</strong> ${value}</li>`;
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
          <h3 style="margin:0 0 10px 0;color:#333;">Product Video</h3>
          <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
            <iframe src="https://www.youtube.com/embed/${videoId}" 
                    style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:8px;" 
                    allowfullscreen></iframe>
          </div>
        </div>`;
    }
  }

  // WhatsApp message content based on selected language
  let whatsappMessage;
  if (whatsappLang === "en") {
    whatsappMessage = `I want to order a product\nProduct: ${name}\nPrice: ${currency}${offer || price}\nCode: ${code}${category ? `\nCategory: ${category}` : ''}${delivery ? `\nDelivery: ${delivery}` : ''}`;
  } else {
    whatsappMessage = `আমি একটি পণ্য অর্ডার করতে চাই\nপ্রোডাক্ট: ${name}\nমূল্য: ${currency}${offer || price}\nকোড: ${code}${category ? `\nক্যাটাগরি: ${category}` : ''}${delivery ? `\nডেলিভারি: ${delivery}` : ''}`;
  }

  // Generate HTML based on selected theme
  let html = generateOldVersionTheme(currency, whatsappMessage);

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
  saveDraft();
  showToast("Product generated successfully!", "success");
  
  // Enhanced success animation with multiple visual feedback
  const generateBtn = document.getElementById("generateBtn");
  const originalContent = generateBtn.innerHTML;
  const originalBackground = generateBtn.style.background;
  
  // Success state with animation
  generateBtn.style.background = "linear-gradient(135deg, #28a745, #20c997)";
  generateBtn.innerHTML = "Complete!";
  generateBtn.style.transform = "scale(1.02)";
  generateBtn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
  
  // Reset after animation
  setTimeout(() => {
    generateBtn.style.background = originalBackground;
    generateBtn.innerHTML = originalContent;
    generateBtn.style.transform = "";
    generateBtn.style.boxShadow = "";
  }, 1500);

  // Scroll to preview section smoothly
  const previewSection = document.getElementById("preview");
  if (previewSection) {
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Theme generation functions
  function generateOldVersionTheme(currencySymbol, whatsappMsg) {
    return `
<div style="text-align:center;">
  <img id="mainImg" src="${mainImg}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">
  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">${thumbHTML}</div>

  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:18px;">
    ${offer ? `<span style="text-decoration:line-through;color:#aaa;margin-right:6px;">${currencySymbol}${price.toLocaleString()}</span><span style="color:red;font-weight:bold;">${currencySymbol}${offer.toLocaleString()}</span><small style="color:limegreen;">(-${discount}%)</small>` : `<span style="color:red;font-weight:bold;">${currencySymbol}${price.toLocaleString()}</span>`}
  </p>

  <div style="margin:20px 0;">
    <a href="https://wa.me/${wa}?text=${encodeURIComponent(whatsappMsg)}" 
       target="_blank"
       style="display:inline-block;background: linear-gradient(135deg, #25D366, #128C7E);color:#fff;padding:14px 32px;border-radius:50px;font-weight:bold;font-size:17px;text-decoration:none;box-shadow: 0 4px 10px rgba(0,0,0,0.15);transition: all 0.3s ease;">
      Order Now
    </a>
  </div>
  <ul style="list-style:none;padding:0;margin:15px auto;text-align:left;max-width:500px;">
    ${code ? `<li><strong>Code:</strong> ${code}</li>` : ''}
    ${unit ? `<li><strong>Unit:</strong> ${unit}</li>` : ''}
    ${qty ? `<li><strong>Quantity:</strong> ${qty}</li>` : ''}
    ${brand ? `<li><strong>Brand:</strong> ${brand}</li>` : ''}
    ${size ? `<li><strong>Size:</strong> ${size}</li>` : ''}
    ${color ? `<li><strong>Color:</strong> ${color}</li>` : ''}
    ${status ? `<li><strong>Status:</strong> ${status}</li>` : ''}
    ${category ? `<li><strong>Category:</strong> ${category}</li>` : ''}
    ${delivery ? `<li><strong>Delivery Time:</strong> ${delivery}</li>` : ''}
    ${customHTML}
  </ul>
  ${desc ? `<div style="border:1px solid #eee;padding:15px;border-radius:10px;max-width:500px;margin:auto;margin-bottom:20px;"><p style="margin:0;"><strong>Description:</strong><br>${desc}</p></div>` : ''}
  ${videoEmbed ? videoEmbed.replace(/border-radius:10px/g, 'border-radius:10px;max-width:500px;margin:auto;').replace(/background:#f8f9fa/g, 'background:#f5f5f5') : ''}
  
  <p style="display:none;"><a href="#">{getProduct} $price={${currencySymbol}${price}} $sale={${currencySymbol}${offer}} $style={1}</a></p>
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
    showToast("Maximum 5 images can be added.", "warning");
    return;
  }
  
  const input = document.createElement("input");
  input.type = "url";
  input.className = "img-url";
  input.placeholder = `Image URL ${currentInputs.length + 1}`;
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
    removeBtn.innerHTML = "×";
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
  
  showToast("New image field added.", "success");
}

export function addCustomField() {
  const container = document.getElementById("customFields");
  const currentFields = container.querySelectorAll(".custom-field-group");
  
  if (currentFields.length >= 10) {
    showToast("Maximum 10 custom fields can be added.", "warning");
    return;
  }
  
  const group = document.createElement("div");
  group.className = "custom-field-group";
  group.style.display = "flex";
  group.style.gap = "10px";
  group.style.alignItems = "center";
  group.style.marginTop = "10px";
  
  group.innerHTML = `
    <input type="text" class="custom-key" placeholder="Title (e.g., Warranty)" style="flex: 1;">
    <input type="text" class="custom-value" placeholder="Value (e.g., 6 Months)" style="flex: 1;">
    <button type="button" onclick="this.parentElement.remove(); showToast('Custom field removed.', 'success')" 
            style="background:#dc3545;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">
      ×
    </button>
  `;
  
  container.appendChild(group);
  showToast("New custom field added.", "success");
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
  document.getElementById("imageInputs").innerHTML = '<input type="url" class="img-url" placeholder="Image URL">';
  document.getElementById("customFields").innerHTML = '<div class="custom-field-group"><input type="text" class="custom-key" placeholder="Title (e.g., Warranty)"><input type="text" class="custom-value" placeholder="Value (e.g., 3 Months)"></div>';
  
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
        input.placeholder = "Image URL";
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
    input.placeholder = "Image URL";
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
  
  showToast("Draft loaded successfully.", "success");
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

