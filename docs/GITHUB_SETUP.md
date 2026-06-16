# GitHub Setup

The repository was created and pushed during the build. This file documents the
exact commands so the setup is reproducible (and so you can recreate the
optional project board / issues by hand if needed).

## Repository

```bash
# from the project root
git init
git add .
git commit -m "Initial commit: MissionBrief source-backed nonprofit reporting demo"

# create the repo and push (requires the gh CLI, authenticated)
gh repo create missionbrief --public --source=. --remote=origin --push
```

If you prefer the web UI: create an empty `missionbrief` repo at
https://github.com/new, then:

```bash
git remote add origin https://github.com/<you>/missionbrief.git
git branch -M main
git push -u origin main
```

## Optional: project board

A simple Backlog → In Progress → Review → Done board:

```bash
# Projects v2 are user/org scoped
gh project create --owner "@me" --title "MissionBrief MVP"
# then add columns/items in the web UI, or via `gh project item-create`
```

> Note: `gh project` requires the `project` scope on your token. If you see a
> scope error, run `gh auth refresh -s project` and retry, or manage the board
> in the GitHub web UI.

## Optional: seed issues

```bash
gh issue create --title "Add per-claim source highlighting" \
  --body "Clicking a [n] marker in a rendered report should highlight the exact source row, not just the citation entry." \
  --label enhancement

gh issue create --title "Confidence calibration from data completeness" \
  --body "Lower a metric's confidence when underlying rows are missing or partial, instead of using fixed heuristics." \
  --label enhancement

gh issue create --title "Cross-file validation rules" \
  --body "Flag inconsistencies across files (e.g. budget spent exceeding grant award) before report generation." \
  --label enhancement

gh issue create --title "Native server-side PDF export" \
  --body "Offer a server-rendered PDF in addition to the browser print dialog." \
  --label enhancement
```

## CI

`.github/workflows/ci.yml` runs on every push and PR to `main`: install →
prisma generate → db push + seed → lint → build. No secrets required (the demo
runs with the deterministic engine).
