import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import * as v from "valibot";

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
interface TruckInfo {
  index: number;
  license_plate: string | null;
  odometer_km: number | null;
  fuel_relative: number | null;
  engine_wear: number | null;
  transmission_wear: number | null;
  cabin_wear: number | null;
  chassis_wear: number | null;
}

interface SaveData {
  money: number | null;
  xp: number | null;
  level: number | null;
  trucks_count: number | null;
  drivers_count: number | null;
  hq_city: string | null;
  trucks: TruckInfo[];
  money_account: string | null;
  experience_points: string | null;
  was_compressed: boolean;
}
type ConfigValueType = "Int" | "Float" | "Bool" | "String";

interface ConfigEntry {
  prefix: string;
  key: string;
  value: string;
  category: string;
  value_type: ConfigValueType;
}
interface ConfigDocument {
  entries: ConfigEntry[];
}

const IntSchema = v.pipe(v.string(), v.regex(/^-?\d+$/));
const FloatSchema = v.pipe(v.string(), v.regex(/^-?\d*\.?\d+$/));
const BoolSchema = v.union([
  v.literal("0"), v.literal("1"),
  v.literal("true"), v.literal("false"),
]);

function validateValue(value: string, type: ConfigValueType): string | null {
  const result = v.safeParse(
    type === "Int" ? IntSchema :
    type === "Float" ? FloatSchema :
    type === "Bool" ? BoolSchema :
    v.string(),
    value
  );
  if (result.success) return null;
  const issue = result.issues[0];
  if (issue) {
    if (type === "Int") return "Expected an integer";
    if (type === "Float") return "Expected a number";
    if (type === "Bool") return "Expected 0, 1, true, or false";
  }
  return "Invalid value";
}

interface EditResult {
  message: string;
  backup: string | null;
}

