// Deterministic "mock" engine. This is the default and requires no API key.
// It intentionally returns the rule-based draft unchanged so the demo is
// reproducible and every number stays traceable to its source.

export async function mockPolish(draft: string): Promise<string> {
  return draft;
}
