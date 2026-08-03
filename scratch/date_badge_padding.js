// Run: node scratch/date_badge_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm"',
  'className="flex items-center gap-2 bg-white border border-gray-200 rounded-full shadow-sm" style={{ padding: "8px 16px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Date badge padding updated');
