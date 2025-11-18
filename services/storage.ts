import { Platform } from "react-native";

let AsyncStorage: typeof import("@react-native-async-storage/async-storage").default | null = null;

async function ensureAsyncStorage() {
  if (!AsyncStorage) {
    // Lazy import to avoid web bundling issues
    const mod = await import("@react-native-async-storage/async-storage");
    AsyncStorage = mod.default;
  }
}

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try { return window.localStorage.getItem(key); } catch { return null; }
    }
    await ensureAsyncStorage();
    return AsyncStorage!.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try { window.localStorage.setItem(key, value); } catch {}
      return;
    }
    await ensureAsyncStorage();
    return AsyncStorage!.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try { window.localStorage.removeItem(key); } catch {}
      return;
    }
    await ensureAsyncStorage();
    return AsyncStorage!.removeItem(key);
  },
};
