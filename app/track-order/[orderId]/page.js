"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import Navbar from "../../../components/Navbar";
import { Clock, Check, RefreshCw, Star, Heart } from "lucide-react";

export default function TrackOrderPage({ params }) {
  // Support both promise-based and object-based params across Next.js versions
  const resolvedParams = params && typeof params.then === "function" ? use(params) : params;
  const orderId = resolvedParams?.orderId;
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [remainingTimeText, setRemainingTimeText] = useState("18 mins remaining");

  // Rating state for Delivered view
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  // Real-time Firestore sync via onSnapshot
  useEffect(() => {
    if (!orderId) return;

    const orderDocRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(
      orderDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrder({ id: docSnap.id, ...data });

          // If rating was already stored previously
          if (data.rating) {
            setRating(data.rating);
            setComment(data.feedback || "");
            setIsRatingSubmitted(true);
          }
        } else {
          console.warn("Order not found:", orderId);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to order:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  // Live countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (!order) return;

      const normStatus = getNormalizedStatus(order.status);
      if (normStatus === "delivered") {
        setRemainingTimeText("Order Delivered");
        return;
      }

      let estTime;
      if (order.estimatedDeliveryAt) {
        estTime = new Date(order.estimatedDeliveryAt).getTime();
      } else if (order.placedAt || order.timestamp) {
        const placed = new Date(order.placedAt || order.timestamp).getTime();
        estTime = placed + 25 * 60 * 1000;
      } else {
        setRemainingTimeText("18 mins remaining");
        return;
      }

      const diffMs = estTime - Date.now();
      const diffMins = Math.ceil(diffMs / (60 * 1000));

      if (diffMins <= 0) {
        setRemainingTimeText("Arriving any moment");
      } else {
        setRemainingTimeText(`${diffMins} mins remaining`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, [order]);

  // Manual refresh backup
  const handleManualRefresh = async () => {
    if (!orderId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const docSnap = await getDoc(doc(db, "orders", orderId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOrder({ id: docSnap.id, ...data });
        if (data.rating) {
          setRating(data.rating);
          setComment(data.feedback || "");
          setIsRatingSubmitted(true);
        }
      }
    } catch (err) {
      console.error("Manual refresh error:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Submit delivery rating to Firestore
  const handleSubmitRating = async (e) => {
    if (e) e.preventDefault();
    if (rating === 0 || !orderId || isSubmittingRating || isRatingSubmitted) return;

    setIsSubmittingRating(true);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        rating,
        feedback: comment.trim(),
        ratedAt: new Date().toISOString(),
      });
      setIsRatingSubmitted(true);
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Helper to normalize status values
  const getNormalizedStatus = (status) => {
    if (!status) return "placed";
    const s = status.toLowerCase();
    if (s.includes("deliver") && !s.includes("out")) return "delivered";
    if (s.includes("out") || s.includes("delivery")) return "out_for_delivery";
    if (s.includes("prepar")) return "preparing";
    return "placed";
  };

  const normStatus = getNormalizedStatus(order?.status);

  // Stepper status index: 0 = placed, 1 = preparing, 2 = out_for_delivery, 3 = delivered
  const getStatusStepIndex = (status) => {
    const norm = getNormalizedStatus(status);
    switch (norm) {
      case "delivered":
        return 3;
      case "out_for_delivery":
        return 2;
      case "preparing":
        return 1;
      case "placed":
      default:
        return 0;
    }
  };

  const currentStep = getStatusStepIndex(order?.status);

  // Format timestamps nicely
  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const formatDateFull = (isoString) => {
    if (!isoString) return "Just now";
    try {
      const date = new Date(isoString);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `${formattedDate} at ${formattedTime}`;
    } catch {
      return "Just now";
    }
  };

  const steps = [
    {
      key: "placed",
      title: "Order Placed",
      description: "Your order has been confirmed",
      timestamp: formatTime(order?.placedAt || order?.timestamp),
    },
    {
      key: "preparing",
      title: "Preparing",
      description: "Our barista is crafting your order with care",
      timestamp: currentStep >= 1 ? formatTime(order?.preparingAt) : "",
    },
    {
      key: "out_for_delivery",
      title: "Out for Delivery",
      description: "Your rider is on the way!",
      timestamp: currentStep >= 2 ? formatTime(order?.outForDeliveryAt) : "",
    },
    {
      key: "delivered",
      title: "Delivered",
      description: currentStep >= 3 ? "Your order has been delivered. Enjoy!" : "",
      timestamp: currentStep >= 3 ? formatTime(order?.deliveredAt) : "",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#EDE7DC",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-3 border-[#C08552] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#8A7D6E] font-serif">
            Loading your order status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#EDE7DC",
        minHeight: "100vh",
        color: "#2E2620",
        fontFamily:
          "var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      {/* Site Header */}
      <Navbar />

      {/* Main Container */}
      <main
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "100px clamp(16px, 4vw, 24px) 80px",
          boxSizing: "border-box",
        }}
      >
        {/* ========================================================================= */}
        {/* VIEW 1: ORDER DELIVERED / THANK YOU & RATING (WHEN STATUS IS 'delivered') */}
        {/* ========================================================================= */}
        {normStatus === "delivered" ? (
          <div className="flex flex-col items-center text-center animate-fadeIn">
            {/* Top Centered Terracotta Checkmark Icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#B3784A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                marginBottom: "24px",
                boxShadow: "0 4px 14px rgba(179, 120, 74, 0.25)",
              }}
            >
              <Check size={26} strokeWidth={3} />
            </div>

            {/* Heading */}
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(1.85rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "#2E2620",
                margin: "0 0 10px 0",
                lineHeight: 1.2,
              }}
            >
              Thank You for Choosing 7th Heaven!
            </h1>

            {/* Subtext */}
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: "16px",
                color: "#8A7D6E",
                margin: "0 0 36px 0",
                lineHeight: 1.5,
              }}
            >
              Your order has been delivered. We hope you enjoyed it!
            </p>

            {/* White Rating Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "36px 32px 32px",
                boxShadow: "0 2px 16px rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
                width: "100%",
                maxWidth: "600px",
                boxSizing: "border-box",
                marginBottom: "28px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "#2E2620",
                  margin: "0 0 20px 0",
                }}
              >
                Rate your delivery experience
              </h3>

              {/* 5-Star Interactive Rating Selector */}
              <div className="flex items-center justify-center gap-2.5 mb-6">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      disabled={isRatingSubmitted}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => !isRatingSubmitted && setHoverRating(star)}
                      onMouseLeave={() => !isRatingSubmitted && setHoverRating(0)}
                      className="transition-transform hover:scale-110 active:scale-95 focus:outline-none disabled:cursor-default"
                      style={{
                        background: "none",
                        border: "none",
                        padding: "4px",
                        cursor: isRatingSubmitted ? "default" : "pointer",
                      }}
                      title={`${star} Star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={32}
                        color="#B3784A"
                        fill={isFilled ? "#B3784A" : "transparent"}
                        strokeWidth={1.8}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Comment Textarea */}
              <div className="mb-5">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isRatingSubmitted}
                  placeholder="Leave a comment (optional)"
                  rows={3}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid #EAE3D9",
                    padding: "14px 16px",
                    fontSize: "14px",
                    color: "#2E2620",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "none",
                    boxSizing: "border-box",
                    backgroundColor: isRatingSubmitted ? "#FBF9F6" : "#FFFFFF",
                  }}
                  className="focus:border-[#B3784A] transition-colors placeholder:text-[#A89C8F]"
                />
              </div>

              {/* Submit Rating Button */}
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={rating === 0 || isSubmittingRating || isRatingSubmitted}
                style={{
                  width: "100%",
                  backgroundColor: isRatingSubmitted
                    ? "#B3784A"
                    : rating === 0
                    ? "#D8C7B8"
                    : "#B3784A",
                  border: "none",
                  color: "#FFFFFF",
                  borderRadius: "9999px",
                  padding: "14px 24px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor:
                    rating === 0 || isRatingSubmitted ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow:
                    rating > 0 && !isRatingSubmitted
                      ? "0 4px 12px rgba(179, 120, 74, 0.25)"
                      : "none",
                  opacity: rating === 0 && !isRatingSubmitted ? 0.7 : 1,
                }}
                className={
                  rating > 0 && !isRatingSubmitted
                    ? "hover:bg-[#9E653A] active:scale-98"
                    : ""
                }
              >
                {isSubmittingRating
                  ? "Submitting..."
                  : isRatingSubmitted
                  ? "Thanks for your feedback! ✓"
                  : "Submit Rating"}
              </button>
            </div>

            {/* Action Buttons Side by Side */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 w-full">
              <button
                onClick={() => router.push("/")}
                style={{
                  backgroundColor: "transparent",
                  border: "1.5px solid #B3784A",
                  color: "#B3784A",
                  borderRadius: "9999px",
                  padding: "13px 32px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="w-full sm:w-auto hover:bg-[#B3784A]/10 active:scale-95"
              >
                Back to Home
              </button>

              <button
                onClick={() => router.push("/#menu")}
                style={{
                  backgroundColor: "#B3784A",
                  border: "1.5px solid #B3784A",
                  color: "#FFFFFF",
                  borderRadius: "9999px",
                  padding: "13px 36px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(179, 120, 74, 0.25)",
                  transition: "all 0.2s ease",
                }}
                className="w-full sm:w-auto hover:bg-[#9E653A] active:scale-95"
              >
                Order Again
              </button>
            </div>

            {/* Bottom Muted Feedback Notice with Heart */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#8A7D6E]">
              <Heart size={13} color="#8A7D6E" fill="#8A7D6E" />
              <span>Your feedback helps us serve you better</span>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: ACTIVE TRACKING & STEPPER VIEW (PLACED, PREPARING, DELIVERY)      */
          /* ========================================================================= */
          <div>
            {/* Page Heading Row */}
            <div className="flex items-center justify-between mb-8">
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 700,
                  color: "#2E2620",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Track Your Order
              </h1>

              {/* Circular Refresh Button */}
              <button
                onClick={handleManualRefresh}
                title="Refresh order status"
                aria-label="Refresh order status"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#C08552",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="hover:bg-orange-50/60 active:scale-95"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
            </div>

            {/* Card 1: Estimated Delivery */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "24px 28px",
                boxShadow: "0 2px 16px rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#8A7D6E",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                ESTIMATED DELIVERY
              </span>
              <div className="flex items-center gap-3.5">
                <Clock size={28} color="#C08552" strokeWidth={2.2} />
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                    fontWeight: 700,
                    color: "#2E2620",
                    lineHeight: 1.2,
                  }}
                >
                  {remainingTimeText}
                </span>
              </div>
            </div>

            {/* Card 2: Status Stepper */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "28px 28px 24px",
                boxShadow: "0 2px 16px rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
                marginBottom: "20px",
              }}
            >
              <div className="flex flex-col">
                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStep;
                  const isCurrent = idx === currentStep;
                  const isUpcoming = idx > currentStep;
                  const isLast = idx === steps.length - 1;

                  return (
                    <div key={step.key} className="flex items-start">
                      {/* Left Column: Icon Circle + Vertical Line */}
                      <div className="flex flex-col items-center mr-4 shrink-0">
                        {/* Circle Node */}
                        {isCompleted ? (
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              backgroundColor: "#C08552",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#FFFFFF",
                            }}
                          >
                            <Check size={14} strokeWidth={3} />
                          </div>
                        ) : isCurrent ? (
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              border: "2px solid #C08552",
                              backgroundColor: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                            }}
                          >
                            {/* Center Dot */}
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: "#C08552",
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              border: "2px solid #E2D9CE",
                              backgroundColor: "#FFFFFF",
                            }}
                          />
                        )}

                        {/* Vertical Connecting Line */}
                        {!isLast && (
                          <div
                            style={{
                              width: "2px",
                              height: "48px",
                              backgroundColor: isCompleted ? "#C08552" : "#EBE3D8",
                              margin: "4px 0",
                            }}
                          />
                        )}
                      </div>

                      {/* Right Content: Title, Description, Timestamp */}
                      <div
                        className="flex-1 flex items-start justify-between min-w-0"
                        style={{ paddingTop: "2px", paddingBottom: !isLast ? "24px" : "0" }}
                      >
                        <div className="min-w-0 pr-4">
                          <h4
                            style={{
                              fontSize: "15px",
                              fontWeight: 700,
                              color: isUpcoming ? "#8A7D6E" : "#2E2620",
                              margin: "0 0 3px 0",
                              lineHeight: 1.3,
                            }}
                          >
                            {step.title}
                          </h4>
                          {step.description && (
                            <p
                              style={{
                                fontSize: "13px",
                                color:
                                  isCurrent && step.key === "out_for_delivery"
                                    ? "#C08552"
                                    : "#8A7D6E",
                                fontWeight:
                                  isCurrent && step.key === "out_for_delivery" ? 600 : 400,
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              {step.description}
                            </p>
                          )}
                        </div>

                        {/* Timestamp on right */}
                        {step.timestamp && (
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#8A7D6E",
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {step.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Order Details */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "28px 28px 24px",
                boxShadow: "0 2px 16px rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
                marginBottom: "28px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "#2E2620",
                  margin: "0 0 20px 0",
                }}
              >
                Order Details
              </h3>

              {/* Itemized list */}
              <div className="flex flex-col gap-2.5 mb-5">
                {order?.items && order.items.length > 0 ? (
                  order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[15px]">
                      <span style={{ color: "#2E2620", fontWeight: 500 }}>
                        {item.qty || 1} &times; {item.name}
                      </span>
                      <span style={{ color: "#2E2620", fontWeight: 700 }}>
                        ₹{((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center text-[15px]">
                    <span style={{ color: "#2E2620", fontWeight: 500 }}>
                      1 &times; Warm Cafe Order
                    </span>
                    <span style={{ color: "#2E2620", fontWeight: 700 }}>
                      ₹{Number(order?.total || 166).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#EFE8E1",
                  margin: "18px 0 20px",
                }}
              />

              {/* Key-Value Summary Details */}
              <div className="flex flex-col gap-3.5 text-sm">
                {/* Delivery Address */}
                <div className="flex items-start justify-between gap-4">
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#8A7D6E",
                      textTransform: "uppercase",
                      paddingTop: "2px",
                    }}
                  >
                    DELIVERY ADDRESS
                  </span>
                  <span
                    style={{
                      color: "#2E2620",
                      fontWeight: 600,
                      textAlign: "right",
                      maxWidth: "60%",
                      lineHeight: 1.4,
                    }}
                  >
                    {order?.customerAddress || "42 Marine Drive, Colaba, Mumbai 400005"}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="flex items-center justify-between gap-4">
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#8A7D6E",
                      textTransform: "uppercase",
                    }}
                  >
                    PAYMENT METHOD
                  </span>
                  <span style={{ color: "#2E2620", fontWeight: 600 }}>
                    {order?.paymentMethod || "Paid via UPI"}
                  </span>
                </div>

                {/* Order Placed */}
                <div className="flex items-center justify-between gap-4">
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#8A7D6E",
                      textTransform: "uppercase",
                    }}
                  >
                    ORDER PLACED
                  </span>
                  <span style={{ color: "#2E2620", fontWeight: 600 }}>
                    {formatDateFull(order?.placedAt || order?.timestamp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Live tracking footer hint */}
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#8A7D6E] mb-7">
              <RefreshCw size={13} className="text-[#8A7D6E]" />
              <span>Live tracking updates every 30 seconds</span>
            </div>

            {/* Action Buttons Side by Side */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
              <button
                onClick={() => router.push("/")}
                style={{
                  backgroundColor: "transparent",
                  border: "1.5px solid #C08552",
                  color: "#C08552",
                  borderRadius: "9999px",
                  padding: "13px 28px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="w-full sm:w-auto hover:bg-[#C08552]/10 active:scale-95"
              >
                Back to Home
              </button>

              <button
                onClick={() => router.push("/#menu")}
                style={{
                  backgroundColor: "#C08552",
                  border: "1.5px solid #C08552",
                  color: "#FFFFFF",
                  borderRadius: "9999px",
                  padding: "13px 32px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(192, 133, 82, 0.25)",
                  transition: "all 0.2s ease",
                }}
                className="w-full sm:w-auto hover:bg-[#A86F3E] active:scale-95"
              >
                Order Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
