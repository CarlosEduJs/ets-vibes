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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-2 space-y-5">
        <TabsList className="w-full bg-muted/20 border border-border/30 rounded-xl p-1 h-10 gap-1">
          <TabsTrigger
            value="overview"
            className="flex-1 gap-2 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Overview & Fleet
          </TabsTrigger>
          <TabsTrigger
            value="edit"
            className="flex-1 gap-2 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
          >
            <PenSquare className="h-3.5 w-3.5" />
            Edit Money & XP
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="flex-1 gap-2 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
          >
            <Settings className="h-3.5 w-3.5" />
            Manage Save File
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="overview"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
        >
          <OverviewStats saveData={saveData} />
          <TrucksGrid trucks={saveData.trucks} />
        </TabsContent>
        <TabsContent
          value="edit"
          className="space-y-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
        >
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
        <TabsContent
          value="manage"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
        >
          <ManageSaveSection
            readOnly={readOnly}
            onRename={onRename}
            onClone={onClone}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={pendingTab !== null} onOpenChange={(open) => !open && setPendingTab(null)}>
        <AlertDialogContent className="rounded-xl border border-border/40">
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in the Edit tab. Do you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Stay on Edit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTabChange} className="rounded-lg">
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
