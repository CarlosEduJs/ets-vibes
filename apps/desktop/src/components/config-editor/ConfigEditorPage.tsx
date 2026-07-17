import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button, toast } from "ui";
import * as v from "valibot";
import type { ConfigDocument, ConfigValueType, EditResult } from "../../types";
import { CONFIG_DESCRIPTIONS } from "../../config-descriptions";
import { ConfigToolbar } from "./FileSelectorBar";
import { ConfigTable, formatKeyName } from "./ConfigTable";

interface ConfigEditorPageProps {
  readOnly: boolean;
  onStatusChange: (message: string) => void;
}

const IntSchema = v.pipe(v.string(), v.regex(/^-?\d+$/));
const FloatSchema = v.pipe(v.string(), v.regex(/^-?\d*\.?\d+$/));
const BoolSchema = v.union([v.literal("0"), v.literal("1"), v.literal("true"), v.literal("false")]);

function validateValue(value: string, type: ConfigValueType): string | null {
  const result = v.safeParse(
    type === "Int"
      ? IntSchema
      : type === "Float"
        ? FloatSchema
        : type === "Bool"
          ? BoolSchema
          : v.string(),
    value,
  );
  if (result.success) return null;
  const issue = result.issues[0];
  if (issue) {
    if (type === "Int") return "Expected an integer";
    if (type === "Float") return "Expected a number";
    if (type === "Bool") return "Expected 0, 1, true, or false";
  }
  return "Invalid value";
}

export function ConfigEditorPage({ readOnly, onStatusChange }: ConfigEditorPageProps) {
  const [configPaths, setConfigPaths] = useState<string[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [configDoc, setConfigDoc] = useState<ConfigDocument | null>(null);
  const [configFilter, setConfigFilter] = useState("");
  const [configCategory, setConfigCategory] = useState("");
  const [configErrors, setConfigErrors] = useState<Record<string, string | null>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const selectConfig = useCallback(
    async (path: string) => {
      setSelectedConfig(path);
      setConfigDoc(null);
      setConfigFilter("");
      setConfigCategory("");
      setConfigErrors({});
      onStatusChange("Loading config...");
      try {
        const result = await invoke<ConfigDocument>("load_config", { path });
        setConfigDoc(result);
        const originals: Record<string, string> = {};
        for (const e of result.entries) originals[e.key] = e.value;
        setOriginalValues(originals);
        const msg = `Loaded ${result.entries.length} entries`;
        onStatusChange(msg);
      } catch (e) {
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      }
    },
    [onStatusChange],
  );

  useEffect(() => {
    async function init() {
      setLoading(true);
      onStatusChange("Searching config files...");
      try {
        const paths = await invoke<string[]>("list_configs");
        setConfigPaths(paths);
        if (paths.length > 0) {
          const firstPath = paths[0];
          if (firstPath != null) {
            await selectConfig(firstPath);
          }
        } else {
          onStatusChange("No config files found");
        }
      } catch (e) {
        toast.error(String(e));
        onStatusChange(`Error: ${e}`);
      }
      setLoading(false);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onConfigSave = useCallback(async () => {
    if (!selectedConfig || !configDoc) return;
    onStatusChange("Saving config...");
    try {
      const result = await invoke<EditResult>("save_config", {
        path: selectedConfig,
        entries: configDoc.entries,
      });
      toast.success(result.message);
      onStatusChange(result.message);
    } catch (e) {
      toast.error(String(e));
      onStatusChange(`Error: ${e}`);
    }
  }, [selectedConfig, configDoc, onStatusChange]);

  const onConfigValueChange = useCallback(
    (key: string, value: string, type: ConfigValueType) => {
      if (!configDoc) return;
      const error = validateValue(value, type);
      setConfigErrors((prev) => ({ ...prev, [key]: error }));
      setConfigDoc({
        ...configDoc,
        entries: configDoc.entries.map((e) => (e.key === key ? { ...e, value } : e)),
      });
    },
    [configDoc],
  );

  const onRevert = useCallback(
    (key: string) => {
      const original = originalValues[key];
      if (!configDoc || original === undefined) return;
      const entry = configDoc.entries.find((e) => e.key === key);
      if (!entry) return;
      onConfigValueChange(key, original, entry.value_type);
    },
    [configDoc, originalValues, onConfigValueChange],
  );

  const filteredEntries =
    configDoc?.entries.filter((e) => {
      if (configCategory && e.category !== configCategory) return false;
      if (configFilter) {
        const q = configFilter.toLowerCase();
        return (
          e.key.toLowerCase().includes(q) ||
          e.value.toLowerCase().includes(q) ||
          formatKeyName(e.key).toLowerCase().includes(q)
        );
      }
      return true;
    }) ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading config...
      </div>
    );
  }

  if (!configDoc) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-sm text-muted-foreground">
        <p>{configPaths.length === 0 ? "No config files found." : "Failed to load config."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 bg-background pb-2">
        <ConfigToolbar
          configFilter={configFilter}
          onFilterChange={setConfigFilter}
          configCategory={configCategory}
          onCategoryChange={setConfigCategory}
        />
        <Button
          variant="default"
          size="sm"
          onClick={onConfigSave}
          disabled={readOnly || Object.values(configErrors).some((e) => e !== null)}
        >
          Save Config
        </Button>
      </div>

      {Object.values(configErrors).some((e) => e !== null) && (
        <div className="text-xs text-destructive">Fix validation errors before saving</div>
      )}

      {filteredEntries.length > 0 ? (
        <div className="overflow-x-auto">
          <ConfigTable
            entries={filteredEntries}
            configErrors={configErrors}
            originalValues={originalValues}
            onValueChange={onConfigValueChange}
            onRevert={onRevert}
            descriptions={CONFIG_DESCRIPTIONS}
            readOnly={readOnly}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No entries match the filter.</p>
      )}

      <div className="text-xs text-muted-foreground">
        {filteredEntries.length} / {configDoc.entries.length} entries
      </div>
    </div>
  );
}
