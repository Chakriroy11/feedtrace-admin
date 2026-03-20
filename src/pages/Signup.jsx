import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';
import logoImg from '../assets/logo.jpg';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    secretKey: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🌟 BACKTICK FIX: Ensures the variable is evaluated
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("✅ Admin Registered in Atlas! Please Login.");
        navigate('/login');
      } else {
        toast.error(data.error || "Signup Failed");
      }
    } catch (err) { 
      console.error(err);
      toast.error("Connection Error: Is the Backend Live?"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="image-wrapper signup-mode">
          <img src={logoImg} alt="FeedTrace" className="auth-brand-img" />
        </div>
        <div className="overlay-gradient"></div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <button onClick={() => navigate('/login')} className="back-btn">
            <ArrowLeft size={16} /> Back to Login
          </button>
          
          <div className="auth-header">
            <h2>New Admin Registration</h2>
            <p>Syncing with <span>MongoDB Atlas</span> Cloud.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <User size={20} className="input-icon"/>
              <input type="text" name="username" placeholder="Full Name" required onChange={handleChange} />
            </div>

            <div className="input-group">
              <Mail size={20} className="input-icon"/>
              <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
            </div>
            
            <div className="input-group">
              <Lock size={20} className="input-icon"/>
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
            </div>

            <div className="input-group" style={{ border: '1px solid #fcd34d' }}>
              <KeyRound size={20} className="input-icon" style={{color: '#d97706'}}/>
              <input 
                type="text" 
                name="secretKey" 
                placeholder="Admin Secret Key" 
                required 
                onChange={handleChange} 
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Registering...' : 'Create Atlas Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;