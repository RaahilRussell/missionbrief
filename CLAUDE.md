@AGENTS.md

# MissionBrief — project guide for AI assistants

MissionBrief is a **portfolio demo**: a source-backed board packet & grant
report generator for small nonprofits. It is not a production SaaS.

## The one rule that defines this project

**Numbers are deterministic; the LLM only touches prose.** Every metric must be
computed by explicit rules in `lib/extraction/` and carry a citation (source
file, location, evidence, confidence). The optional LLM layer in `lib/ai/` may
rephrase narrative text but must never invent or alter a figure, and must fall
back to deterministic text on any failure. If you add a feature, preserve this
property — it is the entire point of the project.

## Architecture (data flow)

```
file → lib/parsers (structured rows/sections)
     → lib/extraction/metricExtractor (rule-based metrics + citations)
     → Prisma (SourceFile, ExtractedMetric)
     → lib/reports (section builders → assembled markdown + citation appendix)
     → Prisma (Report, Citation)
     → app/reports/[id] (render + citation sidebar + export)
```

## Conventions

- **Strict TypeScript.** No `any` in extraction/parsing/report code.
- **Server components by default**; `"use client"` only for interactive pieces.
- **Prisma is pinned to v6** for clone-and-run simplicity (v7 requires driver
  adapters + a config file). Don't upgrade without revisiting `db:*` scripts.
- **No heavy deps for charts/PDF**: charts are hand-rolled SVG in
  `components/dashboard/`; PDF export uses the browser print dialog.
- Run `npm run build` before committing; it runs `tsc` and catches type errors.

## Local setup

```bash
npm install && npm run db:push && npm run db:seed && npm run dev
```

The seed loads the fictional BrightPath Youth Center dataset from
`sample-data/`. All sample numbers are internally consistent so reports
reconcile.
