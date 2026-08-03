// Run: node scratch/increase_checkout_sizing.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'components', 'CartDrawer.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Scroll container spacing
// Current: <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-10 space-y-5 font-sans">
const scrollRegex = /<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-10 space-y-5 font-sans">/;
code = code.replace(scrollRegex, `<div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-12 space-y-6 font-sans">`);

// 2. Increase padding in cards from p-5 sm:p-6 to p-6 sm:p-8 if they want it bigger
// Card 1
code = code.replace(
  /<div className="bg-white rounded-\[1\.5rem\] p-5 sm:p-6 shadow-sm border border-gray-100">/g,
  `<div className="bg-white rounded-[1.5rem] p-6 sm:p-7 shadow-sm border border-gray-100">`
);

// 3. Delivery option rows (change p-4 to p-5, improve flex layout)
code = code.replace(
  /className={`p-4 rounded-\[1\.25rem\] border-2 flex justify-between items-center cursor-pointer transition-colors \${deliveryOption === 'Express' \? 'border-\[#2d9585\] bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}`}/,
  `className={\`p-5 rounded-[1.25rem] border-2 flex items-center gap-4 cursor-pointer transition-colors \${deliveryOption === 'Express' ? 'border-[#2d9585] bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}\`}`
);
code = code.replace(
  /className={`p-4 rounded-\[1\.25rem\] border-2 flex justify-between items-center cursor-pointer transition-colors \${deliveryOption === 'Standard' \? 'border-\[#2d9585\] bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}`}/,
  `className={\`p-5 rounded-[1.25rem] border-2 flex items-center gap-4 cursor-pointer transition-colors \${deliveryOption === 'Standard' ? 'border-[#2d9585] bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}\`}`
);
code = code.replace(
  /className={`p-4 rounded-\[1\.25rem\] border-2 flex justify-between items-center cursor-pointer transition-colors \${deliveryOption === 'Economical' \? 'border-\[#2d9585\] bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}`}/,
  `className={\`p-5 rounded-[1.25rem] border-2 flex items-center gap-4 cursor-pointer transition-colors \${deliveryOption === 'Economical' ? 'border-[#2d9585] bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}\`}`
);

// Fix flex layout inside delivery rows so icon, text, and price are spaced well
// Express row
const expressTarget = /<div className="flex items-center gap-4">\s*<div className={`w-6 h-6 flex items-center justify-center \${deliveryOption === 'Express' \? 'text-\[#2d9585\]' : 'text-gray-400'}`}>\s*<Zap size={22} fill={deliveryOption === 'Express' \? "currentColor" : "none"} strokeWidth={deliveryOption === 'Express' \? 0 : 2} \/>\s*<\/div>\s*<div>\s*<div className="flex items-center gap-2 mb-1">\s*<h4 className="font-bold text-gray-900 m-0 text-\[15px\]">Express<\/h4>\s*<span className="bg-\[#2d9585\] text-white text-\[10px\] font-bold px-2 py-0\.5 rounded-full tracking-wide">Faster<\/span>\s*<\/div>\s*<p className="text-gray-500 text-\[12px\] m-0">Estimation 15-20 min<\/p>\s*<\/div>\s*<\/div>\s*<span className="font-bold text-\[15px\] text-gray-900">\$1\.99<\/span>/;
const expressReplacement = `<div className={\`w-8 h-8 flex shrink-0 items-center justify-center \${deliveryOption === 'Express' ? 'text-[#2d9585]' : 'text-gray-400'}\`}>
                           <Zap size={24} fill={deliveryOption === 'Express' ? "currentColor" : "none"} strokeWidth={deliveryOption === 'Express' ? 0 : 2} />
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 m-0 text-[16px]">Express</h4>
                              <span className="bg-[#2d9585] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">Faster</span>
                           </div>
                           <p className="text-gray-500 text-[13px] m-0">Estimation 15-20 min</p>
                        </div>
                        <span className="font-bold text-[16px] text-gray-900 shrink-0">$1.99</span>`;
code = code.replace(expressTarget, expressReplacement);

