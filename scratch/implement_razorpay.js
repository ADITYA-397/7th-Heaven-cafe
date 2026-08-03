// Run: node scratch/implement_razorpay.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'components', 'CartDrawer.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Add states
const stateTarget = "const [paymentMethod, setPaymentMethod] = useState('UPI');";
const stateReplacement = "const [paymentMethod, setPaymentMethod] = useState('Card');\n  const [upiId, setUpiId] = useState('');\n  const [selectedBank, setSelectedBank] = useState('HDFC');";
code = code.replace(stateTarget, stateReplacement);

// 2. Replace processPayment
const processPaymentTarget = /const processPayment = async \(e\) => \{[\s\S]*?finally \{\s*setIsProcessing\(false\);\s*\}\s*\};/;
const processPaymentReplacement = `const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'Cash on Delivery') {
         const orderData = {
           userId: user.uid,
           customerName: profile?.name || user.email || 'Guest',
           customerAddress: selectedAddress || 'No address provided',
           customerPhone: profile?.phone || 'No phone stored',
           items: cartItems,
           total: itemTotal,
           grandTotal: totalToPay,
           status: 'Pending - Pay on Delivery',
           timestamp: new Date().toISOString(),
           paymentMethod: 'COD',
           suggestions: suggestions,
           noContactDelivery: isNoContact
         };
         const docRef = await addDoc(collection(db, "orders"), orderData);
         clearCart();
         setShowPayment(false);
         setLastOrder({ id: docRef.id, ...orderData });
         setOrderCompleteMsg('Success! Your order is placed and will be paid on delivery.');
         setIsProcessing(false);
         return;
      }

      // Online Payment Flow (Razorpay)
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
         alert('Razorpay SDK failed to load. Are you online?');
         setIsProcessing(false);
         return;
      }

      const res = await fetch('/api/razorpay', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ amount: totalToPay })
      });
      const data = await res.json();
      
      if (!data.success) {
         alert('Failed to initiate payment.');
         setIsProcessing(false);
         return;
      }

      const options = {
         key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TYpo90mJ5uVdGk', // Safe fallback test key for demo
         amount: data.order.amount,
         currency: data.order.currency,
         name: 'The Cafe',
         description: 'Order Payment',
         order_id: data.order.id,
         prefill: {
            name: profile?.name || user.email || 'Guest',
            contact: profile?.phone || '',
         },
         handler: async function (response) {
            const orderData = {
              userId: user.uid,
              customerName: profile?.name || user.email || 'Guest',
              customerAddress: selectedAddress || 'No address provided',
              customerPhone: profile?.phone || 'No phone stored',
              items: cartItems,
              total: itemTotal,
              grandTotal: totalToPay,
              status: 'Paid',
              timestamp: new Date().toISOString(),
              paymentMethod: \`Razorpay - \${paymentMethod}\`,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              suggestions: suggestions,
              noContactDelivery: isNoContact
            };
            const docRef = await addDoc(collection(db, "orders"), orderData);
            clearCart();
            setShowPayment(false);
            setLastOrder({ id: docRef.id, ...orderData });
            setOrderCompleteMsg('Success! Your payment was received.');
            setIsProcessing(false);
         },
         theme: {
            color: '#3ba8ff'
         }
      };

      if (paymentMethod === 'UPI' && upiId) {
         options.prefill.method = 'upi';
         options.prefill.vpa = upiId;
      } else if (paymentMethod === 'Net Banking' && selectedBank) {
         options.prefill.method = 'netbanking';
         options.prefill.bank = selectedBank;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
         alert('Payment Failed: ' + response.error.description);
         setIsProcessing(false);
      });
      rzp.open();
      
    } catch (error) {
      console.error(error);
      alert("Error processing checkout.");
      setIsProcessing(false);
    }
  };`;
code = code.replace(processPaymentTarget, processPaymentReplacement);

// 3. Replace the Left Column UI
const tabsTargetRegex = /\{\/\*\s*Vertical Tabs\s*\*\/\}\s*<div\s*className="w-full\s*sm:w-1\/4\s*space-y-4">[\s\S]*?\{\/\*\s*Form Area\s*\*\/\}/;
const newTabs = `{/* Vertical Tabs */}
                  <div className="w-full sm:w-1/4 space-y-4 shrink-0">
                     <button onClick={() => setPaymentMethod('Card')} className={\`w-full text-left flex items-center gap-2 font-semibold bg-transparent border-none cursor-pointer transition-colors \${paymentMethod === 'Card' ? 'text-[#1a2b4b]' : 'text-gray-400 hover:text-gray-600'}\`}>
                        <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${paymentMethod === 'Card' ? 'bg-[#3ba8ff]' : 'bg-transparent'}\`}></div>
                        Credit/Debit Card
                     </button>
                     <button onClick={() => setPaymentMethod('UPI')} className={\`w-full text-left flex items-center gap-2 font-semibold bg-transparent border-none cursor-pointer transition-colors \${paymentMethod === 'UPI' ? 'text-[#1a2b4b]' : 'text-gray-400 hover:text-gray-600'}\`}>
                        <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${paymentMethod === 'UPI' ? 'bg-[#3ba8ff]' : 'bg-transparent'}\`}></div>
                        UPI
                     </button>
                     <button onClick={() => setPaymentMethod('Net Banking')} className={\`w-full text-left flex items-center gap-2 font-semibold bg-transparent border-none cursor-pointer transition-colors \${paymentMethod === 'Net Banking' ? 'text-[#1a2b4b]' : 'text-gray-400 hover:text-gray-600'}\`}>
                        <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${paymentMethod === 'Net Banking' ? 'bg-[#3ba8ff]' : 'bg-transparent'}\`}></div>
                        Net Banking
                     </button>
                     <button onClick={() => setPaymentMethod('Cash on Delivery')} className={\`w-full text-left flex items-center gap-2 font-semibold bg-transparent border-none cursor-pointer transition-colors \${paymentMethod === 'Cash on Delivery' ? 'text-[#1a2b4b]' : 'text-gray-400 hover:text-gray-600'}\`}>
                        <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${paymentMethod === 'Cash on Delivery' ? 'bg-[#3ba8ff]' : 'bg-transparent'}\`}></div>
                        Cash on Delivery
                     </button>
                  </div>

                  {/* Form Area */}`;
