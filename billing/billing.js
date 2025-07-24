let products = JSON.parse(localStorage.getItem("products")) || [];
let invoice = [];
let role = "admin"; // default role

function setUserRole(newRole) {
  role = newRole;
  document.getElementById("product-section").style.display = (role === "admin") ? "block" : "none";
}

function addProduct() {
  const name = document.getElementById("newProductName").value.trim();
  const code = document.getElementById("newProductCode").value.trim() || generateCode();
  const price = parseFloat(document.getElementById("newProductPrice").value);

  if (!name || isNaN(price)) {
    alert("Fill all product details.");
    return;
  }

  const product = { name, code, price };
  products.push(product);
  localStorage.setItem("products", JSON.stringify(products));
  renderProductList();
  renderAutoBarcode(code);
  document.getElementById("newProductName").value = '';
  document.getElementById("newProductCode").value = '';
  document.getElementById("newProductPrice").value = '';
}

function generateCode() {
  return 'P' + Date.now().toString(36).toUpperCase().slice(-6);
}

function renderAutoBarcode(code) {
  JsBarcode("#autoBarcode", code, { format: "CODE128", width: 2, height: 40 });
}

function printAutoBarcode() {
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<svg id="printBarcode"></svg>');
  printWindow.document.close();
  printWindow.onload = () => {
    JsBarcode(printWindow.document.querySelector("#printBarcode"), document.getElementById("autoBarcode").textContent, {
      format: "CODE128", width: 2, height: 40
    });
    printWindow.print();
  };
}

function loadProducts() {
  products = JSON.parse(localStorage.getItem("products")) || [];
  renderProductList();
}

function renderProductList() {
  const container = document.getElementById("productList");
  container.innerHTML = "";
  products.forEach((p, index) => {
    container.innerHTML += `
      <div>
        ${p.name} - ৳${p.price} (${p.code})
        <button onclick="addToInvoice(${index})">➕</button>
        ${role === "admin" ? `<button onclick="deleteProduct(${index})">❌</button>` : ""}
      </div>`;
  });
}

function deleteProduct(index) {
  if (confirm("Delete this product?")) {
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    renderProductList();
  }
}

function addToInvoice(index) {
  invoice.push(products[index]);
  renderInvoice();
}

function renderInvoice() {
  const table = document.getElementById("invoiceTable");
  let html = "<tr><th>Name</th><th>Price</th><th>Action</th></tr>";
  invoice.forEach((item, idx) => {
    html += `<tr>
      <td>${item.name}</td>
      <td>৳${item.price}</td>
      <td><button onclick="removeFromInvoice(${idx})">❌</button></td>
    </tr>`;
  });
  table.innerHTML = html;

  const total = invoice.reduce((sum, item) => sum + item.price, 0);
  document.getElementById("totalAmount").innerText = total.toFixed(2);
}

function removeFromInvoice(index) {
  invoice.splice(index, 1);
  renderInvoice();
}

function printInvoice() {
  let printWindow = window.open('', '_blank');
  let content = `<h2>Invoice</h2><table border="1"><tr><th>Name</th><th>Price</th></tr>`;
  invoice.forEach(item => {
    content += `<tr><td>${item.name}</td><td>৳${item.price}</td></tr>`;
  });
  content += `</table><h3>Total: ৳${invoice.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</h3>`;
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
}

function generateBarcode() {
  const code = document.getElementById("barcodeInput").value.trim();
  if (!code) return alert("Enter code");
  JsBarcode("#barcode", code, { format: "CODE128", width: 2, height: 40 });
}

function printBarcode() {
  const code = document.getElementById("barcodeInput").value.trim();
  if (!code) return alert("Enter code");
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<svg id="printBarcode"></svg>');
  printWindow.document.close();
  printWindow.onload = () => {
    JsBarcode(printWindow.document.querySelector("#printBarcode"), code, {
      format: "CODE128", width: 2, height: 40
    });
    printWindow.print();
  };
}

function backupData() {
  const data = {
    products: products,
    invoice: invoice
  };
  downloadJSON(data, `zovatu-billing-backup-${Date.now()}.json`);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      products = data.products || [];
      invoice = data.invoice || [];
      localStorage.setItem("products", JSON.stringify(products));
      renderProductList();
      renderInvoice();
      alert("✅ Data imported!");
    } catch {
      alert("Invalid file.");
    }
  };
  reader.readAsText(file);
}

function downloadJSON(data, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = filename;
  a.click();
}

function createSalesmanUser(email) {
  alert(`(Demo) Salesman created with: ${email}`);
  // In real project, this would call backend Firebase/Auth API
}

function renderReport() {
  let report = {};
  invoice.forEach(p => {
    if (!report[p.name]) report[p.name] = { count: 0, total: 0 };
    report[p.name].count++;
    report[p.name].total += p.price;
  });

  let html = "<table border='1'><tr><th>Product</th><th>Qty</th><th>Total</th></tr>";
  for (let name in report) {
    html += `<tr><td>${name}</td><td>${report[name].count}</td><td>৳${report[name].total.toFixed(2)}</td></tr>`;
  }
  html += "</table>";
  document.getElementById("salesReport").innerHTML = html;
}

window.onload = loadProducts;
