import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPersistStorage } from "./storage";

import type { TabId } from "../components/TabBar";

interface SettingsState {
  readOnly: boolean;
  lastTab: TabId;
  customGamePath: string;

  setReadOnly: (value: boolean) => void;
  setLastTab: (tab: TabId) => void;
  setCustomGamePath: (path: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      readOnly: true,
      lastTab: "saves",
      customGamePath: "",

      setReadOnly: (readOnly) => set({ readOnly }),
      setLastTab: (lastTab) => set({ lastTab }),
      setCustomGamePath: (customGamePath) => set({ customGamePath }),
    }),
    {
      name: "settings",
      storage: getPersistStorage(),
    },
  ),
);