function App() {
  const [tab, setTab] = useState<"saves" | "config">("saves");
  const [readOnly, setReadOnly] = useState(true);

  // Save editor state
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [saves, setSaves] = useState<SaveInfo[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedSave, setSelectedSave] = useState<string | null>(null);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [moneyInput, setMoneyInput] = useState("");
  const [xpInput, setXpInput] = useState("");

  const [saveRename, setSaveRename] = useState("");
  const [saveClone, setSaveClone] = useState("");

  // Config editor state
  const [configPaths, setConfigPaths] = useState<string[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [configDoc, setConfigDoc] = useState<ConfigDocument | null>(null);
  const [configFilter, setConfigFilter] = useState("");
  const [configCategory, setConfigCategory] = useState("");
  const [configErrors, setConfigErrors] = useState<Record<string, string | null>>({});

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

  const handleMaxSkills = useCallback(async () => {
    if (!selectedSave) return;
    setStatus("Maxing skills...");
    try {
      const result = await invoke<EditResult>("max_skills", { gameSiiPath: selectedSave });
      setStatus(result.message);
      selectSave(selectedSave);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedSave, selectSave]);

  const handleRepair = useCallback(async () => {
    if (!selectedSave) return;
    setStatus("Repairing...");
    try {
      const result = await invoke<EditResult>("repair_all", { gameSiiPath: selectedSave });
      setStatus(result.message);
      selectSave(selectedSave);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedSave, selectSave]);

  const handleRefuel = useCallback(async () => {
    if (!selectedSave) return;
    setStatus("Refueling...");
    try {
      const result = await invoke<EditResult>("refuel_all", { gameSiiPath: selectedSave });
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
    setConfigErrors({});
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

  const handleConfigValueChange = useCallback((key: string, value: string, type: ConfigValueType) => {
    if (!configDoc) return;
    const error = validateValue(value, type);
    setConfigErrors((prev) => ({ ...prev, [key]: error }));
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

  // --- Profile / Save Management ---

  const handleProfileDelete = useCallback(async () => {
    if (!selectedProfile) return;
    if (!confirm("Are you sure you want to delete this profile? A backup will be created.")) return;
    setStatus("Deleting profile...");
    try {
      const result = await invoke<EditResult>("delete_profile", {
        profilePath: selectedProfile,
      });
      setStatus(result.message);
      setSelectedProfile(null);
      setSaves([]);
      setSelectedSave(null);
      setSaveData(null);
      loadProfiles();
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedProfile, loadProfiles]);

  const handleSaveRename = useCallback(async () => {
    if (!selectedSave || !saveRename.trim()) return;
    setStatus("Renaming save...");
    try {
      const result = await invoke<EditResult>("rename_save", {
        gameSiiPath: selectedSave,
        newName: saveRename.trim(),
      });
      setStatus(result.message);
      setSaveRename("");
      if (selectedProfile) {
        const res = await invoke<SaveInfo[]>("get_saves", { profilePath: selectedProfile });
        setSaves(res);
      }
      setSelectedSave(null);
      setSaveData(null);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedSave, saveRename, selectedProfile]);

  const handleSaveClone = useCallback(async () => {
    if (!selectedSave || !saveClone.trim()) return;
    setStatus("Cloning save...");
    try {
      const result = await invoke<EditResult>("clone_save", {
        gameSiiPath: selectedSave,
        newName: saveClone.trim(),
      });
      setStatus(result.message);
      setSaveClone("");
      if (selectedProfile) {
        const res = await invoke<SaveInfo[]>("get_saves", { profilePath: selectedProfile });
        setSaves(res);
      }
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedSave, saveClone, selectedProfile]);

  const handleSaveDelete = useCallback(async () => {
    if (!selectedSave) return;
    if (!confirm("Are you sure you want to delete this save? A backup will be created.")) return;
    setStatus("Deleting save...");
    try {
      const result = await invoke<EditResult>("delete_save", {
        gameSiiPath: selectedSave,
      });
      setStatus(result.message);
      setSelectedSave(null);
      setSaveData(null);
      if (selectedProfile) {
        const res = await invoke<SaveInfo[]>("get_saves", { profilePath: selectedProfile });
        setSaves(res);
      }
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedSave, selectedProfile]);

  

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <h1 className="text-2xl font-bold mb-4">ETS Vibes</h1>

      {/* Read-Only Toggle */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <button
          onClick={() => setReadOnly(!readOnly)}
          className={`px-3 py-1 rounded text-xs font-medium ${
            readOnly ? "bg-yellow-800 text-yellow-200" : "bg-green-800 text-green-200"
          }`}
        >
          {readOnly ? "🔒 Read Only" : "✏️ Editing Enabled"}
        </button>
        <span className="text-zinc-600 text-xs">
          {readOnly ? "Enable to make changes" : "All edits will modify files"}
        </span>
      </div>

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

          {selectedProfile && (
            <div className="mb-4 p-3 bg-zinc-900 rounded border border-zinc-800">
              <div className="flex items-center gap-2">
                <button onClick={handleProfileDelete} disabled={readOnly}
                  className="px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-xs disabled:opacity-40">
                  Delete Profile
                </button>
                <span className="text-xs text-zinc-600">Profile name is set by the game and cannot be renamed</span>
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

          {selectedSave && (
            <div className="mb-4 p-3 bg-zinc-900 rounded border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="New save name"
                  value={saveRename}
                  onChange={(e) => setSaveRename(e.target.value)}
                  className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs w-40"
                  disabled={readOnly}
                />
                <button onClick={handleSaveRename} disabled={readOnly}
                  className="px-2 py-1 bg-blue-800 hover:bg-blue-700 rounded text-xs disabled:opacity-40">
                  Rename
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Clone name"
                  value={saveClone}
                  onChange={(e) => setSaveClone(e.target.value)}
                  className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs w-40"
                  disabled={readOnly}
                />
                <button onClick={handleSaveClone} disabled={readOnly}
                  className="px-2 py-1 bg-purple-800 hover:bg-purple-700 rounded text-xs disabled:opacity-40">
                  Clone
                </button>
                <button onClick={handleSaveDelete} disabled={readOnly}
                  className="px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-xs disabled:opacity-40">
                  Delete
                </button>
              </div>
            </div>
          )}

          {saveData && (
            <div className="mb-6 p-4 bg-zinc-900 rounded border border-zinc-800">
              <h2 className="text-sm font-semibold mb-3">Save Preview</h2>
              <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-400">
                <div>Level: {saveData.level ?? "N/A"}</div>
                <div>Money: {saveData.money_account ?? "N/A"}</div>
                <div>XP: {saveData.experience_points ?? "N/A"}</div>
                <div>Trucks: {saveData.trucks_count ?? "N/A"}</div>
                <div>Drivers: {saveData.drivers_count ?? "N/A"}</div>
                <div>HQ: {saveData.hq_city ?? "N/A"}</div>
              </div>
              {saveData.trucks.length > 0 && (
                <div className="mb-3 mt-4">
                  <h3 className="text-sm font-semibold mb-2">Trucks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {saveData.trucks.map((t) => (
                      <div key={t.index} className="p-2 bg-zinc-800 rounded border border-zinc-700 text-xs">
                        <div className="font-medium text-zinc-200 mb-1">Truck {t.index + 1}</div>
                        <div className="text-zinc-400">
                          {t.license_plate && <div>Plate: {t.license_plate}</div>}
                          {t.odometer_km != null && <div>Odometer: {t.odometer_km.toLocaleString()} km</div>}
                          {t.fuel_relative != null && <div>Fuel: {(t.fuel_relative * 100).toFixed(0)}%</div>}
                          {t.engine_wear != null && <div>Engine: {(t.engine_wear * 100).toFixed(1)}%</div>}
                          {t.transmission_wear != null && <div>Transmission: {(t.transmission_wear * 100).toFixed(1)}%</div>}
                          {t.cabin_wear != null && <div>Cabin: {(t.cabin_wear * 100).toFixed(1)}%</div>}
                          {t.chassis_wear != null && <div>Chassis: {(t.chassis_wear * 100).toFixed(1)}%</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <h3 className="text-sm font-semibold mb-3 mt-4">Edit Values</h3>
              <div className="flex flex-wrap gap-3 mb-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Money</label>
                  <input type="number" value={moneyInput} onChange={(e) => setMoneyInput(e.target.value)}
                    className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs w-32"
                    disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">XP</label>
                  <input type="number" value={xpInput} onChange={(e) => setXpInput(e.target.value)}
                    className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs w-32"
                    disabled={readOnly} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleEdit} disabled={readOnly}
                  className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-xs disabled:opacity-40">Save Changes</button>
                <button onClick={handleUnlock} disabled={readOnly}
                  className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded text-xs disabled:opacity-40">Unlock Cities</button>
                <button onClick={handleMaxSkills} disabled={readOnly}
                  className="px-3 py-1 bg-yellow-800 hover:bg-yellow-700 rounded text-xs disabled:opacity-40">Max Skills</button>
                <button onClick={handleRepair} disabled={readOnly}
                  className="px-3 py-1 bg-blue-800 hover:bg-blue-700 rounded text-xs disabled:opacity-40">Repair All</button>
                <button onClick={handleRefuel} disabled={readOnly}
                  className="px-3 py-1 bg-orange-800 hover:bg-orange-700 rounded text-xs disabled:opacity-40">Refuel All</button>
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
                <button onClick={handleConfigSave}
                  disabled={readOnly || Object.values(configErrors).some((e) => e !== null)}
                  className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-xs disabled:opacity-40">
                  Save Config
                </button>
              </div>

              {Object.values(configErrors).some((e) => e !== null) && (
                <div className="mb-3 text-xs text-red-400">
                  Fix validation errors before saving
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="text-left py-1 pr-2">Key</th>
                      <th className="text-left py-1 pr-2">Value</th>
                      <th className="text-left py-1">Type</th>
                      <th className="text-left py-1">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((e) => {
                      const error = configErrors[e.key];
                      return (
                        <tr key={e.key} className="border-b border-zinc-900 hover:bg-zinc-900">
                          <td className="py-1 pr-2 text-zinc-300 whitespace-nowrap">{formatKeyName(e.key)}</td>
                          <td className="py-1 pr-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={e.value}
                                onChange={(ev) => handleConfigValueChange(e.key, ev.target.value, e.value_type)}
                                className={`w-full bg-transparent border-b outline-none text-xs ${
                                  error
                                    ? "border-red-600 text-red-300"
                                    : "border-transparent hover:border-zinc-700 focus:border-blue-500"
                                }`}
                              />
                              {error && (
                                <span className="text-red-400 text-xs shrink-0" title={error}>⚠</span>
                              )}
                            </div>
                            {error && (
                              <div className="text-red-500 text-[10px] mt-0.5">{error}</div>
                            )}
                          </td>
                          <td className="py-1 pr-2 text-zinc-500 whitespace-nowrap text-[10px]">{e.value_type}</td>
                          <td className="py-1 text-zinc-500 whitespace-nowrap">{e.category}</td>
                        </tr>
                      );
                    })}
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
