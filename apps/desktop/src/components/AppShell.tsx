import type { ReactNode } from "react";

interface AppShellProps {
  header: ReactNode;
  main: ReactNode;
  status: ReactNode;
}

export function AppShell({ header, main, status }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {header}
      <main className="flex-1 p-6">{main}</main>
      {status}
    </div>
  );
}
