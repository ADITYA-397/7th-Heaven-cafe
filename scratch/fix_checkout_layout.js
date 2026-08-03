// Run: node scratch/fix_checkout_layout.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'components', 'CartDrawer.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Fix toggle
const toggleRegex = /<div className="flex bg-gray-100 rounded-full p-1">[\s\S]*?<\/div>/;
const toggleFix = `<div className="flex bg-gray-100 rounded-full p-1 gap-1">
                        <button className="px-4 py-1.5 bg-white shadow-sm rounded-full text-xs font-bold border-none cursor-pointer text-gray-900 whitespace-nowrap">Delivery</button>
                        <button className="px-4 py-1.5 text-gray-500 rounded-full text-xs font-bold border-none cursor-pointer bg-transparent whitespace-nowrap">Pickup</button>
                     </div>`;
code = code.replace(toggleRegex, toggleFix);

// 2. Fix instruction wrapping
const instructionRegex = /<button className="text-gray-500 text-\[12px\] mt-1\.5 mb-0 underline bg-transparent border-none cursor-pointer p-0 text-left hover:text-gray-700">\s*Add instruction for courier\s*<\/button>/;
const instructionFix = `<button className="text-gray-500 text-[12px] mt-1.5 mb-0 underline bg-transparent border-none cursor-pointer p-0 text-left hover:text-gray-700 whitespace-nowrap overflow-visible">
                             Add instruction for courier
                           </button>`;
code = code.replace(instructionRegex, instructionFix);

// 3. Fix Bottom Button overlapping and layout
// Current modal starts like: <div className="bg-[#f8f9fb] w-full max-w-[650px] h-full sm:h-auto sm:max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col relative font-sans text-gray-800">
// Current scroll container: <div className="flex-1 overflow-y-auto px-6 py-2 pb-32 space-y-4 font-sans">
// Current button container: <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-md border-t border-gray-100 z-10 rounded-b-[2rem]">
const scrollContainerRegex = /<div className="flex-1 overflow-y-auto px-6 py-2 pb-32 space-y-4 font-sans">/;
const scrollContainerFix = `<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-10 space-y-5 font-sans">`;
code = code.replace(scrollContainerRegex, scrollContainerFix);

const buttonContainerRegex = /<div className="absolute bottom-0 left-0 right-0 p-5 bg-white\/90 backdrop-blur-md border-t border-gray-100 z-10 rounded-b-\[2rem\]">/;
// We will change it from absolute to a sticky footer or standard block at the bottom of the flex column
const buttonContainerFix = `<div className="p-4 sm:p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 z-10 mt-auto shrink-0 rounded-b-[2rem]">`;
code = code.replace(buttonContainerRegex, buttonContainerFix);

// 4. Increase general padding in cards
// Card 1
code = code.replace(
  /<div className="bg-white rounded-\[1\.5rem\] p-5 shadow-sm border border-gray-100">/,
  `<div className="bg-white rounded-[1.5rem] p-5 sm:p-6 shadow-sm border border-gray-100">`
);
// Card 3
code = code.replace(
  /<div className="bg-white rounded-\[1\.5rem\] p-5 shadow-sm border border-gray-100 mt-6">/,
  `<div className="bg-white rounded-[1.5rem] p-5 sm:p-6 shadow-sm border border-gray-100">`
);

fs.writeFileSync(file, code, 'utf8');
console.log('Checkout layout fixes applied.');
