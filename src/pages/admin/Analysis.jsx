import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [reviewTrendData, setReviewTrendData] = useState([]);

  // 🛡️ API URL Helper: Ensures no trailing slashes or 404s
  const getBaseUrl = () => {
    const base = import.meta.env.VITE_API_URL || 'https://feedtrace-api.onrender.com';
    return base.replace(/\/$/, '');
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // 🚀 FIXED: Using Backticks and the Safety Helper
        const res = await fetch(`${getBaseUrl()}/api/reviews/all`);
        
        if (res.ok) {
          const reviews = await res.json();
          
          // --- PROCESS TIMELINE DATA ---
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const trendsMap = {};

          // Initialize the last 6 months
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthLabel = monthNames[d.getMonth()];
            trendsMap[monthLabel] = { month: monthLabel, submitted: 0, verified: 0 };
          }

          // Populate with actual DB data
          if (Array.isArray(reviews)) {
            reviews.forEach(review => {
              // Ensure timestamp exists, fallback to current date if missing
              const date = new Date(review.timestamp || review.createdAt || Date.now());
              const monthStr = monthNames[date.getMonth()];
              
              if (trendsMap[monthStr]) {
                trendsMap[monthStr].submitted += 1;
                if (review.status === 'approved' || review.status === 'verified') {
                  trendsMap[monthStr].verified += 1;
                }
              }
            });
          }

          setReviewTrendData(Object.values(trendsMap));
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return (
    <AdminLayout title="Deep Analytics">
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <Loader2 className="animate-spin" style={{ margin: '0 auto 10px' }} />
        <p>Analyzing timeline data...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Deep Analytics">
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* LINE CHART: Review Submissions vs Verifications */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={sectionHeader}>Review Submissions vs. AI Verifications (Last 6 Months)</h3>
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>● Submitted</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Verified</span>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }} 
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="submitted" 
                  name="Total Submitted" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 7, strokeWidth: 0 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="verified" 
                  name="AI Verified" 
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

const cardStyle = { background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' };
const sectionHeader = { marginTop: 0, color: '#0f172a', paddingBottom: '0', marginBottom: '0', fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.5px' };

export default Analysis;