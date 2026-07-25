import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Kbd, KbdGroup } from "ui";
import { Keyboard } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
  scope: string;
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ["Ctrl", "K"],
    description: "Open Quick Command Palette",
    scope: "Global",
  },
  {
    keys: ["Ctrl", "S"],
    description: "Save changes (Config or Save Editor)",
    scope: "Config / Save Editor",
  },
  {
    keys: ["Ctrl", "F"],
    description: "Focus search field",
    scope: "Config Editor / Sidebar",
  },
  {
    keys: ["Ctrl", ","],
    description: "Open Settings & Preferences",
    scope: "Global",
  },
  {
    keys: ["?"],
    description: "Show keyboard shortcuts dialog",
    scope: "Global",
  },
  {
    keys: ["D"],
    description: "Change theme app to Dark or Light",
    scope: "Global",
  },
];

interface KeyboardShortcutsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: KeyboardShortcutsDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (val: boolean) => {
      if (isControlled) {
        setControlledOpen?.(val);
      } else {
        setInternalOpen(val);
      }
    },
    [isControlled, setControlledOpen],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "?" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setOpen(!isOpen);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-md border border-border divide-y divide-border">
            {SHORTCUTS.map((s) => (
              <div key={s.description} className="flex items-center justify-between p-3 text-sm">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">{s.description}</p>
                  <p className="text-xs text-muted-foreground">{s.scope}</p>
                </div>
                <div className="flex items-center gap-1">
                  {s.keys.map((k, kIdx) => (
                    <KbdGroup key={k}>
                      <Kbd>{k}</Kbd>
                      {kIdx < s.keys.length - 1 && (
                        <span className="text-xs text-muted-foreground">+</span>
                      )}
                    </KbdGroup>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
