import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPersistStorage } from "./storage";

import type { TabId } from "../components/TabBar";

interface SettingsState {
  readOnly: boolean;
  lastTab: TabId;

  setReadOnly: (value: boolean) => void;
  setLastTab: (tab: TabId) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      readOnly: true,
      lastTab: "saves",

      setReadOnly: (readOnly) => set({ readOnly }),
      setLastTab: (lastTab) => set({ lastTab }),
    }),
    {
      name: "settings",
      storage: getPersistStorage(),
    },
  ),
);
