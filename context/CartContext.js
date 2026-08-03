"use client";
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQuantity = (name, delta) => {
    setCartItems(prev => {
      const item = prev.find(i => i.name === name);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.name !== name);
      return prev.map(i => i.name === name ? { ...i, qty: newQty } : i);
    });
  };
  
  const removeFromCart = (name) => {
    setCartItems(prev => prev.filter(item => item.name !== name));
  };
  
  const clearCart = () => setCartItems([]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const toggleLogin = () => setIsLoginOpen(!isLoginOpen);
  
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, 
      isCartOpen, setIsCartOpen, toggleCart, 
      isProfileOpen, setIsProfileOpen, toggleProfile, 
      isLoginOpen, setIsLoginOpen, toggleLogin,
      cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
