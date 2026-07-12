import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

function formatKeyName(key: string): string {
  const parts = key.split("_");
  const startIdx = parts[0]?.length === 1 || parts[0] === "ui" ? 1 : 0;
  const name = parts
    .slice(startIdx)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return `${name} (${key})`;
}

interface ProfileInfo {
  path: string;
  name: string;
  display_name: string;
}
interface SaveInfo {
  profile_path: string;
  save_name: string;
  path: string;
  game_sii_path: string;
}
interface SaveData {
  money: number | null;
  xp: number | null;
  money_account: string | null;
  experience_points: string | null;
  was_compressed: boolean;
}
interface ConfigEntry {
  prefix: string;
  key: string;
  value: string;
  category: string;
}
interface ConfigDocument {
  entries: ConfigEntry[];
}

interface EditResult {
  message: string;
  backup: string | null;
}

function App() {
  const [tab, setTab] = useState<"saves" | "config">("saves");

  // Save editor state
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [saves, setSaves] = useState<SaveInfo[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedSave, setSelectedSave] = useState<string | null>(null);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [moneyInput, setMoneyInput] = useState("");
  const [xpInput, setXpInput] = useState("");

  // Config editor state
  const [configPaths, setConfigPaths] = useState<string[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [configDoc, setConfigDoc] = useState<ConfigDocument | null>(null);
  const [configFilter, setConfigFilter] = useState("");
  const [configCategory, setConfigCategory] = useState("");

  const [status, setStatus] = useState("");

  // --- Save Editor ---

  const loadProfiles = useCallback(async () => {
    setStatus("Loading profiles...");
    try {
      const result = await invoke<ProfileInfo[]>("list_profiles");
      setProfiles(result);
      setStatus(`Found ${result.length} profiles`);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, []);

  const selectProfile = useCallback(async (path: string) => {
    setSelectedProfile(path);
    setSaves([]);
    setSelectedSave(null);
    setSaveData(null);
    setStatus("Loading saves...");
    try {
      const result = await invoke<SaveInfo[]>("get_saves", { profilePath: path });
      setSaves(result);
      setStatus(`Found ${result.length} saves`);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, []);

  const selectSave = useCallback(async (gameSiiPath: string) => {
    setSelectedSave(gameSiiPath);
    setSaveData(null);
    setStatus("Loading save...");
    try {
      const result = await invoke<SaveData>("load_save", { gameSiiPath });
      setSaveData(result);
      setMoneyInput(result.money_account ?? "");
      setXpInput(result.experience_points ?? "");
      setStatus(`Save loaded${result.was_compressed ? " (was compressed)" : " (plaintext)"}`);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, []);

  const handleEdit = useCallback(async () => {
    if (!selectedSave) return;
    const money = moneyInput ? Number(moneyInput) : null;
    const xp = xpInput ? Number(xpInput) : null;
    if (money === null && xp === null) {
      setStatus("Enter a value for money or XP");
      return;
    }
    setStatus("Saving...");
    try {
      const result = await invoke<EditResult>("edit_save", {
        gameSiiPath: selectedSave, money, xp,
      });
      setStatus(result.message);
      selectSave(selectedSave);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedSave, moneyInput, xpInput, selectSave]);

  const handleUnlock = useCallback(async () => {
    if (!selectedSave) return;
    setStatus("Unlocking cities...");
    try {
      const result = await invoke<EditResult>("unlock_cities", { gameSiiPath: selectedSave });
      setStatus(result.message);
      selectSave(selectedSave);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedSave, selectSave]);

  // --- Config Editor ---

  const loadConfigs = useCallback(async () => {
    setStatus("Searching config files...");
    try {
      const result = await invoke<string[]>("list_configs");
      setConfigPaths(result);
      setStatus(`Found ${result.length} config files`);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, []);

  const selectConfig = useCallback(async (path: string) => {
    setSelectedConfig(path);
    setConfigDoc(null);
    setConfigFilter("");
    setConfigCategory("");
    setStatus("Loading config...");
    try {
      const result = await invoke<ConfigDocument>("load_config", { path });
      setConfigDoc(result);
      setStatus(`Loaded ${result.entries.length} entries`);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, []);

  const handleConfigSave = useCallback(async () => {
    if (!selectedConfig || !configDoc) return;
    setStatus("Saving config...");
    try {
      const result = await invoke<EditResult>("save_config", { path: selectedConfig, entries: configDoc.entries });
      setStatus(result.message);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedConfig, configDoc]);

  const handleConfigValueChange = useCallback((key: string, value: string) => {
    if (!configDoc) return;
    setConfigDoc({
      ...configDoc,
      entries: configDoc.entries.map((e) =>
        e.key === key ? { ...e, value } : e
      ),
    });
  }, [configDoc]);

  const categories = ["", "Graphics", "Multi Monitor", "VR", "Sound", "Input", "Gameplay",
    "Graphics Advanced", "Developer", "Steam", "Radio", "Framerate", "UI", "Misc"];

  const filteredEntries = configDoc?.entries.filter((e) => {
    if (configCategory && e.category !== configCategory) return false;
    if (configFilter) {
      const q = configFilter.toLowerCase();
      return e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q);
    }
    return true;
  }) ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <h1 className="text-2xl font-bold mb-4">ETS Vibes</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setTab("saves")}
          className={`text-sm ${tab === "saves" ? "text-blue-400 border-b-2 border-blue-400" : "text-zinc-500"}`}
        >
          Save Editor
        </button>
        <button
          onClick={() => setTab("config")}
          className={`text-sm ${tab === "config" ? "text-blue-400 border-b-2 border-blue-400" : "text-zinc-500"}`}
        >
          Config Editor
        </button>
      </div>

      {tab === "saves" && (
        <>
          <button onClick={loadProfiles} className="mb-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm">
            Load Profiles
          </button>

          {profiles.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-2 text-zinc-400">Profiles</h2>
              <div className="flex flex-wrap gap-2">
                {profiles.map((p) => (
                  <button key={p.path} onClick={() => selectProfile(p.path)}
                    className={`px-3 py-1 rounded text-xs ${selectedProfile === p.path ? "bg-blue-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
                  >{p.display_name}</button>
                ))}
              </div>
            </div>
          )}

          {saves.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-2 text-zinc-400">Saves</h2>
              <div className="flex flex-wrap gap-2">
                {saves.map((s) => (
                  <button key={s.game_sii_path} onClick={() => selectSave(s.game_sii_path)}
                    className={`px-3 py-1 rounded text-xs ${selectedSave === s.game_sii_path ? "bg-green-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
                  >{s.save_name}</button>
                ))}
              </div>
            </div>
          )}

          {saveData && (
            <div className="mb-6 p-4 bg-zinc-900 rounded border border-zinc-800">
              <h2 className="text-sm font-semibold mb-3">Save Editor</h2>
              <div className="mb-3 text-xs text-zinc-400">
                <div>Money: {saveData.money_account ?? "N/A"}</div>
                <div>XP: {saveData.experience_points ?? "N/A"}</div>
              </div>
              <div className="flex flex-wrap gap-3 mb-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Money</label>
                  <input type="number" value={moneyInput} onChange={(e) => setMoneyInput(e.target.value)}
                    className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs w-32" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">XP</label>
                  <input type="number" value={xpInput} onChange={(e) => setXpInput(e.target.value)}
                    className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleEdit} className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-xs">Save Changes</button>
                <button onClick={handleUnlock} className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded text-xs">Unlock Cities</button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "config" && (
        <>
          <button onClick={loadConfigs} className="mb-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm">
            Find Configs
          </button>

          {configPaths.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold mb-2 text-zinc-400">Config Files</h2>
              <div className="flex flex-wrap gap-2">
                {configPaths.map((p) => {
                  const label = p.split("/").slice(-3).join("/");
                  return (
                    <button key={p} onClick={() => selectConfig(p)}
                      className={`px-3 py-1 rounded text-xs ${selectedConfig === p ? "bg-blue-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
                    >{label}</button>
                  );
                })}
              </div>
            </div>
          )}

          {configDoc && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Search..."
                  value={configFilter}
                  onChange={(e) => setConfigFilter(e.target.value)}
                  className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs w-48"
                />
                <select
                  value={configCategory}
                  onChange={(e) => setConfigCategory(e.target.value)}
                  className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs"
                >
                  <option value="">All Categories</option>
                  {categories.filter(Boolean).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button onClick={handleConfigSave} className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-xs">
                  Save Config
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="text-left py-1 pr-2">Key</th>
                      <th className="text-left py-1 pr-2">Value</th>
                      <th className="text-left py-1">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((e) => (
                      <tr key={e.key} className="border-b border-zinc-900 hover:bg-zinc-900">
                        <td className="py-1 pr-2 text-zinc-300 whitespace-nowrap">{formatKeyName(e.key)}</td>
                        <td className="py-1 pr-2">
                          <input
                            type="text"
                            value={e.value}
                            onChange={(ev) => handleConfigValueChange(e.key, ev.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-blue-500 outline-none text-xs"
                          />
                        </td>
                        <td className="py-1 text-zinc-500 whitespace-nowrap">{e.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-zinc-600 mt-2">
                {filteredEntries.length} / {configDoc.entries.length} entries
              </div>
            </div>
          )}
        </>
      )}

      {status && <div className="text-xs text-zinc-500 mt-4 border-t border-zinc-800 pt-3">{status}</div>}
    </div>
  );
}

export default App;
