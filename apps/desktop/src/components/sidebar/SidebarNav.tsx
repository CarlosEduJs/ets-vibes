import { useState } from "react";
import {
  Button,
  Badge,
  Input,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
  Kbd,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "ui";
import {
  Save,
  FileText,
  Settings,
  Keyboard,
  Shield,
  ShieldAlert,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Circle,
  User,
  UserCheck,
  CloudOff,
} from "lucide-react";
import type { ProfileInfo, SaveInfo } from "../../types";
import { useSettingsStore } from "../../stores/settings";
import { useSaveEditorStore } from "../../stores/save-editor";
import { isSteamSynced } from "../../utils/steam";
import { basename } from "../../utils/path";

const logoSrc = "/logo.svg";

interface AppVersionInfo {
  app_version: string;
  game_version: string | null;
  tested_game_version: string;
  compatibility_warning: string | null;
}

interface SidebarNavProps {
  appInfo: AppVersionInfo | null;
  profiles: ProfileInfo[];
  saves: SaveInfo[];
  selectedProfile: ProfileInfo | null;
  selectedSave: SaveInfo | null;
  configPaths: string[];
  selectedConfigPath: string | null;
  loadingProfiles?: boolean;
  loadingSaves?: boolean;
  onSelectProfile: (profile: ProfileInfo) => void;
  onSelectSave: (save: SaveInfo) => void;
  onSelectConfig: (path: string) => void;
  onRefreshProfiles: () => void;
  onOpenShortcuts: () => void;
}

export function SidebarNav({
  appInfo,
  profiles,
  saves,
  selectedProfile,
  selectedSave,
  configPaths,
  selectedConfigPath,
  loadingProfiles,
  loadingSaves,
  onSelectProfile,
  onSelectSave,
  onSelectConfig,
  onRefreshProfiles,
  onOpenShortcuts,
}: SidebarNavProps) {
  const readOnly = useSettingsStore((s) => s.readOnly);
  const setReadOnly = useSettingsStore((s) => s.setReadOnly);
  const setIsSettingsOpen = useSettingsStore((s) => s.setIsSettingsOpen);
  const customGamePath = useSettingsStore((s) => s.customGamePath);
  const activeWorkspace = useSaveEditorStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useSaveEditorStore((s) => s.setActiveWorkspace);
  const [filter, setFilter] = useState("");
  const [expandedProfiles, setExpandedProfiles] = useState<Record<string, boolean>>({});
  const [pendingSteamSave, setPendingSteamSave] = useState<SaveInfo | null>(null);

  function toggleProfileExpanded(path: string) {
    setExpandedProfiles((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }

  function onSaveClick(save: SaveInfo, isProfileSteam: boolean) {
    const isSaveSteam = isSteamSynced(save.path) || isProfileSteam;
    if (isSaveSteam) {
      setPendingSteamSave(save);
    } else {
      onSelectSave(save);
    }
  }

  const q = filter.toLowerCase().trim();

  // Filter profiles & configs
  const filteredProfiles = profiles.filter(
    (p) => p.display_name.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
  );

  const filteredConfigs = configPaths.filter((c) => c.toLowerCase().includes(q));

  return (
    <TooltipProvider>
      <aside className="w-72 shrink-0 bg-accent/20 backdrop-blur-2xl border-r flex flex-col h-full select-none text-sidebar-foreground">
        <div className="h-14 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={logoSrc} alt="ETS Vibes" className="h-7 w-auto drop-shadow-sm" />
            <div>
              <h1 className="text-xs font-bold tracking-tight text-foreground leading-none flex items-center gap-1.5">
                ETS Vibes
                {appInfo && (
                  <span className="text-[10px] text-muted-foreground font-mono font-normal">
                    v{appInfo.app_version}
                  </span>
                )}
              </h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
            onClick={onRefreshProfiles}
            disabled={loadingProfiles}
            title="Reload Profiles"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingProfiles ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="p-3 border-b border-border/30">
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted/30 rounded-xl border border-border/30">
            <button
              type="button"
              onClick={() => setActiveWorkspace("saves")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                activeWorkspace === "saves"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/30"
              }`}
            >
              <Save className="h-3.5 w-3.5 text-amber-500/90" />
              Saves
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkspace("config")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                activeWorkspace === "config"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/30"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
              Config
            </button>
          </div>
        </div>

        <div className="px-3 pt-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={activeWorkspace === "saves" ? "Filter profiles..." : "Filter configs..."}
              className="pl-8 pr-12 h-8 text-xs bg-muted/20 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg"
            />
            <Kbd className="absolute right-2 text-[9px] text-muted-foreground/60 bg-muted/40 pointer-events-none">
              Ctrl+F
            </Kbd>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-2">
          {activeWorkspace === "saves" ? (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1 flex items-center justify-between">
                <span>Profiles ({filteredProfiles.length})</span>
              </div>

              {filteredProfiles.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground/70">
                  {loadingProfiles ? "Loading profiles..." : "No profiles found"}
                </div>
              ) : (
                filteredProfiles.map((profile) => {
                  const isProfileSelected = selectedProfile?.path === profile.path;
                  const isExpanded = expandedProfiles[profile.path] ?? isProfileSelected;
                  const isProfileSteam = isSteamSynced(profile.path);

                  return (
                    <div key={profile.path} className="space-y-0.5">
                      <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectProfile(profile);
                            toggleProfileExpanded(profile.path);
                          }
                        }}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-xs ${
                          isProfileSelected
                            ? "bg-accent/80 text-foreground font-medium shadow-xs"
                            : "hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => {
                          onSelectProfile(profile);
                          toggleProfileExpanded(profile.path);
                        }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProfileExpanded(profile.path);
                            }}
                            className="text-muted-foreground/70 hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {isExpanded ? (
                            <UserCheck className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          ) : (
                            <User className="h-3.5 w-3.5 shrink-0 text-amber-500/80" />
                          )}
                          <span className="truncate">{profile.display_name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isProfileSteam && (
                            <Badge
                              variant="destructive"
                              className="text-[9px] px-1 py-0 h-4 border-none font-mono"
                            >
                              Steam
                            </Badge>
                          )}
                          {profile.active_mods.length > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4 border-border/40 text-muted-foreground/80 font-mono"
                            >
                              {profile.active_mods.length} mods
                            </Badge>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="pl-6 space-y-0.5 border-l border-border/30 ml-3.5 py-1">
                          {isProfileSelected && loadingSaves ? (
                            <div className="py-1 px-2 text-[11px] text-muted-foreground/70">
                              Loading saves...
                            </div>
                          ) : isProfileSelected && saves.length === 0 ? (
                            <div className="py-1 px-2 text-[11px] text-muted-foreground/70">
                              No saves found
                            </div>
                          ) : (
                            isProfileSelected &&
                            saves.map((save) => {
                              const isSaveSelected = selectedSave?.path === save.path;
                              const isSaveSteam = isSteamSynced(save.path) || isProfileSteam;

                              return (
                                <button
                                  key={save.path}
                                  type="button"
                                  onClick={() => onSaveClick(save, isProfileSteam)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-all ${
                                    isSaveSelected
                                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                      : "hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Save className="h-3 w-3 shrink-0 opacity-80" />
                                    <span className="truncate">{save.save_name}</span>
                                  </div>
                                  {isSaveSteam && (
                                    <Badge
                                      variant="destructive"
                                      className="text-[8px] px-1 py-0 h-3.5 border-none font-mono shrink-0"
                                    >
                                      Steam
                                    </Badge>
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
                Config Files ({filteredConfigs.length})
              </div>
              {filteredConfigs.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground/70">
                  No config files found
                </div>
              ) : (
                filteredConfigs.map((path) => {
                  const isSelected = selectedConfigPath === path;
                  const filename = basename(path);
                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => onSelectConfig(path)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0 " />
                      <span className="truncate font-mono text-[11px]">{filename}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border/40 bg-card/20 space-y-2.5">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/20 border border-border/30 text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 shrink-0" />
              <span className="truncate text-muted-foreground font-medium">
                {customGamePath ? "Custom Path" : "Default Game Path"}
              </span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground/60 shrink-0">ETS2</span>
          </div>

          <button
            type="button"
            onClick={() => setReadOnly(!readOnly)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
              readOnly
                ? "bg-amber-500/10 text-amber-500 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {readOnly ? (
                <ShieldAlert className="h-3.5 w-3.5" />
              ) : (
                <Shield className="h-3.5 w-3.5" />
              )}
              <span className="font-medium">{readOnly ? "Read Only: ON" : "Read Only: OFF"}</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">{readOnly ? "Safe" : "Edit"}</span>
          </button>

          <div className="flex items-center gap-1.5 pt-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5 h-8 rounded-lg border-border/40 bg-muted/10 hover:bg-accent/50"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Settings (Ctrl+,)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg border-border/40 bg-muted/10 hover:bg-accent/50"
                  onClick={onOpenShortcuts}
                >
                  <Keyboard className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard Shortcuts (?)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <AlertDialog
          open={pendingSteamSave !== null}
          onOpenChange={(open) => {
            if (!open) setPendingSteamSave(null);
          }}
        >
          <AlertDialogContent className="rounded-xl border border-border/40 max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-500 text-sm font-semibold">
                <CloudOff className="h-5 w-5 shrink-0" />
                Steam Cloud Synced Save
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="text-xs text-muted-foreground space-y-2 pt-2">
                  <p>
                    This save (<strong>{pendingSteamSave?.save_name}</strong>) belongs to a Steam
                    Cloud-synced profile.
                  </p>
                  <p>
                    Synced saves frequently use the binary <strong>BSII</strong> format which cannot
                    be parsed or edited by ETS Vibes.
                  </p>
                  <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg text-[11px] space-y-1">
                    <p className="font-semibold text-amber-500">To edit this profile:</p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px]">
                      <li>Open Euro Truck Simulator 2</li>
                      <li>
                        Edit profile & disable <strong>Steam Cloud</strong>
                      </li>
                      <li>
                        In console, set{" "}
                        <code className="font-mono bg-background/60 px-1 py-0.5 rounded">
                          g_save_format 2
                        </code>
                      </li>
                      <li>Save game in-game & reload profiles in ETS Vibes</li>
                    </ol>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg text-xs">I Understand</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </aside>
    </TooltipProvider>
  );
}
