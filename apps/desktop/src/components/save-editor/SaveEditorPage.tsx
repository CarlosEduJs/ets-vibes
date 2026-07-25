import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Empty,
  EmptyTitle,
  EmptyHeader,
  EmptyDescription,
  EmptyMedia,
  toast,
} from "ui";
import { Loader2, Save } from "lucide-react";
import type { SaveData, EditResult } from "../../types";
import { useSaveEditorStore } from "../../stores/save-editor";
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
  onReloadSaves?: () => void;
  onReloadProfiles?: () => void;
}

export function SaveEditorPage({
  readOnly,
  onStatusChange,
  onReloadSaves,
  onReloadProfiles,
}: SaveEditorPageProps) {
  const selectedProfile = useSaveEditorStore((s) => s.selectedProfile);
  const selectedSave = useSaveEditorStore((s) => s.selectedSave);
  const saveData = useSaveEditorStore((s) => s.saveData);
  const moneyInput = useSaveEditorStore((s) => s.moneyInput);
  const xpInput = useSaveEditorStore((s) => s.xpInput);

  const setSaveData = useSaveEditorStore((s) => s.setSaveData);
  const setMoneyInput = useSaveEditorStore((s) => s.setMoneyInput);
  const setXpInput = useSaveEditorStore((s) => s.setXpInput);
  const setSelectedSave = useSaveEditorStore((s) => s.setSelectedSave);

  const [deleteTarget, setDeleteTarget] = useState<"save" | "profile" | null>(null);
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  const reloadSave = useCallback(() => {
    setRefetchKey((k) => k + 1);
  }, []);

  // --- Load Save Data when selectedSave changes ---
  const saveSiiPath = selectedSave?.game_sii_path;

  useEffect(() => {
    if (!saveSiiPath) {
      setSaveData(null);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    onStatusChange("Loading save...");

    invoke<SaveData>("load_save", { gameSiiPath: saveSiiPath })
      .then((data) => {
        if (!active) return;
        setSaveData(data);
        setMoneyInput(data.money_account ?? "");
        setXpInput(data.experience_points ?? "");
        const msg = `Save loaded${data.was_compressed ? " (was compressed)" : " (plaintext)"}`;
        onStatusChange(msg);
      })
      .catch((e) => {
        if (!active) return;
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [saveSiiPath, refetchKey, onStatusChange, setSaveData, setMoneyInput, setXpInput]);

  // --- Edit Money/XP ---
  const onEdit = useCallback(async () => {
    if (!selectedSave) return;
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
        gameSiiPath: selectedSave.game_sii_path,
        money,
        xp,
      });
      toast.success(result.message);
      onStatusChange(result.message);
      reloadSave();
    } catch (e) {
      toast.error(String(e));
      onStatusChange(`Error: ${e}`);
    }
  }, [selectedSave, moneyInput, xpInput, onStatusChange, reloadSave]);

  // --- Quick Actions (with confirmation) ---
  const onUnlock = useCallback(() => {
    if (!selectedSave) return;
    setPendingAction("unlock");
  }, [selectedSave]);

  const onMaxSkills = useCallback(() => {
    if (!selectedSave) return;
    setPendingAction("maxSkills");
  }, [selectedSave]);

  const onRepair = useCallback(() => {
    if (!selectedSave) return;
    setPendingAction("repair");
  }, [selectedSave]);

  const onRefuel = useCallback(() => {
    if (!selectedSave) return;
    setPendingAction("refuel");
  }, [selectedSave]);

  const confirmAction = useCallback(async () => {
    if (!selectedSave || !pendingAction) return;
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
        gameSiiPath: selectedSave.game_sii_path,
      });
      toast.success(result.message);
      onStatusChange(result.message);
      reloadSave();
    } catch (e) {
      toast.error(String(e));
      onStatusChange(`Error: ${e}`);
    }
  }, [selectedSave, pendingAction, onStatusChange, reloadSave]);

  // --- Rename / Clone / Delete ---
  const onRename = useCallback(
    async (newName: string) => {
      if (!selectedSave) return;
      onStatusChange("Renaming save...");
      try {
        const result = await invoke<EditResult>("rename_save", {
          gameSiiPath: selectedSave.game_sii_path,
          newName,
        });
        toast.success(result.message);
        onStatusChange(result.message);
        onReloadSaves?.();
      } catch (e) {
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      }
    },
    [selectedSave, onStatusChange, onReloadSaves],
  );

  const onClone = useCallback(
    async (newName: string) => {
      if (!selectedSave) return;
      onStatusChange("Cloning save...");
      try {
        const result = await invoke<EditResult>("clone_save", {
          gameSiiPath: selectedSave.game_sii_path,
          newName,
        });
        toast.success(result.message);
        onStatusChange(result.message);
        onReloadSaves?.();
      } catch (e) {
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      }
    },
    [selectedSave, onStatusChange, onReloadSaves],
  );

  const onDelete = useCallback(async () => {
    if (!selectedSave) return;
    setDeleteTarget("save");
  }, [selectedSave]);

  const confirmDeleteSave = useCallback(async () => {
    if (!selectedSave) return;
    setDeleteTarget(null);
    onStatusChange("Deleting save...");
    try {
      const result = await invoke<EditResult>("delete_save", {
        gameSiiPath: selectedSave.game_sii_path,
      });
      toast.success(result.message);
      onStatusChange(result.message);
      setSelectedSave(null);
      onReloadSaves?.();
    } catch (e) {
      toast.error(String(e));
      onStatusChange(`Error: ${e}`);
    }
  }, [selectedSave, onStatusChange, setSelectedSave, onReloadSaves]);

  const confirmDeleteProfile = useCallback(async () => {
    if (!selectedProfile) return;
    setDeleteTarget(null);
    onStatusChange("Deleting profile...");
    try {
      const result = await invoke<EditResult>("delete_profile", {
        profilePath: selectedProfile.path,
      });
      toast.success(result.message);
      onStatusChange(result.message);
      onReloadProfiles?.();
    } catch (e) {
      toast.error(String(e));
      onStatusChange(`Error: ${e}`);
    }
  }, [selectedProfile, onStatusChange, onReloadProfiles]);

  // --- Keyboard navigation ---
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (deleteTarget || pendingAction) return;
      if ((e.key === "s" || e.key === "S") && (e.metaKey || e.ctrlKey)) {
        if (!readOnly && selectedSave && saveData) {
          e.preventDefault();
          onEdit();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleteTarget, pendingAction, readOnly, selectedSave, saveData, onEdit]);

  // --- Render ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading save data...</p>
      </div>
    );
  }

  if (!selectedSave || !saveData) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Empty className="py-12 border border-dashed border-border/60 rounded-2xl bg-card/30 max-w-md w-full">
          <EmptyHeader>
            <EmptyMedia>
              <Save className="h-10 w-10 text-muted-foreground/60" />
            </EmptyMedia>
            <EmptyTitle>No save file selected</EmptyTitle>
            <EmptyDescription>
              {selectedProfile
                ? `Select a save from "${selectedProfile.display_name}" in the left sidebar to view stats and make edits.`
                : "Select a profile and save from the sidebar on the left to start editing your Euro Truck Simulator 2 save file."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-1">
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
              Are you sure you want to delete this {deleteTarget}? A backup will be created
              automatically.
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
