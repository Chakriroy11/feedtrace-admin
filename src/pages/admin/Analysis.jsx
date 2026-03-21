import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react'; // Added missing import
import toast from 'react-hot-toast';

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [reviewTrendData, setReviewTrendData] = useState([]);

  // 🛡️ API URL Helper
  const getBaseUrl = () => {
    const base = import.meta.env.VITE_API_URL || 'https://feedtrace-api.onrender.com';
    return base.replace(/\/$/, '');
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/reviews/all`);
        
        if (res.ok) {
          const reviews = await res.json();
          
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const trendsMap = {};

          // Initialize the last 6 months
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthLabel = monthNames[d.getMonth()];
            trendsMap[monthLabel] = { month: monthLabel, submitted: 0, verified: 0 };
          }

          if (Array.isArray(reviews)) {
            reviews.forEach(review => {
              // 🚀 FIX: Use timestamp from your schema
              const date = new Date(review.timestamp || review.createdAt || Date.now());
              const monthStr = monthNames[date.getMonth()];
              
              if (trendsMap[monthStr]) {
                trendsMap[monthStr].submitted += 1;
                
                // 🚀 FIX: Match your schema logic (status 'approved' OR boolean 'isVerifiedPurchase')
                if (review.status === 'approved' || review.status === 'verified' || review.isVerifiedPurchase === true) {
                  trendsMap[monthStr].verified += 1;
                }
              }
            });
          }

          setReviewTrendData(Object.values(trendsMap));
        }
      } catch (err) {
        console.error("Analytics Error:", err);
        toast.error("Could not sync chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return (
    <AdminLayout title="Deep Analytics">
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={40} style={{ marginBottom: '15px', color: '#3b82f6' }} />
        <p style={{ fontWeight: '600' }}>Syncing with Database...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Deep Analytics">
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
        
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
            <div>
              <h3 style={sectionHeader}>Review Pipeline Trend</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>Submissions vs. Successful Verifications</p>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={legendStyle}><span style={{ ...dotStyle, background: '#3b82f6' }}></span> Submitted</div>
                <div style={legendStyle}><span style={{ ...dotStyle, background: '#10b981' }}></span> Verified</div>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="submitted" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 7, strokeWidth: 0 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="verified" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 7, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Styles
const cardStyle = { background: 'white', padding: '35px', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' };
const sectionHeader = { margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px' };
const legendStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#475569' };
const dotStyle = { width: '10px', height: '10px', borderRadius: '50%' };
const tooltipStyle = { borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px' };

export default Analysis;