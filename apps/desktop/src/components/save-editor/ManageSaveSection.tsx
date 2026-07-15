import { useState } from "react";
import { Button, Input, Collapsible, CollapsibleTrigger, CollapsibleContent } from "ui";

interface ManageSaveSectionProps {
  readOnly: boolean;
  onRename: (newName: string) => void;
  onClone: (newName: string) => void;
  onDelete: () => void;
}

export function ManageSaveSection({
  readOnly,
  onRename,
  onClone,
  onDelete,
}: ManageSaveSectionProps) {
  const [rename, setRename] = useState("");
  const [clone, setClone] = useState("");

  return (
    <Collapsible className="rounded-lg border border-border">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        Manage Save
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="New save name"
            value={rename}
            onChange={(e) => setRename(e.target.value)}
            disabled={readOnly}
            className="w-40"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onRename(rename);
              setRename("");
            }}
            disabled={readOnly || !rename.trim()}
          >
            Rename
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Clone name"
            value={clone}
            onChange={(e) => setClone(e.target.value)}
            disabled={readOnly}
            className="w-40"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClone(clone);
              setClone("");
            }}
            disabled={readOnly || !clone.trim()}
          >
            Clone
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={readOnly}>
            Delete Save
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
