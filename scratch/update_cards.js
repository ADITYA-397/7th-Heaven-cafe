// Run: node scratch/update_cards.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// The centered shadow class
const SHADOW = 'shadow-[0_0_20px_rgba(0,0,0,0.04)]';
const BORDER = 'border-black/10';

// Replace KpiCard
code = code.replace(
  'className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors',
  `className="bg-white rounded-2xl p-6 border ${BORDER} ${SHADOW} hover:border-black/20 transition-all`
);

// Replace standard padded cards (Area Chart, Traffic, Product Sales, New Menu)
code = code.replace(
  /className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100/g,
  `className="bg-white rounded-2xl p-6 lg:p-8 border ${BORDER} ${SHADOW}`
);

// Replace unpadded cards (Top Selling, Orders Tab)
// 1. Top Selling
code = code.replace(
  'className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col"',
  `className="bg-white rounded-2xl border ${BORDER} ${SHADOW} overflow-hidden flex flex-col"`
);
// 2. Orders Tab
code = code.replace(
  'className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"',
  `className="bg-white rounded-2xl border ${BORDER} ${SHADOW} overflow-hidden"`
);

// Replace New Menu Add form
code = code.replace(
  'className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm"',
  `className="bg-white rounded-2xl p-6 lg:p-8 border ${BORDER} ${SHADOW}"`
);

// Replace Menu Item cards
code = code.replace(
  /className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md/g,
  `className="bg-white rounded-2xl overflow-hidden border ${BORDER} ${SHADOW} hover:shadow-[0_0_25px_rgba(0,0,0,0.08)]`
);

fs.writeFileSync(file, code, 'utf8');
console.log('Updated cards in page.js');
