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

  // 🛡️ API URL Helper
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
      console.error(err);
      toast.error("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
        toast.success("Logo processed!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bannerImage) {
      toast.error("Please upload a sponsor logo!");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/ads/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sponsorName: formData.sponsorName,
            bannerImage: formData.bannerImage,
            couponCode: formData.couponCode,
            discountText: formData.discountText,
            isActive: true // Default status for new ads
        })
      });
      
      const data = await res.json();

      if (res.ok) {
        toast.success("🚀 Campaign Launched!");
        setFormData({ sponsorName: '', couponCode: '', discountText: '', bannerImage: '' });
        fetchAds();
      } else {
        // Log the specific error to console to help you debug schema mismatches
        console.error("Submission Error:", data);
        toast.error(data.error || "Failed to create ad. Check console.");
      }
    } catch (err) { 
      toast.error("Server Connection Error"); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/ads/${id}/toggle`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success(`Ad is now ${currentStatus ? 'PAUSED' : 'LIVE'}`);
        // Locally update the UI for instant feedback
        setAds(ads.map(ad => ad._id === id ? { ...ad, isActive: !currentStatus } : ad));
      }
    } catch (err) { 
      toast.error("Toggle failed"); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign permanently?")) return;
    try {
      const res = await fetch(`${getBaseUrl()}/api/ads/${id}`, { 
        method: 'DELETE' 
      });
      if (res.ok) {
        toast.success("Campaign Deleted.");
        setAds(ads.filter(ad => ad._id !== id));
      }
    } catch (err) { 
      toast.error("Delete failed"); 
    }
  };

  return (
    <AdminLayout title="Campaign Manager">
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr', 
        gap: '30px', 
        paddingBottom: isMobile ? '80px' : '40px' 
      }}>
        
        {/* --- LEFT: CREATE AD FORM --- */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', height: 'fit-content', position: isMobile ? 'relative' : 'sticky', top: '20px' }}>
          <h3 style={{ margin: '0 0 25px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: '800' }}>
            <Plus size={22} color="#3b82f6" /> New Campaign
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}><Gift size={14}/> Sponsor Name</label>
              <input type="text" name="sponsorName" placeholder="e.g. Nike" required value={formData.sponsorName} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}><Percent size={14}/> Promo Offer</label>
              <input type="text" name="discountText" placeholder="e.g. 20% Off All Shoes" required value={formData.discountText} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}><Tag size={14}/> Promo Code</label>
              <input type="text" name="couponCode" placeholder="e.g. NIKE20" required value={formData.couponCode} onChange={handleChange} style={{ ...inputStyle, textTransform: 'uppercase', fontWeight: '800', color: '#3b82f6' }} />
            </div>

            <div>
              <label style={labelStyle}>Campaign Logo</label>
              <div 
                onClick={() => document.getElementById('adLogoUpload').click()} 
                style={{ 
                  height: '140px', 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: '20px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: formData.bannerImage ? `url(${formData.bannerImage}) center/contain no-repeat white` : '#f8fafc',
                  transition: 'all 0.2s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                {!formData.bannerImage && (
                  <>
                    <ImageIcon size={32} color="#94a3b8" />
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px', fontWeight: '600' }}>Upload Sponsor Logo</span>
                  </>
                )}
              </div>
              <input id="adLogoUpload" type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </div>

            <button type="submit" disabled={submitting} style={{
              ...submitBtnStyle,
              background: submitting ? '#64748b' : '#0f172a',
            }}>
              {submitting ? <><Loader2 className="animate-spin" size={20}/> Launching...</> : '🚀 Launch Campaign'}
            </button>
          </form>
        </div>

        {/* --- RIGHT: CAMPAIGN DASHBOARD --- */}
        <div>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Active Campaigns</h3>
          
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <Loader2 className="animate-spin" size={40} color="#3b82f6" />
            </div>
          ) : ads.length === 0 ? (
            <div style={{ background: 'white', padding: '80px 20px', borderRadius: '28px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
              <ImageIcon size={48} color="#cbd5e1" style={{marginBottom: '15px'}}/>
              <p style={{ color: '#64748b', fontWeight: '600', fontSize: '1.1rem' }}>No active campaigns in database.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {ads.map(ad => (
                <div key={ad._id} style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row', 
                  alignItems: 'center', 
                  gap: '24px', 
                  background: 'white', 
                  padding: '24px', 
                  borderRadius: '28px', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.03)',
                  opacity: ad.isActive ? 1 : 0.65,
                  transition: 'all 0.3s ease'
                }}>
                  
                  {/* Logo Container */}
                  <div style={{ 
                    width: isMobile ? '100%' : '110px', 
                    height: isMobile ? '160px' : '110px', 
                    background: '#f8fafc', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '12px',
                    border: '1px solid #f1f5f9'
                  }}>
                    <img src={ad.bannerImage} loading="lazy" alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>

                  {/* Campaign Info */}
                  <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '1.3rem', letterSpacing: '-0.5px' }}>{ad.sponsorName}</span>
                    </div>
                    <div style={{ color: '#475569', fontSize: '1rem', marginBottom: '12px', fontWeight: '600', lineHeight: 1.4 }}>{ad.discountText}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#2563eb', padding: '10px 18px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: '900', border: '1.5px dashed #3b82f6' }}>
                      <Tag size={16}/> {ad.couponCode?.toUpperCase()}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'row' : 'column', 
                    gap: '12px', 
                    width: isMobile ? '100%' : '130px' 
                  }}>
                    <button onClick={() => handleToggle(ad._id, ad.isActive)} style={{ ...actionBtnStyle, flex: 1, background: ad.isActive ? '#fff1f2' : '#f0fdf4', color: ad.isActive ? '#e11d48' : '#16a34a', border: ad.isActive ? '1px solid #fecaca' : '1px solid #bbf7d0' }}>
                      <Power size={16}/> {ad.isActive ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={() => handleDelete(ad._id)} style={{ ...actionBtnStyle, flex: 1, background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
                      <Trash2 size={16}/> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// Styles
const labelStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' };
const inputStyle = { width: '100%', padding: '16px', borderRadius: '16px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', boxSizing: 'border-box', background: '#f8fafc', transition: 'all 0.2s ease', fontWeight: '500' };
const submitBtnStyle = { width: '100%', padding: '20px', color: 'white', border: 'none', borderRadius: '18px', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const actionBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem' };

export default AdManager;