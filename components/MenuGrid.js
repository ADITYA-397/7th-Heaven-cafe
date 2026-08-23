"use client";
import { useEffect, useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, ArrowRight, ChevronUp, Sparkles } from 'lucide-react';

// Premium photo mapping for specific items

const ScallopedDivider = ({ position = "top", color = "#EAE3D9" }) => {
  return (
    <div className={`absolute left-0 w-full overflow-hidden leading-[0] ${position === "top" ? "top-0 rotate-180" : "bottom-0"}`} style={{ height: "40px" }}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-full">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.38,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill={color} opacity=".25"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill={color} opacity=".5"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.41,103,45,225.31,13.52,325-29.07,31.38-13.43,65.69-25.56,106-21.72V0Z" fill={color}></path>
      </svg>
    </div>
  );
};

const VintageMenuItem = ({ item, addToCart }) => {
  return (
    <div className="group border-b border-[#3B2E28]/10 last:border-0 transition-all duration-500 hover:bg-[#3B2E28]/[0.02] -mx-4 rounded-xl" style={{ padding: "32px 16px" }}>
      <div className="menu-item-row relative">
        <h4 className="menu-item-name font-heading">{item.name}</h4>
        <div className="menu-item-dots" />
        <div className="flex items-center gap-4">
          <span className="menu-item-price">₹ {Number(item.price).toFixed(2)}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
            className="w-8 h-8 rounded-full border border-[#8C6A53]/30 text-[#8C6A53] flex items-center justify-center hover:bg-[#3B2E28] hover:text-white hover:border-[#3B2E28] transition-all transform active:scale-90 shadow-sm"
            title="Add to cart"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <p className="menu-item-description" style={{ marginTop: "16px" }}>
        {item.description || "Freshly prepared for you with the finest ingredients."}
      </p>
    </div>
  );
};

export default function MenuGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const groupedMenu = useMemo(() => {
    return items.reduce((acc, item) => {
      if (item.inStock === false) return acc;
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [items]);

  const sortedCategories = Object.keys(groupedMenu).sort();
  const featuredItems = items.filter(i => i.inStock !== false).slice(0, 8);

  if (loading) {
    return (
      <section className="py-32 bg-[#EAE3D9] min-h-[60vh] flex items-center justify-center">
         <div className="w-10 h-10 border-2 border-[#8C6A53] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section id="menu" className="bg-[#EAE3D9] relative overflow-hidden font-serif scroll-mt-28" style={{ padding: "96px 24px 72px 24px" }}>
      <ScallopedDivider position="top" color="#EAE3D9" />
      <ScallopedDivider position="bottom" color="#EAE3D9" />

      <div className="container mx-auto relative z-10">
        
        {/* === HEADER === */}
        <div className="flex flex-col items-center text-center mb-32 space-y-6">
          <div className="inline-flex items-center gap-3 border-y border-[#C28751]/20" style={{ padding: "12px 32px" }}>
             <div className="w-1.5 h-1.5 rounded-full bg-[#C28751]" />
             <span className="text-sm uppercase tracking-[0.4em] font-heading font-medium text-[#C28751]">The Selection</span>
             <div className="w-1.5 h-1.5 rounded-full bg-[#C28751]" />
          </div>
          <h2 className="text-5xl md:text-7xl font-heading font-black text-[#3B2E28] tracking-tighter leading-tight mb-4">Our Menu</h2>
          <div className="menu-ornament-top" />
          <p className="max-w-xl text-[#5C4A3E] text-base md:text-lg italic leading-relaxed opacity-80 font-serif text-center mt-12 px-4">
             Experience the perfect symphony of flavor and craft, where every bean tells a story.
          </p>
        </div>

        {/* === MENU CONTENT === */}
        <div className="transition-all duration-1000 ease-in-out">
          {!isExpanded ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-32 gap-y-0">
              {featuredItems.map(item => (
                <VintageMenuItem key={item.id} item={item} addToCart={addToCart} />
              ))}
            </div>
          ) : (
            <div className="space-y-16 md:space-y-20">
              {sortedCategories.map(category => (
                <div key={category} className="space-y-8 md:space-y-10">
                  <div className="text-center space-y-3">
                    <h3 className="text-3xl md:text-5xl font-heading font-bold text-[#3B2E28] tracking-tight">{category}</h3>
                    <div className="menu-ornament-top !my-0 opacity-40" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-32 gap-y-0 max-w-6xl mx-auto">
                    {groupedMenu[category].map(item => (
                      <VintageMenuItem key={item.id} item={item} addToCart={addToCart} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === PREMIUM VIEW FULL MENU BUTTON === */}
        <div className="text-center" style={{ marginTop: "72px" }}>
          <button 
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (isExpanded) {
                const el = document.getElementById('menu');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group relative inline-flex items-center gap-4 bg-[#C28751] text-[#3B2E28] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-2 border-[#3B2E28] shadow-[4px_4px_0px_0px_rgba(59,46,40,1)] transition-all duration-300 hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] hover:shadow-[5px_5px_0px_0px_rgba(59,46,40,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(59,46,40,1)]" style={{ padding: "16px 36px" }}
          >
            <span className="text-xs md:text-sm font-heading font-bold uppercase tracking-widest relative z-10">
              {isExpanded ? "Back to Featured" : "View Full Menu"}
            </span>
            <ArrowRight size={16} className="relative z-10" />
          </button>
        </div>

      </div>
    </section>
  );
}
