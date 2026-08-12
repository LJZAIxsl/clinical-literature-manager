// app.js — UI controller for the Clinical Literature & Guideline Manager.
// Connects the pure logic modules (model/store/search/importExport/crossref) to the DOM.

import { createI18n } from './i18n.js';
import { ENTRY_TYPES, EVIDENCE_LEVELS, typeLabel, evidenceLabel } from './model.js';
import { createStore } from './store.js';
import { searchEntries, collectFacets } from './search.js';
import { exportJSON, parseImport, exportCSV, exportMarkdown, exportBibTeX } from './importExport.js';
import { lookupDOI, lookupPMID } from './crossref.js';
import { SAMPLE_ENTRIES } from './samples.js';

const $ = (id) => document.getElementById(id);
const i18n = createI18n('zh');
const store = createStore();

const state = {
  search: '',
  type: 'all',
  specialty: 'all',
  tag: 'all',
  evidence: 'all',
  rating: 'all',
  sort: 'updated',
  editingId: null,
};

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function toast(msg, kind = 'info') {
  let el = $('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:100;padding:10px 16px;border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.2);font-size:14px;';
    document.body.appendChild(el);
  }
  el.style.background = kind === 'error' ? '#dc2626' : '#1e293b';
  el.style.color = '#fff';
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = 'none'; }, 2600);
}

// ---------- Select population ----------
function initStaticSelects() {
  // Toolbar type filter
  fillSelect($('f-type'), [['all', i18n.t('all')], ...Object.keys(ENTRY_TYPES).map((k) => [k, i18n.t('type') && ENTRY_TYPES[k][i18n.getLang()]])]);
  // Form type select
  fillSelect($('f-type-input'), Object.keys(ENTRY_TYPES).map((k) => [k, ENTRY_TYPES[k][i18n.getLang()]]));
  // Toolbar evidence filter — note: key "all" must be added after
  const evTool = [['all', i18n.t('all')]];
  for (const k of Object.keys(EVIDENCE_LEVELS)) evTool.push([k, EVIDENCE_LEVELS[k][i18n.getLang()]]);
  fillSelect($('f-evidence'), evTool);
  // Form evidence select
  const evForm = [['', i18n.t('all') === 'All' ? 'Unrated' : '未评级']];
  for (const k of Object.keys(EVIDENCE_LEVELS)) evForm.push([k, EVIDENCE_LEVELS[k][i18n.getLang()]]);
  fillSelect($('f-evidence-input'), evForm);
}

function fillSelect(sel, pairs) {
  sel.innerHTML = '';
  for (const [value, label] of pairs) {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    sel.appendChild(o);
  }
}

function refreshFacetSelects() {
  const facets = collectFacets(store.getAll());
  const lang = i18n.getLang();
  const specPairs = [['all', i18n.t('all')], ...facets.specialties.map((s) => [s, s])];
  const tagPairs = [['all', i18n.t('all')], ...facets.tags.map((t) => [t, t])];
  fillSelect($('f-specialty'), specPairs);
  fillSelect($('f-tag'), tagPairs);
  // restore previous selection if still present
  if (state.specialty && specPairs.some((p) => p[0] === state.specialty)) $('f-specialty').value = state.specialty;
  if (state.tag && tagPairs.some((p) => p[0] === state.tag)) $('f-tag').value = state.tag;
  // datalists for specialty and tag inputs (autocomplete from existing facets)
  const dlSpec = $('specialty-list');
  dlSpec.innerHTML = '';
  for (const s of facets.specialties) {
    const o = document.createElement('option');
    o.value = s;
    dlSpec.appendChild(o);
  }
  const dlTag = $('tag-list');
  dlTag.innerHTML = '';
  for (const t of facets.tags) {
    const o = document.createElement('option');
    o.value = t;
    dlTag.appendChild(o);
  }
}

