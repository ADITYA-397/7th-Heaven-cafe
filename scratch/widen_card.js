// Run: node scratch/widen_card.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// Remove max-w-3xl mx-auto from Sales Analytics card
code = code.replace(
  'className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] max-w-3xl mx-auto w-full flex flex-col h-full"',
  'className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] w-full flex flex-col h-full"'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Sales Analytics card widened');
