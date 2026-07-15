import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "ui";
import * as v from "valibot";
import type { ConfigDocument, ConfigValueType, EditResult } from "../../types";
import { FileSelectorBar } from "./FileSelectorBar";
import { ConfigTable } from "./ConfigTable";

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

  const loadConfigs = useCallback(async () => {
    onStatusChange("Searching config files...");
    try {
      const result = await invoke<string[]>("list_configs");
      setConfigPaths(result);
      onStatusChange(`Found ${result.length} config files`);
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [onStatusChange]);

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
        onStatusChange(`Loaded ${result.entries.length} entries`);
      } catch (e) {
        onStatusChange(`Error: ${e}`);
      }
    },
    [onStatusChange],
  );

  const handleConfigSave = useCallback(async () => {
    if (!selectedConfig || !configDoc) return;
    onStatusChange("Saving config...");
    try {
      const result = await invoke<EditResult>("save_config", {
        path: selectedConfig,
        entries: configDoc.entries,
      });
      onStatusChange(result.message);
    } catch (e) {
      onStatusChange(`Error: ${e}`);
    }
  }, [selectedConfig, configDoc, onStatusChange]);

  const handleConfigValueChange = useCallback(
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

  const filteredEntries =
    configDoc?.entries.filter((e) => {
      if (configCategory && e.category !== configCategory) return false;
      if (configFilter) {
        const q = configFilter.toLowerCase();
        return e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q);
      }
      return true;
    }) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={loadConfigs}>
          Find Configs
        </Button>
      </div>

      <FileSelectorBar
        configPaths={configPaths}
        selectedConfig={selectedConfig}
        onSelectConfig={selectConfig}
        configFilter={configFilter}
        onFilterChange={setConfigFilter}
        configCategory={configCategory}
        onCategoryChange={setConfigCategory}
      />

      {configDoc && (
        <>
          {Object.values(configErrors).some((e) => e !== null) && (
            <div className="text-xs text-destructive">Fix validation errors before saving</div>
          )}

          {filteredEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <ConfigTable
                entries={filteredEntries}
                configErrors={configErrors}
                onValueChange={handleConfigValueChange}
                readOnly={readOnly}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No entries match the filter.</p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filteredEntries.length} / {configDoc.entries.length} entries
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfigSave}
              disabled={readOnly || Object.values(configErrors).some((e) => e !== null)}
            >
              Save Config
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
