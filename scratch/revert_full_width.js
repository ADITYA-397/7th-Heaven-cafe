// Run: node scratch/revert_full_width.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Remove ResponsiveAreaChart and restore AreaChart signature
const regex = /function ResponsiveAreaChart.*?\n}\n\nfunction AreaChart\({ data, labels, W=700 }\) \{/s;
code = code.replace(regex, 'function AreaChart({ data, labels }) {');

// 2. Restore W=700 and PR=10 in AreaChart constants
code = code.replace(
  'const H=150, PL=32, PR=20, PT=10, PB=16;',
  'const W=700, H=150, PL=32, PR=10, PT=10, PB=16;'
);

// 3. Restore JSX component call
code = code.replace(
  '<ResponsiveAreaChart data={monthlyRevenue} labels={chartLabels}/>',
  '<AreaChart data={monthlyRevenue} labels={chartLabels}/>'
);

// 4. Restore grid container
code = code.replace(
  '<div className="grid grid-cols-1 gap-8">',
  '<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">'
);

// 5. Restore max-w-3xl mx-auto on Sales Analytics card
code = code.replace(
  'className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] w-full flex flex-col h-full"',
  'className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] max-w-3xl mx-auto w-full flex flex-col h-full"'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Reverted Sales Analytics to original width');
