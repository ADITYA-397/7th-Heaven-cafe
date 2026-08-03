// Run: node scratch/redesign_checkout.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'components', 'CartDrawer.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Update imports
const importTarget = "import { Trash2, FileText, ArrowRight, ArrowLeft, Ticket, Receipt, Info, ChevronRight } from 'lucide-react';";
const importReplacement = "import { Trash2, FileText, ArrowRight, ArrowLeft, Ticket, Receipt, Info, ChevronRight, CheckCircle2, Circle, Plus, Scan, ChevronDown } from 'lucide-react';";
if (code.includes(importTarget)) {
    code = code.replace(importTarget, importReplacement);
} else {
    code = code.replace("from 'lucide-react';", ", CheckCircle2, Circle, Plus, Scan, ChevronDown } from 'lucide-react';");
}

// 2. Add showAddCard state
const stateTarget = "const [paymentMethod, setPaymentMethod] = useState('UPI');";
const stateReplacement = "const [paymentMethod, setPaymentMethod] = useState('UPI');\n  const [showAddCard, setShowAddCard] = useState(false);";
code = code.replace(stateTarget, stateReplacement);

// 3. Replace the entire showPayment block
const regex = /\{\s*showPayment\s*&&\s*\(\s*<div\s*className="fixed\s*inset-0\s*z-\[2000\]\s*bg-black\/80\s*backdrop-blur-md\s*flex\s*items-center\s*justify-center\s*p-8">[\s\S]*?<\/div>\s*\)\}/;

