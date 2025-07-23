// js/billingAdmin.js

document.addEventListener("DOMContentLoaded", () => {
  loadShopSettings();

  // ফর্ম সাবমিট ইভেন্ট হ্যান্ডলার
  const form = document.getElementById("shopSettingsForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveShopDetails();
  });

  // ফিল্টার ফর্ম হ্যান্ডলার
  const filterForm = document.getElementById("filterForm");
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const filter = document.getElementById("filterType").value;
    alert(`Filtered data for: ${filter}`); // পরে এখান থেকে বাস্তব ফিল্টার লজিক যুক্ত করা যাবে
  });
});

// 🔐 Shop Info Load
function loadShopSettings() {
  const shopData = JSON.parse(localStorage.getItem("shopSettings")) || {};
  document.getElementById("shopName").value = shopData.shopName || "";
  document.getElementById("shopAddress").value = shopData.shopAddress || "";
  document.getElementById("shopPhone").value = shopData.shopPhone || "";
  document.getElementById("shopEmail").value = shopData.shopEmail || "";
}

// 💾 Save Shop Settings
function saveShopDetails() {
  const shopData = {
    shopName: document.getElementById("shopName").value.trim(),
    shopAddress: document.getElementById("shopAddress").value.trim(),
    shopPhone: document.getElementById("shopPhone").value.trim(),
    shopEmail: document.getElementById("shopEmail").value.trim(),
  };

  if (!shopData.shopName || !shopData.shopAddress || !shopData.shopPhone) {
    alert("Please fill all required fields.");
    return;
  }

  localStorage.setItem("shopSettings", JSON.stringify(shopData));
  alert("✅ Shop details saved!");
}

// 🏪 Open Shop
function openShop() {
  localStorage.setItem("shopStatus", "open");
  alert("🟢 Shop is now OPEN!");
}

// 🔒 Close Shop
function closeShop() {
  localStorage.setItem("shopStatus", "closed");
  alert("🔴 Shop is now CLOSED!");
}

// 📤 Export Data
function exportData() {
  const shopData = localStorage.getItem("shopSettings");
  const blob = new Blob([shopData], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "shop-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
  alert("📤 Exported data successfully!");
}

// 📥 Import Data
function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.addEventListener("change", () => {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem("shopSettings", JSON.stringify(data));
        loadShopSettings();
        alert("✅ Imported shop data!");
      } catch (err) {
        alert("❌ Invalid JSON file.");
      }
    };

    reader.readAsText(file);
  });

  input.click();
}

// 💾 Auto Backup (dummy simulation)
function autoBackup() {
  alert("🛡️ Auto Backup simulated. (Connect real backend for full feature)");
}

// 🧹 Clear All Data
function clearAllData() {
  if (confirm("Are you sure you want to clear all billing data?")) {
    localStorage.removeItem("shopSettings");
    localStorage.removeItem("shopStatus");
    alert("🧹 All shop data cleared!");
    loadShopSettings();
  }
}
