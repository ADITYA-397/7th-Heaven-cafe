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
  // Refreshers (all ₹99)
  { category: 'Refreshers', name: 'Mint Mojito', price: 99, inStock: true, description: 'Cool and invigorating mint leaves muddled with lime and sparkling soda.' },
  { category: 'Refreshers', name: 'Coke Float', price: 99, inStock: true, description: 'Classic fizzy cola topped with a luscious scoop of vanilla ice cream.' },
  { category: 'Refreshers', name: 'Lemon Iced Tea', price: 99, inStock: true, description: 'Chilled brewed tea infused with tangy lemon and a touch of sweetness.' },
  { category: 'Refreshers', name: 'Peach Iced Tea', price: 99, inStock: true, description: 'Aromatic iced tea blended with fragrant sweet peach nectar.' },
  { category: 'Refreshers', name: 'Passion Fruit Iced Tea', price: 99, inStock: true, description: 'Tropical passion fruit infused iced tea with bright exotic notes.' },
  { category: 'Refreshers', name: 'Strawberry Iced Tea', price: 99, inStock: true, description: 'Sweet summer strawberry essence blended into crisp refreshing iced tea.' },
  { category: 'Refreshers', name: 'Blueberry Iced Tea', price: 99, inStock: true, description: 'Antioxidant-rich blueberry puree paired with crisp chilled tea.' },

  // Hot Coffee
  { category: 'Hot Coffee', name: 'Cappuccino', price: 99, inStock: true, description: 'Rich espresso layered with velvety steamed milk and thick airy foam.' },
  { category: 'Hot Coffee', name: 'Cafe Latte', price: 99, inStock: true, description: 'Smooth espresso balanced with generous steamed milk and light foam.' },
  { category: 'Hot Coffee', name: 'Flat White', price: 99, inStock: true, description: 'Bold double shot espresso blended seamlessly with micro-foamed milk.' },
  { category: 'Hot Coffee', name: 'Cafe Mocha', price: 110, inStock: true, description: 'Decadent dark chocolate melted with espresso and steamed whole milk.' },
  { category: 'Hot Coffee', name: 'Caramel Flan Latte', price: 120, inStock: true, description: 'Warm artisanal latte infused with creamy custard flan and golden caramel.' },
  { category: 'Hot Coffee', name: 'Roasted Hazelnut', price: 120, inStock: true, description: 'Toasted hazelnut aromatics stirred into signature espresso and milk.' },
  { category: 'Hot Coffee', name: 'Cinnamon & Ginger Bread Coffee', price: 120, inStock: true, description: 'Cozy spiced gingerbread notes and warm cinnamon steeped in fresh espresso.' },

  // Cold Coffee
  { category: 'Cold Coffee', name: 'Tiramisu', price: 129, inStock: true, description: 'Italian dessert-inspired cold coffee with notes of cocoa, mascarpone, and espresso.' },
  { category: 'Cold Coffee', name: 'Turkish Delight', price: 129, inStock: true, description: 'Exotic cold brew with delicate hints of rosewater and spiced cardamom.' },
  { category: 'Cold Coffee', name: 'Irish Cafe and Hazelnut', price: 129, inStock: true, description: 'Non-alcoholic creamy Irish cream syrup and nutty hazelnut with chilled espresso.' },
  { category: 'Cold Coffee', name: 'Cold Coffee with Ice Cream', price: 135, inStock: true, description: 'Classic thick chilled coffee topped with a rich vanilla ice cream scoop.' },
  { category: 'Cold Coffee', name: 'Cold Coffee Frappe', price: 129, inStock: true, description: 'Blended icy coffee shake crowned with whipped cream and cocoa dust.' },
  { category: 'Cold Coffee', name: 'Toffee Nut Frappe', price: 129, inStock: true, description: 'Rich buttery toffee and roasted nut crunch blended with ice cold coffee.' },
  { category: 'Cold Coffee', name: 'Chocolate Frappe', price: 129, inStock: true, description: 'Decadent chocolate fudge blended with bold coffee and crushed ice.' },

  // Milkshake
  { category: 'Milkshake', name: 'Blueberry & Lavender', price: 120, inStock: true, description: 'Wild blueberries blended with soothing French culinary lavender.' },
  { category: 'Milkshake', name: 'Strawberry Bubblegum', price: 120, inStock: true, description: 'Playful nostalgic bubblegum flavor paired with ripe sweet strawberries.' },
  { category: 'Milkshake', name: 'Popcorn Caramel', price: 120, inStock: true, description: 'Crunchy buttered movie popcorn syrup swirled with rich caramel shake.' },
  { category: 'Milkshake', name: 'Mango', price: 120, inStock: true, description: 'Luscious Alphonso mango pulp blended into a thick creamy milkshake.' },
  { category: 'Milkshake', name: 'Butterscotch', price: 120, inStock: true, description: 'Crunchy butterscotch praline bits folded in golden caramel cream.' },
  { category: 'Milkshake', name: 'Mint & Oreo', price: 158, inStock: true, description: 'Cool refreshing mint extract mixed with crushed chocolate Oreo cookies.' },
  { category: 'Milkshake', name: 'KitKat Shake', price: 140, inStock: true, description: 'Crispy chocolate KitKat wafer fingers blended into creamy goodness.' },
  { category: 'Milkshake', name: 'Death by Chocolate', price: 140, inStock: true, description: 'Ultimate chocolate overload with fudge, brownie crumbs, and dark cocoa.' },
  { category: 'Milkshake', name: 'Parle G Shake', price: 140, inStock: true, description: 'Nostalgic chai-time biscuit goodness blended into a comforting shake.' },
  { category: 'Milkshake', name: 'Kulfi', price: 140, inStock: true, description: 'Traditional royal Indian kulfi flavor with pistachios, saffron, and cardamom.' },

  // Cupcake Milkshake (all ₹140)
  { category: 'Cupcake Milkshake', name: 'Hazelnut Cupcake Shake', price: 140, inStock: true, description: 'Whole hazelnut cupcake blended right into a thick rich milkshake.' },
  { category: 'Cupcake Milkshake', name: 'Chocolate Cupcake Shake', price: 140, inStock: true, description: 'Decadent chocolate cupcake and frosting whipped into an indulgent shake.' },
  { category: 'Cupcake Milkshake', name: 'Red Velvet Cupcake Shake', price: 140, inStock: true, description: 'Velvety red sponge and cream cheese cupcake blended to creamy perfection.' },
  { category: 'Cupcake Milkshake', name: 'Vanilla Cupcake Shake', price: 140, inStock: true, description: 'Classic sweet vanilla bean cupcake blended with rich dairy ice cream.' },
  { category: 'Cupcake Milkshake', name: 'Oreo Cupcake Shake', price: 140, inStock: true, description: 'Cookies & cream cupcake mixed with extra Oreo crumb topping.' },

  // Mug Cakes
  { category: 'Mug Cakes', name: 'Whipped Cream & Chocolate Syrup', price: 145, inStock: true, description: 'Warm spongy mug cake smothered in airy whipped cream and chocolate drizzle.' },
  { category: 'Mug Cakes', name: 'Choco Chip & Truffle', price: 145, inStock: true, description: 'Melted Belgian chocolate chips and gooey truffle center.' },
  { category: 'Mug Cakes', name: 'Salted Caramel & Milk Truffle', price: 145, inStock: true, description: 'Sweet and savory sea salt caramel with melted milk chocolate truffle.' },
  { category: 'Mug Cakes', name: 'Strawberry Cheese Cream', price: 145, inStock: true, description: 'Tangy strawberry glaze and velvety cream cheese over warm sponge.' },
  { category: 'Mug Cakes', name: 'Black Forest', price: 145, inStock: true, description: 'Dark chocolate cake with juicy red cherries and snowy whipped cream.' },
  { category: 'Mug Cakes', name: 'White Chocolate Fantasy', price: 145, inStock: true, description: 'Silky warm white chocolate ganache with vanilla cake crumb.' },
  { category: 'Mug Cakes', name: 'Cookies and Cream', price: 145, inStock: true, description: 'Loaded with crunchy cookie bits and melted sweet cream.' },
  { category: 'Mug Cakes', name: 'Mug Cake with Ice Cream', price: 165, inStock: true, description: 'Hot freshly baked mug cake paired with cold gourmet ice cream.' },
  { category: 'Mug Cakes', name: 'Nutella Overload', price: 165, inStock: true, description: 'Gooey hazelnut Nutella spread oozing generously from warm chocolate sponge.' },

  // Desserts
  { category: 'Desserts', name: 'Cakes (starting)', price: 295, inStock: true, description: 'Freshly baked celebratory whole cakes available in assorted gourmet flavors.' },
  { category: 'Desserts', name: 'Photo Cake', price: 950, inStock: true, description: 'Personalized edible high-definition printed photo cake for special occasions.' },
  { category: 'Desserts', name: 'Shape Cake', price: 850, inStock: true, description: 'Hand-crafted themed shape cake sculpted by our master bakers.' },
  { category: 'Desserts', name: '3D Custom Cake', price: 1500, inStock: true, description: 'Stunning tiered 3D sculpted designer fondant showpiece cake.' },
  { category: 'Desserts', name: 'Cup Cakes', price: 25, inStock: true, description: 'Delightful bite-sized cupcakes frosted with sweet buttercream.' },
  { category: 'Desserts', name: 'Pastry', price: 85, inStock: true, description: 'Slice of our signature multi-layered fresh cream sponge pastry.' },
  { category: 'Desserts', name: 'Donut (Buy 1 Get 1 Free)', price: 80, inStock: true, description: 'Soft glazed ring donuts with assorted chocolate and sprinkle toppings. BOGO Offer!' },
  { category: 'Desserts', name: 'Muffin', price: 55, inStock: true, description: 'Golden baked muffin studded with chocolate chips and berries.' },
  { category: 'Desserts', name: 'Cheese Cake', price: 55, inStock: true, description: 'New York style velvety cheesecake on a crumbly buttery biscuit crust.' },
  { category: 'Desserts', name: 'Brownie', price: 80, inStock: true, description: 'Rich, dense, and fudgy Belgian chocolate walnut brownie.' },
  { category: 'Desserts', name: 'Chocolate Pizza', price: 199, inStock: true, description: 'Crisp crust covered in melted Nutella, marshmallows, and chocolate flakes.' },
  { category: 'Desserts', name: 'Macarons', price: 39, inStock: true, description: 'Delicate French almond meringue cookies with luscious ganache fillings.' },
  { category: 'Desserts', name: 'Tart', price: 49, inStock: true, description: 'Buttery shortcrust pastry shell filled with decadent cream and fruit.' },
  { category: 'Desserts', name: 'Waffle Cake', price: 49, inStock: true, description: 'Crispy Belgian waffle layers filled with warm melted chocolate sauce.' },
  { category: 'Desserts', name: 'Lava Cake', price: 45, inStock: true, description: 'Warm individual chocolate cake with a molten liquid chocolate center.' },
  { category: 'Desserts', name: 'Edible Mousse Cup', price: 49, inStock: true, description: 'Crisp edible chocolate cup filled with light, airy chocolate mousse.' },

  // Burgers
  { category: 'Burgers', name: 'Veggie Burger with French Fries', price: 135, inStock: true, description: 'Crispy spiced vegetable patty topped with lettuce, mayo, and served with golden fries.' },
  { category: 'Burgers', name: 'Potato Cheese Blast Burger with French Fries', price: 165, inStock: true, description: 'Molten cheese-filled potato patty that oozes savory goodness on first bite.' },
  { category: 'Burgers', name: 'Double Patty Mega Burger with French Fries', price: 250, inStock: true, description: 'Two hearty patties layered with double cheese, special sauce, and crisp veggies.' },

  // Pizza
  { category: 'Pizza', name: 'Margarita', price: 150, inStock: true, description: 'Classic Italian pizza with aromatic basil, tomato sauce, and mozzarella.' },
  { category: 'Pizza', name: 'Veggie Lover', price: 175, inStock: true, description: 'Loaded with bell peppers, sweet corn, mushrooms, olives, and onions.' },
  { category: 'Pizza', name: 'Indo Masala Paneer', price: 195, inStock: true, description: 'Spiced tandoori marinated paneer cubes with onions, capsicum, and herbs.' },
  { category: 'Pizza', name: 'Makhani Italian', price: 195, inStock: true, description: 'Creamy butter makhani gravy base topped with cheese and savory veggies.' },
  { category: 'Pizza', name: 'Hawaiin', price: 195, inStock: true, description: 'Sweet juicy pineapple chunks paired with cheese and tangy tomato sauce.' },

  // Pasta
  { category: 'Pasta', name: 'Arrabiata', price: 190, inStock: true, description: 'Penne tossed in fiery spicy tomato, garlic, and red chili herb sauce.' },
  { category: 'Pasta', name: 'Alfredo', price: 220, inStock: true, description: 'Silky rich white sauce pasta infused with butter, cream, and parmesan cheese.' },
  { category: 'Pasta', name: 'Tomato Cream', price: 190, inStock: true, description: 'Pink pasta combining tangy Italian tomato sauce with luscious creamy cheese.' },

  // Sides
  { category: 'Sides', name: 'Garlic Bread', price: 99, inStock: true, description: 'Toasted baguette slices brushed with fragrant garlic herb butter.' },
  { category: 'Sides', name: 'Garlic Bread with Cheese', price: 130, inStock: true, description: 'Warm garlic baguette topped with melted bubbling mozzarella cheese.' },
  { category: 'Sides', name: 'Open Italian Cheese Toast', price: 130, inStock: true, description: 'Artisanal bread toasted with Italian herbs, spices, and melted cheese.' },
  { category: 'Sides', name: 'Tomato Caper Bruschetta', price: 145, inStock: true, description: 'Toasted ciabatta topped with diced tomatoes, capers, basil, and olive oil.' },

  // Veg. Hotdog
  { category: 'Veg. Hotdog', name: 'Saucy Veg Hot Dog', price: 99, inStock: true, description: 'Juicy spiced vegetable sausage tucked in a soft bun with tangy house sauces.' },
  { category: 'Veg. Hotdog', name: 'Paneer Hot Dog', price: 120, inStock: true, description: 'Marinated cottage cheese finger grilled and dressed with savory sauces.' },
  { category: 'Veg. Hotdog', name: 'Mushroom Hot Dog', price: 120, inStock: true, description: 'Sauteed button mushrooms tossed with herbs in a warm toasted hot dog bun.' },

  // Between the Breads
  { category: 'Between the Breads', name: 'Vegetable Cheese Grilled Sandwich', price: 120, inStock: true, description: 'Layered fresh cucumbers, tomatoes, bell peppers, and cheese grilled crisp.' },
  { category: 'Between the Breads', name: 'Mumbai Se Aya Mera Toast', price: 80, inStock: true, description: 'Famous Mumbai street-style spiced potato masala toast with green chutney.' },
  { category: 'Between the Breads', name: 'Cheese and Chilly Toast', price: 90, inStock: true, description: 'Toasted bread topped with spicy green chilies and gooey melted cheddar.' },
  { category: 'Between the Breads', name: 'Heavenly Nutella Toast', price: 120, inStock: true, description: 'Thick brioche toast generously slathered with warm hazelnut Nutella.' },
  { category: 'Between the Breads', name: 'Spicy BBQ Sandwich', price: 90, inStock: true, description: 'Smoky barbecue sauce glazed vegetables pressed in buttered sandwich bread.' },
  { category: 'Between the Breads', name: 'Paneer Toast', price: 95, inStock: true, description: 'Crisp golden toast topped with spiced cottage cheese crumble.' },
  { category: 'Between the Breads', name: 'Pizza Sandwich', price: 99, inStock: true, description: 'Pizza toppings and mozzarella cheese stuffed into a toasted grilled sandwich.' },

  // Soups
  { category: 'Soups', name: 'Cream of Tomato', price: 110, inStock: true, description: 'Smooth, rich tomato soup topped with fresh cream and crispy croutons.' },
  { category: 'Soups', name: 'Manchow', price: 130, inStock: true, description: 'Indo-Chinese dark soup with chopped vegetables, garlic, and crispy noodles.' },
  { category: 'Soups', name: 'Sweet Corn', price: 110, inStock: true, description: 'Comforting warm soup loaded with sweet American corn kernels.' },

  // Starters
  { category: 'Starters', name: 'Cheese Corn Balls', price: 120, inStock: true, description: 'Golden crispy crumbed balls oozing with sweet corn and melted cheese.' },
  { category: 'Starters', name: 'Hot Cheesy Vegetable Logs', price: 140, inStock: true, description: 'Crunchy fried logs stuffed with cheesy mixed vegetable filling.' },
  { category: 'Starters', name: 'Cheesy French Fries and Wedges Duo', price: 140, inStock: true, description: 'Combo basket of seasoned fries and potato wedges drenched in warm cheese.' },
  { category: 'Starters', name: 'Classic Salted French Fries', price: 99, inStock: true, description: 'Crisp golden potato fries lightly tossed in sea salt.' },
  { category: 'Starters', name: 'Herbed Potato Wedges', price: 99, inStock: true, description: 'Chunky rustic potato wedges coated in rosemary, garlic, and thyme.' },
  { category: 'Starters', name: 'Nachos with Cheese', price: 199, inStock: true, description: 'Crunchy tortilla chips served with warm melted nacho cheese sauce and salsa.' },
  { category: 'Starters', name: 'Kung Pao Potatoes', price: 199, inStock: true, description: 'Crisp potato fingers tossed in spicy Kung Pao chili peanut sauce.' },
  { category: 'Starters', name: 'Barbecue Paneer Satay', price: 210, inStock: true, description: 'Skewered grilled paneer cubes glazed with rich smoky barbecue sauce.' },
  { category: 'Starters', name: 'Indo Chinese Paneer Chilly', price: 195, inStock: true, description: 'Crispy paneer cubes wok-tossed with green chilies, onions, and capsicum.' },
  { category: 'Starters', name: 'Manchurian', price: 175, inStock: true, description: 'Crisp fried veggie dumplings tossed in savory garlic soy Manchurian sauce.' },

  // Main Course
  { category: 'Main Course', name: 'Fried Rice', price: 150, inStock: true, description: 'Wok-tossed long grain basmati rice with crunchy diced vegetables and spices.' },
  { category: 'Main Course', name: 'Hakka Noodles', price: 165, inStock: true, description: 'Classic stir-fried noodles with crisp julienned vegetables and soy seasoning.' },
  { category: 'Main Course', name: 'Manchurian in Gravy', price: 195, inStock: true, description: 'Golden vegetable dumplings simmered in rich aromatic Chinese brown gravy.' },
  { category: 'Main Course', name: 'Paneer Chilly in Gravy', price: 195, inStock: true, description: 'Tender paneer cubes cooked in a savory, spicy Indo-Chinese chili gravy.' },

  // Some Wholesome Meals
  { category: 'Some Wholesome Meals', name: 'Chinese Sizzler', price: 299, inStock: true, description: 'Starter, Hakka Noodles, Fried Rice & Gravy all served on a sizzling hot plate.' },
  { category: 'Some Wholesome Meals', name: 'A Hot Mess', price: 195, inStock: true, description: 'Szechwan Fried Rice topped generously with Manchurian Gravy.' },
  { category: 'Some Wholesome Meals', name: 'Tangy Pan Fried Noodles', price: 195, inStock: true, description: 'Crispy noodles topped with tangy sweet and sour vegetable gravy.' },
  { category: 'Some Wholesome Meals', name: 'Paneer Butter Garlic Melt Combo', price: 210, inStock: true, description: 'Choice of Rice or Noodles with rich paneer butter garlic melt gravy.' }
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

    console.log(`Adding ${fullMenu.length} fresh menu items...`);
    for (const item of fullMenu) {
      await addDoc(menuCol, item);
      console.log(`Added: [${item.category}] ${item.name} - ₹${item.price}`);
    }
    console.log('Successfully updated the complete menu!');
    process.exit(0);
  } catch (err) {
    console.error('Error populating menu:', err);
    process.exit(1);
  }
}

populate();
