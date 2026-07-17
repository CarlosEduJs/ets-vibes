import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui";

interface ConfigToolbarProps {
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

export function ConfigToolbar({
  configFilter,
  onFilterChange,
  configCategory,
  onCategoryChange,
}: ConfigToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search..."
          value={configFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-48"
        />
        {configFilter && (
          <button
            type="button"
            onClick={() => onFilterChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm leading-none"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

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
