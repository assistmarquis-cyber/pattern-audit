export type Loop = { trigger: string; thought: string; feeling: string; action: string };

export type Cue = { cue: string; why: string };

export type LoopReflection = {
  safety: boolean;
  headline: string;
  cues: Cue[];
  loop: Loop;
  questions: string[];
};

export type BoundaryReflection = {
  safety: boolean;
  mirror: string;
  weak_spot: string;
  insight: string;
  boundaries: string[];
  tests: string[];
};

export type CheckIn = { result: "Yes" | "Partly" | "Not yet"; note: string; at: number };

export type Session = {
  id: string;
  created: number;
  text: string;
  headline: string;
  loop: Loop;
  questions: string[];
  answers: string[];
  reflection: BoundaryReflection | null;
  boundary: string;
  test: string;
  checkinDays: 3 | 7;
  score: { see: number; trust: number };
  checkin: CheckIn | null;
  example?: boolean;
};

export const emptyLoop = (): Loop => ({ trigger: "", thought: "", feeling: "", action: "" });

export function newSession(): Session {
  return {
    id: "s" + Date.now().toString(36),
    created: Date.now(),
    text: "",
    headline: "",
    loop: emptyLoop(),
    questions: [],
    answers: ["", ""],
    reflection: null,
    boundary: "",
    test: "",
    checkinDays: 3,
    score: { see: 0, trust: 0 },
    checkin: null,
  };
}

export const EXAMPLE_SESSION: Session = {
  id: "example",
  example: true,
  created: Date.now() - 2 * 864e5,
  text: "",
  headline: "Every new idea feels like a deadline you're missing.",
  loop: { trigger: "A new idea lands", thought: "I'll miss out", feeling: "Overwhelm", action: "Start another thing" },
  questions: [],
  answers: [],
  reflection: {
    safety: false,
    mirror: "You're not behind. You're spread across forty starts.",
    weak_spot: "You never decide what gets dropped.",
    insight: "You already know which project matters.",
    boundaries: [],
    tests: [],
  },
  boundary: "One open project until it ships or I kill it.",
  test: "Close every tab but one project for 3 days.",
  checkinDays: 3,
  score: { see: 4, trust: 4 },
  checkin: null,
};
