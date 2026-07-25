import { Button } from "ui";
import { MapPin, Sparkles, Wrench, Fuel } from "lucide-react";

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
    <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-xl p-5 shadow-2xs space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          One-Click Quick Actions
        </h3>
        {readOnly && (
          <p className="mt-1 text-xs text-amber-500/90 font-medium">
            Quick actions are disabled in Read Only mode.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onUnlock}
          disabled={readOnly}
          className="gap-2 h-9 text-xs bg-muted/10 border-border/40 hover:bg-accent/40 rounded-lg justify-start"
        >
          <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Unlock Cities</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onMaxSkills}
          disabled={readOnly}
          className="gap-2 h-9 text-xs bg-muted/10 border-border/40 hover:bg-accent/40 rounded-lg justify-start"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          <span>Max Skills</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRepair}
          disabled={readOnly}
          className="gap-2 h-9 text-xs bg-muted/10 border-border/40 hover:bg-accent/40 rounded-lg justify-start"
        >
          <Wrench className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Repair All</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefuel}
          disabled={readOnly}
          className="gap-2 h-9 text-xs bg-muted/10 border-border/40 hover:bg-accent/40 rounded-lg justify-start"
        >
          <Fuel className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span>Refuel All</span>
        </Button>
      </div>
    </div>
  );
}
