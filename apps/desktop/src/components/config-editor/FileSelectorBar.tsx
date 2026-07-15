import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui";

interface FileSelectorBarProps {
  configPaths: string[];
  selectedConfig: string | null;
  onSelectConfig: (path: string) => void;
  configFilter: string;
  onFilterChange: (value: string) => void;
  configCategory: string;
  onCategoryChange: (value: string) => void;
}

const categories = [
  "",
  "Graphics",
  "Multi Monitor",
  "VR",
  "Sound",
  "Input",
  "Gameplay",
  "Graphics Advanced",
  "Developer",
  "Steam",
  "Radio",
  "Framerate",
  "UI",
  "Misc",
];

export function FileSelectorBar({
  configPaths,
  selectedConfig,
  onSelectConfig,
  configFilter,
  onFilterChange,
  configCategory,
  onCategoryChange,
}: FileSelectorBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {configPaths.length > 0 && (
        <Select value={selectedConfig ?? undefined} onValueChange={onSelectConfig}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select a config file..." />
          </SelectTrigger>
          <SelectContent>
            {configPaths.map((p) => (
              <SelectItem key={p} value={p}>
                {p.split("/").slice(-3).join("/")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <input
        type="text"
        placeholder="Search..."
        value={configFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="w-48 rounded-md border border-border bg-card px-3 py-1.5 text-xs outline-none focus:border-ring"
      />

      <Select value={configCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c || "All Categories"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
