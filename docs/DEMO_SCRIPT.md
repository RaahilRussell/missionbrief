# Demo Script

A two-minute walkthrough for showing MissionBrief live. The goal is to land one
idea: **every number in the report is traceable to its source.**

## Setup (once)

```bash
npm install && npm run db:push && npm run db:seed && npm run dev
```

Open http://localhost:3000.

## The walkthrough

### 1. Frame the problem (15s)

> "Small nonprofits stitch board packets together by hand from spreadsheets,
> budgets, and grant docs. AI summarizers make fluent prose — but the numbers
> aren't verifiable. For a funder report, that's a dealbreaker."

Land on the **landing page**. Point at the hero proof snippet: a sentence where
every figure has a citation marker.

### 2. Load the data (10s)

Click **Load BrightPath Demo Data**, then go to the **Dashboard**.

> "This is a fictional youth nonprofit. MissionBrief parsed seven files and
> pulled 28 metrics — youth served, attendance, budget, grant utilization,
> donors — each with a source."

Point at the attendance chart, the budget donut, and the grant milestone bar.

### 3. Show the audit trail (25s) — *the key moment*

Go to **Extracted Metrics**.

> "This is the differentiator. Every metric shows where it came from — the file,
> the exact rows, an evidence snippet, and a confidence score. The numbers are
> computed by rules, not guessed by a model."

Pick one row, e.g. *Total funds raised — $43,250 — donor_snapshot.csv, rows
2-13 — sum of "amount" across 12 donations — 95%.*

### 4. Generate a report (20s)

Go to **Generate Report → Monthly Board Packet → Generate.**

> "The report is assembled from those cited metrics. Watch the numbers."

When it lands, scroll the executive summary.

### 5. Trace a claim (20s) — *close the loop*

Point at a citation marker like `[3]` next to "$18,420 spent," then the
**Source Evidence** sidebar.

> "Every claim links to its origin. `[3]` is monthly_budget.csv, row 2 — Youth
> Development Program, $18,420 of $25,000, 95% confidence. A funder can audit
> the whole packet."

### 6. Export (10s)

Click **Export PDF** (or **Markdown**).

> "Print-clean PDF, Markdown, or copy to clipboard. Runs fully offline — no API
> keys. An optional LLM can smooth the wording, but it never touches a number."

## One-liner to leave them with

> "It's not an AI that writes your report. It's an AI that makes your report
> *defensible* — every number traces back to the file it came from."
