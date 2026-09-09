const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// ==========================================
// 1. BUSINESS LOGIC DESIGN (EXACT 2 PAGES)
// ==========================================
const blCss = `
  @page {
    size: A4;
    margin: 18mm 18mm 18mm 18mm;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #000000;
    background-color: #FFFFFF;
    line-height: 1.45;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }
  h1 {
    font-size: 21pt;
    font-weight: bold;
    text-align: center;
    margin: 0 0 20px 0;
    color: #000000;
  }
  h3 {
    font-size: 12pt;
    font-weight: bold;
    color: #000000;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
    break-after: avoid;
  }
  p {
    margin: 0 0 8px 0;
    font-size: 10pt;
    text-align: justify;
  }
  ul {
    margin: 0 0 10px 0;
    padding-left: 18px;
    list-style-type: disc;
  }
  li {
    margin-bottom: 5px;
    font-size: 10pt;
    text-align: justify;
  }
  li strong {
    font-weight: bold;
  }
  .page-break {
    page-break-before: always;
    break-before: always;
  }
`;

const businessLogicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Brewline Cafe: Business Logic Design</title>
<style>${blCss}</style>
</head>
<body>

<h1>Brewline Cafe: Business Logic Design</h1>

<h3>Core Entities and Data Modeling</h3>
<p>The system's data architecture is built on interconnected entities that track the lifecycle of a cafe's operations and online orders.</p>

<ul>
  <li><strong>User (Admin &amp; Customer):</strong> Represents cafe administrators, staff, and customers. It stores profile credentials, full name, email, phone number, and delivery addresses. Security logic mandates that all user authentication is handled via encrypted tokens (Firebase Auth) and passwords are never stored in plain text.</li>
  <li><strong>MenuItem:</strong> Represents an artisanal food or beverage product. It includes attributes such as name, description, price, category (Hot/Cold Coffee, Refreshers, Milkshakes, Mug Cakes), and an image URL. An 'inStock' boolean field allows admins to toggle visibility on the customer menu without deleting the underlying record.</li>
  <li><strong>Order:</strong> Represents a customer transaction. It is linked to the customer (or registered guest) and contains customer details, payment method (Online Razorpay or Cash), payment status, and the calculated total amount.</li>
  <li><strong>OrderItem:</strong> Operates as a snapshot embedded within an Order. It records the item name, price, quantity, and selected customization addons at the exact time of purchase to preserve historical data integrity, regardless of future menu price changes.</li>
  <li><strong>OrderSequence:</strong> A utility collection used to assign unique, sequential order invoice numbers for customer tracking and kitchen management.</li>
</ul>

<h3>Authentication and Role-Based Access</h3>
<p>Business operations are strictly divided into distinct access levels to reduce friction for customers while protecting owner data.</p>

<ul>
  <li><strong>Admin &amp; Staff Access:</strong> Cafe owners and kitchen staff authenticate using secure credentials to access protected routes, including real-time kitchen display queues, item stock availability toggles, sales dashboards, and menu management.</li>
  <li><strong>Customer Access:</strong> Customers interact with the web system through an intuitive digital interface. Customers are granted completely unauthenticated access to view available menu items, manage their cart, and track order status. Registered login is optional for saving multi-address preferences and view past orders.</li>
</ul>

<h3>Order Processing and Pricing Logic</h3>
<p>The checkout workflow enforces strict validation rules to prevent data manipulation and ensure accurate transaction logging.</p>

<ul>
  <li><strong>Server-Side Price Calculation:</strong> When a customer submits an order, the system independently fetches the real-time prices of requested items directly from the database. The final order total (including 5% GST and delivery fees) is calculated using these server-side values, actively rejecting any pricing data supplied by the customer's browser.</li>
  <li><strong>Availability Verification:</strong> The system verifies that all requested items are currently marked as in-stock. If an item is unavailable, the order is rejected and an error is shown to the customer.</li>
  <li><strong>Order Number Assignment:</strong> Upon successful payment method selection (Online Razorpay or Cash on Delivery), the system queries the sequence entity to generate the next sequential order number specific to that order.</li>
</ul>

<div class="page-break"></div>

