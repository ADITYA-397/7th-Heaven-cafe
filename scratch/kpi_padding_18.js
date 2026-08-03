// Run: node scratch/kpi_padding_18.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// Reduce the inline padding from 24px to 18px
code = code.replace(
  'style={{ padding: "24px" }}',
  'style={{ padding: "18px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Reduced KPI card padding to 18px');
