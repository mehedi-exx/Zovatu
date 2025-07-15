import { getVal, showToast, getStorageItem } from './utils.js';

export function generateProduct() {
  const name = getVal("name"), code = getVal("code"), price = parseFloat(getVal("price"));
  const offer = parseFloat(getVal("offer")), unit = getVal("unit"), qty = getVal("qty");
  const brand = getVal("brand"), size = getVal("size"), color = getVal("color");
  const delivery = getVal("delivery"), status = getVal("status"), category = getVal("category");
  const desc = getVal("desc"), video = getVal("video"), wa = getVal("wa");
  const imgs = document.querySelectorAll(".img-url");

  // Get selected currency from localStorage
  const selectedCurrency = getStorageItem("selectedCurrency", "৳");
  const selectedTheme = getStorageItem("selectedTheme", "old_version");
  const outputLanguage = getStorageItem("outputLanguage", "bn");

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
      thumbHTML += `\n        <img src="${url}" \n             style="width:60px;height:60px;border-radius:8px;cursor:pointer;\n                    border:3px solid ${i === 0 ? '#28a745' : 'transparent'};\n                    transition:all 0.3s ease;object-fit:cover;" \n             onclick="changeMainImage(this, '${url}')"\n             onmouseover="this.style.transform='scale(1.1)'"\n             onmouseout="this.style.transform='scale(1)'">`;
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
      videoEmbed = `\n        <div style="margin:20px 0;padding:15px;background:#f8f9fa;border-radius:10px;">\n          <h3 style="margin:0 0 10px 0;color:#333;"><i class="fab fa-youtube" style="color:#ff0000;margin-right:8px;"></i>প্রোডাক্ট ভিডিও</h3>\n          <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">\n            <iframe src="https://www.youtube.com/embed/${videoId}" \n                    style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:8px;" \n                    allowfullscreen></iframe>\n          </div>\n        </div>`;
    }
  }

  // Generate HTML based on selected theme
  let html = '';
  switch (selectedTheme) {
    case 'old_version':
      html = generateOldVersionTheme();
      break;
    case 'professional_v1':
      html = generateProfessionalV1Theme();
      break;
    case 'professional_v2':
      html = generateProfessionalV2Theme();
      break;
    default:
      html = generateOldVersionTheme();
  }

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

  // Theme generation functions
  function generateOldVersionTheme() {
    return `\n<div style="text-align:center;">\n  <img id="mainImg" src="${mainImg}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">\n  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">${thumbHTML}</div>\n\n  <h2 style="margin:5px 0;">${name}</h2>\n  <p style="font-size:18px;">\n    ${offer ? `<span style="text-decoration:line-through;color:#aaa;margin-right:6px;">${selectedCurrency}${price.toLocaleString()}</span><span style="color:red;font-weight:bold;">${selectedCurrency}${offer.toLocaleString()}</span><small style="color:limegreen;">(-${discount}%)</small>` : `<span style="color:red;font-weight:bold;">${selectedCurrency}${price.toLocaleString()}</span>`}\n  </p>\n\n  <div style="margin:20px 0;">\n    <a href="https://wa.me/${wa}?text=${encodeURIComponent(`📦 আমি একটি পণ্য অর্ডার করতে চাই\n🔖 প্রোডাক্ট: ${name}\n💰 মূল্য: ${offer || price}${selectedCurrency}\n🧾 কোড: ${code}\n📁 ক্যাটাগরি: ${category}\n🚚 ডেলিভারি: ${delivery}`)}" \n       target="_blank"\n       style="display:inline-block;background: linear-gradient(135deg, #25D366, #128C7E);color:#fff;padding:14px 32px;border-radius:50px;font-weight:bold;font-size:17px;text-decoration:none;box-shadow: 0 4px 10px rgba(0,0,0,0.15);transition: all 0.3s ease;">\n      Order Now\n    </a>\n  </div>\n  <ul style="list-style:none;padding:0;margin:15px auto;text-align:left;max-width:500px;">\n    ${code ? `<li>🔢 কোড: ${code}</li>` : ''}\n    ${status ? `<li>📦 স্ট্যাটাস: ${status}</li>` : ''}\n    ${category ? `<li>📁 ক্যাটাগরি: ${category}</li>` : ''}\n    ${delivery ? `<li>🚚 ডেলিভারি টাইম: ${delivery}</li>` : ''}\n    ${customHTML}\n  </ul>\n  ${desc ? `<div style="border:1px solid #eee;padding:15px;border-radius:10px;max-width:500px;margin:auto;margin-bottom:20px;"><p style="margin:0;"><strong>Description:</strong><br>${desc}</p></div>` : ''}\n  ${videoEmbed ? videoEmbed.replace(/border-radius:10px/g, 'border-radius:10px;max-width:500px;margin:auto;').replace(/background:#f8f9fa/g, 'background:#f5f5f5') : ''}\n  \n  <p style="display:none;"><a href="#">{getProduct} $price={${selectedCurrency}${price}} $sale={${selectedCurrency}${offer}} $style={1}</a></p>\n</div>\n\n<script>\nfunction changeMainImage(thumb, src) {\n  document.getElementById('mainImg').src = src;\n  document.querySelectorAll('#thumbs img').forEach(img => img.style.border = '2px solid transparent');\n  thumb.style.border = '2px solid green';\n}\n</script>`;
  }

  function generateProfessionalV1Theme() {
    return `\n<style>\n  .product-card-v1 {\n    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n    background-color: #282c34;\n    color: #e0e0e0;\n    border-radius: 12px;\n    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);\n    max-width: 550px;\n    margin: 20px auto;\n    overflow: hidden;\n    border: 1px solid #444;\n  }\n  .product-header-v1 {\n    background: linear-gradient(135deg, #61dafb, #21a1f1);\n    padding: 25px;\n    text-align: center;\n    color: white;\n    position: relative;\n  }\n  .product-header-v1 h2 {\n    margin: 0;\n    font-size: 2em;\n    text-shadow: 1px 1px 3px rgba(0,0,0,0.2);\n  }\n  .product-image-gallery-v1 {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    padding: 20px;\n    background-color: #1e2127;\n  }\n  .product-image-gallery-v1 #mainImg-v1 {\n    width: 100%;\n    max-width: 480px;\n    border-radius: 8px;\n    border: 2px solid #4CAF50;\n    margin-bottom: 15px;\n    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);\n  }\n  .product-image-gallery-v1 .thumbnails-v1 {\n    display: flex;\n    justify-content: center;\n    flex-wrap: wrap;\n    gap: 10px;\n  }\n  .product-image-gallery-v1 .thumbnails-v1 img {\n    width: 70px;\n    height: 70px;\n    border-radius: 6px;\n    cursor: pointer;\n    border: 2px solid transparent;\n    transition: all 0.3s ease;\n    object-fit: cover;\n  }\n  .product-image-gallery-v1 .thumbnails-v1 img.active-thumb-v1 {\n    border-color: #61dafb;\n    transform: scale(1.05);\n  }\n  .product-details-v1 {\n    padding: 25px;\n    line-height: 1.6;\n  }\n  .product-details-v1 .price-section-v1 {\n    font-size: 1.8em;\n    font-weight: bold;\n    color: #4CAF50;\n    margin-bottom: 15px;\n    text-align: center;\n  }\n  .product-details-v1 .price-section-v1 .old-price-v1 {\n    text-decoration: line-through;\n    color: #bbb;\n    font-size: 0.7em;\n    margin-right: 8px;\n  }\n  .product-details-v1 .price-section-v1 .discount-v1 {\n    color: #ffeb3b;\n    font-size: 0.7em;\n    margin-left: 8px;\n  }\n  .product-info-list-v1 {\n    list-style: none;\n    padding: 0;\n    margin: 20px 0;\n    background-color: #1e2127;\n    border-radius: 8px;\n    padding: 15px 20px;\n  }\n  .product-info-list-v1 li {\n    display: flex;\n    align-items: center;\n    margin-bottom: 10px;\n    color: #ccc;\n  }\n  .product-info-list-v1 li i {\n    color: #61dafb;\n    margin-right: 10px;\n    font-size: 1.1em;\n  }\n  .product-description-v1 {\n    background-color: #1e2127;\n    border-radius: 8px;\n    padding: 20px;\n    margin-top: 20px;\n    color: #ccc;\n  }\n  .product-description-v1 h3 {\n    color: #61dafb;\n    margin-top: 0;\n    margin-bottom: 15px;\n  }\n  .whatsapp-button-v1 {\n    display: block;\n    width: 80%;\n    max-width: 300px;\n    margin: 25px auto;\n    padding: 15px 20px;\n    background: linear-gradient(45deg, #25D366, #128C7E);\n    color: white;\n    text-align: center;\n    border-radius: 30px;\n    text-decoration: none;\n    font-size: 1.2em;\n    font-weight: bold;\n    transition: all 0.3s ease;\n    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);\n  }\n  .whatsapp-button-v1:hover {\n    transform: translateY(-3px);\n    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);\n  }\n  .video-embed-v1 {\n    margin-top: 20px;\n    background-color: #1e2127;\n    border-radius: 8px;\n    padding: 20px;\n  }\n  .video-embed-v1 h3 {\n    color: #61dafb;\n    margin-top: 0;\n    margin-bottom: 15px;\n  }\n  .video-embed-v1 iframe {\n    border-radius: 8px;\n  }\n</style>\n<div class="product-card-v1">\n  <div class="product-header-v1">\n    <h2 data-i18n="product_details">Product Details</h2>\n  </div>\n  <div class="product-image-gallery-v1">\n    <img id="mainImg-v1" src="${mainImg}" alt="Product Image">\n    <div class="thumbnails-v1">\n      ${imgs.map((input, i) => input.value.trim() ? `<img src="${input.value.trim()}" onclick="changeMainImageV1(this, '${input.value.trim()}')" class="${i === 0 ? 'active-thumb-v1' : ''}">` : '').join('')}\n    </div>\n  </div>\n  <div class="product-details-v1">\n    <h2 style="text-align:center; color:#e0e0e0; margin-bottom:10px;">${name}</h2>\n    <p class="price-section-v1">\n      ${offer ? `<span class="old-price-v1">${selectedCurrency}${price.toLocaleString()}</span> ${selectedCurrency}${offer.toLocaleString()} <span class="discount-v1">(-${discount}%)</span>` : `${selectedCurrency}${price.toLocaleString()}`}\n    </p>\n    <a href="https://wa.me/${wa}?text=${encodeURIComponent(`📦 Order: ${name}\n💰 Price: ${offer || price}${selectedCurrency}\n🧾 Code: ${code}\n`)}" target="_blank" class="whatsapp-button-v1">\n      <i class="fab fa-whatsapp"></i> Order on WhatsApp\n    </a>\n    <ul class="product-info-list-v1">\n      ${code ? `<li><i class="fas fa-barcode"></i> <strong>Code:</strong> ${code}</li>` : ''}\n      ${brand ? `<li><i class="fas fa-tag"></i> <strong>Brand:</strong> ${brand}</li>` : ''}\n      ${category ? `<li><i class="fas fa-folder"></i> <strong>Category:</strong> ${category}</li>` : ''}\n      ${unit ? `<li><i class="fas fa-box-open"></i> <strong>Unit:</strong> ${unit}</li>` : ''}\n      ${qty ? `<li><i class="fas fa-cubes"></i> <strong>Quantity:</strong> ${qty}</li>` : ''}\n      ${size ? `<li><i class="fas fa-ruler"></i> <strong>Size:</strong> ${size}</li>` : ''}\n      ${color ? `<li><i class="fas fa-palette"></i> <strong>Color:</strong> ${color}</li>` : ''}\n      ${delivery ? `<li><i class="fas fa-truck"></i> <strong>Delivery:</strong> ${delivery}</li>` : ''}\n      ${status ? `<li><i class="fas fa-info-circle"></i> <strong>Status:</strong> ${status}</li>` : ''}\n      ${customHTML}\n    </ul>\n    ${desc ? `<div class="product-description-v1"><h3><i class="fas fa-file-alt"></i> Description</h3><p>${desc}</p></div>` : ''}\n    ${videoEmbed ? videoEmbed.replace(/<div style="([^"]*)">/g, '<div class="video-embed-v1">').replace(/<h3 style="([^"]*)">/g, '<h3>').replace(/<iframe src="([^"]*)" style="([^"]*)" allowfullscreen>/g, '<iframe src="$1" style="width:100%;height:315px;border:none;" allowfullscreen>') : ''}\n  </div>\n  <script>\n    function changeMainImageV1(thumb, src) {\n      document.getElementById('mainImg-v1').src = src;\n      document.querySelectorAll('.thumbnails-v1 img').forEach(img => img.classList.remove('active-thumb-v1'));\n      thumb.classList.add('active-thumb-v1');\n    }\n  </script>\n</div>`;
  }

  function generateProfessionalV2Theme() {
    return `\n<style>\n  .product-card-v2 {\n    font-family: 'Roboto', sans-serif;\n    background-color: #1a1a2e;\n    color: #e0e0e0;\n    border-radius: 15px;\n    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);\n    max-width: 600px;\n    margin: 25px auto;\n    overflow: hidden;\n    border: 2px solid #0f3460;\n  }\n  .product-header-v2 {\n    background: linear-gradient(90deg, #0f3460, #16213e);\n    padding: 30px;\n    text-align: center;\n    color: white;\n    font-size: 1.5em;\n    border-bottom: 2px solid #0a2342;\n  }\n  .product-header-v2 h2 {\n    margin: 0;\n    font-size: 1.8em;\n    text-shadow: 1px 1px 4px rgba(0,0,0,0.3);\n  }\n  .product-image-gallery-v2 {\n    padding: 25px;\n    background-color: #0a1128;\n    text-align: center;\n  }\n  .product-image-gallery-v2 #mainImg-v2 {\n    width: 100%;\n    max-width: 500px;\n    border-radius: 10px;\n    border: 3px solid #e94560;\n    margin-bottom: 20px;\n    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);\n  }\n  .product-image-gallery-v2 .thumbnails-v2 {\n    display: flex;\n    justify-content: center;\n    flex-wrap: wrap;\n    gap: 12px;\n  }\n  .product-image-gallery-v2 .thumbnails-v2 img {\n    width: 80px;\n    height: 80px;\n    border-radius: 8px;\n    cursor: pointer;\n    border: 3px solid transparent;\n    transition: all 0.3s ease;\n    object-fit: cover;\n  }\n  .product-image-gallery-v2 .thumbnails-v2 img.active-thumb-v2 {\n    border-color: #e94560;\n    transform: scale(1.08);\n  }\n  .product-details-v2 {\n    padding: 25px;\n    line-height: 1.7;\n  }\n  .product-details-v2 .price-section-v2 {\n    font-size: 2em;\n    font-weight: bold;\n    color: #e94560;\n    margin-bottom: 20px;\n    text-align: center;\n    letter-spacing: 0.5px;\n  }\n  .product-details-v2 .price-section-v2 .old-price-v2 {\n    text-decoration: line-through;\n    color: #aaa;\n    font-size: 0.6em;\n    margin-right: 10px;\n  }\n  .product-details-v2 .price-section-v2 .discount-v2 {\n    color: #ffe400;\n    font-size: 0.6em;\n    margin-left: 10px;\n  }\n  .product-info-list-v2 {\n    list-style: none;\n    padding: 0;\n    margin: 25px 0;\n    background-color: #0a1128;\n    border-radius: 10px;\n    padding: 20px 25px;\n    border: 1px solid #0f3460;\n  }\n  .product-info-list-v2 li {\n    display: flex;\n    align-items: center;\n    margin-bottom: 12px;\n    color: #ccc;\n    font-size: 1.1em;\n  }\n  .product-info-list-v2 li i {\n    color: #e94560;\n    margin-right: 12px;\n    font-size: 1.2em;\n  }\n  .product-description-v2 {\n    background-color: #0a1128;\n    border-radius: 10px;\n    padding: 25px;\n    margin-top: 25px;\n    color: #ccc;\n    border: 1px solid #0f3460;\n  }\n  .product-description-v2 h3 {\n    color: #e94560;\n    margin-top: 0;\n    margin-bottom: 20px;\n    font-size: 1.4em;\n  }\n  .whatsapp-button-v2 {\n    display: block;\n    width: 85%;\n    max-width: 350px;\n    margin: 30px auto;\n    padding: 18px 25px;\n    background: linear-gradient(45deg, #25D366, #128C7E);\n    color: white;\n    text-align: center;\n    border-radius: 35px;\n    text-decoration: none;\n    font-size: 1.3em;\n    font-weight: bold;\n    transition: all 0.3s ease;\n    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.4);\n  }\n  .whatsapp-button-v2:hover {\n    transform: translateY(-4px);\n    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);\n  }\n  .video-embed-v2 {\n    margin-top: 25px;\n    background-color: #0a1128;\n    border-radius: 10px;\n    padding: 25px;\n    border: 1px solid #0f3460;\n  }\n  .video-embed-v2 h3 {\n    color: #e94560;\n    margin-top: 0;\n    margin-bottom: 20px;\n  }\n  .video-embed-v2 iframe {\n    border-radius: 10px;\n  }\n</style>\n<div class="product-card-v2">\n  <div class="product-header-v2">\n    <h2 data-i18n="product_overview">Product Overview</h2>\n  </div>\n  <div class="product-image-gallery-v2">\n    <img id="mainImg-v2" src="${mainImg}" alt="Product Image">\n    <div class="thumbnails-v2">\n      ${imgs.map((input, i) => input.value.trim() ? `<img src="${input.value.trim()}" onclick="changeMainImageV2(this, '${input.value.trim()}')" class="${i === 0 ? 'active-thumb-v2' : ''}">` : '').join('')}\n    </div>\n  </div>\n  <div class="product-details-v2">\n    <h2 style="text-align:center; color:#e0e0e0; margin-bottom:15px;">${name}</h2>\n    <p class="price-section-v2">\n      ${offer ? `<span class="old-price-v2">${selectedCurrency}${price.toLocaleString()}</span> ${selectedCurrency}${offer.toLocaleString()} <span class="discount-v2">(-${discount}%)</span>` : `${selectedCurrency}${price.toLocaleString()}`}\n    </p>\n    <a href="https://wa.me/${wa}?text=${encodeURIComponent(`📦 Order: ${name}\n💰 Price: ${offer || price}${selectedCurrency}\n🧾 Code: ${code}\n`)}" target="_blank" class="whatsapp-button-v2">\n      <i class="fab fa-whatsapp"></i> Order Now on WhatsApp\n    </a>\n    <ul class="product-info-list-v2">\n      ${code ? `<li><i class="fas fa-barcode"></i> <strong>Product Code:</strong> ${code}</li>` : ''}\n      ${brand ? `<li><i class="fas fa-building"></i> <strong>Brand:</strong> ${brand}</li>` : ''}\n      ${category ? `<li><i class="fas fa-tags"></i> <strong>Category:</strong> ${category}</li>` : ''}\n      ${unit ? `<li><i class="fas fa-box"></i> <strong>Unit:</strong> ${unit}</li>` : ''}\n      ${qty ? `<li><i class="fas fa-sort-numeric-up-alt"></i> <strong>Quantity:</strong> ${qty}</li>` : ''}\n      ${size ? `<li><i class="fas fa-expand-alt"></i> <strong>Size:</strong> ${size}</li>` : ''}\n      ${color ? `<li><i class="fas fa-fill-drip"></i> <strong>Color:</strong> ${color}</li>` : ''}\n      ${delivery ? `<li><i class="fas fa-shipping-fast"></i> <strong>Delivery Time:</strong> ${delivery}</li>` : ''}\n      ${status ? `<li><i class="fas fa-check-circle"></i> <strong>Availability:</strong> ${status}</li>` : ''}\n      ${customHTML}\n    </ul>\n    ${desc ? `<div class="product-description-v2"><h3><i class="fas fa-align-left"></i> Product Description</h3><p>${desc}</p></div>` : ''}\n    ${videoEmbed ? videoEmbed.replace(/<div style="([^"]*)">/g, '<div class="video-embed-v2">').replace(/<h3 style="([^"]*)">/g, '<h3>').replace(/<iframe src="([^"]*)" style="([^"]*)" allowfullscreen>/g, '<iframe src="$1" style="width:100%;height:315px;border:none;" allowfullscreen>') : ''}\n  </div>\n  <script>\n    function changeMainImageV2(thumb, src) {\n      document.getElementById('mainImg-v2').src = src;\n      document.querySelectorAll('.thumbnails-v2 img').forEach(img => img.classList.remove('active-thumb-v2'));\n      thumb.classList.add('active-thumb-v2');\n    }\n  </script>\n</div>`;
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
  
  group.innerHTML = `\n    <input type="text" class="custom-key" placeholder="শিরোনাম (যেমন: ওয়ারেন্টি)" style="flex: 1;">\n    <input type="text" class="custom-value" placeholder="মান (যেমন: ৬ মাস)" style="flex: 1;">\n    <button type="button" onclick="this.parentElement.remove(); showToast('কাস্টম ফিল্ড মুছে ফেলা হয়েছে।')" \n            style="background:#dc3545;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">\n      <i class="fas fa-times"></i>\n    </button>\n  `;
  
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
style.textContent = `\n@keyframes shake {\n  0%, 100% { transform: translateX(0); }\n  25% { transform: translateX(-5px); }\n  75% { transform: translateX(5px); }\n}\n`;
document.head.appendChild(style);


