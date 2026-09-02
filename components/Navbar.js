"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { user, profile } = useAuth();
  const { cartItems, toggleCart, toggleProfile, toggleLogin } = useCart();

  const isSolid = scrolled || (pathname && pathname !== '/');
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserClick = () => {
    if (user || profile) toggleProfile();
    else router.push('/login');
  };

  const displayName = profile?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : '');

  return (
    <nav className={`navbar ${isSolid ? 'scrolled' : ''}`} id="navbar" style={{
      backgroundColor: isSolid ? '#EDE7DC' : 'transparent',
      borderBottom: isSolid ? '1px solid #D8CEBF' : 'none',
      transition: 'background-color 0.3s ease',
    }}>
      <div className="nav-container" style={{ maxWidth: "1160px", padding: "0 clamp(24px, 5vw, 64px)" }}>
        <a href="/" className="logo" style={{ color: isSolid ? '#2E2620' : undefined, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>7th Heaven.</a>
        <ul className={`nav-links ${mobileMenu ? 'active' : ''}`}>
          <li><a href="/#home" onClick={() => setMobileMenu(false)} style={{ color: '#C08552', fontWeight: 600 }}>Home</a></li>
          <li><a href="/#about" onClick={() => setMobileMenu(false)} style={{ color: isSolid ? '#2E2620' : undefined }}>Our Story</a></li>
          <li><a href="/#menu" onClick={() => setMobileMenu(false)} style={{ color: isSolid ? '#2E2620' : undefined }}>Menu</a></li>
          <li><a href="/#contact" onClick={() => setMobileMenu(false)} style={{ color: isSolid ? '#2E2620' : undefined }}>Visit Us</a></li>
          {profile?.role === 'admin' && (
            <li><a href="/admin" onClick={() => setMobileMenu(false)} style={{ color: isSolid ? '#2E2620' : undefined }}>Admin Panel</a></li>
          )}
        </ul>
        <div className="nav-actions">
          <span className="nav-icon" id="user-icon" onClick={handleUserClick} style={{ color: isSolid ? '#2E2620' : undefined, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {displayName && (
              <span id="user-name-display" style={{ fontSize: '14px', fontWeight: 500 }}>{displayName}</span>
            )}
          </span>
          <span className="nav-icon" id="cart-icon" onClick={toggleCart} style={{ color: isSolid ? '#2E2620' : undefined, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && (
              <span id="cart-count" style={{
                backgroundColor: '#C08552',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '9999px',
                padding: '1px 6px',
                lineHeight: 1.2,
              }}>{cartCount}</span>
            )}
          </span>
        </div>
        <div className={`hamburger ${mobileMenu ? 'active' : ''}`} onClick={() => setMobileMenu(!mobileMenu)}>
          <span className="bar" style={{ backgroundColor: isSolid ? '#2E2620' : undefined }}></span>
          <span className="bar" style={{ backgroundColor: isSolid ? '#2E2620' : undefined }}></span>
          <span className="bar" style={{ backgroundColor: isSolid ? '#2E2620' : undefined }}></span>
        </div>
      </div>
    </nav>
  );
}
