// Run: node scratch/kpi_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// Find the KPI card and increase its internal padding significantly
code = code.replace(
  'className="bg-white rounded-2xl p-5 border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] hover:border-black/20 transition-all duration-200 cursor-pointer group flex flex-col justify-between"',
  'className="bg-white rounded-2xl p-8 border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] hover:border-black/20 transition-all duration-200 cursor-pointer group flex flex-col justify-between"'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Increased KPI card padding to p-8');
