// Run: node scratch/resize_cards.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Increase space between cards
code = code.replace(/gap-6/g, 'gap-8');
code = code.replace(/space-y-8/g, 'space-y-10');
code = code.replace(/space-y-6/g, 'space-y-8');

// 2. Decrease card padding
code = code.replace(/p-6 lg:p-8/g, 'p-5 lg:p-6');
code = code.replace(/p-6/g, 'p-5');

// 3. Decrease KPI Card internal sizes
code = code.replace(/w-10 h-10/g, 'w-9 h-9');
code = code.replace(/text-3xl font-bold text-gray-900 tracking-tight leading-none/g, 'text-2xl font-bold text-gray-900 tracking-tight leading-none');
code = code.replace(/text-3xl font-bold text-gray-900/g, 'text-2xl font-bold text-gray-900'); // Welcome Back

// 4. Decrease Menu Card image
code = code.replace(/h-48/g, 'h-40');

fs.writeFileSync(file, code, 'utf8');
console.log('Updated card sizes and spacing in page.js');
