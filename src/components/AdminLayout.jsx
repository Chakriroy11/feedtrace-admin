import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  PackagePlus, 
  Package, 
  Users, 
  BarChart3, 
  LogOut,
  Megaphone,
} from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import toast from 'react-hot-toast'; // 🌟 Added toast for logout feedback

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { path: '/admin/reviews', label: 'Reviews', icon: <CheckSquare size={20}/> },
    { path: '/admin/products', label: 'Products', icon: <Package size={20}/> },
    { path: '/admin/add-product', label: 'Add', icon: <PackagePlus size={20}/> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20}/> },
    { path: '/admin/ads', label: 'Ads', icon: <Megaphone size={20}/> },
    { path: '/admin/analytics', label: 'Stats', icon: <BarChart3 size={20}/> },
  ];

  // --- UPDATED LOGOUT LOGIC ---
  const handleLogout = () => {
    if(window.confirm("Logout of Admin Console?")) {
      // 1. Clear session data to trigger ProtectedRoute block
      localStorage.removeItem('user'); 
      localStorage.removeItem('token');
      
      // 2. Clear role if you use that specific key
      localStorage.removeItem('feedtrace_user_role'); 

      toast.success("Logged out successfully");

      // 3. Redirect and clear history stack
      navigate('/login', { replace: true });
    }
  };

  return (
    <div style={{
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      background: isMobile ? '#f8fafc' : '#0f172a'
    }}>
      
      {/* --- SIDEBAR / MOBILE NAV --- */}
      <aside style={{
        width: isMobile ? '100%' : '260px', 
        height: isMobile ? '70px' : '100vh',
        background: '#1e293b', 
        padding: isMobile ? '0 10px' : '20px', 
        display: 'flex', 
        flexDirection: isMobile ? 'row' : 'column', 
        borderRight: isMobile ? 'none' : '1px solid #334155',
        borderTop: isMobile ? '1px solid #334155' : 'none',
        position: isMobile ? 'fixed' : 'relative',
        bottom: isMobile ? 0 : 'auto',
        zIndex: 1000,
        flexShrink: 0 
      }}>
        {!isMobile && (
          <h2 style={{color: '#38bdf8', marginBottom: '40px', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px'}}>
            FeedTrace <span style={{color: 'white'}}>Admin</span>
          </h2>
        )}
        
        <nav style={{
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column', 
          gap: isMobile ? '5px' : '8px',
          width: '100%',
          overflowX: isMobile ? 'auto' : 'visible', 
          paddingBottom: isMobile ? '5px' : '0',
          scrollbarWidth: 'none'
        }}>
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center', 
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  gap: isMobile ? '4px' : '12px', 
                  padding: isMobile ? '10px 15px' : '12px',
                  minWidth: isMobile ? '70px' : 'auto',
                  background: isActive ? '#0ea5e9' : 'transparent',
                  color: isActive ? 'white' : '#94a3b8',
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: '0.2s all'
                }}
              >
                {item.icon} 
                <span style={{ fontSize: isMobile ? '10px' : '14px' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button 
          onClick={handleLogout} 
          style={{
            marginTop: isMobile ? '0' : 'auto', 
            marginLeft: isMobile ? '10px' : '0',
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: isMobile ? '10px' : '12px', 
            background: 'rgba(239,68,68,0.1)', 
            color: '#ef4444', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '800', 
            cursor: 'pointer'
          }}
        >
          <LogOut size={20}/> {!isMobile && 'Logout'}
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main style={{
        flex: 1, 
        padding: isMobile ? '20px' : '30px', 
        paddingBottom: isMobile ? '90px' : '30px', 
        overflowY: 'auto', 
        height: '100%', 
        background: '#f8fafc' 
      }}>
        <header style={{
          marginBottom: isMobile ? '20px' : '30px', 
          borderBottom: '1px solid #e2e8f0', 
          paddingBottom: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            color: '#0f172a', 
            fontSize: isMobile ? '1.5rem' : '2rem', 
            fontWeight: '800'
          }}>{title}</h1>

          {/* 👤 Admin Name Badge */}
          {!isMobile && localStorage.getItem('user') && (
            <div style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold'}}>
              Logged in as: <span style={{color: '#0ea5e9'}}>{JSON.parse(localStorage.getItem('user')).username}</span>
            </div>
          )}
        </header>

        <div style={{ width: '100%', overflowX: 'hidden' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;