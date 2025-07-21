document.addEventListener("DOMContentLoaded", () => {
  const moneyReceivedInput = document.getElementById("moneyReceived");
  const productsSoldInput = document.getElementById("productsSold");
  const moneyRefundedInput = document.getElementById("moneyRefunded");

  const totalReceivedSpan = document.getElementById("totalReceived");
  const netSalesSpan = document.getElementById("netSales");
  const amountToRefundSpan = document.getElementById("amountToRefund");

  function calculateSummary() {
    const moneyReceived = parseFloat(moneyReceivedInput.value) || 0;
    const productsSold = parseFloat(productsSoldInput.value) || 0;
    const moneyRefunded = parseFloat(moneyRefundedInput.value) || 0;

    const totalReceived = moneyReceived;
    const netSales = productsSold - moneyRefunded;
    const amountToRefund = moneyRefunded;

    totalReceivedSpan.textContent = totalReceived.toFixed(2);
    netSalesSpan.textContent = netSales.toFixed(2);
    amountToRefundSpan.textContent = amountToRefund.toFixed(2);
  }

  moneyReceivedInput.addEventListener("input", calculateSummary);
  productsSoldInput.addEventListener("input", calculateSummary);
  moneyRefundedInput.addEventListener("input", calculateSummary);

  // Initial calculation
  calculateSummary();
});


