import { useState, useEffect } from "react";
import { Dialog, DialogContent, Input, Kbd } from "ui";
import { Search, Save, FileText, Settings, Keyboard, Shield } from "lucide-react";
import { useSaveEditorStore } from "../stores/save-editor";
import { useSettingsStore } from "../stores/settings";
import type { ProfileInfo, SaveInfo } from "../types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configPaths: string[];
  onSelectSave: (profile: ProfileInfo, save?: SaveInfo) => void;
  onSelectConfig: (path: string) => void;
  onOpenShortcuts: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  configPaths,
  onSelectSave,
  onSelectConfig,
  onOpenShortcuts,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const { profiles, saves, selectedProfile } = useSaveEditorStore();
  const { readOnly, setReadOnly, setIsSettingsOpen } = useSettingsStore();

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  // Global listener for Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const q = query.toLowerCase().trim();

  // Filter profiles & current saves
  const filteredProfiles = profiles.filter(
    (p) => p.display_name.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
  );

  const filteredSaves = saves.filter((s) => s.save_name.toLowerCase().includes(q));

  const filteredConfigs = configPaths.filter((c) => c.toLowerCase().includes(q));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-xl border bg-popover/95 backdrop-blur-md">
        <div className="flex items-center px-4 border-b border-border/60">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search saves, configs..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-12 text-sm shadow-none"
          />
          <Kbd className="text-[10px] bg-muted/60">ESC</Kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3 text-xs">
          {(!q || "settings".includes(q) || "read-only".includes(q) || "shortcuts".includes(q)) && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {(!q || "settings".includes(q)) && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary" />
                      <span>Open Settings</span>
                    </div>
                  </button>
                )}
                {(!q || "read-only".includes(q)) && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      setReadOnly(!readOnly);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Toggle Read-Only Mode (Currently: {readOnly ? "On" : "Off"})</span>
                    </div>
                  </button>
                )}
                {(!q || "shortcuts".includes(q)) && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onOpenShortcuts();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Keyboard className="h-4 w-4 text-primary" />
                      <span>Keyboard Shortcuts</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredSaves.length > 0 && selectedProfile && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Saves in {selectedProfile.display_name}
              </div>
              <div className="space-y-0.5">
                {filteredSaves.map((save) => (
                  <button
                    key={save.path}
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onSelectSave(selectedProfile, save);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium text-foreground">{save.save_name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
                      {save.save_name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredProfiles.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Profiles ({filteredProfiles.length})
              </div>
              <div className="space-y-0.5">
                {filteredProfiles.map((prof) => (
                  <button
                    key={prof.path}
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onSelectSave(prof, saves[0]);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-foreground">{prof.display_name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
                      {prof.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredConfigs.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Config Files
              </div>
              <div className="space-y-0.5">
                {filteredConfigs.map((cfg) => {
                  const filename = cfg.split("/").pop() || cfg;
                  return (
                    <button
                      key={cfg}
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        onSelectConfig(cfg);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-foreground">{filename}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
                        {cfg}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredProfiles.length === 0 &&
            filteredSaves.length === 0 &&
            filteredConfigs.length === 0 && (
              <div className="py-6 text-center text-muted-foreground">
                No matching results found
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
