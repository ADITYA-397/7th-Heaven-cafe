"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Hero() {
  const container = useRef();

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Initial state setup for animation targets
    gsap.set('.hero-anim', { y: 40, opacity: 0 });

    tl.to('.hero-anim', {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.15,
      delay: 0.2
    });
  }, { scope: container });

  return (
    <header id="home" className="hero-cinematic" ref={container}>
      {/* Background Gradient Overlay */}
      <div className="hero-gradient-overlay"></div>

      <div className="hero-container">
        
        {/* Left Content Column */}
        <div className="hero-content-left hero-anim">
          <div className="hero-overline-group">
            <span className="hero-overline-line"></span>
            <span className="hero-overline-text">BREWLINE COFFEE & PEOPLE</span>
          </div>

          <h1 className="hero-editorial-headline">
            <span className="text-cream">Coffee, Coast &</span><br/>
            <span className="text-caramel">Good Company.</span>
          </h1>

          <p className="hero-body-text">
            More than coffee — it’s a feeling. Great brews,<br />
            breathtaking views, and even better people.
          </p>

          <div className="hero-button-group">
            <button onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary-warm">
              Explore Menu <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Floating Card */}
        <div className="hero-content-right hero-anim">
          <div className="floating-glass-card">
            <div className="card-header">
              <h3 className="card-title">Today's ritual</h3>
              <div className="card-controls">
                <span className="card-pagination">01 / 03</span>
                <button className="card-arrow">&lt;</button>
                <button className="card-arrow">&gt;</button>
              </div>
            </div>

            <div className="card-body">
              <div className="card-image-wrapper">
                <img src="/assets/latte_art_1775704589616.png" alt="Coconut Latte" className="card-coffee-image" />
              </div>
              <div className="card-text-content">
                <h4>Coconut Latte</h4>
                <p>A tropical twist for<br/>brighter days.</p>
              </div>
            </div>

            <div className="card-divider"></div>

            <div className="card-footer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>Freshly brewed • Daily</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Indicators */}
      <div className="hero-bottom-indicators">
        <div className="scroll-indicator hero-anim">
          <div className="scroll-icon">
            <div className="scroll-wheel"></div>
          </div>
          <div className="scroll-text">
            SCROLL<br/>TO EXPLORE
          </div>
        </div>
      </div>
    </header>
  );
}
