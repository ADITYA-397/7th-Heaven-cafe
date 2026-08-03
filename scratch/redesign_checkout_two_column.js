// Run: node scratch/redesign_checkout_two_column.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'components', 'CartDrawer.js');
let code = fs.readFileSync(file, 'utf8');

// Replace the entire modal block
const regex = /\{\/\*\s*Checkout Payment Flow Modal\s*\*\/\}\s*\{showPayment\s*&&\s*\(\s*<div\s*className="fixed\s*inset-0[\s\S]*?<\/div>\s*\)\}/;

const newPaymentModal = `{/* Checkout Payment Flow Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white w-full max-w-5xl rounded-[1rem] shadow-2xl overflow-hidden relative font-sans text-[#1a2b4b] flex flex-col lg:flex-row h-full max-h-[90vh]">
            
            {/* Left Column - Payment Method */}
            <div className="flex-1 p-6 sm:p-10 lg:pr-12 border-b lg:border-b-0 lg:border-r border-gray-100 overflow-y-auto">
               <h2 className="text-2xl font-bold mb-8 tracking-tight">Payment Method</h2>
               
               <div className="flex flex-col sm:flex-row gap-8">
                  {/* Vertical Tabs */}
                  <div className="w-full sm:w-1/4 space-y-4">
                     <button onClick={() => setPaymentMethod('Card')} className={\`w-full text-left flex items-center gap-2 font-semibold bg-transparent border-none cursor-pointer \${paymentMethod === 'Card' || paymentMethod === 'Google Pay' || paymentMethod === 'PhonePe' ? 'text-[#1a2b4b]' : 'text-gray-400 hover:text-gray-600'}\`}>
                        <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${paymentMethod === 'Card' || paymentMethod === 'Google Pay' || paymentMethod === 'PhonePe' ? 'bg-[#3ba8ff]' : 'bg-transparent'}\`}></div>
                        Credit Card
                     </button>
                     <button onClick={() => setPaymentMethod('Paypal')} className={\`w-full text-left flex items-center gap-2 font-semibold bg-transparent border-none cursor-pointer \${paymentMethod === 'Paypal' ? 'text-[#1a2b4b]' : 'text-gray-400 hover:text-gray-600'}\`}>
                        <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${paymentMethod === 'Paypal' ? 'bg-[#3ba8ff]' : 'bg-transparent'}\`}></div>
                        Paypal
                     </button>
                     <button onClick={() => setPaymentMethod('Other')} className={\`w-full text-left flex items-center gap-2 font-semibold bg-transparent border-none cursor-pointer \${paymentMethod === 'Other' || paymentMethod === 'Cash' ? 'text-[#1a2b4b]' : 'text-gray-400 hover:text-gray-600'}\`}>
                        <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${paymentMethod === 'Other' || paymentMethod === 'Cash' ? 'bg-[#3ba8ff]' : 'bg-transparent'}\`}></div>
                        Other
                     </button>
                  </div>

                  {/* Form Area */}
                  <div className="flex-1">
                     {paymentMethod !== 'Paypal' && paymentMethod !== 'Other' ? (
                       <>
                         <div className="flex items-center gap-3 mb-8">
                            <div className="w-14 h-9 rounded bg-white border border-[#3ba8ff] flex items-center justify-center shadow-sm relative shrink-0">
                               <div className="w-3.5 h-3.5 rounded-full bg-[#eb001b] absolute left-[12px] opacity-90 z-10"></div>
                               <div className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] absolute right-[12px] opacity-90"></div>
                               <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#3ba8ff] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                            </div>
                            <div className="w-14 h-9 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0">
                               <span className="text-[#1a1f71] font-bold text-xs italic tracking-tighter">VISA</span>
                            </div>
                            <div className="w-14 h-9 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                               <div className="w-full h-full bg-[#3ba8ff]/10 flex items-center justify-center"><span className="font-bold text-[10px] text-[#3ba8ff]">AMEX</span></div>
                            </div>
                         </div>
                         
                         <div className="space-y-5">
                            <div>
                               <label className="block text-gray-500 text-sm mb-2">Credit Card</label>
                               <div className="relative">
                                 <input type="text" placeholder="5412 1235 4512 2353" className="w-full p-4 bg-[#f8fafc] rounded-lg outline-none font-medium border border-transparent focus:border-[#3ba8ff] focus:bg-white transition-colors" />
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 flex pointer-events-none">
                                   <div className="w-3 h-3 rounded-full bg-[#eb001b] opacity-90 z-10 -mr-1"></div>
                                   <div className="w-3 h-3 rounded-full bg-[#f79e1b] opacity-90"></div>
                                 </div>
                               </div>
                            </div>
                            
                            <div>
                               <label className="block text-gray-500 text-sm mb-2">Name</label>
                               <input type="text" placeholder="James Murphy" className="w-full p-4 bg-[#f8fafc] rounded-lg outline-none font-medium border border-transparent focus:border-[#3ba8ff] focus:bg-white transition-colors" />
                            </div>

                            <div className="flex gap-4">
                               <div className="flex-1">
                                  <label className="block text-gray-500 text-sm mb-2">Expiration Date</label>
                                  <input type="text" placeholder="12/2021" className="w-full p-4 bg-[#f8fafc] rounded-lg outline-none font-medium border border-transparent focus:border-[#3ba8ff] focus:bg-white transition-colors" />
                               </div>
                               <div className="flex-1">
                                  <label className="block text-gray-500 text-sm mb-2">CVV</label>
                                  <div className="relative">
                                    <input type="text" placeholder="543" className="w-full p-4 bg-[#f8fafc] rounded-lg outline-none font-medium border border-transparent focus:border-[#3ba8ff] focus:bg-white transition-colors" />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3ba8ff]">
                                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </div>
                                  </div>
                               </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                               <div className="w-4 h-4 rounded-full bg-[#3ba8ff] text-white flex items-center justify-center font-bold font-serif text-[10px] shrink-0">i</div>
                               <span>Credit card payments may take up 24h to be processed</span>
                               <div className="w-3 h-3 rounded-full border border-gray-300 text-gray-300 flex items-center justify-center font-bold text-[8px] ml-1 shrink-0">?</div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                               <div className="flex justify-between items-center mb-2">
                                  <span className="font-bold text-[#1a2b4b]">Enable auto renew</span>
                                  <div className="w-8 h-4 rounded-full bg-[#dbeafe] relative cursor-pointer">
                                    <div className="w-4 h-4 rounded-full bg-[#3ba8ff] absolute right-0 shadow-sm"></div>
                                  </div>
                               </div>
                               <p className="text-xs text-gray-400 leading-relaxed max-w-[90%]">
                                 This option if checked, will renew your productive subsition, if the curren plan expires.
                               </p>
                            </div>
                            
                            <div className="pt-4 flex items-start gap-3 cursor-pointer">
                               <div className="w-4 h-4 rounded bg-[#3ba8ff] flex items-center justify-center mt-0.5 text-white shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                               </div>
                               <span className="text-sm font-bold text-gray-700">Save my payment details for future purchases</span>
                            </div>
                         </div>
                       </>
                     ) : (
                       <div className="h-full min-h-[300px] flex items-center justify-center text-gray-400 bg-[#f8fafc] rounded-xl border border-dashed border-gray-200">
                          Configure {paymentMethod} Integration Here
                       </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="w-full lg:w-[380px] p-6 sm:p-10 bg-white overflow-y-auto shrink-0 flex flex-col">
               <h2 className="text-2xl font-bold mb-8 tracking-tight">Order summary</h2>
               
               {/* Progress Steps */}
               <div className="flex items-center justify-between mb-12">
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-10 h-10 rounded-full bg-[#3ba8ff] flex items-center justify-center text-white shadow-md shadow-blue-200 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/></svg>
                     </div>
                     <div className="text-[10px] text-[#3ba8ff] text-center font-medium">Step 1<br/>Shipping</div>
                  </div>
                  <div className="flex-1 h-[1px] bg-[#3ba8ff] -mt-6"></div>
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-10 h-10 rounded-full border border-[#3ba8ff] flex items-center justify-center text-[#3ba8ff] bg-white z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                     </div>
                     <div className="text-[10px] font-bold text-gray-800 text-center">Step 2<br/>Payment</div>
                  </div>
                  <div className="flex-1 h-[1px] bg-gray-200 -mt-6"></div>
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-10 h-10 rounded-full bg-[#3ba8ff] flex items-center justify-center text-white shadow-md shadow-blue-200 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                     </div>
                     <div className="text-[10px] text-gray-400 text-center font-medium">Step 3<br/>Review</div>
                  </div>
               </div>

               {/* Items List */}
               <div className="space-y-4 mb-6 overflow-y-auto pr-2 flex-1">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                       <span className="text-gray-500">{item.name}:</span>
                       <span className="font-bold text-gray-800">₹{((item.price || 5) * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
               </div>

               <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Estimated Shipping:</span>
                     <span className="font-bold text-gray-800">₹0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Discount:</span>
                     <span className="font-bold text-gray-800">₹0.00</span>
                  </div>
               </div>

               <div className="flex justify-between items-center pt-6 border-t border-gray-100 mb-10">
                  <span className="text-gray-500 font-bold">Total:</span>
                  <span className="text-2xl font-bold text-[#1a2b4b]">₹{totalToPay.toFixed(2)}</span>
               </div>

               <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-auto">
                  <button 
                     onClick={processPayment}
                     disabled={isProcessing}
                     className="w-full sm:w-auto flex-1 bg-[#3ba8ff] hover:bg-[#2e93e5] text-white font-bold py-3.5 px-8 rounded-lg shadow-lg shadow-blue-200 transition-colors disabled:opacity-50 border-none cursor-pointer"
                  >
                     {isProcessing ? 'Wait...' : 'Confirm'}
                  </button>
                  <button 
                     onClick={() => setShowPayment(false)}
                     className="text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors bg-transparent border-none cursor-pointer"
                  >
                     Cancel and return
                  </button>
               </div>
            </div>
            
          </div>
        </div>
      )}`;

if (!code.includes("showPayment &&")) {
  console.log("Could not find the target section.");
} else {
  code = code.replace(regex, newPaymentModal);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Checkout payment modal updated to two-column design.');
}
