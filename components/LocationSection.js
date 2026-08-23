"use client";
import React from 'react';

export default function LocationSection() {
  return (
    <section 
      id="contact" 
      className="location-section relative scroll-mt-24 w-full"
      style={{ 
        backgroundColor: '#EFE8DE',
        padding: 'clamp(72px, 8vw, 110px) 0',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      {/* Centered Main Container */}
      <div 
        className="w-full"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(24px, 5vw, 48px)'
        }}
      >
        
        {/* Section Header - Centered in middle */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 border-y border-[#C28751]/30 py-2 px-6 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C28751]" />
            <span className="text-xs uppercase tracking-[0.35em] font-semibold text-[#C08552]">
              Visit Us
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#C28751]" />
          </div>

          <h2 
            className="text-[#2E2620] tracking-tight leading-tight text-center"
            style={{ 
              fontFamily: "'Fraunces', 'Playfair Display', serif",
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              fontWeight: 600
            }}
          >
            Find Your Way To 7th Heaven.
          </h2>
          <p 
            className="text-[#6E5D53] text-sm md:text-base font-normal max-w-xl mx-auto mt-4 leading-relaxed text-center"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Warm brews, delightful spaces, and handcrafted treats await you at our flagship sanctuary
          </p>
        </div>

        {/* Two-Column Grid: Map (Left) + Contact Info (Right) - Centered in Middle */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch"
          style={{
            maxWidth: '1080px',
            margin: '0 auto'
          }}
        >
          
          {/* Left Column: Embedded Google Map */}
          <div className="lg:col-span-6 flex flex-col">
            <div 
              className="w-full h-full min-h-[380px] lg:min-h-[460px] rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(59,46,40,0.06)]"
              style={{
                border: '1px solid #D8CEBF',
                backgroundColor: '#E5DCD0'
              }}
            >
              <iframe
                title="7th Heaven Cafe Location Map"
                src="https://maps.google.com/maps?q=16.2648896,73.7103669&hl=en&z=17&output=embed"
                width="100%"
                height="100%"
                className="w-full h-full min-h-[380px] lg:min-h-[460px] border-0 block"
                style={{ filter: 'contrast(1.02) saturate(1.05)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Stacked Contact Info + Directions Button */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6 lg:space-y-0 lg:py-1 lg:pl-4">
            
            {/* Contact Rows Container */}
            <div className="flex flex-col gap-6 lg:gap-[24px]">
              
              {/* Row 1: ADDRESS */}
              <div className="flex items-start gap-4">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid #D8CEBF'
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#C08552" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <span 
                    className="block text-[11px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: '#C08552', marginBottom: '6px' }}
                  >
                    Address
                  </span>
                  <p className="text-[#3B2E28] text-sm md:text-[15px] font-normal leading-snug">
                    Tendulkar Building, DP Road,<br />
                    Kankavli, Sindhudurg – 416602<br />
                    <span className="text-[#6E5D53] text-xs font-normal">(Beside SS Mobile)</span>
                  </p>
                </div>
              </div>

              {/* Row 2: PHONE */}
              <div className="flex items-start gap-4">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid #D8CEBF'
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#C08552" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <span 
                    className="block text-[11px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: '#C08552', marginBottom: '6px' }}
                  >
                    Phone
                  </span>
                  <a 
                    href="tel:08460547067" 
                    className="block text-[#3B2E28] text-sm md:text-[15px] font-normal leading-snug hover:text-[#C08552] transition-colors"
                  >
                    08460547067
                  </a>
                </div>
              </div>

              {/* Row 3: INSTAGRAM */}
              <div className="flex items-start gap-4">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid #D8CEBF'
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#C08552" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <span 
                    className="block text-[11px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: '#C08552', marginBottom: '6px' }}
                  >
                    Instagram
                  </span>
                  <a 
                    href="https://instagram.com/7thheavenkankavli" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block text-[#3B2E28] text-sm md:text-[15px] font-normal leading-snug hover:text-[#C08552] transition-colors"
                  >
                    @7thheavenkankavli
                  </a>
                </div>
              </div>

              {/* Row 4: FACEBOOK */}
              <div className="flex items-start gap-4">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid #D8CEBF'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C08552" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <div>
                  <span 
                    className="block text-[11px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: '#C08552', marginBottom: '6px' }}
                  >
                    Facebook
                  </span>
                  <a 
                    href="https://www.facebook.com/search/top?q=7th%20Heaven%20Cafe%20Kankavli" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block text-[#3B2E28] text-sm md:text-[15px] font-normal leading-snug hover:text-[#C08552] transition-colors"
                  >
                    7th Heaven Cafe Kankavli
                  </a>
                </div>
              </div>

              {/* Row 5: HOURS */}
              <div className="flex items-start gap-4">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid #D8CEBF'
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#C08552" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <span 
                    className="block text-[11px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: '#C08552', marginBottom: '6px' }}
                  >
                    Hours
                  </span>
                  <p className="text-[#3B2E28] text-sm md:text-[15px] font-normal leading-snug">
                    Open Daily, till 9:30 PM
                  </p>
                </div>
              </div>

            </div>

            {/* Single Full-Width Solid Directions Button */}
            <div className="pt-4 lg:pt-6">
              <a
                href="https://maps.app.goo.gl/ioNJbrfYG1tcCiXA7"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center py-3.5 px-6 rounded-full font-semibold text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_4px_14px_rgba(192,133,82,0.25)] hover:shadow-[0_6px_20px_rgba(169,111,63,0.35)] active:scale-[0.99]"
                style={{
                  backgroundColor: '#C08552',
                  color: '#FFFFFF',
                  border: '1.5px solid #C08552'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#A96F3F';
                  e.currentTarget.style.borderColor = '#A96F3F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#C08552';
                  e.currentTarget.style.borderColor = '#C08552';
                }}
              >
                Directions
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
