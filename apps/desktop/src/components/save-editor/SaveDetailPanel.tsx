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
  return (
    <div>
      <OverviewStats saveData={saveData} />
      <TrucksGrid trucks={saveData.trucks} />
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
      <ManageSaveSection
        readOnly={readOnly}
        onRename={onRename}
        onClone={onClone}
        onDelete={onDelete}
      />
    </div>
  );
}
