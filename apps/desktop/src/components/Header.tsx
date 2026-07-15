import { Switch } from "ui";
import { FieldLabel } from "ui";
import { TabBar } from "./TabBar";

interface HeaderProps {
  readOnly: boolean;
  onToggleReadOnly: () => void;
  activeTab: "saves" | "config";
  onTabChange: (tab: "saves" | "config") => void;
}

export function Header({ readOnly, onToggleReadOnly, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3">
      <h1 className="text-2xl font-bold">ETS Vibes</h1>
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex items-center gap-2">
        <Switch id="readonly-switch" checked={readOnly} onCheckedChange={onToggleReadOnly} />
        <FieldLabel htmlFor="readonly-switch">Read Only</FieldLabel>
      </div>
    </header>
  );
}
