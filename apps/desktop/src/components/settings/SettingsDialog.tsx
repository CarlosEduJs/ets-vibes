import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Separator,
  Switch,
  FieldLabel,
  Button,
  useTheme,
} from "ui";
import { Sun, Moon, Monitor, ExternalLink, Bug, Folder, Settings, Shield } from "lucide-react";
import { useSettingsStore } from "../../stores/settings";
import { GamePathSelector } from "../save-editor/GamePathSelector";

interface AppVersionInfo {
  app_version: string;
  game_version: string | null;
  tested_game_version: string;
  compatibility_warning: string | null;
}

interface SettingsDialogProps {
  appInfo: AppVersionInfo | null;
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsDialog({ appInfo }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const {
    readOnly,
    setReadOnly,
    customGamePath,
    setCustomGamePath,
    isSettingsOpen,
    setIsSettingsOpen,
  } = useSettingsStore();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Settings className="h-5 w-5 text-primary" />
            Settings & Preferences
          </DialogTitle>
          <DialogDescription>
            Manage application theme, game directory, safety settings, and view version details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Appearance */}
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sun className="h-4 w-4 text-muted-foreground" />
              Appearance
            </h4>
            <div className="rounded-lg border bg-card p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Color Theme</span>
              <div className="flex gap-1.5">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={theme === value ? "default" : "outline"}
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setTheme(value)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          {/* Safety & Behavior */}
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Editor Safety
            </h4>
            <div className="rounded-lg border bg-card p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel
                  htmlFor="settings-readonly-switch"
                  className="text-sm font-medium cursor-pointer"
                >
                  Read-only by default
                </FieldLabel>
                <p className="text-xs text-muted-foreground">
                  Prevents accidental edits on saves and config files unless toggled off
                </p>
              </div>
              <Switch
                id="settings-readonly-switch"
                checked={readOnly}
                onCheckedChange={setReadOnly}
              />
            </div>
          </section>

          <Separator />

          {/* Game Directory */}
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Folder className="h-4 w-4 text-muted-foreground" />
              Game Directory
            </h4>
            <GamePathSelector customPath={customGamePath} onPathChange={setCustomGamePath} />
          </section>

          <Separator />

          {/* About */}
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              About ETS Vibes
            </h4>
            <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
              {appInfo ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App version</span>
                    <span className="font-mono text-xs">v{appInfo.app_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tested game version</span>
                    <span className="font-mono text-xs">{appInfo.tested_game_version}</span>
                  </div>
                  {appInfo.game_version && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Detected game version</span>
                      <span className="font-mono text-xs">{appInfo.game_version}</span>
                    </div>
                  )}
                  {appInfo.compatibility_warning && (
                    <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                      {appInfo.compatibility_warning}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-xs">Loading version information...</p>
              )}
              <Separator />
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                  <a
                    href="https://github.com/carlosedujs/ets-vibes"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    GitHub Repository
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                  <a
                    href="https://github.com/carlosedujs/ets-vibes/issues"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Bug className="h-3.5 w-3.5" />
                    Report an Issue
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
