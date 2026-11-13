import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Slider,
  Switch,
} from "ui";
import type { TruckEdit, TruckInfo } from "../../types";
import { truckName } from "../../utils/truck";
import {
  DEFAULT_BACKGROUND,
  DEFAULT_TEXT_COLOR,
  PLATE_COUNTRIES,
  buildPlate,
  parsePlate,
  validatePlateParts,
} from "../../utils/plate";

type WearKey = "engine_wear" | "transmission_wear" | "cabin_wear" | "chassis_wear" | "wheels_wear";

const WEAR_FIELDS: Array<{ key: WearKey; label: string }> = [
  { key: "engine_wear", label: "Engine" },
  { key: "transmission_wear", label: "Transmission" },
  { key: "cabin_wear", label: "Cabin" },
  { key: "chassis_wear", label: "Chassis" },
  { key: "wheels_wear", label: "Wheels" },
];

interface TruckEditDialogProps {
  truck: TruckInfo;
  onClose: () => void;
  onSave: (edit: TruckEdit) => void;
}

const toPercent = (v: number | null) => Math.round((v ?? 0) * 100);

export function TruckEditDialog({ truck, onClose, onSave }: TruckEditDialogProps) {
  const initialPlate = parsePlate(truck.license_plate ?? "");
  const [text, setText] = useState(initialPlate.text);
  const [country, setCountry] = useState(initialPlate.country);
  const [custom, setCustom] = useState(initialPlate.background !== null);
  const [background, setBackground] = useState(initialPlate.background ?? DEFAULT_BACKGROUND);
  const [textColor, setTextColor] = useState(initialPlate.textColor ?? DEFAULT_TEXT_COLOR);
  const [wear, setWear] = useState<Record<WearKey, number>>({
    engine_wear: toPercent(truck.engine_wear),
    transmission_wear: toPercent(truck.transmission_wear),
    cabin_wear: toPercent(truck.cabin_wear),
    chassis_wear: toPercent(truck.chassis_wear),
    wheels_wear: toPercent(truck.wheels_wear),
  });

  const parts = {
    text,
    country,
    background: custom ? background : null,
    textColor: custom ? textColor : null,
  };
  const plateError = validatePlateParts(parts);

  const submit = () => {
    if (plateError) return;
    const edit: TruckEdit = {};
    const plate = buildPlate(parts);
    if (plate !== truck.license_plate) edit.license_plate = plate;
    for (const { key } of WEAR_FIELDS) {
      if (wear[key] !== toPercent(truck[key])) edit[key] = wear[key] / 100;
    }
    onSave(edit);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {truckName(truck) ?? `Truck ${truck.index + 1}`}</DialogTitle>
          <DialogDescription>
            Only this truck is changed. A backup of the save is created first.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>License plate</Label>
            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="KMIRAS"
                className="flex-1"
              />
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value.trim().toLowerCase())}
                list="plate-countries"
                placeholder="country"
                className="w-32"
              />
              <datalist id="plate-countries">
                {PLATE_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </datalist>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Switch checked={custom} onCheckedChange={setCustom} id="plate-custom" />
              <Label htmlFor="plate-custom">Custom colors</Label>
              {custom && (
                <>
                  <label className="flex items-center gap-1 text-muted-foreground">
                    Background
                    <input
                      type="color"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                    />
                  </label>
                  <label className="flex items-center gap-1 text-muted-foreground">
                    Text
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                  </label>
                </>
              )}
            </div>
            <div
              className="flex h-10 items-center justify-center rounded-md border border-border text-lg font-bold tracking-widest"
              style={custom ? { background, color: textColor } : undefined}
            >
              {text || "—"}
            </div>
            {plateError && <p className="text-xs text-destructive">{plateError}</p>}
            <p className="text-xs text-muted-foreground">
              Disable World of Trucks and don&apos;t change the truck&apos;s garage afterwards, or
              the game may reset the plate.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Wear (0% = new)</Label>
            {WEAR_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className="w-28 text-muted-foreground">{label}</span>
                <Slider
                  aria-label={`${label} wear`}
                  min={0}
                  max={100}
                  step={1}
                  value={[wear[key]]}
                  onValueChange={([v]) => setWear((w) => ({ ...w, [key]: v }))}
                />
                <span className="w-10 text-right font-medium">{wear[key]}%</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={plateError !== null}>
            Save truck
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
