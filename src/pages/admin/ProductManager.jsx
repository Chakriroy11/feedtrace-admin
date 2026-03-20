import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Trash2, Plus, Package, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/products/all');
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/delete/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
        alert("Product Deleted!");
      }
    } catch (err) { alert("Failed to delete"); }
  };

  // Filter Logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Product Inventory">
      
      {/* Top Bar */}
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '30px'}}>
        <div style={{position: 'relative', width: '300px'}}>
          <Search size={20} style={{position: 'absolute', left: '12px', top: '12px', color: '#94a3b8'}}/>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', 
              border: '1px solid #e2e8f0', outline: 'none'
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
      <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
          <thead style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
            <tr>
              <th style={{padding: '15px', color: '#64748b'}}>Image</th>
              <th style={{padding: '15px', color: '#64748b'}}>Name</th>
              <th style={{padding: '15px', color: '#64748b'}}>Category</th>
              <th style={{padding: '15px', color: '#64748b'}}>Price</th>
              <th style={{padding: '15px', color: '#64748b'}}>Stock</th>
              <th style={{padding: '15px', color: '#64748b', textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{padding:'20px', textAlign:'center'}}>Loading...</td></tr> : 
             filteredProducts.map((product) => (
              <tr key={product._id} style={{borderBottom: '1px solid #f1f5f9'}}>
                <td style={{padding: '10px 15px'}}>
                   <img src={product.image} alt="prod" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0'}} />
                </td>
                <td style={{padding: '15px', fontWeight: '600', color: '#334155'}}>{product.name}</td>
                <td style={{padding: '15px'}}>
                  <span style={{background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500'}}>
                    {product.category}
                  </span>
                </td>
                <td style={{padding: '15px', fontWeight: 'bold'}}>₹{product.price}</td>
                <td style={{padding: '15px', color: product.inStock ? '#16a34a' : '#ef4444'}}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </td>
                <td style={{padding: '15px', textAlign: 'right'}}>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    style={{background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s'}}
                  >
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && !loading && (
          <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>No products found.</div>
        )}
      </div>

    </AdminLayout>
  );
};

export default ProductManager;