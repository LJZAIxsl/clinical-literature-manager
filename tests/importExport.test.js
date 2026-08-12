import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportJSON, parseImport, exportCSV, exportMarkdown, exportBibTeX } from '../js/importExport.js';
import { buildEntry } from '../js/model.js';

const entries = [
  buildEntry({ title: 'A', type: 'guideline', specialty: 'Cardiology', tags: ['bp'], rating: 4, year: 2021 }),
  buildEntry({ title: 'B', type: 'rct', specialty: 'ICU', tags: ['sepsis'], evidenceLevel: 'moderate' }),
];

test('round-trips through JSON', () => {
  const json = exportJSON(entries);
  const r = parseImport(json);
  assert.equal(r.entries.length, 2);
  assert.equal(r.skipped, 0);
  assert.equal(r.entries[0].title, 'A');
});

test('re-id on import avoids collisions and regenerates missing ids', () => {
  const json = JSON.stringify([
    { title: 'No id', type: 'guideline' },
    { id: 'same', title: 'Dup id 1', type: 'guideline' },
    { id: 'same', title: 'Dup id 2', type: 'guideline' },
  ]);
  const r = parseImport(json);
  const ids = r.entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('skips invalid entries (missing title)', () => {
  const json = JSON.stringify([{ title: '' }, { title: 'Ok', type: 'guideline' }]);
  const r = parseImport(json);
  assert.equal(r.entries.length, 1);
  assert.equal(r.skipped, 1);
});

test('parses JSON Lines', () => {
  const jl = `${JSON.stringify({ title: 'L1', type: 'guideline' })}\n${JSON.stringify({ title: 'L2', type: 'rct' })}`;
  const r = parseImport(jl);
  assert.equal(r.entries.length, 2);
});

test('CSV export contains header and rows', () => {
  const csv = exportCSV(entries);
  const lines = csv.split('\n');
  assert.equal(lines[0], 'title,type,authors,year,source,doi,url,specialty,tags,evidenceLevel,rating,notes');
  assert.equal(lines.length, 3);
});

test('Markdown export mentions titles', () => {
  const md = exportMarkdown(entries);
  assert.ok(md.includes('A'));
  assert.ok(md.includes('B'));
});

test('BibTeX export emits one entry per item with key and fields', () => {
  const bib = exportBibTeX(entries);
  const blocks = bib.split('@').filter((s) => /^(article|misc|book)\{/.test(s.trim()));
  assert.equal(blocks.length, 2);
  assert.ok(bib.includes('@article{'));
  assert.ok(bib.includes('title = {'));
  assert.ok(bib.includes('}'));
});

test('BibTeX escapes special characters', () => {
  const bib = exportBibTeX([buildEntry({ title: 'Cost & Benefit of 10% & 20%', type: 'other', doi: '10.1/x' })]);
  assert.ok(bib.includes('Cost \\& Benefit'));
});

test('BibTeX keys are alphanumeric and stable', () => {
  const single = [buildEntry({ title: 'Hypertension Guideline', authors: 'Smith J', year: 2018, type: 'guideline' })];
  const key = exportBibTeX(single).match(/@article\{([^,]+),/)[1];
  assert.ok(/^[a-zA-Z0-9]+$/.test(key));
});
