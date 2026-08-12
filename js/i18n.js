// i18n.js — Minimal bilingual (中文 / English) label dictionary for the UI.
// The app toggles `lang` and re-renders labels via t(key).

export const STRINGS = {
  appTitle: { zh: '临床文献与指南管理器', en: 'Clinical Literature & Guideline Manager' },
  appSubtitle: {
    zh: '本地优先的文献、指南与证据管理工具（数据保存在你的浏览器中）',
    en: 'A local-first tool to organize guidelines, papers and evidence (data stays in your browser)',
  },
  addEntry: { zh: '新增条目', en: 'Add Entry' },
  editEntry: { zh: '编辑条目', en: 'Edit Entry' },
  searchPlaceholder: { zh: '搜索标题、作者、来源、标签、DOI…', en: 'Search title, authors, source, tags, DOI…' },
  filterType: { zh: '类型', en: 'Type' },
  filterSpecialty: { zh: '专科', en: 'Specialty' },
  filterTag: { zh: '标签', en: 'Tag' },
  filterEvidence: { zh: '证据等级', en: 'Evidence' },
  filterRating: { zh: '最低评分', en: 'Min rating' },
  sortBy: { zh: '排序', en: 'Sort' },
  all: { zh: '全部', en: 'All' },
  title: { zh: '标题', en: 'Title' },
  type: { zh: '类型', en: 'Type' },
  authors: { zh: '作者', en: 'Authors' },
  year: { zh: '年份', en: 'Year' },
  source: { zh: '来源/期刊', en: 'Source / Journal' },
  doi: { zh: 'DOI', en: 'DOI' },
  url: { zh: '链接', en: 'URL' },
  specialty: { zh: '专科/领域', en: 'Specialty' },
  tags: { zh: '标签（逗号分隔）', en: 'Tags (comma separated)' },
  evidenceLevel: { zh: '证据等级 (GRADE)', en: 'Evidence level (GRADE)' },
  rating: { zh: '个人评分 (1-5)', en: 'Personal rating (1-5)' },
  notes: { zh: '笔记/备注', en: 'Notes' },
  fillFromDOI: { zh: '用 DOI 自动填充', en: 'Auto-fill from DOI' },
  save: { zh: '保存', en: 'Save' },
  cancel: { zh: '取消', en: 'Cancel' },
  delete: { zh: '删除', en: 'Delete' },
  confirmDelete: { zh: '确定删除该条目吗？', en: 'Delete this entry?' },
  exportJSON: { zh: '导出 JSON', en: 'Export JSON' },
  exportCSV: { zh: '导出 CSV', en: 'Export CSV' },
  exportMD: { zh: '导出 Markdown', en: 'Export Markdown' },
  importJSON: { zh: '导入 JSON', en: 'Import JSON' },
  stats: { zh: '统计', en: 'Statistics' },
  total: { zh: '条目总数', en: 'Total entries' },
  avgRating: { zh: '平均评分', en: 'Avg rating' },
  noEntries: { zh: '暂无条目。点击「新增条目」开始建立你的文献库。', en: 'No entries yet. Click "Add Entry" to start building your library.' },
  noResults: { zh: '没有匹配的条目。', en: 'No matching entries.' },
  importSuccess: { zh: '成功导入', en: 'Imported' },
  entries: { zh: '条', en: 'entries' },
  bySpecialty: { zh: '按专科', en: 'By specialty' },
  byEvidence: { zh: '按证据等级', en: 'By evidence' },
  langToggle: { zh: 'EN', en: '中文' },
  required: { zh: '（必填）', en: '(required)' },
  about: {
    zh: '数据仅存储在你的浏览器本地（localStorage），不会上传到任何服务器。可使用导出/导入功能备份与迁移。',
    en: 'Data is stored only in your browser (localStorage) and never uploaded. Use export/import to back up or migrate.',
  },
  exportBibTeX: { zh: '导出 BibTeX', en: 'Export BibTeX' },
  batchImport: { zh: '批量导入', en: 'Batch import' },
  loadSamples: { zh: '加载示例文献', en: 'Load samples' },
  batchImportTitle: { zh: '批量导入（DOI / PMID）', en: 'Batch import (DOI / PMID)' },
  batchImportHint: {
    zh: '每行输入一个 DOI 或 PMID，系统通过 Crossref / PubMed 自动解析后入库。纯数字视为 PMID，其余视为 DOI。',
    en: 'One DOI or PMID per line. Resolved via Crossref / PubMed and added to your library. Numeric input is treated as a PMID.',
  },
  batchImportStart: { zh: '解析并导入', en: 'Resolve & import' },
  batchImportDone: { zh: '批量导入完成', en: 'Batch import complete' },
  batchImportProgress: { zh: '正在解析', en: 'Resolving' },
  samplesLoaded: { zh: '已加载示例文献', en: 'Sample entries loaded' },
  tagSynonymsNote: { zh: '同义标签（如 心梗→心肌梗死）会自动合并', en: 'Synonym tags (e.g. 心梗→心肌梗死) are merged automatically' },
};

export function createI18n(initialLang = 'zh') {
  let lang = initialLang === 'en' ? 'en' : 'zh';
  function t(key) {
    return (STRINGS[key] && STRINGS[key][lang]) || key;
  }
  function getLang() { return lang; }
  function setLang(l) { lang = l === 'en' ? 'en' : 'zh'; }
  function toggle() { lang = lang === 'zh' ? 'en' : 'zh'; return lang; }
  return { t, getLang, setLang, toggle };
}
