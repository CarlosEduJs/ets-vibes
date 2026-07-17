import {
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  AlertDialog,
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
} from "ui";
import { useState } from "react";
import { ChevronRight, Clock, Zap, Archive, Save, CloudOff, Loader2 } from "lucide-react";
import type { SaveInfo } from "../../types";

interface SaveListProps {
  saves: SaveInfo[];
  loading?: boolean;
  onSelectSave: (gameSiiPath: string) => void;
}

type SaveType = "autosave" | "quicksave" | "backup" | "manual";

function getSaveType(name: string): SaveType {
  if (name.startsWith("autosave")) return "autosave";
  if (name.startsWith("quicksave")) return "quicksave";
  if (name.startsWith("backup")) return "backup";
  return "manual";
}

function formatSaveName(name: string): string {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const SAVE_TYPE_CONFIG: Record<
  SaveType,
  { label: string; icon: typeof Clock; variant: "default" | "secondary" }
> = {
  autosave: { label: "Auto", icon: Clock, variant: "secondary" },
  quicksave: { label: "Quick", icon: Zap, variant: "default" },
  backup: { label: "Backup", icon: Archive, variant: "secondary" },
  manual: { label: "Save", icon: Save, variant: "default" },
};

function SaveCard({ save, onSelect }: { save: SaveInfo; onSelect: (s: SaveInfo) => void }) {
  const type = getSaveType(save.save_name);
  const { label: typeLabel, icon: TypeIcon, variant: typeVariant } = SAVE_TYPE_CONFIG[type];
  const isSteamSynced = save.path.includes(".steam") || save.path.includes("Steam/userdata");

  return (
    <button
      type="button"
      onClick={() => onSelect(save)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(save);
        }
      }}
      aria-label={formatSaveName(save.save_name)}
      className="group rounded-xl bg-card/80 backdrop-blur-lg text-card-foreground shadow-sm border-none cursor-pointer w-full text-left"
    >
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{formatSaveName(save.save_name)}</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <CardDescription className="text-xs truncate max-w-48">{save.path}</CardDescription>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-80 break-all text-xs">
                {save.path}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant={typeVariant} className="border-none text-[10px] px-2 py-0">
            {typeLabel}
          </Badge>
          {isSteamSynced && (
            <Badge variant="destructive" className="border-none text-[10px] px-2 py-0">
              Steam
            </Badge>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </CardHeader>
    </button>
  );
}

export function SaveList({ saves, loading, onSelectSave }: SaveListProps) {
  const [pendingSave, setPendingSave] = useState<string | null>(null);

  function onClick(s: SaveInfo) {
    const isSteamSynced = s.path.includes(".steam") || s.path.includes("Steam/userdata");
    if (isSteamSynced) {
      setPendingSave(s.game_sii_path);
    } else {
      onSelectSave(s.game_sii_path);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading saves...</p>
      </div>
    );
  }

  if (saves.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <CloudOff className="h-10 w-10 text-muted-foreground/40" />
          <EmptyTitle>No saves found</EmptyTitle>
          <EmptyDescription>No saves found for this profile.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {saves.map((s) => (
          <SaveCard key={s.game_sii_path} save={s} onSelect={onClick} />
        ))}
      </div>

      <AlertDialog
        open={pendingSave !== null}
        onOpenChange={(open) => {
          if (!open) setPendingSave(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Steam Cloud synced save</AlertDialogTitle>
            <AlertDialogDescription>
              This save belongs to a Steam Cloud-synced profile. Synced saves may use the BSII
              binary format, which is not supported by the editor.
              <br />
              <br />
              If loading fails, open Euro Truck Simulator 2, load the profile, and save again to
              convert the format.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>I understand, let's close this.</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
