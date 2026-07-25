import { Button, Kbd, Badge } from "ui";
import { Search, Save, SlidersHorizontal, AlertTriangle } from "lucide-react";
import type { ProfileInfo, SaveInfo } from "../types";

interface AppVersionInfo {
  app_version: string;
  game_version: string | null;
  tested_game_version: string;
  compatibility_warning: string | null;
}

interface HeaderProps {
  activeWorkspace: "saves" | "config";
  selectedProfile: ProfileInfo | null;
  selectedSave: SaveInfo | null;
  selectedConfigPath: string | null;
  appInfo: AppVersionInfo | null;
  onOpenCommandPalette: () => void;
}

export function Header({
  activeWorkspace,
  selectedProfile,
  selectedSave,
  selectedConfigPath,
  appInfo,
  onOpenCommandPalette,
}: HeaderProps) {
  const configFilename = selectedConfigPath ? selectedConfigPath.split("/").pop() : null;

  return (
    <header className="h-14 px-6 border-b border-border/50 flex items-center justify-between bg-background/60 backdrop-blur-md shrink-0">
      {/* Left: Active Context Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        {activeWorkspace === "saves" ? (
          <>
            <Save className="h-4 w-4 text-primary shrink-0" />
            {selectedProfile ? (
              <span className="font-semibold text-foreground truncate">
                {selectedProfile.display_name}
              </span>
            ) : (
              <span>No profile selected</span>
            )}
            {selectedSave && (
              <>
                <span className="text-muted-foreground/60">/</span>
                <span className="font-medium text-emerald-500 truncate">
                  {selectedSave.save_name}
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <SlidersHorizontal className="h-4 w-4 text-sky-400 shrink-0" />
            <span className="font-semibold text-foreground">Game Config</span>
            {configFilename && (
              <>
                <span className="text-muted-foreground/60">/</span>
                <span className="font-mono text-xs text-sky-400 font-medium">{configFilename}</span>
              </>
            )}
          </>
        )}
      </div>

      {/* Right: Actions & Command Palette Trigger */}
      <div className="flex items-center gap-3">
        {appInfo?.compatibility_warning && (
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 text-xs font-normal"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Game Version Warning
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCommandPalette}
          className="gap-2 text-xs text-muted-foreground hover:text-foreground bg-muted/30 border-border/60"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Quick Search...</span>
          <Kbd className="text-[10px] bg-background/80">Ctrl+K</Kbd>
        </Button>
      </div>
    </header>
  );
}
