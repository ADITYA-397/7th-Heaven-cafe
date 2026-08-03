// Run: node scratch/replace_dollar_rupee.js
const fs = require('fs');
const path = require('path');

function replaceInFile(relativePath, replacements) {
  const fullPath = path.join(__dirname, '..', relativePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const { from, to } of replacements) {
    // using split.join for global replace of exact strings
    content = content.split(from).join(to);
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${relativePath}`);
}

replaceInFile('components/ProfileDrawer.js', [
  { from: '>${o.total}</div>', to: '>₹{o.total}</div>' }
]);

replaceInFile('components/InvoiceModal.js', [
  { from: '>${Number(item.price || 0).toFixed(2)}</div>', to: '>₹{Number(item.price || 0).toFixed(2)}</div>' },
  { from: '>${(Number(item.qty || 1) * Number(item.price || 0)).toFixed(2)}</div>', to: '>₹{(Number(item.qty || 1) * Number(item.price || 0)).toFixed(2)}</div>' },
  { from: '$00.00', to: '₹00.00' },
  { from: '>${subtotal.toFixed(2)}</span>', to: '>₹{subtotal.toFixed(2)}</span>' },
  { from: '>${grandTotal.toFixed(2)}</span>', to: '>₹{grandTotal.toFixed(2)}</span>' }
]);

replaceInFile('components/CartDrawer.js', [
  { from: 'Price: ${item.price || 5}', to: 'Price: ₹{item.price || 5}' },
  { from: '>${((item.price || 5) * item.qty).toFixed(2)}', to: '>₹{((item.price || 5) * item.qty).toFixed(2)}' },
  { from: '>${itemTotal.toFixed(2)}</td>', to: '>₹{itemTotal.toFixed(2)}</td>' },
  { from: '>${tax.toFixed(2)}</td>', to: '>₹{tax.toFixed(2)}</td>' },
  { from: '>${totalToPay.toFixed(2)}', to: '>₹{totalToPay.toFixed(2)}' },
  { from: 'Confirm Total: ${totalToPay.toFixed(2)}', to: 'Confirm Total: ₹{totalToPay.toFixed(2)}' }
]);

replaceInFile('components/MenuGrid.js', [
  { from: '>$ {Number(item.price).toFixed(2)}</span>', to: '>₹ {Number(item.price).toFixed(2)}</span>' }
]);
