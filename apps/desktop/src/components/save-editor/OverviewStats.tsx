import { AlertTriangle, Trophy, Truck, User, MapPin, Euro, Award, Clock } from "lucide-react";
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

function StatRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/20 border border-border/20 px-3 py-2 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />}
        <span>{label}</span>
      </div>
      <span className="text-xs font-semibold text-foreground font-mono">{value}</span>
    </div>
  );
}

export function OverviewStats({ saveData }: OverviewStatsProps) {
  return (
    <div className="space-y-4">
      {saveData.compatibility_warning && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-amber-500">
              Game Version: {saveData.game_version ?? "Unknown"}
            </p>
            <p className="mt-0.5 text-xs text-amber-600/90 dark:text-amber-400/90">
              {saveData.compatibility_warning}
            </p>
          </div>
        </div>
      )}

      <Card className="border-border/30 bg-card/40 backdrop-blur-xl rounded-xl shadow-2xs">
        <CardHeader className="pb-2.5 pt-4 px-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Player Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 pb-4">
          <StatRow label="Level" value={String(saveData.level ?? "N/A")} icon={Award} />
          <StatRow
            label="Money"
            value={
              saveData.money_account
                ? `${Number(saveData.money_account).toLocaleString()} €`
                : "N/A"
            }
            icon={Euro}
          />
          <StatRow label="XP" value={saveData.experience_points ?? "N/A"} icon={Trophy} />
          <StatRow label="Trucks" value={String(saveData.trucks_count ?? "N/A")} icon={Truck} />
          <StatRow label="Drivers" value={String(saveData.drivers_count ?? "N/A")} icon={User} />
          <StatRow label="HQ City" value={saveData.hq_city ?? "N/A"} icon={MapPin} />
        </CardContent>
      </Card>

      <Card className="border-border/30 bg-card/40 backdrop-blur-xl rounded-xl shadow-2xs">
        <CardHeader className="pb-2.5 pt-4 px-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Statistics & Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 pb-4">
          <StatRow label="Game Time" value={fmtTime(saveData.game_time)} icon={Clock} />
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

      <Card className="border-border/30 bg-card/40 backdrop-blur-xl rounded-xl shadow-2xs">
        <CardHeader className="pb-2.5 pt-4 px-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Save File Info
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 pb-4">
          <StatRow label="New Game" value={fmtBool(saveData.new_game)} />
          <StatRow
            label="Save Format"
            value={saveData.was_compressed ? "ScsC (Compressed)" : "SiiN (Plaintext)"}
          />
          <StatRow label="Created Date" value={fmtTimestamp(saveData.file_time)} />
          {saveData.mods.length > 0 && (
            <StatRow label="Mods / DLCs" value={`${saveData.mods.length} active`} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
