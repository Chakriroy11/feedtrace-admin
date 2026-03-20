import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Users, Package, CheckSquare, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useResponsive } from '../../hooks/useResponsive'; // 🌟 Using your existing hook

const Dashboard = () => {
  const { isMobile } = useResponsive(); // 📱 Listen for screen changes
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({ users: 0, products: 0, totalReviews: 0, fakesBlocked: 0 });
  const [reviewData, setReviewData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, reviewsRes, usersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/products/all`),
          fetch(`${import.meta.env.VITE_API_URL}/api/reviews/all`),
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/users`) 
        ]);

        if (!productsRes.ok || !reviewsRes.ok || !usersRes.ok) throw new Error("API failed");

        const products = await productsRes.json();
        const reviews = await reviewsRes.json();
        const users = await usersRes.json();

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
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <AdminLayout title="Overview"><div style={{ padding: '40px', color: '#64748b' }}>Loading live data...</div></AdminLayout>;

  return (
    <AdminLayout title="Platform Overview">
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '10px' : '0 20px 40px 20px' 
      }}>
        
        {/* --- 1. TOP METRICS (Responsive Grid) --- */}
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

        {/* --- 2. CHARTS SECTION (Stacks on Mobile) --- */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: '30px' 
        }}>
          
          {/* PIE CHART CARD */}
          <div style={cardStyle}>
            <h3 style={sectionHeader}>Review Distribution</h3>
            <div style={{ width: '100%', height: isMobile ? '250px' : '300px' }}>
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
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
              {reviewData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          {/* BAR CHART CARD */}
          <div style={cardStyle}>
            <h3 style={sectionHeader}>Inventory</h3>
            <div style={{ width: '100%', height: isMobile ? '250px' : '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout={isMobile ? "vertical" : "horizontal"}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  {isMobile ? (
                    <>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                    </>
                  ) : (
                    <>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                    </>
                  )}
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={isMobile ? 20 : 40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

const MetricCard = ({ title, value, icon, isMobile }) => (
  <div style={{ 
    background: 'white', 
    padding: isMobile ? '16px' : '24px', 
    borderRadius: '16px', 
    border: '1px solid #e2e8f0', 
    display: 'flex', 
    alignItems: 'center', 
    gap: isMobile ? '12px' : '20px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
  }}>
    <div style={{ 
      background: '#f8fafc', 
      padding: isMobile ? '12px' : '16px', 
      borderRadius: '12px' 
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: '800', color: '#0f172a' }}>{value}</div>
      <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#64748b', fontWeight: '600' }}>{title}</div>
    </div>
  </div>
);

const cardStyle = { 
  background: 'white', 
  padding: '20px', 
  borderRadius: '16px', 
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
  border: '1px solid #e2e8f0' 
};

const sectionHeader = { 
  marginTop: 0, 
  color: '#1e293b', 
  marginBottom: '15px', 
  fontSize: '1.1rem', 
  fontWeight: '800' 
};

export default Dashboard;