import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchEntries, collectFacets } from '../js/search.js';
import { buildEntry } from '../js/model.js';

const sample = [
  buildEntry({ title: 'Hypertension guideline', type: 'guideline', specialty: 'Cardiology', tags: ['bp', 'ace'], evidenceLevel: 'high', rating: 5, year: 2021 }),
  buildEntry({ title: 'Anticoagulation RCT', type: 'rct', specialty: 'Hematology', tags: ['vte'], evidenceLevel: 'moderate', rating: 3, year: 2019 }),
  buildEntry({ title: 'Sepsis review', type: 'review', specialty: 'ICU', tags: ['sepsis', 'vte'], evidenceLevel: 'low', rating: 2, year: 2022 }),
];

test('text search is case-insensitive across fields', () => {
  const r = searchEntries(sample, { text: 'vte' });
  assert.equal(r.length, 2);
});

test('type filter', () => {
  const r = searchEntries(sample, { type: 'rct' });
  assert.equal(r.length, 1);
  assert.equal(r[0].type, 'rct');
});

test('tag filter', () => {
  const r = searchEntries(sample, { tag: 'bp' });
  assert.equal(r.length, 1);
});

test('evidence filter', () => {
  const r = searchEntries(sample, { evidenceLevel: 'high' });
  assert.equal(r.length, 1);
});

test('minRating filter', () => {
  const r = searchEntries(sample, { minRating: 3 });
  assert.equal(r.length, 2);
});

test('sort by year descending', () => {
  const r = searchEntries(sample, { sort: 'year' });
  assert.equal(r[0].year, 2022);
  assert.equal(r[2].year, 2019);
});

test('collectFacets returns distinct specialties and tags', () => {
  const f = collectFacets(sample);
  assert.deepEqual(f.specialties, ['Cardiology', 'Hematology', 'ICU']);
  assert.deepEqual(f.tags, ['ace', 'bp', 'sepsis', 'vte']);
});
