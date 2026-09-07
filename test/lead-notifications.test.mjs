import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
process.env.DB_PATH = await mkdtemp(path.join(tmpdir(), 'umniremont-outbox-'));
if (process.env.TEST_DATABASE_URL) {
  const url = new URL(process.env.TEST_DATABASE_URL);
  if (!url.pathname.endsWith('_test')) throw new Error('Only an isolated test database is permitted');
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
} else delete process.env.DATABASE_URL;
const db = await import('../server/db.js');
const { deliverPendingLeadNotifications } = await import('../server/lead-notifications.js');
const lead = () => ({ id: randomUUID(), name: 'Synthetic queue test', phone: '00000000000', propertyType: 'apartment', area: '', budget: '', timeline: '', comment: '', status: 'new', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), consentVersion: 'test', consentAt: new Date().toISOString() });
test('failed delivery retries later; completed delivery is not repeated', async () => {
  const value = lead(); await db.saveLead(value, true); let calls = 0;
  assert.equal(await deliverPendingLeadNotifications({ now: () => 1000, send: async () => { calls++; throw new Error('Temporary timeout'); } }), 0);
  assert.equal(await deliverPendingLeadNotifications({ now: () => 30000, send: async () => { calls++; return { sent: true }; } }), 0);
  assert.equal(await deliverPendingLeadNotifications({ now: () => 31000, send: async () => { calls++; return { sent: true }; } }), 1);
  assert.equal(await deliverPendingLeadNotifications({ now: () => 100000, send: async () => { calls++; return { sent: true }; } }), 0);
  assert.equal(calls, 2); await db.deleteLeadById(value.id);
});
test('expired worker lease recovers and a stale worker cannot overwrite the new lease', async () => {
  const value = lead(); await db.saveLead(value, true);
  const first = await db.claimLeadNotification(1000); assert.equal(first.lead.id, value.id);
  assert.equal(await db.claimLeadNotification(2000), null);
  const second = await db.claimLeadNotification(61000); assert.equal(second.attempts, 2);
  await db.finishLeadNotification(value.id, true, first.attempts, 62000);
  assert.equal(await db.claimLeadNotification(120999), null);
  const recovered = await db.claimLeadNotification(121000); assert.equal(recovered.attempts, 3);
  await db.finishLeadNotification(value.id, true, recovered.attempts, 122000);
  assert.equal(await db.claimLeadNotification(1000000), null); await db.deleteLeadById(value.id);
});
test('deleting a lead removes its pending notification', async () => {
  const value = lead(); await db.saveLead(value, true); await db.deleteLeadById(value.id);
  assert.equal(await db.claimLeadNotification(1000), null);
});
test('concurrent workers cannot claim the same job', async () => {
  const value = lead(); await db.saveLead(value, true);
  const jobs = await Promise.all([db.claimLeadNotification(1000), db.claimLeadNotification(1000)]);
  assert.equal(jobs.filter(Boolean).length, 1); await db.deleteLeadById(value.id);
});
