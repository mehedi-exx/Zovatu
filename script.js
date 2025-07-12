// G9Tool Enhanced Professional Script v4.0

// ✅ Toast Notification System
function showToast(message, type = 'success') {
  const toast = document.createElement("div");
  toast.textContent = message;
  
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  };
  
  toast.style = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors[type] || colors.success};
    color: ${type === 'warning' ? '#000' : 'white'};
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 9999;
    font-weight: 600;
    animation: slideUp 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add CSS animations
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideUp {
      from { transform: translate(-50%, 100%); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideDown {
      from { transform: translate(-50%, 0); opacity: 1; }
      to { transform: translate(-50%, 100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ✅ Utility Functions
const getVal = id => document.getElementById(id)?.value.trim();
const setVal = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.value = value;
};

// ✅ Form Validation
function validateForm() {
  const required = ['name', 'code', 'price', 'wa'];
  const missing = [];
  
  required.forEach(field => {
    if (!getVal(field)) {
      missing.push(field);
      document.getElementById(field).classList.add('error');
    } else {
      document.getElementById(field).classList.remove('error');
    }
  });
  
  const firstImg = document.querySelector('.img-url')?.value.trim();
  if (!firstImg) {
    missing.push('image');
    document.querySelector('.img-url')?.classList.add('error');
  } else {
    document.querySelector('.img-url')?.classList.remove('error');
  }
  
  if (missing.length > 0) {
    showToast('দয়া করে সব প্রয়োজনীয় ফিল্ড পূরণ করুন', 'error');
    return false;
  }
  
  return true;
}

// ✅ Enhanced Product HTML Generator
function generateProductHTML() {
  if (!validateForm()) return;
  
  const name = getVal("name");
  const code = getVal("code");
  const price = parseFloat(getVal("price"));
  const offer = parseFloat(getVal("offer"));
  const unit = getVal("unit") || "পিস";
  const qty = getVal("qty") || "1";
  const brand = getVal("brand");
  const size = getVal("size");
  const color = getVal("color");
  const delivery = getVal("delivery") || "ঢাকায় ১-২ দিন, বাইরে ২-৩ দিন";
  const status = getVal("status") || "স্টকে আছে";
  const category = getVal("category");
  const desc = getVal("desc");
  const video = getVal("video");
  const wa = getVal("wa");
  
  const imgs = Array.from(document.querySelectorAll(".img-url"))
    .map(input => input.value.trim())
    .filter(url => url);
  
  if (imgs.length === 0) {
    showToast('অন্তত একটি ছবি যোগ করুন', 'error');
    return;
  }
  
  const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;
  const finalPrice = offer || price;
  
  // Generate thumbnail gallery
  let thumbHTML = "";
  imgs.forEach((url, i) => {
    thumbHTML += `<img src="${url}" style="width:70px;height:70px;border-radius:8px;cursor:pointer;border:3px solid ${i === 0 ? '#00d4ff' : 'transparent'};margin:5px;transition:all 0.3s ease;" onclick="changeMainImage('${url}', this);">`;
  });
  
  // Generate custom fields
  let customHTML = "";
  document.querySelectorAll(".custom-field-group").forEach(group => {
    const key = group.querySelector(".custom-key")?.value.trim();
    const value = group.querySelector(".custom-value")?.value.trim();
    if (key && value) {
      customHTML += `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
          <span style="font-weight:600;color:#333;">${key}:</span>
          <span style="color:#666;">${value}</span>
        </div>`;
    }
  });
  
  // Generate video section
  let videoHTML = "";
  if (video) {
    const videoId = extractYouTubeID(video);
    if (videoId) {
      videoHTML = `
        <div style="margin:20px 0;">
          <h3 style="color:#333;margin-bottom:10px;">📹 প্রোডাক্ট ভিডিও</h3>
          <iframe width="100%" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe>
        </div>`;
    }
  }
  
  // Main HTML template
  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - ${code}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; color: #333; line-height: 1.6; }
        .container { max-width: 800px; margin: 20px auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 25px; text-align: center; }
        .product-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .product-code { font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .image-section { text-align: center; margin-bottom: 25px; }
        .main-image { width: 100%; max-width: 400px; height: 400px; object-fit: cover; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .thumbnails { margin-top: 15px; text-align: center; }
        .price-section { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 20px; border-radius: 15px; margin: 20px 0; text-align: center; }
        .price-original { font-size: 24px; text-decoration: line-through; opacity: 0.8; }
        .price-offer { font-size: 36px; font-weight: bold; margin: 10px 0; }
        .price-single { font-size: 32px; font-weight: bold; }
        .discount-badge { background: #dc3545; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 25px 0; }
        .info-card { background: #f8f9fa; padding: 15px; border-radius: 10px; border-left: 4px solid #007bff; }
        .info-label { font-weight: bold; color: #007bff; margin-bottom: 5px; }
        .description { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .order-section { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 25px; border-radius: 15px; text-align: center; margin-top: 30px; }
        .whatsapp-btn { background: #25d366; color: white; padding: 15px 30px; border: none; border-radius: 50px; font-size: 18px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 15px; transition: all 0.3s ease; }
        .whatsapp-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(37,211,102,0.4); }
        @media (max-width: 768px) {
            .container { margin: 10px; border-radius: 10px; }
            .content { padding: 20px; }
            .product-title { font-size: 24px; }
            .price-offer, .price-single { font-size: 28px; }
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="product-title">${name}</div>
            <div class="product-code">কোড: ${code}</div>
        </div>
        
        <div class="content">
            <div class="image-section">
                <img id="mainImg" src="${imgs[0]}" alt="${name}" class="main-image">
                ${imgs.length > 1 ? `<div class="thumbnails" id="thumbs">${thumbHTML}</div>` : ''}
            </div>
            
            <div class="price-section">
                ${offer ? `
                    <div class="price-original">৳${price}</div>
                    <div class="price-offer">৳${offer}</div>
                    <div class="discount-badge">${discount}% ছাড়</div>
                ` : `
                    <div class="price-single">৳${price}</div>
                `}
            </div>
            
            <div class="info-grid">
                ${brand ? `<div class="info-card"><div class="info-label">ব্র্যান্ড</div>${brand}</div>` : ''}
                ${category ? `<div class="info-card"><div class="info-label">ক্যাটাগরি</div>${category}</div>` : ''}
                <div class="info-card"><div class="info-label">পরিমাণ</div>${qty} ${unit}</div>
                ${size ? `<div class="info-card"><div class="info-label">সাইজ</div>${size}</div>` : ''}
                ${color ? `<div class="info-card"><div class="info-label">রঙ</div>${color}</div>` : ''}
                <div class="info-card"><div class="info-label">ডেলিভারি</div>${delivery}</div>
                <div class="info-card"><div class="info-label">স্ট্যাটাস</div>${status}</div>
            </div>
            
            ${customHTML ? `<div style="background:#f8f9fa;padding:20px;border-radius:10px;margin:20px 0;"><h3 style="margin-bottom:15px;color:#333;">📋 অতিরিক্ত তথ্য</h3>${customHTML}</div>` : ''}
            
            ${desc ? `<div class="description"><h3 style="margin-bottom:15px;color:#333;">📝 বিস্তারিত</h3><p>${desc}</p></div>` : ''}
            
            ${videoHTML}
            
            <div class="order-section">
                <h3 style="margin-bottom:15px;">🛒 অর্ডার করতে চান?</h3>
                <p>এখনই WhatsApp এ যোগাযোগ করুন</p>
                <a href="https://wa.me/${wa}?text=আসসালামু আলাইকুম। আমি ${name} (কোড: ${code}) অর্ডার করতে চাই।" target="_blank" class="whatsapp-btn">
                    📱 WhatsApp এ অর্ডার করুন
                </a>
            </div>
        </div>
    </div>
    
    <script>
        function changeMainImage(src, thumb) {
            document.getElementById('mainImg').src = src;
            document.querySelectorAll('#thumbs img').forEach(img => img.style.border = '3px solid transparent');
            thumb.style.border = '3px solid #00d4ff';
        }
    </script>
</body>
</html>`;
  
  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
  
  showToast('প্রোডাক্ট HTML সফলভাবে জেনারেট হয়েছে!', 'success');
}

// ✅ Copy to Clipboard
function copyToClipboard() {
  const output = document.getElementById("output").textContent;
  if (!output) {
    showToast('প্রথমে HTML জেনারেট করুন', 'warning');
    return;
  }
  
  navigator.clipboard.writeText(output).then(() => {
    showToast('HTML কপি হয়েছে!', 'success');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = output;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('HTML কপি হয়েছে!', 'success');
  });
}

// ✅ Extract YouTube Video ID
function extractYouTubeID(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// ✅ Auto-save functionality
let autoSaveTimer;
function autoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    const formData = {
      name: getVal('name'),
      code: getVal('code'),
      price: getVal('price'),
      timestamp: new Date().toISOString()
    };
    
    if (formData.name || formData.code || formData.price) {
      localStorage.setItem('g9tool_autosave', JSON.stringify(formData));
    }
  }, 2000);
}

// ✅ Load auto-saved data
function loadAutoSave() {
  const saved = localStorage.getItem('g9tool_autosave');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (confirm('পূর্বের অসংরক্ষিত ডেটা পাওয়া গেছে। লোড করবেন?')) {
        Object.keys(data).forEach(key => {
          if (key !== 'timestamp') setVal(key, data[key]);
        });
        showToast('অটো-সেভ ডেটা লোড হয়েছে', 'info');
      }
    } catch (e) {
      console.error('Auto-save load error:', e);
    }
  }
}

// ✅ Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Main buttons
  document.getElementById("generateBtn")?.addEventListener("click", generateProductHTML);
  document.getElementById("copyBtn")?.addEventListener("click", copyToClipboard);
  
  // Auto-save on input
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', autoSave);
  });
  
  // Load auto-save
  setTimeout(loadAutoSave, 1000);
  
  // Menu toggle for mobile
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('active');
    });
  }
  
  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.querySelector('.menu-btn');
    if (sidebar && !sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  });
});

// ✅ Form validation on submit
document.addEventListener('submit', (e) => {
  e.preventDefault();
  generateProductHTML();
});

// ✅ Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        generateProductHTML();
        break;
      case 's':
        e.preventDefault();
        if (typeof saveDraft === 'function') saveDraft();
        break;
      case 'c':
        if (e.shiftKey) {
          e.preventDefault();
          copyToClipboard();
        }
        break;
    }
  }
});

// ✅ Export functions for global access
window.G9Tool = {
  generateProductHTML,
  copyToClipboard,
  showToast,
  validateForm
};

