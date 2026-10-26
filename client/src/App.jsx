import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const menuItems = [
  { _id: 'hotsilog', name: 'Hotsilog', description: 'Savory hotdogs, garlic rice, and a sunny-side-up egg.', category: 'Sulit Meals', price: 95, available: true, imageUrl: '/menu/Hotsilog.jpeg' },
  { _id: 'fried-chicken-rice-meal', name: 'Fried Chicken Rice Meal', description: 'Crispy fried chicken with rice and savory gravy.', category: 'Sulit Meals', price: 120, available: true, imageUrl: '/menu/Fried Chicken Rice Meal.jpeg' },
  { _id: 'sisig-rice-meal', name: 'Sisig Rice Meal', description: 'A sizzling pork sisig pairing with warm rice and egg.', category: 'Sulit Meals', price: 125, available: true, imageUrl: '/menu/Sisig Rice Meal.jpeg' },
  { _id: 'tocilog', name: 'Tocilog', description: 'Cured beef tocino, garlic rice, and a golden egg.', category: 'Sulit Meals', price: 110, available: true, imageUrl: '/menu/Tocilog.jpeg' },
  { _id: 'spamsilog', name: 'Spamsilog', description: 'Classic spam with garlic rice and a perfectly fried egg.', category: 'Sulit Meals', price: 115, available: true, imageUrl: '/menu/Spamsilog.jpeg' },
  { _id: 'pork-giniling-rice-meal', name: 'Pork Giniling Rice Meal', description: 'Hearty minced pork in tomato sauce with a side of rice.', category: 'Sulit Meals', price: 105, available: true, imageUrl: '/menu/Pork Giniling Rice Meal.jpeg' },
  { _id: 'bicol-express', name: 'Bicol Express', description: 'Spicy pork and coconut stew with a rich, savory finish.', category: 'Ulam', price: 165, available: true, imageUrl: '/menu/Bicol Express.jpeg' },
  { _id: 'chicken-adobo', name: 'Chicken Adobo', description: 'Tender chicken marinated in soy sauce, vinegar, and garlic.', category: 'Ulam', price: 170, available: true, imageUrl: '/menu/Chicken Adobo.jpeg' },
  { _id: 'lumpiang-shanghai', name: 'Lumpiang Shanghai', description: 'Crispy rolls filled with seasoned meat and vegetables.', category: 'Ulam', price: 140, available: true, imageUrl: '/menu/Lumpiang Shanghai.jpeg' },
  { _id: 'pancit', name: 'Pancit', description: 'Noodles tossed with vegetables, shrimp, and savory sauce.', category: 'Ulam', price: 150, available: true, imageUrl: '/menu/Pancit.jpeg' },
  { _id: 'pork-adobo', name: 'Pork Adobo', description: 'Slow-cooked pork in a bold soy-vinegar glaze.', category: 'Ulam', price: 175, available: true, imageUrl: '/menu/Pork Adobo.jpeg' },
  { _id: 'pork-menudo', name: 'Pork Menudo', description: 'A colorful tomato-based pork stew with potatoes and carrots.', category: 'Ulam', price: 180, available: true, imageUrl: '/menu/Pork Menudo.jpeg' },
  { _id: 'pork-sinigang', name: 'Pork Sinigang', description: 'Classic pork sinigang with fresh vegetables in tamarind broth.', category: 'Ulam', price: 185, available: true, imageUrl: '/menu/Pork Sinigang.jpeg' },
  { _id: 'porky-belly-kare-kare', name: 'Porky Belly Kare-Kare', description: 'Crispy pork belly in rich peanut sauce with vegetables.', category: 'Ulam', price: 200, available: true, imageUrl: '/menu/Porky Belly Kare-Kare.jpeg' },
  { _id: 'sinigang-na-bangus', name: 'Sinigang na Bangus', description: 'Milkfish simmered in tangy tamarind broth with greens.', category: 'Ulam', price: 190, available: true, imageUrl: '/menu/Sinigang na Bangus.jpeg' },
  { _id: 'tortang-talong', name: 'Tortang Talong', description: 'Grilled eggplant omelet with a smoky, savory finish.', category: 'Ulam', price: 135, available: true, imageUrl: '/menu/Tortang Talong.jpeg' },
  { _id: 'bibingka', name: 'Bibingka', description: 'Warm rice cake with a toasted, buttery top and coconut flavor.', category: 'Merienda', price: 60, available: true, imageUrl: '/menu/Bibingka.jpeg' },
  { _id: 'buchi', name: 'Buchi', description: 'Golden sesame-coated fried dough filled with sweet bean paste.', category: 'Merienda', price: 55, available: true, imageUrl: '/menu/Buchi.jpg.webp' },
  { _id: 'empanada', name: 'Empanada', description: 'Crispy pastry pockets filled with savory beef and veggies.', category: 'Merienda', price: 70, available: true, imageUrl: '/menu/Empanada.jpeg' },
  { _id: 'moron', name: 'Moron', description: 'Sticky rice dessert wrapped in banana leaves with caramel notes.', category: 'Merienda', price: 65, available: true, imageUrl: '/menu/Moron.jpeg' },
  { _id: 'puto-cheese', name: 'Puto Cheese', description: 'Soft steamed rice cakes topped with a rich cheese finish.', category: 'Merienda', price: 50, available: true, imageUrl: '/menu/Puto Cheese.jpeg' },
  { _id: 'turon', name: 'Turon', description: 'Crispy banana spring rolls glazed with caramel syrup.', category: 'Merienda', price: 45, available: true, imageUrl: '/menu/Turon.jpeg' },
  { _id: 'buko-pandan', name: 'Buko Pandan', description: 'Creamy coconut pandan dessert with chewy jelly bites.', category: 'Dessert', price: 90, available: true, imageUrl: '/menu/Buko Pandan.jpeg' },
  { _id: 'buko-pie', name: 'Buko Pie', description: 'Buttery pie filled with creamy young coconut and custard.', category: 'Dessert', price: 120, available: true, imageUrl: '/menu/Buko Pie.jpeg' },
  { _id: 'cassava-cake', name: 'Cassava Cake', description: 'Sweet and chewy cassava cake with a golden coconut topping.', category: 'Dessert', price: 110, available: true, imageUrl: '/menu/Cassava Cake.jpeg' },
  { _id: 'halo-halo', name: 'Halo-Halo', description: 'A colorful mix of shaved ice, fruits, beans, and toppings.', category: 'Dessert', price: 95, available: true, imageUrl: '/menu/Halo-Halo.jpeg' },
  { _id: 'leche-flan', name: 'Leche Flan', description: 'Silky caramel custard with a smooth, rich vanilla taste.', category: 'Dessert', price: 100, available: true, imageUrl: '/menu/Leche Flan.jpeg' },
  { _id: 'maja-blanca', name: 'Maja Blanca', description: 'Creamy coconut pudding topped with sweet corn and toasted coconut.', category: 'Dessert', price: 85, available: true, imageUrl: '/menu/Maja Blanca.jpeg' },
  { _id: 'mango-float', name: 'Mango Float', description: 'Chilled layered dessert with cream, biscuits, and mangoes.', category: 'Dessert', price: 125, available: true, imageUrl: '/menu/Mango Float.jpeg' },
  { _id: 'tiramisu', name: 'Tiramisu', description: 'Classic coffee mascarpone dessert with a decadent finish.', category: 'Dessert', price: 130, available: true, imageUrl: '/menu/Tiramisu.jpeg' }
];

const foodPhotos = menuItems.map(item => item.imageUrl);
const sample = menuItems.map((food, index) => ({ ...food, imageUrl: food.imageUrl || foodPhotos[index] }));
const defaultStoreProfile = {
  branchName: 'FoodEase · Mambajao Branch',
  address: 'Mambajao, Maasin City, Southern Leyte',
  businessHours: 'Monday–Saturday · 8:30 AM–10:00 PM',
  phone: '0909 989 2812'
};

