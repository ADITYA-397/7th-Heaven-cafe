"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { user, profile } = useAuth();
  const { cartItems, toggleCart, toggleProfile } = useCart();

  const isSolid = scrolled || (pathname && pathname !== '/');
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenu]);

  const handleUserClick = () => {
    if (user || profile) toggleProfile();
    else router.push('/login');
  };

  return (
    <div className="navbar-wrapper">
      <nav className={`navbar-glass ${isSolid ? 'scrolled' : ''}`}>
        
        <div className="nav-brand-pill">
          <Link href="/" className="logo-text">
            <span className="logo-main">Brewline.</span>
            <span className="logo-sub">COFFEE & PEOPLE</span>
          </Link>
        </div>

        <ul className={`nav-links-centered ${mobileMenu ? 'active' : ''}`}>
          <li><Link href="/#home" onClick={() => setMobileMenu(false)} className="nav-link-active">Home</Link></li>
          <li><Link href="/#about" onClick={() => setMobileMenu(false)}>Our Story</Link></li>
          <li><Link href="/#menu" onClick={() => setMobileMenu(false)}>Menu</Link></li>
          <li><Link href="/#contact" onClick={() => setMobileMenu(false)}>Visit Us</Link></li>
          {profile?.role === 'admin' && (
            <li><Link href="/admin" onClick={() => setMobileMenu(false)}>Admin Panel</Link></li>
          )}
        </ul>

        <div className="nav-actions-right">
          <div className="nav-icons-group">
            <button className="nav-icon-outline" onClick={handleUserClick} aria-label="User Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <div className="nav-icon-separator"></div>
            <button className="nav-icon-outline cart-icon-wrapper" onClick={toggleCart} aria-label="Shopping Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
          
          <button className="nav-cta-pill" onClick={() => router.push('/#menu')}>
            <span className="cta-text">Good Coffee<br/>Brighter Days</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div className={`hamburger ${mobileMenu ? 'active' : ''}`} onClick={() => setMobileMenu(!mobileMenu)}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

      </nav>
    </div>
  );
}
