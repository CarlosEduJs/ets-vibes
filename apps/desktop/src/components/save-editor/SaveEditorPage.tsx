import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  toast,
} from "ui";
import type { ProfileInfo, SaveInfo, SaveData, EditResult } from "../../types";
import { useSaveEditorStore } from "../../stores/save-editor";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { ProfileGrid } from "./ProfileGrid";
import { SaveList } from "./SaveList";
import { SaveDetailPanel } from "./SaveDetailPanel";

type QuickAction = "unlock" | "maxSkills" | "repair" | "refuel";

const QUICK_ACTION_LABELS: Record<QuickAction, string> = {
  unlock: "Unlock all cities in this save? This cannot be undone.",
  maxSkills: "Max out all skills? This cannot be undone.",
  repair: "Repair all trucks? This cannot be undone.",
  refuel: "Refuel all trucks? This cannot be undone.",
};

const QUICK_ACTION_NAMES: Record<QuickAction, string> = {
  unlock: "Unlock Cities",
  maxSkills: "Max Skills",
  repair: "Repair All",
  refuel: "Refuel All",
};

interface SaveEditorPageProps {
  readOnly: boolean;
  onStatusChange: (message: string) => void;
}

export function SaveEditorPage({ readOnly, onStatusChange }: SaveEditorPageProps) {
  const view = useSaveEditorStore((s) => s.view);
  const profiles = useSaveEditorStore((s) => s.profiles);
  const saves = useSaveEditorStore((s) => s.saves);
  const saveData = useSaveEditorStore((s) => s.saveData);
  const moneyInput = useSaveEditorStore((s) => s.moneyInput);
  const xpInput = useSaveEditorStore((s) => s.xpInput);
  const {
    setView,
    resetToProfiles,
    setProfiles,
    setSaves,
    setSaveData,
    setMoneyInput,
    setXpInput,
  } = useSaveEditorStore();

  const [deleteTarget, setDeleteTarget] = useState<"save" | "profile" | null>(null);
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Navigation ---
  const navigateToProfiles = useCallback(() => {
    resetToProfiles();
  }, [resetToProfiles]);

  const navigateToSaves = useCallback(() => {
    if (view.level === "detail") {
      setView({ level: "saves", profile: view.profile });
      setSaveData(null);
    }
  }, [view, setView, setSaveData]);

  // --- Profile ---
  const loadProfiles = useCallback(
    async (showToast = false) => {
      setIsLoading(true);
      onStatusChange("Loading profiles...");
      try {
        const result = await invoke<ProfileInfo[]>("list_profiles");
        setProfiles(result);
        const msg = `Found ${result.length} profiles`;
        if (showToast) toast.success(msg);
        onStatusChange(msg);
      } catch (e) {
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      } finally {
        setIsLoading(false);
      }
    },
    [onStatusChange, setProfiles],
  );

  useEffect(() => {
    loadProfiles(false);
  }, [loadProfiles]);

  const selectProfile = useCallback(
    async (path: string) => {
      setIsLoading(true);
      onStatusChange("Loading saves...");
      try {
        const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
          profilePath: path,
        });
        const profile = profiles.find((p) => p.path === path);
        if (!profile) {
          const msg = "Profile not found";
          toast.error(msg);
          onStatusChange(msg);
          return;
        }
        setSaves(fetchedSaves);
        setView({ level: "saves", profile });
        const msg = `Found ${fetchedSaves.length} saves`;
        toast.success(msg);
        onStatusChange(msg);
      } catch (e) {
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      } finally {
        setIsLoading(false);
      }
    },
    [profiles, onStatusChange, setSaves, setView],
  );

  // --- Save ---
  const selectSave = useCallback(
    async (gameSiiPath: string) => {
      setIsLoading(true);
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
        const msg = `Save loaded${data.was_compressed ? " (was compressed)" : " (plaintext)"}`;
        toast.success(msg);
        onStatusChange(msg);
      } catch (e) {
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      } finally {
        setIsLoading(false);
      }
    },
    [saves, view, onStatusChange, setSaveData, setMoneyInput, setXpInput, setView],
  );

  // --- Edit Money/XP ---
  const onEdit = useCallback(async () => {
    if (view.level !== "detail") return;
    const money = moneyInput ? Number(moneyInput) : null;
    const xp = xpInput ? Number(xpInput) : null;
    if (money === null && xp === null) {
      const msg = "Enter a value for money or XP";
      toast.error(msg);
      onStatusChange(msg);
      return;
    }
    onStatusChange("Saving...");
    try {
      const result = await invoke<EditResult>("edit_save", {
        gameSiiPath: view.save.game_sii_path,
        money,
        xp,
      });
      toast.success(result.message);
      onStatusChange(result.message);
      selectSave(view.save.game_sii_path);
    } catch (e) {
      toast.error(String(e));
      onStatusChange(`Error: ${e}`);
    }
  }, [view, moneyInput, xpInput, onStatusChange, selectSave]);

  // --- Quick Actions (with confirmation) ---
  const onUnlock = useCallback(() => {
    if (view.level !== "detail") return;
    setPendingAction("unlock");
  }, [view]);

  const onMaxSkills = useCallback(() => {
    if (view.level !== "detail") return;
    setPendingAction("maxSkills");
  }, [view]);

  const onRepair = useCallback(() => {
    if (view.level !== "detail") return;
    setPendingAction("repair");
  }, [view]);

  const onRefuel = useCallback(() => {
    if (view.level !== "detail") return;
    setPendingAction("refuel");
  }, [view]);

  const confirmAction = useCallback(async () => {
    if (view.level !== "detail" || !pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);

    const statusLabels: Record<QuickAction, string> = {
      unlock: "Unlocking cities...",
      maxSkills: "Maxing skills...",
      repair: "Repairing...",
      refuel: "Refueling...",
    };
    const invokeCommands: Record<QuickAction, string> = {
      unlock: "unlock_cities",
      maxSkills: "max_skills",
      repair: "repair_all",
      refuel: "refuel_all",
    };
    onStatusChange(statusLabels[action]);
    try {
      const result = await invoke<EditResult>(invokeCommands[action], {
        gameSiiPath: view.save.game_sii_path,
      });
      toast.success(result.message);
      onStatusChange(result.message);
      selectSave(view.save.game_sii_path);
    } catch (e) {
      toast.error(String(e));
      onStatusChange(`Error: ${e}`);
    }
  }, [view, pendingAction, onStatusChange, selectSave]);

  // --- Rename / Clone / Delete ---
  const onRename = useCallback(
    async (newName: string) => {
      if (view.level !== "detail") return;
      onStatusChange("Renaming save...");
      try {
        const result = await invoke<EditResult>("rename_save", {
          gameSiiPath: view.save.game_sii_path,
          newName,
        });
        toast.success(result.message);
        onStatusChange(result.message);
        if (view.profile) {
          const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
            profilePath: view.profile.path,
          });
          setSaves(fetchedSaves);
          const renamedSave = fetchedSaves.find((s) => s.save_name === newName);
          if (renamedSave) {
            const data = await invoke<SaveData>("load_save", {
              gameSiiPath: renamedSave.game_sii_path,
            });
            setSaveData(data);
            setMoneyInput(data.money_account ?? "");
            setXpInput(data.experience_points ?? "");
            setView({ level: "detail", profile: view.profile, save: renamedSave });
          } else {
            setView({ level: "saves", profile: view.profile });
            setSaveData(null);
          }
        }
      } catch (e) {
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      }
    },
    [view, onStatusChange, setSaves, setView, setSaveData, setMoneyInput, setXpInput],
  );

  const onClone = useCallback(
    async (newName: string) => {
      if (view.level !== "detail") return;
      onStatusChange("Cloning save...");
      try {
        const result = await invoke<EditResult>("clone_save", {
          gameSiiPath: view.save.game_sii_path,
          newName,
        });
        toast.success(result.message);
        onStatusChange(result.message);
        if (view.profile) {
          const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
            profilePath: view.profile.path,
          });
          setSaves(fetchedSaves);
        }
      } catch (e) {
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      }
    },
    [view, onStatusChange, setSaves],
  );

  const onDelete = useCallback(async () => {
    if (view.level !== "detail") return;
    setDeleteTarget("save");
  }, [view]);

  const confirmDeleteSave = useCallback(async () => {
    if (view.level !== "detail") return;
    setDeleteTarget(null);
    onStatusChange("Deleting save...");
    try {
      const result = await invoke<EditResult>("delete_save", {
        gameSiiPath: view.save.game_sii_path,
      });
      toast.success(result.message);
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
      toast.error(String(e));
      onStatusChange(`Error: ${e}`);
    }
  }, [view, onStatusChange, setSaves, setView, setSaveData]);

  const onProfileDelete = useCallback(async () => {
    if (view.level !== "saves" && view.level !== "detail") return;
    setDeleteTarget("profile");
  }, [view]);

  const confirmDeleteProfile = useCallback(async () => {
    if (view.level !== "saves" && view.level !== "detail") return;
    setDeleteTarget(null);
    const profile = view.profile;
    onStatusChange("Deleting profile...");
    try {
      const result = await invoke<EditResult>("delete_profile", {
        profilePath: profile.path,
      });
      toast.success(result.message);
      onStatusChange(result.message);
      setView({ level: "profiles" });
      setSaves([]);
      setSaveData(null);
      loadProfiles();
    } catch (e) {
      toast.error(String(e));
      onStatusChange(`Error: ${e}`);
    }
  }, [view, onStatusChange, loadProfiles, setView, setSaves, setSaveData]);

  // --- Keyboard navigation ---
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (deleteTarget || pendingAction) return;
      if (e.key === "Escape") {
        if (view.level === "detail") {
          navigateToSaves();
        } else if (view.level === "saves") {
          navigateToProfiles();
        }
      }
      if ((e.key === "s" || e.key === "S") && (e.metaKey || e.ctrlKey)) {
        if (!readOnly && view.level === "detail") {
          e.preventDefault();
          onEdit();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    view.level,
    deleteTarget,
    pendingAction,
    navigateToSaves,
    navigateToProfiles,
    readOnly,
    onEdit,
  ]);

  // --- Render ---
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background pb-2">
        <BreadcrumbNav
          profileName={view.level !== "profiles" ? view.profile.display_name : undefined}
          saveName={view.level === "detail" ? view.save.save_name : undefined}
          onNavigateProfiles={navigateToProfiles}
          onNavigateSaves={navigateToSaves}
        />
      </div>

      {view.level === "profiles" && (
        <ProfileGrid
          profiles={profiles}
          selectedProfile={null}
          loading={isLoading}
          onSelectProfile={selectProfile}
          onLoadProfiles={() => loadProfiles(true)}
        />
      )}

      {view.level === "saves" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing saves for{" "}
              <span className="font-medium text-foreground">{view.profile.display_name}</span>
            </p>
            <Button variant="destructive" size="sm" onClick={onProfileDelete} disabled={readOnly}>
              Delete Profile
            </Button>
          </div>
          <SaveList saves={saves} loading={isLoading} onSelectSave={selectSave} />
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
          onSaveEdits={onEdit}
          onUnlock={onUnlock}
          onMaxSkills={onMaxSkills}
          onRepair={onRepair}
          onRefuel={onRefuel}
          onRename={onRename}
          onClone={onClone}
          onDelete={onDelete}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget === "save" ? "Delete Save" : "Delete Profile"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteTarget}? A backup will be created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTarget === "save" ? confirmDeleteSave : confirmDeleteProfile}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick action confirmation */}
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction ? QUICK_ACTION_NAMES[pendingAction] : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction ? QUICK_ACTION_LABELS[pendingAction] : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
