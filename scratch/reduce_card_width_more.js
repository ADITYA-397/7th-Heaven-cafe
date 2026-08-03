// Run: node scratch/reduce_card_width_more.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'max-w-4xl',
  'max-w-3xl mx-auto'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Reduced card width further to max-w-3xl');
