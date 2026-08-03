// Run: node scratch/overview_spacing.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// The Overview section starts at {activeTab==='dashboard'&&(
const overviewStart = code.indexOf("{activeTab==='dashboard'&&(");
const overviewEnd = code.indexOf("{/* ═════ ORDERS TAB ═════ */}");

if (overviewStart !== -1 && overviewEnd !== -1) {
  let overviewCode = code.substring(overviewStart, overviewEnd);
  
  // Replace the huge gaps with smaller gaps in the Overview section
  overviewCode = overviewCode.replace(/gap-x-8 gap-y-12/g, 'gap-5');
  overviewCode = overviewCode.replace(/space-y-14/g, 'space-y-6');
  
  code = code.substring(0, overviewStart) + overviewCode + code.substring(overviewEnd);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Reduced spacing on the overview page to a small amount');
} else {
  console.error('Could not find overview section');
}
