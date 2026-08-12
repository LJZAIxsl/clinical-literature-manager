# 贡献指南 / Contributing

感谢你考虑为 **临床文献与指南管理器** 做出贡献！
Thanks for considering contributing to the **Clinical Literature & Guideline Manager**!

## 行为准则 / Code of Conduct

请保持友善、专业。我们欢迎任何能提升工具价值与可用性的贡献。
Be friendly and professional. We welcome anything that improves the tool's value and usability.

## 如何贡献 / How to contribute

1. **Fork** 本仓库并创建你的分支：`git checkout -b feat/my-idea`
2. 在本地运行测试确保通过：`npm test`
3. 提交改动并 **Push** 到你的 Fork
4. 发起 **Pull Request**，描述你做了什么、为什么

## 开发约定 / Development notes

- 核心逻辑（`js/model.js`、`store.js`、`search.js`、`importExport.js`）保持为**纯函数**，
  不依赖 DOM，便于在 Node 下单元测试。
  Keep core logic pure (no DOM) so it stays unit-testable under Node.
- UI 逻辑放在 `js/app.js`，文案集中在 `js/i18n.js`，新增界面文本请同步中文与英文。
  UI logic lives in `app.js`; strings live in `i18n.js` — keep both 中文 and English in sync.
- 提交信息建议清晰描述改动（中英文皆可）。
  Write clear commit messages (Chinese or English is fine).

## 适合新手的贡献 / Good first contributions

- 新增一种导出格式（如 BibTeX）
- 改进移动端样式
- 增补更多文献类型或专科示例
- 修复文档错别字

提交 Issue 前请先搜索是否已有类似建议，避免重复。
Before opening an issue, please search existing ones to avoid duplicates.
