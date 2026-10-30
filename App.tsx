import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { reflectBoundary, reflectLoop } from "./src/core/ai";
import { cueLabels, detectCues, mentionsCrisis } from "./src/core/cues";
import { deleteAllSessions, loadSessions, saveSessions } from "./src/core/storage";
import { EXAMPLE_SESSION, Loop, Session, newSession } from "./src/core/types";
import { Body, Button, Q, Choice, Chip, Eyebrow, Field, Hand, Panel, Score, Thinking, Title } from "./src/ui/kit";
import { LoopDiagram } from "./src/ui/LoopDiagram";
import { Theme, useTheme } from "./src/ui/theme";

const STEPS = ["move", "talk", "loop", "confirm", "boundary", "runway"] as const;
type Step = (typeof STEPS)[number];
type View_ = { name: "home" } | { name: "delete" } | { name: "crisis" } | { name: Step } | { name: "detail"; id: string };

const DAY = 864e5;
const fmtDate = (t: number) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const t = useTheme();
  const [view, setView] = useState<View_>({ name: "home" });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [s, setS] = useState<Session>(newSession);
  const [aiOff, setAiOff] = useState(false);

  useEffect(() => {
    loadSessions().then(setSessions);
  }, []);

  const patch = (p: Partial<Session>) => setS((cur) => ({ ...cur, ...p }));
  const go = (v: View_) => setView(v);

  async function save(next: Session) {
    const list = [next, ...sessions.filter((x) => x.id !== next.id)];
    setSessions(list);
    await saveSessions(list);
  }

  const step = STEPS.indexOf(view.name as Step);
  let screen: { body: React.ReactNode; bar: React.ReactNode };
  switch (view.name) {
    case "home":
      screen = Home({ t, sessions, open: (id) => go({ name: "detail", id }), start: () => { setS(newSession()); setAiOff(false); go({ name: "move" }); }, askDelete: () => go({ name: "delete" }) });
      break;
    case "delete":
      screen = {
        body: (
          <>
            <Title>Delete all your sessions?</Title>
            <Body muted>This removes every session and check-in from this phone. It can't be undone.</Body>
          </>
        ),
        bar: (
          <>
            <Button ghost label="Keep them" onPress={() => go({ name: "home" })} />
            <Button label="Delete everything" onPress={async () => { await deleteAllSessions(); setSessions([]); go({ name: "home" }); }} />
          </>
        ),
      };
      break;
    case "crisis":
      screen = { body: <CrisisCard />, bar: <Button label="Back to home" onPress={() => go({ name: "home" })} /> };
      break;
    case "move":
      screen = { body: <Move key="move" onDone={() => go({ name: "talk" })} />, bar: null };
      break;
    case "talk":
      screen = Talk({ s, patch, back: () => go({ name: "move" }), next: () => (mentionsCrisis(s.text) ? go({ name: "crisis" }) : go({ name: "loop" })) });
      break;
    case "loop":
      screen = { body: <LoopStep s={s} patch={patch} onCrisis={() => go({ name: "crisis" })} onOff={() => { setAiOff(true); go({ name: "confirm" }); }} />, bar: (
        <>
          <Button ghost label="Back" onPress={() => go({ name: "talk" })} />
          <Button label="Let's check it" disabled={!s.headline && !s.loop.trigger} onPress={() => go({ name: "confirm" })} />
        </>
      ) };
      break;
    case "confirm":
      screen = Confirm({ s, patch, aiOff, back: () => go({ name: aiOff ? "talk" : "loop" }), next: () => { patch({ reflection: null }); go({ name: "boundary" }); } });
      break;
    case "boundary":
      screen = { body: <BoundaryStep s={s} patch={patch} aiOff={aiOff} onCrisis={() => go({ name: "crisis" })} />, bar: (
        <>
          <Button ghost label="Back" onPress={() => go({ name: "confirm" })} />
          <Button label="Set this boundary" disabled={!s.boundary} onPress={() => go({ name: "runway" })} />
        </>
      ) };
      break;
    case "runway":
      screen = Runway({ s, patch, back: () => go({ name: "boundary" }), takeOff: async () => { await save(s); go({ name: "detail", id: s.id }); } });
      break;
    case "detail": {
      const found = view.id === "example" ? EXAMPLE_SESSION : sessions.find((x) => x.id === view.id);
      screen = found
        ? Detail({ session: found, home: () => go({ name: "home" }), checkIn: async (c) => { const next = { ...found, checkin: c }; await save(next); } })
        : { body: null, bar: <Button label="Back to home" onPress={() => go({ name: "home" })} /> };
      break;
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.board }} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={st.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Home" onPress={() => go({ name: "home" })}>
            <Text style={[st.brand, { color: t.ink }]}>
              Pattern <Text style={{ color: t.marker }}>Audit</Text>
            </Text>
          </Pressable>
          {step >= 0 && (
            <View style={st.rail} accessible accessibilityLabel={`Step ${step + 1} of 6`}>
              {STEPS.map((_, i) => (
                <View key={i} style={[st.tick, { backgroundColor: i === step ? t.marker : i < step ? t.muted : t.line }]} />
              ))}
            </View>
          )}
        </View>
        <ScrollView contentContainerStyle={st.main} keyboardShouldPersistTaps="handled">
          {screen.body}
        </ScrollView>
        {screen.bar && <View style={[st.bar, { borderColor: t.line }]}>{screen.bar}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- Home ---------- */
function Home({ t, sessions, open, start, askDelete }: { t: Theme; sessions: Session[]; open: (id: string) => void; start: () => void; askDelete: () => void }) {
  const all = [...sessions, EXAMPLE_SESSION];
  return {
    body: (
      <>
        <View style={{ gap: 10, paddingTop: 8 }}>
          <Eyebrow>Move. Talk. See the loop.</Eyebrow>
          <Text style={[st.hero, { color: t.ink }]}>See how you think. Trust what you already know.</Text>
          <Body muted>A 10-minute session that turns a messy head into one clear loop, one boundary and one small test.</Body>
        </View>
        <View style={{ gap: 10 }}>
          <Eyebrow>Your sessions</Eyebrow>
          {sessions.length === 0 && <Body muted small>Your sessions will show up here. Below is an example of a finished one.</Body>}
          {all.map((x) => {
            const due = x.created + x.checkinDays * DAY;
            const status = x.example ? "Example" : x.checkin ? "Checked in" : Date.now() > due ? "Check-in due" : `Check in ${fmtDate(due)}`;
            return (
              <Pressable key={x.id} accessibilityRole="button" onPress={() => open(x.id)} style={[st.card, { backgroundColor: t.panel, borderColor: t.line }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: t.muted, fontSize: 13 }}>{x.example ? "Example" : fmtDate(x.created)}</Text>
                  <Text style={{ color: x.checkin ? t.ok : status === "Check-in due" ? t.marker : t.muted, fontSize: 13, fontWeight: "700" }}>{status}</Text>
                </View>
                <Text style={{ color: t.ink, fontSize: 17, fontWeight: "700" }}>{x.headline || x.loop.thought || "Untitled session"}</Text>
                <Text style={{ color: t.muted, fontSize: 14 }}>Boundary: {x.boundary || "not set"}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ gap: 8, paddingTop: 8 }}>
          <Body muted small>Pattern Audit is a self-reflection tool. It is not therapy or medical care.</Body>
          <Body muted small>In crisis? In the US, call or text 988. Elsewhere, call your local emergency number.</Body>
          <Body muted small>Your sessions stay on this phone.</Body>
          <Pressable onPress={askDelete} accessibilityRole="button">
            <Text style={{ color: t.muted, textDecorationLine: "underline", fontSize: 14 }}>Delete all my sessions</Text>
          </Pressable>
        </View>
      </>
    ),
    bar: <Button label="Start a session" onPress={start} />,
  };
}

function CrisisCard() {
  return (
    <Panel tone="warn">
      <Title>It sounds like you're carrying something heavy right now.</Title>
      <Body>Please reach out to someone now. In the US, call or text 988. Elsewhere, call your local emergency number. You don't have to sort this out alone.</Body>
    </Panel>
  );
}

/* ---------- Step 1: Move ---------- */
const MOVE_CUES = ["Stand up. Start walking.", "Roll your shoulders back.", "Shake out your hands.", "Breathe out longer than you breathe in.", "Look far away for a moment.", "Keep moving. Notice what's loud in your head."];

function Move({ onDone }: { onDone: () => void }) {
  const t = useTheme();
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  useEffect(() => {
    if (left <= 0 && timer.current) { clearInterval(timer.current); timer.current = null; }
  }, [left]);

  const start = () => {
    setRunning(true);
    timer.current = setInterval(() => setLeft((n) => n - 1), 1000);
  };
  const cue = MOVE_CUES[Math.min(MOVE_CUES.length - 1, Math.floor((60 - left) / 10))];
  const done = left <= 0;

  return (
    <>
      <View style={{ gap: 6 }}>
        <Eyebrow>Step 1 of 6 · Move</Eyebrow>
        <Title>Move first. It loosens what's stuck.</Title>
      </View>
      <View style={[st.timer, { borderColor: running ? t.marker : t.line }]}>
        <Text style={[st.timerNum, { color: t.ink }]} accessibilityLabel={`${left} seconds left`}>{Math.max(0, left)}</Text>
      </View>
      <Text style={[st.cue, { color: t.ink }]}>{cue}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button ghost label="Skip" onPress={onDone} />
        <Button label={done ? "I'm ready to talk" : running ? "Moving…" : "Start 60 seconds"} disabled={running && !done} onPress={done ? onDone : start} />
      </View>
    </>
  );
}

/* ---------- Step 2: Talk ---------- */
function Talk({ s, patch, back, next }: { s: Session; patch: (p: Partial<Session>) => void; back: () => void; next: () => void }) {
  const cues = detectCues(s.text);
  const labels = cueLabels(cues);
  return {
    body: (
      <>
        <View style={{ gap: 6 }}>
          <Eyebrow>Step 2 of 6 · Talk</Eyebrow>
          <Title>What's taking up space in your head?</Title>
        </View>
        <Body muted small>Don't edit. Keep walking and tap the mic on your keyboard to talk instead of type.</Body>
        <Field multiline value={s.text} onChangeText={(text) => patch({ text, headline: "" })} placeholder="Start anywhere. Messy is good." accessibilityLabel="Your thoughts" />
        <Panel>
          <Eyebrow>What I'm hearing so far</Eyebrow>
          {labels.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {labels.map((l) => <Chip key={l.label} label={l.label} warm={l.warm} />)}
            </View>
          ) : (
            <Body muted small>Repeated words, hedges and absolutes show up here as you go.</Body>
          )}
        </Panel>
      </>
    ),
    bar: (
      <>
        <Button ghost label="Back" onPress={back} />
        <Button label="Show me my loop" disabled={cues.words < 12} onPress={next} />
      </>
    ),
  };
}

/* ---------- Step 3: See your loop ---------- */
function LoopStep({ s, patch, onCrisis, onOff }: { s: Session; patch: (p: Partial<Session>) => void; onCrisis: () => void; onOff: () => void }) {
  const [cues, setCues] = useState<{ cue: string; why: string }[]>([]);
  const [busy, setBusy] = useState(!s.headline);

  useEffect(() => {
    if (s.headline) return;
    const ctl = new AbortController();
    reflectLoop(s.text, detectCues(s.text), ctl.signal)
      .then((r) => {
        if (r.safety) return onCrisis();
        setCues(r.cues.slice(0, 3));
        patch({ headline: r.headline, loop: r.loop, questions: r.questions.slice(0, 2), answers: ["", ""] });
        setBusy(false);
      })
      .catch(() => {
        if (ctl.signal.aborted) return;
        patch({ questions: ["What usually happens right before this starts?", "What do you do next, every time?"], answers: ["", ""] });
        onOff();
      });
    return () => ctl.abort();
  }, []);

  if (busy) {
    return (
      <>
        <View style={{ gap: 6 }}>
          <Eyebrow>Step 3 of 6 · See your loop</Eyebrow>
          <Title>Here's what I'm picturing.</Title>
        </View>
        <Thinking label="Listening for the pattern…" />
      </>
    );
  }
  return (
    <>
      <View style={{ gap: 6 }}>
        <Eyebrow>Step 3 of 6 · See your loop</Eyebrow>
        <Title>{s.headline}</Title>
      </View>
      <LoopDiagram loop={s.loop} />
      {cues.length > 0 && (
        <Panel>
          <Eyebrow>What I noticed</Eyebrow>
          {cues.map((c) => (
            <View key={c.cue} style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <Chip label={c.cue} warm />
              <Body muted>{c.why}</Body>
            </View>
          ))}
        </Panel>
      )}
    </>
  );
}

/* ---------- Step 4: Confirm ---------- */
function Confirm({ s, patch, aiOff, back, next }: { s: Session; patch: (p: Partial<Session>) => void; aiOff: boolean; back: () => void; next: () => void }) {
  const setLoop = (k: keyof Loop, v: string) => patch({ loop: { ...s.loop, [k]: v } });
  return {
    body: (
      <>
        <View style={{ gap: 6 }}>
          <Eyebrow>Step 4 of 6 · Confirm</Eyebrow>
          <Title>{aiOff ? "Map your loop." : "Did I hear you right?"}</Title>
        </View>
        {aiOff && <Body muted small>AI reflection isn't available right now, so you'll draw the loop yourself. Your words, your map.</Body>}
        {s.questions.map((q, i) => (
          <Panel key={q}>
            <Q>{q}</Q>
            <Field value={s.answers[i] ?? ""} onChangeText={(a) => { const answers = [...s.answers]; answers[i] = a; patch({ answers }); }} placeholder="A few words is enough" accessibilityLabel={q} />
          </Panel>
        ))}
        <Panel>
          <Eyebrow>{aiOff ? "Your loop" : "Fix anything I got wrong"}</Eyebrow>
          {(["trigger", "thought", "feeling", "action"] as const).map((k) => (
            <View key={k} style={{ gap: 4 }}>
              <Eyebrow>{k}</Eyebrow>
              <Field value={s.loop[k]} onChangeText={(v) => setLoop(k, v)} accessibilityLabel={k} />
            </View>
          ))}
        </Panel>
      </>
    ),
    bar: (
      <>
        <Button ghost label="Back" onPress={back} />
        <Button label="Yes, that's the loop" disabled={!s.loop.trigger.trim() || !s.loop.action.trim()} onPress={next} />
      </>
    ),
  };
}

/* ---------- Step 5: Boundary ---------- */
function BoundaryStep({ s, patch, aiOff, onCrisis }: { s: Session; patch: (p: Partial<Session>) => void; aiOff: boolean; onCrisis: () => void }) {
  const [busy, setBusy] = useState(!s.reflection && !aiOff);
  const [own, setOwn] = useState("");

  useEffect(() => {
    if (s.reflection || aiOff) return;
    const ctl = new AbortController();
    reflectBoundary(s.text, s.loop, s.questions.map((q, i) => ({ q, a: s.answers[i] ?? "" })), ctl.signal)
      .then((r) => {
        if (r.safety) return onCrisis();
        patch({ reflection: r });
        setBusy(false);
      })
      .catch(() => { if (!ctl.signal.aborted) setBusy(false); });
    return () => ctl.abort();
  }, []);

  if (busy) {
    return (
      <>
        <View style={{ gap: 6 }}>
          <Eyebrow>Step 5 of 6 · Boundary</Eyebrow>
          <Title>Finding the weak spot…</Title>
        </View>
        <Thinking label="Reading the story for where it leaks…" />
      </>
    );
  }
  const r = s.reflection;
  const options = r?.boundaries.length ? r.boundaries : [`When ${s.loop.trigger.toLowerCase() || "it starts"}, I pause before I ${s.loop.action.toLowerCase() || "act"}.`];
  return (
    <>
      <View style={{ gap: 6 }}>
        <Eyebrow>Step 5 of 6 · Boundary</Eyebrow>
        <Title>{r?.weak_spot || "Where does the loop leak?"}</Title>
      </View>
      {r?.mirror ? <Hand>{r.mirror}</Hand> : null}
      <Panel>
        <Eyebrow>Pick a boundary, or write your own</Eyebrow>
        <Choice options={options} value={s.boundary} onChange={(b) => { setOwn(""); patch({ boundary: b }); }} />
        <Field value={own} onChangeText={(v) => { setOwn(v); patch({ boundary: v.trim() }); }} placeholder="My own boundary, in one sentence" accessibilityLabel="Your own boundary" />
      </Panel>
    </>
  );
}

/* ---------- Step 6: Runway ---------- */
function Runway({ s, patch, back, takeOff }: { s: Session; patch: (p: Partial<Session>) => void; back: () => void; takeOff: () => void }) {
  const tests = s.reflection?.tests.length ? s.reflection.tests : ["Notice the trigger once and name it out loud.", "Write the boundary where you'll see it daily.", "Tell one person about the loop."];
  return {
    body: (
      <>
        <View style={{ gap: 6 }}>
          <Eyebrow>Step 6 of 6 · Runway</Eyebrow>
          <Title>Put one test on the runway.</Title>
        </View>
        {s.reflection?.insight ? <Hand>{s.reflection.insight}</Hand> : null}
        <Panel>
          <Eyebrow>Your test this week</Eyebrow>
          <Choice options={tests} value={s.test} onChange={(test) => patch({ test })} />
          <Field value={tests.includes(s.test) ? "" : s.test} onChangeText={(v) => patch({ test: v.trim() })} placeholder="Or write your own test" accessibilityLabel="Your own test" />
        </Panel>
        <Panel>
          <Eyebrow>Check in after</Eyebrow>
          <Choice options={["3 days", "7 days"]} value={`${s.checkinDays} days`} onChange={(d) => patch({ checkinDays: d.startsWith("7") ? 7 : 3 })} />
        </Panel>
        <Panel>
          <Eyebrow>Scorecard</Eyebrow>
          <Q>Can you see your loop more clearly now?</Q>
          <Score value={s.score.see} onChange={(see) => patch({ score: { ...s.score, see } })} />
          <Q>Do you trust your own answer more?</Q>
          <Score value={s.score.trust} onChange={(trust) => patch({ score: { ...s.score, trust } })} />
          <Body muted small>1 is not yet. 5 is a lot.</Body>
        </Panel>
      </>
    ),
    bar: (
      <>
        <Button ghost label="Back" onPress={back} />
        <Button label="Take off" disabled={!s.test || !s.score.see || !s.score.trust} onPress={takeOff} />
      </>
    ),
  };
}

/* ---------- Session detail and check-in ---------- */
function Detail({ session: x, home, checkIn }: { session: Session; home: () => void; checkIn: (c: NonNullable<Session["checkin"]>) => void }) {
  const [result, setResult] = useState("");
  const [note, setNote] = useState("");
  const canCheckIn = !x.example && !x.checkin;
  return {
    body: (
      <>
        <View style={{ gap: 6 }}>
          <Eyebrow>{x.example ? "Example session" : fmtDate(x.created)}</Eyebrow>
          <Title>{x.headline || "Your loop"}</Title>
        </View>
        <LoopDiagram loop={x.loop} />
        {x.reflection?.weak_spot ? <Body><Text style={{ fontWeight: "700" }}>Weak spot: </Text>{x.reflection.weak_spot}</Body> : null}
        <Panel>
          <Eyebrow>Boundary</Eyebrow>
          <Q>{x.boundary}</Q>
          <Eyebrow>Test on the runway</Eyebrow>
          <Body>{x.test}</Body>
        </Panel>
        <Panel>
          <Eyebrow>Scorecard</Eyebrow>
          <Body>See the loop: {x.score.see}/5 · Trust my answer: {x.score.trust}/5</Body>
          {x.checkin ? (
            <Body>Check-in: {x.checkin.result}{x.checkin.note ? ` · ${x.checkin.note}` : ""}</Body>
          ) : (
            <Body muted small>Check in {fmtDate(x.created + x.checkinDays * DAY)}.</Body>
          )}
        </Panel>
        {canCheckIn && (
          <Panel>
            <Eyebrow>Check in</Eyebrow>
            <Q>Did the test happen?</Q>
            <Choice options={["Yes", "Partly", "Not yet"]} value={result} onChange={setResult} />
            <Field value={note} onChangeText={setNote} placeholder="What did you learn? One line." accessibilityLabel="What you learned" />
          </Panel>
        )}
      </>
    ),
    bar: canCheckIn ? (
      <>
        <Button ghost label="Home" onPress={home} />
        <Button label="Save check-in" disabled={!result} onPress={() => checkIn({ result: result as "Yes" | "Partly" | "Not yet", note: note.trim(), at: Date.now() })} />
      </>
    ) : (
      <Button label="Back to home" onPress={home} />
    ),
  };
}

const st = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  brand: { fontSize: 18, fontWeight: "800" },
  rail: { flexDirection: "row", gap: 4 },
  tick: { width: 22, height: 5, borderRadius: 3 },
  main: { paddingHorizontal: 16, paddingBottom: 24, gap: 20, maxWidth: 560, width: "100%", alignSelf: "center" },
  bar: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1 },
  hero: { fontSize: 34, lineHeight: 38, fontWeight: "800", letterSpacing: -0.8 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 4 },
  q: { fontSize: 19, fontWeight: "700", lineHeight: 24 },
  timer: { width: 220, height: 220, borderRadius: 110, borderWidth: 8, alignSelf: "center", alignItems: "center", justifyContent: "center" },
  timerNum: { fontSize: 54, fontWeight: "800", fontVariant: ["tabular-nums"] },
  cue: { fontSize: 22, fontWeight: "700", textAlign: "center", minHeight: 60 },
});
