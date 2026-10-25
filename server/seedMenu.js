import 'dotenv/config';
import mongoose from 'mongoose';
import Food from './models/Food.js';

const menuItems = [
  ['Hotsilog', 'Savory hotdogs, garlic rice, and a sunny-side-up egg.', 'Sulit Meals', 95, 'Hotsilog.jpeg'],
  ['Fried Chicken Rice Meal', 'Crispy fried chicken with rice and savory gravy.', 'Sulit Meals', 120, 'Fried Chicken Rice Meal.jpeg'],
  ['Sisig Rice Meal', 'A sizzling pork sisig pairing with warm rice and egg.', 'Sulit Meals', 125, 'Sisig Rice Meal.jpeg'],
  ['Tocilog', 'Cured beef tocino, garlic rice, and a golden egg.', 'Sulit Meals', 110, 'Tocilog.jpeg'],
  ['Spamsilog', 'Classic spam with garlic rice and a perfectly fried egg.', 'Sulit Meals', 115, 'Spamsilog.jpeg'],
  ['Pork Giniling Rice Meal', 'Hearty minced pork in tomato sauce with a side of rice.', 'Sulit Meals', 105, 'Pork Giniling Rice Meal.jpeg'],
  ['Bicol Express', 'Spicy pork and coconut stew with a rich, savory finish.', 'Ulam', 165, 'Bicol Express.jpeg'],
  ['Chicken Adobo', 'Tender chicken marinated in soy sauce, vinegar, and garlic.', 'Ulam', 170, 'Chicken Adobo.jpeg'],
  ['Lumpiang Shanghai', 'Crispy rolls filled with seasoned meat and vegetables.', 'Ulam', 140, 'Lumpiang Shanghai.jpeg'],
  ['Pancit', 'Noodles tossed with vegetables, shrimp, and savory sauce.', 'Ulam', 150, 'Pancit.jpeg'],
  ['Pork Adobo', 'Slow-cooked pork in a bold soy-vinegar glaze.', 'Ulam', 175, 'Pork Adobo.jpeg'],
  ['Pork Menudo', 'A colorful tomato-based pork stew with potatoes and carrots.', 'Ulam', 180, 'Pork Menudo.jpeg'],
  ['Pork Sinigang', 'Classic pork sinigang with fresh vegetables in tamarind broth.', 'Ulam', 185, 'Pork Sinigang.jpeg'],
  ['Porky Belly Kare-Kare', 'Crispy pork belly in rich peanut sauce with vegetables.', 'Ulam', 200, 'Porky Belly Kare-Kare.jpeg'],
  ['Sinigang na Bangus', 'Milkfish simmered in tangy tamarind broth with greens.', 'Ulam', 190, 'Sinigang na Bangus.jpeg'],
  ['Tortang Talong', 'Grilled eggplant omelet with a smoky, savory finish.', 'Ulam', 135, 'Tortang Talong.jpeg'],
  ['Bibingka', 'Warm rice cake with a toasted, buttery top and coconut flavor.', 'Merienda', 60, 'Bibingka.jpeg'],
  ['Buchi', 'Golden sesame-coated fried dough filled with sweet bean paste.', 'Merienda', 55, 'Buchi.jpg.webp'],
  ['Empanada', 'Crispy pastry pockets filled with savory beef and veggies.', 'Merienda', 70, 'Empanada.jpeg'],
  ['Moron', 'Sticky rice dessert wrapped in banana leaves with caramel notes.', 'Merienda', 65, 'Moron.jpeg'],
  ['Puto Cheese', 'Soft steamed rice cakes topped with a rich cheese finish.', 'Merienda', 50, 'Puto Cheese.jpeg'],
  ['Turon', 'Crispy banana spring rolls glazed with caramel syrup.', 'Merienda', 45, 'Turon.jpeg'],
  ['Buko Pandan', 'Creamy coconut pandan dessert with chewy jelly bites.', 'Dessert', 90, 'Buko Pandan.jpeg'],
  ['Buko Pie', 'Buttery pie filled with creamy young coconut and custard.', 'Dessert', 120, 'Buko Pie.jpeg'],
  ['Cassava Cake', 'Sweet and chewy cassava cake with a golden coconut topping.', 'Dessert', 110, 'Cassava Cake.jpeg'],
  ['Halo-Halo', 'A colorful mix of shaved ice, fruits, beans, and toppings.', 'Dessert', 95, 'Halo-Halo.jpeg'],
  ['Leche Flan', 'Silky caramel custard with a smooth, rich vanilla taste.', 'Dessert', 100, 'Leche Flan.jpeg'],
  ['Maja Blanca', 'Creamy coconut pudding topped with sweet corn and toasted coconut.', 'Dessert', 85, 'Maja Blanca.jpeg'],
  ['Mango Float', 'Chilled layered dessert with cream, biscuits, and mangoes.', 'Dessert', 125, 'Mango Float.jpeg'],
  ['Tiramisu', 'Classic coffee mascarpone dessert with a decadent finish.', 'Dessert', 130, 'Tiramisu.jpeg']
].map(([name, description, category, price, image]) => ({
  name,
  description,
  category,
  price,
  imageUrl: `/menu/${image}`,
  available: true
}));

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodease_ni_rene');
  const existingCount = await Food.countDocuments();
  if (existingCount > 0) {
    console.log(`Menu seed skipped: ${existingCount} food item(s) already exist.`);
  } else {
    const inserted = await Food.insertMany(menuItems);
    console.log(`Seeded ${inserted.length} starter menu items.`);
  }
} catch (error) {
  console.error('Menu seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
