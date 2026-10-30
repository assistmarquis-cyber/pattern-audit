import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, Marker, Path } from "react-native-svg";
import type { Loop } from "../core/types";
import { useTheme } from "./theme";

const ARCS = [
  [50, 4, 92, 46],
  [96, 54, 54, 96],
  [46, 96, 4, 54],
  [4, 46, 46, 4],
];

export function LoopDiagram({ loop }: { loop: Loop }) {
  const t = useTheme();
  const nodes: [string, string][] = [
    ["Trigger", loop.trigger],
    ["Thought", loop.thought],
    ["Feeling", loop.feeling],
    ["Action", loop.action],
  ];
  return (
    <View
      style={s.wrap}
      accessible
      accessibilityLabel={`Your loop: ${nodes.map(([k, v]) => `${k}: ${v}`).join(", then ")}, and back to the start`}
    >
      <Svg viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <Marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <Path d="M0,0 L10,5 L0,10 z" fill={t.loop} />
          </Marker>
        </Defs>
        {ARCS.map(([x1, y1, x2, y2], i) => (
          <Path
            key={i}
            d={`M${x1},${y1} A46,46 0 0 1 ${x2},${y2}`}
            fill="none"
            stroke={t.loop}
            strokeWidth={1.4}
            strokeDasharray="3 2.5"
            markerEnd="url(#ah)"
          />
        ))}
      </Svg>
      {nodes.map(([k, v], i) => (
        <View key={k} style={[s.node, POS[i], { backgroundColor: t.panel, borderColor: t.ink }]}>
          <Text style={[s.label, { color: t.loop }]}>{k}</Text>
          <Text style={{ color: t.ink, fontSize: 15, textAlign: "center" }}>{v || "…"}</Text>
        </View>
      ))}
    </View>
  );
}

const POS = [
  { top: 0, left: "29%" as const },
  { right: 0, top: "38%" as const },
  { bottom: 0, left: "29%" as const },
  { left: 0, top: "38%" as const },
];

const s = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 400, aspectRatio: 1, alignSelf: "center" },
  node: { position: "absolute", width: "42%", borderWidth: 1.5, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1.3, textTransform: "uppercase", textAlign: "center", marginBottom: 2 },
});
