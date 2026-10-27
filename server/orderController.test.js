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

test('rejects pickup orders that only include a phone number without an address', async t => {
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
  const result = await response.json();

  assert.equal(response.status, 400);
  assert.equal(result.message, 'Address is required for every order.');
});

test('saves the required address for pickup and delivery orders', async t => {
  t.mock.method(Food, 'find', async () => [{
    _id: foodId,
    name: 'Test Meal',
    price: 100,
    imageUrl: ''
  }]);
  const createOrderMock = t.mock.method(Order, 'create', async order => order);
  const url = await startOrderServer(t);

  for (const fulfillment of ['pickup', 'delivery']) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Customer',
        phone: '09123456789',
        fulfillment,
        address: `  ${address}  `,
        items: [{ foodId, quantity: 1 }]
      })
    });

    assert.equal(response.status, 201);
  }

  assert.deepEqual(createOrderMock.mock.calls.map(call => call.arguments[0].address), [address, address]);
});
