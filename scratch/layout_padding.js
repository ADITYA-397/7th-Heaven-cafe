// Run: node scratch/layout_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Wrap the entire right side in a padded container
code = code.replace(
  '<div className="flex-1 flex flex-col min-w-0">',
  '<div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]" style={{ padding: "32px", gap: "24px" }}>'
);

// 2. Make the header floating (since it's inside the padded container now)
code = code.replace(
  'className="bg-white border-b border-gray-100 px-6 lg:px-8 py-5 flex items-center justify-between sticky top-0 z-30 gap-x-8 gap-y-12"',
  'className="bg-white border border-gray-100 rounded-2xl flex items-center justify-between sticky top-0 z-30 gap-x-8 gap-y-12 shadow-sm" style={{ padding: "16px 24px" }}'
);

// 3. Remove padding from the inner main content since it's on the wrapper now
code = code.replace(
  '<main className="flex-1 overflow-y-auto p-6 lg:p-8">',
  '<main className="flex-1 overflow-y-auto">'
);

// 4. Ensure sidebar logo area has 20px padding (user requested 16-20px)
// It originally had px-6 (24px) but we'll use inline style to guarantee it beats the CSS reset.
code = code.replace(
  'className={"flex items-center gap-3 px-6 py-5 border-b border-gray-100 relative "+(!sidebarOpen?\'justify-center px-0\':\'\')}',
  'className={"flex items-center gap-3 py-5 border-b border-gray-100 relative "+(!sidebarOpen?\'justify-center px-0\':\'\')} style={{ paddingLeft: sidebarOpen?"20px":0, paddingRight: sidebarOpen?"20px":0 }}'
);

// 5. Sidebar nav wrapper padding
code = code.replace(
  'className={"flex-1 py-4 "+(mini?\'px-3\':\'px-4\')}',
  'className={"flex-1 py-4"} style={{ paddingLeft: mini?"12px":"20px", paddingRight: mini?"12px":"20px" }}'
);
code = code.replace(
  'className={"border-t border-gray-100 pt-4 pb-6 "+(mini?\'px-3\':\'px-4\')}',
  'className={"border-t border-gray-100 pt-4 pb-6"} style={{ paddingLeft: mini?"12px":"20px", paddingRight: mini?"12px":"20px" }}'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Layout padding structure updated');
