// model.js — Data schema, constants and validation for clinical literature entries.
// Pure module: no DOM dependencies, so it can run in the browser and under Node tests.

export const ENTRY_TYPES = {
  guideline: { zh: '临床指南', en: 'Clinical Guideline' },
  rct: { zh: '随机对照试验 (RCT)', en: 'Randomized Controlled Trial' },
  systematic_review: { zh: '系统评价', en: 'Systematic Review' },
  meta_analysis: { zh: '荟萃分析', en: 'Meta-Analysis' },
  observational: { zh: '观察性研究', en: 'Observational Study' },
  case_report: { zh: '病例报告', en: 'Case Report' },
  review: { zh: '综述', en: 'Review' },
  other: { zh: '其他', en: 'Other' },
};

// GRADE-style evidence confidence levels.
export const EVIDENCE_LEVELS = {
  high: { zh: '高质量 (High)', en: 'High', color: '#1b7f3b' },
  moderate: { zh: '中等质量 (Moderate)', en: 'Moderate', color: '#7fae1b' },
  low: { zh: '低质量 (Low)', en: 'Low', color: '#d98c00' },
  very_low: { zh: '极低质量 (Very Low)', en: 'Very Low', color: '#c0392b' },
};

export function nowISO() {
  return new Date().toISOString();
}

// RFC4122-ish v4 UUID. Uses crypto when available, falls back to Math.random.
export function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const out = [];
  for (const t of tags) {
    if (typeof t !== 'string') continue;
    const s = t.trim();
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

export function normalizeYear(year) {
  if (year === '' || year === null || year === undefined) return null;
  const n = Number(year);
  if (!Number.isFinite(n)) return null;
  const y = Math.trunc(n);
  if (y < 1900 || y > 2100) return null;
  return y;
}

export function normalizeRating(rating) {
  if (rating === '' || rating === null || rating === undefined) return null;
  const n = Number(rating);
  if (!Number.isFinite(n)) return null;
  const r = Math.trunc(n);
  if (r < 1 || r > 5) return null;
  return r;
}

// Build a complete, valid entry from a partial input object.
export function buildEntry(input = {}) {
  const base = {
    id: uuid(),
    title: '',
    type: 'guideline',
    authors: '',
    year: null,
    source: '',
    doi: '',
    url: '',
    specialty: '',
    tags: [],
    evidenceLevel: null,
    rating: null,
    notes: '',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  const merged = { ...base, ...input };
  return {
    ...merged,
    id: merged.id || uuid(),
    type: ENTRY_TYPES[merged.type] ? merged.type : 'other',
    year: normalizeYear(merged.year),
    tags: normalizeTags(merged.tags),
    evidenceLevel: merged.evidenceLevel && EVIDENCE_LEVELS[merged.evidenceLevel] ? merged.evidenceLevel : null,
    rating: normalizeRating(merged.rating),
    createdAt: merged.createdAt || nowISO(),
    updatedAt: nowISO(),
  };
}

// Validate an entry. Returns { valid, errors: [{ field, message }] }.
export function validateEntry(entry) {
  const errors = [];
  if (!entry) {
    return { valid: false, errors: [{ field: 'entry', message: 'Entry is missing' }] };
  }
  const title = (entry.title || '').trim();
  if (!title) errors.push({ field: 'title', message: 'Title is required' });
  if (entry.type && !ENTRY_TYPES[entry.type]) {
    errors.push({ field: 'type', message: `Unknown entry type: ${entry.type}` });
  }
  if (entry.evidenceLevel && !EVIDENCE_LEVELS[entry.evidenceLevel]) {
    errors.push({ field: 'evidenceLevel', message: `Unknown evidence level: ${entry.evidenceLevel}` });
  }
  if (entry.doi) {
    // Loose DOI sanity check: prefix "10." and at least one "/".
    if (!/^10\.\d{4,9}\/\S+$/.test(entry.doi.trim())) {
      errors.push({ field: 'doi', message: 'DOI format looks invalid (expected e.g. 10.1001/jama.2020.1234)' });
    }
  }
  if (entry.url) {
    try {
      // eslint-disable-next-line no-new
      new URL(entry.url.trim());
    } catch {
      errors.push({ field: 'url', message: 'URL is not a valid absolute URL' });
    }
  }
  return { valid: errors.length === 0, errors };
}

export function evidenceLabel(level, lang = 'zh') {
  if (!level || !EVIDENCE_LEVELS[level]) return lang === 'zh' ? '未评级' : 'Unrated';
  return EVIDENCE_LEVELS[level][lang] || EVIDENCE_LEVELS[level].en;
}

export function typeLabel(type, lang = 'zh') {
  if (!type || !ENTRY_TYPES[type]) return lang === 'zh' ? '其他' : 'Other';
  return ENTRY_TYPES[type][lang] || ENTRY_TYPES[type].en;
}
