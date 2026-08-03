// Run: node scratch/center_chart_vertically.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Make Sales Analytics card a flex column
code = code.replace(
  'className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] max-w-3xl mx-auto w-full"',
  'className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] max-w-3xl mx-auto w-full flex flex-col h-full"'
);

// 2. Remove bottom margin from the header to let the chart container handle spacing
code = code.replace(
  '<div className="flex items-center justify-between mb-2">',
  '<div className="flex items-center justify-between">'
);

// 3. Wrap AreaChart in a flex container that vertically centers it with margins
code = code.replace(
  '<AreaChart data={monthlyRevenue} labels={chartLabels}/>',
  '<div className="flex-1 flex flex-col justify-center w-full mt-6 mb-2"><AreaChart data={monthlyRevenue} labels={chartLabels}/></div>'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Chart shifted down and vertically centered');
