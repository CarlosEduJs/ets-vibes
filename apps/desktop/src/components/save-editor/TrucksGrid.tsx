import { Card, CardContent, CardHeader, CardTitle } from "ui";
import { Truck } from "lucide-react";
import type { TruckInfo } from "../../types";

interface TrucksGridProps {
  trucks: TruckInfo[];
}

function cleanLicensePlate(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\|(\w+)/g, (_, c) => ` | ${c.charAt(0).toUpperCase()}${c.slice(1)}`)
    .trim();
}

function WearBar({ value }: { value: number }) {
  const pct = value * 100;
  const color =
    pct < 25
      ? "bg-green-500"
      : pct < 50
        ? "bg-yellow-500"
        : pct < 75
          ? "bg-orange-500"
          : "bg-red-500";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TrucksGrid({ trucks }: TrucksGridProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Truck className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground">Trucks ({trucks.length})</h3>
      </div>
      {trucks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trucks found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {trucks.map((t) => (
            <Card key={t.index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Truck {t.index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {t.license_plate && (
                  <div className="text-muted-foreground">
                    Plate:{" "}
                    <span className="font-medium text-foreground">
                      {cleanLicensePlate(t.license_plate)}
                    </span>
                  </div>
                )}
                {t.odometer_km != null && (
                  <div className="text-muted-foreground">
                    Odometer:{" "}
                    <span className="font-medium text-foreground">
                      {t.odometer_km.toLocaleString()} km
                    </span>
                  </div>
                )}
                {t.fuel_relative != null && (
                  <div className="text-muted-foreground">
                    Fuel:{" "}
                    <span className="font-medium text-foreground">
                      {(t.fuel_relative * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {(t.engine_wear != null ||
                  t.transmission_wear != null ||
                  t.cabin_wear != null ||
                  t.chassis_wear != null) && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs text-muted-foreground">Wear</div>
                    {t.engine_wear != null && (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Engine</span>
                          <span className="font-medium text-foreground">
                            {(t.engine_wear * 100).toFixed(1)}%
                          </span>
                        </div>
                        <WearBar value={t.engine_wear} />
                      </div>
                    )}
                    {t.transmission_wear != null && (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Transmission</span>
                          <span className="font-medium text-foreground">
                            {(t.transmission_wear * 100).toFixed(1)}%
                          </span>
                        </div>
                        <WearBar value={t.transmission_wear} />
                      </div>
                    )}
                    {t.cabin_wear != null && (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Cabin</span>
                          <span className="font-medium text-foreground">
                            {(t.cabin_wear * 100).toFixed(1)}%
                          </span>
                        </div>
                        <WearBar value={t.cabin_wear} />
                      </div>
                    )}
                    {t.chassis_wear != null && (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Chassis</span>
                          <span className="font-medium text-foreground">
                            {(t.chassis_wear * 100).toFixed(1)}%
                          </span>
                        </div>
                        <WearBar value={t.chassis_wear} />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
