import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPersistStorage } from "./storage";
import type { ProfileInfo, SaveInfo, SaveData } from "../types";

export type WorkspaceTab = "saves" | "config";

export interface SaveEditorState {
  profiles: ProfileInfo[];
  saves: SaveInfo[];
  selectedProfile: ProfileInfo | null;
  selectedSave: SaveInfo | null;
  saveData: SaveData | null;
  moneyInput: string;
  xpInput: string;
  activeWorkspace: WorkspaceTab;
  selectedConfigPath: string | null;

  setProfiles: (profiles: ProfileInfo[]) => void;
  setSaves: (saves: SaveInfo[]) => void;
  setSelectedProfile: (profile: ProfileInfo | null) => void;
  setSelectedSave: (save: SaveInfo | null) => void;
  setSaveData: (data: SaveData | null) => void;
  setMoneyInput: (value: string) => void;
  setXpInput: (value: string) => void;
  setActiveWorkspace: (workspace: WorkspaceTab) => void;
  setSelectedConfigPath: (path: string | null) => void;
}

export const useSaveEditorStore = create<SaveEditorState>()(
  persist(
    (set) => ({
      profiles: [],
      saves: [],
      selectedProfile: null,
      selectedSave: null,
      saveData: null,
      moneyInput: "",
      xpInput: "",
      activeWorkspace: "saves",
      selectedConfigPath: null,

      setProfiles: (profiles) => set({ profiles }),
      setSaves: (saves) => set({ saves }),
      setSelectedProfile: (selectedProfile) => set({ selectedProfile }),
      setSelectedSave: (selectedSave) => set({ selectedSave }),
      setSaveData: (saveData) => set({ saveData }),
      setMoneyInput: (moneyInput) => set({ moneyInput }),
      setXpInput: (xpInput) => set({ xpInput }),
      setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
      setSelectedConfigPath: (selectedConfigPath) => set({ selectedConfigPath }),
    }),
    {
      name: "save-editor",
      storage: getPersistStorage(),
      partialize: (state) => ({
        activeWorkspace: state.activeWorkspace,
        selectedConfigPath: state.selectedConfigPath,
      }),
    },
  ),
);
