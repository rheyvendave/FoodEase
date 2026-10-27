import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import Food from './models/Food.js';
import Order from './models/Order.js';
import {
  createOrder,
  deleteOrder,
  getSalesPeriodRange,
  getSalesSummary,
  updateOrderCustomerDetails,
  updateOrderStatus
} from './controllers/orderController.js';

const foodId = '507f1f77bcf86cd799439011';
const address = '12 Main Street, Mambajao, Maasin City';

function responseStub() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    set(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

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

test('builds today, rolling seven-day, and current-month ranges in Manila time', () => {
  const now = new Date('2026-03-15T12:30:00.000Z');

  assert.deepEqual(getSalesPeriodRange('today', now), {
    from: new Date('2026-03-14T16:00:00.000Z'),
    to: now
  });
  assert.deepEqual(getSalesPeriodRange('last7days', now), {
    from: new Date('2026-03-08T16:00:00.000Z'),
    to: now
  });
  assert.deepEqual(getSalesPeriodRange('thisMonth', now), {
    from: new Date('2026-02-28T16:00:00.000Z'),
    to: now
  });
  assert.equal(getSalesPeriodRange('lastMonth', now), null);
});

test('sales summary aggregates completed orders in the selected range', async t => {
  const aggregate = t.mock.method(Order, 'aggregate', async () => [{
    completedOrders: 3,
    totalSales: 750
  }]);
  const res = responseStub();

  await getSalesSummary({ query: { period: 'today' } }, res, error => { throw error; });

  const pipeline = aggregate.mock.calls[0].arguments[0];
  assert.equal(res.body.period, 'today');
  assert.equal(res.body.completedOrders, 3);
  assert.equal(res.body.totalSales, 750);
  assert.equal(res.headers['cache-control'], 'no-store');
  assert.deepEqual(pipeline[0], { $match: { status: 'Completed' } });
  assert.deepEqual(pipeline[1], { $addFields: { salesDate: { $ifNull: ['$completedAt', '$createdAt'] } } });
  assert.ok(pipeline[2].$match.salesDate.$gte instanceof Date);
  assert.ok(pipeline[2].$match.salesDate.$lte instanceof Date);
  assert.equal(pipeline[2].$match.salesDate.$gte.getUTCHours(), 16);
  assert.equal(pipeline[2].$match.salesDate.$lte.getTime() <= Date.now(), true);
  assert.equal(pipeline[3].$group.totalSales.$sum, '$total');
});

test('rejects invalid sales periods without querying orders', async t => {
  const aggregate = t.mock.method(Order, 'aggregate');
  const res = responseStub();

  await getSalesSummary({ query: { period: 'allTime' } }, res, error => { throw error; });

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /today, the last 7 days, or this month/);
  assert.equal(aggregate.mock.callCount(), 0);
});

test('tracks the completion date and clears it when an order is reopened', async t => {
  let currentStatus = 'Preparing';
  t.mock.method(Order, 'findById', async () => ({
    paymentMethod: 'cash',
    status: currentStatus
  }));
  const updates = [];
  t.mock.method(Order, 'findByIdAndUpdate', async (_id, update) => {
    updates.push(update);
    currentStatus = update.$set.status;
    return { status: currentStatus, completedAt: update.$set.completedAt };
  });

  for (const status of ['Completed', 'Preparing']) {
    const res = responseStub();
    await updateOrderStatus({
      params: { id: '507f1f77bcf86cd799439011' },
      body: { status }
    }, res, error => { throw error; });
    assert.equal(res.statusCode, 200);
  }

  assert.ok(updates[0].$set.completedAt instanceof Date);
  assert.ok(Number.isFinite(updates[0].$set.completedAt.getTime()));
  assert.deepEqual(updates[1], {
    $set: { status: 'Preparing' },
    $unset: { completedAt: '' }
  });
});

test('preserves the original completion date when status remains Completed', async t => {
  const completedAt = new Date('2026-03-10T12:00:00.000Z');
  t.mock.method(Order, 'findById', async () => ({
    paymentMethod: 'cash',
    status: 'Completed',
    completedAt
  }));
  const updateOrder = t.mock.method(Order, 'findByIdAndUpdate', async (_id, update) => update);
  const res = responseStub();

  await updateOrderStatus({
    params: { id: '507f1f77bcf86cd799439011' },
    body: { status: 'Completed' }
  }, res, error => { throw error; });

  assert.deepEqual(updateOrder.mock.calls[0].arguments[1], {
    $set: { status: 'Completed' }
  });
});

test('updates validated admin-corrected customer details without changing order totals', async t => {
  const currentOrder = { fulfillment: 'delivery' };
  const updatedOrder = { _id: foodId, customerName: 'Jane Doe', phone: '09123456789', address };
  t.mock.method(Order, 'findById', async () => currentOrder);
  const updateOrder = t.mock.method(Order, 'findByIdAndUpdate', async () => updatedOrder);
  const res = responseStub();

  await updateOrderCustomerDetails({
    params: { id: foodId },
    body: { customerName: '  Jane   Doe ', phone: ' 09123456789 ', address: ` ${address} ` }
  }, res, error => { throw error; });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body, updatedOrder);
  assert.deepEqual(updateOrder.mock.calls[0].arguments[1], {
    $set: { customerName: 'Jane Doe', phone: '09123456789', address }
  });
  assert.deepEqual(updateOrder.mock.calls[0].arguments[2], { new: true, runValidators: true });
});

test('rejects invalid corrected customer details and requires a delivery address', async t => {
  const findOrder = t.mock.method(Order, 'findById', async () => ({ fulfillment: 'delivery' }));
  const updateOrder = t.mock.method(Order, 'findByIdAndUpdate');
  const invalidUpdates = [
    { customerName: 'Nonsense123', phone: '09123456789', address },
    { customerName: 'Jane Doe', phone: '123', address },
    { customerName: 'Jane Doe', phone: '09123456789', address: ' ' },
    { customerName: 'Jane Doe', phone: '09123456789', address, total: 1 }
  ];

  for (const body of invalidUpdates) {
    const res = responseStub();
    await updateOrderCustomerDetails({
      params: { id: foodId },
      body
    }, res, error => { throw error; });
    assert.equal(res.statusCode, 400);
  }

  assert.equal(findOrder.mock.callCount(), 1);
  assert.equal(updateOrder.mock.callCount(), 0);
});

test('permanently deletes an order and reports missing records', async t => {
  const deletedOrder = { _id: foodId };
  const findByIdAndDelete = t.mock.method(Order, 'findByIdAndDelete', async () => deletedOrder);
  const res = responseStub();

  await deleteOrder({ params: { id: foodId } }, res, error => { throw error; });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: 'Order permanently deleted.', orderId: foodId });
  assert.equal(findByIdAndDelete.mock.calls[0].arguments[0], foodId);

  findByIdAndDelete.mock.mockImplementation(async () => null);
  const missingRes = responseStub();
  await deleteOrder({ params: { id: foodId } }, missingRes, error => { throw error; });
  assert.equal(missingRes.statusCode, 404);
  assert.match(missingRes.body.message, /not found/);
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
