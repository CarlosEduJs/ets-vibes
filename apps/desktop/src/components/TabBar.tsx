import { Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "ui";

export type TabId = "saves" | "config" | "settings";

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TabId)}>
      <TabsList className="gap-0 p-0 h-fit border">
        <TabsTrigger value="saves">Save Editor</TabsTrigger>
        <TabsTrigger value="config">Config Editor</TabsTrigger>
        <TabsTrigger value="settings" className="gap-1.5">
          <Settings className="h-3.5 w-3.5" />
          Settings
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
