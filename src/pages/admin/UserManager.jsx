import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { User, Mail, Shield } from 'lucide-react';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 🌟 FIX: Switched to backticks (`) to correctly inject the VITE_API_URL
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/users`) 
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  return (
    <AdminLayout title="Registered Users">
      {loading ? (
        <div style={{ color: '#64748b', padding: '20px' }}>Loading users...</div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
          {users.map((user) => (
            <div key={user._id} style={{background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{background: '#f1f5f9', padding: '15px', borderRadius: '50%', color: '#64748b'}}>
                <User size={24} />
              </div>
              <div>
                <h4 style={{margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1e293b'}}>{user.username}</h4>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem'}}>
                  <Mail size={14}/> {user.email}
                </div>
                <div style={{marginTop: '10px'}}>
                  <span style={{
                     background: user.role === 'admin' ? '#dcfce7' : '#e0f2fe',
                     color: user.role === 'admin' ? '#166534' : '#0284c7',
                     padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px'
                  }}>
                     {user.role === 'admin' && <Shield size={10}/>} {(user.role || 'user').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && users.length === 0 && (
        <p style={{color: '#64748b', marginTop: '20px'}}>No users found or API not connected.</p>
      )}
    </AdminLayout>
  );
};

export default UserManager;