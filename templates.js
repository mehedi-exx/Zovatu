const outputTemplates = [
  {
    id: "default",
    name: "ডিফল্ট টেমপ্লেট",
    description: "বর্তমান ডিফল্ট আউটপুট টেমপ্লেট।",
    html: `
<div style="text-align:center;font-family:\'Segoe UI\',sans-serif;max-width:600px;margin:auto;background:linear-gradient(135deg,#f8f9fa 0%,#e9ecef 100%);border-radius:15px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,0.1);">
  <img id="mainImg" src="{{mainImg}}" style="width:100%;max-width:500px;border-radius:15px;border:3px solid #00bfff;margin-bottom:15px;transition:all 0.3s ease;box-shadow:0 8px 25px rgba(0,0,0,0.15);" onload="this.style.opacity=\'1\'" onmouseover="this.style.transform=\'scale(1.02)\'" onmouseout="this.style.transform=\'scale(1)\'">
  <div id="thumbs" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:15px;padding:10px;background:rgba(255,255,255,0.5);border-radius:10px;">{{thumbHTML}}</div>
  <h2 style="margin:10px 0;color:#2c3e50;font-size:28px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,0.1);">{{name}}</h2>
  <p style="font-size:22px;margin:15px 0;">
    {{offer ? `<span style="text-decoration:line-through;color:#6c757d;margin-right:10px;font-size:18px;">৳{{price}}</span><span style="color:#e74c3c;font-weight:bold;font-size:26px;">৳{{offer}}</span><small style="color:#27ae60;font-weight:600;background:#d4edda;padding:2px 8px;border-radius:15px;margin-left:8px;">-${{discount}}% ছাড়</small>` : `<span style="color:#e74c3c;font-weight:bold;font-size:26px;">৳{{price}}</span>`}}
  </p>
  <div style="margin:25px 0;">
    <a href="https://wa.me/{{wa}}?text=📦 আমি একটি পণ্য অর্ডার করতে চাই%0A🔖 প্রোডাক্ট: {{name}}%0A💰 মূল্য: {{offer || price}}৳%0A🧾 কোড: {{code}}%0A📁 ক্যাটাগরি: {{category}}%0A🚚 ডেলিভারি: {{delivery}}" 
       target="_blank"
       style="display:inline-block;background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);color:#fff;padding:16px 40px;border-radius:50px;font-weight:bold;font-size:18px;text-decoration:none;box-shadow: 0 6px 20px rgba(37,211,102,0.3);transition: all 0.3s ease;text-transform:uppercase;letter-spacing:1px;"
       onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 25px rgba(37,211,102,0.4)\'"
       onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 6px 20px rgba(37,211,102,0.3)\'">
      🛒 অর্ডার করুন
    </a>
  </div>
  <ul style="list-style:none;padding:0;margin:20px auto;text-align:left;max-width:500px;background:rgba(255,255,255,0.7);border-radius:12px;padding:20px;">
    {{code ? `<li style="margin:8px 0;padding:8px;background:rgba(0,123,255,0.1);border-radius:6px;border-left:4px solid #007bff;">🔢 <strong>কোড:</strong> {{code}}</li>` : ""}}
    {{status ? `<li style="margin:8px 0;padding:8px;background:rgba(40,167,69,0.1);border-radius:6px;border-left:4px solid #28a745;">📦 <strong>স্ট্যাটাস:</strong> {{status}}</li>` : ""}}
    {{category ? `<li style="margin:8px 0;padding:8px;background:rgba(255,193,7,0.1);border-radius:6px;border-left:4px solid #ffc107;">📁 <strong>ক্যাটাগরি:</strong> {{category}}</li>` : ""}}
    {{delivery ? `<li style="margin:8px 0;padding:8px;background:rgba(23,162,184,0.1);border-radius:6px;border-left:4px solid #17a2b8;">🚚 <strong>ডেলিভারি:</strong> {{delivery}}</li>` : ""}}
    {{brand ? `<li style="margin:8px 0;padding:8px;background:rgba(108,117,125,0.1);border-radius:6px;border-left:4px solid #6c757d;">🏷️ <strong>ব্র্যান্ড:</strong> {{brand}}</li>` : ""}}
    {{(size || color) ? `<li style="margin:8px 0;padding:8px;background:rgba(220,53,69,0.1);border-radius:6px;border-left:4px solid #dc3545;">📐 <strong>সাইজ:</strong> {{size || "N/A"}} | 🎨 <strong>রঙ:</strong> {{color || "N/A"}}</li>` : ""}}
    {{customHTML}}
  </ul>
  {{desc ? `<div style="border:2px solid #dee2e6;padding:20px;border-radius:12px;max-width:500px;margin:20px auto;background:rgba(255,255,255,0.8);"><p style="margin:0;color:#495057;line-height:1.6;"><strong style="color:#2c3e50;">বিবরণ:</strong><br><br>{{desc}}</p></div>` : ""}}
  {{videoEmbed}}
  <p style="display:none;"><a href="#">{getProduct} $price={৳{{offer || price}}} $sale={৳{{price}}} $style={1}</a></p>
</div>

<script>
function switchMainImage(thumb, url) {
  document.getElementById(\'mainImg\').src = url;
  document.querySelectorAll(\'#thumbs img\').forEach(img => img.style.border = \'2px solid transparent\');
  thumb.style.border = \'2px solid #00bfff\';
}
</script>
`
  },
  {
    id: "template2",
    name: "আধুনিক টেমপ্লেট",
    description: "একটি পরিষ্কার এবং আধুনিক ডিজাইনের টেমপ্লেট।",
    html: `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
  <img src="{{mainImg}}" style="width: 100%; height: auto; display: block;">
  <div style="padding: 20px;">
    <h2 style="color: #333; margin-top: 0;">{{name}}</h2>
    <p style="font-size: 20px; color: #e44d26; font-weight: bold;">
      {{offer ? `<span style="text-decoration: line-through; color: #999; font-size: 16px;">৳{{price}}</span> ৳{{offer}}` : `৳{{price}}`}}
      {{discount ? `<span style="background-color: #e44d26; color: white; padding: 4px 8px; border-radius: 5px; font-size: 14px; margin-left: 10px;">{{discount}}% OFF</span>` : ""}}
    </p>
    <ul style="list-style: none; padding: 0; margin: 20px 0;">
      {{code ? `<li style="margin-bottom: 8px;"><strong>কোড:</strong> {{code}}</li>` : ""}}
      {{category ? `<li style="margin-bottom: 8px;"><strong>ক্যাটাগরি:</strong> {{category}}</li>` : ""}}
      {{brand ? `<li style="margin-bottom: 8px;"><strong>ব্র্যান্ড:</strong> {{brand}}</li>` : ""}}
      {{status ? `<li style="margin-bottom: 8px;"><strong>স্ট্যাটাস:</strong> {{status}}</li>` : ""}}
      {{delivery ? `<li style="margin-bottom: 8px;"><strong>ডেলিভারি:</strong> {{delivery}}</li>` : ""}}
      {{(size || color) ? `<li style="margin-bottom: 8px;"><strong>সাইজ:</strong> {{size || "N/A"}} | <strong>রঙ:</strong> {{color || "N/A"}}</li>` : ""}}
      {{customHTML}}
    </ul>
    {{desc ? `<p style="color: #555;"><strong>বিবরণ:</strong> {{desc}}</p>` : ""}}
    {{videoEmbed}}
    <a href="https://wa.me/{{wa}}?text=আমি {{name}} অর্ডার করতে চাই। কোড: {{code}}" style="display: block; background-color: #25D366; color: white; padding: 15px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;">WhatsApp এ অর্ডার করুন</a>
  </div>
</div>
`
  },
  {
    id: "template3",
    name: "ন্যূনতম টেমপ্লেট",
    description: "একটি সাধারণ এবং দ্রুত লোডিং টেমপ্লেট।",
    html: `
<div style="font-family: sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
  <h3 style="margin-top: 0;">{{name}}</h3>
  <img src="{{mainImg}}" style="width: 100%; height: auto;">
  <p><strong>মূল্য:</strong> ৳{{offer || price}}</p>
  {{desc ? `<p>{{desc}}</p>` : ""}}
  <a href="https://wa.me/{{wa}}" style="background-color: #007bff; color: white; padding: 8px 12px; text-decoration: none; border-radius: 3px;">অর্ডার করুন</a>
</div>
`
  }
];

function getOutputTemplates() {
  return outputTemplates;
}

function getTemplateById(id) {
  return outputTemplates.find(template => template.id === id);
}

function getSelectedTemplateId() {
  return localStorage.getItem("selectedOutputTemplate") || "default";
}


