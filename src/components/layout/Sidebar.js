// src/components/layout/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTimes, FaBook, FaUserCog, FaCogs, FaBloggerB } from 'react-icons/fa';
import './Layout.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
      <button className="close-sidebar" onClick={toggleSidebar}>
        <FaTimes />
      </button>
      <nav>
        <NavLink to="/dashboard" onClick={toggleSidebar}><FaBloggerB /> ড্যাশবোর্ড</NavLink>
        <NavLink to="/admin" onClick={toggleSidebar}><FaUserCog /> এডমিন প্যানেল</NavLink>
        <NavLink to="/field-manager" onClick={toggleSidebar}><FaCogs /> ফিল্ড কাস্টমাইজ</NavLink>
        <NavLink to="/tutorial" onClick={toggleSidebar}><FaBook /> টিউটোরিয়াল</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