// ---------- Rendering ----------
function renderLabels() {
  const lang = i18n.getLang();
  document.documentElement.lang = lang;
  $('app-title').textContent = i18n.t('appTitle');
  $('app-subtitle').textContent = i18n.t('appSubtitle');
  $('lang-toggle').textContent = i18n.t('langToggle');
  $('search').placeholder = i18n.t('searchPlaceholder');
  $('add-btn').textContent = '＋ ' + i18n.t('addEntry');
  $('lbl-type').textContent = i18n.t('filterType');
  $('lbl-specialty').textContent = i18n.t('filterSpecialty');
  $('lbl-tag').textContent = i18n.t('filterTag');
  $('lbl-evidence').textContent = i18n.t('filterEvidence');
  $('lbl-rating').textContent = i18n.t('filterRating');
  $('lbl-sort').textContent = i18n.t('sortBy');
  $('export-json').textContent = i18n.t('exportJSON');
  $('export-csv').textContent = i18n.t('exportCSV');
  $('export-md').textContent = i18n.t('exportMD');
  $('export-bib').textContent = i18n.t('exportBibTeX');
  $('batch-import-btn').textContent = i18n.t('batchImport');
  $('load-samples').textContent = i18n.t('loadSamples');
  $('batch-import-title').textContent = i18n.t('batchImportTitle');
  $('batch-import-hint').textContent = i18n.t('batchImportHint');
  $('batch-import-start').textContent = i18n.t('batchImportStart');
  document.querySelector('label[for="import-file"]').textContent = i18n.t('importJSON');
  $('about-text').textContent = i18n.t('about');
  // refresh select labels that depend on language
  $('f-type').querySelector(`option[value="all"]`).textContent = i18n.t('all');
  $('f-specialty').querySelector(`option[value="all"]`).textContent = i18n.t('all');
  $('f-tag').querySelector(`option[value="all"]`).textContent = i18n.t('all');
  $('f-evidence').querySelector(`option[value="all"]`).textContent = i18n.t('all');
  for (const sel of [$('f-type-input'), $('f-type')]) {
    if (sel) for (const o of sel.options) if (ENTRY_TYPES[o.value]) o.textContent = ENTRY_TYPES[o.value][lang];
  }
  for (const sel of [$('f-evidence-input'), $('f-evidence')]) {
    if (sel) for (const o of sel.options) {
      if (o.value && EVIDENCE_LEVELS[o.value]) o.textContent = EVIDENCE_LEVELS[o.value][lang];
    }
  }
  $('f-rating').querySelector(`option[value="all"]`).textContent = i18n.t('all');
}

function renderStats() {
  const s = store.stats();
  const lang = i18n.getLang();
  let html = `
    <div class="stat-card"><div class="num">${s.total}</div><div class="lbl">${i18n.t('total')}</div></div>
    <div class="stat-card"><div class="num">${s.avgRating ? s.avgRating.toFixed(1) : '—'}</div><div class="lbl">${i18n.t('avgRating')}</div></div>
  `;
  const specEntries = Object.entries(s.bySpecialty).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (specEntries.length) {
    html += `<div class="stat-card" style="flex:2 1 260px"><div class="lbl">${i18n.t('bySpecialty')}</div><div class="chips">` +
      specEntries.map(([k, v]) => `<span class="chip">${esc(k)} · ${v}</span>`).join('') + `</div></div>`;
  }
  const evEntries = Object.entries(s.byEvidence).sort((a, b) => b[1] - a[1]);
  if (evEntries.length) {
    html += `<div class="stat-card" style="flex:2 1 260px"><div class="lbl">${i18n.t('byEvidence')}</div><div class="chips">` +
      evEntries.map(([k, v]) => `<span class="chip ev" style="background:${EVIDENCE_LEVELS[k].color}">${esc(EVIDENCE_LEVELS[k][lang])} · ${v}</span>`).join('') + `</div></div>`;
  }
  $('stats').innerHTML = html;
}

