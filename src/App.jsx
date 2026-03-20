import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- NEW: Import the Gatekeeper ---
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ReviewManager from './pages/admin/ReviewManager';
import ProductManager from './pages/admin/ProductManager'; 
import UserManager from './pages/admin/UserManager'; 
import AddProduct from './pages/AddProduct'; 
import Analysis from './pages/admin/Analysis'; 
import AdManager from './pages/admin/AdManager';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* --- 🔒 PROTECTED ADMIN ROUTES --- */}
        {/* We wrap all these routes inside the ProtectedRoute component */}
        <Route element={<ProtectedRoute isAdminOnly={true} />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/reviews" element={<ReviewManager />} />
          <Route path="/admin/products" element={<ProductManager />} />
          <Route path="/admin/users" element={<UserManager />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/admin/analytics" element={<Analysis />} />
          <Route path="/admin/ads" element={<AdManager />} />
        </Route>

        {/* Fallback for old paths or 404s */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;