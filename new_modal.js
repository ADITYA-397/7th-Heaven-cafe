      {/* Checkout Modal - Exact design match */}
      {showPayment && (
        <div className="fixed inset-0 z-[2000] bg-[#f5f6f8] overflow-y-auto font-sans">
          {/* Top Navbar / Back button area */}
          <div className="max-w-[1150px] mx-auto px-6 pt-6 flex justify-between items-center">
             <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-700 transition-colors bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
               <ArrowLeft size={20} strokeWidth={2.5} />
             </button>
          </div>
          
          <div className="max-w-[1150px] mx-auto px-6 py-6 pb-20 flex flex-col md:flex-row gap-6 items-start">
            
            {/* Left Column */}
            <div className="flex-1 w-full flex flex-col gap-5">
              
              {/* CARD 1: Delivered Details & Choose delivery options */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[17px] font-bold text-gray-900">Delivered Details</h2>
                  <div className="flex bg-[#f5f6f8] rounded-full p-1 border border-gray-100">
                    <button className="bg-white rounded-full px-5 py-1.5 text-[12px] font-bold text-gray-900 shadow-sm">Delivery</button>
                    <button className="px-5 py-1.5 text-[12px] font-semibold text-gray-500">Pickup</button>
                  </div>
                </div>

                {/* Address Row */}
                <div className="flex gap-4 items-start pb-6 border-b border-gray-100">
                  <div className="text-gray-400 mt-0.5"><MapPin size={20} strokeWidth={2} /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[14px] text-gray-900">Midtown South, Manhattan</span>
                      <button className="text-[#ff6036] font-semibold text-[13px]">Edit</button>
                    </div>
                    <p className="text-gray-500 text-[13px] mt-1 pr-12 leading-relaxed">{selectedAddress || '123 Madison Avenue, Apartment 12B, Midtown South, Manhattan, New York City, NY 10016, United States'}</p>
                  </div>
                </div>

                {/* Name Row */}
                <div className="flex gap-4 items-start pt-6 pb-1">
                  <div className="text-gray-400 mt-0.5"><User size={20} strokeWidth={2} /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[14px] text-gray-900">{profile?.name || user?.email || 'Mr. Azzahri Alpiana'}</span>
                      <button className="text-[#ff6036] font-semibold text-[13px]">Edit</button>
                    </div>
                    <button className="text-gray-500 text-[13px] mt-1 underline hover:text-gray-700 transition-colors decoration-gray-400 underline-offset-2">Add instruction for courier</button>
                  </div>
                </div>

                {/* Options Header */}
                <h3 className="text-[17px] font-bold text-gray-900 mt-8 mb-4">Choose delevery options</h3>
                
                {/* Options List */}
                <div className="flex flex-col gap-3">
                  
                  {/* Express */}
                  <div onClick={() => setDeliveryOption('Express')} className={lex justify-between items-center p-4 rounded-xl cursor-pointer transition-colors }>
                    <div className="flex items-center gap-4">
                      <div className={w-9 h-9 rounded-full flex items-center justify-center }>
                        <Zap size={18} fill={deliveryOption === 'Express' ? 'currentColor' : 'none'} strokeWidth={deliveryOption === 'Express' ? 0 : 2} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[14px] text-gray-900">Express</span>
                          <span className="bg-[#2d9585] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">Faster</span>
                        </div>
                        <p className="text-gray-500 text-[13px] mt-0.5">Estimation 15-20 min</p>
                      </div>
                    </div>
                    <span className="font-bold text-[13px] text-gray-900">.99</span>
                  </div>

                  {/* Standard */}
                  <div onClick={() => setDeliveryOption('Standard')} className={lex justify-between items-center p-4 rounded-xl cursor-pointer transition-colors }>
                    <div className="flex items-center gap-4">
                      <div className={w-9 h-9 rounded-full flex items-center justify-center }>
                        <Archive size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <span className="font-bold text-[14px] text-gray-900">Standard</span>
                        <p className="text-gray-500 text-[13px] mt-0.5">Estimation 30-40 min</p>
                      </div>
                    </div>
                  </div>

                  {/* Economical */}
                  <div onClick={() => setDeliveryOption('Economical')} className={lex justify-between items-center p-4 rounded-xl cursor-pointer transition-colors }>
                    <div className="flex items-center gap-4">
                      <div className={w-9 h-9 rounded-full flex items-center justify-center }>
                        <Archive size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <span className="font-bold text-[14px] text-gray-900">Ecomical</span>
                        <p className="text-gray-500 text-[13px] mt-0.5">Estimation 50-60 min</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD 2: Payment */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                <h2 className="text-[17px] font-bold text-gray-900 mb-5">Payment</h2>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-10 rounded-xl bg-[#fff3ef] flex items-center justify-center text-[#ff6036] border border-[#fde0d4]">
                      <CreditCard size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="font-bold text-[14px] text-gray-900 block">Add your debit card</span>
                      <p className="text-gray-500 text-[13px] mt-0.5">You can use debit card for continue your payment.</p>
                    </div>
                  </div>
                  <button className="flex-shrink-0 border border-[#ff6036] text-[#ff6036] bg-transparent hover:bg-[#fff3ef] transition-colors rounded-full px-5 py-2 text-[12px] font-bold">
                    + Add Card
                  </button>
                </div>
              </div>

              {/* Continue Button */}
              <button 
                onClick={processPayment}
                disabled={isProcessing}
                className="w-full bg-[#ff6036] hover:bg-[#eb4f28] transition-colors text-white font-bold text-[16px] py-4 rounded-2xl shadow-md mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Continue to payment'}
              </button>
            </div>

            {/* Right Column: Cart Summary */}
            <div className="w-full md:w-[420px] flex-shrink-0">
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 h-fit">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[18px] font-bold text-gray-900">
                    Cart <span className="text-gray-400 font-normal">({cartItems.length})</span>
                  </h2>
                  <Info size={22} className="text-gray-500" strokeWidth={1.5} />
                </div>

                {/* Items */}
                <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto pr-1 mb-8" style={{ scrollbarWidth: 'none' }}>
                  {cartItems.map((item, index) => (
                    <div key={item.id + index} className="flex gap-4 items-center">
                      {item.image ? (
                         <img src={item.image} alt={item.name} className="w-[64px] h-[64px] rounded-xl object-cover flex-shrink-0 shadow-sm" />
                      ) : (
                         <div className="w-[64px] h-[64px] rounded-xl bg-[#98c1b9] flex-shrink-0 shadow-sm"></div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-[#2d9585] text-[11px] font-medium mb-1 truncate">{item.category || 'Japanese Food'}</p>
                        <h3 className="font-bold text-[14px] text-gray-900 leading-tight truncate">{item.name}</h3>
                        <p className="font-bold text-[13px] text-gray-700 mt-1"></p>
                      </div>

                      <div className="w-[26px] h-[26px] rounded-full border border-gray-200 flex items-center justify-center font-bold text-[12px] text-gray-800 flex-shrink-0 shadow-sm bg-white">
                        {item.qty}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promotion Code */}
                <h3 className="text-[15px] font-bold text-gray-500 mb-3">Promotion code</h3>
                <div className="flex gap-3 mb-8">
                  <input type="text" placeholder="Add promo code" className="flex-1 border border-gray-100 rounded-full px-5 py-2.5 text-[14px] outline-none focus:border-gray-300 transition-colors placeholder:text-gray-300 bg-white shadow-sm" />
                  <button className="bg-[#f5f6f8] text-gray-400 hover:text-gray-600 font-bold px-7 py-2.5 rounded-full text-[13px] transition-colors shadow-sm">Apply</button>
                </div>

                {/* Order Total */}
                <h3 className="text-[15px] font-bold text-[#e5e7eb] mb-5">Order total</h3>
                <div className="flex flex-col gap-3.5 mb-5">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[#e5e7eb] font-medium">Item Price</span>
                    <span className="text-[#e5e7eb] font-medium"></span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[#e5e7eb] font-medium">Shipping</span>
                    <span className="text-[#e5e7eb] font-medium"></span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[#e5e7eb] font-medium">Platform Fee (5%)</span>
                    <span className="text-[#e5e7eb] font-medium"></span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3">
                  <span className="text-[#d1d5db] font-bold text-[15px]">Total</span>
                  <span className="text-[#d1d5db] font-bold text-[19px]">
                    
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
