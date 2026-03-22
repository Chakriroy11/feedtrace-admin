import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout'; 
import { CheckCircle, XCircle, Trash2, BellRing, X, Eye, ShieldCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useResponsive } from '../../hooks/useResponsive'; 

const ReviewManager = () => {
  const { isMobile } = useResponsive(); 
  const [reviews, setReviews] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null); 

  // 🌍 Global API URL fallback
  const BASE_URL = import.meta.env.VITE_API_URL || 'https://feedtrace-api.onrender.com';

  // --- FIXED FETCH FUNCTION ---
  const fetchReviewsAndAlerts = async () => {
    try {
      // 🌟 Using allSettled so one 404 doesn't crash the other request
      const [revRes, alertRes] = await Promise.allSettled([
        fetch(`${BASE_URL}/api/reviews/all`),
        fetch(`${BASE_URL}/api/reviews/notifications`)
      ]);
      
      // Process Reviews
      if (revRes.status === 'fulfilled' && revRes.value.ok) {
        const revData = await revRes.value.json();
        if (Array.isArray(revData)) setReviews(revData);
      } else {
        console.warn("Reviews API failed or returned 404");
      }

      // Process Alerts
      if (alertRes.status === 'fulfilled' && alertRes.value.ok) {
        const alertData = await alertRes.value.json();
        if (Array.isArray(alertData)) setAlerts(alertData);
      } else {
        console.warn("Notifications API failed or returned 404");
      }

    } catch (err) { 
      console.error("Fetch Error:", err); 
      toast.error("Connectivity issue. Check backend status.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchReviewsAndAlerts(); 
  }, []);

  const handleStatus = async (id, newStatus) => {
    if (!window.confirm(`Mark this review as ${newStatus}?`)) return;
    const isVerified = newStatus === 'approved'; 
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, isVerifiedPurchase: isVerified })
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
        setSelectedReview(null); 
        toast.success(`Review marked as ${newStatus}!`);
      } else {
        toast.error("Failed to update status on server.");
      }
    } catch (err) { toast.error("Error updating status"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Delete this review permanently?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(prev => prev.filter(review => review._id !== id));
        setSelectedReview(null);
        toast.success("Review deleted.");
      }
    } catch (err) { toast.error("Server Error during deletion"); }
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return '#22c55e'; 
    if (status === 'rejected') return '#ef4444'; 
    return '#eab308'; 
  };

  return (
    <AdminLayout title="Review Moderation">
      
      {/* 1. ALERTS SECTION */}
      {alerts.length > 0 && (
        <div style={{marginBottom: '20px', background: 'white', padding: isMobile ? '15px' : '20px', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: isMobile ? '1rem' : '1.2rem'}}>
            <BellRing size={18} color="#3b82f6"/> AI Triage ({alerts.length})
          </h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto'}}>
            {alerts.map(alert => (
              <div key={alert._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: alert.type === 'danger' ? '#fef2f2' : '#f0fdf4', borderLeft: '4px solid #ef4444' }}>
                <span style={{fontSize: '0.8rem', fontWeight: '600'}}>{alert.message}</span>
                <X size={14} style={{cursor: 'pointer'}} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. STATS GRID */}
      <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap:'12px', marginBottom:'25px'}}>
        <div style={{background:'#1e293b', padding:'15px', borderRadius:'16px', color:'white', borderLeft:'4px solid #eab308'}}>
          <div style={{fontSize: isMobile ? '1.5rem' : '2rem', fontWeight:'900'}}>{reviews.filter(r => r.status === 'pending').length}</div>
          <div style={{fontSize:'0.75rem', color:'#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Pending</div>
        </div>
        <div style={{background:'#1e293b', padding:'15px', borderRadius:'16px', color:'white', borderLeft:'4px solid #3b82f6'}}>
          <div style={{fontSize: isMobile ? '1.5rem' : '2rem', fontWeight:'900'}}>{reviews.length}</div>
          <div style={{fontSize:'0.75rem', color:'#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Total</div>
        </div>
      </div>

      {/* 3. REVIEW CARDS */}
      <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: isMobile ? '15px' : '20px'}}>
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#64748b' }}>Connecting to FeedTrace API...</p>
        ) : reviews.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#64748b' }}>No reviews found in database.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} style={{background:'white', padding: isMobile ? '15px' : '20px', borderRadius:'16px', border:'1px solid #e2e8f0', display:'flex', flexDirection:'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
              
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'15px'}}>
                <div style={{maxWidth: '70%'}}>
                  <h4 style={{color:'#1e293b', margin:0, fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: '800'}}>{review.productName}</h4>
                  <div style={{fontSize:'0.75rem', color:'#64748b'}}>By <b>{review.user}</b></div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{ fontSize:'0.65rem', fontWeight:'800', color: 'white', background: getStatusColor(review.status), padding:'3px 8px', borderRadius:'20px' }}>
                    {review.status}
                  </span>
                  <button onClick={() => handleDelete(review._id)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{marginBottom:'15px', flex:1}}>
                <p style={{color:'#475569', fontSize:'0.85rem', lineHeight:'1.5', background:'#f8fafc', padding:'10px', borderRadius:'10px', margin:0, fontStyle: 'italic', border: '1px solid #f1f5f9'}}>
                  "{review.comment}"
                </p>
              </div>

              {/* PROOF SECTION */}
              <div style={{display:'flex', gap:'10px', alignItems:'center', background:'#f1f5f9', padding:'10px', borderRadius:'12px', marginBottom:'15px', border: '1px dashed #cbd5e1'}}>
                {review.billImage ? (
                  <>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.7rem', fontWeight:'800', color:'#334155'}}>Bill Score</div>
                      <div style={{fontSize:'0.85rem', color: review.trustScore < 40 ? '#ef4444' : '#10b981', fontWeight: '900'}}>{review.trustScore || 0}/100</div>
                    </div>
                    <button onClick={() => setSelectedReview(review)} style={{color:'white', background: '#3b82f6', border: 'none', padding:'8px 12px', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', display: 'flex', gap: '5px', alignItems: 'center', cursor: 'pointer'}}>
                      <Eye size={14}/> View
                    </button>
                  </>
                ) : (
                  <span style={{color:'#ef4444', fontSize:'0.75rem', fontWeight: '700'}}>No Bill Attached</span>
                )}
              </div>

              {review.status === 'pending' && (
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                  <button onClick={() => handleStatus(review._id, 'approved')} style={{ background:'#16a34a', color:'white', border:'none', padding:'12px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'800', cursor: 'pointer' }}>Approve</button>
                  <button onClick={() => handleStatus(review._id, 'rejected')} style={{ background:'#dc2626', color:'white', border:'none', padding:'12px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'800', cursor: 'pointer' }}>Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 4. MODAL POPUP */}
      {selectedReview && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: isMobile ? 'flex-end' : 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '800px', height: isMobile ? '90vh' : 'auto', maxHeight: '90vh', borderRadius: isMobile ? '24px 24px 0 0' : '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Verification Proof</h3>
              <X onClick={() => setSelectedReview(null)} size={24} style={{cursor: 'pointer'}} />
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', padding: '20px', overflowY: 'auto' }}>
              
              <div style={{ flex: 1 }}>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '16px', background: '#f8fafc', overflow: 'hidden' }}>
                  <img src={selectedReview.billImage} alt="Bill" style={{ width: '100%', maxHeight: isMobile ? '250px' : '400px', objectFit: 'contain' }} />
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>User Claims</div>
                  <div style={{ fontWeight: '700', marginTop: '5px' }}>ID: {selectedReview.orderId}</div>
                  <div style={{ fontWeight: '700' }}>Date: {new Date(selectedReview.purchaseDate).toLocaleDateString()}</div>
                </div>

                <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase' }}>AI Analysis</div>
                  <div style={{ fontWeight: '900', fontSize: '1.2rem', margin: '5px 0' }}>Score: {selectedReview.trustScore}%</div>
                  <p style={{ fontSize: '0.75rem', color: '#1e40af', maxHeight: '80px', overflowY: 'auto' }}>{selectedReview.ocrExtractedText}</p>
                </div>

                {selectedReview.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button onClick={() => handleStatus(selectedReview._id, 'approved')} style={{ flex: 1, padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => handleStatus(selectedReview._id, 'rejected')} style={{ flex: 1, padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ReviewManager;