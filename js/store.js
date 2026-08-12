// store.js — Persistence layer for clinical literature entries.
// Storage-agnostic: defaults to localStorage in the browser, but accepts any
// storage-like object ({ getItem, setItem, removeItem }) so it can be unit-tested
// under Node with an in-memory shim.

import { buildEntry, validateEntry } from './model.js';

export function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
  };
}

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  return createMemoryStorage();
}

export function createStore(storage) {
  const s = resolveStorage(storage);
  const KEY = 'clm.entries.v1';

  function load() {
    try {
      const raw = s.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function save(entries) {
    s.setItem(KEY, JSON.stringify(entries));
  }

  function getAll() {
    return load();
  }

  function getEntry(id) {
    return load().find((e) => e.id === id) || null;
  }

  // Create a new entry. Returns { entry, error }.
  function addEntry(input = {}) {
    const entry = buildEntry(input);
    const { valid, errors } = validateEntry(entry);
    if (!valid) return { entry: null, error: errors[0]?.message || 'Invalid entry' };
    const all = load();
    all.push(entry);
    save(all);
    return { entry, error: null };
  }

  // Update an existing entry by id. Returns { entry, error }.
  function updateEntry(id, patch = {}) {
    const all = load();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) return { entry: null, error: 'Entry not found' };
    const merged = buildEntry({ ...all[idx], ...patch, id, createdAt: all[idx].createdAt });
    const { valid, errors } = validateEntry(merged);
    if (!valid) return { entry: null, error: errors[0]?.message || 'Invalid entry' };
    all[idx] = merged;
    save(all);
    return { entry: merged, error: null };
  }

  function deleteEntry(id) {
    const all = load();
    const next = all.filter((e) => e.id !== id);
    save(next);
    return all.length !== next.length;
  }

  function replaceAll(entries) {
    save(Array.isArray(entries) ? entries : []);
  }

  function clearAll() {
    s.removeItem(KEY);
  }

  // Aggregate statistics for the dashboard.
  function stats() {
    const all = load();
    const byType = {};
    const bySpecialty = {};
    const byEvidence = {};
    let rated = 0;
    let ratingSum = 0;
    for (const e of all) {
      byType[e.type] = (byType[e.type] || 0) + 1;
      if (e.specialty) bySpecialty[e.specialty] = (bySpecialty[e.specialty] || 0) + 1;
      if (e.evidenceLevel) byEvidence[e.evidenceLevel] = (byEvidence[e.evidenceLevel] || 0) + 1;
      if (e.rating) { rated += 1; ratingSum += e.rating; }
    }
    return {
      total: all.length,
      byType,
      bySpecialty,
      byEvidence,
      avgRating: rated ? ratingSum / rated : null,
    };
  }

  return { getAll, getEntry, addEntry, updateEntry, deleteEntry, replaceAll, clearAll, stats, _key: KEY };
}
