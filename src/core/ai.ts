import type { BoundaryReflection, Loop, LoopReflection } from "./types";
import type { Cues } from "./cues";
import { cueSummary } from "./cues";

// The app never holds an Anthropic key. It calls our own server,
// which holds the key and the coaching prompts.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

export const aiAvailable = () => API_URL.length > 0;

async function post<T>(body: unknown, signal?: AbortSignal): Promise<T> {
  if (!aiAvailable()) throw new Error("unavailable");
  const res = await fetch(`${API_URL}/api/reflect`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(`reflect ${res.status}`);
  return (await res.json()) as T;
}

export function reflectLoop(text: string, cues: Cues, signal?: AbortSignal) {
  return post<LoopReflection>({ stage: "loop", text, cues: cueSummary(cues) }, signal);
}

export function reflectBoundary(
  text: string,
  loop: Loop,
  qa: { q: string; a: string }[],
  signal?: AbortSignal,
) {
  return post<BoundaryReflection>({ stage: "boundary", text, loop, qa }, signal);
}
