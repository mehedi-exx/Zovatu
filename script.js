// ইউজার চেক
if (!localStorage.getItem("g9tool_user")) {
  window.location.href = "index.html";
}

// মেনু ফাংশন
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
}
function closeMenu() {
  document.getElementById("sidebar").classList.remove("active");
}

// লগআউট
function logout() {
  localStorage.removeItem("g9tool_user");
  window.location.href = "index.html";
}

// ইমেজ ইনপুট যুক্ত করা
function addImageInput() {
  const container = document.getElementById("imageInputs");
  const inputs = container.querySelectorAll(".img-url");
  if (inputs.length >= 5) return;
  const input = document.createElement("input");
  input.type = "url";
  input.className = "img-url";
  input.placeholder = "ছবির লিংক (Image URL)";
  container.appendChild(input);
}

// কোড জেনারেট করা
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

  if (!name || !code || isNaN(price) || !imgs[0].value || !wa) {
    alert("প্রোডাক্ট নাম, কোড, প্রাইস, প্রথম ছবি ও WhatsApp নম্বর বাধ্যতামূলক।");
    return;
  }

  const total = unit && qty ? ` (${qty} × ${unit} = ${price * qty}৳)` : "";
  const discount = offer && price ? Math.round(((price - offer) / price) * 100) : 0;

  // ইমেজ স্লাইডার কোড তৈরি
  let imgHTML = "";
  imgs.forEach((input, i) => {
    const url = input.value.trim();
    if (url) {
      imgHTML += `<img src="${url}" alt="image${i + 1}" style="width:100%;margin-bottom:10px;border-radius:8px;" />`;
    }
  });

  // ভিডিও ইফ্রেম
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

  // ফাইনাল কোড তৈরি
  const html = `
<div class="product-box" style="background:#1f1f1f;padding:15px;border-radius:10px;margin-bottom:20px;">
  ${imgHTML}
  <h3 style="color:#fff;">${name}</h3>
  <p style="color:#ccc;">মূল্য: <span style="${offer ? 'text-decoration:line-through;color:red;' : ''}">${price}৳</span>
    ${offer ? `<span style="color:#00ff00;font-weight:bold;"> → ${offer}৳</span> 
    <small style="color:orange;">(-${discount}%)</small>` : ""}
  </p>
  <p style="color:#ccc;">কোড: ${code} | স্ট্যাটাস: ${status || "N/A"} | ক্যাটাগরি: ${category || "N/A"}</p>
  <p style="color:#ccc;">ডেলিভারি টাইম: ${delivery || "N/A"}</p>
  <p style="color:#ccc;">ব্র্যান্ড: ${brand || "N/A"} | সাইজ: ${size || "N/A"} | রঙ: ${color || "N/A"}</p>
  <p style="color:#ddd;">${desc || ""}</p>
  <a href="https://wa.me/${wa}?text=আমি এই প্রোডাক্টটি অর্ডার করতে চাই: ${name} (${code})" 
     style="display:inline-block;margin-top:10px;padding:10px 15px;background:#25D366;color:#fff;border-radius:5px;text-decoration:none;">
    WhatsApp অর্ডার করুন
  </a>
  ${videoEmbed}
  <div style="display:none;">{getProduct} ${name} {/getProduct}</div>
</div>`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
});

// কপি ফাংশন
document.getElementById("copyBtn").addEventListener("click", () => {
  const code = document.getElementById("output").textContent;
  navigator.clipboard.writeText(code).then(() => {
    alert("কোড কপি হয়েছে!");
  });
});
