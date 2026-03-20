import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout'; 
import { PackagePlus, Image as ImageIcon, ArrowLeft, Calendar, Hash, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { useResponsive } from '../hooks/useResponsive';

const AddProduct = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive(); 
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', description: '', category: '', subCategory: '', 
    price: '', brand: '', modelNumber: '', releaseYear: '', image: '', 
  });

  const [specs, setSpecs] = useState({});
  const [variants, setVariants] = useState([{ color: '', storage: '', price: '', image: '' }]);

  // ... [Categories list is the same as your previous code] ...
  const categories = [
    { 
      id: 'Electronics', label: 'Electronics', 
      subCategories: {
        'Mobiles': {
          brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo', 'Nothing', 'Motorola', 'Other'],
          specs: ['Operating System', 'Processor', 'RAM', 'Display Type', 'Screen Size', 'Rear Camera', 'Front Camera', 'Battery (mAh)', 'Charging Support', 'Network (4G/5G)']
        },
        'Laptops': {
          brands: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'MSI', 'Samsung', 'Other'],
          specs: ['Operating System', 'Processor (CPU)', 'RAM', 'Storage (SSD/HDD)', 'Graphics Card (GPU)', 'Screen Size & Resolution', 'Refresh Rate', 'Battery Life', 'Weight']
        },
        'Televisions': {
          brands: ['Samsung', 'LG', 'Sony', 'TCL', 'Hisense', 'Xiaomi', 'Vu', 'Other'],
          specs: ['Screen Size', 'Resolution (4K/8K)', 'Panel Type (OLED/QLED)', 'Refresh Rate', 'Smart TV OS', 'Sound Output (Watts)', 'HDMI Ports']
        }
      }
    },
    {
      id: 'Accessories', label: 'Accessories',
      subCategories: {
        'Audio & Earbuds': {
          brands: ['Boat', 'JBL', 'Sony', 'Noise', 'Apple', 'Samsung', 'Other'],
          specs: ['Type (Earbuds/Headphones)', 'Connectivity', 'Battery Life', 'Water Resistance', 'Microphone']
        },
        'Smart Wearables': {
          brands: ['Apple', 'Samsung', 'Garmin', 'Noise', 'Boat', 'Other'],
          specs: ['Display Type', 'Battery Life', 'Water Resistance', 'Sensors', 'Compatibility']
        }
      }
    }
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleCategoryChange = (e) => { 
    setFormData({ ...formData, category: e.target.value, subCategory: '', brand: '' }); 
    setSpecs({}); 
  };

  const handleSubCategoryChange = (e) => {
    setFormData({ ...formData, subCategory: e.target.value, brand: '' });
    setSpecs({}); 
  };

  const handleSpecChange = (field, value) => setSpecs({ ...specs, [field]: value });
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) { // Reduced to 1.5MB for Render stability
        return toast.error("Image too large! Max 1.5MB.");
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };
  
  const addVariant = () => setVariants([...variants, { color: '', storage: '', price: '', image: '' }]);
  const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));

  // --- 🌟 SANITIZED SUBMIT LOGIC 🌟 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Explicitly casting types to match MongoDB Schemas
    const finalProduct = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      subCategory: formData.subCategory,
      brand: formData.brand,
      price: Number(formData.price), // Force Number
      modelNumber: formData.modelNumber,
      releaseYear: formData.releaseYear,
      image: formData.image,
      specifications: specs,
      variants: variants.map(v => ({
        ...v,
        price: v.price ? Number(v.price) : 0 // Force Number
      })).filter(v => v.color || v.storage || v.price), 
      createdAt: new Date()
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProduct)
      });

      const data = await res.json();

      if (res.ok) { 
        toast.success("🚀 Product Published Successfully!"); 
        navigate('/admin/products'); 
      } else {
        // Log the exact validation error from Mongoose
        console.error("Server Error Details:", data);
        toast.error(data.message || data.error || "Server failed to save product");
      }
    } catch (err) { 
      console.error("Fetch Error:", err);
      toast.error("Network Error: Could not reach the server."); 
    } finally { 
      setLoading(false); 
    }
  };

  // Logic for dynamic dropdowns
  const activeCategory = categories.find(c => c.id === formData.category);
  const availableSubCategories = activeCategory ? Object.keys(activeCategory.subCategories) : [];
  const activeSubCategoryData = (activeCategory && formData.subCategory) ? activeCategory.subCategories[formData.subCategory] : null;
  const availableBrands = activeSubCategoryData ? activeSubCategoryData.brands : [];
  const dynamicSpecs = activeSubCategoryData ? activeSubCategoryData.specs : [];

  return (
    <AdminLayout title="Add New Product">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '10px' : '0 20px 40px 20px' }}>
        
        <button onClick={() => navigate('/admin/products')} style={backBtnStyle}>
          <ArrowLeft size={18} /> Back
        </button>

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
          
          <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '25px'}}>
            <div style={cardStyle}>
              <h3 style={sectionHeader}>Product Basics</h3>
              
              <div style={{marginBottom: '20px'}}>
                <label style={labelStyle}>Product Name</label>
                <input type="text" name="name" required onChange={handleChange} style={inputStyle} placeholder="e.g. iPhone 15 Pro Max" />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select name="category" required onChange={handleCategoryChange} style={inputStyle}>
                    <option value="">Select...</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Sub-Category</label>
                  <select name="subCategory" required value={formData.subCategory} onChange={handleSubCategoryChange} disabled={!activeCategory} style={inputStyle}>
                    <option value="">Select...</option>
                    {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <select name="brand" required value={formData.brand} onChange={handleChange} disabled={!formData.subCategory} style={inputStyle}>
                    <option value="">Select...</option>
                    {availableBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </div>
              </div>

              <label style={labelStyle}>Description</label>
              <textarea name="description" rows="4" required onChange={handleChange} style={inputStyle} placeholder="Describe the key features..." />
            </div>

            <div style={cardStyle}>
               <h4 style={sectionHeader}>Main Media</h4>
               <label style={labelStyle}>Base Price (₹)</label>
               <input type="number" name="price" required onChange={handleChange} style={{...inputStyle, marginBottom:'20px'}} placeholder="99999" />
               
               <div onClick={() => document.getElementById('imgUpload').click()} style={{
                 height: '200px', border: '2px dashed #cbd5e1', borderRadius: '16px', cursor: 'pointer', 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', 
                 background: formData.image ? `url(${formData.image}) center/contain no-repeat` : '#f8fafc'
               }}>
                 {!formData.image && <div style={{textAlign:'center'}}><ImageIcon size={40} color="#94a3b8"/><p style={{fontSize:'0.8rem', color:'#94a3b8'}}>Click to Upload</p></div>}
               </div>
               <input id="imgUpload" type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h4 style={{margin:0, fontSize: '1.2rem', fontWeight: '800'}}>Product Variants</h4>
              <button type="button" onClick={addVariant} style={addVarBtn}><Plus size={16}/> Add Variant</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              {variants.map((variant, index) => (
                <div key={index} style={variantRowStyle(isMobile)}>
                  <div style={{gridRow: isMobile ? 'span 2' : 'auto'}}>
                    <div onClick={() => document.getElementById(`varImg-${index}`).click()} style={varImgPreview(variant.image)}>
                      {!variant.image && <ImageIcon size={20} color="#94a3b8"/>}
                    </div>
                    <input type="file" id={`varImg-${index}`} hidden onChange={(e) => { 
                      const file = e.target.files[0]; 
                      if (file) { 
                        const reader = new FileReader(); 
                        reader.onloadend = () => handleVariantChange(index, 'image', reader.result); 
                        reader.readAsDataURL(file); 
                      } 
                    }} />
                  </div>
                  <div><label style={miniLabel}>Color</label><input type="text" value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)} style={inputStyle} /></div>
                  <div><label style={miniLabel}>Storage/Size</label><input type="text" value={variant.storage} onChange={(e) => handleVariantChange(index, 'storage', e.target.value)} style={inputStyle} /></div>
                  <div style={{gridColumn: isMobile ? 'span 2' : 'auto'}}><label style={miniLabel}>Price (₹)</label><input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} style={inputStyle} /></div>
                  <button type="button" onClick={() => removeVariant(index)} style={delVarBtn}><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>

          {activeSubCategoryData && (
            <div style={{...cardStyle, background: '#f8fafc', border: '1px dashed #3b82f6'}}>
              <h4 style={sectionHeader}>Technical Specifications</h4>
              <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px'}}>
                {dynamicSpecs.map((field) => (
                  <div key={field} style={{background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                    <label style={labelStyle}>{field}</label>
                    <input type="text" placeholder="..." onChange={(e) => handleSpecChange(field, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            ...submitBtn, 
            background: loading ? '#64748b' : '#0f172a',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Validating & Publishing...' : '🚀 Save & Publish Product'}
          </button>

        </form>
      </div>
    </AdminLayout>
  );
};

// Styles (same as your previous functional version)
const cardStyle = { background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const sectionHeader = { marginTop: 0, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '800' };
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '900', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' };
const miniLabel = { fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box', background: '#fff' };
const addVarBtn = { background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' };
const delVarBtn = { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', alignSelf: 'center' };
const submitBtn = { width: '100%', padding: '20px', color: 'white', border: 'none', borderRadius: '20px', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const backBtnStyle = { background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold' };
const variantRowStyle = (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '80px 1fr 1fr 1fr auto', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', alignItems: 'end' });
const varImgPreview = (img) => ({ width: '60px', height: '60px', borderRadius: '12px', border: '2px dashed #cbd5e1', cursor: 'pointer', background: img ? `url(${img}) center/cover no-repeat` : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' });

export default AddProduct;