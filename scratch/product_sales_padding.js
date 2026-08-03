// Run: node scratch/product_sales_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Product Sales list container (space-y-10 -> flex col gap-10)
code = code.replace(
  'className="space-y-10 flex-1"',
  'className="flex flex-col gap-10 flex-1"'
);

// 2. Product Sales list item (space-y-3 -> flex col gap-3)
code = code.replace(
  /className="space-y-3"/g,
  'className="flex flex-col gap-3"'
);

// 3. System Status block padding (p-5 -> inline padding 20px)
code = code.replace(
  'className="bg-[#1E293B] rounded-2xl p-5 relative overflow-hidden shadow-lg"',
  'className="bg-[#1E293B] rounded-2xl relative overflow-hidden shadow-lg" style={{ padding: "20px" }}'
);

// 4. LIVE badge padding (px-2 py-1 -> inline padding 4px 8px)
code = code.replace(
  'className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg font-bold uppercase tracking-wider"',
  'className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold uppercase tracking-wider" style={{ padding: "4px 8px" }}'
);

// 5. Border top spacing for System Status
code = code.replace(
  'className="mt-8 pt-6 border-t border-gray-100"',
  'className="border-t border-gray-100" style={{ marginTop: "32px", paddingTop: "24px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Product Sales card padding updated');
