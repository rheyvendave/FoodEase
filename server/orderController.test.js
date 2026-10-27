import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import Food from './models/Food.js';
import Order from './models/Order.js';
import { createOrder } from './controllers/orderController.js';

const foodId = '507f1f77bcf86cd799439011';
const address = '12 Main Street, Mambajao, Maasin City';

async function startOrderServer(t) {
  const app = express();
  app.use(express.json());
  app.post('/orders', createOrder);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));
  return `http://127.0.0.1:${server.address().port}/orders`;
}

test('accepts pickup orders without an address', async t => {
  t.mock.method(Food, 'find', async () => [{
    _id: foodId,
    name: 'Test Meal',
    price: 100,
    imageUrl: ''
  }]);
  const createOrderMock = t.mock.method(Order, 'create', async order => order);
  const url = await startOrderServer(t);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Customer',
      phone: '09123456789',
      fulfillment: 'pickup',
      items: [{ foodId, quantity: 1 }]
    })
  });

  assert.equal(response.status, 201);
  assert.equal(createOrderMock.mock.calls[0].arguments[0].address, '');
});

test('accepts full names with accents and common name punctuation', async t => {
  t.mock.method(Food, 'find', async () => [{
    _id: foodId,
    name: 'Test Meal',
    price: 100,
    imageUrl: ''
  }]);
  const createOrderMock = t.mock.method(Order, 'create', async order => order);
  const url = await startOrderServer(t);

  for (const customerName of ['José Dela Cruz', "Mary-Jane O'Neil"]) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        phone: '09123456789',
        fulfillment: 'pickup',
        items: [{ foodId, quantity: 1 }]
      })
    });

    assert.equal(response.status, 201);
  }

  assert.deepEqual(createOrderMock.mock.calls.map(call => call.arguments[0].customerName), [
    'José Dela Cruz',
    "Mary-Jane O'Neil"
  ]);
});

test('rejects invalid full names before querying foods or saving an order', async t => {
  const foodFind = t.mock.method(Food, 'find');
  const createOrderMock = t.mock.method(Order, 'create');
  const url = await startOrderServer(t);
  const invalidNames = ['adawdwaad', 'John', '123456789', 'John Doe3', 'John @ Doe', '  '];

  for (const customerName of invalidNames) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        phone: '09123456789',
        fulfillment: 'pickup',
        items: [{ foodId, quantity: 1 }]
      })
    });
    const result = await response.json();

    assert.equal(response.status, 400);
    assert.match(result.message, /first and last name/);
  }

  assert.equal(foodFind.mock.callCount(), 0);
  assert.equal(createOrderMock.mock.callCount(), 0);
});

test('requires and saves an address for delivery orders only', async t => {
  t.mock.method(Food, 'find', async () => [{
    _id: foodId,
    name: 'Test Meal',
    price: 100,
    imageUrl: ''
  }]);
  const createOrderMock = t.mock.method(Order, 'create', async order => order);
  const url = await startOrderServer(t);

  const missingAddress = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Customer',
      phone: '09123456789',
      fulfillment: 'delivery',
      items: [{ foodId, quantity: 1 }]
    })
  });
  assert.equal(missingAddress.status, 400);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Customer',
      phone: '09123456789',
      fulfillment: 'delivery',
      address: `  ${address}  `,
      items: [{ foodId, quantity: 1 }]
    })
  });

  assert.equal(response.status, 201);
  assert.equal(createOrderMock.mock.calls[0].arguments[0].address, address);
});

test('rejects unsupported fulfillment and invalid delivery addresses before saving', async t => {
  const createOrderMock = t.mock.method(Order, 'create');
  const url = await startOrderServer(t);
  const invalidOrders = [
    { fulfillment: 'dine-in', address },
    { fulfillment: 'delivery', address: '   ' },
    { fulfillment: 'delivery', address: 'A'.repeat(251) }
  ];

  for (const { fulfillment, address: orderAddress } of invalidOrders) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Customer',
        phone: '09171234567',
        fulfillment,
        address: orderAddress,
        items: [{ foodId, quantity: 1 }]
      })
    });

    assert.equal(response.status, 400);
  }

  assert.equal(createOrderMock.mock.callCount(), 0);
});

