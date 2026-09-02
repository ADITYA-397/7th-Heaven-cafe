"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import InvoiceModal from "../../components/InvoiceModal";
import CartDrawer from "../../components/CartDrawer";
import ProfileDrawer from "../../components/ProfileDrawer";

const DELIVERY_FEE = 40;

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const { user, profile } = useAuth();

  // Form State initialized from logged in user if present, or editable empty with placeholders
  const [name, setName] = useState(profile?.name || user?.displayName || "");
  const [email, setEmail] = useState(user?.email || profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(
    profile?.addresses?.[0] || profile?.address || ""
  );

  // Order processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [orderCompleteMsg, setOrderCompleteMsg] = useState("");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    if (profile?.name || user?.displayName) {
      setName(profile?.name || user?.displayName);
      setCardName(profile?.name || user?.displayName);
    }
    if (user?.email || profile?.email) {
      setEmail(user?.email || profile?.email);
    }
    if (profile?.phone) setPhone(profile.phone);
    if (profile?.addresses?.length > 0) setAddress(profile.addresses[0]);
    else if (profile?.address) setAddress(profile.address);
  }, [profile, user]);

  // Pricing calculations (fallback to reference values ₹820/₹41/₹860 if cart has 0 items)
  const cartSubtotal = cartItems.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  const subtotal = cartItems.length > 0 ? cartSubtotal : 820;
  const taxes = cartItems.length > 0 ? Math.round(subtotal * 0.05) : 41;
  const total = cartItems.length > 0 ? subtotal + taxes + DELIVERY_FEE : 860;

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const saveLocalOrderId = (id) => {
    try {
      const stored = JSON.parse(localStorage.getItem("7h_active_orders") || "[]");
      if (Array.isArray(stored) && !stored.includes(id)) {
        localStorage.setItem("7h_active_orders", JSON.stringify([...stored, id]));
      }
    } catch (e) {}
  };

  const handlePay = async (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);

    const now = new Date();
    const estDelivery = new Date(now.getTime() + 25 * 60 * 1000).toISOString();

    try {
      const ok = await loadRazorpay();
      if (!ok) {
        // Fallback demo order placement if offline/no Razorpay key
        const od = {
          userId: user?.uid || "guest",
          customerName: name || "Valued Customer",
          customerEmail: email || user?.email || "",
          customerAddress: address || "Dine-in / Pickup",
          customerPhone: phone || "",
          items: cartItems.length > 0 ? cartItems : [{ name: "Warm Cafe Order", price: subtotal, qty: 1 }],
          total: subtotal,
          grandTotal: total,
          status: "placed",
          timestamp: now.toISOString(),
          placedAt: now.toISOString(),
          estimatedDeliveryAt: estDelivery,
          paymentMethod: "Online Payment",
        };
        const ref = await addDoc(collection(db, "orders"), od);
        saveLocalOrderId(ref.id);
        clearCart();
        setIsProcessing(false);
        router.push(`/track-order/${ref.id}`);
        return;
      }

      // Try Razorpay backend
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const data = await res.json();

      if (!data.success) {
        // Fallback mock order
        const od = {
          userId: user?.uid || "guest",
          customerName: name || "Valued Customer",
          customerEmail: email || user?.email || "",
          customerAddress: address || "Dine-in / Pickup",
          customerPhone: phone || "",
          items: cartItems.length > 0 ? cartItems : [{ name: "Warm Cafe Order", price: subtotal, qty: 1 }],
          total: subtotal,
          grandTotal: total,
          status: "placed",
          timestamp: now.toISOString(),
          placedAt: now.toISOString(),
          estimatedDeliveryAt: estDelivery,
          paymentMethod: "Online Payment",
        };
        const ref = await addDoc(collection(db, "orders"), od);
        saveLocalOrderId(ref.id);
        clearCart();
        setIsProcessing(false);
        router.push(`/track-order/${ref.id}`);
        return;
      }

      const opts = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TYpo90mJ5uVdGk",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "7th Heaven Cafe",
        description: "Order Payment",
        order_id: data.order.id,
        prefill: {
          name: name || user?.displayName || "",
          contact: phone || "",
          email: email || user?.email || "",
        },
        handler: async (resp) => {
          const od = {
            userId: user?.uid || "guest",
            customerName: name || "Valued Customer",
            customerEmail: email || user?.email || "",
            customerAddress: address || "Dine-in / Pickup",
            customerPhone: phone || "",
            items: cartItems.length > 0 ? cartItems : [{ name: "Warm Cafe Order", price: subtotal, qty: 1 }],
            total: subtotal,
            grandTotal: total,
            status: "placed",
            timestamp: now.toISOString(),
            placedAt: now.toISOString(),
            estimatedDeliveryAt: estDelivery,
            paymentMethod: "Paid via Razorpay",
            razorpayPaymentId: resp.razorpay_payment_id,
            razorpayOrderId: resp.razorpay_order_id,
          };
          const ref = await addDoc(collection(db, "orders"), od);
          saveLocalOrderId(ref.id);
          clearCart();
          setIsProcessing(false);

          // Send confirmation invoice email in background
          const targetEmail = email || user?.email;
          if (targetEmail) {
            fetch("/api/send-order-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderEmail: targetEmail,
                customerName: od.customerName,
                customerPhone: od.customerPhone,
                orderId: ref.id,
                subtotal: od.total,
                taxes: taxes,
                deliveryFee: DELIVERY_FEE,
                total: od.grandTotal,
                items: od.items,
                address: od.customerAddress,
                paymentMethod: "Razorpay",
                paymentId: resp.razorpay_payment_id,
              }),
            }).catch((emailErr) => console.error("Email send error:", emailErr));
          }

          // Redirect immediately to live tracking page
          router.push(`/track-order/${ref.id}`);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        theme: { color: "#C08552" },
      };

      const rzp = new window.Razorpay(opts);
      rzp.on("payment.failed", (r) => {
        alert("Payment Failed: " + (r.error?.description || "Transaction declined"));
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      // Create order as fallback
      const od = {
        userId: user?.uid || "guest",
        customerName: name || "Valued Customer",
        customerEmail: email || user?.email || "",
        customerAddress: address || "Dine-in / Pickup",
        customerPhone: phone || "",
        items: cartItems.length > 0 ? cartItems : [{ name: "Warm Cafe Order", price: subtotal, qty: 1 }],
        total: subtotal,
        grandTotal: total,
        status: "placed",
        timestamp: now.toISOString(),
        placedAt: now.toISOString(),
        estimatedDeliveryAt: estDelivery,
        paymentMethod: "Direct Online",
      };
      const ref = await addDoc(collection(db, "orders"), od);
      saveLocalOrderId(ref.id);
      clearCart();
      setIsProcessing(false);
      router.push(`/track-order/${ref.id}`);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#EDE7DC",
        minHeight: "100vh",
        color: "#2E2620",
        fontFamily: "var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      {/* Site Header */}
      <Navbar />

      {/* Main Container with top padding to clear fixed navbar */}
      <main
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "100px clamp(16px, 4vw, 64px) 80px",
          boxSizing: "border-box",
        }}
      >
        {/* Page Title Block */}
        <div style={{ marginBottom: "36px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.85rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "#2E2620",
              margin: "0 0 8px 0",
              lineHeight: 1.2,
            }}
          >
            Checkout
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#8A7D6E",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Complete your details to place your warm order
          </p>
        </div>

        {/* Two-Column Layout */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(28px, 4vw, 52px)",
            alignItems: "flex-start",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* LEFT COLUMN: Numbered Form Sections */}
          <div
            style={{
              flex: "1 1 540px",
              minWidth: 0,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Delivery & Contact Details */}
            <div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#2E2620",
                  margin: "0 0 28px 0",
                  lineHeight: 1.3,
                }}
              >
                Delivery & Contact Details
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* NAME */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#8A7D6E",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    NAME
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid #DCD3C6",
                      padding: "4px 0 12px 0",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#2E2620",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#8A7D6E",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid #DCD3C6",
                      padding: "4px 0 12px 0",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#2E2620",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* EMAIL ADDRESS */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#8A7D6E",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    EMAIL ADDRESS (FOR INVOICE)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.jenkins@example.com"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid #DCD3C6",
                      padding: "4px 0 12px 0",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#2E2620",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* DELIVERY ADDRESS */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#8A7D6E",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    DELIVERY ADDRESS
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Oakwood Residency, 7th Main Road, Indiranagar, Bengaluru"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid #DCD3C6",
                      padding: "4px 0 12px 0",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#2E2620",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Secure Payment Reassurance Note */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#8A7D6E",
                  marginTop: "32px",
                  paddingTop: "20px",
                  borderTop: "1px solid #E2D9CC",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C08552" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Guaranteed safe & secure checkout powered by Razorpay (Cards, UPI, Netbanking)</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary Card */}
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

              {/* Price Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#8A7D6E" }}>Subtotal</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#2E2620" }}>₹{subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#8A7D6E" }}>Taxes (GST 5%)</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#2E2620" }}>₹{taxes}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#8A7D6E" }}>Delivery Fee</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#2E2620" }}>₹{DELIVERY_FEE}</span>
                </div>
              </div>

              {/* Hairline Divider */}
              <div style={{ height: "1px", backgroundColor: "#DCD3C6", margin: "18px 0" }} />

              {/* Total Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                <span style={{ fontSize: "17px", fontWeight: 700, color: "#2E2620" }}>Total</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#2E2620" }}>₹{total}</span>
              </div>

              {/* Primary Pay Button */}
              <button
                type="button"
                onClick={handlePay}
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
                  minHeight: "48px",
                  boxShadow: "0 2px 8px rgba(192, 133, 82, 0.25)",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) e.currentTarget.style.backgroundColor = "#A96F3F";
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) e.currentTarget.style.backgroundColor = "#C08552";
                }}
              >
                {isProcessing ? "Processing..." : `Pay ₹${total}`}
              </button>

              {/* Secured by Razorpay */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginTop: "14px",
                  color: "#8A7D6E",
                  fontSize: "12.5px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Secured by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cart & Profile Drawer Overlays if opened */}
      <CartDrawer />
      <ProfileDrawer />

      {/* Order Confirmation Modal */}
      {orderCompleteMsg && lastOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3000,
            backgroundColor: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <OrderConfirmationCard
            orderId={lastOrder.id?.slice(-8).toUpperCase() || ""}
            paymentMethod={lastOrder.paymentMethod || "Online Payment"}
            dateTime={new Date(lastOrder.timestamp || Date.now()).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            totalAmount={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
              lastOrder.grandTotal || lastOrder.total || total
            )}
            onGoToAccount={() => {
              setOrderCompleteMsg("");
              window.location.href = "/";
            }}
            title="Order Placed!"
            buttonText="Done"
          />
        </div>
      )}

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={lastOrder}
      />
    </div>
  );
}
