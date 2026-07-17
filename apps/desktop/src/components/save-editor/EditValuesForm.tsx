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
    <form
      className="rounded-lg border border-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Edit Values</h3>
      {readOnly && (
        <p className="mb-3 text-xs text-muted-foreground">
          Editing is disabled. Toggle "Read Only" in the header to enable.
        </p>
      )}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="money">Money</Label>
          <Input
            id="money"
            type="number"
            value={moneyInput}
            onChange={(e) => onMoneyChange(e.target.value)}
            disabled={readOnly}
            className="w-48"
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
            className="w-48"
          />
        </div>
        <Button type="submit" disabled={readOnly} size="sm">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
