import { Button, Input, Label } from "ui";

interface EditValuesFormProps {
  moneyInput: string;
  xpInput: string;
  onMoneyChange: (value: string) => void;
  onXpChange: (value: string) => void;
  onSave: () => void;
  readOnly: boolean;
}

export function EditValuesForm({
  moneyInput,
  xpInput,
  onMoneyChange,
  onXpChange,
  onSave,
  readOnly,
}: EditValuesFormProps) {
  return (
    <div className="mb-6 rounded-lg border border-border p-4">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Edit Values</h3>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="money">Money</Label>
          <Input
            id="money"
            type="number"
            value={moneyInput}
            onChange={(e) => onMoneyChange(e.target.value)}
            disabled={readOnly}
            className="w-32"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="xp">XP</Label>
          <Input
            id="xp"
            type="number"
            value={xpInput}
            onChange={(e) => onXpChange(e.target.value)}
            disabled={readOnly}
            className="w-32"
          />
        </div>
        <Button onClick={onSave} disabled={readOnly} size="sm">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
