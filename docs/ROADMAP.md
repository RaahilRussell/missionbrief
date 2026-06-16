# Roadmap

MissionBrief is a portfolio demo. This roadmap sketches how it would grow toward
a real product, roughly in priority order. Nothing here is committed work.

## Near term — deepen the core

- **More extractors.** Outcome trends over time, cost-per-youth-served, donor
  retention rate, restricted vs. unrestricted funds.
- **Confidence calibration.** Replace heuristic confidence with rules tied to
  data completeness (e.g. missing rows lower confidence).
- **Per-claim drill-down.** Click a `[n]` in the rendered report to highlight
  the exact source row, not just the citation entry.
- **Schema-aware CSV mapping.** Let users map unrecognized columns to known
  metric inputs when filename heuristics aren't enough.

## Mid term — usability

- **Multiple workspaces** with switcher (the data model already scopes by
  workspace).
- **Report editing** — tweak generated prose inline while keeping numbers
  locked and re-validated against citations.
- **Period comparison** — month-over-month / quarter deltas with cited deltas.
- **Richer export** — native PDF (server-side) and a board-deck (slides) export.
- **Saved report templates** per organization.

## Long term — productization

- **Auth + multi-tenant** persistence (move off single-workspace SQLite to
  Postgres).
- **Integrations** — pull directly from QuickBooks, Bloomerang/Salesforce NPSP,
  attendance systems, instead of file upload.
- **Validation rules engine** — flag inconsistencies across files (e.g. budget
  spent that exceeds grant award) before reporting.
- **Audit log** — track which sources produced which report, with versioning.

## Explicit non-goals (for the demo)

- Real authentication, billing, or data-security guarantees.
- Storing real nonprofit data.
- Letting the LLM compute or alter any numeric value — ever.
