// Run: node scratch/top_selling_buttons_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'className="flex items-center gap-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-all"',
  'className="flex items-center gap-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all" style={{ padding: "8px 16px" }}'
);

code = code.replace(
  'className="flex items-center gap-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-all"',
  'className="flex items-center gap-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all" style={{ padding: "8px 16px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Top Selling card buttons padding updated');
