import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Ticket, Trash2, Plus, Calendar } from 'lucide-react';

const ManageVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({ code: '', sponsor: '', discount: '', description: '', expiry: '' });
  const [loading, setLoading] = useState(false);

  // Fetch Vouchers
  const fetchVouchers = async () => {
    try {
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/vouchers/all');
      const data = await res.json();
      setVouchers(data);
    } catch (err) { console.error("Error fetching vouchers"); }
  };

  useEffect(() => { fetchVouchers(); }, []);

  // Add Voucher
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('${import.meta.env.VITE_API_URL}/api/vouchers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      alert("✅ Voucher Added!");
      setForm({ code: '', sponsor: '', discount: '', description: '', expiry: '' });
      fetchVouchers(); // Refresh list
    } catch (err) { alert("Error adding voucher"); }
    finally { setLoading(false); }
  };

  // Delete Voucher
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this voucher?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/vouchers/delete/${id}`, { method: 'DELETE' });
    fetchVouchers();
  };

  return (
    <AdminLayout title="Manage Sponsor Vouchers">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* ADD FORM */}
        <div style={{background: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '30px', color: 'white'}}>
          <h3 style={{display:'flex', gap:'10px', alignItems:'center', marginTop:0}}>
            <Plus size={20} color="#38bdf8"/> Add New Voucher
          </h3>
          <form onSubmit={handleSubmit} style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
            <input placeholder="Sponsor (e.g. Nike)" value={form.sponsor} onChange={e=>setForm({...form, sponsor:e.target.value})} required style={inputStyle}/>
            <input placeholder="Code (e.g. NIKE20)" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} required style={inputStyle}/>
            <input placeholder="Discount (e.g. 20% Off)" value={form.discount} onChange={e=>setForm({...form, discount:e.target.value})} required style={inputStyle}/>
            <input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} style={{...inputStyle, gridColumn: 'span 2'}}/>
            <input type="date" value={form.expiry} onChange={e=>setForm({...form, expiry:e.target.value})} required style={inputStyle}/>
            
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Adding...' : 'Create Voucher'}
            </button>
          </form>
        </div>

        {/* VOUCHER LIST */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
          {vouchers.map(v => (
            <div key={v._id} style={{background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div>
                  <h4 style={{margin:'0 0 5px 0', color:'#0f172a', fontSize:'1.1rem'}}>{v.sponsor}</h4>
                  <span style={{background:'#dbeafe', color:'#1e40af', padding:'4px 8px', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold'}}>
                    {v.code}
                  </span>
                </div>
                <div style={{textAlign:'right'}}>
                   <h2 style={{margin:0, color:'#16a34a'}}>{v.discount}</h2>
                </div>
              </div>
              <p style={{color:'#64748b', fontSize:'0.9rem', margin:'10px 0'}}>{v.description}</p>
              
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'15px', borderTop:'1px solid #f1f5f9', paddingTop:'10px'}}>
                <span style={{fontSize:'0.8rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:'5px'}}>
                  <Calendar size={14}/> Exp: {new Date(v.expiry).toLocaleDateString()}
                </span>
                <button onClick={() => handleDelete(v._id)} style={{background:'none', border:'none', cursor:'pointer', color:'#ef4444'}}>
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
};

// Styles
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' };
const btnStyle = { background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

export default ManageVouchers;