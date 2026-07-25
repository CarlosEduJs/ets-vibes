import { Button, Input, Kbd, Label } from "ui";
import { Euro, Trophy, Save } from "lucide-react";

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
      className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-xl p-5 shadow-2xs space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Account Balance & Experience
        </h3>
        {readOnly && (
          <p className="mt-1 text-xs text-amber-500/90 font-medium">
            Editing is disabled in Read Only mode.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label
            htmlFor="money"
            className="text-xs flex items-center gap-1.5 text-muted-foreground"
          >
            <Euro className="h-3.5 w-3.5 text-emerald-500" />
            Money (€)
          </Label>
          <Input
            id="money"
            type="number"
            value={moneyInput}
            onChange={(e) => onMoneyChange(e.target.value)}
            disabled={readOnly}
            placeholder="Enter money amount"
            className="h-9 text-xs bg-muted/20 border-border/40 focus-visible:ring-1 font-mono rounded-lg"
          />
        </div>

        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label htmlFor="xp" className="text-xs flex items-center gap-1.5 text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            Experience Points (XP)
          </Label>
          <Input
            id="xp"
            type="number"
            value={xpInput}
            onChange={(e) => onXpChange(e.target.value)}
            disabled={readOnly}
            placeholder="Enter XP amount"
            className="h-9 text-xs bg-muted/20 border-border/40 focus-visible:ring-1 font-mono rounded-lg"
          />
        </div>

        <Button
          type="submit"
          disabled={readOnly}
          size="sm"
          className="gap-2 h-9 px-4 rounded-lg font-medium shadow-xs"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save Values</span>
          <Kbd className="bg-primary-foreground/20 text-primary-foreground text-[10px] font-mono">
            Ctrl+S
          </Kbd>
        </Button>
      </div>
    </form>
  );
}
