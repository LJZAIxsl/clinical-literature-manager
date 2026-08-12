// crossref.js — Optional enrichment: resolve a DOI into metadata via the public
// Crossref REST API (https://api.crossref.org). No API key required.
// Works in the browser (fetch) and in Node 18+ (global fetch).

export async function lookupDOI(doi) {
  const clean = (doi || '').trim();
  if (!clean) throw new Error('DOI is empty');
  const url = `https://api.crossref.org/works/${encodeURIComponent(clean)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Crossref responded ${res.status}`);
  }
  const data = await res.json();
  const msg = data && data.message;
  if (!msg) throw new Error('Unexpected Crossref response');

  const title = Array.isArray(msg.title) ? msg.title[0] : msg.title || '';
  const authors = (msg.author || [])
    .map((a) => [a.given, a.family].filter(Boolean).join(' '))
    .filter(Boolean)
    .join(', ');
  const year = msg.issued && msg.issued['date-parts'] && msg.issued['date-parts'][0]
    ? msg.issued['date-parts'][0][0]
    : null;
  const source = msg['container-title'] && msg['container-title'][0]
    ? msg['container-title'][0]
    : (msg.publisher || '');

  return {
    title,
    authors,
    year: year || null,
    source,
    doi: clean,
    url: msg.URL || `https://doi.org/${clean}`,
  };
}
