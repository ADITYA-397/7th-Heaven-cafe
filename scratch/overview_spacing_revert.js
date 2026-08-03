// Run: node scratch/overview_spacing_revert.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

const overviewStart = code.indexOf("{activeTab==='dashboard'&&(");
const overviewEnd = code.indexOf("{/* ═════ ORDERS TAB ═════ */}");

if (overviewStart !== -1 && overviewEnd !== -1) {
  let overviewCode = code.substring(overviewStart, overviewEnd);
  
  // They don't want it tight. Let's use a comfortable gap-8 (32px)
  overviewCode = overviewCode.replace(/gap-5/g, 'gap-8');
  // And space-y-10 (40px) for the main section stacked elements
  overviewCode = overviewCode.replace(/space-y-6/g, 'space-y-10');
  
  code = code.substring(0, overviewStart) + overviewCode + code.substring(overviewEnd);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Restored comfortable spacing on overview page');
} else {
  console.error('Could not find overview section');
}
