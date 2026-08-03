// Run: node scratch/kpi_padding_fix.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// Replace the KPI card container to have explicit inline padding and a darker border
code = code.replace(
  'className="bg-white rounded-2xl p-8 border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] hover:border-black/20 transition-all duration-200 cursor-pointer group flex flex-col justify-between"',
  'className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between" style={{ padding: "32px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Fixed KPI card padding and border');
