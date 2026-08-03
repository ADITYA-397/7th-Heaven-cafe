// Run: node scratch/button_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-500 shadow-sm"',
  'className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-500 shadow-sm" style={{ padding: "12px 16px" }}'
);

code = code.replace(
  'className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm shadow-orange-200/50 active:scale-95"',
  'className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl text-sm font-bold transition-all shadow-sm shadow-orange-200/50 active:scale-95" style={{ padding: "12px 24px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Button padding updated');
