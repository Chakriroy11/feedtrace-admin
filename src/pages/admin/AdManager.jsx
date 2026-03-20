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

  const [formData, setFormData] = useState({
    sponsorName: '',
    couponCode: '',
    discountText: '',
    bannerImage: '' 
  });

  // 🌟 FETCH ALL ADS (Synced with backend /all route)
  const fetchAds = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ads/all`);
      if (res.ok) {
        const data = await res.json();
        setAds(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load ads from Atlas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limit file size to 2MB for Atlas/Render stability
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ads/add`, {
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
        toast.error(data.error || "Failed to create ad.");
      }
    } catch (err) { 
      toast.error("Server Connection Error"); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ads/${id}/toggle`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success(`Ad is now ${currentStatus ? 'PAUSED' : 'LIVE'}`);
        setAds(ads.map(ad => ad._id === id ? { ...ad, isActive: !currentStatus } : ad));
      }
    } catch (err) { 
      toast.error("Toggle failed"); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign permanently?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ads/${id}`, { 
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
                  height: '120px', 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: '16px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: formData.bannerImage ? `url(${formData.bannerImage}) center/contain no-repeat` : '#f8fafc',
                  transition: 'all 0.2s ease'
                }}
              >
                {!formData.bannerImage && (
                  <>
                    <ImageIcon size={28} color="#94a3b8" />
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px' }}>Click to upload</span>
                  </>
                )}
              </div>
              <input id="adLogoUpload" type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </div>

            <button type="submit" disabled={submitting} style={{
              ...submitBtnStyle,
              background: submitting ? '#64748b' : '#0f172a',
            }}>
              {submitting ? 'Creating Campaign...' : '🚀 Launch Campaign'}
            </button>
          </form>
        </div>

        {/* --- RIGHT: CAMPAIGN DASHBOARD --- */}
        <div>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Live Performance</h3>
          
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <Loader2 className="animate-spin" size={32} color="#3b82f6" />
            </div>
          ) : ads.length === 0 ? (
            <div style={{ background: 'white', padding: '60px 20px', borderRadius: '24px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b', fontWeight: '500' }}>No active campaigns in Atlas database.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {ads.map(ad => (
                <div key={ad._id} style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row', 
                  alignItems: 'center', 
                  gap: '20px', 
                  background: 'white', 
                  padding: '20px', 
                  borderRadius: '24px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  opacity: ad.isActive ? 1 : 0.7 
                }}>
                  
                  {/* Logo Container */}
                  <div style={{ 
                    width: isMobile ? '100%' : '100px', 
                    height: isMobile ? '150px' : '100px', 
                    background: '#f1f5f9', 
                    borderRadius: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '10px'
                  }}>
                    <img src={ad.bannerImage} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>

                  {/* Campaign Info */}
                  <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.2rem' }}>{ad.sponsorName}</span>
                    </div>
                    <div style={{ color: '#475569', fontSize: '1rem', marginBottom: '10px', fontWeight: '600' }}>{ad.discountText}</div>
                    <div style={{ display: 'inline-block', background: '#f0f9ff', color: '#0369a1', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800', border: '1.5px dashed #0ea5e9' }}>
                      CODE: {ad.couponCode?.toUpperCase()}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'row' : 'column', 
                    gap: '10px', 
                    width: isMobile ? '100%' : '120px' 
                  }}>
                    <button onClick={() => handleToggle(ad._id, ad.isActive)} style={{ ...actionBtnStyle, flex: 1, background: ad.isActive ? '#fee2e2' : '#dcfce7', color: ad.isActive ? '#dc2626' : '#16a34a' }}>
                      <Power size={16}/> {ad.isActive ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={() => handleDelete(ad._id)} style={{ ...actionBtnStyle, flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                      <Trash2 size={16}/> Delete
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
const labelStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '8px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem', boxSizing: 'border-box', background: '#f8fafc', transition: 'border-color 0.2s ease' };
const submitBtnStyle = { width: '100%', padding: '18px', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px', transition: 'transform 0.1s ease' };
const actionBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem', border: 'none' };

export default AdManager;