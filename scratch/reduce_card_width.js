// Run: node scratch/reduce_card_width.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// The card currently is:
// <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]" style={{ padding: "18px" }}>
// We'll change it to add max-width and center it or just limit its width.
code = code.replace(
  'className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]" style={{ padding: "18px" }}',
  'className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] max-w-4xl" style={{ padding: "18px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Reduced card width from both sides by adding max-w-4xl');
