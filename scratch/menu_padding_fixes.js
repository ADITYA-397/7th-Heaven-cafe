// Run: node scratch/menu_padding_fixes.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. MENU ITEM CARD
code = code.replace(
  '<div className="p-4 flex-1 flex flex-col gap-1.5">',
  '<div className="flex-1 flex flex-col gap-1.5" style={{ padding: "16px" }}>'
);
code = code.replace(
  '<span className="self-start text-[10px] font-bold text-[#F97316] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-lg">{item.category}</span>',
  '<span className="self-start text-[10px] font-bold text-[#F97316] uppercase tracking-widest bg-orange-50 rounded-lg" style={{ padding: "6px 12px" }}>{item.category}</span>'
);
code = code.replace(
  '<div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-base font-bold text-gray-900 shadow-sm">₹{item.price}</div>',
  '<div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-xl text-base font-bold text-gray-900 shadow-sm" style={{ padding: "6px 14px" }}>₹{item.price}</div>'
);

// 2. "ADD MENU ITEM" BUTTON
code = code.replace(
  '<button onClick={()=>setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-sm shadow-orange-200/50 active:scale-95 whitespace-nowrap">',
  '<button onClick={()=>setShowAddForm(!showAddForm)} className="flex items-center gap-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl text-sm font-bold transition-all shadow-sm shadow-orange-200/50 active:scale-95 whitespace-nowrap" style={{ padding: "14px 24px" }}>'
);
code = code.replace(
  '<button type="submit" className="px-8 py-3.5 rounded-2xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-sm shadow-sm shadow-orange-200/50 transition-all">Publish Item</button>',
  '<button type="submit" className="rounded-2xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-sm shadow-sm shadow-orange-200/50 transition-all" style={{ padding: "14px 32px" }}>Publish Item</button>'
);

// 3. SEARCH INPUT
code = code.replace(
  '<div className="flex items-center bg-white border border-gray-200 rounded-2xl px-5 h-14 w-full sm:max-w-[360px] shadow-sm focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50 transition-all">',
  '<div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl h-14 w-full sm:max-w-[360px] shadow-sm focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50 transition-all" style={{ padding: "0 20px" }}>'
);
code = code.replace(
  '<Search size={18} className="text-gray-400 mr-3 shrink-0"/>',
  '<Search size={18} className="text-gray-400 shrink-0"/>'
);
code = code.replace(
  'placeholder="Search menu items\\u2026"',
  'placeholder="Search menu items..."'
);
code = code.replace(
  '<button onClick={()=>setMenuSearch(\'\')} className="text-gray-400 hover:text-gray-600 p-1"><X size={16}/></button>',
  '<button onClick={()=>setMenuSearch(\'\')} className="text-gray-400 hover:text-gray-600 flex items-center justify-center" style={{ padding: "4px" }}><X size={16}/></button>'
);

// 4. ADD ITEM FORM INPUTS
code = code.replace(
  '<input type={type} placeholder={placeholder} required value={newItem[key]} onChange={e=>setNewItem({...newItem,[key]:e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-[#F8FAFC] border border-gray-200 text-base text-gray-900 font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all"/>',
  '<input type={type} placeholder={placeholder} required value={newItem[key]} onChange={e=>setNewItem({...newItem,[key]:e.target.value})} className="w-full rounded-xl bg-[#F8FAFC] border border-gray-200 text-base text-gray-900 font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all" style={{ padding: "14px 16px" }}/>'
);
code = code.replace(
  '<label htmlFor="menu-img" className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-[#F8FAFC] border border-gray-200 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all">',
  '<label htmlFor="menu-img" className="flex items-center gap-3 w-full rounded-xl bg-[#F8FAFC] border border-gray-200 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all" style={{ padding: "14px 16px" }}>'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Menu Editor padding fixes applied.');
