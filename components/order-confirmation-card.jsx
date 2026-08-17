"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function OrderConfirmationCard({
  orderId,
  paymentMethod,
  dateTime,
  totalAmount,
  onGoToAccount,
  title = "Your order has been placed!",
  buttonText = "View My Orders",
}) {
  const details = [
    { label: "Order ID",      value: "#" + orderId },
    { label: "Payment",       value: paymentMethod },
    { label: "Date & Time",   value: dateTime },
    { label: "Total Charged", value: totalAmount, bold: true },
  ];

  const containerVariants = {
    hidden:  { opacity: 0, scale: 0.93, y: 24 },
    visible: {
      opacity: 1, scale: 1, y: 0,
      transition: { duration: 0.45, ease: [0.25, 0.8, 0.25, 1], staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-live="polite"
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#fff",
          borderRadius: "2rem",
          padding: "2.5rem 2rem",
          boxShadow: "0 40px 100px rgba(59,46,40,0.18), 0 8px 24px rgba(59,46,40,0.08)",
          border: "1px solid rgba(232,225,218,0.7)",
          fontFamily: "var(--font-body, Inter, sans-serif)",
          textAlign: "center",
        }}
      >
        {/* Success Icon */}
        <motion.div variants={itemVariants} style={{ marginBottom: "1.5rem" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            backgroundColor: "#f0fdf4", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto", boxShadow: "0 0 0 8px rgba(22,163,74,0.08)",
          }}>
            <CheckCircle2 size={40} strokeWidth={1.8} style={{ color: "#16a34a" }} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          variants={itemVariants}
          style={{
            fontFamily: "var(--font-heading, Outfit, sans-serif)",
            fontSize: "1.6rem", fontWeight: 900, color: "#3B2E28",
            margin: "0 0 0.5rem 0", lineHeight: 1.2, letterSpacing: "-0.01em",
          }}
        >
          {title}
        </motion.h2>

        <motion.p
          variants={itemVariants}
          style={{ fontSize: "0.9rem", color: "#5C4A3E", opacity: 0.65, margin: "0 0 2rem 0" }}
        >
          We received your order and are getting started right away.
        </motion.p>

        {/* Detail Rows */}
        <motion.div
          variants={itemVariants}
          style={{
            backgroundColor: "#FAF9F6", borderRadius: "1rem",
            padding: "0.25rem 1.25rem", marginBottom: "1.75rem",
            border: "1px solid rgba(232,225,218,0.6)", textAlign: "left",
          }}
        >
          {details.map((item, i) => (
            <div
              key={item.label}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.85rem 0",
                borderBottom: i < details.length - 1 ? "1px solid rgba(232,225,218,0.8)" : "none",
              }}
            >
              <span style={{
                fontSize: "0.82rem", fontWeight: 600, color: "#5C4A3E",
                opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {item.label}
              </span>
              <span style={{
                fontSize: item.bold ? "1.05rem" : "0.88rem",
                fontWeight: item.bold ? 900 : 700,
                color: item.bold ? "#8C6A53" : "#3B2E28",
                fontFamily: item.bold ? "var(--font-heading, Outfit, sans-serif)" : "inherit",
                maxWidth: "55%", textAlign: "right", wordBreak: "break-all",
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants} style={{ width: "100%" }}>
          <button
            onClick={onGoToAccount}
            style={{
              width: "100%", padding: "1rem 1.5rem",
              backgroundColor: "#8C6A53", color: "#fff", border: "none",
              borderRadius: "1.5rem", fontSize: "0.95rem", fontWeight: 800,
              fontFamily: "var(--font-heading, Outfit, sans-serif)",
              textTransform: "uppercase", letterSpacing: "0.12em",
              cursor: "pointer", boxShadow: "0 10px 24px rgba(140,106,83,0.35)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#6B4E3B";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#8C6A53";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {buttonText}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
