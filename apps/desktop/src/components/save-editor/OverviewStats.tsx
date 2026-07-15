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

export function OverviewStats({ saveData }: OverviewStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <div className="text-muted-foreground">Level</div>
      <div className="text-foreground">{saveData.level ?? "N/A"}</div>
      <div className="text-muted-foreground">Money</div>
      <div className="text-foreground">
        {saveData.money_account ? `${Number(saveData.money_account).toLocaleString()} €` : "N/A"}
      </div>
      <div className="text-muted-foreground">XP</div>
      <div className="text-foreground">{saveData.experience_points ?? "N/A"}</div>
      <div className="text-muted-foreground">Trucks</div>
      <div className="text-foreground">{saveData.trucks_count ?? "N/A"}</div>
      <div className="text-muted-foreground">Drivers</div>
      <div className="text-foreground">{saveData.drivers_count ?? "N/A"}</div>
      <div className="text-muted-foreground">HQ</div>
      <div className="text-foreground">{saveData.hq_city ?? "N/A"}</div>
      <div className="border-t border-border pt-2 col-span-2 text-xs text-muted-foreground mt-2">
        Additional Info
      </div>
      <div className="text-muted-foreground">Game Time</div>
      <div className="text-foreground">{fmtTime(saveData.game_time)}</div>
      <div className="text-muted-foreground">Distance</div>
      <div className="text-foreground">
        {saveData.total_distance_km != null
          ? `${saveData.total_distance_km.toLocaleString()} km`
          : "N/A"}
      </div>
      <div className="text-muted-foreground">Fuel Used</div>
      <div className="text-foreground">
        {saveData.total_fuel_litres != null
          ? `${saveData.total_fuel_litres.toLocaleString()} L`
          : "N/A"}
      </div>
      <div className="text-muted-foreground">Cities Visited</div>
      <div className="text-foreground">{fmtNum(saveData.visited_cities_count)}</div>
      <div className="text-muted-foreground">Discoveries</div>
      <div className="text-foreground">{fmtNum(saveData.discovered_items)}</div>
      <div className="text-muted-foreground">Achievements</div>
      <div className="text-foreground">{fmtNum(saveData.achieved_feats)}</div>
      <div className="text-muted-foreground">New Game</div>
      <div className="text-foreground">{fmtBool(saveData.new_game)}</div>
      <div className="text-muted-foreground">Save Version</div>
      <div className="text-foreground">{fmtNum(saveData.save_version)}</div>
      <div className="text-muted-foreground">Created</div>
      <div className="text-foreground">{fmtTimestamp(saveData.file_time)}</div>
      {saveData.mods.length > 0 && (
        <>
          <div className="text-muted-foreground">Mods / DLCs</div>
          <div className="text-foreground">
            <span className="text-xs">{saveData.mods.length} installed</span>
          </div>
        </>
      )}
    </div>
  );
}
