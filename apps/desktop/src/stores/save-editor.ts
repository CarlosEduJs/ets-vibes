import { create } from "zustand";
import type { ProfileInfo, SaveInfo, SaveData, SaveEditorView } from "../types";

export type WorkspaceTab = "saves" | "config";

interface SaveEditorState {
  view: SaveEditorView;
  profiles: ProfileInfo[];
  saves: SaveInfo[];
  selectedProfile: ProfileInfo | null;
  selectedSave: SaveInfo | null;
  saveData: SaveData | null;
  moneyInput: string;
  xpInput: string;
  activeWorkspace: WorkspaceTab;
  selectedConfigPath: string | null;

  setView: (view: SaveEditorView) => void;
  resetToProfiles: () => void;
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

export const useSaveEditorStore = create<SaveEditorState>((set) => ({
  view: { level: "profiles" },
  profiles: [],
  saves: [],
  selectedProfile: null,
  selectedSave: null,
  saveData: null,
  moneyInput: "",
  xpInput: "",
  activeWorkspace: "saves",
  selectedConfigPath: null,

  setView: (view) => set({ view }),
  resetToProfiles: () =>
    set({
      view: { level: "profiles" },
      selectedProfile: null,
      selectedSave: null,
      saves: [],
      saveData: null,
      moneyInput: "",
      xpInput: "",
    }),
  setProfiles: (profiles) => set({ profiles }),
  setSaves: (saves) => set({ saves }),
  setSelectedProfile: (selectedProfile) => set({ selectedProfile }),
  setSelectedSave: (selectedSave) => set({ selectedSave }),
  setSaveData: (saveData) => set({ saveData }),
  setMoneyInput: (moneyInput) => set({ moneyInput }),
  setXpInput: (xpInput) => set({ xpInput }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setSelectedConfigPath: (selectedConfigPath) => set({ selectedConfigPath }),
}));
