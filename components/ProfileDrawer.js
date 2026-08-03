"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import InvoiceModal from './InvoiceModal';
import { FileText } from 'lucide-react';

export default function ProfileDrawer() {
  const { profile, logout, updateProfile, user } = useAuth();
  const { isProfileOpen, setIsProfileOpen } = useCart();
  const [activeTab, setActiveTab] = useState('details');

  const [formData, setFormData] = useState({ name: '', dob: '', phone: '', newsletter: true, gender: '', addresses: [], photo: '' });
  const [orders, setOrders] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isProfileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isProfileOpen]);

  useEffect(() => {
    if (profile) {
      let migratedAddresses = profile.addresses || [];
      if (profile.address && migratedAddresses.length === 0) {
        migratedAddresses = [profile.address];
      }
      setFormData(prev => ({
        ...prev,
        ...profile,
        addresses: migratedAddresses,
        newsletter: profile.newsletter ?? true,
        photo: profile.photo || ''
      }));
    }
  }, [profile]);

  useEffect(() => {
    async function fetchOrders() {
      if (isProfileOpen && user && activeTab === 'orders') {
        try {
          const q = query(collection(db, "orders"), where("userId", "==", user.uid));
          const snapshot = await getDocs(q);
          const retrieved = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          retrieved.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
          setOrders(retrieved);
        } catch (e) {
          console.error("Order fetch failed, check firebase permissions.", e);
        }
      }
    }
    fetchOrders();
  }, [isProfileOpen, user, activeTab]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, photo: URL.createObjectURL(file) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMsg('Saving...');
    const res = await updateProfile(formData);
    if(res && res.success) setStatusMsg('Profile Saved!');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  return (
    <>
      <div className={`cart-overlay ${isProfileOpen ? 'active' : ''}`} onClick={() => setIsProfileOpen(false)}></div>
      <div className={`cart-drawer profile-drawer ${isProfileOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h3>My Profile</h3>
          <button onClick={() => setIsProfileOpen(false)} className="close-btn">&times;</button>
        </div>
        
        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
          <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Order History</button>
        </div>

        <div className="cart-items profile-content">
          <div className={`tab-pane ${activeTab === 'details' ? 'active' : ''}`}>
            <div className="profile-avatar-wrapper">
              <img id="profile-avatar-img" src={formData.photo || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>"} alt="Avatar" />
              <label htmlFor="photo-upload" className="photo-upload-label">✎ Edit Photo</label>
              <input type="file" id="photo-upload" accept="image/*" hidden onChange={handlePhotoUpload} />
            </div>

            <form id="profile-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input type="tel" name="phone" placeholder="+19876543210" value={formData.phone || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{flexDirection: 'row', alignItems: 'center', gap: '0.5rem'}}>
                <input type="checkbox" name="newsletter" checked={!!formData.newsletter} onChange={handleChange} id="newsletter-check" style={{width:'auto'}} />
                <label htmlFor="newsletter-check" style={{margin:0, fontWeight:'normal'}}>Subscribe to local cafe promos & freebies</label>
              </div>
              <div className="form-group">
                <label>Saved Delivery Addresses</label>
                {formData.addresses?.map((addr, idx) => (
                    <div key={idx} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f9f9f9', padding:'0.8rem', borderRadius:'8px', marginBottom:'0.5rem', border:'1px solid #eee'}}>
                        <span style={{fontSize:'0.9rem', flex: 1}}>{addr}</span>
                        <button type="button" onClick={() => setFormData({...formData, addresses: formData.addresses.filter((_, i) => i !== idx)})} style={{background:'none', border:'none', color:'red', cursor:'pointer', fontWeight:'bold', padding:'0 0.5rem'}}>x</button>
                    </div>
                ))}
                <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                    <input type="text" placeholder="Add new address..." value={newAddress} onChange={(e) => setNewAddress(e.target.value)} style={{flex:1, padding:'0.6rem'}} />
                    <button type="button" onClick={() => { if(newAddress.trim()) { setFormData({...formData, addresses: [...formData.addresses, newAddress.trim()]}); setNewAddress(''); } }} style={{padding:'0.6rem 1rem', background:'var(--color-primary)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>+</button>
                </div>
              </div>
              <button type="submit" className="cta-button full-width" style={{marginTop: '1rem'}}>Save Setup</button>
              <div style={{marginTop: '0.5rem', textAlign:'center', fontWeight:'bold', color:'var(--color-primary)'}}>{statusMsg}</div>
            </form>
          </div>

          <div className={`tab-pane ${activeTab === 'orders' ? 'active' : ''}`}>
            <div id="order-history-list">
              {orders.length === 0 ? (
                 <p style={{textAlign:'center', color:'#999', marginTop: '2rem'}}>No previous orders found.</p>
              ) : (
                orders.map((o) => (
                   <div key={o.id} className="order-history-card">
                     <div className="order-history-header">
                         <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ccc' }}>#{o.id.slice(-8).toUpperCase()}</span>
                         <span className="order-history-badge">{o.status}</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: '0.5rem'}}>
                        <div style={{fontSize:'1rem', fontWeight: '700'}}>₹{o.total}</div>
                        <button 
                            onClick={() => { setSelectedInvoiceOrder(o); setIsInvoiceOpen(true); }}
                            style={{ background:'none', color:'var(--color-primary)', border:'1px solid var(--color-primary)', borderRadius:'6px', padding:'0.3rem 0.6rem', fontSize:'0.75rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.3rem', fontWeight:'600'}}
                        >
                            <FileText size={12} /> View Bill
                        </button>
                     </div>
                     <div className="order-history-items">
                        {o.items?.map(i => `${i.name} x${i.qty}`).join(', ')}
                     </div>
                   </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="cart-footer">
          <button onClick={handleLogout} className="cta-button full-width" style={{background:'#d9534f', boxShadow:'none'}}>Log Out</button>
        </div>
      </div>

      {/* Profile Order Invoice */}
      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
        order={selectedInvoiceOrder} 
      />
    </>
  );
}
