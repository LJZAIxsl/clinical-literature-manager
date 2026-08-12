# 临床文献与指南管理器 · Clinical Literature & Guideline Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/LJZAIxsl/clinical-literature-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/LJZAIxsl/clinical-literature-manager/actions/workflows/ci.yml)

> 一个**本地优先 (local-first)** 的开源工具，帮助临床医生、规培生与医学生
> 整理指南、文献与证据——数据只保存在你自己的浏览器里，不上传任何服务器。
>
> A **local-first**, open-source tool that helps clinicians, residents and medical
> students organize guidelines, papers and evidence. Your data stays in your own
> browser and is never uploaded to any server.

---

## ✨ 功能 / Features

- **增删改查**：记录指南、RCT、系统评价、荟萃分析、观察性研究、综述等文献条目。
  CRUD for guidelines, RCTs, systematic reviews, meta-analyses, observational
  studies, reviews and more.
- **结构化字段**：标题、类型、作者、年份、来源/期刊、DOI、链接、专科、标签、
  GRADE 证据等级、个人评分 (1–5)、笔记。
  Structured fields incl. type, authors, year, source, DOI, URL, specialty,
  tags, GRADE evidence level, personal rating (1–5) and free-text notes.
- **搜索与筛选**：按关键词、类型、专科、标签、证据等级、最低评分筛选，并支持排序。
  Search & filter by text, type, specialty, tag, evidence level, min rating, with sorting.
- **DOI 自动填充**：输入 DOI 即可通过 Crossref 公共 API 自动补全题名、作者、年份、来源。
  Auto-fill metadata from a DOI via the public Crossref API.
- **导入 / 导出**：支持 JSON / CSV / Markdown / **BibTeX** 导出，JSON 导入（便于备份与迁移）。
  Import / export as JSON / CSV / Markdown / **BibTeX** for backup and portability.
- **批量导入**：在「批量导入」中输入多个 DOI 或 PMID（每行一个），自动经
  Crossref / PubMed 解析后入库。Batch import many DOIs / PMIDs at once.
- **标签自动补全与同义词合并**：标签框带历史标签自动补全；`心梗 / mi / MI`、
  `房颤 / af` 等别名会自动合并为规范词，保证筛选一致。
  Tag autocomplete plus synonym merging (e.g. 心梗→心肌梗死, af→心房颤动).
- **一键加载示例文献**：内置 6 条真实经典临床文献（Sepsis-3、高血压、房颤、
  ARDS、急性冠脉综合征、糖尿病指南），首屏即见内容。Load curated sample references.
- **统计面板**：按专科、按证据等级聚合，展示条目总数与平均评分。
  A dashboard aggregating entries by specialty and evidence level.
- **中英文界面**：一键切换。 Bilingual UI (中文 / English).
- **零依赖、零后端**：纯 HTML/CSS/JS，打开即用，可直接部署到 GitHub Pages。
  Zero dependencies, no backend. Pure HTML/CSS/JS — runs anywhere, deployable to GitHub Pages.

## 🚀 使用 / How to use

**方式一：直接打开**
下载 `index.html`，用浏览器打开即可使用（数据保存在浏览器 localStorage）。

**方式二：GitHub Pages（在线版）**
打开部署后的页面，无需安装。

**方式三：本地开发**
```bash
# 任选一个静态服务器
python3 -m http.server 8000
# 或
npx serve .
```
然后访问 `http://localhost:8000`。

> 所有数据保存在浏览器的 `localStorage`，清除浏览器数据会丢失，请定期使用「导出 JSON」备份。
> All data lives in the browser's `localStorage`. Use **Export JSON** to back up.

## 🧪 开发 / Development

核心逻辑（数据模型、校验、搜索、导入导出）是纯函数，可在 Node 下单元测试：

```bash
npm test          # 运行所有单元测试 (node --test)
```

项目结构：

```
clinical-literature-manager/
├── index.html            # 单页应用入口
├── css/style.css         # 样式
├── js/
│   ├── model.js          # 数据模型、校验、常量（纯函数）
│   ├── store.js          # 持久化层（localStorage / 可注入存储）
│   ├── search.js         # 搜索与筛选（纯函数）
│   ├── importExport.js   # JSON / CSV / Markdown 导入导出（纯函数）
│   ├── crossref.js       # DOI / PMID 元数据获取
│   ├── i18n.js           # 中英文案
│   ├── samples.js        # 内置示例文献
│   └── app.js            # UI 控制器
├── tests/                # Node 单元测试
└── docs/DATA_MODEL.md    # 数据模型说明
```

## 🤝 贡献 / Contributing

欢迎 Issue 与 Pull Request！无论是新增字段、新的导出格式、UI 改进还是翻译，都很有价值。
Contributions are welcome — new fields, export formats, UI improvements, translations…

请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📌 路线图 / Roadmap

参见 [Issues](https://github.com/LJZAIxsl/clinical-literature-manager/issues) 中的
`enhancement` 标签。Roadmap items are tracked as `enhancement` issues.

**已实现 / Implemented**
- ✅ BibTeX 导出 / BibTeX export
- ✅ Crossref / PubMed 批量导入 / batch import
- ✅ 标签自动补全与同义词 / tag autocomplete & synonyms
- ✅ 示例文献 / sample references

**规划中 / Planned**
- 多库（项目）管理 / multiple libraries
- 可选云同步 / optional cloud sync

## ⚠️ 免责声明 / Disclaimer

本工具仅用于**个人文献管理与学习**，不构成任何医疗建议。临床决策请遵循所在机构的
最新指南与专业判断。
This tool is for **personal literature management and study only** and does not
constitute medical advice. Clinical decisions should follow your institution's
current guidelines and professional judgment.

## 📄 许可证 / License

[MIT](LICENSE) © 2026 LJZAIxsl
