interface StatusBarProps {
  message: string;
}

export function StatusBar({ message }: StatusBarProps) {
  if (!message) return null;

  return (
    <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">{message}</div>
  );
}
