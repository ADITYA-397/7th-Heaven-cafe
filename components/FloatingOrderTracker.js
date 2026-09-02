"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, ChevronUp, ChevronDown, Clock, ArrowRight, X } from "lucide-react";

export default function FloatingOrderTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [activeOrders, setActiveOrders] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  // Helper to normalize and check if status is active (not delivered)
  const isStatusActive = (status) => {
    if (!status) return true;
    const s = status.toLowerCase();
    return !s.includes("deliver") || s.includes("out");
  };

  const getStatusLabel = (status) => {
    if (!status) return "Placed";
    const s = status.toLowerCase();
    if (s.includes("out") || s.includes("delivery")) return "Out for Delivery";
    if (s.includes("prepar")) return "Preparing";
    return "Placed";
  };

  // Real-time Firestore query for active orders
  useEffect(() => {
    let unsubscribeUser = () => {};
    let unsubscribeGuest = () => {};

    // 1. If logged in, listen to user orders in real time
    if (user?.uid) {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      unsubscribeUser = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((o) => isStatusActive(o.status));

          // Sort by placedAt / timestamp descending
          list.sort((a, b) => {
            const timeA = new Date(a.placedAt || a.timestamp || 0).getTime();
            const timeB = new Date(b.placedAt || b.timestamp || 0).getTime();
            return timeB - timeA;
          });

          setActiveOrders(list);
        },
        (error) => {
          console.error("FloatingOrderTracker snapshot error:", error);
        }
      );
    } else {
      // 2. For guests, check local guest order IDs
      const localGuestIds = [];
      try {
        const stored = JSON.parse(localStorage.getItem("7h_active_orders") || "[]");
        if (Array.isArray(stored)) {
          localGuestIds.push(...stored);
        }
      } catch (e) {}

      if (localGuestIds.length > 0) {
        // Listen to all orders and filter locally for recent guest IDs
        unsubscribeGuest = onSnapshot(
          collection(db, "orders"),
          (snapshot) => {
            const list = snapshot.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((o) => localGuestIds.includes(o.id) && isStatusActive(o.status));

            list.sort((a, b) => {
              const timeA = new Date(a.placedAt || a.timestamp || 0).getTime();
              const timeB = new Date(b.placedAt || b.timestamp || 0).getTime();
              return timeB - timeA;
            });

            setActiveOrders(list);
          },
          (error) => {
            console.error("FloatingOrderTracker guest error:", error);
          }
        );
      } else {
        setActiveOrders([]);
      }
    }

    return () => {
      unsubscribeUser();
      unsubscribeGuest();
    };
  }, [user]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  // If 0 active orders, do not render
  if (activeOrders.length === 0) {
    return null;
  }

  // If on track-order page for the single active order, hide to prevent duplicate UI
  if (activeOrders.length === 1 && pathname === `/track-order/${activeOrders[0].id}`) {
    return null;
  }

  const singleOrder = activeOrders[0];
  const isMultiple = activeOrders.length >= 2;

  const handlePillClick = () => {
    if (isMultiple) {
      setIsPopoverOpen((prev) => !prev);
    } else {
      router.push(`/track-order/${singleOrder.id}`);
    }
  };

  const formatItemSummary = (items) => {
    if (!items || items.length === 0) return "Warm Cafe Order";
    const firstItem = items[0]?.name || "Cafe Item";
    const extraCount = items.length - 1;
    if (extraCount > 0) {
      return `${firstItem} +${extraCount} more`;
    }
    return firstItem;
  };

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end max-w-[calc(100vw-32px)]"
      style={{
        fontFamily:
          "var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MULTI-ORDER POPOVER (WHEN 2+ ACTIVE ORDERS AND POPOVER OPEN)  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isMultiple && isPopoverOpen && (
        <div
          className="mb-3 w-[calc(100vw-32px)] sm:w-[360px] max-w-[360px] bg-white rounded-2xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.16)] border border-black/[0.06] animate-fadeIn"
          style={{
            boxShadow: "0 14px 40px rgba(59, 46, 40, 0.18)",
            animation: "fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#EFE8E1]">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#2E2620] text-base">
                Active Orders
              </span>
              <span className="bg-[#C08552] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {activeOrders.length}
              </span>
            </div>
            <button
              onClick={() => setIsPopoverOpen(false)}
              className="text-[#8A7D6E] hover:text-[#2E2620] p-1 rounded-lg transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Orders List */}
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {activeOrders.map((order) => {
              const statusLabel = getStatusLabel(order.status);
              const orderShortId = `#7H-${order.id.slice(-4).toUpperCase()}`;

              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setIsPopoverOpen(false);
                    router.push(`/track-order/${order.id}`);
                  }}
                  className="group p-3 rounded-xl hover:bg-[#F8F5F0] transition-all cursor-pointer border border-transparent hover:border-[#EAE3D9] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    {/* Top line: Order ID + Status badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif font-bold text-[14px] text-[#2E2620]">
                        {orderShortId}
                      </span>
                      <span className="text-[10px] font-bold text-[#C08552] bg-orange-50 border border-[#C08552]/20 px-2 py-0.5 rounded-full tracking-wide">
                        {statusLabel}
                      </span>
                    </div>

                    {/* Bottom line: Items summary */}
                    <p className="text-xs text-[#8A7D6E] font-medium truncate">
                      {formatItemSummary(order.items)}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="w-7 h-7 rounded-full bg-white border border-[#EAE3D9] group-hover:bg-[#C08552] group-hover:border-[#C08552] group-hover:text-white text-[#8A7D6E] flex items-center justify-center transition-all shrink-0">
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FLOATING PILL BUTTON                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <button
        onClick={handlePillClick}
        style={{
          backgroundColor: "#C08552",
          color: "#FFFFFF",
          borderRadius: "9999px",
          padding: "13px 22px",
          fontSize: "14px",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          border: "none",
          boxShadow: "0 8px 24px rgba(192, 133, 82, 0.45)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          lineHeight: 1.2,
        }}
        className="hover:scale-105 active:scale-95 select-none hover:shadow-[0_10px_28px_rgba(192,133,82,0.55)]"
      >
        {/* Shopping Bag Icon with subtle bounce */}
        <ShoppingBag size={18} strokeWidth={2.2} className="shrink-0" />

        {/* Label */}
        {isMultiple ? (
          <span className="tracking-tight flex items-center gap-1.5">
            <span>{activeOrders.length} Active Orders</span>
            {isPopoverOpen ? (
              <ChevronDown size={15} strokeWidth={2.5} />
            ) : (
              <ChevronUp size={15} strokeWidth={2.5} />
            )}
          </span>
        ) : (
          <span className="tracking-tight whitespace-nowrap">
            Track Order &middot; {getStatusLabel(singleOrder.status)}
          </span>
        )}
      </button>

      {/* Custom Styles for Entry Animation */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