code = code.replace(tabsTargetRegex, newTabs);

const formTargetRegex = /\{\/\*\s*Form Area\s*\*\/\}\s*<div\s*className="flex-1">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{\/\*\s*Right Column - Order Summary\s*\*\/\}/;
const newForm = `{/* Form Area */}
                  <div className="flex-1 min-w-0">
                     {paymentMethod === 'Card' && (
                       <div className="bg-[#f8fafc] p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                          <div className="w-16 h-16 bg-blue-100 text-[#3ba8ff] rounded-full flex items-center justify-center mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                          </div>
                          <h3 className="text-[#1a2b4b] font-bold text-lg mb-2">Secure Card Payment</h3>
                          <p className="text-gray-500 text-sm max-w-sm mb-6">
                            To protect your data, we process all cards through Razorpay's secure, PCI-compliant vault. We never see or store your raw card numbers.
                          </p>
                          <div className="flex gap-2">
                             <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-500">VISA</span>
                             <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-500">Mastercard</span>
                             <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-500">Rupay</span>
                          </div>
                       </div>
                     )}

                     {paymentMethod === 'UPI' && (
                       <div className="h-full">
                          <h3 className="text-[#1a2b4b] font-bold text-lg mb-6">Pay via UPI</h3>
                          <div className="mb-6">
                             <label className="block text-gray-500 text-sm mb-2">Virtual Payment Address (UPI ID)</label>
                             <div className="relative">
                               <input 
                                  type="text" 
                                  placeholder="e.g. yourname@bank" 
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  className="w-full p-4 bg-[#f8fafc] rounded-lg outline-none font-medium border border-transparent focus:border-[#3ba8ff] focus:bg-white transition-colors" 
                               />
                             </div>
                             <p className="text-xs text-gray-400 mt-2">Entering your UPI ID pre-fills it in the Razorpay secure gateway.</p>
                          </div>
                          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-sm text-blue-800">
                             <div className="mt-0.5"><Info size={16} /></div>
                             <p>You can also leave this blank and select your preferred UPI app directly inside the Razorpay modal.</p>
                          </div>
                       </div>
                     )}

                     {paymentMethod === 'Net Banking' && (
                       <div className="h-full">
                          <h3 className="text-[#1a2b4b] font-bold text-lg mb-6">Net Banking</h3>
                          <div className="mb-6">
                             <label className="block text-gray-500 text-sm mb-2">Select your Bank</label>
                             <div className="relative">
                               <select 
                                  value={selectedBank}
                                  onChange={(e) => setSelectedBank(e.target.value)}
                                  className="w-full p-4 bg-[#f8fafc] rounded-lg outline-none font-medium border border-transparent focus:border-[#3ba8ff] focus:bg-white transition-colors appearance-none cursor-pointer"
                               >
                                  <option value="HDFC">HDFC Bank</option>
                                  <option value="ICIC">ICICI Bank</option>
                                  <option value="SBIN">State Bank of India</option>
                                  <option value="UTIB">Axis Bank</option>
                                  <option value="KKBK">Kotak Mahindra Bank</option>
                               </select>
                               <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                             </div>
                          </div>
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg flex gap-3 text-sm text-gray-600">
                             <div className="mt-0.5"><Info size={16} /></div>
                             <p>Selecting a bank here will fast-track you through the secure Razorpay authentication process.</p>
                          </div>
                       </div>
                     )}

                     {paymentMethod === 'Cash on Delivery' && (
                       <div className="bg-[#f0fdf4] p-6 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                          </div>
                          <h3 className="text-green-800 font-bold text-lg mb-2">Pay on Delivery</h3>
                          <p className="text-green-700/80 text-sm max-w-sm mb-6">
                            You will pay ₹{totalToPay.toFixed(2)} in cash or via scanner to the delivery executive when your order arrives.
                          </p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
            
            {/* Right Column - Order Summary */}`;
code = code.replace(formTargetRegex, newForm);

fs.writeFileSync(file, code, 'utf8');
console.log('Razorpay UI and logic implemented.');
