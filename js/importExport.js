// importExport.js — Serialize / parse entries for backup, sharing and portability.
// Pure functions. Supports JSON (primary), JSON Lines, CSV and Markdown.

import { buildEntry, validateEntry, uuid } from './model.js';

export function exportJSON(entries, pretty = true) {
  return JSON.stringify(entries || [], null, pretty ? 2 : 0);
}

// Parse an imported text blob. Accepts a JSON array or JSON Lines.
// Returns { entries, skipped, errors } where entries are normalized & re-id'd
// to avoid collisions with existing data.
export function parseImport(text) {
  const errors = [];
  let raw = [];
  const trimmed = (text || '').trim();
  if (!trimmed) return { entries: [], skipped: 0, errors: ['Empty input'] };

  try {
    // First try to parse the whole document as a single JSON value (array or object).
    const parsed = JSON.parse(trimmed);
    raw = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Fall back to JSON Lines (one JSON value per line).
    raw = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l, i) => {
        try {
          return JSON.parse(l);
        } catch (err) {
          errors.push(`Line ${i + 1}: ${err.message}`);
          return null;
        }
      })
      .filter(Boolean);
  }

  const seen = new Set();
  const entries = [];
  let skipped = 0;
  for (const item of raw) {
    const entry = buildEntry(item);
    // Ensure unique id
    let id = entry.id;
    while (!id || seen.has(id)) id = uuid();
    seen.add(id);
    entry.id = id;
    const { valid } = validateEntry(entry);
    if (!valid) {
      skipped += 1;
      continue;
    }
    entries.push(entry);
  }
  return { entries, skipped, errors };
}

function csvCell(value) {
  const s = value == null ? '' : Array.isArray(value) ? value.join('; ') : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportCSV(entries) {
  const headers = ['title', 'type', 'authors', 'year', 'source', 'doi', 'url', 'specialty', 'tags', 'evidenceLevel', 'rating', 'notes'];
  const lines = [headers.join(',')];
  for (const e of entries || []) {
    lines.push(headers.map((h) => csvCell(e[h])).join(','));
  }
  return lines.join('\n');
}

export function exportMarkdown(entries) {
  const lines = ['# 临床文献与指南导出 / Clinical Literature Export', ''];
  for (const e of entries || []) {
    lines.push(`- **${e.title}** (${e.year || 'n.d.'})`);
    if (e.authors) lines.push(`  - Authors: ${e.authors}`);
    if (e.source) lines.push(`  - Source: ${e.source}`);
    if (e.doi) lines.push(`  - DOI: ${e.doi}`);
    if (e.url) lines.push(`  - URL: ${e.url}`);
    if (e.specialty) lines.push(`  - Specialty: ${e.specialty}`);
    if (e.tags && e.tags.length) lines.push(`  - Tags: ${e.tags.join(', ')}`);
    if (e.notes) lines.push(`  - Notes: ${e.notes}`);
    lines.push('');
  }
  return lines.join('\n');
}

// Generate a BibTeX citation key from an entry (LastnameYear + first title words).
function bibtexKey(e) {
  const firstAuthor = (e.authors || '').split(',')[0].trim();
  const last = (firstAuthor.split(/\s+/).slice(-1)[0] || 'anon').replace(/[^a-zA-Z0-9一-龥]/g, '');
  const year = e.year || 'nd';
  const titlePart = (e.title || '')
    .replace(/[^a-zA-Z0-9一-龥]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('');
  const key = `${last}${year}${titlePart}`;
  return key.replace(/[^a-zA-Z0-9]/g, '') || 'ref';
}

// Escape special characters for the BibTeX value body.
function bibtexEscape(s) {
  return String(s == null ? '' : s).replace(/([&%$#_{}])/g, '\\$1');
}

// Map our entry type onto a reasonable BibTeX entry type.
function bibtexType(type) {
  if (type === 'book' || type === 'other') return type === 'book' ? 'book' : 'misc';
  return 'article';
}

// Export entries as a BibTeX (.bib) string for Zotero / EndNote / BibTeX users.
export function exportBibTeX(entries) {
  const lines = ['% BibTeX export — Clinical Literature Manager'];
  for (const e of entries || []) {
    const key = bibtexKey(e);
    const type = bibtexType(e.type);
    const authors = (e.authors || '')
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
      .join(' and ');
    const fields = [
      ['title', e.title],
      ['author', authors],
      ['journal', e.source],
      ['year', e.year],
      ['doi', e.doi],
      ['url', e.url],
      ['keywords', (e.tags || []).join(', ')],
      ['note', e.notes],
    ].filter(([, v]) => v != null && String(v).trim() !== '');
    lines.push(`@${type}{${key},`);
    for (const [k, v] of fields) {
      lines.push(`  ${k} = {${bibtexEscape(v)}}`);
    }
    lines.push('}');
    lines.push('');
  }
  return lines.join('\n');
}
