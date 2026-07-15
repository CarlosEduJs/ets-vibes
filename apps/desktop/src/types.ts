export interface ProfileInfo {
  path: string;
  name: string;
  display_name: string;
  active_mods: string[];
  cached_experience: number | null;
  cached_distance: number | null;
}

export interface SaveInfo {
  profile_path: string;
  save_name: string;
  path: string;
  game_sii_path: string;
}

export interface TruckInfo {
  index: number;
  license_plate: string | null;
  odometer_km: number | null;
  fuel_relative: number | null;
  engine_wear: number | null;
  transmission_wear: number | null;
  cabin_wear: number | null;
  chassis_wear: number | null;
}

export interface SaveData {
  money: number | null;
  xp: number | null;
  level: number | null;
  trucks_count: number | null;
  drivers_count: number | null;
  hq_city: string | null;
  trucks: TruckInfo[];
  money_account: string | null;
  experience_points: string | null;
  was_compressed: boolean;
  game_time: number | null;
  total_distance_km: number | null;
  total_fuel_litres: number | null;
  visited_cities_count: number | null;
  achieved_feats: number | null;
  new_game: boolean | null;
  discovered_items: number | null;
  save_version: number | null;
  file_time: number | null;
  mods: string[];
}

export type ConfigValueType = "Int" | "Float" | "Bool" | "String";

export interface ConfigEntry {
  prefix: string;
  key: string;
  value: string;
  category: string;
  value_type: ConfigValueType;
}

export interface ConfigDocument {
  entries: ConfigEntry[];
}

export interface EditResult {
  message: string;
  backup: string | null;
}

export type SaveEditorView =
  | { level: "profiles" }
  | { level: "saves"; profile: ProfileInfo }
  | { level: "detail"; profile: ProfileInfo; save: SaveInfo };
