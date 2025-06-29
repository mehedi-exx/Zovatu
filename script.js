let imgCount = 1;

function addImageInput() {
  if (imgCount < 5) {
    const newInput = document.createElement("input");
    newInput.type = "url";
    newInput.className = "img-url";
    newInput.placeholder = `ছবির লিংক (Image URL) ${imgCount + 1}`;
    document.getElementById("imageInputs").appendChild(newInput);
    imgCount++;
  }
}

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
}
function closeMenu() {
  document.getElementById("sidebar").classList.remove("active");
}
function logout() {
  localStorage.removeItem("g9tool_user");
  window.location.href = "index.html";
}

document.getElementById("generateBtn").addEventListener("click", function () {
  const name = document.getElementById("name").value;
  const code = document.getElementById("code").value;
  const price = parseFloat(document.getElementById("price").value);
  const offer = parseFloat(document.getElementById("offer").value);
  const delivery = document.getElementById("delivery").value || "N/A";
  const status = document.getElementById("status").value;
  const category = document.getElementById("category").value;
  const desc = document.getElementById("desc").value;
  const wa = document.getElementById("wa").value;
  const images = Array.from(document.querySelectorAll(".img-url")).map(i => i.value).filter(Boolean);

  if (!name || !code || !price || !status || !category || !images.length || !wa) {
    alert("❗ সব প্রয়োজনীয় ইনপুট পূরণ করুন");
    return;
  }

  const firstImg = images[0];
  let thumbs = images
    .map((src, i) => {
      return `<img src="${src}" style="width:60px;height:60px;border-radius:6px;cursor:pointer;border:2px solid ${i === 0 ? "green" : "transparent"};" onclick="changeImage(this)">`;
    })
    .join("");

  // মূল প্রাইস ও অফার ক্যালকুলেশন
  let finalPrice = `৳${price}`;
  let shortcodePrice = `$price={৳${price}}`;
  if (!isNaN(offer) && offer < price) {
    const discount = Math.round(((price - offer) / price) * 100);
    finalPrice = `
<del style="display:inline-block;color:#aaa;vertical-align:middle;text-decoration:line-through;margin-right:5px;">৳${price}</del>
<span style="color:red;font-weight:bold;">৳${offer}</span>
<small style="color:limegreen">(${discount}% ছাড়)</small>
    `;
    shortcodePrice = `$price={৳${offer}} $sale={৳${price}}`;
  }

  const waText = encodeURIComponent(`আমি একটি পণ্য অর্ডার করতে চাই:
পণ্য: ${name}
মূল্য: ৳${offer || price}
কোড: ${code}
ক্যাটাগরি: ${category}
ডেলিভারি টাইম: ${delivery}`);

  const waLink = `https://wa.me/${wa}?text=${waText}`;

  const html = `
<div style="text-align:center;">
  <img id="mainImg" src="${firstImg}" style="width:100%;max-width:500px;border-radius:10px;border:1px solid #ccc;margin-bottom:10px;">
  <div id="thumbs" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
    ${thumbs}
  </div>

  <h2 style="margin:5px 0;">${name}</h2>
  <p style="font-size:18px;">${finalPrice}</p>
</div>

<p style="text-align:center;margin:10px 0;">
  <a href="${waLink}" target="_blank" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
    <span style="margin-right:5px;">📱</span> অর্ডার করুন WhatsApp এ
  </a>
</p>

<ul style="list-style:none;padding:0;margin:15px 0;text-align:left;max-width:500px;margin:auto;">
  <li><span style="margin-right:5px;">#️⃣</span> কোড: ${code}</li>
  <li><span style="margin-right:5px;">📦</span> স্ট্যাটাস: ${status}</li>
  <li><span style="margin-right:5px;">📂</span> ক্যাটাগরি: ${category}</li>
  <li><span style="margin-right:5px;">🚚</span> ডেলিভারি টাইম: ${delivery}</li>
</ul>

<p>${desc}</p>

<p style="display:none;">
  <a href="#"> {getProduct} ${shortcodePrice} {/getProduct} </a>
</p>

<!-- থাম্ব ক্লিক করলে মেইন ইমেজ পরিবর্তন -->
<script>
  function changeImage(el) {
    document.getElementById('mainImg').src = el.src;
    let all = document.querySelectorAll('#thumbs img');
    all.forEach(img => img.style.border = "2px solid transparent");
    el.style.border = "2px solid green";
  }
<\/script>
`;

  document.getElementById("output").textContent = html;
  document.getElementById("preview").innerHTML = html;
});

document.getElementById("copyBtn").addEventListener("click", function () {
  const code = document.getElementById("output").textContent;
  navigator.clipboard.writeText(code).then(() => {
    alert("✔️ কোড কপি হয়েছে!");
  });
});
