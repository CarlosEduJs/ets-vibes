import { LazyStore } from "@tauri-apps/plugin-store";
import type { PersistStorage, StorageValue } from "zustand/middleware";

function createFallbackStorage<S>(): PersistStorage<S> {
  return {
    getItem: (name) => {
      const raw = localStorage.getItem(name);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as StorageValue<S>;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name) => {
      localStorage.removeItem(name);
    },
  };
}

function createTauriStorage<S>(): PersistStorage<S> {
  const store = new LazyStore("settings.json");

  return {
    getItem: async (name) => {
      const value = await store.get<StorageValue<S>>(name);
      return value ?? null;
    },
    setItem: async (name, value) => {
      await store.set(name, value);
    },
    removeItem: async (name) => {
      await store.delete(name);
    },
  };
}

let storage: PersistStorage<unknown> | null = null;

export function getPersistStorage<S>(): PersistStorage<S> {
  if (storage) return storage as PersistStorage<S>;

  try {
    storage = createTauriStorage<S>() as PersistStorage<unknown>;
  } catch {
    storage = createFallbackStorage<S>() as PersistStorage<unknown>;
  }

  return storage as PersistStorage<S>;
}
