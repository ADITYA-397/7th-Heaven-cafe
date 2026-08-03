// Run: node scratch/cart_mobile_fixes.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'components', 'CartDrawer.js');
let code = fs.readFileSync(file, 'utf8');

// Fix inline styles container padding
code = code.replace(
  "padding: '2.5rem 3rem',",
  "padding: '24px',"
);
code = code.replace(
  "padding: '3rem',",
  "padding: '24px',"
);
code = code.replace(
  "gap: '3.5rem'",
  "gap: '24px'"
);
code = code.replace(
  "padding: '2.5rem 3rem 4rem',",
  "padding: '24px',"
);
code = code.replace(
  "borderRadius: '2.5rem',",
  "borderRadius: '24px',"
);
code = code.replace(
  "padding: '2.5rem',",
  "padding: '16px',"
);

// Fix Currency
code = code.replace(
  "${((item.price || 5) * item.qty).toFixed(2)}",
  "₹{((item.price || 5) * item.qty).toFixed(2)}"
);
code = code.replace(
  "${totalToPay.toFixed(2)}",
  "₹{totalToPay.toFixed(2)}"
);

// Fix Header
const oldHeader = `<div className="flex items-center gap-6">
            <button 
                onClick={() => setIsCartOpen(false)} 
                className="hover:scale-110 transition-transform"
                style={{ color: '#8C6A53', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <ArrowLeft size={32} />
            </button>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '2.25rem', fontWeight: 900, color: '#3B2E28' }}>Your Order</h3>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#8C6A53', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                {cartItems.length} Selection{cartItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={() => clearCart()}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#A69991', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.2em', cursor: 'pointer' }}
            className="hover:text-red-500 transition-colors"
          >
            Clear All
          </button>`;

const newHeader = `<div className="flex items-center gap-4">
            <button 
                onClick={() => setIsCartOpen(false)} 
                className="hover:scale-110 transition-transform"
                style={{ color: '#8C6A53', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 0' }}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#3B2E28', lineHeight: 1.2 }}>Your Order</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 800, color: '#8C6A53', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                {cartItems.length} Selection{cartItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={() => clearCart()}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#A69991', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em', cursor: 'pointer', whiteSpace: 'nowrap', padding: '8px' }}
            className="hover:text-red-500 transition-colors"
          >
            Clear All
          </button>`;

code = code.replace(oldHeader, newHeader);

// Fix Item Card
const oldCard = `<div className="flex justify-between items-start mb-8">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vegetarian</span>
                          </div>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, color: '#3B2E28', margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: '#A69991', textTransform: 'uppercase' }}>Price: ₹{item.price || 5}</p>
                        </div>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, color: '#3B2E28', margin: 0 }}>
                          ₹{((item.price || 5) * item.qty).toFixed(2)}
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <button 
                            onClick={() => updateQuantity(item.name, -item.qty)}
                            style={{ backgroundColor: 'transparent', border: 'none', color: '#A69991', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
                            className="hover:text-red-500"
                        >
                          <Trash2 size={16} className="inline mr-2" /> Remove
                        </button>
                        
                        <div className="flex items-center bg-[#FAF9F6] rounded-2xl border border-[#E8E1DA] overflow-hidden">
                            <button onClick={() => updateQuantity(item.name, -1)} className="w-12 h-12 hover:bg-white transition-colors" style={{ border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', color: '#8C6A53', cursor: 'pointer' }}>-</button>
                            <span style={{ padding: '0 1rem', fontWeight: 900, color: '#3B2E28', minWidth: '40px', textAlign: 'center' }}>{item.qty}</span>
                            <button onClick={() => updateQuantity(item.name, 1)} className="w-12 h-12 hover:bg-white transition-colors" style={{ border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', color: '#8C6A53', cursor: 'pointer' }}>+</button>
                        </div>
                    </div>`;

