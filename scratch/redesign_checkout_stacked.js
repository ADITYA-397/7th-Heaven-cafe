// Run: node scratch/redesign_checkout_stacked.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'components', 'CartDrawer.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Update imports
const importTarget = "import { Trash2, FileText, ArrowRight, ArrowLeft, Ticket, Receipt, Info, ChevronRight, CheckCircle2, Circle, Plus, Scan, ChevronDown } from 'lucide-react';";
const importReplacement = "import { Trash2, FileText, ArrowRight, ArrowLeft, Ticket, Receipt, Info, ChevronRight, CheckCircle2, Circle, Plus, Scan, ChevronDown, MapPin, User, Zap, Archive, CreditCard } from 'lucide-react';";
if (code.includes(importTarget)) {
    code = code.replace(importTarget, importReplacement);
} else {
    code = code.replace("from 'lucide-react';", ", MapPin, User, Zap, Archive, CreditCard } from 'lucide-react';");
}

// 2. Add states
const stateTarget = "const [selectedBank, setSelectedBank] = useState('HDFC');";
const stateReplacement = "const [selectedBank, setSelectedBank] = useState('HDFC');\n  const [deliveryOption, setDeliveryOption] = useState('Express');\n  const [showPaymentOptions, setShowPaymentOptions] = useState(false);";
if (!code.includes("const [deliveryOption, setDeliveryOption]")) {
  code = code.replace(stateTarget, stateReplacement);
}

