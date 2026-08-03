// Run: node scratch/sales_card_border.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] max-w-3xl mx-auto"',
  'className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] max-w-3xl mx-auto w-full"'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Sales Analytics card border updated to match other cards');
