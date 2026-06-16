# Architecture

MissionBrief is a single Next.js (App Router) application backed by SQLite via
Prisma. The defining design choice: **deterministic metric extraction with
citations**, with the language model strictly confined to prose.

## Data flow

```
            ┌─────────────┐
 raw file → │  lib/parsers │ → ParsedFile { rows[], headers[], sections[] }
            └─────────────┘
                   │
                   ▼
        ┌────────────────────────┐
        │ lib/extraction/         │ → ExtractedMetricInput[]
        │   metricExtractor       │    (name, value, unit, category,
        │   (rule-based, per      │     sourceLocation, evidence, confidence)
        │    file category)       │
        └────────────────────────┘
                   │
                   ▼
        Prisma: SourceFile, ExtractedMetric
                   │
                   ▼
        ┌────────────────────────┐
        │ lib/reports/            │
        │   sections (builders)   │ ← metrics, each cite() call records a
        │   assemble              │   numbered citation
        │   + lib/ai (optional    │
        │     prose polish only)  │
        └────────────────────────┘
                   │
                   ▼
        Prisma: Report, Citation
                   │
                   ▼
        app/reports/[id]: markdown render + citation sidebar + export
```

## Layers

### Parsing — `lib/parsers/`

- `csvParser` — quote-aware record splitting → `rows` (array of objects keyed by
  header) + `headers`.
- `markdownParser` — splits by heading into `sections`; `parseMarkdownTable`
  reads GFM tables (used for grant milestones).
- `textParser`, `jsonParser` — line-based and array-based fallbacks.
- `index.ts` — `detectFileType`, `parseFile`, and `detectCategory` (infers a
  file's role from its name, conservatively).

### Extraction — `lib/extraction/`

- `metricExtractor.ts` — dispatches on file category (attendance, budget,
  donors, outcomes, grant, notes) to dedicated extractors. Each metric records a
  **file-relative** `sourceLocation` (e.g. `rows 2-31`, `row 2`,
  `Milestones table (line 24)`), an evidence snippet, and a confidence score.
- `citationBuilder.ts` — `CitationCollector` dedupes citations by source key and
  returns `[n]` markers; `toMarkdownAppendix()` renders the numbered appendix.

The filename is stored separately on each metric (`sourceFileName`) and is *not*
embedded in `sourceLocation`, so the citation appendix can format it once.

### Reports — `lib/reports/`

- `sections.ts` — pure section builders (executive summary, KPI dashboard,
  financial snapshot, grant status, risks, etc.). Each pulls from the metric set
  and calls `cite()` to attach evidence to a claim.
- `assemble.ts` — composes a header, the section bodies, and the
  `## Appendix: Source Evidence` block.
- `index.ts` — `generateReport()` dispatches by report type.
- `markdownExporter.ts` / `pdfExporter.ts` — Markdown document + browser print.

### Optional LLM — `lib/ai/`

- `llmClient.ts` — `getConfiguredEngine()` reads `REPORT_ENGINE`;
  `polishNarrative()` dispatches to OpenAI / Ollama / mock and **falls back to
  the deterministic text on any error**. The system prompt forbids changing
  numbers. The LLM never sees or computes a metric — only narrative strings.

### Persistence — Prisma + SQLite

Five models: `Workspace`, `SourceFile`, `ExtractedMetric`, `Report`,
`Citation`. Cascade deletes keep the single-workspace demo clean. SQLite keeps
the project clone-and-run with no external database.

### App — `app/`

- Pages are server components that query Prisma directly via `lib/queries.ts`.
- Interactive pieces (`SampleDataControls`, `UploadForm`, `ReportForm`,
  `ReportActions`) are client components that call API route handlers.
- API route handlers under `app/api/` cover seed, reset, upload, report
  generate/delete, file delete, and Markdown export.

## Why these choices

- **Prisma v6, not v7** — v7 requires driver adapters and a config file; v6
  keeps `npm install && db:push` working out of the box.
- **Hand-rolled SVG charts** — no charting dependency, no React 19 peer-dep
  friction, and full control over the print layout.
- **Browser-print PDF** — avoids bundling a headless browser; the print CSS in
  `globals.css` produces a clean document.
- **tsx for the seed** — runs the TypeScript seed directly and resolves the
  `@/*` path alias from `tsconfig`.
