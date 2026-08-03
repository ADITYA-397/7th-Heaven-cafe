// Run: node scratch/row_spacing.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// Replace Overview container
code = code.replace(
  'className="space-y-10 max-w-[1600px] mx-auto"',
  'className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto"'
);

// Replace Orders and Menu containers (both use space-y-12)
code = code.replace(
  /className="space-y-12 max-w-\[1600px\] mx-auto pb-20"/g,
  'className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-20"'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Row spacing updated globally');
