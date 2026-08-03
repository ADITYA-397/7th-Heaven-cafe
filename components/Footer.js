"use client";
export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container footer-content fade-in-up is-visible">
        <div className="footer-section brand">
          <h2>7th Heaven.</h2>
          <p>Lighting up your day, one cup at a time.</p>
          <div className="socials">
            <span className="social-icon">IG</span>
            <span className="social-icon">FB</span>
            <span className="social-icon">TW</span>
          </div>
        </div>
        <div className="footer-section hours">
          <h3>Opening Hours</h3>
          <p>Mon - Fri: 7:00 AM - 5:00 PM</p>
          <p>Sat - Sun: 8:00 AM - 6:00 PM</p>
        </div>
        <div className="footer-section location">
          <h3>Visit Us</h3>
          <p>Tendulkar Building, 2/561 A, DP Rd</p>
          <p>Beside of SS Mobiles</p>
          <p>Kankavli, Maharashtra 416602</p>
          <p>Phone: 093229 41144</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} 7th Heaven. All rights reserved.</p>
      </div>
    </footer>
  );
}
