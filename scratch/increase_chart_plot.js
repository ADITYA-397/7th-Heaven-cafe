// Run: node scratch/increase_chart_plot.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Reduce internal paddings of the AreaChart (PT, PB, PL, PR)
code = code.replace(
  'const W=700, H=150, PL=50, PR=20, PT=30, PB=25;',
  'const W=700, H=150, PL=32, PR=10, PT=10, PB=16;'
);

// 2. Reduce gap between card header and chart
code = code.replace(
  '<div className="flex items-center justify-between mb-4">',
  '<div className="flex items-center justify-between mb-2">'
);

// 3. Move X-axis labels slightly down so they fit in the smaller PB
// They were at H-5. We can keep them at H-2 to make them sit very close to the bottom.
// Wait, the original code is:
// <text key={i} x={PL+(i/(labels.length-1))*cw} y={H-5}
code = code.replace(
  'y={H-5}',
  'y={H-2}'
);

// 4. Move Y-axis labels slightly closer to the grid lines so they don't clip on the left.
// They were at PL-15. Let's make them PL-10.
// Wait, original:
// <text x={PL-15} y={y+4} textAnchor="end" fontSize="12" fill="#94a3b8" fontFamily="system-ui" fontWeight="500">
code = code.replace(
  'x={PL-15}',
  'x={PL-8}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Chart plot area increased');
