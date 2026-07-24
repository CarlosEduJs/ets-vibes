import { useState, useCallback } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "ui";
import { BarChart3, PenSquare, Settings } from "lucide-react";
import type { SaveData } from "../../types";
import { OverviewStats } from "./OverviewStats";
import { TrucksGrid } from "./TrucksGrid";
import { EditValuesForm } from "./EditValuesForm";
import { QuickActionsRow } from "./QuickActionsRow";
import { ManageSaveSection } from "./ManageSaveSection";

interface SaveDetailPanelProps {
  saveData: SaveData;
  moneyInput: string;
  xpInput: string;
  readOnly: boolean;
  onMoneyChange: (value: string) => void;
  onXpChange: (value: string) => void;
  onSaveEdits: () => void;
  onUnlock: () => void;
  onMaxSkills: () => void;
  onRepair: () => void;
  onRefuel: () => void;
  onRename: (newName: string) => void;
  onClone: (newName: string) => void;
  onDelete: () => void;
}

export function SaveDetailPanel({
  saveData,
  moneyInput,
  xpInput,
  readOnly,
  onMoneyChange,
  onXpChange,
  onSaveEdits,
  onUnlock,
  onMaxSkills,
  onRepair,
  onRefuel,
  onRename,
  onClone,
  onDelete,
}: SaveDetailPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const isDirty =
    moneyInput !== (saveData.money_account ?? "") || xpInput !== (saveData.experience_points ?? "");

  const handleTabChange = useCallback(
    (value: string) => {
      if (value !== "edit" && activeTab === "edit" && isDirty) {
        setPendingTab(value);
      } else {
        setActiveTab(value);
      }
    },
    [activeTab, isDirty],
  );

  const confirmTabChange = useCallback(() => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  }, [pendingTab]);

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1 gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 gap-2">
            <PenSquare className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex-1 gap-2">
            <Settings className="h-4 w-4" />
            Manage
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <OverviewStats saveData={saveData} />
          <TrucksGrid trucks={saveData.trucks} />
        </TabsContent>
        <TabsContent value="edit" className="space-y-6">
          <EditValuesForm
            moneyInput={moneyInput}
            xpInput={xpInput}
            onMoneyChange={onMoneyChange}
            onXpChange={onXpChange}
            onSave={onSaveEdits}
            readOnly={readOnly}
          />
          <QuickActionsRow
            readOnly={readOnly}
            onUnlock={onUnlock}
            onMaxSkills={onMaxSkills}
            onRepair={onRepair}
            onRefuel={onRefuel}
          />
        </TabsContent>
        <TabsContent value="manage" className="space-y-6">
          <ManageSaveSection
            readOnly={readOnly}
            onRename={onRename}
            onClone={onClone}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={pendingTab !== null} onOpenChange={(open) => !open && setPendingTab(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in the Edit tab. Do you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on Edit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTabChange}>Discard changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