const peso = value => '₱' + Number(value || 0).toFixed(2);
const empty = { name: '', description: '', category: 'Main Course', price: '', imageUrl: '', available: true };
const chatLabels = {
  en: {
    title: 'Kain-Bot',
    subtitle: 'Your friendly FoodEase food guide',
    greeting: "Kumusta! I'm Kain-Bot. Ask me about the menu, prices, budget picks, or tasty pairings. Kain-tayo!",
    input: 'Ask Kain-Bot about food...',
    send: 'Send',
    suggestions: ['₱150 budget picks', 'Suggest a pairing', 'Show me the menu'],
    questions: ['What can I get with a ₱150 budget?', 'What dessert goes with Chicken Adobo?', 'What dishes are on the menu?']
  },
  tagalog: {
    title: 'Kain-Bot',
    subtitle: 'Kaibigang gabay sa menu ng FoodEase',
    greeting: 'Kumusta! Ako si Kain-Bot. Magtanong tungkol sa menu, presyo, pasok sa budget, o masarap na pares. Kain-tayo!',
    input: 'Magtanong kay Kain-Bot...',
    send: 'Ipadala',
    suggestions: ['₱150 na budget', 'Magmungkahi ng pares', 'Ipakita ang menu'],
    questions: ['Ano ang mabibili sa ₱150?', 'Anong dessert ang bagay sa Chicken Adobo?', 'Ano ang nasa menu?']
  },
  bisaya: {
    title: 'Kain-Bot',
    subtitle: 'Maalamong giya sa menu sa FoodEase',
    greeting: 'Maayong adlaw! Ako si Kain-Bot. Pangutana bahin sa menu, presyo, budget, o lamian nga pares. Kain-tayo!',
    input: 'Pangutana kang Kain-Bot...',
    send: 'Ipadala',
    suggestions: ['₱150 nga budget', 'Sugyot og pares', 'Ipakita ang menu'],
    questions: ['Unsa may mapalit sa ₱150?', 'Unsa nga dessert ang pares sa Chicken Adobo?', 'Unsa ang naa sa menu?']
  }
};

