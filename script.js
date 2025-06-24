document.getElementById("toggleButton").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    let mode = document.body.classList.contains("dark-mode") ? "Dark" : "Light";
    document.getElementById("toggleButton").innerHTML = `<i class="fa fa-${mode === 'Dark' ? 'sun' : 'moon'}"></i> Switch to ${mode} Mode`;
});

// Function to generate the HTML code based on form inputs
document.getElementById("generateCodeButton").addEventListener("click", function(event) {
    event.preventDefault();

    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const productDiscount = document.getElementById("productDiscount").value;
    const productDescription = document.getElementById("productDescription").value;
    const productImage = document.getElementById("productImage").value;
    const adminWhatsApp = document.getElementById("adminWhatsApp").value;

    const htmlCode = `
    <div class="product">
        <img src="${productImage}" alt="${productName}">
        <h3>${productName}</h3>
        <p>Price: $${productPrice}</p>
        <p>Discount: ${productDiscount}% OFF</p>
        <p>Description: ${productDescription}</p>
        <a href="https://wa.me/${adminWhatsApp}?text=I%20want%20to%20order%20${productName}" target="_blank">
            <button>Order on WhatsApp</button>
        </a>
    </div>
    `;
    
    document.getElementById("generatedCode").textContent = htmlCode;
});

// Function to copy generated HTML code to clipboard
document.getElementById("copyButton").addEventListener("click", function() {
    const code = document.getElementById("generatedCode");
    code.select();
    document.execCommand("copy");
});

// Function to download the generated HTML code as a file
document.getElementById("downloadButton").addEventListener("click", function() {
    const code = document.getElementById("generatedCode").value;
    const blob = new Blob([code], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "product-post.html";
    link.click();
});
