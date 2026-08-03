// Run: node scratch/menu_cards_fixes.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. REDUCE GAP BETWEEN CARDS
code = code.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">',
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">'
);

// 2. IMAGE AREA
code = code.replace(
  '<div className="h-40 bg-[#F8FAFC] relative overflow-hidden">',
  '<div className="h-32 bg-[#F8FAFC] relative overflow-hidden">'
);

// 3. CARD CONTENT SECTION & 5. CONSISTENCY
code = code.replace(
  '<div className="p-5 flex-1 flex flex-col gap-3">',
  '<div className="p-4 flex-1 flex flex-col gap-1.5">'
);

code = code.replace(
  '<div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">',
  '<div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Menu Editor cards layout fixes applied.');
