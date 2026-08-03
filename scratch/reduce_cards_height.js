// Run: node scratch/reduce_cards_height.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Reduce AreaChart height
code = code.replace(
  'const W=700, H=210, PL=50, PR=20, PT=40, PB=30;',
  'const W=700, H=150, PL=50, PR=20, PT=30, PB=25;'
);

// 2. Reduce VertBar max height
code = code.replace(
  'const MAX_H=100, h=maxPct>0?Math.round((pct/maxPct)*MAX_H):0;',
  'const MAX_H=60, h=maxPct>0?Math.round((pct/maxPct)*MAX_H):0;'
);

// 3. Reduce Traffic card internal margins
code = code.replace(
  'className="flex bg-[#F8FAFC] rounded-xl mb-8 border border-gray-100" style={{ padding: "4px" }}',
  'className="flex bg-[#F8FAFC] rounded-xl mb-4 border border-gray-100" style={{ padding: "4px" }}'
);
code = code.replace(
  'className="border-t border-gray-100 flex justify-center gap-8" style={{ paddingTop: "24px", marginTop: "24px" }}',
  'className="border-t border-gray-100 flex justify-center gap-8" style={{ paddingTop: "16px", marginTop: "16px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Cards height reduced');
