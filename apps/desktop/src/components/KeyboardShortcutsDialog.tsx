import { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Kbd } from "ui";
import { Keyboard } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
  scope: string;
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ["Ctrl", "S"],
    description: "Save changes (Config or Save Editor)",
    scope: "Config / Save Editor",
  },
  {
    keys: ["Ctrl", "F"],
    description: "Focus search field",
    scope: "Config Editor",
  },
  {
    keys: ["Esc"],
    description: "Go back to previous level / close modal",
    scope: "Save Editor / Modals",
  },
  {
    keys: ["?"],
    description: "Show keyboard shortcuts dialog",
    scope: "Global",
  },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "?" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Keyboard Shortcuts (?)"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label="Keyboard Shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Keyboard className="h-5 w-5" />
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
                      <span key={k} className="flex items-center gap-1">
                        <Kbd>{k}</Kbd>
                        {kIdx < s.keys.length - 1 && (
                          <span className="text-xs text-muted-foreground">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
