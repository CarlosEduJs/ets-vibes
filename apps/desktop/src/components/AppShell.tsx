import type { ReactNode } from "react";

interface AppShellProps {
  header: ReactNode;
  main: ReactNode;
  status: ReactNode;
}

export function AppShell({ header, main, status }: AppShellProps) {
  return (
    <div className="flex h-screen max-h-screen overflow-y-hidden flex-col bg-background text-foreground">
      {header}
      <main className="flex-1 overflow-hidden p-6">{main}</main>
      {status}
    </div>
  );
}
