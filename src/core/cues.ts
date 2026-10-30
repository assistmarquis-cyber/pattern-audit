// On-device cue detection. Nothing here leaves the phone.
const STOP = new Set(
  "the a an and or but so to of in on at for with is it its i'm im i me my we our you your they them this that was were be been am are have has had do did not no just really very like what when then than there their about from into out up down can could would will get got going know think feel one all because also more some even".split(" "),
);
const HEDGES = ["just", "kind of", "sort of", "i guess", "maybe", "i don't know", "i dont know", "probably", "whatever"];
const ABSOLUTES = ["always", "never", "should", "have to", "need to", "can't", "cant", "everyone", "nobody", "everything", "nothing"];

export type Cues = {
  words: number;
  repeats: [string, number][];
  hedges: [string, number][];
  absolutes: [string, number][];
  trails: number;
  stutters: number;
};

function countPhrases(low: string, list: string[]): [string, number][] {
  return list
    .map((h): [string, number] => [h, (low.match(new RegExp("\\b" + h.replace("'", "'?") + "\\b", "g")) || []).length])
    .filter(([, n]) => n > 0);
}

export function detectCues(text: string): Cues {
  const low = text.toLowerCase();
  const words = low.match(/[a-z']+/g) || [];
  const freq: Record<string, number> = {};
  for (const w of words) if (w.length > 3 && !STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
  const repeats = Object.entries(freq)
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  return {
    words: words.length,
    repeats,
    hedges: countPhrases(low, HEDGES),
    absolutes: countPhrases(low, ABSOLUTES),
    trails: (text.match(/\.\.\.|…|—|--/g) || []).length,
    stutters: (low.match(/\b(\w+)[\s,.…-]+\1\b/g) || []).length,
  };
}

export function cueLabels(c: Cues): { label: string; warm: boolean }[] {
  const out: { label: string; warm: boolean }[] = [];
  c.repeats.forEach(([w, n]) => out.push({ label: `"${w}" ×${n}`, warm: true }));
  c.absolutes.forEach(([w, n]) => out.push({ label: n > 1 ? `${w} ×${n}` : w, warm: false }));
  c.hedges.forEach(([w, n]) => out.push({ label: n > 1 ? `${w} ×${n}` : w, warm: false }));
  if (c.trails) out.push({ label: `trailing off ×${c.trails}`, warm: false });
  if (c.stutters) out.push({ label: `repeats itself ×${c.stutters}`, warm: false });
  return out;
}

export function cueSummary(c: Cues): string {
  const parts: string[] = [];
  if (c.repeats.length) parts.push("repeated: " + c.repeats.map(([w, n]) => `${w} x${n}`).join(", "));
  if (c.absolutes.length) parts.push("absolutes: " + c.absolutes.map(([w]) => w).join(", "));
  if (c.hedges.length) parts.push("hedges: " + c.hedges.map(([w]) => w).join(", "));
  if (c.trails) parts.push(`trailing off: ${c.trails}`);
  if (c.stutters) parts.push(`repeats itself: ${c.stutters}`);
  return parts.join("; ") || "none";
}

const CRISIS = /\b(kill myself|suicid\w*|end it all|end my life|self[- ]harm|hurt myself|don'?t want to (live|be here))\b/i;
export const mentionsCrisis = (text: string) => CRISIS.test(text);
