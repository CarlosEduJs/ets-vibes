import { useState, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button, Input, toast } from "ui";
import { Folder, FolderSearch, RotateCcw, Check, X, HardDrive } from "lucide-react";

interface GamePathSelectorProps {
  customPath: string;
  onPathChange: (path: string) => void;
  compact?: boolean;
}

export function GamePathSelector({
  customPath,
  onPathChange,
  compact = false,
}: GamePathSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(customPath);

  const handleBrowse = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Game or Profiles Directory",
      });
      if (selected && typeof selected === "string") {
        onPathChange(selected);
        setInputVal(selected);
        setIsEditing(false);
      }
    } catch (e) {
      toast.error(`Failed to open directory picker: ${e}`);
    }
  }, [onPathChange]);

  const handleSaveInput = useCallback(() => {
    const trimmed = inputVal.trim();
    onPathChange(trimmed);
    setIsEditing(false);
  }, [inputVal, onPathChange]);

  const handleReset = useCallback(() => {
    onPathChange("");
    setInputVal("");
    setIsEditing(false);
  }, [onPathChange]);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/60 p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">Game Path:</span>
          <span className="max-w-xs truncate text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
            {customPath || "Default system paths"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBrowse} className="gap-1.5 text-xs">
            <FolderSearch className="h-3.5 w-3.5" />
            Browse
          </Button>
          {customPath && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Folder className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Game & Profiles Location</h4>
            <p className="text-xs text-muted-foreground">
              Select custom directory if your game or profiles are on a different drive (e.g. D:
              drive).
            </p>
          </div>
        </div>
        {customPath && !isEditing && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Custom Path Active
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="text"
            placeholder="e.g. D:\Games\Euro Truck Simulator 2 or /path/to/profiles"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="font-mono text-xs flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveInput();
              if (e.key === "Escape") setIsEditing(false);
            }}
          />
          <Button size="sm" onClick={handleSaveInput} className="gap-1">
            <Check className="h-3.5 w-3.5" />
            Apply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Cancel manual path editing"
            onClick={() => {
              setInputVal(customPath);
              setIsEditing(false);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-medium text-muted-foreground">Current:</span>
            <code className="truncate rounded bg-muted/60 px-2 py-1 font-mono text-xs text-foreground max-w-md">
              {customPath || "Default ETS2 directories"}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBrowse} className="gap-1.5">
              <FolderSearch className="h-4 w-4" />
              Select Directory
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs"
            >
              Manual Path
            </Button>
            {customPath && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
