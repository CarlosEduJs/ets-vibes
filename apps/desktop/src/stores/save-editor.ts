import { create } from "zustand";
import type { ProfileInfo, SaveInfo, SaveData, SaveEditorView } from "../types";

interface SaveEditorState {
  view: SaveEditorView;
  profiles: ProfileInfo[];
  saves: SaveInfo[];
  saveData: SaveData | null;
  moneyInput: string;
  xpInput: string;

  setView: (view: SaveEditorView) => void;
  resetToProfiles: () => void;
  setProfiles: (profiles: ProfileInfo[]) => void;
  setSaves: (saves: SaveInfo[]) => void;
  setSaveData: (data: SaveData | null) => void;
  setMoneyInput: (value: string) => void;
  setXpInput: (value: string) => void;
}

export const useSaveEditorStore = create<SaveEditorState>((set) => ({
  view: { level: "profiles" },
  profiles: [],
  saves: [],
  saveData: null,
  moneyInput: "",
  xpInput: "",

  setView: (view) => set({ view }),
  resetToProfiles: () =>
    set({ view: { level: "profiles" }, saves: [], saveData: null, moneyInput: "", xpInput: "" }),
  setProfiles: (profiles) => set({ profiles }),
  setSaves: (saves) => set({ saves }),
  setSaveData: (data) => set({ saveData: data }),
  setMoneyInput: (value) => set({ moneyInput: value }),
  setXpInput: (value) => set({ xpInput: value }),
}));
