import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Users, Package, CheckSquare, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // Real Data States
  const [stats, setStats] = useState({ users: 0, products: 0, totalReviews: 0, fakesBlocked: 0 });
  const [reviewData, setReviewData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // --- FIXED FETCH CALLS (Using Backticks) ---
        const [productsRes, reviewsRes, usersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/products/all`),
          fetch(`${import.meta.env.VITE_API_URL}/api/reviews/all`),
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/users`) 
        ]);

        // Error handling for responses
        if (!productsRes.ok || !reviewsRes.ok || !usersRes.ok) {
           throw new Error("One or more API requests failed");
        }

        const products = await productsRes.json();
        const reviews = await reviewsRes.json();
        const users = await usersRes.json();

        // --- 1. PROCESS STATS CARDS ---
        let verifiedCount = 0;
        let pendingCount = 0;
        let fakeCount = 0;

        reviews.forEach(review => {
          if (review.status === 'flagged' || review.status === 'rejected') fakeCount++;
          else if (review.status === 'pending') pendingCount++;
          else verifiedCount++;
        });

        setStats({
          users: users.length || 0,
          products: products.length || 0,
          totalReviews: reviews.length || 0,
          fakesBlocked: fakeCount
        });

        // --- 2. PROCESS PIE CHART (Reviews) ---
        setReviewData([
          { name: 'Verified (Passed AI)', value: verifiedCount, color: '#10b981' },
          { name: 'Pending Scan', value: pendingCount, color: '#f59e0b' },
          { name: 'Flagged (Fake)', value: fakeCount, color: '#ef4444' },
        ]);

        // --- 3. PROCESS BAR CHART (Categories) ---
        const categoryCounts = {};
        products.forEach(product => {
          const subCat = product.subCategory || 'Other';
          categoryCounts[subCat] = (categoryCounts[subCat] || 0) + 1;
        });

        const formattedCategoryData = Object.keys(categoryCounts).map(key => ({
          name: key,
          count: categoryCounts[key]
        }));
        setCategoryData(formattedCategoryData);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <AdminLayout title="Platform Overview"><div style={{ padding: '40px', color: '#64748b' }}>Loading live data...</div></AdminLayout>;

  return (
    <AdminLayout title="Platform Overview">
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
        
        {/* --- TOP METRICS CARDS --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <MetricCard title="Total Users" value={stats.users} icon={<Users size={28} color="#3b82f6" />} />
          <MetricCard title="Total Products" value={stats.products} icon={<Package size={28} color="#8b5cf6" />} />
          <MetricCard title="Reviews Scanned" value={stats.totalReviews} icon={<CheckSquare size={28} color="#10b981" />} />
          <MetricCard title="Fake Bills Blocked" value={stats.fakesBlocked} icon={<ShieldAlert size={28} color="#ef4444" />} />
        </div>

        {/* --- CHARTS SECTION --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
          
          {/* PIE CHART */}
          <div style={cardStyle}>
            <h3 style={sectionHeader}>AI Review Analysis</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reviewData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                    {reviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {reviewData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></div>
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </div>

          {/* BAR CHART */}
          <div style={cardStyle}>
            <h3 style={sectionHeader}>Inventory by Sub-Category</h3>
            {categoryData.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '100px' }}>No products added yet.</p>
            ) : (
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

const MetricCard = ({ title, value, icon }) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{value}</div>
      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>{title}</div>
    </div>
  </div>
);

const cardStyle = { background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const sectionHeader = { marginTop: 0, color: '#1e293b', paddingBottom: '12px', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '800' };

export default Dashboard;