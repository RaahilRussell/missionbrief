# Limitations

MissionBrief is a portfolio demo built to showcase the **source-backed
reporting** idea end to end. It is deliberately honest about what it is not.

## It's a demo, not a product

- **Single workspace, no auth.** Anyone with access to the running app sees the
  same data. There is no login, no multi-tenancy, no authorization.
- **Local SQLite only.** Data lives in `prisma/dev.db`. There is no backup,
  migration strategy, or concurrent-write story.
- **Fictional data.** The BrightPath Youth Center dataset is invented and tuned
  so numbers reconcile. Real-world files are messier.

## Extraction is rule-based and narrow

- Extractors are keyed off **filename heuristics** (`detectCategory`) and known
  column/section shapes. A file that doesn't match the expected patterns will
  yield few or no metrics.
- The supported metric set is curated for the demo (attendance, budget, donors,
  outcomes, grant milestones, risk flags). It is not a general-purpose
  data-understanding system.
- **Confidence scores are heuristic**, not statistically calibrated. They convey
  "how directly did a rule match" — not a probability.

## The LLM layer is intentionally limited

- By design, the optional LLM **only rephrases narrative prose** and never
  computes or edits a number. This is a feature, but it also means the prose
  quality with the deterministic engine is templated rather than fluent.
- LLM polish is best-effort: any error, timeout, or missing key falls back to
  deterministic text silently.

## Practical caveats

- **PDF export uses the browser print dialog** — output depends on the browser
  and chosen print settings. There is no server-side PDF renderer.
- **Upload limit is 2 MB** and parsing is in-memory; very large files are out of
  scope.
- **No validation across files** yet — e.g. nothing flags a budget that exceeds
  its grant award. (See the roadmap.)

## What it does well

- Demonstrates a complete, trustworthy pipeline: parse → extract → cite →
  assemble → export, with every figure auditable back to its source.
- Runs entirely offline with no API keys, so it's trivial to clone and try.
