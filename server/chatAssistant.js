const peso = value => `₱${Number(value || 0).toFixed(2)}`;

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w₱.]+/g, ' ')
    .trim();
}

function detectLanguage(question) {
  const query = normalize(question);
  if (/\b(unsa|unsay|pila|naa|asa|unsaon|palihug|karon|lamian|kaayo|gihapon|ninyo|aduna|kan on)\b/.test(query)) {
    return 'bisaya';
  }
  if (/\b(ano|anong|magkano|saan|paano|kailan|bakit|po|kayo|wala|meron|pabili|masarap|gusto|pwede|pagkain|presyo)\b/.test(query)) {
    return 'tagalog';
  }
  return 'en';
}

function reply(language, english, tagalog, bisaya) {
  if (language === 'tagalog') return tagalog;
  if (language === 'bisaya') return bisaya;
  return english;
}

function parseBudget(question) {
  const currency = question.match(/(?:₱|php\s*)(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:php|pesos?|peso)\b/i);
  const intent = /\b(budget|under|below|within|around|spend|limit|only have|got|pasok|halagang)\b/i.test(question);
  const plain = intent
    ? question.match(/\b(?:budget|under|below|within|around|spend|limit|for|have|got|halagang)\s+(?:₱\s*)?(\d+(?:\.\d{1,2})?)/i)
      || question.match(/\b(\d+(?:\.\d{1,2})?)\b/)
    : null;
  const amount = currency ? Number(currency[1] || currency[2]) : plain ? Number(plain[1]) : null;
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function findFood(question, menu) {
  const query = normalize(question);
  return [...menu]
    .sort((first, second) => normalize(second.name).length - normalize(first.name).length)
    .find(food => query.includes(normalize(food.name)));
}

function getCategories(menu) {
  return [...new Set(menu.map(food => food.category).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second));
}

function isDrink(food) {
  return /\b(drinks?|beverages?|soft drinks?|inumin|inom|ilimnon|soda|juice|water|coffee|tea|milkshake)\b/i
    .test(`${food.category} ${food.name} ${food.description}`);
}

function listMenu(menu, selectedCategories, language) {
  const grouped = selectedCategories.map(category => {
    const foods = menu.filter(food => food.category === category);
    if (!foods.length) return '';
    const shown = foods.slice(0, 8).map(food => `${food.name} ${peso(food.price)}`);
    const more = foods.length > shown.length
      ? (language === 'tagalog' ? ` at ${foods.length - shown.length} pa` : language === 'bisaya' ? ` ug ${foods.length - shown.length} pa` : ` and ${foods.length - shown.length} more`)
      : '';
    return `• ${category}: ${shown.join(' · ')}${more}`;
  }).filter(Boolean).join('\n');

  if (!grouped) {
    return reply(
      language,
      'I can’t see any available dishes right now. Please check back soon or contact us at 0909 989 2812.',
      'Wala akong makitang available na pagkain ngayon. Pakisubukan muli o tawagan kami sa 0909 989 2812.',
      'Wala koy makita nga available nga pagkaon karon. Sulayi pag-usab o tawagi kami sa 0909 989 2812.'
    );
  }

  return reply(
    language,
    `Here’s what’s currently available:\n${grouped}\nTell me your budget or what you’re craving and I’ll help you choose.`,
    `Narito ang mga pagkaing available ngayon:\n${grouped}\nSabihin ang budget o kung ano ang gusto mong kainin para matulungan kitang pumili.`,
    `Mao kini ang available karon:\n${grouped}\nIsulti ang imong budget o unsay imong ganahan kaonon aron matabangan tika mopili.`
  );
}

function budgetAnswer(menu, budget, language) {
  const meals = menu.filter(food => ['Sulit Meals', 'Ulam'].includes(food.category));
  const sides = menu.filter(food => ['Merienda', 'Dessert'].includes(food.category));
  const combos = meals.flatMap(meal => sides
    .map(side => ({ meal, side, total: Number(meal.price) + Number(side.price) }))
    .filter(pair => pair.total <= budget))
    .sort((first, second) => second.total - first.total)
    .slice(0, 3);
  const singles = menu
    .filter(food => Number(food.price) <= budget)
    .sort((first, second) => Number(second.price) - Number(first.price))
    .slice(0, 3);
  const options = [
    ...combos.map(pair => `• ${pair.meal.name} + ${pair.side.name} — ${peso(pair.total)}`),
    ...singles.map(food => `• ${food.name} — ${peso(food.price)}`)
  ];
  const uniqueOptions = [...new Set(options)].slice(0, 5);

  if (!uniqueOptions.length) {
    const cheapest = [...menu].sort((first, second) => Number(first.price) - Number(second.price))[0];
    return cheapest
      ? reply(
        language,
        `I couldn’t find an available item within ${peso(budget)}. The lowest-priced option is ${cheapest.name} at ${peso(cheapest.price)}.`,
        `Walang available na pasok sa ${peso(budget)}. Ang pinakamurang option ay ${cheapest.name} sa ${peso(cheapest.price)}.`,
        `Walay available nga masulod sa ${peso(budget)}. Ang pinakabarato nga kapilian mao ang ${cheapest.name} sa ${peso(cheapest.price)}.`
      )
      : listMenu(menu, getCategories(menu), language);
  }

  return reply(
    language,
    `Here are a few picks within your ${peso(budget)} budget:\n${uniqueOptions.join('\n')}\nPrices are menu prices; tell me if you want a meal, dessert, or a different budget.`,
    `Mga pagpipilian pasok sa budget mong ${peso(budget)}:\n${uniqueOptions.join('\n')}\nPresyo ito mula sa menu. Sabihin kung meal, dessert, o ibang budget ang hanap mo.`,
    `Mga kapilian sulod sa imong ${peso(budget)} nga budget:\n${uniqueOptions.join('\n')}\nPresyo kini gikan sa menu. Isulti kung meal, dessert, o laing budget ang imong gipangita.`
  );
}

export function buildChatAnswer(question, requestedLanguage, menu, history = []) {
  const language = requestedLanguage === 'auto' ? detectLanguage(question) : requestedLanguage;
  const query = normalize(question);
  const availableMenu = menu.filter(food => food.available !== false);
  const directFood = findFood(query, availableMenu);
  const followsUpOnFood = /\b(it|that|this|there|those|them|same|one|what about|with it|its|price|how much)\b/.test(query);
  const previousFood = followsUpOnFood
    ? [...history]
      .reverse()
      .filter(message => message.role === 'user')
      .map(message => findFood(message.content, availableMenu))
      .find(Boolean)
    : null;
  const matchedFood = directFood || previousFood;
  const budgetIntent = /\b(budget|under|below|within|around|spend|limit|only have|got|pasok|halagang)\b/i.test(question)
    || /₱|php|pesos?/i.test(question);
  const budget = budgetIntent ? parseBudget(question) : null;
  const pairingIntent = /\b(pair|pairing|go with|goes with|match|combination|dessert|panghimagas|pares|ipares|partner|bagay sa|unsa.*pares)\b/i.test(query);

  if (budget !== null) return budgetAnswer(availableMenu, budget, language);

  if (/\b(hi|hello|hey|kumusta|kamusta|maayong adlaw|good morning|good afternoon|good evening)\b/.test(query)) {
    return reply(
      language,
      'Hi! I’m Kain-Bot, your FoodEase guide. I can help with the live menu, prices, budget picks, pairings, and ordering. What are you craving?',
      'Kumusta! Ako si Kain-Bot, gabay mo sa FoodEase. Matutulungan kita sa menu, presyo, pasok sa budget, pares, at pag-order. Ano ang gusto mong kainin?',
      'Maayong adlaw! Ako si Kain-Bot, imong giya sa FoodEase. Makatabang ko sa menu, presyo, budget, pares, ug pag-order. Unsa imong ganahan kaonon?'
    );
  }

  if (/\b(what languages|which languages|languages.*speak|language.*support|unsang pinulongan|anong wika|anong lengguwahe|what language)\b/.test(query)) {
    return reply(
      language,
      'I can chat in English, Tagalog, or Bisaya. Choose a language from the selector above, or leave it on Auto detect.',
      'Nakakausap kita sa English, Tagalog, o Bisaya. Pumili ng wika sa itaas o gamitin ang Auto detect.',
      'Makig-istorya ko nimo sa English, Tagalog, o Bisaya. Pilia ang pinulongan sa ibabaw o gamita ang Auto detect.'
    );
  }

  if (/\b(drink|drinks|beverage|inumin|inom|ilumin)\b/.test(query)) {
    const drinks = availableMenu.filter(isDrink);
    if (drinks.length) {
      const drinkCategories = [...new Set(drinks.map(food => food.category).filter(Boolean))];
      return reply(
        language,
        `Here are the drinks currently listed on our menu:\n${listMenu(drinks, drinkCategories, language)}`,
        `Narito ang mga inuming nakalista ngayon sa menu:\n${listMenu(drinks, drinkCategories, language)}`,
        `Mao kini ang mga ilimnon nga naa karon sa menu:\n${listMenu(drinks, drinkCategories, language)}`
      );
    }

    return reply(
      language,
      'There are no drinks listed on the menu right now. I can suggest a dessert instead:\n' + listMenu(availableMenu, ['Dessert'], language),
      'Walang nakalistang inumin sa menu ngayon. Maaari akong magmungkahi ng panghimagas:\n' + listMenu(availableMenu, ['Dessert'], language),
      'Walay ilimnon nga gilista sa menu karon. Makasugyot ko og dessert:\n' + listMenu(availableMenu, ['Dessert'], language)
    );
  }

  if (matchedFood && pairingIntent) {
    const desserts = availableMenu
      .filter(food => food.category === 'Dessert')
      .sort((first, second) => Number(first.price) - Number(second.price))
      .slice(0, 3);
    if (desserts.length) {
      const suggestions = desserts.map(food => {
        const total = Number(matchedFood.price) + Number(food.price);
        return `• ${food.name} — ${peso(food.price)} (meal + dessert: ${peso(total)})`;
      }).join('\n');
      return reply(
        language,
        `For a sweet finish with ${matchedFood.name}, try:\n${suggestions}\nThese are menu suggestions; tell me if you’d prefer a different kind of pairing.`,
        `Para sa matamis na panghimagas kasama ng ${matchedFood.name}, subukan:\n${suggestions}\nMga mungkahi ito mula sa menu; sabihin kung iba ang gusto mong ipares.`,
        `Para sa tam-is nga dessert uban sa ${matchedFood.name}, sulayi:\n${suggestions}\nMga suhestiyon kini gikan sa menu; isulti kung lahi nga pares ang imong gusto.`
      );
    }
  }

  if (matchedFood) {
    const isPriceQuestion = /\b(price|cost|how much|presyo|magkano|pila|tagpila)\b/.test(query);
    const description = matchedFood.description ? ` ${matchedFood.description}` : '';
    return reply(
      language,
      `${matchedFood.name} is available in ${matchedFood.category} for ${peso(matchedFood.price)}.${description}${isPriceQuestion ? '' : ' Would you like a pairing or another recommendation?'}`,
      `Available ang ${matchedFood.name} sa kategoryang ${matchedFood.category} sa halagang ${peso(matchedFood.price)}.${description}${isPriceQuestion ? '' : ' Gusto mo ba ng ipaparis o iba pang mungkahi?'}`,
      `Available ang ${matchedFood.name} sa ${matchedFood.category} sa kantidad nga ${peso(matchedFood.price)}.${description}${isPriceQuestion ? '' : ' Gusto ka og pares o laing suhestiyon?'}`
    );
  }

  if (/\b(price|cost|how much|presyo|magkano|pila|tagpila)\b/.test(query)) {
    return reply(
      language,
      `Which dish would you like the price for? You can ask about a specific item or see the menu:\n${listMenu(availableMenu, getCategories(availableMenu), language)}`,
      `Aling pagkain ang gusto mong malaman ang presyo? Itanong ang pangalan nito o tingnan ang menu:\n${listMenu(availableMenu, getCategories(availableMenu), language)}`,
      `Unsa nga pagkaon ang gusto nimong mahibal-an ang presyo? Isulti ang ngalan o tan-awa ang menu:\n${listMenu(availableMenu, getCategories(availableMenu), language)}`
    );
  }

  if (/\b(menu|dish|ulam|food|available|special|favorite|pagkaon|putahe|pagkain|meron|mayroon|lamian|unsay|unsa nga pagkaon|anong pagkain|anong ulam)\b/.test(query)) {
    const selectedCategory = getCategories(availableMenu).find(category => query.includes(normalize(category)))
      || (/\b(dessert|panghimagas)\b/.test(query) ? 'Dessert' : null)
      || (/\b(merienda|snack)\b/.test(query) ? 'Merienda' : null)
      || (/\b(ulam|main course|main dish)\b/.test(query) ? 'Ulam' : null);
    return listMenu(availableMenu, selectedCategory ? [selectedCategory] : getCategories(availableMenu), language);
  }

  if (/\b(delivery|deliver|pickup|pick up|take away|hatod|ihatid|padala|kuha)\b/.test(query)) {
    return reply(
      language,
      'Pickup and delivery are available. Add dishes to your cart, continue to checkout, and choose your option. Enter your address for delivery; contact us at 0909 989 2812 to confirm delivery coverage and fees.',
      'May pickup at delivery. Idagdag ang pagkain sa cart, mag-checkout, at piliin ang paraan. Ilagay ang address para sa delivery; tawagan kami sa 0909 989 2812 para kumpirmahin ang sakop at bayad.',
      'Adunay pickup ug delivery. Idugang ang pagkaon sa cart, adto sa checkout, ug pilia ang gusto. Isulod ang address para sa delivery; tawagi kami sa 0909 989 2812 aron kumpirmahon ang lugar ug bayad.'
    );
  }

  if (/\b(order|checkout|pay|payment|cash|umorder|bayad|palit|orderon)\b/.test(query)) {
    return reply(
      language,
      'To order, add dishes to your cart, open checkout, enter your name and phone number, then choose pickup or delivery. Checkout currently offers cash on pickup or delivery.',
      'Para umorder, idagdag ang pagkain sa cart, buksan ang checkout, ilagay ang pangalan at numero ng telepono, at piliin ang pickup o delivery. Cash ang bayad.',
      'Para mo-order, idugang ang pagkaon sa cart, ablihi ang checkout, isulod ang imong ngalan ug numero, ug pilia ang pickup o delivery. Cash ang bayad.'
    );
  }

  if (/\b(hour|open|close|time|location|address|where|oras|bukas|saan|nasaan|asa|lokasyon)\b/.test(query)) {
    return reply(
      language,
      'We’re in Mambajao, Maasin City, Southern Leyte. Open Monday–Saturday, 8:30 AM–10:00 PM. Call 0909 989 2812 to confirm before visiting.',
      'Matatagpuan kami sa Mambajao, Maasin City, Southern Leyte. Bukas Lunes–Sabado, 8:30 AM–10:00 PM. Tumawag sa 0909 989 2812 bago bumisita.',
      'Naa kami sa Mambajao, Maasin City, Southern Leyte. Abli Lunes–Sabado, 8:30 AM–10:00 PM. Tawag sa 0909 989 2812 sa dili pa moanhi.'
    );
  }

  if (/\b(contact|phone|email|call|message|social|kontak|tawag|numero|telepono|contacto)\b/.test(query)) {
    return reply(
      language,
      'Call FoodEase at 0909 989 2812. We’re in Mambajao, Maasin City, Southern Leyte; our social links are in the page footer.',
      'Tawagan kami sa 0909 989 2812. Nasa Mambajao, Maasin City, Southern Leyte kami; nasa footer ang social links.',
      'Tawagi kami sa 0909 989 2812. Naa kami sa Mambajao, Maasin City, Southern Leyte; naa sa footer ang among social links.'
    );
  }

  if (/\b(allerg|ingredient|vegetarian|vegan|halal|gluten|spicy|maanghang|sangkap|halang)\b/.test(query)) {
    return reply(
      language,
      'I can share the menu descriptions, but they may not list every ingredient or preparation detail. For allergies or dietary requirements, please call 0909 989 2812 before ordering so the team can confirm safely.',
      'Maibabahagi ko ang paglalarawan sa menu, pero maaaring hindi nakalista ang lahat ng sangkap. Para sa allergy o dietary requirement, tumawag muna sa 0909 989 2812 bago umorder.',
      'Mahatag nako ang deskripsyon sa menu, pero basin dili kompleto ang mga sangkap. Para sa allergy o espesyal nga pagkaon, tawagi una ang 0909 989 2812 sa dili pa mo-order.'
    );
  }

  if (pairingIntent) {
    return reply(
      language,
      `Which meal would you like to pair with a dessert? Here are the available desserts:\n${listMenu(availableMenu, ['Dessert'], language)}`,
      `Aling meal ang gusto mong ipares sa panghimagas? Narito ang mga available na dessert:\n${listMenu(availableMenu, ['Dessert'], language)}`,
      `Unsa nga meal ang gusto nimong ipares sa dessert? Mao kini ang available nga dessert:\n${listMenu(availableMenu, ['Dessert'], language)}`
    );
  }

  return reply(
    language,
    `I can help with the live menu, prices, budget picks, pairings, and ordering. Try asking “What can I get for ₱150?” or tell me a dish you like.\n${listMenu(availableMenu, ['Sulit Meals'], language)}`,
    `Matutulungan kita sa menu, presyo, pasok sa budget, pares, at pag-order. Subukan: “Ano ang mabibili sa ₱150?” o sabihin ang pagkaing gusto mo.\n${listMenu(availableMenu, ['Sulit Meals'], language)}`,
    `Makatabang ko sa menu, presyo, budget, pares, ug pag-order. Sulayi: “Unsa may mapalit sa ₱150?” o isulti ang imong ganahan nga pagkaon.\n${listMenu(availableMenu, ['Sulit Meals'], language)}`
  );
}
