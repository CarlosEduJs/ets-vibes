import { FieldLabel, Switch } from "ui";
import { TabBar, type TabId } from "./TabBar";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";

const logoSrc = "/logo.svg";

interface AppVersionInfo {
  app_version: string;
  game_version: string | null;
  tested_game_version: string;
  compatibility_warning: string | null;
}

interface HeaderProps {
  readOnly: boolean;
  onToggleReadOnly: () => void;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  appInfo: AppVersionInfo | null;
}

export function Header({
  readOnly,
  onToggleReadOnly,
  activeTab,
  onTabChange,
  appInfo,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3">
      <div className="flex items-baseline gap-2">
        <img src={logoSrc} alt="ETS Vibes" className="h-9 w-auto" />
        {appInfo && <span className="text-xs text-muted-foreground">v{appInfo.app_version}</span>}
      </div>
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex items-center gap-4">
        {activeTab !== "settings" && (
          <div className="flex items-center gap-2">
            <Switch id="readonly-switch" checked={readOnly} onCheckedChange={onToggleReadOnly} />
            <FieldLabel htmlFor="readonly-switch">Read Only</FieldLabel>
          </div>
        )}
        <KeyboardShortcutsDialog />
      </div>
    </header>
  );
}
