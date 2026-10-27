import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import StoreProfile from './models/StoreProfile.js';
import profileRoutes from './routes/profileRoutes.js';

const profile = {
  branchName: 'FoodEase · Mambajao Branch',
  address: 'Mambajao, Maasin City, Southern Leyte',
  businessHours: 'Tuesday–Sunday · 9:00 AM–8:00 PM',
  phone: '0909 989 2812'
};

async function startProfileServer(t) {
  const app = express();
  app.use(express.json());
  app.use('/profile', profileRoutes);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));
  return `http://127.0.0.1:${server.address().port}/profile`;
}

test('store profile is readable publicly and returns current business hours', async t => {
  t.mock.method(StoreProfile, 'findOneAndUpdate', async () => profile);
  const url = await startProfileServer(t);

  const response = await fetch(url);
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(result.businessHours, profile.businessHours);
});

test('store profile updates still require admin authentication', async t => {
  const url = await startProfileServer(t);

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  const result = await response.json();

  assert.equal(response.status, 401);
  assert.equal(result.message, 'Admin login required.');
});
