import { Button } from "ui";

interface QuickActionsRowProps {
  readOnly: boolean;
  onUnlock: () => void;
  onMaxSkills: () => void;
  onRepair: () => void;
  onRefuel: () => void;
}

export function QuickActionsRow({
  readOnly,
  onUnlock,
  onMaxSkills,
  onRepair,
  onRefuel,
}: QuickActionsRowProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={onUnlock} disabled={readOnly}>
        Unlock Cities
      </Button>
      <Button variant="secondary" size="sm" onClick={onMaxSkills} disabled={readOnly}>
        Max Skills
      </Button>
      <Button variant="secondary" size="sm" onClick={onRepair} disabled={readOnly}>
        Repair All
      </Button>
      <Button variant="secondary" size="sm" onClick={onRefuel} disabled={readOnly}>
        Refuel All
      </Button>
    </div>
  );
}
