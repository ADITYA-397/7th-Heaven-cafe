"use client";
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import FloatingOrderTracker from '../components/FloatingOrderTracker';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <FloatingOrderTracker />
      </CartProvider>
    </AuthProvider>
  );
}

