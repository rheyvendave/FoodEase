import test from 'node:test';
import assert from 'node:assert/strict';
import Food from './models/Food.js';
import { createFood, updateFood } from './controllers/foodController.js';

function responseStub() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('rejects menu items with a category outside the available choices', async t => {
  const create = t.mock.method(Food, 'create');
  const res = responseStub();

  await createFood({
    body: { name: 'Test item', category: 'Main Course', price: 100 }
  }, res, error => { throw error; });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Name, a supported category, and valid price are required.');
  assert.equal(create.mock.callCount(), 0);
});

test('rejects updates that use a category outside the available choices', async t => {
  const update = t.mock.method(Food, 'findByIdAndUpdate');
  const res = responseStub();

  await updateFood({
    params: { id: '507f1f77bcf86cd799439011' },
    body: { category: 'Main Course' }
  }, res, error => { throw error; });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Choose a supported food category.');
  assert.equal(update.mock.callCount(), 0);
});

test('rejects malformed menu creation fields before saving', async t => {
  const create = t.mock.method(Food, 'create');
  const invalidItems = [
    { name: 123, category: 'Ulam', price: 100 },
    { name: 'Test item', category: 'Ulam', price: '' },
    { name: 'Test item', category: 'Ulam', price: 100, description: {} },
    { name: 'Test item', category: 'Ulam', price: 100, available: 'yes' }
  ];

  for (const body of invalidItems) {
    const res = responseStub();
    await createFood({ body }, res, error => { throw error; });
    assert.equal(res.statusCode, 400);
  }

  assert.equal(create.mock.callCount(), 0);
});

test('rejects malformed menu updates before saving', async t => {
  const update = t.mock.method(Food, 'findByIdAndUpdate');
  const invalidUpdates = [
    { name: 123 },
    { description: {} },
    { price: '' },
    { available: 'yes' }
  ];

  for (const body of invalidUpdates) {
    const res = responseStub();
    await updateFood({
      params: { id: '507f1f77bcf86cd799439011' },
      body
    }, res, error => { throw error; });
    assert.equal(res.statusCode, 400);
  }

  assert.equal(update.mock.callCount(), 0);
});
