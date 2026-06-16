# Product Brief — MissionBrief

## The problem

Small nonprofits spend disproportionate time on reporting. Program staff keep
data in spreadsheets, Google Docs, and email; budgets live in one place, grant
agreements in another, attendance logs in a third. When a board meeting or a
funder deadline arrives, someone manually stitches these together into a packet
— and the numbers are easy to get wrong, hard to verify, and rarely traceable.

Generic "AI summarizers" make this *worse* for reporting: they produce fluent
prose with numbers that may or may not match the source. For a funder report,
an unverifiable number is a liability.

## The product

MissionBrief is an AI reporting copilot that produces **source-backed** reports.
The user loads their files; MissionBrief extracts the metrics that matter,
attaches a citation to each, and assembles board packets and grant updates where
every figure links back to a file and row.

### Core user flows

1. **Demo workspace** — one-click load of a realistic fictional nonprofit so the
   value is visible in under two minutes.
2. **Upload / import** — drop in CSV, Markdown, TXT, or JSON; files are parsed
   into structured rows and sections.
3. **Metric review** — see every extracted metric, its source, evidence, and
   confidence, before generating anything.
4. **Report builder** — choose a report type, period, and tone, then generate.
5. **Source-backed preview** — read the report with a live citation sidebar;
   trace any claim to its origin.
6. **Export** — Markdown, copy-to-clipboard, or print-to-PDF.

### Report types

- **Monthly Board Packet** — exec summary, KPIs, finances, grant status, risks,
  decisions needed.
- **Grant Progress Update** — goals, activities, outcomes, budget usage,
  variance, next steps.
- **Executive Summary** — one-page narrative with headline KPIs.
- **KPI Snapshot** — compact source-backed KPI table.
- **Risk & Needs Memo** — risks, blockers, grant status, board asks.

## What makes it credible

- **Deterministic extraction.** The numbers are computed by rules, not a model.
- **Citations everywhere.** Each metric and each report claim has a verifiable
  origin and a confidence score.
- **Local-first.** Runs on SQLite with no API keys; the optional LLM only
  rephrases prose and is fully isolated.

## Who it's for

Executive directors, program managers, and development staff at small nonprofits
who need trustworthy reports fast — and the funders and boards who consume them.

## Scope (this demo)

In scope: the full ingest → extract → cite → assemble → export pipeline with a
polished UI and a realistic demo dataset. Out of scope: multi-tenant auth,
real-time collaboration, integrations with accounting/CRM systems, and
production data security. See [`LIMITATIONS.md`](LIMITATIONS.md).
