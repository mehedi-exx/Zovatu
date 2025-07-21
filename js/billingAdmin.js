import { showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const dailySalesSpan = document.getElementById("dailySales");
  const monthlySalesSpan = document.getElementById("monthlySales");
  const printToggle = document.getElementById("printToggle");
  const printDesign = document.getElementById("printDesign");
  const exportDataBtn = document.getElementById("exportDataBtn");
  const backupDataBtn = document.getElementById("backupDataBtn");

  // Load settings from localStorage or set defaults
  let settings = JSON.parse(localStorage.getItem("billingSettings")) || {
    enablePrint: true,
    design: "default",
  };

  // Apply loaded settings
  printToggle.checked = settings.enablePrint;
  printDesign.value = settings.design;

  // Dummy data for sales reports (replace with actual data logic)
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Simulate daily sales
  const dummyDailySales = (Math.random() * 1000 + 500).toFixed(2);
  dailySalesSpan.textContent = dummyDailySales;

  // Simulate monthly sales
  const dummyMonthlySales = (Math.random() * 10000 + 5000).toFixed(2);
  monthlySalesSpan.textContent = dummyMonthlySales;

  // Event Listeners for settings
  printToggle.addEventListener("change", () => {
    settings.enablePrint = printToggle.checked;
    localStorage.setItem("billingSettings", JSON.stringify(settings));
    showToast(`Bill printing ${settings.enablePrint ? "enabled" : "disabled"}`, "info");
  });

  printDesign.addEventListener("change", () => {
    settings.design = printDesign.value;
    localStorage.setItem("billingSettings", JSON.stringify(settings));
    showToast(`Print design set to ${settings.design}`, "info");
  });

  exportDataBtn.addEventListener("click", () => {
    // Implement data export logic here
    showToast("Exporting data... (Not implemented yet)", "info");
  });

  backupDataBtn.addEventListener("click", () => {
    // Implement data backup logic here
    showToast("Backing up data... (Not implemented yet)", "info");
  });
});


