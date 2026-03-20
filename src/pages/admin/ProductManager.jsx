import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // --- 🌟 FIXED FETCH CALL (Using Backticks) 🌟 ---
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Corrected from single quotes to backticks (`)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/all`);
      
      // Safety check: ensure response is actually JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned HTML instead of JSON. Check your .env URL.");
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Fetch Error:", err);
      toast.error("Failed to load products. Backend might be down.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  // Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/delete/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
        toast.success("Product Deleted!");
      } else {
        toast.error("Failed to delete from server.");
      }
    } catch (err) { 
      toast.error("Server Error while deleting"); 
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Product Inventory">
      
      {/* Top Bar */}
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px'}}>
        <div style={{position: 'relative', width: '300px'}}>
          <Search size={20} style={{position: 'absolute', left: '12px', top: '12px', color: '#94a3b8'}}/>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', 
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem'
            }}
          />
        </div>
        <button 
          onClick={() => navigate('/admin/add-product')}
          style={{
            background: '#0f172a', color: 'white', border: 'none', padding: '12px 20px', 
            borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
          }}
        >
          <Plus size={20}/> Add New Product
        </button>
      </div>

      {/* Product Table */}
      <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px'}}>
          <thead style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
            <tr>
              <th style={thStyle}>Image</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Brand</th>
              <th style={{...thStyle, textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{padding:'40px', textAlign:'center', color: '#64748b'}}>
                  <Loader2 className="animate-spin" style={{margin: '0 auto'}} size={32}/>
                  <p>Fetching Inventory...</p>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{padding:'40px', textAlign:'center', color: '#94a3b8'}}>No products found.</td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} style={{borderBottom: '1px solid #f1f5f9'}}>
                  <td style={{padding: '10px 15px'}}>
                     <img src={product.image || 'https://via.placeholder.com/40'} alt="prod" style={{width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                  </td>
                  <td style={{padding: '15px', fontWeight: '600', color: '#0f172a'}}>{product.name}</td>
                  <td style={{padding: '15px'}}>
                    <span style={badgeStyle}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{padding: '15px', fontWeight: '800', color: '#0f172a'}}>₹{product.price.toLocaleString()}</td>
                  <td style={{padding: '15px', color: '#64748b', fontWeight: '500'}}>
                    {product.brand || 'Generic'}
                  </td>
                  <td style={{padding: '15px', textAlign: 'right'}}>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      style={deleteBtnStyle}
                      title="Delete Product"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </AdminLayout>
  );
};

// --- STYLES ---
const thStyle = { padding: '15px', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' };
const badgeStyle = { background: '#eff6ff', color: '#3b82f6', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' };
const deleteBtnStyle = { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' };

export default ProductManager;