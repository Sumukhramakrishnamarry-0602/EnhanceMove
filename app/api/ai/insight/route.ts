import { NextResponse } from "next/server";

// Optional helper: summarizes an activity note and suggests a next action.
// Subtle by design — only called when a user opens the "Insight" box on an
// activity, never runs automatically, and fails gracefully with a simple
// rule-based fallback if no ANTHROPIC_API_KEY is configured.

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(fallbackInsight(text));
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `You help a sales rep review CRM notes. Given this note, respond ONLY with JSON: {"summary": "1-2 sentence summary", "next_action": "one short suggested next step"}.\n\nNote:\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) return NextResponse.json(fallbackInsight(text));

    const data = await response.json();
    const raw = data.content?.[0]?.text ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(fallbackInsight(text));
  }
}

function fallbackInsight(text: string) {
  const summary = text.length > 140 ? text.slice(0, 140).trim() + "…" : text;
  return { summary, next_action: "Follow up in 3 days" };
}