function renderList() {
  const all = store.getAll();
  const results = searchEntries(all, {
    text: state.search, type: state.type, specialty: state.specialty,
    tag: state.tag, evidenceLevel: state.evidence, minRating: state.rating, sort: state.sort,
  });
  const lang = i18n.getLang();
  const list = $('list');

  if (!results.length) {
    list.innerHTML = `<div class="empty">${all.length ? esc(i18n.t('noResults')) : esc(i18n.t('noEntries'))}</div>`;
    return;
  }

  list.innerHTML = results.map((e) => {
    const ev = e.evidenceLevel ? `<span class="badge ev" style="background:${EVIDENCE_LEVELS[e.evidenceLevel].color}">${esc(evidenceLabel(e.evidenceLevel, lang))}</span>` : '';
    const stars = e.rating ? `<span class="stars">${'★'.repeat(e.rating)}${'☆'.repeat(5 - e.rating)}</span>` : '';
    const tags = (e.tags || []).map((t) => `<span class="badge">#${esc(t)}</span>`).join(' ');
    const meta = [typeLabel(e.type, lang), e.year, e.source, e.authors].filter(Boolean).map(esc).join(' · ');
    const links = [e.doi ? `DOI: ${esc(e.doi)}` : '', e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">🔗</a>` : ''].filter(Boolean).join(' ');
    return `
      <article class="card" data-id="${esc(e.id)}">
        <div class="card-head">
          <div>
            <h3 class="card-title">${esc(e.title)}</h3>
            <div class="card-meta">${meta} ${ev} ${stars}</div>
            ${tags ? `<div class="card-tags">${tags}</div>` : ''}
            ${links ? `<div class="card-meta">${links}</div>` : ''}
          </div>
          <div class="card-actions">
            <button class="btn btn-ghost" data-act="edit" data-id="${esc(e.id)}">✏️</button>
            <button class="btn btn-danger" data-act="del" data-id="${esc(e.id)}">🗑</button>
          </div>
        </div>
        ${e.notes ? `<div class="card-notes">${esc(e.notes)}</div>` : ''}
      </article>`;
  }).join('');
}

function renderAll() {
  renderLabels();
  refreshFacetSelects();
  renderStats();
  renderList();
}

// ---------- Modal ----------
function openModal(entry = null) {
  state.editingId = entry ? entry.id : null;
  $('modal-title').textContent = entry ? i18n.t('editEntry') : i18n.t('addEntry');
  $('form-error').classList.add('hidden');
  $('f-id').value = entry ? entry.id : '';
  $('f-title').value = entry ? entry.title : '';
  $('f-type-input').value = entry ? entry.type : 'guideline';
  $('f-year').value = entry && entry.year != null ? entry.year : '';
  $('f-authors').value = entry ? entry.authors : '';
  $('f-source').value = entry ? entry.source : '';
  $('f-doi').value = entry ? entry.doi : '';
  $('f-url').value = entry ? entry.url : '';
  $('f-specialty-input').value = entry ? entry.specialty : '';
  $('f-tags').value = entry && entry.tags ? entry.tags.join(', ') : '';
  $('f-evidence-input').value = entry && entry.evidenceLevel ? entry.evidenceLevel : '';
  $('f-rating-input').value = entry && entry.rating ? entry.rating : '';
  $('f-notes').value = entry ? entry.notes : '';
  $('modal').classList.remove('hidden');
  $('f-title').focus();
}

function closeModal() {
  $('modal').classList.add('hidden');
}

function readForm() {
  return {
    title: $('f-title').value.trim(),
    type: $('f-type-input').value,
    year: $('f-year').value,
    authors: $('f-authors').value.trim(),
    source: $('f-source').value.trim(),
    doi: $('f-doi').value.trim(),
    url: $('f-url').value.trim(),
    specialty: $('f-specialty-input').value.trim(),
    tags: $('f-tags').value.split(',').map((t) => t.trim()).filter(Boolean),
    evidenceLevel: $('f-evidence-input').value || null,
    rating: $('f-rating-input').value || null,
    notes: $('f-notes').value.trim(),
  };
}

function submitForm(ev) {
  ev.preventDefault();
  const data = readForm();
  if (!data.title) {
    showFormError(i18n.t('title') + ' ' + i18n.t('required'));
    return;
  }
  let res;
  if (state.editingId) {
    res = store.updateEntry(state.editingId, data);
  } else {
    res = store.addEntry(data);
  }
  if (res.error) {
    showFormError(res.error);
    return;
  }
  closeModal();
  renderAll();
}

function showFormError(msg) {
  const el = $('form-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ---------- Events ----------
function bindEvents() {
  $('lang-toggle').addEventListener('click', () => { i18n.toggle(); renderAll(); });
  $('search').addEventListener('input', (e) => { state.search = e.target.value; renderList(); });
  $('f-type').addEventListener('change', (e) => { state.type = e.target.value; renderList(); });
  $('f-specialty').addEventListener('change', (e) => { state.specialty = e.target.value; renderList(); });
  $('f-tag').addEventListener('change', (e) => { state.tag = e.target.value; renderList(); });
  $('f-evidence').addEventListener('change', (e) => { state.evidence = e.target.value; renderList(); });
  $('f-rating').addEventListener('change', (e) => { state.rating = e.target.value; renderList(); });
  $('f-sort').addEventListener('change', (e) => { state.sort = e.target.value; renderList(); });

  $('add-btn').addEventListener('click', () => openModal(null));
  $('modal-close').addEventListener('click', closeModal);
  $('form-cancel').addEventListener('click', closeModal);
  $('entry-form').addEventListener('submit', submitForm);
  $('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });

  $('list').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (btn.getAttribute('data-act') === 'edit') {
      const entry = store.getEntry(id);
      if (entry) openModal(entry);
    } else if (btn.getAttribute('data-act') === 'del') {
      if (confirm(i18n.t('confirmDelete'))) {
        store.deleteEntry(id);
        renderAll();
      }
    }
  });

  $('doi-fill').addEventListener('click', async () => {
    const doi = $('f-doi').value.trim();
    if (!doi) { toast(i18n.t('doi') + ' ' + i18n.t('required'), 'error'); return; }
    try {
      const m = await lookupDOI(doi);
      if (!m.title) return;
      if (!m.title && !m.authors) return;
      $('f-title').value = m.title || $('f-title').value;
      $('f-authors').value = m.authors || $('f-authors').value;
      $('f-year').value = m.year || $('f-year').value;
      $('f-source').value = m.source || $('f-source').value;
      $('f-url').value = m.url || $('f-url').value;
      toast(i18n.t('fillFromDOI') + ' ✓');
    } catch (err) {
      toast(err.message || 'Crossref error', 'error');
    }
  });

  $('export-json').addEventListener('click', () => download('literature.json', exportJSON(store.getAll()), 'application/json'));
  $('export-csv').addEventListener('click', () => download('literature.csv', exportCSV(store.getAll()), 'text/csv'));
  $('export-md').addEventListener('click', () => download('literature.md', exportMarkdown(store.getAll()), 'text/markdown'));

  $('import-file').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseImport(String(reader.result));
      if (result.errors.length && !result.entries.length) {
        toast(result.errors.join('; '), 'error');
      } else {
        const merged = store.getAll().concat(result.entries);
        store.replaceAll(merged);
        renderAll();
        toast(`${i18n.t('importSuccess')} ${result.entries.length} ${i18n.t('entries')}` + (result.skipped ? ` (${result.skipped} skipped)` : ''));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  $('export-bib').addEventListener('click', () => download('literature.bib', exportBibTeX(store.getAll()), 'application/x-bibtex'));

  $('load-samples').addEventListener('click', () => {
    const existing = new Set(store.getAll().map((e) => e.title));
    let added = 0;
    for (const s of SAMPLE_ENTRIES) {
      if (existing.has(s.title)) continue;
      const res = store.addEntry(s);
      if (!res.error) added += 1;
    }
    renderAll();
    toast(`${i18n.t('samplesLoaded')}: +${added}`);
  });

  $('batch-import-btn').addEventListener('click', () => $('batch-modal').classList.remove('hidden'));
  $('batch-close').addEventListener('click', () => $('batch-modal').classList.add('hidden'));
  $('batch-cancel').addEventListener('click', () => $('batch-modal').classList.add('hidden'));
  $('batch-modal').addEventListener('click', (e) => { if (e.target === $('batch-modal')) $('batch-modal').classList.add('hidden'); });
  $('batch-start').addEventListener('click', runBatchImport);
}

// Resolve a list of DOIs / PMIDs (one per line) via Crossref / PubMed and add
// each successfully resolved record to the store.
async function runBatchImport() {
  const raw = $('batch-input').value;
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) { toast(i18n.t('batchImportHint'), 'error'); return; }
  $('batch-status').textContent = '';
  let ok = 0;
  let fail = 0;
  const fails = [];
  for (let i = 0; i < lines.length; i++) {
    const token = lines[i];
    $('batch-status').textContent = `${i18n.t('batchImportProgress')} ${i + 1}/${lines.length}: ${token}`;
    try {
      const meta = /^\d+$/.test(token) ? await lookupPMID(token) : await lookupDOI(token);
      const res = store.addEntry({
        title: meta.title || token,
        authors: meta.authors || '',
        year: meta.year,
        source: meta.source || '',
        doi: meta.doi || '',
        url: meta.url || '',
        type: 'other',
      });
      if (res.error) { fail += 1; fails.push(`${token}: ${res.error}`); }
      else ok += 1;
    } catch (err) {
      fail += 1; fails.push(`${token}: ${err.message}`);
    }
  }
  $('batch-status').textContent =
    `${i18n.t('batchImportDone')} — ${ok} OK, ${fail} failed` + (fails.length ? `\n${fails.join('\n')}` : '');
  if (ok) { renderAll(); toast(`${i18n.t('batchImportDone')}: +${ok}`); }
  if (fail) toast(`${fail} failed`, 'error');
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- Boot ----------
function main() {
  initStaticSelects();
  bindEvents();
  renderAll();
}
main();
