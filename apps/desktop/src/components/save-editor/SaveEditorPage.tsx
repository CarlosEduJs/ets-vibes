import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "ui";
import type { ProfileInfo, SaveInfo, SaveData, EditResult, SaveEditorView } from "../../types";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { ProfileGrid } from "./ProfileGrid";
import { SaveList } from "./SaveList";
import { SaveDetailPanel } from "./SaveDetailPanel";

interface SaveEditorPageProps {
  readOnly: boolean;
  onStatusChange: (message: string) => void;
}

export function SaveEditorPage({ readOnly, onStatusChange }: SaveEditorPageProps) {
  const [view, setView] = useState<SaveEditorView>({ level: "profiles" });
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [saves, setSaves] = useState<SaveInfo[]>([]);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [moneyInput, setMoneyInput] = useState("");
  const [xpInput, setXpInput] = useState("");

  // --- Navigation ---
  const navigateToProfiles = useCallback(() => {
    setView({ level: "profiles" });
    setSaves([]);
    setSaveData(null);
  }, []);

  const navigateToSaves = useCallback(() => {
    if (view.level === "detail") {
      setView({ level: "saves", profile: view.profile });
      setSaveData(null);
    }
  }, [view]);

  // --- Profile ---
  const loadProfiles = useCallback(async () => {
    onStatusChange("Loading profiles...");
    try {
      const result = await invoke<ProfileInfo[]>("list_profiles");
      setProfiles(result);
      onStatusChange(`Found ${result.length} profiles`);
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [onStatusChange]);

  const selectProfile = useCallback(
    async (path: string) => {
      onStatusChange("Loading saves...");
      try {
        const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
          profilePath: path,
        });
        const profile = profiles.find((p) => p.path === path);
        if (!profile) {
          onStatusChange("Profile not found");
          return;
        }
        setSaves(fetchedSaves);
        setView({ level: "saves", profile });
        onStatusChange(`Found ${fetchedSaves.length} saves`);
      } catch (e) {
        onStatusChange(`Error: ${e}`);
      }
    },
    [profiles, onStatusChange],
  );

  // --- Save ---
  const selectSave = useCallback(
    async (gameSiiPath: string) => {
      onStatusChange("Loading save...");
      try {
        const data = await invoke<SaveData>("load_save", { gameSiiPath });
        setSaveData(data);
        setMoneyInput(data.money_account ?? "");
        setXpInput(data.experience_points ?? "");
        if (view.level === "saves") {
          const save = saves.find((s) => s.game_sii_path === gameSiiPath);
          if (save) {
            setView({ level: "detail", profile: view.profile, save });
          }
        }
        onStatusChange(`Save loaded${data.was_compressed ? " (was compressed)" : " (plaintext)"}`);
      } catch (e) {
        onStatusChange(`Error: ${e}`);
      }
    },
    [saves, view, onStatusChange],
  );

  // --- Save Actions ---
  const handleEdit = useCallback(async () => {
    if (view.level !== "detail") return;
    const money = moneyInput ? Number(moneyInput) : null;
    const xp = xpInput ? Number(xpInput) : null;
    if (money === null && xp === null) {
      onStatusChange("Enter a value for money or XP");
      return;
    }
    onStatusChange("Saving...");
    try {
      const result = await invoke<EditResult>("edit_save", {
        gameSiiPath: view.save.game_sii_path,
        money,
        xp,
      });
      onStatusChange(result.message);
      selectSave(view.save.game_sii_path);
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [view, moneyInput, xpInput, onStatusChange, selectSave]);

  const handleUnlock = useCallback(async () => {
    if (view.level !== "detail") return;
    onStatusChange("Unlocking cities...");
    try {
      const result = await invoke<EditResult>("unlock_cities", {
        gameSiiPath: view.save.game_sii_path,
      });
      onStatusChange(result.message);
      selectSave(view.save.game_sii_path);
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [view, onStatusChange, selectSave]);

  const handleMaxSkills = useCallback(async () => {
    if (view.level !== "detail") return;
    onStatusChange("Maxing skills...");
    try {
      const result = await invoke<EditResult>("max_skills", {
        gameSiiPath: view.save.game_sii_path,
      });
      onStatusChange(result.message);
      selectSave(view.save.game_sii_path);
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [view, onStatusChange, selectSave]);

  const handleRepair = useCallback(async () => {
    if (view.level !== "detail") return;
    onStatusChange("Repairing...");
    try {
      const result = await invoke<EditResult>("repair_all", {
        gameSiiPath: view.save.game_sii_path,
      });
      onStatusChange(result.message);
      selectSave(view.save.game_sii_path);
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [view, onStatusChange, selectSave]);

  const handleRefuel = useCallback(async () => {
    if (view.level !== "detail") return;
    onStatusChange("Refueling...");
    try {
      const result = await invoke<EditResult>("refuel_all", {
        gameSiiPath: view.save.game_sii_path,
      });
      onStatusChange(result.message);
      selectSave(view.save.game_sii_path);
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [view, onStatusChange, selectSave]);

  const handleRename = useCallback(
    async (newName: string) => {
      if (view.level !== "detail") return;
      onStatusChange("Renaming save...");
      try {
        const result = await invoke<EditResult>("rename_save", {
          gameSiiPath: view.save.game_sii_path,
          newName,
        });
        onStatusChange(result.message);
        if (view.profile) {
          const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
            profilePath: view.profile.path,
          });
          setSaves(fetchedSaves);
        }
        setView({ level: "saves", profile: view.profile });
        setSaveData(null);
      } catch (e) {
        onStatusChange(`Error: ${e}`);
      }
    },
    [view, onStatusChange],
  );

  const handleClone = useCallback(
    async (newName: string) => {
      if (view.level !== "detail") return;
      onStatusChange("Cloning save...");
      try {
        const result = await invoke<EditResult>("clone_save", {
          gameSiiPath: view.save.game_sii_path,
          newName,
        });
        onStatusChange(result.message);
        if (view.profile) {
          const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
            profilePath: view.profile.path,
          });
          setSaves(fetchedSaves);
        }
      } catch (e) {
        onStatusChange(`Error: ${e}`);
      }
    },
    [view, onStatusChange],
  );

  const handleDelete = useCallback(async () => {
    if (view.level !== "detail") return;
    // eslint-disable-next-line no-alert
    if (!confirm("Are you sure you want to delete this save? A backup will be created.")) return;
    onStatusChange("Deleting save...");
    try {
      const result = await invoke<EditResult>("delete_save", {
        gameSiiPath: view.save.game_sii_path,
      });
      onStatusChange(result.message);
      if (view.profile) {
        const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
          profilePath: view.profile.path,
        });
        setSaves(fetchedSaves);
      }
      setView({ level: "saves", profile: view.profile });
      setSaveData(null);
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [view, onStatusChange]);

  const handleProfileDelete = useCallback(async () => {
    if (view.level !== "saves" && view.level !== "detail") return;
    const profile = view.level === "saves" ? view.profile : view.profile;
    // eslint-disable-next-line no-alert
    if (!confirm("Are you sure you want to delete this profile? A backup will be created.")) return;
    onStatusChange("Deleting profile...");
    try {
      const result = await invoke<EditResult>("delete_profile", {
        profilePath: profile.path,
      });
      onStatusChange(result.message);
      setView({ level: "profiles" });
      setSaves([]);
      setSaveData(null);
      loadProfiles();
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [view, onStatusChange, loadProfiles]);

  // --- Render ---
  return (
    <div className="space-y-6">
      <BreadcrumbNav
        profileName={view.level !== "profiles" ? view.profile.display_name : undefined}
        saveName={view.level === "detail" ? view.save.save_name : undefined}
        onNavigateProfiles={navigateToProfiles}
        onNavigateSaves={navigateToSaves}
      />

      {view.level === "profiles" && (
        <ProfileGrid
          profiles={profiles}
          selectedProfile={null}
          onSelectProfile={selectProfile}
          onLoadProfiles={loadProfiles}
        />
      )}

      {view.level === "saves" && (
        <div>
          <div className="mb-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleProfileDelete}
              disabled={readOnly}
            >
              Delete Profile
            </Button>
            <span className="ml-2 text-xs text-muted-foreground">
              Profile name is set by the game and cannot be renamed
            </span>
          </div>
          <SaveList saves={saves} selectedSave={null} onSelectSave={selectSave} />
        </div>
      )}

      {view.level === "detail" && saveData && (
        <SaveDetailPanel
          saveData={saveData}
          moneyInput={moneyInput}
          xpInput={xpInput}
          readOnly={readOnly}
          onMoneyChange={setMoneyInput}
          onXpChange={setXpInput}
          onSaveEdits={handleEdit}
          onUnlock={handleUnlock}
          onMaxSkills={handleMaxSkills}
          onRepair={handleRepair}
          onRefuel={handleRefuel}
          onRename={handleRename}
          onClone={handleClone}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
