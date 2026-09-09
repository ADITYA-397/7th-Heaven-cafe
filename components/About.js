"use client";
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function About() {
  const container = useRef();

  useGSAP(() => {
    gsap.from('.about-text', {
      x: -60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

    gsap.from('.about-image-container', {
      x: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  }, { scope: container });

  return (
    <section id="about" className="about section" ref={container}>
      <div className="container about-content">
        <div className="about-text">
          <h2>The Art of the Bean</h2>
          <div className="underline"></div>
          <p>At Brewline, we believe coffee and food are more than just a routine; they are an experience. We source the finest ingredients and meticulously prepare them to perfection in-house, bringing you a slice of happiness.</p>
          <p>Every cup is a symphony of rich, complex flavors, crafted by passionate baristas who dedicate themselves to the perfect pour.</p>
          <a href="#contact" className="secondary-button">Visit Our Roastery</a>
        </div>
        <div className="about-image-container">
          <img src="/assets/pourover_1775704620711.png" alt="Pour over coffee preparation" className="about-image floating" />
        </div>
      </div>
    </section>
  );
}
