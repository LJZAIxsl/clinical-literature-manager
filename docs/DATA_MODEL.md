# 数据模型 / Data Model

每条文献条目（entry）是一个 JSON 对象，持久化于浏览器 `localStorage`
（key：`clm.entries.v1`，值为条目数组）。所有字段均为可选，除 `title` 外。
Each literature entry is a JSON object persisted in the browser's `localStorage`
(key `clm.entries.v1`, an array of entries). All fields are optional except `title`.

## 字段 / Fields

| 字段 / Field | 类型 / Type | 说明 / Description |
| --- | --- | --- |
| `id` | string (UUID) | 唯一标识，自动生成 / Unique id, auto-generated |
| `title` | string | **必填** 题名 / **Required** title |
| `type` | enum | `guideline` `rct` `systematic_review` `meta_analysis` `observational` `case_report` `review` `other` |
| `authors` | string | 作者，逗号分隔 / Authors (comma separated) |
| `year` | number \| null | 出版年份 (1900–2100) / Publication year |
| `source` | string | 来源 / 期刊名 / Source / journal |
| `doi` | string | 数字对象标识符（格式校验）/ DOI (format-checked) |
| `url` | string | 链接（绝对 URL）/ Link (absolute URL) |
| `specialty` | string | 专科 / 领域 / Specialty / domain |
| `tags` | string[] | 标签，自动去重去空 / Tags (deduped, trimmed) |
| `evidenceLevel` | enum \| null | `high` `moderate` `low` `very_low`（GRADE）/ GRADE level |
| `rating` | number (1–5) \| null | 个人评分 / Personal rating |
| `notes` | string | 笔记 / 备注 / Free-text notes |
| `createdAt` | ISO string | 创建时间 / Created time |
| `updatedAt` | ISO string | 更新时间 / Updated time |

## 校验规则 / Validation

- `title` 不能为空 / must not be empty.
- `type`、`evidenceLevel` 必须是已知枚举值，否则回退为 `other` / `null`。
- `doi` 需匹配 `^10\.\d{4,9}/\S+$`；`url` 必须是合法绝对 URL。
- `year` 限定在 1900–2100；`rating` 限定在 1–5。

## 导出格式 / Export formats

- **JSON**：完整条目数组，可用于备份与再导入。
- **CSV**：扁平表，便于在 Excel / 统计软件中分析。
- **Markdown**：便于粘贴到笔记或文档中。

导入时会自动为每个条目生成新的 `id`，避免与现有数据冲突；
校验失败的条目会被跳过并计入 `skipped`。
