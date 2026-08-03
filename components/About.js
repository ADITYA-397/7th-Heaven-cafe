"use client";
export default function About() {
  return (
    <section id="about" className="about section">
      <div className="container about-content">
        <div className="about-text fade-in-left is-visible">
          <h2>The Art of the Bean</h2>
          <div className="underline"></div>
          <p>At 7th Heaven, we believe coffee and food are more than just a routine; they are an experience. We source the finest ingredients and meticulously prepare them to perfection in-house, bringing you a slice of happiness.</p>
          <p>Every cup is a symphony of rich, complex flavors, crafted by passionate baristas who dedicate themselves to the perfect pour.</p>
          <a href="#contact" className="secondary-button">Visit Our Roastery</a>
        </div>
        <div className="about-image-container fade-in-right is-visible">
          <img src="/assets/pourover_1775704620711.png" alt="Pour over coffee preparation" className="about-image floating" />
        </div>
      </div>
    </section>
  );
}
