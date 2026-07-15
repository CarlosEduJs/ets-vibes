import { Tabs, TabsList, TabsTrigger } from "ui";

interface TabBarProps {
  activeTab: "saves" | "config";
  onTabChange: (tab: "saves" | "config") => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="px-6">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "saves" | "config")}>
        <TabsList className="gap-0 p-0 h-fit border">
          <TabsTrigger value="saves">Save Editor</TabsTrigger>
          <TabsTrigger value="config">Config Editor</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
