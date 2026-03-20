import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout'; 
import { PackagePlus, Image as ImageIcon, ArrowLeft, Calendar, Hash, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { useResponsive } from '../hooks/useResponsive'; // 🌟 Import hook

const AddProduct = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive(); // 📱 Listen for mobile screen
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', description: '', category: '', subCategory: '', 
    price: '', brand: '', modelNumber: '', releaseYear: '', image: '', 
  });

  const [specs, setSpecs] = useState({});
  const [variants, setVariants] = useState([{ color: '', storage: '', price: '', image: '' }]);

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

  // --- HANDLERS ---
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const finalProduct = {
      ...formData,
      specifications: Object.fromEntries(Object.entries(specs).filter(([_, v]) => v.trim() !== '')),
      variants: variants.filter(v => v.color || v.storage), 
      createdAt: new Date()
    };
    try {
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/products/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProduct)
      });
      if (res.ok) { 
        toast.success("Product Added!"); 
        navigate('/admin/products'); 
      }
    } catch (err) { toast.error("Server Error"); }
    finally { setLoading(false); }
  };

  const activeCategory = categories.find(c => c.id === formData.category);
  const availableSubCategories = activeCategory ? Object.keys(activeCategory.subCategories) : [];
  const activeSubCategoryData = (activeCategory && formData.subCategory) ? activeCategory.subCategories[formData.subCategory] : null;
  const availableBrands = activeSubCategoryData ? activeSubCategoryData.brands : [];
  const dynamicSpecs = activeSubCategoryData ? activeSubCategoryData.specs : [];

  return (
    <AdminLayout title="Add New Product">
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: isMobile ? '100px' : '40px' }}>
        
        <button onClick={() => navigate('/admin/products')} style={{background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold'}}>
          <ArrowLeft size={18} /> Back
        </button>

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '30px'}}>
          
          {/* SECTION 1: BASICS */}
          <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? '20px' : '30px'}}>
            <div style={{...cardStyle, padding: isMobile ? '20px' : '30px'}}>
              <h3 style={sectionHeader}>Product Basics</h3>
              
              <div style={{marginBottom: '20px'}}>
                <label style={labelStyle}>Product Name</label>
                <input type="text" name="name" required onChange={handleChange} style={inputStyle} />
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
              <textarea name="description" rows="3" required onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{...cardStyle, padding: isMobile ? '20px' : '30px'}}>
               <h4 style={sectionHeader}>Price & Media</h4>
               <label style={labelStyle}>Starting Price (₹)</label>
               <input type="number" name="price" required onChange={handleChange} style={{...inputStyle, marginBottom:'20px'}} />
               <div onClick={() => document.getElementById('imgUpload').click()} style={{height: '150px', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: formData.image ? `url(${formData.image}) center/contain no-repeat` : '#f8fafc'}}>
                 {!formData.image && <ImageIcon size={32} color="#94a3b8"/>}
               </div>
               <input id="imgUpload" type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </div>
          </div>

          {/* SECTION 2: VARIANTS */}
          <div style={{...cardStyle, padding: isMobile ? '15px' : '30px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h4 style={{margin:0, fontSize: isMobile ? '1rem' : '1.3rem'}}>Product Variants</h4>
              <button type="button" onClick={addVariant} style={addVarBtn}><Plus size={16}/> Add</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              {variants.map((variant, index) => (
                <div key={index} style={{
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr 1fr' : '60px 1.2fr 1.2fr 1fr auto', 
                  gap: '12px', 
                  background: '#f8fafc', 
                  padding: '15px', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{gridRow: isMobile ? 'span 2' : 'auto'}}>
                    <div onClick={() => document.getElementById(`varImg-${index}`).click()} style={{width: '60px', height: '60px', borderRadius: '10px', border: '1px dashed #cbd5e1', cursor: 'pointer', background: variant.image ? `url(${variant.image}) center/cover no-repeat` : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      {!variant.image && <ImageIcon size={20} color="#94a3b8"/>}
                    </div>
                    <input type="file" id={`varImg-${index}`} hidden onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => handleVariantChange(index, 'image', reader.result); reader.readAsDataURL(file); } }} />
                  </div>
                  <div><label style={miniLabel}>Color</label><input type="text" value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)} style={inputStyle} /></div>
                  <div><label style={miniLabel}>Storage</label><input type="text" value={variant.storage} onChange={(e) => handleVariantChange(index, 'storage', e.target.value)} style={inputStyle} /></div>
                  <div style={{gridColumn: isMobile ? 'span 2' : 'auto'}}><label style={miniLabel}>Price (₹)</label><input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} style={inputStyle} /></div>
                  <button type="button" onClick={() => removeVariant(index)} style={delVarBtn}><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: DYNAMIC SPECS */}
          {activeSubCategoryData && (
            <div style={{...cardStyle, background: '#f8fafc', border: '1px dashed #94a3b8', padding: isMobile ? '20px' : '30px'}}>
              <h4 style={sectionHeader}>Deep Specs: {formData.subCategory}</h4>
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

          <button type="submit" disabled={loading} style={submitBtn}>
            {loading ? 'Publishing...' : '✅ Save & Publish Product'}
          </button>

        </form>
      </div>
    </AdminLayout>
  );
};

// --- STYLES ---
const cardStyle = { background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const sectionHeader = { marginTop: 0, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '800' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' };
const miniLabel = { fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' };
const addVarBtn = { background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800' };
const delVarBtn = { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' };
const submitBtn = { width: '100%', padding: '20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer' };

export default AddProduct;