test('order schema requires address only for delivery', () => {
  const pickup = new Order({
    customerName: 'Test Customer',
    phone: '09123456789',
    fulfillment: 'pickup',
    items: [{ foodId, quantity: 1 }],
    total: 100
  });
  const delivery = new Order({
    customerName: 'Test Customer',
    phone: '09123456789',
    fulfillment: 'delivery',
    items: [{ foodId, quantity: 1 }],
    total: 100
  });

  assert.equal(pickup.validateSync(), undefined);
  assert.equal(delivery.validateSync().errors.address.kind, 'required');
});

test('order schema rejects an invalid customer name', () => {
  const order = new Order({
    customerName: 'John123',
    phone: '09123456789',
    fulfillment: 'pickup',
    items: [{ foodId, quantity: 1 }],
    total: 100
  });

  assert.equal(order.validateSync().errors.customerName.kind, 'regexp');
});

test('accepts all supported Philippine mobile number formats', async t => {
  t.mock.method(Food, 'find', async () => [{
    _id: foodId,
    name: 'Test Meal',
    price: 100,
    imageUrl: ''
  }]);
  const createOrderMock = t.mock.method(Order, 'create', async order => order);
  const url = await startOrderServer(t);

  for (const phone of ['09171234567', '+639171234567', '639171234567']) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Customer',
        phone,
        fulfillment: 'pickup',
        items: [{ foodId, quantity: 1 }]
      })
    });

    assert.equal(response.status, 201);
  }

  assert.deepEqual(createOrderMock.mock.calls.map(call => call.arguments[0].phone), [
    '09171234567',
    '+639171234567',
    '639171234567'
  ]);
});

test('rejects invalid mobile numbers before querying foods or saving an order', async t => {
  const foodFind = t.mock.method(Food, 'find');
  const createOrderMock = t.mock.method(Order, 'create');
  const url = await startOrderServer(t);

  for (const phone of ['0917123456', '091712345678', '+63917123456', '6391712345a', '12345678901']) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Customer',
        phone,
        fulfillment: 'pickup',
        items: [{ foodId, quantity: 1 }]
      })
    });
    const result = await response.json();

    assert.equal(response.status, 400);
    assert.match(result.message, /Philippine mobile number/);
  }

  assert.equal(foodFind.mock.callCount(), 0);
  assert.equal(createOrderMock.mock.callCount(), 0);
});

test('rejects malformed customer fields and cart items instead of throwing', async t => {
  const url = await startOrderServer(t);
  const invalidOrders = [
    { customerName: 123, phone: '09123456789', fulfillment: 'pickup', items: [{ foodId, quantity: 1 }] },
    { customerName: 'Test Customer', phone: {}, fulfillment: 'pickup', items: [{ foodId, quantity: 1 }] },
    { customerName: 'Test Customer', phone: '09123456789', fulfillment: 'pickup', items: [null] },
    { customerName: 'Test Customer', phone: '09123456789', fulfillment: 'pickup', items: [{ foodId, quantity: '1' }] },
    { customerName: 'Test Customer', phone: '09123456789', fulfillment: 'pickup', items: [{ foodId, quantity: 51 }] }
  ];

  for (const order of invalidOrders) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    assert.equal(response.status, 400);
  }
});

test('rejects duplicate cart lines whose combined quantity exceeds the limit', async t => {
  const url = await startOrderServer(t);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Customer',
      phone: '09123456789',
      fulfillment: 'pickup',
      address,
      items: [{ foodId, quantity: 30 }, { foodId, quantity: 21 }]
    })
  });

  assert.equal(response.status, 400);
});

test('order schema rejects invalid phone numbers', () => {
  const order = new Order({
    customerName: 'Test Customer',
    phone: '0917123456',
    fulfillment: 'pickup',
    items: [{ foodId, quantity: 1 }],
    total: 100
  });

  assert.equal(order.validateSync().errors.phone.kind, 'regexp');
});
