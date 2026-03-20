import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';
import logoImg from '../assets/logo.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 🌟 DEBUG: Check your browser console (F12) to see if this URL is correct
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/auth/login`;
    console.log("🚀 Attempting login at:", apiUrl);
    
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // 🌟 GUARD: Prevents crash if Backend returns a 404 HTML page
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("The server sent back HTML instead of JSON. Check your VITE_API_URL in .env");
      }

      const data = await res.json();
      
      if (res.ok) {
        const userData = data.user || data; 

        // 🌟 ADMIN CHECK: Since Atlas data is fresh, verify the role
        if (userData.role !== 'admin') {
          toast.error("🚫 Access Denied: This account is not an Admin in Atlas.");
          setLoading(false);
          return;
        }

        // 🌟 LOCAL STORAGE SYNC: Important for ProtectedRoute
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        
        // Secondary keys for UI components
        localStorage.setItem('feedtrace_admin_name', userData.username || userData.name);
        localStorage.setItem('feedtrace_admin_role', userData.role);
        
        toast.success(`Welcome back, ${userData.username || 'Admin'}!`);
        navigate('/admin/dashboard', { replace: true }); 
      } else {
        toast.error(data.error || "Invalid Credentials. Did you re-register in Atlas?");
      }
    } catch (err) { 
      console.error("Login Error:", err);
      toast.error(err.message || "Connection Refused: Is the Backend running?"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
         <div className="image-wrapper login-mode">
            <img src={logoImg} alt="FeedTrace Admin" className="auth-brand-img" />
         </div>
         <div className="overlay-gradient"></div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
               <ShieldCheck size={28} color="#0ea5e9"/> 
               <span style={{fontSize:'0.9rem', color:'#64748b', fontWeight:'700', letterSpacing:'1px'}}>ADMIN PORTAL</span>
            </div>
            <h2>Welcome Back!</h2>
            <p>Manage your <span>FeedTrace</span> system.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <Mail size={20} className="input-icon"/>
              <input 
                type="email" 
                name="email" 
                placeholder="Admin Email" 
                required 
                onChange={handleChange} 
                value={formData.email}
                autoComplete="email"
              />
            </div>
            
            <div className="input-group">
              <Lock size={20} className="input-icon"/>
              <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                required 
                onChange={handleChange} 
                value={formData.password}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Verifying Identity...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '25px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>
              Migrated to Atlas? You need a new account.
            </p>
            <button 
              onClick={() => navigate('/signup')} 
              style={{
                background: '#f0f9ff',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '0 auto',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e0f2fe'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f0f9ff'}
            >
              <UserPlus size={18}/> Register New Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;