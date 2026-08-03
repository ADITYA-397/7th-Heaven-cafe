// Run: node scratch/fix_currency.js
const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace literal \u20b9 with ₹
      // We need to match both \\u20b9 (double backslash) and \u20b9 (single backslash)
      // Because sometimes it's escaped in strings, sometimes in JSX text
      
      let newContent = content.replace(/\\\\u20b9/gi, '₹').replace(/\\u20b9/gi, '₹');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Fixed currency in:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '..', 'app'));
processDir(path.join(__dirname, '..', 'components'));
