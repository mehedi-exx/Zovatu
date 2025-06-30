document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("product-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Input Values
    const name = document.getElementById("name").value.trim();
    const originalPrice = document.getElementById("original-price").value.trim();
    const discountedPrice = document.getElementById("discounted-price").value.trim();
    const discountPercent = document.getElementById("discount-percent").value.trim();
    const code = document.getElementById("code").value.trim();
    const status = document.getElementById("status").value.trim();
    const category = document.getElementById("category").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const size = document.getElementById("size").value.trim();
    const color = document.getElementById("color").value.trim();
    const delivery = document.getElementById("delivery").value.trim();
    const imageUrl = document.getElementById("image-url").value.trim();
    const desc = document.getElementById("desc").value.trim();

    // Output Elements
    document.getElementById("output-name").textContent = name || "নাম নেই";
    document.getElementById("output-original-price").textContent = originalPrice ? `মূল্য: ${originalPrice}৳` : "";
    document.getElementById("output-discounted-price").textContent = discountedPrice ? `ডিসকাউন্ট: ${discountedPrice}৳` : "";
    document.getElementById("output-discount-percent").textContent = discountPercent ? `(${discountPercent}% ছাড়)` : "";

    document.getElementById("output-code").textContent = code ? `কোড: ${code}` : "";
    document.getElementById("output-status").textContent = status;
    document.getElementById("output-category").textContent = category;

    document.getElementById("output-brand").textContent = brand ? `ব্র্যান্ড: ${brand}` : "";
    document.getElementById("output-size").textContent = size ? `সাইজ: ${size}` : "";
    document.getElementById("output-color").textContent = color ? `রং: ${color}` : "";
    document.getElementById("output-delivery").textContent = delivery ? `ডেলিভারি: ${delivery}` : "";

    document.getElementById("output-desc").textContent = desc;

    // Image gallery (Single image or multiple comma-separated URLs)
    const gallery = document.getElementById("output-gallery");
    gallery.innerHTML = "";

    if (imageUrl) {
      const urls = imageUrl.split(",").map(url => url.trim());
      urls.forEach(url => {
        if (url) {
          const img = document.createElement("img");
          img.src = url;
          img.alt = "Product Image";
          img.classList.add("product-image");
          gallery.appendChild(img);
        }
      });
    }

    // WhatsApp Button Dynamic Link
    const msg = `হ্যালো, আমি "${name}" পণ্যটি অর্ডার করতে চাই। মূল্য: ${discountedPrice}৳ (${discountPercent}% ছাড়), কোড: ${code}`;
    const waLink = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    const waButton = document.getElementById("wa-button");
    waButton.href = waLink;
    waButton.style.display = "inline-block";
  });
});