const newCard = `<div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vegetarian</span>
                          </div>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 900, color: '#3B2E28', margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: '#A69991', textTransform: 'uppercase', margin: 0 }}>Price: ₹{item.price || 5}</p>
                        </div>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 900, color: '#3B2E28', margin: 0, flexShrink: 0 }}>
                          ₹{((item.price || 5) * item.qty).toFixed(2)}
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                        <button 
                            onClick={() => updateQuantity(item.name, -item.qty)}
                            style={{ backgroundColor: 'transparent', border: 'none', color: '#A69991', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', padding: '8px 0' }}
                            className="hover:text-red-500"
                        >
                          <Trash2 size={16} className="inline mr-1" /> Remove
                        </button>
                        
                        <div className="flex items-center bg-[#FAF9F6] rounded-xl border border-[#E8E1DA] overflow-hidden shrink-0">
                            <button onClick={() => updateQuantity(item.name, -1)} className="w-10 h-10 flex items-center justify-center hover:bg-white transition-colors" style={{ border: 'none', backgroundColor: 'transparent', fontSize: '1.25rem', color: '#8C6A53', cursor: 'pointer' }}>-</button>
                            <span style={{ padding: '0 0.5rem', fontWeight: 900, color: '#3B2E28', minWidth: '32px', textAlign: 'center', fontSize: '14px' }}>{item.qty}</span>
                            <button onClick={() => updateQuantity(item.name, 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white transition-colors" style={{ border: 'none', backgroundColor: 'transparent', fontSize: '1.25rem', color: '#8C6A53', cursor: 'pointer' }}>+</button>
                        </div>
                    </div>`;

code = code.replace(oldCard, newCard);

// Fix special instructions input overflow
code = code.replace(
  "padding: '1.5rem 2rem' }} className=\"flex items-center gap-6\"",
  "padding: '16px 20px' }} className=\"flex items-center gap-4\""
);
code = code.replace(
  "width: '100%', fontSize: '14px'",
  "width: '100%', minWidth: 0, fontSize: '14px'"
);
code = code.replace(
  "color: '#3B2E28' }}",
  "color: '#3B2E28', textOverflow: 'ellipsis' }}"
);


// Fix Footer
const oldFooter = `<div className="flex items-center justify-between gap-8">
               <div style={{ flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#8C6A53', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '0.25rem', opacity: 0.6 }}>To Pay</p>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 900, color: '#3B2E28', margin: 0, letterSpacing: '-0.02em' }}>
                     ₹{totalToPay.toFixed(2)}
                  </h4>
               </div>
               <button 
                  onClick={handleCheckoutClick}
                  disabled={isProcessing}
                  style={{ 
                      backgroundColor: '#8C6A53', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '2rem', 
                      padding: '1.25rem 2.5rem', 
                      fontSize: '1rem', 
                      fontWeight: 800, 
                      fontFamily: 'var(--font-heading)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.2em', 
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      boxShadow: '0 15px 40px rgba(140, 106, 83, 0.4)',
                      flexShrink: 0
                  }}
                  className="hover:bg-[#6B4E3B] hover:-translate-y-1 active:translate-y-0 transition-all"
               >
                 {isProcessing ? 'Wait...' : 'Place Order'}
               </button>
            </div>`;

const newFooter = `<div className="flex items-center justify-between gap-4">
               <div style={{ flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#8C6A53', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.25rem', opacity: 0.6 }}>To Pay</p>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 900, color: '#3B2E28', margin: 0, letterSpacing: '-0.02em' }}>
                     ₹{totalToPay.toFixed(2)}
                  </h4>
               </div>
               <button 
                  onClick={handleCheckoutClick}
                  disabled={isProcessing}
                  style={{ 
                      backgroundColor: '#8C6A53', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '1.5rem', 
                      padding: '16px 24px', 
                      fontSize: '14px', 
                      fontWeight: 800, 
                      fontFamily: 'var(--font-heading)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em', 
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 20px rgba(140, 106, 83, 0.4)',
                      flexShrink: 0
                  }}
                  className="hover:bg-[#6B4E3B] hover:-translate-y-1 active:translate-y-0 transition-all"
               >
                 {isProcessing ? 'Wait...' : 'Place Order'}
               </button>
            </div>`;

code = code.replace(oldFooter, newFooter);


fs.writeFileSync(file, code, 'utf8');
console.log('Cart drawer mobile layout fixes applied.');
