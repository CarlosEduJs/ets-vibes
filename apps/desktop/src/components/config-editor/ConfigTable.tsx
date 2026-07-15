import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "ui";
import type { ConfigEntry, ConfigValueType } from "../../types";

function formatKeyName(key: string): string {
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
  onValueChange: (key: string, value: string, type: ConfigValueType) => void;
  readOnly: boolean;
}

export function ConfigTable({ entries, configErrors, onValueChange, readOnly }: ConfigTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Key</TableHead>
          <TableHead className="w-[40%]">Value</TableHead>
          <TableHead className="w-[10%]">Type</TableHead>
          <TableHead className="w-[10%]">Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((e) => {
          const error = configErrors[e.key];
          return (
            <TableRow key={e.key}>
              <TableCell className="font-mono text-xs text-foreground">
                {formatKeyName(e.key)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={e.value}
                    onChange={(ev) => onValueChange(e.key, ev.target.value, e.value_type)}
                    className={`w-full bg-transparent text-xs outline-none ${
                      error
                        ? "border-b border-destructive text-destructive"
                        : "border-b border-transparent hover:border-border focus:border-ring"
                    }`}
                    readOnly={readOnly}
                  />
                  {error && (
                    <span className=" shrink-0 text-xs text-destructive" title={error}>
                      ⚠
                    </span>
                  )}
                </div>
                {error && <div className="mt-0.5 text-[10px] text-destructive">{error}</div>}
              </TableCell>
              <TableCell className="text-[10px] text-muted-foreground">{e.value_type}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{e.category}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
