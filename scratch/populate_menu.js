const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAbfjCRvBeBiSXnU9evohqlHGkwXlQmmmk",
  authDomain: "th-heaven-cafe.firebaseapp.com",
  projectId: "th-heaven-cafe",
  storageBucket: "th-heaven-cafe.firebasestorage.app",
  messagingSenderId: "453307852245",
  appId: "1:453307852245:web:3fcf4aa4ce5b682bf5895c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const fullMenu = [
  { category: 'Refreshers', name: 'Mint Mojito', price: 8, inStock: true },
  { category: 'Refreshers', name: 'Coke Float', price: 7, inStock: true },
  { category: 'Refreshers', name: 'Lemon Iced Tea', price: 6, inStock: true },
  { category: 'Refreshers', name: 'Blueberry Iced Tea', price: 8, inStock: true },
  { category: 'Hot Coffee', name: 'Cappuccino', price: 7, inStock: true },
  { category: 'Hot Coffee', name: 'Cafe Latte', price: 8, inStock: true },
  { category: 'Hot Coffee', name: 'Flat White', price: 8, inStock: true },
  { category: 'Hot Coffee', name: 'Cafe Mocha', price: 9, inStock: true },
  { category: 'Hot Coffee', name: 'Roasted Hazelnut', price: 10, inStock: true },
  { category: 'Cold Coffee', name: 'Tiramisu', price: 11, inStock: true },
  { category: 'Cold Coffee', name: 'Cold Coffee Frappe', price: 10, inStock: true },
  { category: 'Cold Coffee', name: 'Toffee Nut Frappe', price: 11, inStock: true },
  { category: 'Cold Coffee', name: 'Chocolate Frappe', price: 10, inStock: true },
  { category: 'Milkshake', name: 'Mango', price: 9, inStock: true },
  { category: 'Milkshake', name: 'Butterscotch', price: 8, inStock: true },
  { category: 'Milkshake', name: 'Mint & Oreo', price: 10, inStock: true },
  { category: 'Milkshake', name: 'Death By Chocolate', price: 11, inStock: true },
  { category: 'Desserts', name: 'Cheese Cake', price: 12, inStock: true },
  { category: 'Desserts', name: 'Brownie', price: 8, inStock: true },
  { category: 'Desserts', name: 'Chocolate Pizza', price: 14, inStock: true },
  { category: 'Desserts', name: 'Macarons', price: 9, inStock: true },
  { category: 'Desserts', name: 'Lava Cake', price: 10, inStock: true },
  { category: 'Pizza', name: 'Margarita Pizza', price: 15, inStock: true },
  { category: 'Pizza', name: 'Veggie Lover Pizza', price: 17, inStock: true },
  { category: 'Pizza', name: 'Hawaiian Pizza', price: 18, inStock: true },
  { category: 'Pasta', name: 'Arabiatta Pasta', price: 14, inStock: true },
  { category: 'Pasta', name: 'Alfredo Pasta', price: 15, inStock: true },
  { category: 'Sides', name: 'Garlic Bread', price: 6, inStock: true },
  { category: 'Sides', name: 'Cheese Corn Balls', price: 8, inStock: true },
  { category: 'Sides', name: 'Classic Salted French Fries', price: 7, inStock: true }
];

async function populate() {
  try {
    const menuCol = collection(db, 'menu');
    
    // Clear existing items first to avoid duplicates
    const snapshot = await getDocs(menuCol);
    console.log(`Clearing ${snapshot.size} existing items...`);
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log('Adding fresh menu items...');
    for (const item of fullMenu) {
      await addDoc(menuCol, item);
      console.log(`Added: ${item.name}`);
    }
    console.log('Success!');
    process.exit(0);
  } catch (err) {
    console.error('Error populating menu:', err);
    process.exit(1);
  }
}

populate();
