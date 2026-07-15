import type { TruckInfo } from "../../types";

interface TrucksGridProps {
  trucks: TruckInfo[];
}

export function TrucksGrid({ trucks }: TrucksGridProps) {
  if (trucks.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Trucks</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {trucks.map((t) => (
          <div key={t.index} className="rounded-lg border border-border bg-card p-3 text-xs">
            <div className="mb-1 text-sm font-medium text-card-foreground">Truck {t.index + 1}</div>
            <div className="space-y-0.5 text-muted-foreground">
              {t.license_plate && <div>Plate: {t.license_plate}</div>}
              {t.odometer_km != null && <div>Odometer: {t.odometer_km.toLocaleString()} km</div>}
              {t.fuel_relative != null && <div>Fuel: {(t.fuel_relative * 100).toFixed(0)}%</div>}
              {t.engine_wear != null && <div>Engine: {(t.engine_wear * 100).toFixed(1)}%</div>}
              {t.transmission_wear != null && (
                <div>Transm.: {(t.transmission_wear * 100).toFixed(1)}%</div>
              )}
              {t.cabin_wear != null && <div>Cabin: {(t.cabin_wear * 100).toFixed(1)}%</div>}
              {t.chassis_wear != null && <div>Chassis: {(t.chassis_wear * 100).toFixed(1)}%</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
