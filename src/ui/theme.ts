import { useColorScheme } from "react-native";

// Whiteboard: ink on board, one blue marker for actions, one orange marker for loops.
const light = {
  board: "#F3F5F4",
  panel: "#FFFFFF",
  ink: "#15202B",
  muted: "#5B6873",
  line: "#D5DCDF",
  marker: "#1D4FD8",
  markerSoft: "#E3EAFD",
  loop: "#C2410C",
  loopSoft: "#FCE9DE",
  ok: "#15803D",
};
const dark: typeof light = {
  board: "#0F151B",
  panel: "#18212A",
  ink: "#E8EEF2",
  muted: "#9AA8B3",
  line: "#2B3742",
  marker: "#7EA2FF",
  markerSoft: "#1D2A4A",
  loop: "#FB923C",
  loopSoft: "#3A2416",
  ok: "#4ADE80",
};

export type Theme = typeof light;
export const useTheme = (): Theme => (useColorScheme() === "dark" ? dark : light);
