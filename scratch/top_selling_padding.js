// Run: node scratch/top_selling_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<div className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">',
  '<div className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] flex flex-col" style={{ padding: "18px" }}>'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Top Selling card padding updated');
