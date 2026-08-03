"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NotificationItem = ({
  notification,
  index,
  onMarkAsRead,
  textColor = "text-white",
  dotColor = "bg-[#d9534f]", // Using the same red as the badge
  hoverBgColor = "hover:bg-[#ffffff15]",
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    key={notification.id}
    style={{ padding: '1.25rem 2.5rem' }}
    className={cn(`${hoverBgColor} cursor-pointer transition-all border-b border-white/[0.03] last:border-0`)}
    onClick={() => onMarkAsRead(notification.id)}
  >
    <div className="flex justify-between items-start gap-4">
      <div className="flex items-center gap-3">
        {!notification.read && (
          <span className={`h-2 w-2 rounded-full ${dotColor} flex-shrink-0 shadow-[0_0_8px_rgba(217,83,79,0.5)]`} />
        )}
        <h4 className={`text-[14px] font-semibold tracking-tight ${textColor}`}>
          {notification.title}
        </h4>
      </div>

      <span className={`text-[10px] font-bold uppercase tracking-widest opacity-30 ${textColor} whitespace-nowrap`}>
        {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
    <p className={`text-[12px] opacity-50 mt-1.5 leading-relaxed ${textColor} max-w-[240px]`}>
      {notification.description}
    </p>
  </motion.div>
);

const NotificationList = ({
  notifications,
  onMarkAsRead,
  textColor,
  hoverBgColor,
  dividerColor = "divide-white/10",
}) => (
  <div className={`divide-y ${dividerColor}`}>
    {notifications.map((notification, index) => (
      <NotificationItem
        key={notification.id}
        notification={notification}
        index={index}
        onMarkAsRead={onMarkAsRead}
        textColor={textColor}
        hoverBgColor={hoverBgColor}
      />
    ))}
  </div>
);

export const NotificationPopover = ({
  notifications = [],
  onNotificationsChange,
  buttonClassName = "w-10 h-10 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-white/10 shadow-lg",
  popoverClassName = "bg-[#111] border border-white/10 backdrop-blur-xl",
  textColor = "text-white",
  hoverBgColor = "hover:bg-white/5",
  dividerColor = "divide-white/10",
  headerBorderColor = "border-white/10",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleOpen = () => setIsOpen(!isOpen);

  const markAllAsRead = (e) => {
    e.stopPropagation();
    const updatedNotifications = notifications.map((n) => ({
      ...n,
      read: true,
    }));
    onNotificationsChange?.(updatedNotifications);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    onNotificationsChange?.(updatedNotifications);
  };

  return (
    <div className={`relative ${textColor}`}>
      <Button
        onClick={toggleOpen}
        variant="ghost"
        size="icon"
        className={cn("relative", buttonClassName)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#d9534f] rounded-lg flex items-center justify-center text-[10px] border border-[#d9534f] text-white font-bold shadow-lg">
            {unreadCount}
          </div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile or to close on click outside */}
            <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "absolute right-0 mt-4 w-[360px] max-h-[580px] overflow-hidden rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] z-50",
                "backdrop-blur-3xl",
                popoverClassName
              )}
            >
              <div
                style={{ padding: '2rem 2.5rem' }}
                className={`border-b ${headerBorderColor} flex justify-between items-center bg-black/5`}
              >
                <div className="flex items-center gap-4 min-w-0">
                    <h3 className={`text-[16px] font-bold tracking-tight ${textColor}`}>Notifications</h3>
                    {unreadCount > 0 && (
                        <div className="px-2.5 py-1 rounded-full bg-[#d9534f] text-[10px] font-black text-white shadow-lg">
                            {unreadCount}
                        </div>
                    )}
                </div>
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  size="sm"
                  className={`text-[11px] font-semibold h-8 px-4 -mr-4 rounded-xl ${hoverBgColor} text-white/40 hover:text-white transition-all`}
                >
                  Clear all
                </Button>
              </div>

              <div className="overflow-y-auto max-h-[460px] scrollbar-hide">
                {notifications.length === 0 ? (
                  <div style={{ padding: '4rem 2.5rem' }} className={`text-center flex flex-col items-center gap-6 ${textColor}`}>
                    <div className="w-16 h-16 rounded-full bg-black/5 border border-black/5 flex items-center justify-center shadow-inner">
                        <Bell size={28} className="opacity-20" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[15px] font-semibold opacity-70">No new alerts</p>
                        <p className="text-[12px] opacity-40 px-4 leading-relaxed">We'll notify you when new orders arrive or status updates occur.</p>
                    </div>
                  </div>
                ) : (
                  <NotificationList
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                    textColor={textColor}
                    hoverBgColor={hoverBgColor}
                    dividerColor={dividerColor}
                  />
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-6 border-t border-black/5 bg-black/[0.02] text-center">
                    <p className={`text-[11px] font-semibold tracking-wider uppercase opacity-30 ${textColor}`}>End of updates</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
