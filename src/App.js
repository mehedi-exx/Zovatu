// src/App.js

import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
// Placeholder pages - আমরা পরে তৈরি করব
const AdminPanel = () => <div className="container"><h2>Admin Panel Page</h2></div>;
const FieldManager = () => <div className="container"><h2>Field Manager Page</h2></div>;
const TutorialPage = () => <div className="container"><h2>Tutorial Page</h2></div>;


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Don't show header/sidebar on login page
  const showLayout = location.pathname !== '/';

  return (
    <AuthProvider>
      {showLayout && <Header toggleSidebar={toggleSidebar} />}
      {showLayout && <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
      
      <main className={showLayout ? 'main-content' : ''}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route 
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/field-manager"
            element={
              <ProtectedRoute>
                <FieldManager />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/tutorial"
            element={
              <ProtectedRoute>
                <TutorialPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </AuthProvider>
  );
}

export default App;
