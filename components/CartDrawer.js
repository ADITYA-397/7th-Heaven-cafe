"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { calculateOrderTotals, DEFAULT_DELIVERY_FEE } from "../lib/pricing";

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
  const { cartItems, isCartOpen, setIsCartOpen, clearCart, updateQuantity } = useCart();

  React.useEffect(() => {
    if (isCartOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  const { subtotal, taxes, deliveryFee, total } = calculateOrderTotals(cartItems, DEFAULT_DELIVERY_FEE);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    router.push("/checkout");
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
              Brewline.
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
              Your Brewline Cart
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
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#2E2620" }}>&#8377;{deliveryFee}</span>
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
                    style={{
                      width: "100%",
                      backgroundColor: "#C08552",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "9999px",
                      padding: "14px 20px",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "block",
                      boxSizing: "border-box",
                      boxShadow: "0 2px 8px rgba(192, 133, 82, 0.25)",
                      transition: "background-color 0.2s, transform 0.1s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#A96F3F"; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#C08552"; }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
