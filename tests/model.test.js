import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEntry,
  validateEntry,
  normalizeTags,
  normalizeYear,
  normalizeRating,
  evidenceLabel,
  typeLabel,
  ENTRY_TYPES,
  EVIDENCE_LEVELS,
} from '../js/model.js';

test('buildEntry fills defaults and timestamps', () => {
  const e = buildEntry({ title: 'Test' });
  assert.equal(e.title, 'Test');
  assert.equal(e.type, 'guideline');
  assert.ok(e.id);
  assert.ok(e.createdAt);
  assert.ok(e.updatedAt);
});

test('buildEntry normalizes tags, year, rating, evidence', () => {
  const e = buildEntry({
    title: 'X', tags: ['a', ' a ', '', 'b'], year: '2020', rating: '4',
    evidenceLevel: 'high', type: 'made-up',
  });
  assert.deepEqual(e.tags, ['a', 'b']);
  assert.equal(e.year, 2020);
  assert.equal(e.rating, 4);
  assert.equal(e.evidenceLevel, 'high');
  assert.equal(e.type, 'other'); // invalid type falls back to other
});

test('normalizeYear rejects out-of-range and junk', () => {
  assert.equal(normalizeYear(''), null);
  assert.equal(normalizeYear('abc'), null);
  assert.equal(normalizeYear('1850'), null);
  assert.equal(normalizeYear('2050'), 2050);
});

test('normalizeRating enforces 1-5', () => {
  assert.equal(normalizeRating('0'), null);
  assert.equal(normalizeRating('6'), null);
  assert.equal(normalizeRating('3'), 3);
});

test('validateEntry requires a title', () => {
  const { valid, errors } = validateEntry(buildEntry({ title: '' }));
  assert.equal(valid, false);
  assert.ok(errors.some((er) => er.field === 'title'));
});

test('validateEntry flags bad DOI and bad URL', () => {
  const badDoi = validateEntry(buildEntry({ title: 'T', doi: 'not-a-doi' }));
  assert.equal(badDoi.valid, false);
  const badUrl = validateEntry(buildEntry({ title: 'T', url: 'not a url' }));
  assert.equal(badUrl.valid, false);
  const good = validateEntry(buildEntry({ title: 'T', doi: '10.1001/jama.2020.1234', url: 'https://example.com/x' }));
  assert.equal(good.valid, true);
});

test('evidenceLabel / typeLabel respect language', () => {
  assert.equal(evidenceLabel('high', 'zh'), EVIDENCE_LEVELS.high.zh);
  assert.equal(evidenceLabel('high', 'en'), EVIDENCE_LEVELS.high.en);
  assert.equal(typeLabel('rct', 'zh'), ENTRY_TYPES.rct.zh);
  assert.equal(evidenceLabel(null, 'zh'), '未评级');
});
