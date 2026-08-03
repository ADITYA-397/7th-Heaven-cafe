// Run: node scratch/traffic_card_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. VertBar percentage pill padding
code = code.replace(
  '<span className="text-xs font-bold px-2 py-1 rounded-lg text-white shadow-sm" style={{background:color}}>{pct}%</span>',
  '<span className="text-xs font-bold rounded-lg text-white shadow-sm" style={{background:color, padding: "4px 8px"}}>{pct}%</span>'
);

// 2. Week/Month toggle container padding
code = code.replace(
  'className="flex bg-[#F8FAFC] p-1 rounded-xl mb-8 border border-gray-100"',
  'className="flex bg-[#F8FAFC] rounded-xl mb-8 border border-gray-100" style={{ padding: "4px" }}'
);

// 3. Week/Month toggle buttons padding
code = code.replace(
  'className="flex-1 text-sm font-bold py-2 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"',
  'className="flex-1 text-sm font-bold rounded-lg text-gray-500 hover:text-gray-900 transition-colors" style={{ padding: "8px 0" }}'
);
code = code.replace(
  'className="flex-1 text-sm font-bold py-2 rounded-lg bg-white text-[#F97316] shadow-sm"',
  'className="flex-1 text-sm font-bold rounded-lg bg-white text-[#F97316] shadow-sm" style={{ padding: "8px 0" }}'
);

// 4. Traffic card legend border spacing
code = code.replace(
  'className="pt-6 mt-6 border-t border-gray-100 flex justify-center gap-8"',
  'className="border-t border-gray-100 flex justify-center gap-8" style={{ paddingTop: "24px", marginTop: "24px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Traffic card padding updated');
