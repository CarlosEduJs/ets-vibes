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
    <div className="rounded-lg border border-border p-4">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Quick Actions</h3>
      {readOnly && (
        <p className="mb-3 text-xs text-muted-foreground">
          Quick actions are disabled. Toggle "Read Only" in the header to enable.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
