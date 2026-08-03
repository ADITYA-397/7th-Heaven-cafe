// Run: node scratch/reduce_chart_size.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// Reduce the height of the AreaChart from 260 to 200
code = code.replace(
  'const W=700, H=260, PL=50, PR=20, PT=40, PB=30;',
  'const W=700, H=210, PL=50, PR=20, PT=40, PB=30;'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Reduced height of Sales Analytics chart');