<h3>Kitchen Queue and Lifecycle Management</h3>
<p>Order fulfillment follows a defined state machine logic, prioritizing fairness and real-time synchronization between the kitchen and the customer.</p>

<ul>
  <li><strong>First-Come-First-Served (FCFS) Queue:</strong> The Kitchen Display interface actively listens to database updates in real time via Firestore snapshot streams. Incoming orders are strictly sorted from oldest to newest to enforce an FCFS processing rule.</li>
  <li><strong>Status Progression:</strong> Admins and kitchen staff progress orders through a linear sequence of statuses: Placed, Preparing, Out for Delivery, and Delivered.</li>
  <li><strong>Customer Tracking:</strong> The customer's order tracking screen synchronizes with the database in real time to fetch their specific order's status, ensuring they receive live countdown updates without needing to refresh the page or log in.</li>
  <li><strong>Data Aggregation:</strong> Completed orders are aggregated by the system to populate the admin's sales dashboard, providing metrics such as today's total sales, revenue charts, pending order counts, and a report of the most popular items based on total quantity ordered. Order history can also be filtered, printed, and exported by the admin.</li>
</ul>

</body>
</html>
`;

// ==========================================
// 2. DATABASE DESIGN (EXACT 3 PAGES)
// ==========================================
const dbCss = `
  @page {
    size: A4;
    margin: 18mm 18mm 18mm 18mm;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #000000;
    background-color: #FFFFFF;
    line-height: 1.45;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }
  h1 {
    font-size: 21pt;
    font-weight: bold;
    text-align: center;
    margin: 0 0 16px 0;
    color: #000000;
  }
  h3 {
    font-size: 11pt;
    font-weight: bold;
    color: #000000;
    margin-top: 14px;
    margin-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
  }
  p {
    margin: 0 0 8px 0;
    font-size: 9.5pt;
    text-align: justify;
  }
  ol {
    margin: 0 0 12px 0;
    padding-left: 20px;
  }
  li {
    margin-bottom: 7px;
    font-size: 9.5pt;
    text-align: justify;
  }
  li strong {
    font-weight: bold;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 4px;
    margin-bottom: 12px;
    font-size: 9pt;
  }
  tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  th, td {
    border: 1px solid #000000;
    padding: 5px 8px;
    text-align: left;
    vertical-align: top;
    color: #000000;
  }
  th {
    font-weight: bold;
    background-color: #FFFFFF;
  }
  .page-break {
    page-break-before: always;
    break-before: always;
  }
