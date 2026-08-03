// Run: node scratch/sidebar_resize2.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// The sidebar currently uses w-64 (256px). Let's reduce it further to w-56 (224px)
code = code.replace(/w-64/g, 'w-46');

fs.writeFileSync(file, code, 'utf8');
console.log('Decreased sidebar width further to w-46');