const newPaymentModal = `{/* Checkout Payment Flow Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center sm:p-8">
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2rem] sm:max-w-[450px] shadow-2xl flex flex-col overflow-hidden relative font-sans text-gray-800">
            
            {/* Header */}
            <div className="flex items-center px-6 py-5 border-b border-gray-100">
               <button onClick={() => showAddCard ? setShowAddCard(false) : setShowPayment(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-2 -ml-2 border-none bg-transparent cursor-pointer">
                 <ArrowLeft size={24} />
               </button>
               <h2 className="flex-1 text-center text-[1.15rem] font-bold text-gray-900 -ml-6" style={{fontFamily: 'system-ui, sans-serif', margin: 0}}>
                 {showAddCard ? "Add New Card" : "Payments"}
               </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
              {!showAddCard ? (
                <>
                  <p className="text-sm font-medium text-gray-500 mb-6 font-sans">Choose the payment method you'd like to use.</p>
                  
                  <div className="space-y-4 font-sans">
                    {/* Google Pay */}
                    <div onClick={() => setPaymentMethod('Google Pay')} className={\`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer \${paymentMethod === 'Google Pay' ? 'border-[#6c5ce7] bg-[#6c5ce7]/5' : 'border-gray-100 hover:border-gray-200'}\`}>
                       <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 shrink-0">
                         <span className="text-lg font-bold" style={{color: '#EA4335'}}>G</span>
                       </div>
                       <span className="flex-1 font-bold text-[15px]">Google Pay</span>
                       <div className="flex-shrink-0">
                          {paymentMethod === 'Google Pay' ? <CheckCircle2 size={24} fill="#6c5ce7" color="#fff" strokeWidth={1} /> : <Circle size={24} className="text-gray-200" strokeWidth={1.5} />}
                       </div>
                    </div>

                    {/* PhonePe */}
                    <div onClick={() => setPaymentMethod('PhonePe')} className={\`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer \${paymentMethod === 'PhonePe' ? 'border-[#6c5ce7] bg-[#6c5ce7]/5' : 'border-gray-100 hover:border-gray-200'}\`}>
                       <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 shrink-0">
                         <span className="text-lg font-bold" style={{color: '#5f259f'}}>पे</span>
                       </div>
                       <span className="flex-1 font-bold text-[15px]">PhonePe</span>
                       <div className="flex-shrink-0">
                          {paymentMethod === 'PhonePe' ? <CheckCircle2 size={24} fill="#6c5ce7" color="#fff" strokeWidth={1} /> : <Circle size={24} className="text-gray-200" strokeWidth={1.5} />}
                       </div>
                    </div>

                    {/* Apple Pay */}
                    <div onClick={() => setPaymentMethod('Apple Pay')} className={\`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer \${paymentMethod === 'Apple Pay' ? 'border-[#6c5ce7] bg-[#6c5ce7]/5' : 'border-gray-100 hover:border-gray-200'}\`}>
                       <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 shrink-0">
                         <span className="text-xl font-bold" style={{color: '#000'}}></span>
                       </div>
                       <span className="flex-1 font-bold text-[15px]">Apple Pay</span>
                       <div className="flex-shrink-0">
                          {paymentMethod === 'Apple Pay' ? <CheckCircle2 size={24} fill="#6c5ce7" color="#fff" strokeWidth={1} /> : <Circle size={24} className="text-gray-200" strokeWidth={1.5} />}
                       </div>
                    </div>

                    {/* Debit Card (Mocked existing) */}
                    <div onClick={() => setPaymentMethod('Card')} className={\`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer \${paymentMethod === 'Card' ? 'border-[#6c5ce7] bg-[#6c5ce7]/5' : 'border-gray-100 hover:border-gray-200'}\`}>
                       <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 relative shrink-0">
                         <div className="w-4 h-4 rounded-full bg-[#eb001b] absolute left-[8px] opacity-90 z-10"></div>
                         <div className="w-4 h-4 rounded-full bg-[#f79e1b] absolute right-[8px] opacity-90"></div>
                       </div>
                       <span className="flex-1 font-bold text-[15px] tracking-[0.1em] text-gray-700">**** **** **** 0000</span>
                       <div className="flex-shrink-0">
                          {paymentMethod === 'Card' ? <CheckCircle2 size={24} fill="#6c5ce7" color="#fff" strokeWidth={1} /> : <Circle size={24} className="text-gray-200" strokeWidth={1.5} />}
                       </div>
                    </div>

                    {/* Cash on Delivery */}
                    <div onClick={() => setPaymentMethod('Cash')} className={\`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer \${paymentMethod === 'Cash' ? 'border-[#6c5ce7] bg-[#6c5ce7]/5' : 'border-gray-100 hover:border-gray-200'}\`}>
                       <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 shrink-0">
                         <span className="text-xl font-bold text-[#16a34a]">₹</span>
                       </div>
                       <span className="flex-1 font-bold text-[15px]">Cash on Delivery</span>
                       <div className="flex-shrink-0">
                          {paymentMethod === 'Cash' ? <CheckCircle2 size={24} fill="#6c5ce7" color="#fff" strokeWidth={1} /> : <Circle size={24} className="text-gray-200" strokeWidth={1.5} />}
                       </div>
                    </div>
                  </div>

                  <button 
                     type="button" 
                     onClick={() => setShowAddCard(true)}
                     className="w-full mt-6 py-4 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors text-[15px] border-none cursor-pointer font-sans"
                  >
                     <Plus size={18} /> Add New Card
                  </button>
                </>
              ) : (
                <div className="font-sans">
                  {/* Virtual Debit Card */}
                  <div className="w-full aspect-[1.58] rounded-[1.25rem] p-6 mb-8 relative overflow-hidden text-white shadow-xl shadow-blue-900/20" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                     {/* Background Geometric Pattern Simulation */}
                     <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)'}}></div>
                     
                     <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                           <span className="text-xl font-bold tracking-wider">Debit</span>
                           <div className="flex items-center gap-2">
                             <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                               <div className="w-3 h-3 rounded-full border-2 border-[#1e3c72]"></div>
                             </div>
                             <span className="font-bold text-sm tracking-wide">ESCObank</span>
                           </div>
                        </div>
                        
                        <div>
                           <div className="w-10 h-8 rounded bg-[#e8c07e] border border-[#d4af37]/50 flex flex-col justify-evenly px-[3px] py-[3px] mb-6">
                              <div className="w-full h-[1px] bg-black/10"></div>
                              <div className="w-full h-[1px] bg-black/10"></div>
                              <div className="w-full h-[1px] bg-black/10"></div>
                           </div>
                           
                           <div className="font-mono text-[1.25rem] tracking-[0.1em] sm:text-[1.35rem] sm:tracking-[0.15em] mb-4 drop-shadow-sm font-semibold">
                             1234 5678 9000 0000
                           </div>
                           
                           <div className="flex justify-between items-end">
                              <div>
                                 <div className="text-[8px] text-blue-100 mb-1 uppercase tracking-wider">Card Holder</div>
                                 <div className="text-[13px] font-semibold tracking-wide">Wahib Khan Lohani</div>
                              </div>
                              <div>
                                 <div className="text-[8px] text-blue-100 mb-1 uppercase tracking-wider text-right">Expiry Date</div>
                                 <div className="text-[13px] font-semibold tracking-wide text-right">12/28</div>
                              </div>
                              <div className="w-8 h-8 relative shrink-0">
                                 <div className="w-5 h-5 rounded-full bg-[#eb001b] absolute left-0 top-1/2 -translate-y-1/2 opacity-90 z-10"></div>
                                 <div className="w-5 h-5 rounded-full bg-[#f79e1b] absolute right-0 top-1/2 -translate-y-1/2 opacity-90"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Add Card Form */}
                  <div className="space-y-5">
                     <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Card Number</label>
                        <div className="relative">
                          <input type="text" placeholder="1234 5678 9000 0000" className="w-full p-4 pr-12 rounded-xl border border-gray-200 focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] outline-none font-medium text-[15px] bg-white transition-colors" />
                          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                             <Scan size={20} />
                          </button>
                        </div>
                     </div>
                     
                     <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Account Holder Name</label>
                        <input type="text" placeholder="Wahib Khan Lohani" className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] outline-none font-medium text-[15px] bg-white transition-colors" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-800 mb-2">Expiry Date</label>
                           <div className="relative">
                             <input type="text" placeholder="12/28" className="w-full p-4 pr-10 rounded-xl border border-gray-200 focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] outline-none font-medium text-[15px] bg-white transition-colors" />
                             <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-800 mb-2">CVV</label>
                           <input type="text" placeholder="224" className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] outline-none font-medium text-[15px] bg-white transition-colors" />
                        </div>
                     </div>

                     <div className="flex items-center gap-3 pt-2 cursor-pointer">
                        <CheckCircle2 size={24} fill="#6c5ce7" color="#fff" strokeWidth={1} />
                        <span className="text-[14px] font-semibold text-gray-800">Save Card Information</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Button */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-10">
               {!showAddCard ? (
                 <button 
                    onClick={processPayment}
                    disabled={isProcessing}
                    className="w-full bg-[#6c5ce7] hover:bg-[#5a4bcf] text-white font-bold py-4 rounded-2xl text-[16px] transition-colors shadow-lg shadow-[#6c5ce7]/30 border-none cursor-pointer font-sans disabled:opacity-50"
                 >
                    {isProcessing ? 'Processing...' : 'Next'}
                 </button>
               ) : (
                 <button 
                    onClick={() => { setPaymentMethod('Card'); setShowAddCard(false); }}
                    className="w-full bg-[#6c5ce7] hover:bg-[#5a4bcf] text-white font-bold py-4 rounded-2xl text-[16px] transition-colors shadow-lg shadow-[#6c5ce7]/30 border-none cursor-pointer font-sans"
                 >
                    Save
                 </button>
               )}
            </div>

          </div>
        </div>
      )}`;

code = code.replace(regex, newPaymentModal);

fs.writeFileSync(file, code, 'utf8');
console.log('Checkout payment modal updated with reference designs.');
