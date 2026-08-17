"use client";
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, FileText, ArrowRight, ArrowLeft, Ticket, Receipt, Info, ChevronRight, CheckCircle2, Circle, Plus, Scan, ChevronDown, MapPin, User, Zap, Archive, CreditCard } from 'lucide-react';
import InvoiceModal from './InvoiceModal';
import { OrderConfirmationCard } from './order-confirmation-card';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, toggleLogin, clearCart, updateQuantity } = useCart();
  const { user, profile } = useAuth();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [deliveryOption, setDeliveryOption] = useState('Express');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [orderCompleteMsg, setOrderCompleteMsg] = useState('');
  const [selectedAddress, setSelectedAddress] = React.useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const [suggestions, setSuggestions] = useState('');
  const [isNoContact, setIsNoContact] = useState(false);

  // Lock body scroll when cart drawer OR checkout modal is open
  React.useEffect(() => {
    if (isCartOpen || showPayment) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, showPayment]);

  React.useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      setSelectedAddress(profile.addresses[0]);
    } else if (profile?.address) {
      setSelectedAddress(profile.address);
    }
  }, [profile]);

  const itemTotal = cartItems.reduce((acc, item) => acc + ((item.price || 5) * item.qty), 0);
  const tax = itemTotal * 0.05;
  const totalToPay = itemTotal + tax;

  const handleCheckoutClick = () => {
    if (!user) {
      setIsCartOpen(false);
      toggleLogin();
      return;
    }
    if (cartItems.length > 0) setShowPayment(true);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);

    try {
      if (paymentMethod === 'Cash on Delivery') {
        const orderData = {
          userId: user.uid,
          customerName: profile?.name || user.email || 'Guest',
          customerAddress: selectedAddress || 'No address provided',
          customerPhone: profile?.phone || 'No phone stored',
          items: cartItems,
          total: itemTotal,
          grandTotal: totalToPay,
          status: 'Pending - Pay on Delivery',
          timestamp: new Date().toISOString(),
          paymentMethod: 'COD',
          suggestions: suggestions,
          noContactDelivery: isNoContact
        };
        const docRef = await addDoc(collection(db, "orders"), orderData);
        clearCart();
        setShowPayment(false);
        setLastOrder({ id: docRef.id, ...orderData });
        setOrderCompleteMsg('Success! Your order is placed and will be paid on delivery.');
        setIsProcessing(false);
        return;
      }

      // Online Payment Flow (Razorpay)
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalToPay })
      });
      const data = await res.json();

      if (!data.success) {
        alert('Failed to initiate payment.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TYpo90mJ5uVdGk', // Safe fallback test key for demo
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'The Cafe',
        description: 'Order Payment',
        order_id: data.order.id,
        prefill: {
          name: profile?.name || user.email || 'Guest',
          contact: profile?.phone || '',
        },
        handler: async function (response) {
          const orderData = {
            userId: user.uid,
            customerName: profile?.name || user.email || 'Guest',
            customerAddress: selectedAddress || 'No address provided',
            customerPhone: profile?.phone || 'No phone stored',
            items: cartItems,
            total: itemTotal,
            grandTotal: totalToPay,
            status: 'Paid',
            timestamp: new Date().toISOString(),
            paymentMethod: `Razorpay - ${paymentMethod}`,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            suggestions: suggestions,
            noContactDelivery: isNoContact
          };
          const docRef = await addDoc(collection(db, "orders"), orderData);
          clearCart();
          setShowPayment(false);
          setLastOrder({ id: docRef.id, ...orderData });
          setOrderCompleteMsg('Success! Your payment was received.');
          setIsProcessing(false);
        },
        theme: {
          color: '#3ba8ff'
        }
      };

      if (paymentMethod === 'UPI' && upiId) {
        options.prefill.method = 'upi';
        options.prefill.vpa = upiId;
      } else if (paymentMethod === 'Net Banking' && selectedBank) {
        options.prefill.method = 'netbanking';
        options.prefill.bank = selectedBank;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment Failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Error processing checkout.");
      setIsProcessing(false);
    }
  };

  if (!isCartOpen) return null;

  // DESIGN SYSTEM (INLINE)
  const styles = {
    drawer: {
      position: 'fixed',
      top: 0,
      right: 0,
      width: '100%',
      maxWidth: '520px',
      height: '100dvh',
      backgroundColor: '#FAF9F6',
      zIndex: 1001,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-10px 0 50px rgba(0,0,0,0.15)',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: '#fff',
      padding: '24px',
      borderBottom: '1px solid #E8E1DA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    },
    content: {
      flex: 1,
      overflowY: 'auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    footer: {
      backgroundColor: '#fff',
      padding: '24px',
      borderTop: '1px solid #E8E1DA',
      boxShadow: '0 -20px 60px rgba(59,46,40,0.08)',
      flexShrink: 0
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '24px',
      padding: '16px',
      border: '1px solid rgba(232, 225, 218, 0.8)',
      boxShadow: '0 10px 30px rgba(59,46,40,0.04)'
    },
    billSummaryTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1.5rem'
    },
    billRow: {
      height: '4rem'
    },
    label: {
      textAlign: 'left',
      color: '#5C4A3E',
      opacity: 0.8,
      fontSize: '1.1rem',
      fontWeight: '600'
    },
    value: {
      textAlign: 'right',
      color: '#3B2E28',
      fontSize: '1.25rem',
      fontWeight: '700',
      fontFamily: 'var(--font-heading)'
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[1000] backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div style={styles.drawer}>

        {/* Fixed Header */}
        <div style={styles.header}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(false)}
              className="hover:scale-110 transition-transform"
              style={{ color: '#8C6A53', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 0' }}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#3B2E28', lineHeight: 1.2 }}>Your Order</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 800, color: '#8C6A53', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                {cartItems.length} Selection{cartItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => clearCart()}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#A69991', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em', cursor: 'pointer', whiteSpace: 'nowrap', padding: '8px' }}
            className="hover:text-red-500 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={styles.content}>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-30">
              <Receipt size={80} strokeWidth={1} className="mb-8" />
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Item Cards Container */}
              <div className="flex flex-col gap-8">
                {cartItems.map((item, idx) => (
                  <div key={idx} style={styles.card} className="group hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vegetarian</span>
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 900, color: '#3B2E28', margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#A69991', textTransform: 'uppercase', margin: 0 }}>Price: {formatCurrency(item.price || 5)}</p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 900, color: '#3B2E28', margin: 0, flexShrink: 0 }}>
                        {formatCurrency((item.price || 5) * item.qty)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => updateQuantity(item.name, -item.qty)}
                        style={{ backgroundColor: 'transparent', border: 'none', color: '#A69991', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', padding: '8px 0' }}
                        className="hover:text-red-500"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Remove
                      </button>

                      <div className="flex items-center bg-[#FAF9F6] rounded-xl border border-[#E8E1DA] overflow-hidden shrink-0">
                        <button onClick={() => updateQuantity(item.name, -1)} className="w-10 h-10 flex items-center justify-center hover:bg-white transition-colors" style={{ border: 'none', backgroundColor: 'transparent', fontSize: '1.25rem', color: '#8C6A53', cursor: 'pointer' }}>-</button>
                        <span style={{ padding: '0 0.5rem', fontWeight: 900, color: '#3B2E28', minWidth: '32px', textAlign: 'center', fontSize: '14px' }}>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.name, 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white transition-colors" style={{ border: 'none', backgroundColor: 'transparent', fontSize: '1.25rem', color: '#8C6A53', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions Box */}
              <div style={{ ...styles.card, padding: '16px 20px' }} className="flex items-center gap-4">
                <div style={{ color: '#8C6A53', opacity: 0.3 }}><FileText size={24} /></div>
                <input
                  type="text"
                  placeholder="Any special cooking instructions?"
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', minWidth: 0, fontSize: '14px', fontWeight: 600, color: '#3B2E28', textOverflow: 'ellipsis' }}
                />
              </div>

              {/* No-Contact Delivery Preference */}
              <div
                style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '2rem', cursor: 'pointer', transition: 'all 0.3s transition' }}
                className="hover:border-green-200"
                onClick={() => setIsNoContact(!isNoContact)}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '2px solid #E8E1DA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isNoContact ? '#16a34a' : 'transparent',
                  borderColor: isNoContact ? '#16a34a' : '#E8E1DA'
                }}>
                  {isNoContact && <div style={{ width: '10px', height: '10px', backgroundColor: '#fff', borderRadius: '2px' }}></div>}
                </div>
                <div className="flex-1">
                  <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#3B2E28', margin: '0 0 0.25rem 0' }}>No-Contact Delivery</h5>
                  <p style={{ margin: 0, fontSize: '13px', color: '#5C4A3E', opacity: 0.6 }}>Partner will leave your order at the doorstep</p>
                </div>
              </div>

              {/* Bill Summary - ROBUST TABLE-BASED LAYOUT */}
              <div style={styles.card}>
                <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 800, color: '#8C6A53', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #F5F1EE' }}>
                  Bill Summary
                </h5>
                <table style={styles.billSummaryTable}>
                  <tbody>
                    <tr style={styles.billRow}>
                      <td style={styles.label}>Item Total</td>
                      <td style={styles.value}>{formatCurrency(itemTotal)}</td>
                    </tr>
                    <tr style={styles.billRow}>
                      <td style={styles.label}>
                        Taxes (GST 5%) <Info size={14} className="inline ml-1 opacity-40 hover:opacity-100 cursor-help" />
                      </td>
                      <td style={styles.value}>{formatCurrency(tax)}</td>
                    </tr>
                    <tr style={{ ...styles.billRow, backgroundColor: '#FAFDFB' }}>
                      <td style={{ ...styles.label, paddingLeft: '1rem', color: '#16a34a', fontWeight: 800 }}>Delivery Fee</td>
                      <td style={{ ...styles.value, paddingRight: '1rem', color: '#16a34a' }}>FREE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div style={{ height: '12rem', flexShrink: 0 }}></div> {/* Buffer for fixed footer */}
        </div>

        {/* Fixed Footer — Zomato-style dark bar */}
        {cartItems.length > 0 && (
          <div style={{
            backgroundColor: '#1C1410',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>

            {/* LEFT — plain text on dark bar, no background container */}
            <div
              onClick={() => setShowPayment(true)}
              style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
            >
              <p style={{
                margin: '0 0 2px 0',
                fontSize: '10px',
                fontWeight: 700,
                color: '#8A7A72',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <CreditCard size={10} strokeWidth={2} />
                PAY USING
                <ChevronDown size={10} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} />
              </p>
              <p style={{
                margin: '0 0 1px 0',
                fontFamily: 'var(--font-heading)',
                fontSize: '15px',
                fontWeight: 900,
                color: '#F5EFEB',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {paymentMethod === 'Cash on Delivery' ? 'Cash on delivery' : paymentMethod}
              </p>
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: '#5C4840',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {paymentMethod === 'Cash on Delivery'
                  ? 'Pay using cash or ask for QR'
                  : paymentMethod === 'UPI'
                  ? 'Instant transfer via UPI'
                  : paymentMethod === 'Net Banking'
                  ? 'Secure net banking transfer'
                  : 'Pay securely with your card'}
              </p>
            </div>

            {/* RIGHT — separate rounded pill button, floating in the bar */}
            <button
              onClick={handleCheckoutClick}
              disabled={isProcessing}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                border: 'none',
                outline: 'none',
                margin: 0,
                flexShrink: 0,
                borderRadius: '9999px',
                backgroundColor: '#8B6F52',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 18px 10px 16px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.7 : 1,
                transition: 'background-color 0.18s ease, transform 0.12s ease',
                boxShadow: '0 4px 20px rgba(139,111,82,0.45)',
              }}
              onMouseEnter={e => { if (!isProcessing) { e.currentTarget.style.backgroundColor = '#6B4E3B'; e.currentTarget.style.transform = 'scale(1.02)'; } }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#8B6F52'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {/* Amount + TOTAL stacked */}
              <div style={{ textAlign: 'left' }}>
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-heading)',
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#fff',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}>
                  {formatCurrency(totalToPay)}
                </p>
                <p style={{
                  margin: '2px 0 0 0',
                  fontSize: '9px',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                }}>
                  TOTAL
                </p>
              </div>

              {/* "Place Order ►" */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}>
                  {isProcessing ? 'Wait…' : 'Place Order'}
                </span>
                {!isProcessing && <ArrowRight size={15} color="#fff" strokeWidth={2.5} />}
              </div>
            </button>

          </div>
        )}

      </div>



      {/* Simplified Modal Overlays */}

      {/* Checkout Payment Flow Modal */}

      {/* Checkout Modal â€” two-column layout matching reference */}






      {/* Checkout Modal - Exact design match */}
      {showPayment && (
        <div className="fixed inset-0 z-[2000] bg-[#f5f5f5] overflow-y-auto font-sans p-6 md:p-8">
          {/* Top Navbar / Back button area */}
          <div className="max-w-[1150px] mx-auto pb-6 flex justify-between items-center">
            <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-700 transition-colors bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="max-w-[1150px] mx-auto pb-20 flex flex-col lg:flex-row gap-6 md:gap-8 items-start w-full">

            {/* Left Column */}
            <div className="flex-1 w-full flex flex-col gap-6">

              {/* CARD 1: Delivered Details & Choose delivery options */}
              <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-200">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[17px] font-bold text-gray-900">Delivered Details</h2>
                  <div className="flex bg-[#f5f5f5] rounded-full p-1 gap-1 border border-gray-100">
                    <button className="bg-white rounded-full px-4 py-1.5 text-[13px] font-bold text-gray-900 shadow-sm">Delivery</button>
                    <button className="px-4 py-1.5 text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">Pickup</button>
                  </div>
                </div>

                {/* Address Row */}
                <div className="flex gap-4 items-start pb-6 border-b border-gray-100">
                  <div className="text-gray-400 mt-0.5"><MapPin size={20} strokeWidth={2} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[14px] text-gray-900 truncate pr-2">Midtown South, Manhattan</span>
                      <button className="text-[#ff6036] font-semibold text-[13px] flex-shrink-0">Edit</button>
                    </div>
                    <p className="text-gray-500 text-[13px] mt-1 pr-12 leading-relaxed">{selectedAddress || '123 Madison Avenue, Apartment 12B, Midtown South, Manhattan, New York City, NY 10016, United States'}</p>
                  </div>
                </div>

                {/* Name Row */}
                <div className="flex gap-4 items-start pt-6 pb-1">
                  <div className="text-gray-400 mt-0.5"><User size={20} strokeWidth={2} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[14px] text-gray-900 truncate pr-2">{profile?.name || user?.email || 'Mr. Azzahri Alpiana'}</span>
                      <button className="text-[#ff6036] font-semibold text-[13px] flex-shrink-0">Edit</button>
                    </div>
                    <button className="text-gray-500 text-[13px] mt-1 underline hover:text-gray-700 transition-colors decoration-gray-400 underline-offset-2 whitespace-nowrap block">Add instruction for courier</button>
                  </div>
                </div>

                {/* Options Header */}
                <h3 className="text-[17px] font-bold text-gray-900 mt-8 mb-4">Choose delevery options</h3>

                {/* Options List */}
                <div className="flex flex-col gap-3">

                  {/* Express */}
                  <div onClick={() => setDeliveryOption('Express')} className={`flex justify-between items-center p-4 rounded-[12px] cursor-pointer transition-colors ${deliveryOption === 'Express' ? 'border-[1.5px] border-[#2d9585] bg-white' : 'border border-gray-100 bg-[#fbfbfb]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${deliveryOption === 'Express' ? 'bg-[#eaf6f4] text-[#2d9585]' : 'bg-transparent text-gray-400'}`}>
                        <Zap size={18} fill={deliveryOption === 'Express' ? 'currentColor' : 'none'} strokeWidth={deliveryOption === 'Express' ? 0 : 2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[14px] text-gray-900">Express</span>
                          <span className="bg-[#2d9585] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">Faster</span>
                        </div>
                        <p className="text-gray-500 text-[13px] mt-0.5">Estimation 15-20 min</p>
                      </div>
                    </div>
                    <span className="font-bold text-[13px] text-gray-900 flex-shrink-0 pl-2">$1.99</span>
                  </div>

                  {/* Standard */}
                  <div onClick={() => setDeliveryOption('Standard')} className={`flex justify-between items-center p-4 rounded-[12px] cursor-pointer transition-colors ${deliveryOption === 'Standard' ? 'border-[1.5px] border-[#2d9585] bg-white' : 'border border-gray-100 bg-[#fbfbfb]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${deliveryOption === 'Standard' ? 'bg-[#eaf6f4] text-[#2d9585]' : 'bg-transparent text-gray-500'}`}>
                        <Archive size={18} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[14px] text-gray-900">Standard</span>
                        <p className="text-gray-500 text-[13px] mt-0.5">Estimation 30-40 min</p>
                      </div>
                    </div>
                  </div>

                  {/* Economical */}
                  <div onClick={() => setDeliveryOption('Economical')} className={`flex justify-between items-center p-4 rounded-[12px] cursor-pointer transition-colors ${deliveryOption === 'Economical' ? 'border-[1.5px] border-[#2d9585] bg-white' : 'border border-gray-100 bg-[#fbfbfb]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${deliveryOption === 'Economical' ? 'bg-[#eaf6f4] text-[#2d9585]' : 'bg-transparent text-gray-500'}`}>
                        <Archive size={18} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[14px] text-gray-900">Ecomical</span>
                        <p className="text-gray-500 text-[13px] mt-0.5">Estimation 50-60 min</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD 2: Payment */}
              <div className="bg-white rounded-[16px] p-6 pr-8 shadow-sm border border-gray-200">
                <h2 className="text-[17px] font-bold text-gray-900 mb-5">Payment</h2>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center flex-1 min-w-0">
                    <div className="w-12 h-10 rounded-xl bg-[#fff3ef] flex items-center justify-center text-[#ff6036] border border-[#fde0d4] flex-shrink-0">
                      <CreditCard size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-[14px] text-gray-900 block truncate">Add your debit card</span>
                      <p className="text-gray-500 text-[13px] mt-0.5 truncate">You can use debit card for continue your payment.</p>
                    </div>
                  </div>
                  <button className="flex-shrink-0 border border-[#ff6036] text-[#ff6036] bg-transparent hover:bg-[#fff3ef] transition-colors rounded-full px-5 py-2 text-[12px] font-bold">
                    + Add Card
                  </button>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={processPayment}
                disabled={isProcessing}
                className="w-full bg-[#ff6036] hover:bg-[#eb4f28] transition-colors text-white font-bold text-[16px] py-4 rounded-[16px] shadow-sm mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Continue to payment'}
              </button>
            </div>

            {/* Right Column: Cart Summary */}
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-200 h-fit">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[18px] font-bold text-gray-900">
                    Cart <span className="text-gray-400 font-normal">({cartItems.length})</span>
                  </h2>
                  <Info size={22} className="text-gray-500" strokeWidth={1.5} />
                </div>

                {/* Items */}
                <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto pr-1 mb-8" style={{ scrollbarWidth: 'none' }}>
                  {cartItems.map((item, index) => (
                    <div key={item.id + index} className="flex gap-4 items-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-[50px] h-[50px] rounded-xl object-cover flex-shrink-0 shadow-sm" />
                      ) : (
                        <div className="w-[50px] h-[50px] rounded-xl bg-[#98c1b9] flex-shrink-0 shadow-sm flex items-center justify-center text-white"><FileText size={20} /></div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-[#2d9585] text-[11px] font-medium mb-1 truncate">{item.category || 'Japanese Food'}</p>
                        <h3 className="font-bold text-[14px] text-gray-900 leading-tight truncate">{item.name}</h3>
                        <p className="font-bold text-[13px] text-gray-700 mt-1">${((item.price || 5)).toFixed(2).replace('.', ',')}</p>
                      </div>

                      <div className="w-[26px] h-[26px] rounded-full border border-gray-200 flex items-center justify-center font-bold text-[12px] text-gray-800 flex-shrink-0 shadow-sm bg-white ml-2">
                        {item.qty}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promotion Code */}
                <h3 className="text-[15px] font-bold text-gray-500 mb-3">Promotion code</h3>
                <div className="flex gap-2 mb-8">
                  <input type="text" placeholder="Add promo code" className="flex-1 border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400 bg-white shadow-sm" />
                  <button className="bg-[#f5f5f5] text-gray-400 font-bold px-6 py-3 rounded-[12px] text-[13px] transition-colors shadow-sm disabled:opacity-50" disabled>Apply</button>
                </div>

                {/* Order Total */}
                <h3 className="text-[16px] font-bold text-gray-500 mb-5">Order total</h3>
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-gray-400 font-medium">Item Price</span>
                    <span className="text-gray-400 font-medium">${itemTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-gray-400 font-medium">Shipping</span>
                    <span className="text-gray-400 font-medium">${deliveryOption === 'Express' ? '1,99' : '5,00'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-gray-400 font-medium">Platform Fee (5%)</span>
                    <span className="text-gray-400 font-medium">${tax.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <hr className="border-gray-200 my-4" />

                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-900 font-bold text-[16px]">Total</span>
                  <span className="text-gray-900 font-bold text-[20px]">
                    ${(totalToPay + (deliveryOption === 'Express' ? 1.99 : 5)).toFixed(2).replace('.', ',')}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {orderCompleteMsg && lastOrder && (
        <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <OrderConfirmationCard
            orderId={lastOrder.id?.slice(-8).toUpperCase() || ''}
            paymentMethod={lastOrder.paymentMethod || 'Cash on Delivery'}
            dateTime={new Date(lastOrder.timestamp).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: true,
            })}
            totalAmount={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(lastOrder.grandTotal || lastOrder.total || 0)}
            onGoToAccount={() => { setOrderCompleteMsg(''); setIsCartOpen(false); }}
            title="Order Placed!"
            buttonText="Done"
          />
        </div>
      )}

      <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} order={lastOrder} />
    </>
  );
}