// Run: node scratch/sidebar_resize.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// The sidebar currently uses w-[280px]. Let's reduce it to w-64 (256px)
code = code.replace(/w-\[280px\]/g, 'w-64');

fs.writeFileSync(file, code, 'utf8');
console.log('Decreased sidebar width');
