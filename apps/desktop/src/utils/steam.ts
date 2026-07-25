export function isSteamSynced(path: string): boolean {
  const p = path.toLowerCase().replace(/\\/g, "/");
  return p.includes(".steam") || p.includes("steam/userdata") || p.includes("steamprofiles");
}
