import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "ui";
import { RotateCcw, Info } from "lucide-react";
import type { ConfigEntry, ConfigValueType } from "../../types";
import { CONFIG_RANGES } from "../../config-ranges";
import type { ConfigRange } from "../../config-ranges";

export function formatKeyName(key: string): string {
  const parts = key.split("_");
  const startIdx = parts[0]?.length === 1 || parts[0] === "ui" ? 1 : 0;
  const name = parts
    .slice(startIdx)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return `${name} (${key})`;
}

interface ConfigTableProps {
  entries: ConfigEntry[];
  configErrors: Record<string, string | null>;
  originalValues: Record<string, string>;
  onValueChange: (key: string, value: string, type: ConfigValueType) => void;
  onRevert: (key: string) => void;
  descriptions: Record<string, string>;
  readOnly: boolean;
}

function NumericSlider({
  entry,
  step,
  range,
  onValueChange,
  readOnly,
}: {
  entry: ConfigEntry;
  step: number;
  range?: ConfigRange;
  onValueChange: (key: string, value: string, type: ConfigValueType) => void;
  readOnly: boolean;
}) {
  const num = entry.value_type === "Int" ? parseInt(entry.value, 10) : parseFloat(entry.value);
  const safeNum = isNaN(num) ? 0 : num;

  let min: number, max: number, effectiveStep: number;
  if (range) {
    min = range.min;
    max = range.max;
    effectiveStep = range.step;
  } else {
    min = safeNum >= 0 ? 0 : -10000;
    max = safeNum >= 0 ? 10000 : 0;
    effectiveStep = step;
  }
  const clamped = Math.min(max, Math.max(min, safeNum));

  return (
    <div className="flex items-center gap-2">
      <Slider
        value={[clamped]}
        onValueChange={([v]) => {
          const val = v ?? clamped;
          if (entry.value_type === "Int") {
            onValueChange(entry.key, String(Math.round(val)), entry.value_type);
          } else {
            onValueChange(entry.key, val.toFixed(2), entry.value_type);
          }
        }}
        min={min}
        max={max}
        step={effectiveStep}
        disabled={readOnly}
        className="flex-1"
      />
      <div className="flex flex-col items-end leading-tight">
        <span className="text-xs tabular-nums text-foreground">
          {entry.value_type === "Int" ? safeNum : safeNum.toFixed(2)}
        </span>
        {range && (
          <span className="text-[10px] text-muted-foreground">
            {range.min}…{range.max}
          </span>
        )}
      </div>
    </div>
  );
}

function ValueCell({
  entry,
  error,
  onValueChange,
  readOnly,
}: {
  entry: ConfigEntry;
  error: string | null;
  onValueChange: (key: string, value: string, type: ConfigValueType) => void;
  readOnly: boolean;
}) {
  switch (entry.value_type) {
    case "Int":
      return (
        <NumericSlider
          entry={entry}
          step={1}
          range={CONFIG_RANGES[entry.key]}
          onValueChange={onValueChange}
          readOnly={readOnly}
        />
      );
    case "Float":
      return (
        <NumericSlider
          entry={entry}
          step={0.1}
          range={CONFIG_RANGES[entry.key]}
          onValueChange={onValueChange}
          readOnly={readOnly}
        />
      );
    case "Bool": {
      const boolValue = entry.value === "true" || entry.value === "1" ? "true" : "false";
      return (
        <Select
          value={boolValue}
          onValueChange={(v) => onValueChange(entry.key, v, entry.value_type)}
          disabled={readOnly}
        >
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true" className="text-xs">
              true
            </SelectItem>
            <SelectItem value="false" className="text-xs">
              false
            </SelectItem>
          </SelectContent>
        </Select>
      );
    }
    default: {
      return (
        <div>
          <div className="flex items-center gap-1">
            <Input
              type="text"
              placeholder="edit here..."
              value={entry.value}
              onChange={(e) => onValueChange(entry.key, e.target.value, entry.value_type)}
              readOnly={readOnly}
              className={`h-8 text-xs ${error ? "border-destructive" : ""}`}
            />
            {error && (
              <span className="shrink-0 text-xs text-destructive" title={error}>
                ⚠
              </span>
            )}
          </div>
          {error && <div className="mt-0.5 text-xs text-destructive">{error}</div>}
        </div>
      );
    }
  }
}

export function ConfigTable({
  entries,
  configErrors,
  originalValues,
  onValueChange,
  onRevert,
  descriptions,
  readOnly,
}: ConfigTableProps) {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Key</TableHead>
            <TableHead className="w-[35%]">Value</TableHead>
            <TableHead className="w-[10%]">Category</TableHead>
            <TableHead className="w-[20%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => {
            const error = configErrors[e.key];
            const original = originalValues[e.key];
            const isModified = original !== undefined && original !== e.value;
            const description = descriptions[e.key];

            return (
              <TableRow key={e.key} className={isModified ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                <TableCell className="text-xs text-foreground">{formatKeyName(e.key)}</TableCell>
                <TableCell>
                  <ValueCell
                    entry={e}
                    error={error ?? null}
                    onValueChange={onValueChange}
                    readOnly={readOnly}
                  />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{e.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={readOnly || !isModified}
                          className="h-7 w-7"
                          onClick={() => onRevert(e.key)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Revert to "{original}"</TooltipContent>
                    </Tooltip>
                    {description && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-72 text-xs flex-col gap-3 text-muted-foreground">
                          <p className="text-foreground">Description:</p>
                          {description}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
