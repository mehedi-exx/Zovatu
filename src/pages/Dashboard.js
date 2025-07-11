// src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPlus, FaImage, FaMagic, FaCopy, FaSave } from 'react-icons/fa';
import { saveProductDraft, updateProductDraft } from '../firebase/firestoreService';
import './Dashboard.css';

const initialFormData = {
  name: '', code: '', price: '', offer: '', unit: '', qty: '', brand: '',
  size: '', color: '', delivery: '', status: '', category: '', desc: '',
  video: '', wa: '', images: [''], customFields: [{ key: '', value: '' }],
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const draftToEdit = location.state?.draft;

  const [formData, setFormData] = useState(draftToEdit || initialFormData);
  const [generatedCode, setGeneratedCode] = useState('');
  const [livePreview, setLivePreview] = useState('');
  
  useEffect(() => {
    if (draftToEdit) {
      setFormData(draftToEdit);
    }
  }, [draftToEdit]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleCustomFieldChange = (index, keyOrValue, value) => {
    const newCustomFields = [...formData.customFields];
    newCustomFields[index][keyOrValue] = value;
    setFormData(prev => ({ ...prev, customFields: newCustomFields }));
  };

  const addCustomField = () => {
    setFormData(prev => ({ ...prev, customFields: [...prev.customFields, { key: '', value: '' }] }));
  };

  const generateCode = () => {
    // This is a simplified HTML generator. You can customize this extensively.
    const previewHtml = `
      <div class="product-card-preview">
        <h3>${formData.name} (${formData.code})</h3>
        ${formData.images[0] ? `<img src="${formData.images[0]}" alt="${formData.name}" style="max-width:100%; border-radius:8px;" />` : ''}
        <p><strong>মূল্য:</strong> ৳${formData.price}</p>
        ${formData.offer ? `<p><strong>অফার মূল্য:</strong> ৳${formData.offer}</p>` : ''}
        <p>${formData.desc}</p>
        <button style="background:#25D366; color:white; padding:10px 15px; border:none; border-radius:5px; cursor:pointer;">Order on WhatsApp</button>
      </div>
    `;
    setLivePreview(previewHtml);
    setGeneratedCode(previewHtml); // For simplicity, we use the same code. In reality, this would be a more complex HTML structure.
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      alert('কোড কপি করা হয়েছে!');
    } else {
      alert('প্রথমে কোড জেনারেট করুন।');
    }
  };

  const handleSaveDraft = async () => {
    try {
        if (formData.id) {
            // Update existing draft
            await updateProductDraft(formData.id, formData);
            alert('ড্রাফট সফলভাবে আপডেট হয়েছে!');
        } else {
            // Save new draft
            const newDraftId = await saveProductDraft(formData);
            setFormData(prev => ({...prev, id: newDraftId}));
            alert('ড্রাফট সফলভাবে সেভ হয়েছে!');
        }
        navigate('/admin');
    } catch (error) {
        alert('ড্রাফট সেভ করতে সমস্যা হয়েছে।');
        console.error(error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="form-wrapper card">
        <div id="formFields">
          <input type="text" id="name" placeholder="প্রোডাক্ট নাম" value={formData.name} onChange={handleChange} />
          <input type="text" id="code" placeholder="প্রোডাক্ট কোড" value={formData.code} onChange={handleChange} />
          <input type="number" id="price" placeholder="মূল্য (৳)" value={formData.price} onChange={handleChange} />
          <input type="number" id="offer" placeholder="অফার মূল্য (ঐচ্ছিক)" value={formData.offer} onChange={handleChange} />
          <textarea id="desc" rows="3" placeholder="প্রোডাক্ট বর্ণনা" value={formData.desc} onChange={handleChange}></textarea>
          <input type="url" id="video" placeholder="ভিডিও লিংক (YouTube)" value={formData.video} onChange={handleChange} />
          <input type="tel" id="wa" placeholder="WhatsApp নম্বর" value={formData.wa} onChange={handleChange} />

          <div id="imageInputs">
            <h4>ছবির লিংক</h4>
            {formData.images.map((url, index) => (
              <input key={index} type="url" className="img-url" placeholder="Image URL" value={url} onChange={(e) => handleImageChange(index, e.target.value)} />
            ))}
          </div>

          <div id="customFields">
            <h4>কাস্টম তথ্য</h4>
            {formData.customFields.map((field, index) => (
              <div key={index} className="custom-field-group">
                <input type="text" className="custom-key" placeholder="শিরোনাম" value={field.key} onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)} />
                <input type="text" className="custom-value" placeholder="মান" value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} />
              </div>
            ))}
          </div>

          <div className="button-group">
            <button onClick={addCustomField} type="button"><FaPlus /> কাস্টম তথ্য যোগ করুন</button>
            <button onClick={addImageField} type="button"><FaImage /> আরও ছবি যোগ করুন</button>
          </div>
        </div>

        <br />
        <div className="button-group">
            <button onClick={generateCode} className="generate-btn"><FaMagic /> জেনারেট</button>
            <button onClick={copyToClipboard} className="copy-btn"><FaCopy /> কপি করুন</button>
            <button onClick={handleSaveDraft} className="save-btn"><FaSave /> ড্রাফট সেভ করুন</button>
        </div>
      </div>

      <div className="output-wrapper">
          <div className="live-preview card">
              <h3>লাইভ প্রিভিউ</h3>
              <div id="preview" dangerouslySetInnerHTML={{ __html: livePreview || "<p>এখানে প্রিভিউ দেখানো হবে...</p>" }}></div>
          </div>
          <div className="output card">
              <h3>জেনারেটেড কোড</h3>
              <pre id="output-code">{generatedCode || "এখানে কোড দেখানো হবে..."}</pre>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
