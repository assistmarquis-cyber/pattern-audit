import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "./types";

// Sessions live only on this device, inside the app's sandbox
// (encrypted at rest by iOS Data Protection). Nothing is synced.
const KEY = "pattern-audit/sessions/v1";

export async function loadSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(sessions));
}

export async function deleteAllSessions(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
