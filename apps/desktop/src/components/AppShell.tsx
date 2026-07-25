import type { ReactNode } from "react";
import { Toaster } from "@ui/index";

interface AppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  main: ReactNode;
  status: ReactNode;
  children?: ReactNode;
}

export function AppShell({ sidebar, header, main, status, children }: AppShellProps) {
  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-background text-foreground">
      {sidebar}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {header}
        <main className="flex-1 overflow-hidden p-6 relative">{main}</main>
        {status}
      </div>
      {children}
      <Toaster position="bottom-right" />
    </div>
  );
}
