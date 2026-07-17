import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "ui";
import type { SaveData } from "../../types";

interface OverviewStatsProps {
  saveData: SaveData;
}

function fmtNum(n: number | null | undefined): string {
  return n != null ? n.toLocaleString() : "N/A";
}

function fmtBool(v: boolean | null | undefined): string {
  if (v == null) return "N/A";
  return v ? "Yes" : "No";
}

function fmtTime(minutes: number | null | undefined): string {
  if (minutes == null) return "N/A";
  const h = Math.floor(minutes / 60);
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return `${d}d ${rh}h`;
}

function fmtTimestamp(secs: number | null | undefined): string {
  if (secs == null) return "N/A";
  return new Date(secs * 1000).toLocaleString();
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function OverviewStats({ saveData }: OverviewStatsProps) {
  return (
    <div className="space-y-4">
      {saveData.compatibility_warning && (
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Game Version: {saveData.game_version ?? "Unknown"}
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              {saveData.compatibility_warning}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Progress</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <StatRow label="Level" value={String(saveData.level ?? "N/A")} />
          <StatRow
            label="Money"
            value={
              saveData.money_account
                ? `${Number(saveData.money_account).toLocaleString()} €`
                : "N/A"
            }
          />
          <StatRow label="XP" value={saveData.experience_points ?? "N/A"} />
          <StatRow label="Trucks" value={String(saveData.trucks_count ?? "N/A")} />
          <StatRow label="Drivers" value={String(saveData.drivers_count ?? "N/A")} />
          <StatRow label="HQ" value={saveData.hq_city ?? "N/A"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <StatRow label="Game Time" value={fmtTime(saveData.game_time)} />
          <StatRow
            label="Distance"
            value={
              saveData.total_distance_km != null
                ? `${saveData.total_distance_km.toLocaleString()} km`
                : "N/A"
            }
          />
          <StatRow
            label="Fuel Used"
            value={
              saveData.total_fuel_litres != null
                ? `${saveData.total_fuel_litres.toLocaleString()} L`
                : "N/A"
            }
          />
          <StatRow label="Cities Visited" value={fmtNum(saveData.visited_cities_count)} />
          <StatRow label="Discoveries" value={fmtNum(saveData.discovered_items)} />
          <StatRow label="Achievements" value={fmtNum(saveData.achieved_feats)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <StatRow label="New Game" value={fmtBool(saveData.new_game)} />
          <StatRow label="Save Version" value={fmtNum(saveData.save_version)} />
          <StatRow label="Created" value={fmtTimestamp(saveData.file_time)} />
          {saveData.mods.length > 0 && (
            <StatRow label="Mods / DLCs" value={`${saveData.mods.length} installed`} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