`;

const databaseDesignHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Brewline Cafe: Database Design</title>
<style>${dbCss}</style>
</head>
<body>

<h1>Brewline Cafe: Database Design</h1>

<p>This document outlines the database design for the Brewline Cafe Web Platform, implemented using Google Cloud Firestore (NoSQL) and Firebase Web SDK. The architecture leverages document-based storage, embedding arrays for point-in-time snapshots (order items) while referencing related entities (users and orders).</p>

<h3>1. User (Admin &amp; Customer) Collection</h3>
<p>Stores registered customers, administrators, and their authentication credentials.</p>

<table>
  <thead>
    <tr>
      <th style="width: 28%;">Field Name</th>
      <th style="width: 22%;">Data Type</th>
      <th style="width: 50%;">Constraints / Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>uid</code></td>
      <td>String</td>
      <td>Primary Key. Matches Firebase Auth UID.</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td>String</td>
      <td>Required. Full name of the user or admin.</td>
    </tr>
    <tr>
      <td><code>email</code></td>
      <td>String</td>
      <td>Required, Unique. Used for login and invoices.</td>
    </tr>
    <tr>
      <td><code>phone</code></td>
      <td>String</td>
      <td>Optional. Contact phone number.</td>
    </tr>
    <tr>
      <td><code>role</code></td>
      <td>String</td>
      <td>Required. Enum: ['customer', 'kitchen', 'admin']. Default: 'customer'.</td>
    </tr>
    <tr>
      <td><code>addresses</code></td>
      <td>Array of Objects</td>
      <td>Saved customer delivery address list.</td>
    </tr>
    <tr>
      <td><code>createdAt</code></td>
      <td>Timestamp</td>
      <td>Timestamp when the account was registered.</td>
    </tr>
  </tbody>
</table>

<h3>2. MenuItem Collection</h3>
<p>Stores individual food and beverage items offered by Brewline Cafe.</p>

<table>
  <thead>
    <tr>
      <th style="width: 28%;">Field Name</th>
      <th style="width: 22%;">Data Type</th>
      <th style="width: 50%;">Constraints / Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>id</code></td>
      <td>String</td>
      <td>Primary Key, Auto-generated document ID.</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td>String</td>
      <td>Required. Name of the food/beverage item.</td>
    </tr>
    <tr>
      <td><code>description</code></td>
      <td>String</td>
      <td>Optional. Detailed description of the item.</td>
    </tr>
    <tr>
      <td><code>price</code></td>
      <td>Number</td>
      <td>Required. Current selling price in INR (₹).</td>
    </tr>
    <tr>
      <td><code>category</code></td>
      <td>String</td>
      <td>Required. Category grouping on customer menu.</td>
    </tr>
    <tr>
      <td><code>imageUrl</code></td>
      <td>String</td>
      <td>Optional. Cloud Storage URL for item photo.</td>
    </tr>
    <tr>
      <td><code>available</code></td>
      <td>Boolean</td>
      <td>Default: true. Toggles customer menu visibility.</td>
    </tr>
    <tr>
      <td><code>addons</code></td>
      <td>Array of Objects</td>
      <td>Optional addon customization options with extra prices.</td>
    </tr>
    <tr>
      <td><code>popularity</code></td>
      <td>Number</td>
      <td>Default: 0. Tracks total quantity ordered across sales.</td>
    </tr>
    <tr>
      <td><code>createdAt</code></td>
      <td>Timestamp</td>
      <td>Timestamp when the menu item was created.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h3>3. Order Collection</h3>
<p>Records customer transactions, encapsulating a point-in-time snapshot of the cart and order lifecycle status.</p>

<table>
  <thead>
    <tr>
      <th style="width: 28%;">Field Name</th>
      <th style="width: 22%;">Data Type</th>
      <th style="width: 50%;">Constraints / Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>id</code></td>
      <td>String</td>
      <td>Primary Key, Auto-generated document ID.</td>
    </tr>
    <tr>
      <td><code>orderNumber</code></td>
      <td>String</td>
      <td>Required. Formatted sequential order ID (e.g., '7H-20260303-0042').</td>
    </tr>
    <tr>
      <td><code>userId</code></td>
      <td>String</td>
      <td>Required. Reference to User uid, or 'guest'.</td>
    </tr>
    <tr>
      <td><code>customerName</code></td>
      <td>String</td>
      <td>Required. Name provided by customer.</td>
    </tr>
    <tr>
      <td><code>customerEmail</code></td>
      <td>String</td>
      <td>Required. Email address for invoice receipt.</td>
    </tr>
    <tr>
      <td><code>customerPhone</code></td>
      <td>String</td>
      <td>Required. Phone number for delivery updates.</td>
    </tr>
    <tr>
      <td><code>customerAddress</code></td>
      <td>String</td>
      <td>Required. Complete delivery address.</td>
    </tr>
    <tr>
      <td><code>items</code></td>
      <td>Array of Objects</td>
      <td>Required. Embedded historical snapshot of items.</td>
    </tr>
    <tr>
      <td><code>items.menuItemId</code></td>
      <td>String</td>
      <td>Required. Reference to MenuItem document ID.</td>
    </tr>
    <tr>
      <td><code>items.name</code></td>
      <td>String</td>
      <td>Required. Snapshot of item name at time of order.</td>
    </tr>
    <tr>
      <td><code>items.price</code></td>
      <td>Number</td>
      <td>Required. Snapshot of item price at time of order.</td>
    </tr>
    <tr>
      <td><code>items.quantity</code></td>
      <td>Number</td>
      <td>Required. Number of units ordered.</td>
    </tr>
    <tr>
      <td><code>subtotal</code></td>
      <td>Number</td>
      <td>Sum of (price * quantity) for all line items.</td>
    </tr>
    <tr>
      <td><code>taxes</code></td>
      <td>Number</td>
      <td>Calculated 5% GST tax amount.</td>
    </tr>
    <tr>
      <td><code>deliveryFee</code></td>
      <td>Number</td>
      <td>Delivery charge (₹40 or ₹0 if subtotal &ge; ₹500).</td>
    </tr>
    <tr>
      <td><code>totalAmount</code></td>
      <td>Number</td>
      <td>Required. Final net payable amount.</td>
    </tr>
    <tr>
      <td><code>paymentMethod</code></td>
      <td>String</td>
      <td>Required. Enum: ['Online (Razorpay)', 'Cash on Delivery'].</td>
    </tr>
    <tr>
      <td><code>status</code></td>
      <td>String</td>
      <td>Required. Enum: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered']. Default: 'Placed'.</td>
    </tr>
    <tr>
      <td><code>paymentStatus</code></td>
      <td>String</td>
      <td>Required. Enum: ['Pending', 'Paid', 'Failed'].</td>
    </tr>
    <tr>
      <td><code>createdAt</code></td>
      <td>Timestamp</td>
      <td>Timestamp of when the order was placed.</td>
    </tr>
    <tr>
      <td><code>estimatedDeliveryAt</code></td>
      <td>Timestamp</td>
      <td>Calculated delivery ETA for live customer tracking.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h3>4. Counter Collection</h3>
<p>A utility collection used to generate concurrent-safe, sequential order numbers for customer invoices and kitchen ticketing.</p>

<table>
  <thead>
    <tr>
      <th style="width: 28%;">Field Name</th>
      <th style="width: 22%;">Data Type</th>
      <th style="width: 50%;">Constraints / Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>_id</code></td>
      <td>String</td>
      <td>Primary Key (e.g., 'order_counter').</td>
    </tr>
    <tr>
      <td><code>seq</code></td>
      <td>Number</td>
      <td>Required. Tracks the last assigned order sequence number. Default: 0.</td>
    </tr>
    <tr>
      <td><code>updatedAt</code></td>
      <td>Timestamp</td>
      <td>Timestamp of last sequence increment.</td>
    </tr>
  </tbody>
</table>

<h3>Relationships &amp; Data Integrity Rules</h3>
<ol>
  <li><strong>Multi-Role Isolation:</strong> Every User, MenuItem, and Order document is protected by Firestore Security Rules. Customers have strictly scoped access to read/write their own orders and profile documents, while kitchen staff and administrators possess elevated privileges for status progression and menu catalog updates.</li>
  <li><strong>Snapshot Pattern (OrderItems):</strong> Items within an order are embedded as an array of objects rather than traditional normalized foreign keys. The item's name and price are captured at the exact time of purchase. This guarantees that if an admin later updates the price of a MenuItem or deletes it entirely, historical order totals remain accurate and immutable.</li>
  <li><strong>Auto-Incrementing Sequences:</strong> The Counter collection allows atomic increment operations via Firestore transactions to generate gapless sequential order numbers, avoiding race conditions during concurrent customer order placements.</li>
</ol>

</body>
</html>
`;

// Helper to compile HTML to PDF
function compileToPdf(html, pdfName) {
  const htmlPath = path.join(__dirname, pdfName.replace('.pdf', '.html'));
  const pdfPath = path.join(__dirname, pdfName);
  const artifactPath = path.join('C:\\Users\\Aditya\\.gemini\\antigravity-ide\\brain\\db61db96-a99a-4667-bb94-96dab88755a6', pdfName);

  fs.writeFileSync(htmlPath, html, 'utf-8');
  const cmd = '"' + edgePath + '" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="' + pdfPath + '" "' + htmlPath + '"';
  execSync(cmd, { stdio: 'inherit' });

  fs.copyFileSync(pdfPath, artifactPath);
  console.log('Successfully generated:', pdfName);
}

compileToPdf(businessLogicHtml, '7th_Heaven_Cafe_Business_Logic_Design.pdf');
compileToPdf(databaseDesignHtml, '7th_Heaven_Cafe_Database_Design.pdf');
console.log('Finished updating both PDFs with exact pagination matching reference!');
