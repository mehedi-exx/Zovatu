// src/pages/AdminPanel.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductDrafts, deleteProductDraft } from '../firebase/firestoreService';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import './AdminPanel.css';

const AdminPanel = () => {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const fetchedDrafts = await getProductDrafts();
                setDrafts(fetchedDrafts);
            } catch (error) {
                console.error("Error fetching drafts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDrafts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("আপনি কি সত্যিই এই ড্রাফটটি ডিলিট করতে চান?")) {
            try {
                await deleteProductDraft(id);
                setDrafts(drafts.filter(d => d.id !== id));
                alert("ড্রাফট ডিলিট হয়েছে।");
            } catch (error) {
                alert("ডিলিট করতে সমস্যা হয়েছে।");
            }
        }
    };

    const handleEdit = (draft) => {
        navigate('/dashboard', { state: { draft } });
    };
    
    const filteredDrafts = drafts.filter(d => 
        (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.code && d.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="container"><p>ড্রাফট লোড হচ্ছে...</p></div>;

    return (
        <div className="admin-container container">
            <div className="card">
                <h2>📦 সেভ করা প্রোডাক্ট লিস্ট</h2>
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="🔍 প্রোডাক্ট খুঁজুন (নাম বা কোড)"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div id="draftList">
                    {filteredDrafts.length > 0 ? (
                        filteredDrafts.map(d => (
                            <div key={d.id} className="draft-item">
                                <div className="draft-header">
                                    <div className="draft-name">🔖 {d.name} ({d.code})</div>
                                    <div className="actions">
                                        <button onClick={() => handleEdit(d)}><FaEdit /> Edit</button>
                                        <button onClick={() => handleDelete(d.id)} className="delete-btn"><FaTrash /> Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>❌ কোনো ড্রাফট পাওয়া যায়নি</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
