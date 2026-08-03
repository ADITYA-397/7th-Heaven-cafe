// Run: node scratch/overview_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. KpiCard padding
// In the KpiCard function:
const kpiStart = code.indexOf('function KpiCard({');
const kpiEnd = code.indexOf('}', kpiStart + 100) + 1;
if (kpiStart !== -1) {
  let kpiCode = code.substring(kpiStart, kpiEnd);
  kpiCode = kpiCode.replace('p-5', 'p-6');
  code = code.substring(0, kpiStart) + kpiCode + code.substring(kpiEnd);
}

// 2. Overview content cards (Chart, Traffic, Menu Sales, etc.)
// We previously changed them to p-5 lg:p-5, let's bump to p-6 lg:p-8 or p-8
code = code.replace(/p-5 lg:p-5/g, 'p-6 lg:p-8');

// The main container also has p-5 lg:p-5 now (from a previous global replace of p-6)
// Let's restore the main container padding to p-6 lg:p-8
code = code.replace(/main className="flex-1 overflow-y-auto p-5 lg:p-5"/g, 'main className="flex-1 overflow-y-auto p-6 lg:p-8"');

fs.writeFileSync(file, code, 'utf8');
console.log('Added internal padding back to cards');