// Standard row
const standardTarget = /<div className="flex items-center gap-4">\s*<div className={`w-6 h-6 flex items-center justify-center \${deliveryOption === 'Standard' \? 'text-\[#2d9585\]' : 'text-gray-400'}`}>\s*<Archive size={20} strokeWidth={2\.5} \/>\s*<\/div>\s*<div>\s*<h4 className="font-bold text-gray-900 m-0 text-\[15px\] mb-1">Standard<\/h4>\s*<p className="text-gray-500 text-\[12px\] m-0">Estimation 30-40 min<\/p>\s*<\/div>\s*<\/div>/;
const standardReplacement = `<div className={\`w-8 h-8 flex shrink-0 items-center justify-center \${deliveryOption === 'Standard' ? 'text-[#2d9585]' : 'text-gray-400'}\`}>
                           <Archive size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-gray-900 m-0 text-[16px] mb-1">Standard</h4>
                           <p className="text-gray-500 text-[13px] m-0">Estimation 30-40 min</p>
                        </div>`;
code = code.replace(standardTarget, standardReplacement);

// Economical row
const economicalTarget = /<div className="flex items-center gap-4">\s*<div className={`w-6 h-6 flex items-center justify-center \${deliveryOption === 'Economical' \? 'text-\[#2d9585\]' : 'text-gray-400'}`}>\s*<Archive size={20} strokeWidth={2\.5} \/>\s*<\/div>\s*<div>\s*<h4 className="font-bold text-gray-900 m-0 text-\[15px\] mb-1">Ecomical<\/h4>\s*<p className="text-gray-500 text-\[12px\] m-0">Estimation 50-60 min<\/p>\s*<\/div>\s*<\/div>/;
const economicalReplacement = `<div className={\`w-8 h-8 flex shrink-0 items-center justify-center \${deliveryOption === 'Economical' ? 'text-[#2d9585]' : 'text-gray-400'}\`}>
                           <Archive size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-gray-900 m-0 text-[16px] mb-1">Ecomical</h4>
                           <p className="text-gray-500 text-[13px] m-0">Estimation 50-60 min</p>
                        </div>`;
code = code.replace(economicalTarget, economicalReplacement);


// 4. Fix Payment Row Button Clipping and padding
const paymentRowRegex = /<div className="flex items-center justify-between">\s*<div className="flex items-center gap-4">\s*<div className="w-12 h-10 rounded-xl bg-orange-50 border border-orange-100 text-\[#ff6036\] flex items-center justify-center shrink-0">\s*<CreditCard size={20} strokeWidth={2\.5} \/>\s*<\/div>\s*<div>[\s\S]*?<\/div>\s*<\/div>\s*<button[\s\S]*?<\/button>\s*<\/div>/;
const paymentRowFix = `<div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                           <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-[#ff6036] flex items-center justify-center shrink-0">
                              <CreditCard size={24} strokeWidth={2.5} />
                           </div>
                           <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 m-0 text-[15px] mb-1 truncate">
                                 {paymentMethod === 'Card' ? 'Add your debit card' : paymentMethod === 'UPI' ? 'Pay with UPI' : paymentMethod === 'Net Banking' ? 'Net Banking' : 'Cash on Delivery'}
                              </h4>
                              <p className="text-gray-500 text-[12px] m-0 pr-2 truncate">
                                 {paymentMethod === 'Card' ? 'You can use debit card for continue your payment.' : 'Proceed via Razorpay securely.'}
                              </p>
                           </div>
                        </div>
                        <button 
                           onClick={() => setShowPaymentOptions(true)}
                           className="px-5 py-2.5 border-2 border-[#ff6036] text-[#ff6036] rounded-full text-[13px] font-bold bg-transparent cursor-pointer hover:bg-orange-50 shrink-0 transition-colors whitespace-nowrap"
                        >
                           {paymentMethod === 'Card' ? '+ Add Card' : 'Change'}
                        </button>
                     </div>`;
code = code.replace(paymentRowRegex, paymentRowFix);

// 5. Bottom Button padding and spacing
const buttonContainerRegex = /<div className="p-4 sm:p-6 bg-white\/90 backdrop-blur-md border-t border-gray-100 z-10 mt-auto shrink-0 rounded-b-\[2rem\]">/;
const buttonContainerFix = `<div className="p-6 sm:p-8 bg-white/90 backdrop-blur-md border-t border-gray-100 z-10 mt-6 shrink-0 rounded-b-[2rem]">`;
code = code.replace(buttonContainerRegex, buttonContainerFix);

fs.writeFileSync(file, code, 'utf8');
console.log('Checkout sizing fixes applied.');
