import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout'; 
import { Plus, Trash2, Power, Image as ImageIcon, Tag, Gift, Percent, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useResponsive } from '../../hooks/useResponsive'; 

const AdManager = () => {
  const { isMobile } = useResponsive(); 
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const getBaseUrl = () => {
    const base = import.meta.env.VITE_API_URL || 'https://feedtrace-api.onrender.com';
    return base.replace(/\/$/, '');
  };

  const [formData, setFormData] = useState({
    sponsorName: '',
    couponCode: '',
    discountText: '',
    bannerImage: '' 
  });

  const fetchAds = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/ads/all`);
      if (res.ok) {
        const data = await res.json();
        setAds(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, bannerImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bannerImage) return toast.error("Upload a logo!");
    setSubmitting(true);
    
    try {
      const res = await fetch(`${getBaseUrl()}/api/ads/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (res.ok) {
        toast.success("🚀 Campaign Launched!");
        setFormData({ sponsorName: '', couponCode: '', discountText: '', bannerImage: '' });
        fetchAds();
      } else {
        toast.error(data.error || "Check all fields");
      }
    } catch (err) { 
      toast.error("Connection error"); 
    } finally { 
      setSubmitting(false); 
    }
  };

  // ... (handleToggle and handleDelete remain same)

  return (
    <AdminLayout title="Campaign Manager">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr', gap: '30px' }}>
        
        {/* CREATE FORM */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h3 style={{ fontWeight: '800', marginBottom: '20px' }}>New Campaign</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" name="sponsorName" placeholder="Sponsor Name" required value={formData.sponsorName} onChange={(e) => setFormData({...formData, sponsorName: e.target.value})} style={inputStyle} />
            <input type="text" name="discountText" placeholder="Offer (e.g. 50% Off)" required value={formData.discountText} onChange={(e) => setFormData({...formData, discountText: e.target.value})} style={inputStyle} />
            <input type="text" name="couponCode" placeholder="Promo Code" required value={formData.couponCode} onChange={(e) => setFormData({...formData, couponCode: e.target.value})} style={inputStyle} />
            
            <div onClick={() => document.getElementById('fileIn').click()} style={uploadBoxStyle}>
              {formData.bannerImage ? <img src={formData.bannerImage} style={{height: '100%'}} /> : "Upload Logo"}
            </div>
            <input id="fileIn" type="file" hidden onChange={handleImageUpload} />

            <button type="submit" disabled={submitting} style={submitBtnStyle}>
              {submitting ? <Loader2 className="animate-spin" /> : "Launch Campaign"}
            </button>
          </form>
        </div>

        {/* LIST VIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {ads.map(ad => (
            <div key={ad._id} style={adCardStyle}>
              <img src={ad.bannerImage} loading="lazy" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '800' }}>{ad.sponsorName}</div>
                <div style={{ color: '#64748b' }}>{ad.discountText}</div>
              </div>
              <button onClick={() => handleDelete(ad._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={20}/></button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const uploadBoxStyle = { height: '100px', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const submitBtnStyle = { background: '#0f172a', color: 'white', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const adCardStyle = { display: 'flex', alignItems: 'center', gap: '20px', background: 'white', padding: '15px', borderRadius: '20px', border: '1px solid #f1f5f9' };

export default AdManager;