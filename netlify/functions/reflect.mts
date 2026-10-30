import Anthropic from "@anthropic-ai/sdk";
import type { Config } from "@netlify/functions";
import {
  BOUNDARY_SCHEMA,
  BoundaryInput,
  LOOP_SCHEMA,
  LoopInput,
  SYSTEM,
  boundaryPrompt,
  loopPrompt,
} from "../../server/prompts";

// Reads ANTHROPIC_API_KEY from the Netlify environment. The key never reaches the app.
const client = new Anthropic();
const MAX_TEXT = 6000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function clean(s: unknown, max = 400): string {
  return typeof s === "string" ? s.slice(0, max) : "";
}

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  const text = clean(body.text, MAX_TEXT);
  if (text.trim().length < 20) return json({ error: "too_short" }, 400);

  let prompt: string;
  let schema: Record<string, unknown>;
  if (body.stage === "loop") {
    const input: LoopInput = { stage: "loop", text, cues: clean(body.cues) };
    prompt = loopPrompt(input);
    schema = LOOP_SCHEMA;
  } else if (body.stage === "boundary") {
    const loop = (body.loop ?? {}) as Record<string, unknown>;
    const qa = Array.isArray(body.qa) ? body.qa.slice(0, 2) : [];
    const input: BoundaryInput = {
      stage: "boundary",
      text,
      loop: { trigger: clean(loop.trigger), thought: clean(loop.thought), feeling: clean(loop.feeling), action: clean(loop.action) },
      qa: qa.map((x: { q?: unknown; a?: unknown }) => ({ q: clean(x?.q), a: clean(x?.a) })),
    };
    prompt = boundaryPrompt(input);
    schema = BOUNDARY_SCHEMA;
  } else {
    return json({ error: "bad_stage" }, 400);
  }

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") return json({ error: "refused" }, 422);
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return json({ error: "empty" }, 502);
    return json(JSON.parse(block.text));
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 429);
    if (error instanceof Anthropic.APIError) return json({ error: "upstream", status: error.status }, 502);
    return json({ error: "server" }, 500);
  }
};

export const config: Config = { path: "/api/reflect" };
