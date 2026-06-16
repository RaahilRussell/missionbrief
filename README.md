# MissionBrief

**Source-backed board packet & grant report generator for small nonprofits.**

MissionBrief turns messy nonprofit files — program logs, budgets, grant
agreements, donor exports — into funder-ready reports where **every number is
traceable to the file and row it came from.**

> This is a portfolio demo, not a production SaaS. The bundled "BrightPath Youth
> Center" dataset is fictional and internally consistent so every figure
> reconciles.

---

## Why it's different

Most "AI report generators" hand a document to a language model and hope the
numbers come back right. MissionBrief inverts that:

- **Metrics are extracted deterministically** by explicit, rule-based
  extractors — summing CSV columns, reading milestone tables, scanning notes for
  risk flags. No model guesses a figure.
- **Every metric carries a citation**: source file, row range or section, an
  evidence snippet, and a confidence score.
- **Reports are assembled from cited metrics.** An optional LLM may smooth the
  prose, but it is forbidden from touching figures and falls back to
  deterministic text on any error.

The hard, valuable part is the **audit trail** — not the prose.

---

## Quick start

Requires Node 18+ (Node 20+ recommended).

```bash
npm install
cp .env.example .env        # defaults work out of the box
npm run db:push             # create the SQLite schema
npm run db:seed             # load the BrightPath demo dataset
npm run dev                 # http://localhost:3000
```

Then open the app and click **Load BrightPath Demo Data** (or just visit
`/dashboard` — the seed already populated it).

To generate a report: **Generate Report → pick a type → Generate**, then trace
each claim in the citation sidebar and export to Markdown or PDF.

---

## What you can do

| Page | What it does |
| --- | --- |
| `/` | Landing page explaining the source-backed approach |
| `/dashboard` | KPIs, attendance chart, budget utilization, grant milestones |
| `/files` | Upload CSV/MD/TXT/JSON or load the demo set; see parsed files |
| `/metrics` | Every extracted metric with source, evidence, and confidence |
| `/reports/new` | Generate a board packet, grant update, summary, KPI snapshot, or risk memo |
| `/reports/[id]` | The generated report with an inline citation sidebar + export |
| `/project` | How the pipeline works and the tech stack |

**Report types:** Monthly Board Packet · Grant Progress Update · Executive
Summary · KPI Snapshot · Risk & Needs Memo.

**Export:** Markdown download · copy to clipboard · print-to-PDF (clean print
layout).

---

## Tech stack

- **Next.js** (App Router) + **TypeScript** (strict)
- **Prisma** + **SQLite** — local-first, no cloud database
- **Tailwind CSS v4**
- **Optional LLM** — OpenAI or local Ollama, isolated to narrative polish only

---

## Optional: enable LLM polish

The app runs fully offline by default (`REPORT_ENGINE=deterministic`). To let a
model rephrase narrative sections (numbers stay deterministic):

```bash
# OpenAI
REPORT_ENGINE=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# or local Ollama
REPORT_ENGINE=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

If the model is unreachable or errors, generation silently falls back to the
deterministic narrative.

---

## Project layout

```
app/                Next.js routes (pages + API route handlers)
components/          UI components, charts, shell
lib/
  parsers/          CSV / Markdown / TXT / JSON → structured form
  extraction/       Rule-based metric extractors + citation builder
  reports/          Section builders, report assembly, exporters
  ai/               Optional LLM clients (OpenAI / Ollama / mock)
prisma/             Schema + seed
sample-data/        Fictional BrightPath Youth Center files
docs/               Product brief, architecture, roadmap, demo script, limitations
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full pipeline and
[`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) for honest caveats.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Apply the Prisma schema to SQLite |
| `npm run db:seed` | Load the BrightPath demo dataset |
| `npm run db:reset` | Reset the schema and reseed |
| `npm run lint` | Lint |

---

## License

MIT. Sample data is fictional and provided for demonstration only.
