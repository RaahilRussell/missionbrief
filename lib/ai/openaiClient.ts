// Optional OpenAI narrative polish. Only used when REPORT_ENGINE="openai" and
// OPENAI_API_KEY is set. Numbers are never delegated to the model — it is only
// asked to rephrase an already-correct draft.

interface PolishArgs {
  draft: string;
  tone: string;
}

export async function openaiPolish({ draft, tone }: PolishArgs): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You polish nonprofit report prose. Improve clarity and flow for the requested tone. " +
            "CRITICAL: never change, add, or remove any number, dollar amount, percentage, or citation marker like [1]. " +
            "Return only the rewritten markdown.",
        },
        {
          role: "user",
          content: `Tone: ${tone}\n\nDraft:\n${draft}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI returned no content");
  return content;
}
