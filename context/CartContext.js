"use client";
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getItemKey = (item) => item.id || item.name;
  
  const addToCart = (item) => {
    const key = getItemKey(item);
    setCartItems(prev => {
      const existing = prev.find(i => getItemKey(i) === key);
      if (existing) {
        return prev.map(i => getItemKey(i) === key ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQuantity = (identifier, delta) => {
    setCartItems(prev => {
      const item = prev.find(i => getItemKey(i) === identifier || i.name === identifier);
      if (!item) return prev;
      const key = getItemKey(item);
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter(i => getItemKey(i) !== key);
      return prev.map(i => getItemKey(i) === key ? { ...i, qty: newQty } : i);
    });
  };
  
  const removeFromCart = (identifier) => {
    setCartItems(prev => prev.filter(item => getItemKey(item) !== identifier && item.name !== identifier));
  };
  
  const clearCart = () => setCartItems([]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, 
      isCartOpen, setIsCartOpen, toggleCart, 
      isProfileOpen, setIsProfileOpen, toggleProfile,
      cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
