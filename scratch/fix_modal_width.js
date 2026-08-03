const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'components', 'CartDrawer.js');
let code = fs.readFileSync(file, 'utf8');

// The issue is that Tailwind's JIT compiler often fails to pick up arbitrary dynamic values like `max-w-[650px]` 
// when files are modified by external scripts while the dev server is running, causing the class to be ignored 
// and falling back to a constrained or incorrect default width.
// Furthermore, the user explicitly asked for 480-560px.
// We will replace the arbitrary Tailwind class with an explicit inline style to guarantee it is applied.

const target = /className="bg-\[#f8f9fb\] w-full max-w-\[650px\] h-full sm:h-auto sm:max-h-\[90vh\] rounded-\[2rem\] shadow-2xl flex flex-col relative font-sans text-gray-800"/;
const replacement = `className="bg-[#f8f9fb] h-full sm:h-auto sm:max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col relative font-sans text-gray-800" style={{ width: '100%', maxWidth: '560px' }}`;

if (code.match(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed checkout modal width using inline styles.');
} else {
  console.log('Target string not found. Checkout modal might already be updated.');
}
