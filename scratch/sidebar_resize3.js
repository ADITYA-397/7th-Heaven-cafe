// Run: node scratch/sidebar_resize3.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// The sidebar currently uses w-56. Let's reduce it to w-48 (192px) which is a standard compact Tailwind size.
code = code.replace(/w-56/g, 'w-48');

fs.writeFileSync(file, code, 'utf8');
console.log('Decreased sidebar width further to w-48');
