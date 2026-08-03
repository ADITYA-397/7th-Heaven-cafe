// Run: node scratch/vertical_spacing.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// Replace gap-8 with gap-x-8 gap-y-12 in grid layouts
code = code.replace(/gap-8/g, 'gap-x-8 gap-y-12');

// Replace space-y-10 with space-y-14 for even more vertical separation
code = code.replace(/space-y-10/g, 'space-y-14');

// Just in case, orders and menu tab wrappers had space-y-8 or space-y-6 initially
// They were bumped to space-y-10 and space-y-8 in the previous step.
code = code.replace(/space-y-8/g, 'space-y-12');

fs.writeFileSync(file, code, 'utf8');
console.log('Added more vertical space between cards');
