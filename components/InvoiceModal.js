"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer } from 'lucide-react';

export default function InvoiceModal({ order, isOpen, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const items = order.items || [];
  const subtotal = Number(order.total) || 0;
  const tax = subtotal * 0.05; // Fixed 5% Tax for realism
  const grandTotal = subtotal + tax;

  const safeSlice = (str, num) => (str ? String(str).slice(num) : '');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 md:p-10 print:static print:p-0 print:block">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[850px] h-full sm:h-auto sm:max-h-[95vh] bg-white text-gray-900 shadow-2xl flex flex-col overflow-hidden sm:rounded-2xl print:static print:w-full print:h-auto print:max-h-none print:overflow-visible print:shadow-none print:bg-transparent"
          >
            {/* Action Bar - Hidden in Print */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 print:hidden shrink-0">
              <h3 className="text-lg font-bold">Print Invoice</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all text-gray-800 font-bold text-sm flex items-center gap-2"
                >
                  <Printer size={16} /> Print
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Invoice Screen Backdrop */}
            <div className="flex-1 overflow-y-auto bg-slate-100 flex flex-col items-center py-12 px-4 sm:px-8 relative w-full print:static print:block print:overflow-visible print:bg-transparent print:p-0">
              
              {/* Actual Letter-size Printable Paper (8.5 x 11 inches) */}
              <div id="printable-invoice" className="bg-white mx-auto shadow-xl border border-gray-200 shrink-0 flex flex-col print:shadow-none print:border-none" style={{ width: '8.5in', minHeight: '11in', padding: '0.75in', boxSizing: 'border-box' }}>
                {/* Body Content - grows to fill space, pushing footer down */}
                <div className="flex-1 flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <h1 className="text-5xl sm:text-6xl font-black tracking-[-0.03em] uppercase text-gray-900 mt-2" style={{ fontFamily: 'Georgia, serif' }}>
                    INVOICE
                  </h1>
                  <div className="w-24 sm:w-32 flex flex-col items-end">
                    <img 
                      src="/logo.png" 
                      alt="7th Heaven Logo" 
                      className="w-full max-w-[120px] h-auto object-contain"
                      onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150x50?text=7th+Heaven";
                      }} 
                    />
                  </div>
                </div>

                <div className="border-b-[4px] border-gray-900 mt-2 mb-[3px]"></div>
                <div className="border-b border-gray-900 mb-6"></div>

                <div className="mb-8">
                  <h2 className="text-[15px] font-bold text-gray-900">
                    No. {safeSlice(order.id, -5).toUpperCase() || '12345'}
                  </h2>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 md:gap-16 mb-10 text-[13px]">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1.5 text-[15px]">Bill to</h3>
                      <p className="text-gray-500 leading-relaxed">
                        {order.customerName || 'Business Company'}<br />
                        {order.customerAddress || '123 Grand Avenue'}<br />
                        29102 Country<br />
                        {order.customerPhone || '+00 000 000 000'}<br />
                        CIF: {safeSlice(order.userId, -9) || '000000ABC'}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-1.5 text-[15px]">From</h3>
                      <p className="text-gray-500 leading-relaxed">
                        7th Heaven Cafe<br />
                        Baker Street 221B<br />
                        London, UK<br />
                        +44 20 7946 0958<br />
                        CIF: 7THHEAVENUK
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1.5 text-[15px]">Date</h3>
                      <p className="text-gray-500 leading-relaxed">
                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-1.5 text-[15px]">Payment Method</h3>
                      <p className="text-gray-500 leading-relaxed">
                        {order.paymentMethod || 'Credit Card XXXX-XXXX'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="mb-10 w-full text-[13px]">
                  {/* Table Header */}
                  <div className="flex w-full bg-[#f0a672] text-gray-900 font-bold px-4 py-2">
                    <div className="w-[15%]">Qty</div>
                    <div className="w-[45%]">Description</div>
                    <div className="w-[20%] text-right">Price</div>
                    <div className="w-[20%] text-right">Total</div>
                  </div>
                  
                  {/* Table Items */}
                  <div className="border-b-[1.5px] border-gray-400">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex px-4 py-3.5 text-gray-600 border-b border-gray-300 font-medium">
                        <div className="w-[15%]">{item.qty}</div>
                        <div className="w-[45%]">{item.name}</div>
                        <div className="w-[20%] text-right">₹{Number(item.price || 0).toFixed(2)}</div>
                        <div className="w-[20%] text-right">₹{(Number(item.qty || 1) * Number(item.price || 0)).toFixed(2)}</div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="flex px-4 py-3 text-gray-500 justify-center font-medium">
                        1    Item description    ₹00.00    ₹00.00
                      </div>
                    )}
                  </div>
                </div>

                {/* Lower Section Grid */}
                <div className="grid grid-cols-2 gap-12 mb-16 text-[13px]">
                  {/* Notes */}
                  <div className="pr-8 md:pr-16">
                    <h3 className="font-bold text-gray-900 mb-4 text-[15px]">Notes</h3>
                    <div className="space-y-4">
                      <div className="border-b-[1.5px] border-gray-300 w-full h-2"></div>
                      <div className="border-b-[1.5px] border-gray-300 w-full h-6"></div>
                      <div className="border-b-[1.5px] border-gray-300 w-full h-6"></div>
                    </div>
                  </div>
                  
                  {/* Totals */}
                  <div>
                    <div className="w-full md:pl-12">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-900 text-[15px]">Subtotal</span>
                        <span className="text-gray-600">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-bold text-gray-900 text-[15px]">Tax</span>
                        <span className="text-gray-600">5%</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-900/10">
                        <span className="font-bold text-gray-900 text-[17px]">Total</span>
                        <span className="font-bold text-gray-900 text-[17px] tracking-tight">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                </div>{/* End body flex-grow wrapper */}

                {/* Footer - always pinned to bottom */}
                <div className="mt-auto" style={{ paddingTop: '0.3in' }}>
                  {/* Terms Text */}
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 mb-1 text-[11px]">Terms & conditions</h3>
                    <p className="text-[9pt] text-gray-500 leading-tight">
                      1. Payment is due within 14 days of invoice date. 2. Late payments may incur a 5% monthly interest charge. 3. All sales are final unless otherwise agreed in writing. 4. Disputes must be raised within 7 days of receipt. 5. This invoice is governed by the laws of the United Kingdom. 6. For inquiries, contact info@7thheaven.com.
                    </p>
                  </div>

                  <div className="w-full border-b-[1.5px] border-gray-900 mb-2"></div>
                  
                  {/* Contact Info */}
                  <div className="flex flex-row justify-between text-[11px] text-gray-800 font-bold">
                    <span>info@7thheaven.com</span>
                    <span>+000 123 456 789</span>
                    <span>www.7thheaven.com</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          <style jsx global>{`
            @media print {
              @page {
                size: letter portrait;
                margin: 0;
              }
              html, body {
                height: 11in !important;
                max-height: 11in !important;
                overflow: hidden !important;
                background-color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* Hide all elements by default */
              body * {
                visibility: hidden;
              }
              /* Unhide the invoice and all its children */
              #printable-invoice, #printable-invoice * {
                visibility: visible;
              }
              /* Make the invoice perfectly fill the physical page */
              #printable-invoice {
                position: absolute;
                left: 0;
                top: 0;
                margin: 0 !important;
                width: 8.5in !important;
                min-height: 11in !important;
                max-width: none !important;
                background-color: white !important;
                padding: 0.75in !important;
                box-sizing: border-box !important;
                z-index: 99999;
              }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}
