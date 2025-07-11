// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FaLock, FaUserShield, FaSignInAlt, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo user login logic
    if (email === "mehedi" && password === "ifty.hack") {
      setEmail("demo@g9tool.com"); // Replace with a real email for Firebase auth
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('ভুল ইউজারনেম অথবা পাসওয়ার্ড।');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="header-top">
        <div className="header-title"><FaLock /> G9 Tool</div>
        <a href="https://t.me/mehedi_exx" target="_blank" rel="noopener noreferrer" className="telegram"><FaTelegramPlane /></a>
      </div>
      <div className="login-box">
        <h2><FaUserShield /> লগইন করুন</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            id="username"
            placeholder="ইউজারনেম অথবা ইমেইল"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            id="password"
            placeholder="পাসওয়ার্ড"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button className="login-btn" type="submit" disabled={loading}>
            <FaSignInAlt /> {loading ? 'লোড হচ্ছে...' : 'লগইন'}
          </button>
        </form>
        <div className="contact-links">
          প্রিমিয়াম এক্সেস নিতে যোগাযোগ করুন:
          <br />
          <a href="https://wa.me/8801627647776" target="_blank" rel="noopener noreferrer"><FaWhatsapp /> WhatsApp</a> |
          <a href="https://t.me/mehedi_exx" target="_blank" rel="noopener noreferrer"><FaTelegramPlane /> Telegram</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
