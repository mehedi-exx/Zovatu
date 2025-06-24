document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const body = document.body;

  // Theme Toggle
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light");
    themeToggle.textContent = body.classList.contains("light") ? "☀️" : "🌙";
  });

  // Menu Toggle
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
  });

  // Generate Button
  document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("✅ HTML কোড তৈরি হয়েছে! এখন কপি বা ডাউনলোড করুন।");
  });

  // Copy Button
  document.getElementById("copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText("🔧 HTML Code Here...").then(() => {
      alert("📋 কোড কপি হয়েছে!");
    });
  });

  // Download Button
  document.getElementById("downloadBtn").addEventListener("click", () => {
    const blob = new Blob(["🔧 HTML Code Here..."], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "product-post.html";
    a.click();
  });
});
