// Run: node scratch/menugrid_layout_fixes.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'components', 'MenuGrid.js');
let code = fs.readFileSync(file, 'utf8');

// 1. VintageMenuItem fixes
const oldVintageMenuItem = `const VintageMenuItem = ({ item, addToCart }) => {
  return (
    <div className="group pt-12 pb-16 border-b border-[#3B2E28]/10 last:border-0 transition-all duration-500 hover:bg-[#3B2E28]/[0.02] -mx-4 px-4 rounded-xl">
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
      <p className="menu-item-description mt-3 mb-2">
        {item.description || "Freshly prepared for you with the finest ingredients."}
      </p>
    </div>
  );
};`;

const newVintageMenuItem = `const VintageMenuItem = ({ item, addToCart }) => {
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
};`;

code = code.replace(oldVintageMenuItem, newVintageMenuItem);

// 2. Section spacing and padding
code = code.replace(
  '<section id="menu" className="py-32 bg-[#EAE3D9] relative overflow-hidden font-serif">',
  '<section id="menu" className="bg-[#EAE3D9] relative overflow-hidden font-serif" style={{ padding: "160px 24px 120px 24px" }}>'
);
code = code.replace(
  '<div className="container relative z-10 px-6">',
  '<div className="container mx-auto relative z-10">'
);

// 3. Grid gap adjustments
code = code.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-32 gap-y-16">',
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-32 gap-y-0">'
);
code = code.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-32 gap-y-12 max-w-6xl mx-auto">',
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-32 gap-y-0 max-w-6xl mx-auto">'
);

// 4. View Full Menu button padding
code = code.replace(
  'className="group relative inline-flex items-center gap-3 px-7 py-2.5 bg-[#C28751] text-[#3B2E28] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-2 border-[#3B2E28] shadow-[4px_4px_0px_0px_rgba(59,46,40,1)] transition-all duration-300 hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] hover:shadow-[5px_5px_0px_0px_rgba(59,46,40,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(59,46,40,1)]"',
  'className="group relative inline-flex items-center gap-4 bg-[#C28751] text-[#3B2E28] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border-2 border-[#3B2E28] shadow-[4px_4px_0px_0px_rgba(59,46,40,1)] transition-all duration-300 hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] hover:shadow-[5px_5px_0px_0px_rgba(59,46,40,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(59,46,40,1)]" style={{ padding: "16px 36px" }}'
);

// 5. Header small ornament padding
code = code.replace(
  '<div className="inline-flex items-center gap-3 border-y border-[#C28751]/20 py-3 px-8">',
  '<div className="inline-flex items-center gap-3 border-y border-[#C28751]/20" style={{ padding: "12px 32px" }}>'
);


fs.writeFileSync(file, code, 'utf8');
console.log('MenuGrid padding fixes applied.');
