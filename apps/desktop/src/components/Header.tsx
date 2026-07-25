import { Button, Kbd, Badge } from "ui";
import { Search, Save, SlidersHorizontal, AlertTriangle, ChevronRight } from "lucide-react";
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
    <header className="h-14 px-6 flex items-center justify-between bg-background/40 backdrop-blur-xl shrink-0 select-none">
      {/* Left: Active Context Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 font-medium">
        {activeWorkspace === "saves" ? (
          <>
            <Save className="h-4 w-4 text-amber-500 shrink-0" />
            {selectedProfile ? (
              <span className="font-semibold text-foreground truncate">
                {selectedProfile.display_name}
              </span>
            ) : (
              <span>No profile selected</span>
            )}
            {selectedSave && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                <span className="font-semibold text-primary truncate bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
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
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                <span className="font-mono text-xs text-sky-400 font-medium bg-sky-400/10 px-2 py-0.5 rounded-md border border-sky-400/20">
                  {configFilename}
                </span>
              </>
            )}
          </>
        )}
      </div>

      {/* Right: Actions & Command Palette Trigger */}
      <div className="flex items-center gap-2.5">
        {appInfo?.compatibility_warning && (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 text-[11px] font-normal rounded-lg"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Game Version Warning
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCommandPalette}
          className="gap-2 text-xs text-muted-foreground hover:text-foreground bg-muted/20 border-border/40 hover:bg-accent/40 rounded-lg h-8 shadow-xs"
        >
          <Search className="h-3.5 w-3.5 opacity-70" />
          <span className="font-normal">Search or type a command...</span>
          <Kbd className="text-[10px] bg-background/80 border border-border/40 font-mono">
            Ctrl+K
          </Kbd>
        </Button>
      </div>
    </header>
  );
}
