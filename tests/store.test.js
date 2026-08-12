import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, createMemoryStorage } from '../js/store.js';

test('add / get / update / delete lifecycle', () => {
  const store = createStore(createMemoryStorage());
  const { entry, error } = store.addEntry({ title: 'Guideline X', type: 'guideline', specialty: 'ICU' });
  assert.equal(error, null);
  assert.ok(entry.id);

  const fetched = store.getEntry(entry.id);
  assert.equal(fetched.title, 'Guideline X');

  const upd = store.updateEntry(entry.id, { rating: 5 });
  assert.equal(upd.entry.rating, 5);

  const removed = store.deleteEntry(entry.id);
  assert.equal(removed, true);
  assert.equal(store.getEntry(entry.id), null);
});

test('addEntry rejects invalid data', () => {
  const store = createStore(createMemoryStorage());
  const { entry, error } = store.addEntry({ title: '' });
  assert.equal(entry, null);
  assert.ok(error);
});

test('stats aggregate correctly', () => {
  const store = createStore(createMemoryStorage());
  store.addEntry({ title: 'A', type: 'guideline', specialty: 'ICU', evidenceLevel: 'high', rating: 4 });
  store.addEntry({ title: 'B', type: 'rct', specialty: 'ICU', evidenceLevel: 'low', rating: 2 });
  const s = store.stats();
  assert.equal(s.total, 2);
  assert.equal(s.bySpecialty.ICU, 2);
  assert.equal(s.byEvidence.high, 1);
  assert.equal(s.avgRating.toFixed(1), '3.0');
});

test('replaceAll and clearAll', () => {
  const store = createStore(createMemoryStorage());
  store.addEntry({ title: 'A', type: 'guideline' });
  store.replaceAll([]);
  assert.equal(store.getAll().length, 0);
  store.clearAll();
  assert.equal(store.getAll().length, 0);
});
