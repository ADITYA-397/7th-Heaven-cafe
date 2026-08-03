"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { profile } = useAuth();
  const { cartItems, toggleCart, toggleProfile, toggleLogin } = useCart();

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserClick = () => {
    if (profile) toggleProfile();
    else router.push('/login');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="#" className="logo">7th Heaven.</a>
        <ul className={`nav-links ${mobileMenu ? 'active' : ''}`}>
          <li><a href="#home" onClick={() => setMobileMenu(false)}>Home</a></li>
          <li><a href="#about" onClick={() => setMobileMenu(false)}>Our Story</a></li>
          <li><a href="#menu" onClick={() => setMobileMenu(false)}>Menu</a></li>
          <li><a href="#contact" onClick={() => setMobileMenu(false)}>Visit Us</a></li>
          {profile?.role === 'admin' && <li><a href="/admin">Admin Panel</a></li>}
        </ul>
        <div className="nav-actions">
          <span className="nav-icon" id="user-icon" onClick={handleUserClick}>
            👤 <span id="user-name-display">{profile ? profile.name : ''}</span>
          </span>
          <span className="nav-icon" id="cart-icon" onClick={toggleCart}>
            🛒 <span id="cart-count">{cartCount}</span>
          </span>
        </div>
        <div className={`hamburger ${mobileMenu ? 'active' : ''}`} onClick={() => setMobileMenu(!mobileMenu)}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
}
