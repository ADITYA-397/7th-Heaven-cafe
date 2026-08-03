// Run: node scratch/orders_layout_fixes.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. PAGE-LEVEL PADDING
code = code.replace(
  '<div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-20">',
  '<div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-20" style={{ padding: "32px" }}>'
);

// 2. FILTER TABS & SEARCH
code = code.replace(
  '<div className="flex items-center bg-white border border-gray-200 rounded-2xl px-5 h-14 shadow-sm focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50 transition-all">',
  '<div className="flex items-center bg-white border border-gray-200 rounded-2xl h-14 shadow-sm focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50 transition-all" style={{ padding: "0 20px" }}>'
);

code = code.replace(
  'className={"px-5 py-2.5 rounded-xl text-sm font-bold border transition-all whitespace-nowrap "+(active?\'bg-[#F97316] text-white border-[#F97316] shadow-sm\':\'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50\')}>',
  'className={"rounded-xl text-sm font-bold border transition-all whitespace-nowrap "+(active?\'bg-[#F97316] text-white border-[#F97316] shadow-sm\':\'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50\')} style={{ padding: "10px 20px" }}>'
);

code = code.replace(
  '{f} <span className={"ml-2 px-2 py-0.5 rounded-lg text-xs "+(active?\'bg-white/20\':\'bg-gray-100 text-gray-500\')}>{count}</span>',
  '{f} <span className={"rounded-lg text-xs "+(active?\'bg-white/20\':\'bg-gray-100 text-gray-500\')} style={{ padding: "2px 8px", marginLeft: "8px" }}>{count}</span>'
);

// 3. TABLE HEADER
code = code.replace(
  '<div className="hidden md:flex items-center px-6 lg:px-8 py-5 border-b border-gray-100 bg-[#F8FAFC]">',
  '<div className="hidden md:flex items-center border-b border-gray-100 bg-[#F8FAFC]" style={{ padding: "20px 32px" }}>'
);

// 4. TABLE ROWS
code = code.replace(
  '<div className="hidden md:flex items-center px-6 lg:px-8 py-5 hover:bg-[#F8FAFC]/50 transition-colors">',
  '<div className="hidden md:flex items-center hover:bg-[#F8FAFC]/50 transition-colors border-b border-gray-100 last:border-0" style={{ padding: "24px 32px" }}>'
);

// 5. STATUS COLUMN
const newStatusSelect = `function StatusSelect({ orderId, current, onChange }) {
  const cfg = STATUS_CONFIG[current] || STATUS_CONFIG.Accepted;
  return (
    <div className="relative inline-flex items-center">
      <span className={"absolute left-3 w-1.5 h-1.5 rounded-full pointer-events-none " + cfg.dot} />
      <select value={current} onChange={e=>onChange(orderId,e.target.value)}
        className={"appearance-none text-xs font-bold pl-7 pr-8 py-2 rounded-xl border cursor-pointer outline-none transition-all " + cfg.color}>
        <option value="Accepted">Accepted</option>
        <option value="Preparing">Preparing</option>
        <option value="Out for Delivery">Delivery</option>
        <option value="Delivered">Delivered</option>
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
    </div>
  );
}`;

code = code.replace(
  /function StatusSelect\(\{ orderId, current, onChange \}\) \{[\s\S]*?    <\/div>\s*  \);\s*\}/,
  newStatusSelect
);

// 6 & 7. WHOLE TABLE CONTAINER
code = code.replace(
  '<div className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] overflow-hidden">',
  '<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-4">'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Orders layout fixes applied.');
