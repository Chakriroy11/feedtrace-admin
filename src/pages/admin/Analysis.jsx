import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [reviewTrendData, setReviewTrendData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('${import.meta.env.VITE_API_URL}/api/reviews/all');
        if (res.ok) {
          const reviews = await res.json();
          
          // --- PROCESS TIMELINE DATA ---
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const trendsMap = {};

          // Initialize the last 6 months so the graph doesn't look empty
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            trendsMap[monthNames[d.getMonth()]] = { month: monthNames[d.getMonth()], submitted: 0, verified: 0 };
          }

          // Populate with actual DB data
          reviews.forEach(review => {
            const date = new Date(review.timestamp);
            const monthStr = monthNames[date.getMonth()];
            
            if (trendsMap[monthStr]) {
              trendsMap[monthStr].submitted += 1;
              if (review.status === 'approved' || review.status === 'verified') {
                trendsMap[monthStr].verified += 1;
              }
            }
          });

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

  if (loading) return <AdminLayout title="Deep Analytics"><div style={{ padding: '40px', color: '#64748b' }}>Analyzing timeline data...</div></AdminLayout>;

  return (
    <AdminLayout title="Deep Analytics">
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* LINE CHART: Review Submissions vs Verifications */}
        <div style={cardStyle}>
          <h3 style={sectionHeader}>Review Submissions vs. AI Verifications (Last 6 Months)</h3>
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="submitted" name="Total Submitted" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="verified" name="AI Verified" stroke="#10b981" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

const cardStyle = { background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const sectionHeader = { marginTop: 0, color: '#1e293b', paddingBottom: '12px', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '800' };

export default Analysis;