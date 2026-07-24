import { Card, CardTitle, CardContent, Separator, Switch, FieldLabel, Button, useTheme } from "ui";
import { Sun, Moon, Monitor, ExternalLink, Bug, Folder } from "lucide-react";
import { useSettingsStore } from "../../stores/settings";
import { GamePathSelector } from "../save-editor/GamePathSelector";

interface AppVersionInfo {
  app_version: string;
  game_version: string | null;
  tested_game_version: string;
  compatibility_warning: string | null;
}

interface SettingsPageProps {
  appInfo: AppVersionInfo | null;
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsPage({ appInfo }: SettingsPageProps) {
  const { theme, setTheme } = useTheme();
  const { readOnly, setReadOnly, customGamePath, setCustomGamePath } = useSettingsStore();

  return (
    <div className="mx-auto max-w-xl space-y-8 py-4 overflow-y-auto h-full">
      {/* Appearance */}
      <section>
        <CardTitle className="mb-3 flex items-center gap-2 text-base">
          <Sun className="h-4 w-4" />
          Appearance
        </CardTitle>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <FieldLabel>Theme</FieldLabel>
              <div className="flex gap-1.5">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={theme === value ? "default" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setTheme(value)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <CardTitle className="mb-3 flex items-center gap-2 text-base">
          <Monitor className="h-4 w-4" />
          Editor
        </CardTitle>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>Read-only by default</FieldLabel>
                <p className="text-xs text-muted-foreground">
                  Prevents accidental edits on save and config files
                </p>
              </div>
              <Switch checked={readOnly} onCheckedChange={setReadOnly} />
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <CardTitle className="mb-3 flex items-center gap-2 text-base">
          <Folder className="h-4 w-4" />
          Game Directory
        </CardTitle>
        <GamePathSelector customPath={customGamePath} onPathChange={setCustomGamePath} />
      </section>

      <Separator />

      <section>
        <CardTitle className="mb-3 flex items-center gap-2 text-base">
          <ExternalLink className="h-4 w-4" />
          About
        </CardTitle>
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            {appInfo ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">App version</span>
                  <span>v{appInfo.app_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tested game version</span>
                  <span>{appInfo.tested_game_version}</span>
                </div>
                {appInfo.game_version && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Detected game version</span>
                    <span>{appInfo.game_version}</span>
                  </div>
                )}
                {appInfo.compatibility_warning && (
                  <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                    {appInfo.compatibility_warning}
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href="https://github.com/carlosedujs/ets-vibes" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a
                  href="https://github.com/carlosedujs/ets-vibes/issues"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Bug className="h-3.5 w-3.5" />
                  Report Bug
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
