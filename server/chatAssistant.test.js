import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import Food from './models/Food.js';
import chatRoutes from './routes/chatRoutes.js';
import { buildChatAnswer } from './chatAssistant.js';

const menu = [
  { name: 'Hotsilog', category: 'Sulit Meals', price: 95, description: 'Hotdogs, garlic rice, and egg.', available: true },
  { name: 'Tocilog', category: 'Sulit Meals', price: 110, description: 'Cured beef tocino, rice, and egg.', available: true },
  { name: 'Chicken Adobo', category: 'Ulam', price: 170, description: 'Soy sauce, vinegar, and garlic.', available: true },
  { name: 'Turon', category: 'Merienda', price: 45, description: 'Crispy banana rolls.', available: true },
  { name: 'Leche Flan', category: 'Dessert', price: 100, description: 'Caramel custard.', available: true },
  { name: 'Sold-out Meal', category: 'Sulit Meals', price: 50, description: '', available: false }
];

test('answers menu and dish price questions with current available items', () => {
  assert.match(buildChatAnswer('Show me the menu', 'en', menu), /Hotsilog ₱95\.00/);
  assert.match(buildChatAnswer('How much is Chicken Adobo?', 'en', menu), /₱170\.00/);
  assert.doesNotMatch(buildChatAnswer('Show me the menu', 'en', menu), /Sold-out Meal/);
});

test('uses newly added menu categories and items in fallback replies', () => {
  const liveMenu = [
    ...menu,
    { name: 'Mountain Dew 12 oz', category: 'Drinks', price: 25, description: 'Chilled soda.', available: true },
    { name: 'Pepsi 12 oz', category: 'Drinks', price: 25, description: 'Chilled cola.', available: true },
    { name: 'Unavailable Juice', category: 'Drinks', price: 30, description: '', available: false }
  ];

  const drinkAnswer = buildChatAnswer('What drinks are on the menu?', 'en', liveMenu);
  assert.match(drinkAnswer, /Mountain Dew 12 oz ₱25\.00/);
  assert.match(drinkAnswer, /Pepsi 12 oz ₱25\.00/);
  assert.doesNotMatch(drinkAnswer, /Unavailable Juice/);
  assert.doesNotMatch(drinkAnswer, /There are no drinks listed/);
  assert.match(buildChatAnswer('How much is Pepsi 12 oz?', 'en', liveMenu), /₱25\.00/);
  assert.match(buildChatAnswer('Show me the menu', 'en', liveMenu), /• Drinks:/);
});

test('builds accurate budget combinations without exceeding the budget', () => {
  const answer = buildChatAnswer('What can I get for ₱150?', 'en', menu);
  assert.match(answer, /Hotsilog \+ Turon — ₱140\.00/);
  assert.doesNotMatch(answer, /Chicken Adobo/);
});

test('suggests dessert pairings and includes accurate totals', () => {
  const answer = buildChatAnswer('What dessert goes with Chicken Adobo?', 'en', menu);
  assert.match(answer, /Leche Flan — ₱100\.00 \(meal \+ dessert: ₱270\.00\)/);
});

test('uses recent chat context to resolve follow-up questions', () => {
  const answer = buildChatAnswer('What dessert goes with it?', 'en', menu, [
    { role: 'user', content: 'Tell me about Chicken Adobo.' }
  ]);
  assert.match(answer, /with Chicken Adobo/);
  assert.match(answer, /Leche Flan/);
});

test('automatically detects Tagalog and Bisaya replies', () => {
  assert.match(buildChatAnswer('Ano ang nasa menu?', 'auto', menu), /Narito ang mga pagkaing available/);
  assert.match(buildChatAnswer('Unsa ang naa sa menu?', 'auto', menu), /Mao kini ang available/);
});

test('provides useful shop information without an AI service', () => {
  assert.match(buildChatAnswer('What time are you open?', 'en', menu), /Monday–Saturday, 8:30 AM–10:00 PM/);
  assert.match(buildChatAnswer('Do you deliver?', 'en', menu), /Pickup and delivery are available/);
});

test('chat API answers from the menu when OpenAI is not configured', async t => {
  t.mock.method(Food, 'find', () => ({
    select() { return this; },
    sort() { return this; },
    limit() { return this; },
    lean: async () => menu
  }));
  const previousKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = '';
  t.after(() => {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  });

  const app = express();
  app.use(express.json());
  app.use('/chat', chatRoutes);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'What dessert goes with Chicken Adobo?', language: 'en' })
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.match(result.answer, /Leche Flan/);
  assert.doesNotMatch(result.answer, /OpenAI|AI reply unavailable/);
});

test('chat API includes menu items added after initial catalog setup', async t => {
  const liveMenu = [
    ...menu,
    { name: 'Mountain Dew 12 oz', category: 'Drinks', price: 25, description: 'Chilled soda.', available: true },
    { name: 'Pepsi 12 oz', category: 'Drinks', price: 25, description: 'Chilled cola.', available: true }
  ];
  t.mock.method(Food, 'find', () => ({
    select() { return this; },
    sort() { return this; },
    limit() { return this; },
    lean: async () => liveMenu
  }));
  const previousKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = '';
  t.after(() => {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  });

  const app = express();
  app.use(express.json());
  app.use('/chat', chatRoutes);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'What drinks are on the menu?', language: 'en' })
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.match(result.answer, /Mountain Dew 12 oz ₱25\.00/);
  assert.match(result.answer, /Pepsi 12 oz ₱25\.00/);
  assert.doesNotMatch(result.answer, /There are no drinks listed/);
});

test('chat API sends requests to OpenAI and returns its response', async t => {
  t.mock.method(Food, 'find', () => ({
    select() { return this; },
    sort() { return this; },
    limit() { return this; },
    lean: async () => menu
  }));
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  process.env.OPENAI_API_KEY = 'test-only-key';
  process.env.OPENAI_MODEL = 'gpt-test-model';
  t.after(() => {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
  });
  const originalFetch = globalThis.fetch.bind(globalThis);
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (!String(url).startsWith('https://api.openai.com/')) {
      return originalFetch(url, options);
    }
    assert.equal(String(url), 'https://api.openai.com/v1/chat/completions');
    assert.equal(options.headers.Authorization, 'Bearer test-only-key');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'gpt-test-model');
    assert.equal(body.messages.at(-1).content, 'What can I get for ₱150?');
    return Response.json({ choices: [{ message: { content: 'Hotsilog and Turon.' } }] });
  });

  const app = express();
  app.use(express.json());
  app.use('/chat', chatRoutes);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'What can I get for ₱150?', language: 'en' })
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.answer, 'Hotsilog and Turon.');
});

test('chat API falls back when OpenAI returns an error', async t => {
  t.mock.method(Food, 'find', () => ({
    select() { return this; },
    sort() { return this; },
    limit() { return this; },
    lean: async () => menu
  }));
  const originalFetch = globalThis.fetch.bind(globalThis);
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (String(url).startsWith('https://api.openai.com/')) {
      return new Response('', { status: 401 });
    }
    return originalFetch(url, options);
  });
  const previousKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'test-only-key';
  t.after(() => {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  });

  const app = express();
  app.use(express.json());
  app.use('/chat', chatRoutes);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'What can I get for ₱150?', language: 'en' })
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.match(result.answer, /Hotsilog \+ Turon/);
});
