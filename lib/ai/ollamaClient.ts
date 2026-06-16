// Optional local Ollama narrative polish. Used when REPORT_ENGINE="ollama".
// Requires a running Ollama server (no cloud key needed).

interface PolishArgs {
  draft: string;
  tone: string;
}

export async function ollamaPolish({ draft, tone }: PolishArgs): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.1";

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      prompt:
        `You polish nonprofit report prose for a ${tone} tone. ` +
        "Do not change any number, dollar amount, percentage, or citation marker like [1]. " +
        "Return only the rewritten markdown.\n\nDraft:\n" +
        draft,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed: ${res.status}`);
  }
  const data = (await res.json()) as { response?: string };
  const content = data.response?.trim();
  if (!content) throw new Error("Ollama returned no content");
  return content;
}
