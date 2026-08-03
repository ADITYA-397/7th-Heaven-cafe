// Run: node scratch/sidebar_fixes.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Widen the sidebar from w-48 to w-64
code = code.replace(
  'w-48\':\'w-[88px]\'',
  'w-64\':\'w-[88px]\''
);
code = code.replace(
  'z-[101] w-48 bg-white',
  'z-[101] w-64 bg-white'
);

// 2. Fix header padding, vertical alignment, and right arrow
code = code.replace(
  '<div className={"flex items-center gap-3 py-5 border-b border-gray-100 relative "+(!sidebarOpen?\'justify-center px-0\':\'\')} style={{ paddingLeft: sidebarOpen?"20px":0, paddingRight: sidebarOpen?"20px":0 }}>',
  '<div className={"flex items-center gap-3 border-b border-gray-100 relative "+(!sidebarOpen?\'justify-center px-0\':\'\')} style={{ padding: sidebarOpen?"24px 20px":"24px 0" }}>'
);

code = code.replace(
  '<div className="min-w-0 flex-1"><p className="font-bold text-gray-900 text-base">7th Heaven</p><p className="text-xs text-gray-500 font-medium mt-0.5">Cafe Admin</p></div>',
  '<div className="min-w-0 flex-1 flex flex-col justify-center"><p className="font-bold text-gray-900 text-lg leading-none mb-1">7th Heaven</p><p className="text-xs text-gray-500 font-medium">Cafe Admin</p></div>'
);

code = code.replace(
  '<button onClick={()=>setSidebarOpen(false)} className="text-gray-400 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-50 shrink-0 transition-colors"><ChevronLeft size={18}/></button>',
  '<button onClick={()=>setSidebarOpen(false)} className="text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-50 shrink-0 transition-colors flex items-center justify-center" style={{ padding: "8px" }}><ChevronLeft size={18}/></button>'
);

code = code.replace(
  'className="absolute -right-3.5 top-5 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-[#F97316] shadow-md z-10 transition-colors"',
  'className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-[#F97316] shadow-md z-10 transition-colors"'
);


// 3. Fix Nav items padding
code = code.replace(
  '<nav className={"flex-1 py-4"} style={{ paddingLeft: mini?"12px":"20px", paddingRight: mini?"12px":"20px" }}>',
  '<nav className={"flex-1"} style={{ padding: mini?"24px 12px":"24px 16px" }}>'
);
code = code.replace(
  'className={"w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all mb-1.5 relative group "+(active?\'bg-[#FFF4EC] text-[#F97316]\':\'text-gray-500 hover:bg-gray-50 hover:text-gray-900\')+(mini?\' justify-center\':\'\')}>',
  'className={"w-full flex items-center gap-4 rounded-2xl text-sm font-semibold transition-all mb-2 relative group "+(active?\'bg-[#FFF4EC] text-[#F97316]\':\'text-gray-500 hover:bg-gray-50 hover:text-gray-900\')+(mini?\' justify-center\':\'\')} style={{ padding: "12px 16px" }}>'
);

// Add a filler widget to fix excessive empty space
code = code.replace(
  '</nav>',
  `</nav>
      {!mini && (
        <div className="mx-4 mb-6 mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200" style={{ padding: "20px" }}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-50 rounded-full -mr-12 -mt-12"></div>
          <p className="text-xs font-bold text-gray-800 mb-1">Cafe OS Pro</p>
          <p className="text-[11px] font-medium text-gray-500 mb-3 leading-relaxed">Upgrade to unlock multi-store management.</p>
          <button className="text-[11px] font-bold text-white bg-gray-900 rounded-lg w-full hover:bg-gray-800 transition-colors" style={{ padding: "8px 0" }}>Upgrade Now</button>
        </div>
      )}`
);

// 4. Bottom Account Section and Settings
code = code.replace(
  '<div className={"border-t border-gray-100 pt-4 pb-6"} style={{ paddingLeft: mini?"12px":"20px", paddingRight: mini?"12px":"20px" }}>',
  '<div className={"border-t border-gray-100"} style={{ padding: mini?"24px 12px":"24px 16px" }}>'
);

code = code.replace(
  'className={"w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all mb-1 "+(mini?\'justify-center\':\'\')}>',
  'className={"w-full flex items-center gap-4 rounded-2xl text-sm text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all mb-1 "+(mini?\'justify-center\':\'\')} style={{ padding: "10px 16px" }}>'
);

code = code.replace(
  '<div className={"flex items-center gap-4 px-4 py-3 mt-2 "+(mini?\'justify-center\':\'\')}>',
  '<div className={"flex items-center gap-4 mt-6 pt-6 border-t border-gray-100 "+(mini?\'justify-center\':\'\')} style={{ padding: "0 16px" }}>'
);

code = code.replace(
  '<button onClick={handleLogout} className="text-gray-300 hover:text-red-500 p-2 transition-colors rounded-xl hover:bg-red-50"><LogOut size={18}/></button>',
  '<button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 flex items-center justify-center shrink-0" style={{ padding: "8px" }}><LogOut size={18}/></button>'
);

fs.writeFileSync(file, code, 'utf8');
console.log('Sidebar fixes applied.');
