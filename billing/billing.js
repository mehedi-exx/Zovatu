let products = JSON.parse(localStorage.getItem("products")) || [];
let invoice = [];

function setUserRole(role) {
  localStorage.setItem("role", role);
  alert("Switched to: " + role);
}

// === PRODUCT MANAGEMENT ===
function addProduct() {
  const name = document.getElementById("newProductName").value;
  const code = document.getElementById("newProductCode").value || Math.random().toString(36).substring(2, 10);
  const price = parseFloat(document.getElementById("newProductPrice").value);

  if (!name || isNaN(price)) return alert("Please enter valid product details");

  const product = { name, code, price };
  products.push(product);
  saveData();
  renderProducts();
  generateAutoBarcode(code);
}

function deleteProduct(index) {
  products.splice(index, 1);
  saveData();
  renderProducts();
}

function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";
  products.forEach((p, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${p.name} (৳${p.price})
      <div>
        <button onclick="addToInvoice(${i})">➕</button>
        <button onclick="deleteProduct(${i})">🗑️</button>
      </div>`;
    list.appendChild(div);
  });
}

// === INVOICE ===
function addToInvoice(index) {
  invoice.push(products[index]);
  renderInvoice();
}

function renderInvoice() {
  const table = document.getElementById("invoiceTable");
  let total = 0;
  table.innerHTML = `
    <tr><th>Name</th><th>Code</th><th>Price</th></tr>`;
  invoice.forEach(p => {
    total += p.price;
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.code}</td>
        <td>৳${p.price}</td>
      </tr>`;
  });
  document.getElementById("totalAmount").innerText = total;
}

function printInvoice() {
  const printWindow = window.open("", "", "width=800,height=600");
  printWindow.document.write("<h2>🧾 Zovatu Invoice</h2><table border='1'>");
  printWindow.document.write(document.getElementById("invoiceTable").outerHTML);
  printWindow.document.write("</table>");
  printWindow.document.close();
  printWindow.print();
}

// === BARCODE ===
function generateBarcode() {
  const input = document.getElementById("barcodeInput").value;
  if (!input) return alert("Enter product code");
  JsBarcode("#barcode", input, { format: "CODE128" });
}

function printBarcode() {
  const w = window.open();
  w.document.write("<svg>" + document.getElementById("barcode").innerHTML + "</svg>");
  w.print();
  w.close();
}

function generateAutoBarcode(code) {
  JsBarcode("#autoBarcode", code, { format: "CODE128" });
}

function printAutoBarcode() {
  const w = window.open();
  w.document.write("<svg>" + document.getElementById("autoBarcode").innerHTML + "</svg>");
  w.print();
  w.close();
}

// === BACKUP / RESTORE ===
function backupData() {
  const dataStr = JSON.stringify(products);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "billing-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      products = JSON.parse(e.target.result);
      saveData();
      renderProducts();
      alert("Data imported successfully!");
    } catch (err) {
      alert("Invalid file");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// === SALES REPORT ===
function renderReport() {
  const report = document.getElementById("salesReport");
  if (!invoice.length) return report.innerText = "No sales yet!";
  const grouped = {};
  invoice.forEach(p => {
    grouped[p.name] = (grouped[p.name] || 0) + 1;
  });
  report.innerHTML = "<ul>" + Object.entries(grouped).map(
    ([name, qty]) => `<li>${name}: ${qty} sold</li>`
  ).join("") + "</ul>";
}

// === LOCAL STORAGE SAVE ===
function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
}

// === INIT ===
renderProducts();
renderInvoice();
