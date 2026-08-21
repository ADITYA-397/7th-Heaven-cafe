"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, Info, MapPin, User, Zap, Archive, CreditCard, FileText } from "lucide-react";
import InvoiceModal from "./InvoiceModal";
import { OrderConfirmationCard } from "./order-confirmation-card";

const DELIVERY_FEE = 40;

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}

function CoffeeCup() {
  return (
    <svg width="48" height="52" viewBox="0 0 52 56" fill="none"
      style={{ display: "block", margin: "0 auto 16px" }}>
      <path d="M18 10 Q19.5 7 18 4"  stroke="#C08552" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 10 Q25.5 6 24 3"  stroke="#C08552" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 10 Q31.5 7 30 4"  stroke="#C08552" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 16 L14 44 H38 L42 16 Z" stroke="#C08552" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <path d="M6 46 Q26 52 46 46"   stroke="#C08552" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M42 22 Q50 22 50 30 Q50 38 42 38" stroke="#C08552" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function CartDrawer() {
  const router = useRouter();
  const { cartItems, isCartOpen, setIsCartOpen, toggleLogin, clearCart, updateQuantity } = useCart();
  const { user, profile } = useAuth();

  const [isProcessing, setIsProcessing]     = useState(false);
  const [showPayment, setShowPayment]       = useState(false);
  const [paymentMethod, setPaymentMethod]   = useState("Card");
  const [upiId, setUpiId]                   = useState("");
  const [selectedBank, setSelectedBank]     = useState("HDFC");
  const [deliveryOption, setDeliveryOption] = useState("Express");
  const [orderCompleteMsg, setOrderCompleteMsg] = useState("");
  const [selectedAddress, setSelectedAddress] = React.useState("");
  const [lastOrder, setLastOrder]           = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen]   = useState(false);
  const [suggestions, setSuggestions]       = useState("");
  const [isNoContact, setIsNoContact]       = useState(false);

  React.useEffect(() => {
    if (isCartOpen || showPayment) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen, showPayment]);

  React.useEffect(() => {
    if (profile?.addresses?.length > 0) setSelectedAddress(profile.addresses[0]);
    else if (profile?.address) setSelectedAddress(profile.address);
  }, [profile]);

  const subtotal   = cartItems.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  const taxes      = Math.round(subtotal * 0.05);
  const total      = subtotal + taxes + (cartItems.length ? DELIVERY_FEE : 0);
  const totalToPay = subtotal + subtotal * 0.05;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const processPayment = async e => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    try {
      if (paymentMethod === "Cash on Delivery") {
        const od = {
          userId: user.uid,
          customerName: profile?.name || user.email || "Guest",
          customerAddress: selectedAddress || "No address",
          customerPhone: profile?.phone || "N/A",
          items: cartItems, total: subtotal, grandTotal: totalToPay,
          status: "Pending - Pay on Delivery",
          timestamp: new Date().toISOString(), paymentMethod: "COD",
          suggestions, noContactDelivery: isNoContact
        };
        const ref = await addDoc(collection(db, "orders"), od);
        clearCart(); setShowPayment(false);
        setLastOrder({ id: ref.id, ...od });
        setOrderCompleteMsg("Success! Order placed, pay on delivery.");
        setIsProcessing(false); return;
      }
      const ok = await loadRazorpay();
      if (!ok) { alert("Razorpay failed to load."); setIsProcessing(false); return; }
      const res  = await fetch("/api/razorpay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: totalToPay }) });
      const data = await res.json();
      if (!data.success) { alert("Payment init failed."); setIsProcessing(false); return; }
      const opts = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TYpo90mJ5uVdGk",
        amount: data.order.amount, currency: data.order.currency,
        name: "7th Heaven", description: "Order Payment", order_id: data.order.id,
        prefill: { name: profile?.name || user.email, contact: profile?.phone || "" },
        handler: async resp => {
          const od = {
            userId: user.uid, customerName: profile?.name || user.email,
            customerAddress: selectedAddress, customerPhone: profile?.phone,
            items: cartItems, total: subtotal, grandTotal: totalToPay,
            status: "Paid", timestamp: new Date().toISOString(),
            paymentMethod: `Razorpay - ${paymentMethod}`,
            razorpayPaymentId: resp.razorpay_payment_id,
            razorpayOrderId: resp.razorpay_order_id,
            suggestions, noContactDelivery: isNoContact
          };
          const ref = await addDoc(collection(db, "orders"), od);
          clearCart(); setShowPayment(false);
          setLastOrder({ id: ref.id, ...od });
          setOrderCompleteMsg("Payment received!"); setIsProcessing(false);
        },
        theme: { color: "#C08552" }
      };
      if (paymentMethod === "UPI" && upiId) { opts.prefill.method = "upi"; opts.prefill.vpa = upiId; }
      else if (paymentMethod === "Net Banking" && selectedBank) { opts.prefill.method = "netbanking"; opts.prefill.bank = selectedBank; }
      const rzp = new window.Razorpay(opts);
      rzp.on("payment.failed", r => { alert("Payment Failed: " + r.error.description); setIsProcessing(false); });
      rzp.open();
    } catch (err) {
      console.error(err); alert("Checkout error."); setIsProcessing(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1000, backdropFilter: "blur(4px)" }}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Full-page overlay panel */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1001,
        backgroundColor: "#EDE7DC",
        overflowY: "auto",
        fontFamily: "var(--font-body)",
      }}>
        {/* Top Header Bar with explicit padding & max-width */}
        <div style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          width: "100%",
          borderBottom: "1px solid #D8CEBF",
          backgroundColor: "#EDE7DC",
          padding: "20px clamp(24px, 5vw, 64px)",
          boxSizing: "border-box",
        }}>
          <div style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            boxSizing: "border-box",
          }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setIsCartOpen(false); }}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#2E2620",
                textDecoration: "none",
              }}
            >
              7th Heaven.
            </a>
            <button
              onClick={() => setIsCartOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#8A7D6E",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: "8px",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#2E2620"}
              onMouseLeave={e => e.currentTarget.style.color = "#8A7D6E"}
              aria-label="Close cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Main Body Container with generous 4-side padding */}
        <div style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "40px clamp(24px, 5vw, 64px) 90px",
          width: "100%",
          boxSizing: "border-box",
        }}>
          {/* Page Title Block */}
          <div style={{ marginBottom: "36px" }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2.4rem",
                fontWeight: 700,
                color: "#2E2620",
                margin: "0 0 10px 0",
                lineHeight: 1.2,
              }}
            >
              Your Heaven Cart
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "#8A7D6E",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Warm drinks and freshly baked treats await you
            </p>
          </div>

          {/* Two-column layout */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "40px",
            alignItems: "flex-start",
            width: "100%",
            boxSizing: "border-box",
          }}>
            {/* LEFT: Items List or Empty State */}
            <div style={{ flex: "1 1 540px", minWidth: 0, width: "100%" }}>
              {cartItems.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        padding: "18px 4px",
                        borderBottom: "1px solid #E2D9CC",
                        boxSizing: "border-box",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "16px",
                          width: "100%",
                          flexWrap: "wrap",
                          boxSizing: "border-box",
                        }}
                      >
                        {/* Top / Left: Thumbnail + (Name & Subtext) */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            flex: "1 1 220px",
                            minWidth: 0,
                          }}
                        >
                          {/* Thumbnail */}
                          <div
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "12px",
                              overflow: "hidden",
                              flexShrink: 0,
                              backgroundColor: "#DDD5C8",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            }}
                          >
                            {item.image
                              ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "26px" }}>☕</span>
                            }
                          </div>

                          {/* Name & Subtitle */}
                          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                            <p
                              style={{
                                margin: 0,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 600,
                                fontSize: "17px",
                                color: "#2E2620",
                                letterSpacing: "-0.01em",
                                wordBreak: "break-word",
                                lineHeight: 1.3,
                              }}
                            >
                              {item.name}
                            </p>
                            <p
                              style={{
                                margin: "4px 0 0",
                                fontSize: "13px",
                                color: "#8A7D6E",
                                fontStyle: "italic",
                                lineHeight: 1.3,
                              }}
                            >
                              Freshly prepared
                            </p>
                          </div>
                        </div>

                        {/* Bottom / Right: Price + Stepper + Trash */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            flexShrink: 0,
                            marginLeft: "auto",
                          }}
                        >
                          {/* Price */}
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#2E2620",
                              flexShrink: 0,
                              marginRight: "4px",
                            }}
                          >
                            &#8377;{item.price || 0}
                          </span>

                          {/* Stepper pill */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "5px 14px",
                              borderRadius: "24px",
                              border: "1px solid #D5CBBF",
                              backgroundColor: "rgba(255,255,255,0.45)",
                              flexShrink: 0,
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(item.name, -1)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#2E2620",
                                fontSize: "16px",
                                fontWeight: 600,
                                cursor: "pointer",
                                padding: "0 2px",
                                lineHeight: 1,
                              }}
                              aria-label="Decrease quantity"
                            >-</button>
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#2E2620",
                                minWidth: "16px",
                                textAlign: "center",
                              }}
                            >
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.name, 1)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#2E2620",
                                fontSize: "16px",
                                fontWeight: 600,
                                cursor: "pointer",
                                padding: "0 2px",
                                lineHeight: 1,
                              }}
                              aria-label="Increase quantity"
                            >+</button>
                          </div>

                          {/* Trash */}
                          <button
                            onClick={() => updateQuantity(item.name, -item.qty)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#A89888",
                              flexShrink: 0,
                              padding: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "color 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = "#c53030"}
                            onMouseLeave={e => e.currentTarget.style.color = "#A89888"}
                            aria-label={"Remove " + item.name}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div
                  style={{
                    backgroundColor: "#F5EEE5",
                    borderRadius: "20px",
                    padding: "60px 40px",
                    textAlign: "center",
                    border: "1px solid rgba(220, 211, 198, 0.6)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                  }}
                >
                  <CoffeeCup />
                  <p style={{ fontWeight: 700, fontSize: "1.35rem", color: "#2E2620", margin: "0 0 8px" }}>Your cart is empty</p>
                  <p style={{ fontSize: "14.5px", color: "#8A7D6E", margin: "0 0 24px" }}>Looks like you haven&apos;t added anything yet</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    style={{
                      backgroundColor: "#C08552",
                      color: "#fff",
                      border: "none",
                      borderRadius: "9999px",
                      padding: "12px 36px",
                      fontSize: "14.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(192, 133, 82, 0.25)",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#A96F3F"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#C08552"}
                  >
                    Browse Menu
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Order Summary Card (Padded on all 4 sides, inset button) */}
            {cartItems.length > 0 && (
              <div
                style={{
                  flex: "0 0 350px",
                  minWidth: "280px",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#F7F2EC",
                    borderRadius: "20px",
                    padding: "28px 24px",
                    border: "1px solid #DCD3C6",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    boxSizing: "border-box",
                    width: "100%",
                    position: "sticky",
                    top: "100px",
                  }}
                >
                  {/* Heading */}
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#2E2620",
                      margin: "0 0 20px 0",
                      padding: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Order Summary
                  </h3>

                  {/* Rows with spacing */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#8A7D6E" }}>Subtotal</span>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#2E2620" }}>&#8377;{subtotal}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#8A7D6E" }}>Taxes (GST 5%)</span>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#2E2620" }}>&#8377;{taxes}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#8A7D6E" }}>Delivery Fee</span>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#2E2620" }}>&#8377;{DELIVERY_FEE}</span>
                    </div>
                  </div>

                  {/* Hairline Divider */}
                  <div style={{ height: "1px", backgroundColor: "#DCD3C6", margin: "18px 0" }} />

                  {/* Total Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                    <span style={{ fontSize: "17px", fontWeight: 700, color: "#2E2620" }}>Total</span>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: "#2E2620" }}>&#8377;{total}</span>
                  </div>

                  {/* Proceed to Checkout Button */}
                  <button
                    onClick={handleCheckoutClick}
                    disabled={isProcessing}
                    style={{
                      width: "100%",
                      backgroundColor: isProcessing ? "#A96F3F" : "#C08552",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "9999px",
                      padding: "14px 20px",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      display: "block",
                      boxSizing: "border-box",
                      boxShadow: "0 2px 8px rgba(192, 133, 82, 0.25)",
                      transition: "background-color 0.2s, transform 0.1s",
                    }}
                    onMouseEnter={e => { if (!isProcessing) e.currentTarget.style.backgroundColor = "#A96F3F"; }}
                    onMouseLeave={e => { if (!isProcessing) e.currentTarget.style.backgroundColor = "#C08552"; }}
                  >
                    {isProcessing ? "Processing..." : "Proceed to Checkout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[2000] bg-[#f5f5f5] overflow-y-auto font-sans p-6 md:p-8">
          <div className="max-w-[1150px] mx-auto pb-6 flex items-center">
            <button onClick={() => setShowPayment(false)} className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-gray-700">
              <ArrowLeft size={20} strokeWidth={2.5}/>
            </button>
          </div>
          <div className="max-w-[1150px] mx-auto pb-20 flex flex-col lg:flex-row gap-8 items-start w-full">
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[17px] font-bold text-gray-900">Delivery Details</h2>
                  <div className="flex bg-[#f5f5f5] rounded-full p-1 gap-1 border border-gray-100">
                    <button className="bg-white rounded-full px-4 py-1.5 text-[13px] font-bold text-gray-900 shadow-sm">Delivery</button>
                    <button className="px-4 py-1.5 text-[13px] font-semibold text-gray-500">Pickup</button>
                  </div>
                </div>
                <div className="flex gap-4 items-start pb-6 border-b border-gray-100">
                  <div className="text-gray-400 mt-0.5"><MapPin size={20} strokeWidth={2}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[14px] text-gray-900 truncate pr-2">Delivery Address</span>
                      <button className="text-[#C08552] font-semibold text-[13px] flex-shrink-0">Edit</button>
                    </div>
                    <p className="text-gray-500 text-[13px] mt-1 leading-relaxed">{selectedAddress || "No address saved — add one in your profile"}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start pt-6">
                  <div className="text-gray-400 mt-0.5"><User size={20} strokeWidth={2}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[14px] text-gray-900">{profile?.name || user?.email || "Guest"}</span>
                      <button className="text-[#C08552] font-semibold text-[13px] flex-shrink-0">Edit</button>
                    </div>
                  </div>
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 mt-8 mb-4">Delivery Options</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { id:"Express",    label:"Express",    sub:"15–20 min", badge:"Faster", Icon:Zap    },
                    { id:"Standard",   label:"Standard",   sub:"30–40 min", badge:null,     Icon:Archive },
                    { id:"Economical", label:"Economical", sub:"50–60 min", badge:null,     Icon:Archive },
                  ].map(({ id, label, sub, badge, Icon }) => (
                    <div key={id}
                      onClick={() => setDeliveryOption(id)}
                      className={`flex justify-between items-center p-4 rounded-[12px] cursor-pointer transition-colors ${deliveryOption===id?"border-[1.5px] border-[#C08552] bg-white":"border border-gray-100 bg-[#fbfbfb]"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${deliveryOption===id?"bg-[#f5ece3] text-[#C08552]":"bg-transparent text-gray-400"}`}>
                          <Icon size={18}/>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[14px] text-gray-900">{label}</span>
                            {badge && <span className="bg-[#C08552] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
                          </div>
                          <p className="text-gray-500 text-[13px] mt-0.5">{sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-200">
                <h2 className="text-[17px] font-bold text-gray-900 mb-5">Payment</h2>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center flex-1 min-w-0">
                    <div className="w-12 h-10 rounded-xl bg-[#f5ece3] flex items-center justify-center text-[#C08552] border border-[#e8d5c0] flex-shrink-0">
                      <CreditCard size={20} strokeWidth={2.5}/>
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[14px] text-gray-900 block">Add your debit card</span>
                      <p className="text-gray-500 text-[13px] mt-0.5">Pay securely with your card.</p>
                    </div>
                  </div>
                  <button className="border border-[#C08552] text-[#C08552] rounded-full px-5 py-2 text-[12px] font-bold">+ Add Card</button>
                </div>
              </div>
              <button
                onClick={processPayment} disabled={isProcessing}
                className="w-full text-white font-bold text-[15px] py-4 rounded-[14px] disabled:opacity-70"
                style={{ backgroundColor:"#C08552" }}
                onMouseEnter={e => { if(!isProcessing) e.currentTarget.style.backgroundColor="#A96F3F"; }}
                onMouseLeave={e => { if(!isProcessing) e.currentTarget.style.backgroundColor="#C08552"; }}
              >
                {isProcessing ? "Processing…" : "Continue to payment"}
              </button>
            </div>
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[17px] font-bold text-gray-900">Cart ({cartItems.length})</h2>
                  <Info size={20} className="text-gray-400" strokeWidth={1.5}/>
                </div>
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto mb-6" style={{ scrollbarWidth:"none" }}>
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0"/>
                        : <div className="w-12 h-12 rounded-xl bg-[#e8d5c0] flex-shrink-0 flex items-center justify-center"><FileText size={18} className="text-[#C08552]"/></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[13px] text-gray-900 truncate">{item.name}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">&#8377;{(item.price||0) * item.qty}</p>
                      </div>
                      <span className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-700 bg-white flex-shrink-0">{item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex justify-between text-[13px]"><span className="text-gray-400">Subtotal</span><span className="text-gray-700">&#8377;{subtotal}</span></div>
                  <div className="flex justify-between text-[13px]"><span className="text-gray-400">GST (5%)</span><span className="text-gray-700">&#8377;{taxes}</span></div>
                  <div className="flex justify-between text-[13px]"><span className="text-gray-400">Delivery</span><span className="text-gray-700">&#8377;{DELIVERY_FEE}</span></div>
                </div>
                <hr className="border-gray-200 my-3"/>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[15px] text-gray-900">Total</span>
                  <span className="font-bold text-[18px] text-gray-900">&#8377;{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {orderCompleteMsg && lastOrder && (
        <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <OrderConfirmationCard
            orderId={lastOrder.id?.slice(-8).toUpperCase() || ""}
            paymentMethod={lastOrder.paymentMethod || "Cash on Delivery"}
            dateTime={new Date(lastOrder.timestamp).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true })}
            totalAmount={new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR" }).format(lastOrder.grandTotal || lastOrder.total || 0)}
            onGoToAccount={() => { setOrderCompleteMsg(""); setIsCartOpen(false); }}
            title="Order Placed!"
            buttonText="Done"
          />
        </div>
      )}

      <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} order={lastOrder}/>
    </>
  );
}