// 3. Replace the entire modal block
const regex = /\{\/\*\s*Checkout Payment Flow Modal\s*\*\/\}\s*\{showPayment\s*&&\s*\(\s*<div\s*className="fixed\s*inset-0[\s\S]*?<\/div>\s*\)\}/;

const newPaymentModal = `{/* Checkout Payment Flow Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
          <div className="bg-[#f8f9fb] w-full max-w-[650px] h-full sm:h-auto sm:max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col relative font-sans text-gray-800">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4">
               <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-2 -ml-2 bg-transparent border-none cursor-pointer">
                 <ArrowLeft size={24} />
               </button>
               <h2 className="text-lg font-bold text-gray-900" style={{fontFamily: 'system-ui, sans-serif', margin: 0}}>
                 Checkout
               </h2>
               <div className="w-10"></div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-2 pb-32 space-y-4 font-sans">
               
               {/* 1. Delivered Details */}
               <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-lg m-0 text-gray-900">Delivered Details</h3>
                     <div className="flex bg-gray-100 rounded-full p-1">
                        <button className="px-5 py-2 bg-white shadow-sm rounded-full text-xs font-bold border-none cursor-pointer text-gray-900">Delivery</button>
                        <button className="px-5 py-2 text-gray-500 rounded-full text-xs font-bold border-none cursor-pointer bg-transparent">Pickup</button>
                     </div>
                  </div>

                  <div className="space-y-6 pt-2">
                     <div className="flex items-start gap-4">
                        <div className="mt-1"><MapPin size={20} className="text-gray-800" /></div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-900 m-0 text-sm">Midtown South, Manhattan</h4>
                              <button className="text-[#ff6036] text-[11px] font-bold bg-transparent border-none cursor-pointer hover:underline">Edit</button>
                           </div>
                           <p className="text-gray-500 text-[12px] mt-1.5 mb-0 leading-relaxed pr-8">
                             123 Madison Avenue, Apartment 12B, Midtown South, Manhattan, New York City, NY 10016, United States
                           </p>
                        </div>
                     </div>
                     <div className="w-full h-[1px] bg-gray-100/80"></div>
                     <div className="flex items-start gap-4">
                        <div className="mt-1"><User size={20} className="text-gray-800" /></div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-900 m-0 text-sm">Mr. Azzahri Alpiana</h4>
                              <button className="text-[#ff6036] text-[11px] font-bold bg-transparent border-none cursor-pointer hover:underline">Edit</button>
                           </div>
                           <button className="text-gray-500 text-[12px] mt-1.5 mb-0 underline bg-transparent border-none cursor-pointer p-0 text-left hover:text-gray-700">
                             Add instruction for courier
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* 2. Choose Delivery Options */}
               <div className="space-y-3 pt-4">
                  <h3 className="font-bold text-lg mb-3 m-0 text-gray-900">Choose delevery options</h3>
                  
                  <div 
                     onClick={() => setDeliveryOption('Express')} 
                     className={\`p-4 rounded-[1.25rem] border-2 flex justify-between items-center cursor-pointer transition-colors \${deliveryOption === 'Express' ? 'border-[#2d9585] bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}\`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={\`w-6 h-6 flex items-center justify-center \${deliveryOption === 'Express' ? 'text-[#2d9585]' : 'text-gray-400'}\`}>
                           <Zap size={22} fill={deliveryOption === 'Express' ? "currentColor" : "none"} strokeWidth={deliveryOption === 'Express' ? 0 : 2} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 m-0 text-[15px]">Express</h4>
                              <span className="bg-[#2d9585] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">Faster</span>
                           </div>
                           <p className="text-gray-500 text-[12px] m-0">Estimation 15-20 min</p>
                        </div>
                     </div>
                     <span className="font-bold text-[15px] text-gray-900">$1.99</span>
                  </div>

                  <div 
                     onClick={() => setDeliveryOption('Standard')} 
                     className={\`p-4 rounded-[1.25rem] border-2 flex justify-between items-center cursor-pointer transition-colors \${deliveryOption === 'Standard' ? 'border-[#2d9585] bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}\`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={\`w-6 h-6 flex items-center justify-center \${deliveryOption === 'Standard' ? 'text-[#2d9585]' : 'text-gray-400'}\`}>
                           <Archive size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-900 m-0 text-[15px] mb-1">Standard</h4>
                           <p className="text-gray-500 text-[12px] m-0">Estimation 30-40 min</p>
                        </div>
                     </div>
                  </div>

                  <div 
                     onClick={() => setDeliveryOption('Economical')} 
                     className={\`p-4 rounded-[1.25rem] border-2 flex justify-between items-center cursor-pointer transition-colors \${deliveryOption === 'Economical' ? 'border-[#2d9585] bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}\`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={\`w-6 h-6 flex items-center justify-center \${deliveryOption === 'Economical' ? 'text-[#2d9585]' : 'text-gray-400'}\`}>
                           <Archive size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-900 m-0 text-[15px] mb-1">Ecomical</h4>
                           <p className="text-gray-500 text-[12px] m-0">Estimation 50-60 min</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* 3. Payment Card */}
               <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 mt-6">
                  <h3 className="font-bold text-lg mb-4 m-0 text-gray-900">Payment</h3>
                  
                  {!showPaymentOptions ? (
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-10 rounded-xl bg-orange-50 border border-orange-100 text-[#ff6036] flex items-center justify-center shrink-0">
                              <CreditCard size={20} strokeWidth={2.5} />
                           </div>
                           <div>
                              <h4 className="font-bold text-gray-900 m-0 text-sm mb-1">
                                 {paymentMethod === 'Card' ? 'Add your debit card' : paymentMethod === 'UPI' ? 'Pay with UPI' : paymentMethod === 'Net Banking' ? 'Net Banking' : 'Cash on Delivery'}
                              </h4>
                              <p className="text-gray-500 text-[11px] m-0 pr-2">
                                 {paymentMethod === 'Card' ? 'You can use debit card for continue your payment.' : 'Proceed via Razorpay securely.'}
                              </p>
                           </div>
                        </div>
                        <button 
                           onClick={() => setShowPaymentOptions(true)}
                           className="px-4 py-2 border border-[#ff6036] text-[#ff6036] rounded-full text-xs font-bold bg-transparent cursor-pointer hover:bg-orange-50 shrink-0 transition-colors"
                        >
                           {paymentMethod === 'Card' ? '+ Add Card' : 'Change'}
                        </button>
                     </div>
                  ) : (
                     <div className="space-y-2 mt-4">
                        {['Card', 'UPI', 'Net Banking', 'Cash on Delivery'].map(method => (
                           <div 
                              key={method}
                              onClick={() => { setPaymentMethod(method); setShowPaymentOptions(false); }}
                              className={\`p-4 rounded-[1rem] border-2 flex items-center gap-4 cursor-pointer transition-colors \${paymentMethod === method ? 'border-[#ff6036] bg-orange-50/50' : 'border-gray-100 hover:border-gray-200'}\`}
                           >
                              <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \${paymentMethod === method ? 'border-[#ff6036]' : 'border-gray-300'}\`}>
                                 {paymentMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-[#ff6036]"></div>}
                              </div>
                              <span className="font-bold text-sm text-gray-900">{method}</span>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

            </div>

            {/* Bottom Action Button */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-md border-t border-gray-100 z-10 rounded-b-[2rem]">
               <button 
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="w-full bg-[#ff6036] hover:bg-[#eb552d] text-white font-bold py-4 rounded-2xl text-[16px] transition-colors shadow-lg shadow-orange-500/20 border-none cursor-pointer disabled:opacity-50 tracking-wide"
               >
                  {isProcessing ? 'Processing...' : 'Continue to payment'}
               </button>
            </div>

          </div>
        </div>
      )}`;

if (!code.includes("showPayment &&")) {
  console.log("Could not find the target section.");
} else {
  code = code.replace(regex, newPaymentModal);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Checkout payment modal updated to stacked cards design.');
}
