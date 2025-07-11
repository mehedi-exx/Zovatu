// src/components/layout/Header.js

import React from 'react';
import { FaBars, FaTelegramPlane, FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Layout.css';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="header">
      <div className="left-icons">
        <button className="menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>
      <div className="logo">
        <i className="fas fa-toolbox"></i> G9Tool
      </div>
      <div className="right-icons">
        <a className="telegram-icon" href="https://t.me/yourchannel" target="_blank" rel="noopener noreferrer">
          <FaTelegramPlane />
        </a>
        <button className="logout-btn" onClick={handleLogout} title="লগ আউট">
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
};

export default Header;