export default function App() {
  const [foods, setFoods] = useState(sample);
  const [demo, setDemo] = useState(false);
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [menuQuantities, setMenuQuantities] = useState({});
  const [msg, setMsg] = useState('');
  const [checkout, setCheckout] = useState(false);
  const [customer, setCustomer] = useState({ customerName: '', phone: '', fulfillment: 'pickup', address: '' });
  const [admin, setAdmin] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem('food-token') || '');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('food-theme') === 'dark');
  const [rememberLogin, setRememberLogin] = useState(() => localStorage.getItem('food-admin-remember') === 'true');
  const [credentials, setCredentials] = useState(() => ({
    username: localStorage.getItem('food-admin-username') || '',
    password: ''
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoginNotice, setAdminLoginNotice] = useState('');
  const [tab, setTab] = useState('foods');
  const [orders, setOrders] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState('All categories');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All statuses');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('All payment methods');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [storeProfile, setStoreProfile] = useState(defaultStoreProfile);
  const [profileDraft, setProfileDraft] = useState(defaultStoreProfile);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [form, setForm] = useState(empty);
  const [edit, setEdit] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLanguage, setChatLanguage] = useState('auto');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ from: 'bot', text: chatLabels.en.greeting }]);
  const filteredOrders = useMemo(() => orders.filter(order => {
    const search = orderSearch.trim().toLowerCase();
    const matchesSearch = !search || [
      order._id,
      order.customerName,
      order.phone,
      ...order.items.map(item => item.name)
    ].some(value => String(value || '').toLowerCase().includes(search));
    const matchesStatus = orderStatusFilter === 'All statuses' || order.status === orderStatusFilter;
    const matchesPayment = orderPaymentFilter === 'All payment methods'
      || (order.paymentMethod || 'cash').toLowerCase() === orderPaymentFilter.toLowerCase();
    const createdAt = new Date(order.createdAt);
    const orderDate = Number.isNaN(createdAt.getTime()) ? '' : createdAt.toISOString().slice(0, 10);
    const matchesDate = (!orderDateFrom || orderDate >= orderDateFrom)
      && (!orderDateTo || orderDate <= orderDateTo);
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  }), [orders, orderSearch, orderStatusFilter, orderPaymentFilter, orderDateFrom, orderDateTo]);
  const getOrderItemImage = item => item.imageUrl
    || foods.find(food => String(food._id) === String(item.foodId))?.imageUrl
    || menuItems.find(food => food.name.toLowerCase() === String(item.name || '').toLowerCase())?.imageUrl
    || foodPhotos[0];

  async function load() {
    try {
      setFoods(await api('/foods?includeUnavailable=' + Boolean(token)));
      setDemo(false);
    } catch {
      setFoods(sample);
      setDemo(true);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!admin && !checkout && !mobileMenuOpen && !chatOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setAdmin(false);
        setCheckout(false);
        setMobileMenuOpen(false);
        setChatOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [admin, checkout, mobileMenuOpen, chatOpen]);

  const cats = useMemo(
    () => ['All', ...new Set(foods.map(food => food.category))],
    [foods]
  );

const availableFoods = foods.filter(food => food.available);


  const sulitMeals = [...availableFoods]
    .filter(food => food.category === 'Sulit Meals')
    .sort((first, second) => Number(first.price) - Number(second.price));
  const visible = foods.filter(food =>
    (token || food.available) &&
    (category === 'All' || food.category === category)
  );
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const chatCopy = chatLabels[chatLanguage === 'auto' ? 'en' : chatLanguage];

  function changeChatLanguage(language) {
    setChatLanguage(language);
    if (chatMessages.length === 1) {
      setChatMessages([{ from: 'bot', text: chatLabels[language === 'auto' ? 'en' : language].greeting }]);
    }
  }

  function detectChatLanguage(question) {
    const query = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/\b(unsa|unsay|pila|naa|asa|unsaon|palihug|karon|salamat|lamian|kaayo|gihapon|ninyo|moy|aduna)\b/.test(query)) return 'bisaya';
    if (/\b(ano|anong|magkano|saan|paano|kailan|bakit|po|kayo|siya|ba|wala|meron|pabili|salamat|masarap|may|ninyo|gusto|pwede|para)\b/.test(query)) return 'tagalog';
    return 'english';
  }

  function getChatAnswer(question) {
    const query = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s₱]/g, ' ');
    const language = chatLanguage === 'auto' ? detectChatLanguage(question) : chatLanguage;
    const matchedFood = foods.find(food => query.includes(food.name.toLowerCase()));
    const budgetIntent = /(budget|under|below|within|around|spend|limit|for ₱|for php|may ₱|sa halagang|budget ko|budget nako|only have|got)\b/i.test(question)
      || /\bfor\s+(?:₱\s*)?\d/i.test(question);
    const currencyBudget = question.match(/(?:₱|php\s*)(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:php|pesos?|peso)\b/i);
    const plainBudget = budgetIntent ? question.match(/\b(\d+(?:\.\d{1,2})?)\b/) : null;
    const budget = currencyBudget
      ? Number(currencyBudget[1] || currencyBudget[2])
      : plainBudget
        ? Number(plainBudget[1])
        : null;
    const pairingIntent = /(pair|pairing|go with|goes with|match|combination|dessert|panghimagas|pares|ipares|partner|what.*with|unsa.*pares|bagay sa)/i.test(question);

    if (/(what languages|which languages|languages.*speak|language.*support|unsang pinulongan|unsa nga pinulongan|anong wika|anong lengguwahe|what language|tagalog|bisaya|cebuano|english)/.test(query)) {
      if (language === 'tagalog') return 'Nakakausap kita sa English, Tagalog, o Bisaya. Piliin ang wika sa menu sa itaas.';
      if (language === 'bisaya') return 'Makig-istorya ko nimo sa English, Tagalog, o Bisaya. Pilia ang pinulongan sa menu sa ibabaw.';
      return 'I can chat in English, Tagalog, or Bisaya. Choose your preferred language from the menu above.';
    }

    if (budget !== null && Number.isFinite(budget)) {
      const mealItems = availableFoods.filter(food => food.category === 'Sulit Meals');
      const sides = availableFoods.filter(food => food.category === 'Merienda' || food.category === 'Dessert');
      const pairings = mealItems.flatMap(meal => sides
        .map(side => ({ meal, side, total: Number(meal.price) + Number(side.price) }))
        .filter(pair => pair.total <= budget))
        .sort((first, second) => second.total - first.total);
      const mealPicks = mealItems
        .filter(food => Number(food.price) <= budget)
        .sort((first, second) => Number(second.price) - Number(first.price))
        .slice(0, 2);

      if (language === 'tagalog') {
        const options = [
          ...pairings.slice(0, 2).map(pair => `• ${pair.meal.name} + ${pair.side.name} — ${peso(pair.total)}`),
          ...mealPicks.map(food => `• ${food.name} — ${peso(food.price)}`)
        ];
        if (options.length) return `Sulit picks sa budget na ${peso(budget)}:\n${[...new Set(options)].join('\n')}\nKain-tayo!`;
        const cheapest = mealItems.sort((first, second) => Number(first.price) - Number(second.price))[0];
        return cheapest ? `Wala pang Sulit Meal na pasok sa ${peso(budget)}. Pinakamalapit na option: ${cheapest.name} — ${peso(cheapest.price)}.` : 'Wala akong makitang available na Sulit Meals ngayon. Subukan ulit mamaya.';
      }
      if (language === 'bisaya') {
        const options = [
          ...pairings.slice(0, 2).map(pair => `• ${pair.meal.name} + ${pair.side.name} — ${peso(pair.total)}`),
          ...mealPicks.map(food => `• ${food.name} — ${peso(food.price)}`)
        ];
        if (options.length) return `Sulit nga mga kapilian sulod sa ${peso(budget)}:\n${[...new Set(options)].join('\n')}\nKain-tayo!`;
        const cheapest = mealItems.sort((first, second) => Number(first.price) - Number(second.price))[0];
        return cheapest ? `Walay Sulit Meal nga masulod sa ${peso(budget)}. Pinakaduol nga kapilian: ${cheapest.name} — ${peso(cheapest.price)}.` : 'Wala koy makita nga available nga Sulit Meals karon. Sulayi pag-usab unya.';
      }

      const options = [
        ...pairings.slice(0, 2).map(pair => `• ${pair.meal.name} + ${pair.side.name} — ${peso(pair.total)}`),
        ...mealPicks.map(food => `• ${food.name} — ${peso(food.price)}`)
      ];
      if (options.length) return `Sulit picks within your ${peso(budget)} budget:\n${[...new Set(options)].join('\n')}\nKain-tayo!`;
      const cheapest = mealItems.sort((first, second) => Number(first.price) - Number(second.price))[0];
      return cheapest
        ? `I couldn't find a Sulit Meal within ${peso(budget)}. The closest option is ${cheapest.name} at ${peso(cheapest.price)}.`
        : 'I can’t see any available Sulit Meals right now. Please check back soon.';
    }

    if (/(drink|drinks|beverage|inumin|inom|ilumin)/.test(query)) {
      const desserts = availableFoods.filter(food => food.category === 'Dessert').slice(0, 2);
      const dessertNames = desserts.map(food => `${food.name} (${peso(food.price)})`).join(', ');
      if (language === 'tagalog') return `Wala pang inumin sa menu namin ngayon.${dessertNames ? ` Subukan ang ${dessertNames} bilang panghimagas.` : ''}`;
      if (language === 'bisaya') return `Wala pay ilimnon sa among menu karon.${dessertNames ? ` Sulayi ang ${dessertNames} isip dessert.` : ''}`;
      return `We don’t have drinks listed on the menu right now.${dessertNames ? ` You could try ${dessertNames} for dessert.` : ''}`;
    }

    if (matchedFood) {
      if (!matchedFood.available) {
        if (language === 'tagalog') return `${matchedFood.name} ay kasalukuyang hindi available. Maaari akong maghanap ng ibang putahe sa menu.`;
        if (language === 'bisaya') return `Dili available karon ang ${matchedFood.name}. Makapangita ko og laing pagkaon sa menu.`;
        return `${matchedFood.name} is currently unavailable. I can help you find another dish on the menu.`;
      }
      if (pairingIntent && matchedFood.category !== 'Dessert' && matchedFood.category !== 'Merienda') {
        const dessert = availableFoods
          .filter(food => food.category === 'Dessert')
          .sort((first, second) => Number(first.price) - Number(second.price))[0];
        if (dessert) {
          const total = Number(matchedFood.price) + Number(dessert.price);
          if (language === 'tagalog') return `Bagay ipares ang ${matchedFood.name} sa ${dessert.name} (${peso(dessert.price)}) para sa matamis na panghimagas. Kabuuan: ${peso(total)}.`;
          if (language === 'bisaya') return `Lami ipares ang ${matchedFood.name} sa ${dessert.name} (${peso(dessert.price)}). Kinatibuk-an: ${peso(total)}.`;
          return `Try ${matchedFood.name} with ${dessert.name} (${peso(dessert.price)}) for a sweet finish. Together: ${peso(total)}.`;
        }
      }
      if (language === 'tagalog') return `${matchedFood.name} (${matchedFood.category}) ay available sa halagang ${peso(matchedFood.price)}. ${matchedFood.description}`;
      if (language === 'bisaya') return `${matchedFood.name} (${matchedFood.category}) available sa kantidad nga ${peso(matchedFood.price)}. ${matchedFood.description}`;
      return `${matchedFood.name} (${matchedFood.category}) is available for ${peso(matchedFood.price)}. ${matchedFood.description}`;
    }

    if (/(price|cost|how much|presyo|magkano|pila|tagpila)/.test(query)) {
      if (language === 'tagalog') return 'Aling putahe ang gusto mong malaman ang presyo? Ibibigay ko ang kasalukuyang presyo mula sa menu.';
      if (language === 'bisaya') return 'Unsa nga pagkaon ang gusto nimong mahibal-an ang presyo? Isulti nako ang kasamtangang presyo sa menu.';
      return 'Which dish would you like the price for? I’ll check the current menu price.';
    }

    const requestedCategory = availableFoods.find(food => query.includes(food.category.toLowerCase()))?.category;
    if (requestedCategory || /(menu|dish|ulam|food|available|special|favorite|pagkaon|putahe|pagkain|meron|mayroon|lamian|unsay|unsa nga pagkaon|unsa inyo pagkaon|anong pagkain|anong ulam)/.test(query)) {
      const categories = requestedCategory ? [requestedCategory] : ['Sulit Meals', 'Ulam', 'Merienda', 'Dessert'];
      const items = categories.map(category => {
        const categoryFoods = availableFoods.filter(food => food.category === category);
        return categoryFoods.length
          ? `• ${category}: ${categoryFoods.map(food => `${food.name} ${peso(food.price)}`).join(' · ')}`
          : '';
      }).filter(Boolean).join('\n');
      if (!items) {
        if (language === 'tagalog') return 'Wala akong makitang available na pagkain ngayon. Makipag-ugnayan sa amin at tutulungan ka namin.';
        if (language === 'bisaya') return 'Wala koy makita nga available nga pagkaon karon. Palihug kontaka kami aron matabangan ka namo.';
        return 'I can’t see any available dishes right now. Please contact us and we’ll be happy to help.';
      }
      if (language === 'tagalog') return `Ito ang mga available sa menu:\n${items}\nKain-tayo!`;
      if (language === 'bisaya') return `Kini ang mga available sa menu:\n${items}\nKain-tayo!`;
      return `Here’s what’s available:\n${items}\nKain-tayo!`;
    }

    if (/(delivery|deliver|pickup|pick up|take away|fulfill|hatod|ihatid|padala|kuha|pick up|ipa deliver)/.test(query)) {
      if (language === 'tagalog') return 'May pickup at delivery. Idagdag ang pagkain sa cart, pumunta sa checkout, at piliin ang gusto mong paraan. Ilagay ang address para sa delivery. Makipag-ugnayan sa amin para makumpirma ang sakop at bayad sa delivery.';
      if (language === 'bisaya') return 'Adunay pickup ug delivery. Idugang ang pagkaon sa cart, adto sa checkout, ug pilia ang imong gusto. Isulod ang address para sa delivery. Kontaka kami aron makumpirma ang lugar nga ma-deliveran ug ang bayad.';
      return 'Pickup and delivery are available. Add dishes to your cart, continue to checkout, and choose your preferred option. For delivery, enter your address at checkout. Please contact us to confirm delivery coverage and any fees.';
    }
    if (/(order|checkout|pay|payment|cash|umorder|order|bayad|palit|pamalit|orderon)/.test(query)) {
      if (language === 'tagalog') return 'Para umorder, idagdag ang pagkain sa cart, buksan ang checkout, ilagay ang pangalan at numero ng telepono, at piliin ang pickup o delivery. Cash ang bayad sa pickup o delivery.';
      if (language === 'bisaya') return 'Para mo-order, idugang ang pagkaon sa cart, ablihi ang checkout, isulod ang imong ngalan ug numero sa telepono, ug pilia ang pickup o delivery. Cash ang bayad sa pickup o delivery.';
      return 'To order, add dishes to your cart, open checkout, enter your name and phone number, then choose pickup or delivery. Checkout currently offers cash on pickup or delivery.';
    }
    if (/(hour|open|close|time|location|address|where|oras|bukas|saan|nasaan|asa|lokasyon)/.test(query)) {
      if (language === 'tagalog') return 'Matatagpuan kami sa Mambajao, Maasin City, Southern Leyte. Bukas kami Lunes hanggang Sabado, 8:30 AM–10:00 PM. Tumawag sa 0909 989 2812 para makumpirma bago bumisita.';
      if (language === 'bisaya') return 'Naa kami sa Mambajao, Maasin City, Southern Leyte. Abli kami Lunes hangtod Sabado, 8:30 AM–10:00 PM. Tawag sa 0909 989 2812 aron makumpirma sa dili pa moanhi.';
      return 'We’re located in Mambajao, Maasin City, Southern Leyte. We’re open Monday to Saturday, 8:30 AM–10:00 PM. Call 0909 989 2812 to confirm before visiting.';
    }
    if (/(contact|phone|email|call|message|social|kontak|tawag|numero|telepono|contacto)/.test(query)) {
      if (language === 'tagalog') return 'Tawagan kami sa 0909 989 2812. Matatagpuan kami sa Mambajao, Maasin City, Southern Leyte. Nasa footer din ang aming mga social link.';
      if (language === 'bisaya') return 'Tawagi kami sa 0909 989 2812. Naa kami sa Mambajao, Maasin City, Southern Leyte. Makita usab ang among social links sa footer.';
      return 'Call us at 0909 989 2812. We’re located in Mambajao, Maasin City, Southern Leyte. You can also find our social links in the footer.';
    }
    if (pairingIntent) {
      if (language === 'tagalog') return 'Anong ulam o Sulit Meal ang gusto mong ipares? Maaari akong magmungkahi ng dessert mula sa menu.';
      if (language === 'bisaya') return 'Unsa nga ulam o Sulit Meal ang gusto nimong ipares? Makasugyot ko og dessert gikan sa menu.';
      return 'Which ulam or Sulit Meal would you like to pair? I can suggest a dessert from our menu.';
    }
    if (language === 'tagalog') return 'Matutulungan kita sa menu, presyo, budget picks, at masarap na pares. Ano ang gusto mong kainin?';
    if (language === 'bisaya') return 'Makatabang ko sa menu, presyo, budget picks, ug lamian nga pares. Unsa may imong gustong kan-on?';
    return 'I can help with the menu, current prices, budget picks, and tasty pairings. What are you craving?';
  }

  async function sendChat(question = chatInput) {
    const text = question.trim();
    if (!text || chatLoading) return;
    setChatMessages(messages => [...messages, { from: 'user', text }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const result = await api('/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: text,
          language: chatLanguage,
          history: chatMessages.slice(-8).map(message => ({
            role: message.from === 'bot' ? 'assistant' : 'user',
            content: message.text
          }))
        })
      });
      setChatMessages(messages => [...messages, { from: 'bot', text: result.answer }]);
    } catch (error) {
      const language = chatLanguage === 'auto' ? detectChatLanguage(text) : chatLanguage;
      const offlineNotice = language === 'tagalog'
        ? 'Hindi ko maabot ang live chat ngayon, pero matutulungan pa rin kita:\n'
        : language === 'bisaya'
          ? 'Dili nako maabot ang live chat karon, pero makatabang gihapon ko:\n'
          : 'I can’t reach the live chat service right now, but I can still help:\n';
      setChatMessages(messages => [
        ...messages,
        { from: 'bot', text: `${offlineNotice}${getChatAnswer(text)}` }
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  function add(food, quantity = 1) {
    setCart(items => items.some(item => item._id === food._id)
      ? items.map(item => item._id === food._id ? { ...item, quantity: item.quantity + quantity } : item)
      : [...items, { ...food, quantity }]);
    setMsg(`${quantity > 1 ? `${quantity} × ` : ''}${food.name} added to cart`);
  }

  function changeMenuQuantity(id, delta) {
    setMenuQuantities(quantities => ({
      ...quantities,
      [id]: Math.max(1, (quantities[id] || 1) + delta)
    }));
  }

  function qty(id, delta) {
    setCart(items => items
      .map(item => item._id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0));
  }

  async function place(event) {
    event.preventDefault();
    try {
      if (demo) throw Error('Start the backend and MongoDB before placing a real order.');
      const result = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({ ...customer, items: cart.map(item => ({ foodId: item._id, quantity: item.quantity })) })
      });
      setCart([]);
      setCheckout(false);
      setMsg('Order placed! Reference ' + result.order._id.slice(-6).toUpperCase());
    } catch (error) {
      setMsg(error.message);
    }
  }

  async function login(event) {
    event.preventDefault();
    setAdminLoginNotice('');
    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
      setToken(result.token);
      sessionStorage.setItem('food-token', result.token);
      if (rememberLogin) {
        localStorage.setItem('food-admin-remember', 'true');
        localStorage.setItem('food-admin-username', credentials.username);
      } else {
        localStorage.removeItem('food-admin-remember');
        localStorage.removeItem('food-admin-username');
      }
      setAdmin(true);
      setTab('overview');
      setCredentials({ username: rememberLogin ? credentials.username : '', password: '' });
      await Promise.all([load(), loadOrders(result.token)]);
      setMsg('Admin signed in');
    } catch (error) {
      setAdminLoginNotice(error.message === 'Invalid username or password.'
        ? 'Wrong username or password. Please check both and try again.'
        : error.message);
    }
  }

  async function save(event) {
    event.preventDefault();
    try {
      if (demo) throw Error('Connect MongoDB and start the server first.');
      await api(edit ? '/foods/' + edit : '/foods', {
        method: edit ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, price: Number(form.price) })
      }, token);
      setForm(empty);
      setEdit('');
      await load();
      setMsg('Menu item saved');
    } catch (error) {
      setMsg(error.message);
    }
  }

  async function remove(food) {
    if (!confirm('Delete ' + food.name + '?')) return;
    try {
      await api('/foods/' + food._id, { method: 'DELETE' }, token);
      await load();
    } catch (error) {
      setMsg(error.message);
    }
  }

  async function loadOrders(authToken = token) {
    try {
      setOrders(await api('/orders', {}, authToken));
    } catch (error) {
      setMsg(error.message);
    }
  }

  async function loadStoreProfile() {
    try {
      const profile = await api('/profile', {}, token);
      setStoreProfile(profile);
      setProfileDraft(profile);
    } catch (error) {
      setMsg(error.message);
    }
  }

  async function saveStoreProfile(event) {
    event.preventDefault();
    setProfileSaving(true);
    try {
      const profile = await api('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileDraft)
      }, token);
      setStoreProfile(profile);
      setProfileDraft(profile);
      setProfileEditing(false);
      setMsg('Store profile saved');
    } catch (error) {
      setMsg(error.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function status(order, nextStatus) {
    try {
      await api('/orders/' + order._id + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      }, token);
      loadOrders();
    } catch (error) {
      setMsg(error.message);
    }
  }

  function logout() {
    setToken('');
    sessionStorage.removeItem('food-token');
    setAdmin(false);
    setOrders([]);
    load();
  }

  function toggleTheme() {
    setDarkMode(current => {
      const next = !current;
      localStorage.setItem('food-theme', next ? 'dark' : 'light');
      return next;
    });
  }

  function showPhotoFallback(event) {
    event.currentTarget.hidden = true;
    const fallback = event.currentTarget.nextElementSibling;
    if (fallback?.classList.contains('photo-fallback')) fallback.hidden = false;
  }

  return (
    <div className={`shell${darkMode ? ' theme-dark' : ''}`} id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="FoodEase home">
          <img className="brand-logo" src="/foodease-logo.png" alt="" />
        </a>
        <div className="mobile-actions">
          <button className="theme-toggle mobile-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} aria-pressed={darkMode}>
            <span aria-hidden="true">{darkMode ? '☀' : '☾'}</span>
          </button>
          <button className="mobile-cart" aria-label={`Open cart with ${cartCount} items`} onClick={() => setCheckout(true)}>
            <span aria-hidden="true">🛒</span><small>{cartCount}</small>
          </button>
          <button
            className="menu-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setMobileMenuOpen(open => !open)}
          >
            <span /><span /><span />
          </button>
        </div>
        <nav id="main-navigation" className={`main-nav${mobileMenuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a className="active" href="#menu" onClick={() => setMobileMenuOpen(false)}>Menu</a>
          <a href="#sulit-meals" onClick={() => setMobileMenuOpen(false)}>Sulit-Meals</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <button className="theme-toggle desktop-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} aria-pressed={darkMode}>
            <span aria-hidden="true">{darkMode ? '☀' : '☾'}</span>{darkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <button className="admin-link" onClick={() => { setMobileMenuOpen(false); setAdmin(true); }}>{token ? 'Dashboard' : 'Admin'}</button>
          <button className="cart-icon" aria-label={`Open cart with ${cartCount} items`} onClick={() => { setMobileMenuOpen(false); setCheckout(true); }}>
            <span aria-hidden="true">🛒</span><small>{cartCount}</small>
          </button>
        </nav>
      </header>

      <section className="hero" aria-label="Welcome">
        <div className="hero-content">
          <span className="hero-kicker">FRESH · FILIPINO · MADE WITH HEART</span>
          <h1>Filipino Favorites Without the Extra Work</h1>
          <p>Comforting Filipino meals, freshly prepared and delivered to make your day a little easier.</p>
          <div className="hero-benefits" aria-label="FoodEase benefits">
            <span><b aria-hidden="true">♧</b><small>Filipino<br />Favorites</small></span>
            <span><b aria-hidden="true">♡</b><small>Made with<br />Care</small></span>
            <span><b aria-hidden="true">⌂</b><small>Pickup or<br />Delivery</small></span>
          </div>
          <a className="hero-button" href="#menu">Order now <span aria-hidden="true">→</span></a>
        </div>
      </section>

      {demo && <p className="banner">Preview mode: sample menu is showing. Start Express and MongoDB to save real orders and menu changes.</p>}

      <main className="page-content">
        <section id="sulit-meals" className="budget-section content-section" aria-labelledby="budget-title">
          <div className="budget-copy">
            <span className="section-kicker">Sulit-Meals Menu</span>
            <h2 id="budget-title">Big sarap, <em>easy on the budget.</em></h2>
            <p>Explore our affordable favorites, freshly made and ready to order.</p>
          </div>
          <div className="budget-results">
            {sulitMeals.length ? sulitMeals.map((food, index) => (
              <article className="budget-card food" key={food._id}>
                <div className="budget-photo photo">
                  <img src={food.imageUrl || foodPhotos[(index + 3) % foodPhotos.length]} alt={food.name} onError={showPhotoFallback} />
                </div>
                <div className="budget-card-body food-body">
                  <span className="food-category-label">{food.category}</span>
                  <h3>{food.name}</h3>
                  <strong className="food-card-price">{peso(food.price)}</strong>
                  <div className="feature-actions">
                    <span className={`feature-availability${food.available ? '' : ' unavailable'}`}><span aria-hidden="true" />{food.available ? 'Available' : 'Sold out'}</span>
                    <div className="food-card-actions">
                      <div className="quantity-stepper" aria-label={`Quantity for ${food.name}`}>
                        <button type="button" aria-label={`Decrease ${food.name} quantity`} disabled={!food.available || (menuQuantities[food._id] || 1) <= 1} onClick={() => changeMenuQuantity(food._id, -1)}>−</button>
                        <span aria-live="polite">{menuQuantities[food._id] || 1}</span>
                        <button type="button" aria-label={`Increase ${food.name} quantity`} disabled={!food.available} onClick={() => changeMenuQuantity(food._id, 1)}>+</button>
                      </div>
                      <button className="feature-add" disabled={!food.available} onClick={() => add(food, menuQuantities[food._id] || 1)} aria-label={`Add ${menuQuantities[food._id] || 1} ${food.name} to order`}><span aria-hidden="true">🛒</span> Add</button>
                    </div>
                  </div>
                </div>
              </article>
            )) : <p className="empty-state">No Sulit-Meals are available right now. Please check back soon.</p>}
          </div>
        </section>

        <section id="menu" className="content-section full-menu-section">
          <div className="section-heading menu-heading">
            <div><span className="section-kicker">MADE FRESH, MADE FOR YOU</span><h2>Explore the <em>Full Menu</em></h2></div>
          </div>
          <div className="menu-controls">
            <div className="cats" aria-label="Filter by category">
              {cats.map(item => (
                <button className={category === item ? 'chosen' : ''} key={item} onClick={() => setCategory(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="grid">
            {visible.map((food, index) => (
              <article className="food" key={food._id}>
                <div className="photo">
                  <img src={food.imageUrl || foodPhotos[index % foodPhotos.length]} alt={food.name} onError={showPhotoFallback} />
                  <span className="photo-fallback" hidden aria-hidden="true">{['🍛', '🍲', '🍗', '🥘', '🍚', '🍜'][index % 6]}</span>
                </div>
                <div className="food-body">
                  <span className="food-category-label">{food.category}</span>
                  <h3>{food.name}</h3>
                  <strong className="food-card-price">{peso(food.price)}</strong>
                  <div className="feature-actions">
                    <span className={`feature-availability${food.available ? '' : ' unavailable'}`}><span aria-hidden="true" />{food.available ? 'Available' : 'Sold out'}</span>
                    <div className="food-card-actions">
                      <div className="quantity-stepper" aria-label={`Quantity for ${food.name}`}>
                        <button type="button" aria-label={`Decrease ${food.name} quantity`} disabled={!food.available || (menuQuantities[food._id] || 1) <= 1} onClick={() => changeMenuQuantity(food._id, -1)}>−</button>
                        <span aria-live="polite">{menuQuantities[food._id] || 1}</span>
                        <button type="button" aria-label={`Increase ${food.name} quantity`} disabled={!food.available} onClick={() => changeMenuQuantity(food._id, 1)}>+</button>
                      </div>
                      <button className="feature-add" disabled={!food.available} onClick={() => add(food, menuQuantities[food._id] || 1)} aria-label={`Add ${menuQuantities[food._id] || 1} ${food.name} to order`}><span aria-hidden="true">🛒</span> Add</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!visible.length && <p className="empty-state">No meals are currently available in this category.</p>}
        </section>
      </main>

      <section id="about" className="how-section content-section">
        <div className="how-intro"><span className="section-kicker">GOOD FOOD IS JUST A FEW CLICKS AWAY</span><h2>How to <em>order</em></h2><p>FoodEase brings Filipino comfort food and familiar lutong-bahay flavors to your table. Easy, convenient, and cooked with care.</p></div>
        <div className="steps">
          <article className="step"><span>01</span><div><h3>Choose your food</h3><p>Explore the menu and add your favorites to the cart.</p></div></article>
          <article className="step"><span>02</span><div><h3>Checkout with ease</h3><p>Tell us your name and how you'd like to receive your order.</p></div></article>
          <article className="step"><span>03</span><div><h3>Pickup or delivery</h3><p>We'll get your freshly cooked meal ready for your table.</p></div></article>
        </div>
      </section>

      <section className="service-highlights" aria-label="FoodEase service highlights">
        <div><span aria-hidden="true">✦</span><p><b>Made with care</b><small>Comfort food for every day</small></p></div>
        <div><span aria-hidden="true">⌖</span><p><b>Pickup or delivery</b><small>Choose what works for you</small></p></div>
        <div><span aria-hidden="true">♡</span><p><b>Easy ordering</b><small>Your favorites, a few clicks away</small></p></div>
      </section>

      <footer id="contact">
        <div className="footer-brand">
          <img className="brand-logo" src="/foodease-logo.png" alt="FoodEase" />
          <span><small>Filipino comfort food, made with love.</small></span>
        </div>
        <div className="footer-column"><b>Visit us</b><span>Mambajao, Maasin City, Southern Leyte</span><span>Monday–Saturday · 8:30 AM–10:00 PM</span><span>Local pickup · Delivery available</span></div>
        <div className="footer-column"><b>Get in touch</b><a href="tel:+639099892812">0909 989 2812</a></div>
        <div className="footer-column"><b>Follow on</b><a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a></div>
        <div className="footer-note">
          <span>© {new Date().getFullYear()} FoodEase</span><a href="#top">Back to top ↑</a>
        </div>
      </footer>

      <aside className="chat-widget" aria-label="Customer information chat">
        {chatOpen && (
          <section className="chat-panel" id="customer-chat" role="dialog" aria-modal="false" aria-labelledby="chat-title">
            <header className="chat-header">
              <img className="chat-avatar" src="/foodease-logo.png" alt="" />
              <div className="chat-heading"><h2 id="chat-title">{chatCopy.title}</h2><p>{chatCopy.subtitle}</p></div>
              <button className="chat-close" aria-label="Close chat" onClick={() => setChatOpen(false)}>×</button>
            </header>
            <div className="chat-language">
              <label htmlFor="chat-language-select">Language</label>
              <select id="chat-language-select" value={chatLanguage} onChange={event => changeChatLanguage(event.target.value)}>
                <option value="auto">Auto detect</option>
                <option value="en">English</option>
                <option value="tagalog">Tagalog</option>
                <option value="bisaya">Bisaya</option>
              </select>
            </div>
            <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions">
              {chatMessages.map((message, index) => (
                <p className={`chat-message ${message.from}`} key={`${index}-${message.from}`}>{message.text}</p>
              ))}
              {chatLoading && <p className="chat-message bot" role="status">Kain-Bot is thinking...</p>}
            </div>
            {chatMessages.length === 1 && (
              <div className="chat-suggestions" aria-label="Frequently asked questions">
                {chatCopy.suggestions.map((suggestion, index) => (
                  <button key={suggestion} onClick={() => sendChat(chatCopy.questions[index])}>{suggestion}</button>
                ))}
              </div>
            )}
            <form className="chat-form" onSubmit={event => { event.preventDefault(); sendChat(); }}>
              <label className="visually-hidden" htmlFor="chat-input">{chatCopy.input}</label>
              <input id="chat-input" value={chatInput} onChange={event => setChatInput(event.target.value)} placeholder={chatCopy.input} autoComplete="off" disabled={chatLoading} />
              <button type="submit" aria-label={chatCopy.send} disabled={!chatInput.trim() || chatLoading}>{chatCopy.send}</button>
            </form>
          </section>
        )}
        <button
          className={`chat-launcher${chatOpen ? ' is-open' : ''}`}
          aria-label={chatOpen ? 'Close customer help chat' : 'Open customer help chat'}
          aria-expanded={chatOpen}
          aria-controls="customer-chat"
          onClick={() => setChatOpen(open => !open)}
        >
          <span aria-hidden="true">{chatOpen ? '×' : '☏'}</span>
          {!chatOpen && <span>Need help?</span>}
        </button>
      </aside>

      {msg && <div className="toast" role="status">{msg}<button onClick={() => setMsg('')}>×</button></div>}

      {checkout && (
        <div className="overlay" onClick={() => setCheckout(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={event => event.stopPropagation()}>
            <button className="close" aria-label="Close cart" onClick={() => setCheckout(false)}>×</button>
            <small className="eyebrow">ALMOST THERE</small>
            <h2 id="checkout-title">Your <em>order</em></h2>
            {!cart.length ? <p>Your cart is empty. Add food from the menu first.</p> : (
              <>
                <div className="cart-list">
                  {cart.map(item => (
                    <div className="cart-row" key={item._id}>
                      <span>{item.name}<small>{peso(item.price)} each</small></span>
                      <div className="quantity-control">
                        <button aria-label={`Remove one ${item.name}`} onClick={() => qty(item._id, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button aria-label={`Add one ${item.name}`} onClick={() => qty(item._id, 1)}>+</button>
                      </div>
                      <b>{peso(item.price * item.quantity)}</b>
                    </div>
                  ))}
                </div>
                <h3 className="total">Total <em>{peso(total)}</em></h3>
                <form onSubmit={place} className="form">
                  <label>Full name<input required value={customer.customerName} onChange={event => setCustomer({ ...customer, customerName: event.target.value })} /></label>
                  <label>Phone number<input required value={customer.phone} onChange={event => setCustomer({ ...customer, phone: event.target.value })} /></label>
                  <label>Fulfillment<select value={customer.fulfillment} onChange={event => setCustomer({ ...customer, fulfillment: event.target.value })}><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></label>
                  {customer.fulfillment === 'delivery' && <label>Delivery address<textarea required value={customer.address} onChange={event => setCustomer({ ...customer, address: event.target.value })} /></label>}
                  <p className="cash">💵 Cash on {customer.fulfillment}</p>
                  <button className="cta full">Place order · {peso(total)}</button>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      {admin && (
        <div className={`overlay${!token ? ' admin-login-overlay' : ' admin-workspace-overlay'}`} onClick={() => setAdmin(false)}>
          <section className={`modal admin${!token ? ' admin-login-modal' : ' admin-workspace'}`} role="dialog" aria-modal="true" aria-labelledby="admin-title" onClick={event => event.stopPropagation()}>
            <button className="close" aria-label="Close admin panel" onClick={() => setAdmin(false)}>×</button>
            {!token ? (
              <div className="admin-login-layout">
                <div className="admin-login-brand-panel">
                  <img className="admin-login-logo" src="/foodease-logo.png" alt="FoodEase" />
                  <div className="admin-login-welcome">
                    <span>FOODEASE OWNER PORTAL</span>
                    <h2>Filipino comfort,<br />made easy.</h2>
                    <p>Freshly prepared favorites, served with care.</p>
                  </div>
                  <div className="admin-login-location"><b>Mambajao Branch</b><span>Maasin City, Southern Leyte</span></div>
                </div>
                <div className="admin-login-form-panel">
                  <small className="eyebrow">OWNER &amp; ADMIN ACCESS</small>
                  <h2 id="admin-title">Welcome back</h2>
                  <p className="admin-login-subtitle">Sign in to manage your menu and orders.</p>
                  <form className="form" onSubmit={login}>
                    <label>Username
                      <span className="login-input-wrap">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
                        <input autoComplete="username" placeholder="Username" required value={credentials.username} onChange={event => { setCredentials({ ...credentials, username: event.target.value }); setAdminLoginNotice(''); }} />
                      </span>
                    </label>
                    <label>Password
                      <span className="password-input-wrap">
                        <svg className="password-field-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></svg>
                        <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Password" required value={credentials.password} onChange={event => { setCredentials({ ...credentials, password: event.target.value }); setAdminLoginNotice(''); }} />
                        <button
                          className="password-visibility-toggle"
                          type="button"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                          onClick={() => setShowPassword(visible => !visible)}
                        >
                          {showPassword ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                              <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16.4 16.4 0 0 1-3.1 3.9M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.8 10.8 0 0 0 4-.8" />
                            </svg>
                          )}
                        </button>
                      </span>
                    </label>
                    <div className="admin-login-options">
                      <label className="remember-login">
                        <input
                          type="checkbox"
                          checked={rememberLogin}
                          onChange={event => {
                            const checked = event.target.checked;
                            setRememberLogin(checked);
                            if (checked) {
                              localStorage.setItem('food-admin-remember', 'true');
                              if (credentials.username) localStorage.setItem('food-admin-username', credentials.username);
                            } else {
                              localStorage.removeItem('food-admin-remember');
                              localStorage.removeItem('food-admin-username');
                            }
                          }}
                        />
                        <span>Remember me</span>
                      </label>
                      <button className="forgot-password-link" type="button" onClick={() => setAdminLoginNotice('Password reset is not available here. Please contact the FoodEase administrator.')}>Forgot password?</button>
                    </div>
                    {adminLoginNotice && <p className="admin-login-notice" role="alert">{adminLoginNotice}</p>}
                    <button className="cta full"><span aria-hidden="true">→</span> Sign in</button>
                  </form>
                  <span className="admin-login-secure">Secure access for FoodEase owners</span>
                </div>
              </div>
            ) : (
              <div className={`admin-dashboard${adminSidebarCollapsed ? ' admin-sidebar-collapsed' : ''}`}>
                <aside className="admin-sidebar" aria-label="Admin navigation">
                  <a className="admin-sidebar-brand" href="#admin-title" aria-label="FoodEase dashboard">
                    <img className="admin-sidebar-mark" src="/foodease-icon.png" alt="" />
                    <span className="admin-sidebar-wordmark"><strong>foodease</strong><small>FOOD AT YOUR DOORSTEP</small></span>
                  </a>
                  <span className="admin-sidebar-label">WORKSPACE</span>
                  {[
                    ['overview', '⌂', 'Dashboard'],
                    ['foods', '♨', 'Menu Items'],
                    ['orders', '▤', 'Orders'],
                    ['customers', '♧', 'Customers'],
                    ['settings', '⚙', 'Settings']
                  ].map(([value, icon, label]) => (
                    <button
                      className={`admin-sidebar-link${tab === value ? ' active' : ''}`}
                      key={value}
                      onClick={() => {
                        setTab(value);
                        if (['overview', 'orders', 'customers'].includes(value)) loadOrders();
                        if (value === 'settings') loadStoreProfile();
                      }}
                    >
                      <span aria-hidden="true">{icon}</span>
                      {label}
                      {value === 'orders' && orders.filter(order => order.status === 'Pending').length > 0 && (
                        <small>{orders.filter(order => order.status === 'Pending').length}</small>
                      )}
                    </button>
                  ))}
                  <div className="admin-sidebar-note">
                    <span aria-hidden="true">✦</span>
                    <p>Good food,<br />happy people.</p>
                  </div>
                  <button className="admin-sidebar-logout" onClick={logout}><span aria-hidden="true">↪</span> Log out</button>
                </aside>

                <div className="admin-dashboard-main">
                  <header className="admin-topbar">
                    <button className="admin-topbar-menu" type="button" aria-label={adminSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={adminSidebarCollapsed} onClick={() => setAdminSidebarCollapsed(collapsed => !collapsed)}>
                      <span /><span /><span />
                    </button>
                    <span className="admin-topbar-caption">FoodEase owner workspace</span>
                    <div className="admin-topbar-actions">
                      <button className="admin-notifications" type="button" aria-label="View pending orders" onClick={() => { setTab('orders'); loadOrders(); }}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
                        {orders.some(order => order.status === 'Pending') && <i />}
                      </button>
                      <div className="admin-profile"><span>FE</span><b>Admin</b><small aria-hidden="true">⌄</small></div>
                    </div>
                  </header>

                  <div className="admin-dashboard-content">
                    {tab === 'overview' && (
                      <>
                        <section className="admin-welcome-banner">
                          <div>
                            <span className="admin-section-kicker">POWER WORKSPACE</span>
                            <h2 id="admin-title">Manage menu &amp; orders</h2>
                            <p>Keep your menu fresh and stay on top of every customer order.</p>
                            <div className="admin-banner-actions">
                              <button onClick={() => setTab('foods')}>♨&nbsp; Food Menu</button>
                              <button onClick={() => { setTab('orders'); loadOrders(); }}>▤&nbsp; Orders</button>
                            </div>
                          </div>
                          <img
                            className="admin-banner-art"
                            src={foods.find(food => food.name.toLowerCase().includes('pork adobo'))?.imageUrl || menuItems.find(food => food.name === 'Pork Adobo').imageUrl}
                            alt="Pork Adobo"
                          />
                        </section>

                        <div className="admin-stat-grid">
                          {[
                            ['Total orders', orders.length, '▤', 'admin-stat-green'],
                            ['Pending', orders.filter(order => order.status === 'Pending').length, '◷', 'admin-stat-amber'],
                            ['Preparing', orders.filter(order => order.status === 'Preparing').length, '♨', 'admin-stat-blue'],
                            ['Completed', orders.filter(order => order.status === 'Completed').length, '✓', 'admin-stat-mint']
                          ].map(([label, value, icon, className]) => (
                            <article className={`admin-stat-card ${className}`} key={label}>
                              <span>{icon}</span><div><small>{label}</small><b>{value}</b></div>
                            </article>
                          ))}
                        </div>

                        <section className="admin-section-card">
                          <div className="admin-section-heading">
                            <div><span className="admin-section-kicker">LATEST ACTIVITY</span><h3>Recent orders</h3></div>
                            <button className="admin-text-button" onClick={() => { setTab('orders'); loadOrders(); }}>View all orders →</button>
                          </div>
                          {orders.length ? (
                            <div className="admin-table-wrap">
                              <table className="admin-table">
                                <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                                <tbody>{orders.slice(0, 5).map(order => (
                                  <tr key={order._id}>
                                    <td><b>#{order._id.slice(-6).toUpperCase()}</b><small>{new Date(order.createdAt).toLocaleDateString()}</small></td>
                                    <td className="admin-order-customer"><b>{order.customerName}</b><small>{order.phone}</small>{order.fulfillment === 'delivery' && order.address && <small className="admin-order-address">{order.address}</small>}<small>{order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</small></td>
                                    <td><div className="admin-order-items">{order.items.map((item, index) => <div className="admin-order-item" key={`${item.foodId || item.name}-${index}`}><img src={getOrderItemImage(item)} alt={item.name} /><span><b>{item.name}</b><small>Qty {item.quantity} · {peso(item.price)}</small></span></div>)}</div></td>
                                    <td><b>{peso(order.total)}</b></td>
                                    <td><span className={`admin-status status-${order.status.toLowerCase().replaceAll(' ', '-')}`}>{order.status}</span></td>
                                  </tr>
                                ))}</tbody>
                              </table>
                            </div>
                          ) : <p className="admin-empty-state">No orders yet. New customer orders will appear here.</p>}
                        </section>
                      </>
                    )}

                    {tab === 'foods' && (
                      <>
                        <section className="admin-menu-hero">
                          <div>
                            <span className="admin-section-kicker">POWER WORKSPACE</span>
                            <h2 id="admin-title">Manage menu &amp; orders</h2>
                            <p>Add, edit, and manage your food items. Keep your menu fresh and your customers happy!</p>
                            <div className="admin-banner-actions">
                              <button onClick={() => setTab('foods')}>♨&nbsp; Food Menu</button>
                              <button onClick={() => { setTab('orders'); loadOrders(); }}>▤&nbsp; Orders</button>
                              <button onClick={logout}>↪&nbsp; Log out</button>
                            </div>
                          </div>
                          <div className="admin-menu-hero-art">
                            <span>Fresh Food<br />Better Mood</span>
                            <img src={foods.find(food => food.name.toLowerCase().includes('pork adobo'))?.imageUrl || menuItems.find(food => food.name === 'Pork Adobo').imageUrl} alt="Pork Adobo" />
                          </div>
                        </section>
                        <form className="form panel admin-food-form" onSubmit={save}>
                          <div className="admin-section-heading"><div><h3>{edit ? 'Edit menu item' : 'Add a menu item'}</h3><p>Fill in the details below to add a new food item to your menu.</p></div>{edit && <button className="admin-text-button" type="button" onClick={() => { setEdit(''); setForm(empty); }}>Cancel edit</button>}</div>
                          <label className="admin-food-name-field">Food name<input id="admin-food-name" required placeholder="e.g. Chicken Adobo" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
                          <label className="admin-food-description-field">Description<textarea placeholder="Describe the food, ingredients, and special notes..." value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
                          <div className="admin-food-form-row">
                            <label>Category<input required placeholder="e.g. Ulam" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} /></label>
                            <label>Price (₱)<input type="number" min="0" step="0.01" required placeholder="0.00" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} /></label>
                          </div>
                          <label className="admin-food-image-field">Image URL<input placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={event => setForm({ ...form, imageUrl: event.target.value })} /></label>
                          <label className="check admin-availability-check"><input type="checkbox" checked={form.available} onChange={event => setForm({ ...form, available: event.target.checked })} /> Available to customers</label>
                          <button className="admin-primary-button admin-form-submit">{edit ? 'Save changes' : '＋　Add food'}</button>
                        </form>

                        <section className="admin-section-card">
                          <div className="admin-section-heading admin-menu-toolbar">
                            <div><span className="admin-section-kicker">YOUR CATALOG</span><h3>Menu items <small>{foods.length}</small></h3></div>
                            <div className="admin-table-filters">
                              <input aria-label="Search menu items" placeholder="Search food items..." value={adminSearch} onChange={event => setAdminSearch(event.target.value)} />
                              <select aria-label="Filter menu categories" value={adminCategory} onChange={event => setAdminCategory(event.target.value)}>
                                <option>All categories</option>
                                {[...new Set(foods.map(food => food.category))].sort().map(category => <option key={category}>{category}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="admin-table-wrap">
                            <table className="admin-table">
                              <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                              <tbody>{foods.filter(food =>
                                (!adminSearch || `${food.name} ${food.description}`.toLowerCase().includes(adminSearch.toLowerCase()))
                                && (adminCategory === 'All categories' || food.category === adminCategory)
                              ).map(food => (
                                <tr key={food._id}>
                                  <td><div className="admin-food-image"><img className="admin-food-thumbnail" src={food.imageUrl || foodPhotos[0]} alt="" onError={showPhotoFallback} /><span className="photo-fallback" hidden>🍽️</span></div></td>
                                  <td><b>{food.name}</b><small>{food.description}</small></td>
                                  <td><span className="admin-category-pill">{food.category}</span></td>
                                  <td><b>{peso(food.price)}</b></td>
                                  <td><span className={`admin-status ${food.available ? 'status-available' : 'status-cancelled'}`}>{food.available ? 'Available' : 'Unavailable'}</span></td>
                                  <td><div className="admin-table-actions"><button aria-label={`Edit ${food.name}`} onClick={() => { setEdit(food._id); setForm({ ...food, price: String(food.price) }); document.getElementById('admin-food-name')?.focus(); }}>Edit</button><button className="admin-delete-button" aria-label={`Delete ${food.name}`} onClick={() => remove(food)}>Delete</button></div></td>
                                </tr>
                              ))}</tbody>
                            </table>
                            {!foods.some(food =>
                              (!adminSearch || `${food.name} ${food.description}`.toLowerCase().includes(adminSearch.toLowerCase()))
                              && (adminCategory === 'All categories' || food.category === adminCategory)
                            ) && <p className="admin-empty-state">No menu items match those filters.</p>}
                          </div>
                        </section>
                      </>
                    )}

                    {tab === 'orders' && (
                      <>
                        <div className="admin-orders-heading">
                          <div className="admin-page-heading">
                            <div><span className="admin-section-kicker">ORDER MANAGEMENT</span><h2 id="admin-title">Orders</h2><p>View and manage customer orders.</p></div>
                            <button className="admin-secondary-button" onClick={loadOrders}>↻&nbsp; Refresh</button>
                          </div>
                          <div className="admin-stat-grid admin-order-stats">
                          {[
                            ['Total orders', orders.length, '▤', 'admin-stat-green'],
                            ['Pending', orders.filter(order => order.status === 'Pending').length, '◷', 'admin-stat-amber'],
                            ['Preparing', orders.filter(order => order.status === 'Preparing').length, '♨', 'admin-stat-blue'],
                            ['Completed', orders.filter(order => order.status === 'Completed').length, '✓', 'admin-stat-mint']
                          ].map(([label, value, icon, className]) => <article className={`admin-stat-card ${className}`} key={label}><span aria-hidden="true">{icon}</span><div><small>{label}</small><b>{value}</b></div></article>)}
                          </div>
                        </div>
                        <section className="admin-section-card">
                          <div className="admin-orders-toolbar">
                            <input aria-label="Search orders" placeholder="Search by order number, customer name, or food item..." value={orderSearch} onChange={event => setOrderSearch(event.target.value)} />
                            <select aria-label="Filter order status" value={orderStatusFilter} onChange={event => setOrderStatusFilter(event.target.value)}>
                              {['All statuses', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for delivery', 'Completed', 'Cancelled'].map(status => <option key={status}>{status}</option>)}
                            </select>
                            <select aria-label="Filter payment method" value={orderPaymentFilter} onChange={event => setOrderPaymentFilter(event.target.value)}>
                              <option>All payment methods</option>
                              <option value="cash">Cash</option>
                            </select>
                            <div className="admin-date-range">
                              <input aria-label="Orders from date" type="date" value={orderDateFrom} onChange={event => setOrderDateFrom(event.target.value)} />
                              <span aria-hidden="true">–</span>
                              <input aria-label="Orders through date" type="date" value={orderDateTo} onChange={event => setOrderDateTo(event.target.value)} />
                            </div>
                          </div>
                          {filteredOrders.length ? <div className="admin-table-wrap"><table className="admin-table admin-orders-table">
                            <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total amount</th><th>Payment method</th><th>Status</th><th>Order date</th></tr></thead>
                            <tbody>{filteredOrders.map(order => <tr key={order._id}>
                              <td><b>#{order._id.slice(-6).toUpperCase()}</b><small>{order.fulfillment}</small></td>
                              <td className="admin-order-customer"><b>{order.customerName}</b><small>{order.phone}</small>{order.fulfillment === 'delivery' && order.address ? <small className="admin-order-address"><strong>Address:</strong> {order.address}</small> : <small>{order.fulfillment === 'delivery' ? 'Delivery address not provided' : 'Pickup order'}</small>}</td>
                              <td><div className="admin-order-items">{order.items.map((item, index) => <div className="admin-order-item" key={`${item.foodId || item.name}-${index}`}><img src={getOrderItemImage(item)} alt={item.name} /><span><b>{item.name}</b><small>Qty {item.quantity} · {peso(item.price)}</small></span></div>)}</div></td>
                              <td><b>{peso(order.total)}</b></td>
                              <td><span className="admin-payment-pill">{(order.paymentMethod || 'cash').charAt(0).toUpperCase() + (order.paymentMethod || 'cash').slice(1)}</span></td>
                              <td><select className={`admin-status-select status-${order.status.toLowerCase().replaceAll(' ', '-')}`} aria-label={`Update order ${order._id.slice(-6)} status`} value={order.status} onChange={event => status(order, event.target.value)}>
                                {['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for delivery', 'Completed', 'Cancelled'].map(item => <option key={item}>{item}</option>)}
                              </select></td>
                              <td>{new Date(order.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                            </tr>)}</tbody>
                          </table></div> : <p className="admin-empty-state">{orders.length ? 'No orders match those filters.' : 'No orders yet. New customer orders will appear here.'}</p>}
                        </section>
                      </>
                    )}

                    {tab === 'customers' && (
                      <>
                        <div className="admin-page-heading"><div><span className="admin-section-kicker">CUSTOMER DIRECTORY</span><h2 id="admin-title">Customers</h2><p>Customer details are collected from placed orders.</p></div></div>
                        <section className="admin-section-card">
                          <div className="admin-section-heading"><div><span className="admin-section-kicker">ORDER HISTORY</span><h3>Customers</h3></div></div>
                          {orders.length ? <div className="admin-table-wrap"><table className="admin-table">
                            <thead><tr><th>Customer</th><th>Phone</th><th>Delivery address</th><th>Orders</th><th>Total spent</th><th>Last order</th></tr></thead>
                            <tbody>{[...orders.reduce((customers, order) => {
                              const key = order.phone;
                              const customer = customers.get(key) || { ...order, orderCount: 0, spent: 0 };
                              if (order.address && !customer.address) customer.address = order.address;
                              customer.orderCount += 1;
                              customer.spent += Number(order.total);
                              customers.set(key, customer);
                              return customers;
                            }, new Map()).values()].map(customer => <tr key={customer.phone}>
                              <td><b>{customer.customerName}</b></td><td>{customer.phone}</td><td className="admin-order-address">{customer.address || 'Pickup / no delivery address'}</td><td>{customer.orderCount}</td><td><b>{peso(customer.spent)}</b></td><td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                            </tr>)}</tbody>
                          </table></div> : <p className="admin-empty-state">Customer details will appear after the first order.</p>}
                        </section>
                      </>
                    )}

                    {tab === 'settings' && (
                      <>
                        <div className="admin-page-heading"><div><span className="admin-section-kicker">WORKSPACE</span><h2 id="admin-title">Settings</h2><p>Manage your FoodEase owner session and store information.</p></div></div>
                        <section className="admin-section-card admin-settings-card">
                          <div className="admin-settings-heading"><span className="admin-section-kicker">STORE PROFILE</span>{!profileEditing && <button className="admin-primary-button" onClick={() => { setProfileDraft(storeProfile); setProfileEditing(true); }}>✎&nbsp; Edit profile</button>}</div>
                          {profileEditing ? (
                            <form className="admin-profile-form" onSubmit={saveStoreProfile}>
                              <label>Branch name<input required maxLength="100" value={profileDraft.branchName} onChange={event => setProfileDraft({ ...profileDraft, branchName: event.target.value })} /></label>
                              <label>Address<textarea required maxLength="250" value={profileDraft.address} onChange={event => setProfileDraft({ ...profileDraft, address: event.target.value })} /></label>
                              <label>Business hours<input required maxLength="120" value={profileDraft.businessHours} onChange={event => setProfileDraft({ ...profileDraft, businessHours: event.target.value })} /></label>
                              <label>Contact number<input required maxLength="40" value={profileDraft.phone} onChange={event => setProfileDraft({ ...profileDraft, phone: event.target.value })} /></label>
                              <div className="admin-profile-form-actions">
                                <button className="admin-primary-button" type="submit" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save profile'}</button>
                                <button className="admin-secondary-button" type="button" disabled={profileSaving} onClick={() => { setProfileDraft(storeProfile); setProfileEditing(false); }}>Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <h3>{storeProfile.branchName}</h3>
                              <p>{storeProfile.address}</p>
                              <p>{storeProfile.businessHours}</p>
                              <p>Contact · {storeProfile.phone}</p>
                              <button className="admin-secondary-button" onClick={logout}>↪&nbsp; Log out of admin</button>
                            </>
                          )}
                        </section>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
