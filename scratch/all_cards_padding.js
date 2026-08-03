// Run: node scratch/all_cards_padding.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// The class string that is used on the larger dashboard cards
const targetClass = 'className="bg-white rounded-2xl p-6 lg:p-8 border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)]"';
const replacement = targetClass + ' style={{ padding: "18px" }}';

// For the Traffic card which also has flex
const targetClassFlex = 'className="bg-white rounded-2xl p-6 lg:p-8 border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] flex flex-col"';
const replacementFlex = targetClassFlex + ' style={{ padding: "18px" }}';

code = code.replace(new RegExp(targetClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
code = code.replace(new RegExp(targetClassFlex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementFlex);

fs.writeFileSync(file, code, 'utf8');
console.log('Added 18px inline padding to all main overview cards');
