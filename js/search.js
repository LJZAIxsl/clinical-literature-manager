// search.js — Filtering and text search over clinical literature entries.
// Pure functions, no DOM, unit-testable under Node.

function norm(str) {
  return (str || '').toString().toLowerCase().trim();
}

// query: { text, type, specialty, tag, evidenceLevel, minRating, sort }
// sort: 'updated' | 'title' | 'year' | 'rating' (default 'updated')
export function searchEntries(entries, query = {}) {
  const q = query || {};
  const text = norm(q.text);
  const type = q.type && q.type !== 'all' ? q.type : null;
  const specialty = q.specialty && q.specialty !== 'all' ? norm(q.specialty) : null;
  const tag = q.tag && q.tag !== 'all' ? norm(q.tag) : null;
  const evidenceLevel = q.evidenceLevel && q.evidenceLevel !== 'all' ? q.evidenceLevel : null;
  const minRating = q.minRating ? Number(q.minRating) : null;

  const filtered = entries.filter((e) => {
    if (type && e.type !== type) return false;
    if (specialty && norm(e.specialty) !== specialty) return false;
    if (tag && !(e.tags || []).some((t) => norm(t) === tag)) return false;
    if (evidenceLevel && e.evidenceLevel !== evidenceLevel) return false;
    if (minRating && (!e.rating || e.rating < minRating)) return false;
    if (text) {
      const hay = [
        e.title,
        e.authors,
        e.source,
        e.doi,
        e.specialty,
        e.notes,
        (e.tags || []).join(' '),
      ].join(' ').toLowerCase();
      if (!hay.includes(text)) return false;
    }
    return true;
  });

  const sort = q.sort || 'updated';
  const sorted = filtered.slice();
  sorted.sort((a, b) => {
    switch (sort) {
      case 'title':
        return norm(a.title).localeCompare(norm(b.title));
      case 'year':
        return (b.year || 0) - (a.year || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'updated':
      default:
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
    }
  });
  return sorted;
}

// Collect the distinct set of specialties and tags across entries (for filter UIs).
export function collectFacets(entries) {
  const specialties = new Set();
  const tags = new Set();
  for (const e of entries) {
    if (e.specialty) specialties.add(e.specialty);
    for (const t of e.tags || []) if (t) tags.add(t);
  }
  return {
    specialties: Array.from(specialties).sort((a, b) => a.localeCompare(b)),
    tags: Array.from(tags).sort((a, b) => a.localeCompare(b)),
  };
}
