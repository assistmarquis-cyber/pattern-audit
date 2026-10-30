import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "./theme";

export function Eyebrow({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[s.eyebrow, { color: t.muted }]}>{children}</Text>;
}

export function Title({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[s.title, { color: t.ink }]} accessibilityRole="header">{children}</Text>;
}

export function Body({ children, muted, small }: { children: ReactNode; muted?: boolean; small?: boolean }) {
  const t = useTheme();
  return <Text style={[s.body, small && s.small, { color: muted ? t.muted : t.ink }]}>{children}</Text>;
}

export function Hand({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[s.hand, { color: t.loop }]}>{children}</Text>;
}

export function Panel({ children, tone }: { children: ReactNode; tone?: "warn" }) {
  const t = useTheme();
  return (
    <View style={[s.panel, { backgroundColor: tone === "warn" ? t.loopSoft : t.panel, borderColor: tone === "warn" ? t.loop : t.line }]}>
      {children}
    </View>
  );
}

export function Button({ label, onPress, ghost, disabled }: { label: string; onPress: () => void; ghost?: boolean; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        s.btn,
        ghost ? { flexGrow: 0, backgroundColor: "transparent", borderColor: t.ink } : { backgroundColor: t.ink, borderColor: t.ink },
        (disabled || pressed) && { opacity: disabled ? 0.4 : 0.8 },
      ]}
    >
      <Text style={[s.btnText, { color: ghost ? t.ink : t.board }]}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.muted}
      {...props}
      style={[s.field, props.multiline && s.area, { color: t.ink, backgroundColor: t.panel, borderColor: t.line }, props.style]}
    />
  );
}

export function Chip({ label, warm }: { label: string; warm?: boolean }) {
  const t = useTheme();
  return (
    <View style={[s.chip, { backgroundColor: warm ? t.loopSoft : t.markerSoft }]}>
      <Text style={{ color: t.ink, fontSize: 14 }}>{label}</Text>
    </View>
  );
}

export function Choice({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const t = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={o}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o)}
            style={[s.choice, { backgroundColor: on ? t.markerSoft : t.panel, borderColor: on ? t.marker : t.line }]}
          >
            <Text style={{ color: t.ink, fontSize: 17 }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Score({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          accessibilityLabel={`${n} of 5`}
          onPress={() => onChange(n)}
          style={[s.score, { backgroundColor: value === n ? t.marker : t.panel, borderColor: value === n ? t.marker : t.line }]}
        >
          <Text style={{ fontWeight: "700", fontSize: 17, color: value === n ? t.panel : t.ink }}>{n}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Thinking({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
      <ActivityIndicator color={t.marker} />
      <Text style={{ color: t.muted, fontSize: 17 }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase" },
  title: { fontSize: 28, lineHeight: 32, fontWeight: "800", letterSpacing: -0.5 },
  body: { fontSize: 17, lineHeight: 25 },
  small: { fontSize: 14, lineHeight: 20 },
  hand: { fontSize: 22, lineHeight: 28, fontStyle: "italic", fontWeight: "600" },
  panel: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 12 },
  btn: { flexGrow: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 15, paddingHorizontal: 18, alignItems: "center" },
  btnText: { fontSize: 17, fontWeight: "700" },
  field: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 17 },
  area: { minHeight: 200, textAlignVertical: "top" },
  chip: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999 },
  choice: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 14 },
  score: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 11, alignItems: "center" },
});

export function Q({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ color: t.ink, fontSize: 19, fontWeight: "700", lineHeight: 24 }}>{children}</Text>;
}
