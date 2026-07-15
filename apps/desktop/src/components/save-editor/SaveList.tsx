import type { SaveInfo } from "../../types";

interface SaveListProps {
  saves: SaveInfo[];
  selectedSave: string | null;
  onSelectSave: (gameSiiPath: string) => void;
}

export function SaveList({ saves, selectedSave, onSelectSave }: SaveListProps) {
  if (saves.length === 0) {
    return <p className="text-sm text-muted-foreground">No saves found.</p>;
  }

  return (
    <div className="space-y-1">
      {saves.map((s) => (
        <button
          key={s.game_sii_path}
          onClick={() => onSelectSave(s.game_sii_path)}
          className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
            selectedSave === s.game_sii_path
              ? "border-primary bg-accent"
              : "border-border bg-card hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-card-foreground">{s.save_name}</span>
            <span className="text-xs text-muted-foreground">&rsaquo;</span>
          </div>
        </button>
      ))}
    </div>
  );
}
