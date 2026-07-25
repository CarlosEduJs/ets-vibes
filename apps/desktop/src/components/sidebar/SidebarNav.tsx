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
} from "ui";
import {
  Folder,
  FolderOpen,
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
} from "lucide-react";
import type { ProfileInfo, SaveInfo } from "../../types";
import { useSettingsStore } from "../../stores/settings";
import { useSaveEditorStore } from "../../stores/save-editor";

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
  const { readOnly, setReadOnly, setIsSettingsOpen } = useSettingsStore();
  const { activeWorkspace, setActiveWorkspace } = useSaveEditorStore();
  const [filter, setFilter] = useState("");
  const [expandedProfiles, setExpandedProfiles] = useState<Record<string, boolean>>({});

  function toggleProfileExpanded(path: string) {
    setExpandedProfiles((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }

  const q = filter.toLowerCase().trim();

  // Filter profiles & configs
  const filteredProfiles = profiles.filter(
    (p) => p.display_name.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
  );

  const filteredConfigs = configPaths.filter((c) => c.toLowerCase().includes(q));

  return (
    <TooltipProvider>
      <aside className="w-72 shrink-0 border-r border-border/60 bg-sidebar/50 backdrop-blur-xl flex flex-col h-full select-none">
        <div className="h-14 px-4 border-b border-border/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={logoSrc} alt="ETS Vibes" className="h-8 w-auto" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
                ETS Vibes
              </h1>
              {appInfo && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  v{appInfo.app_version}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onRefreshProfiles}
            disabled={loadingProfiles}
            title="Reload Profiles"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingProfiles ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="p-3 border-b border-border/40">
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted/40 rounded-lg border border-border/30">
            <button
              type="button"
              onClick={() => setActiveWorkspace("saves")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                activeWorkspace === "saves"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              <Save className="h-3.5 w-3.5" />
              Saves
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkspace("config")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                activeWorkspace === "config"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Config
            </button>
          </div>
        </div>

        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={activeWorkspace === "saves" ? "Filter profiles..." : "Filter configs..."}
              className="pl-8 h-8 text-xs bg-muted/30 border-border/50"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-2">
          {activeWorkspace === "saves" ? (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center justify-between">
                <span>Profiles ({filteredProfiles.length})</span>
              </div>

              {filteredProfiles.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  {loadingProfiles ? "Loading profiles..." : "No profiles found"}
                </div>
              ) : (
                filteredProfiles.map((profile) => {
                  const isProfileSelected = selectedProfile?.path === profile.path;
                  const isExpanded = expandedProfiles[profile.path] ?? isProfileSelected;

                  return (
                    <div key={profile.path} className="space-y-0.5">
                      <div
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors text-xs ${
                          isProfileSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-accent/60 text-foreground"
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
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {isExpanded ? (
                            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          ) : (
                            <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500/80" />
                          )}
                          <span className="truncate">{profile.display_name}</span>
                        </div>
                        {profile.active_mods.length > 0 && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                            {profile.active_mods.length} mods
                          </Badge>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="pl-6 space-y-0.5 border-l border-border/40 ml-3 py-1">
                          {isProfileSelected && loadingSaves ? (
                            <div className="py-1 px-2 text-[11px] text-muted-foreground">
                              Loading saves...
                            </div>
                          ) : isProfileSelected && saves.length === 0 ? (
                            <div className="py-1 px-2 text-[11px] text-muted-foreground">
                              No saves found
                            </div>
                          ) : (
                            isProfileSelected &&
                            saves.map((save) => {
                              const isSaveSelected = selectedSave?.path === save.path;
                              return (
                                <button
                                  key={save.path}
                                  type="button"
                                  onClick={() => onSelectSave(save)}
                                  className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-left transition-colors ${
                                    isSaveSelected
                                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                      : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <Save className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{save.save_name}</span>
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
            /* Config Files View */
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Config Files ({filteredConfigs.length})
              </div>
              {filteredConfigs.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No config files found
                </div>
              ) : (
                filteredConfigs.map((path) => {
                  const isSelected = selectedConfigPath === path;
                  const filename = path.split("/").pop() || path;
                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => onSelectConfig(path)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "hover:bg-accent/60 text-foreground"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                      <span className="truncate">{filename}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border/50 bg-background/40 space-y-2">
          {/* Read Only Toggle Badge */}
          <button
            type="button"
            onClick={() => setReadOnly(!readOnly)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-all ${
              readOnly
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
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
            <span className="text-[10px] font-mono opacity-80">
              {readOnly ? "Safe" : "Edit Mode"}
            </span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pt-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5 h-8"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Settings & Preferences</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={onOpenShortcuts}
                >
                  <Keyboard className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard Shortcuts</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
