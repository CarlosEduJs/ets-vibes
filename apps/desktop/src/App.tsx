import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

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

function App() {
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [saves, setSaves] = useState<SaveInfo[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedSave, setSelectedSave] = useState<string | null>(null);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [status, setStatus] = useState("");
  const [moneyInput, setMoneyInput] = useState("");
  const [xpInput, setXpInput] = useState("");

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
      const result = await invoke<string>("edit_save", {
        gameSiiPath: selectedSave,
        money: money,
        xp: xp,
      });
      setStatus(result);
      selectSave(selectedSave);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedSave, moneyInput, xpInput, selectSave]);

  const handleUnlock = useCallback(async () => {
    if (!selectedSave) return;
    setStatus("Unlocking cities...");
    try {
      const result = await invoke<string>("unlock_cities", { gameSiiPath: selectedSave });
      setStatus(result);
      selectSave(selectedSave);
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [selectedSave, selectSave]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <h1 className="text-2xl font-bold mb-6">ETS Vibes</h1>

      <button
        onClick={loadProfiles}
        className="mb-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded"
      >
        Load Profiles
      </button>

      {profiles.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Profiles</h2>
          <div className="flex flex-wrap gap-2">
            {profiles.map((p) => (
              <button
                key={p.path}
                onClick={() => selectProfile(p.path)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedProfile === p.path ? "bg-blue-700" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {p.display_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {saves.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Saves</h2>
          <div className="flex flex-wrap gap-2">
            {saves.map((s) => (
              <button
                key={s.game_sii_path}
                onClick={() => selectSave(s.game_sii_path)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedSave === s.game_sii_path ? "bg-green-700" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {s.save_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {saveData && (
        <div className="mb-6 p-4 bg-zinc-900 rounded border border-zinc-800">
          <h2 className="text-lg font-semibold mb-3">Save Editor</h2>

          <div className="mb-3 text-sm text-zinc-400">
            <div>Money: {saveData.money_account ?? "N/A"}</div>
            <div>XP: {saveData.experience_points ?? "N/A"}</div>
          </div>

          <div className="flex flex-wrap gap-3 mb-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Money</label>
              <input
                type="number"
                value={moneyInput}
                onChange={(e) => setMoneyInput(e.target.value)}
                className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-sm w-36"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">XP</label>
              <input
                type="number"
                value={xpInput}
                onChange={(e) => setXpInput(e.target.value)}
                className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-sm w-36"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-1.5 bg-green-800 hover:bg-green-700 rounded text-sm"
            >
              Save Changes
            </button>
            <button
              onClick={handleUnlock}
              className="px-4 py-1.5 bg-purple-800 hover:bg-purple-700 rounded text-sm"
            >
              Unlock Cities
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className="text-sm text-zinc-500 mt-4 border-t border-zinc-800 pt-3">
          {status}
        </div>
      )}
    </div>
  );
}

export default App;
