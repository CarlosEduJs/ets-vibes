import type { TruckInfo } from "../types";

const BRAND_NAMES: Record<string, string> = {
  daf: "DAF",
  iveco: "Iveco",
  man: "MAN",
  mercedes: "Mercedes-Benz",
  renault: "Renault Trucks",
  scania: "Scania",
  volvo: "Volvo",
  // ATS
  freightliner: "Freightliner",
  intl: "International",
  kenworth: "Kenworth",
  mack: "Mack",
  peterbilt: "Peterbilt",
  volvo_us: "Volvo",
  westernstar: "Western Star",
};

const MODEL_NAMES: Record<string, string> = {
  hiway: "Hi-Way",
  sway: "S-Way",
  stralis: "Stralis",
  magnum: "Magnum",
  premium: "Premium",
  actros: "Actros",
  actros2014: "Actros (2014)",
  tgx: "TGX",
  tgx_euro6: "TGX Euro 6",
  "2021": "(2021)",
  fh16: "FH16",
  fh16_2012: "FH16 (2012)",
  fh_2021: "FH (2021)",
  fh_2024: "FH (2024)",
  r_2016: "R (2016)",
  s_2016: "S (2016)",
};

function prettifyModel(model: string): string {
  const known = MODEL_NAMES[model];
  if (known) return known;
  return model
    .split("_")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** e.g. `renault` / `t` -> "Renault Trucks T"; null if the save has no model info. */
export function truckName(truck: Pick<TruckInfo, "brand" | "model">): string | null {
  if (!truck.brand) return null;
  const brand =
    BRAND_NAMES[truck.brand] ?? truck.brand.charAt(0).toUpperCase() + truck.brand.slice(1);
  return truck.model ? `${brand} ${prettifyModel(truck.model)}` : brand;
}
