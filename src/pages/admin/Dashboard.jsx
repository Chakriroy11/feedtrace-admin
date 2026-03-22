import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Users, Package, CheckSquare, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useResponsive } from '../../hooks/useResponsive';

const Dashboard = () => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({ users: 0, products: 0, totalReviews: 0, fakesBlocked: 0 });
  const [reviewData, setReviewData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use the VITE_API_URL or fallback to the Render URL directly to ensure no 404s
        const BASE_URL = import.meta.env.VITE_API_URL || 'https://feedtrace-api.onrender.com';

        const [productsRes, reviewsRes, usersRes] = await Promise.allSettled([
          fetch(`${BASE_URL}/api/products/all`),
          fetch(`${BASE_URL}/api/reviews/all`),
          fetch(`${BASE_URL}/api/auth/users`) 
        ]);

        // Process Products
        const products = productsRes.status === 'fulfilled' && productsRes.value.ok 
          ? await productsRes.value.json() : [];
        
        // Process Reviews
        const reviews = reviewsRes.status === 'fulfilled' && reviewsRes.value.ok 
          ? await reviewsRes.value.json() : [];

        // Process Users
        const users = usersRes.status === 'fulfilled' && usersRes.value.ok 
          ? await usersRes.value.json() : [];

        let verifiedCount = 0, pendingCount = 0, fakeCount = 0;

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

        setReviewData([
          { name: 'Verified', value: verifiedCount, color: '#10b981' },
          { name: 'Pending', value: pendingCount, color: '#f59e0b' },
          { name: 'Flagged', value: fakeCount, color: '#ef4444' },
        ]);

        const categoryCounts = {};
        products.forEach(product => {
          const subCat = product.subCategory || 'Other';
          categoryCounts[subCat] = (categoryCounts[subCat] || 0) + 1;
        });

        setCategoryData(Object.keys(categoryCounts).map(key => ({
          name: key,
          count: categoryCounts[key]
        })));

      } catch (err) {
        console.error("Dashboard Logic Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Overview">
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <h3>Initializing Dashboard...</h3>
          <p>Connecting to FeedTrace API...</p>
        </div>
      </AdminLayout>
    );
  }

  // If no data returned, show a friendly empty state instead of crashing charts
  const hasData = reviewData.some(d => d.value > 0);

  return (
    <AdminLayout title="Platform Overview">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '10px' : '0 20px 40px 20px' }}>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px', 
          marginBottom: '40px' 
        }}>
          <MetricCard title="Total Users" value={stats.users} icon={<Users size={24} color="#3b82f6" />} isMobile={isMobile} />
          <MetricCard title="Total Products" value={stats.products} icon={<Package size={24} color="#8b5cf6" />} isMobile={isMobile} />
          <MetricCard title="Reviews" value={stats.totalReviews} icon={<CheckSquare size={24} color="#10b981" />} isMobile={isMobile} />
          <MetricCard title="Fakes Blocked" value={stats.fakesBlocked} icon={<ShieldAlert size={24} color="#ef4444" />} isMobile={isMobile} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px' }}>
          
          <div style={cardStyle}>
            <h3 style={sectionHeader}>Review Distribution</h3>
            <div style={{ width: '100%', height: isMobile ? '250px' : '300px', minHeight: '250px' }}>
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reviewData} cx="50%" cy="50%" innerRadius={isMobile ? 60 : 80} outerRadius={isMobile ? 90 : 110} paddingAngle={5} dataKey="value">
                      {reviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No review data yet</div>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={sectionHeader}>Inventory by Category</h3>
            <div style={{ width: '100%', height: isMobile ? '250px' : '300px', minHeight: '250px' }}>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout={isMobile ? "vertical" : "horizontal"}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis type={isMobile ? "number" : "category"} dataKey={isMobile ? undefined : "name"} hide={isMobile} />
                    <YAxis type={isMobile ? "category" : "number"} dataKey={isMobile ? "name" : undefined} width={isMobile ? 80 : 30} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={isMobile ? [0, 4, 4, 0] : [4, 4, 0, 0]} barSize={isMobile ? 20 : 40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No product categories yet</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

// ... keep your MetricCard, cardStyle, sectionHeader as they were ...
const MetricCard = ({ title, value, icon, isMobile }) => (
  <div style={{ background: 'white', padding: isMobile ? '16px' : '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
    <div style={{ background: '#f8fafc', padding: isMobile ? '12px' : '16px', borderRadius: '12px' }}>{icon}</div>
    <div>
      <div style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: '800', color: '#0f172a' }}>{value}</div>
      <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#64748b', fontWeight: '600' }}>{title}</div>
    </div>
  </div>
);

const cardStyle = { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const sectionHeader = { marginTop: 0, color: '#1e293b', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '800' };

export default Dashboard;