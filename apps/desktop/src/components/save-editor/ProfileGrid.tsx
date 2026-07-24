import type { ProfileInfo } from "../../types";
import {
  Button,
  CardTitle,
  CardDescription,
  CardHeader,
  CardFooter,
  Empty,
  EmptyTitle,
  EmptyHeader,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "ui";
import { ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { GamePathSelector } from "./GamePathSelector";
import { useSettingsStore } from "../../stores/settings";

interface ProfileGridProps {
  profiles: ProfileInfo[];
  selectedProfile: string | null;
  loading?: boolean;
  onSelectProfile: (path: string) => void;
  onLoadProfiles: () => void;
}

export function ProfileGrid({
  profiles,
  selectedProfile,
  loading,
  onSelectProfile,
  onLoadProfiles,
}: ProfileGridProps) {
  const { customGamePath, setCustomGamePath } = useSettingsStore();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GamePathSelector
        customPath={customGamePath}
        onPathChange={setCustomGamePath}
        onRefresh={onLoadProfiles}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Profiles ({profiles.length})
        </h3>
        <Button variant="outline" size="sm" onClick={onLoadProfiles} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Reload Profiles
        </Button>
      </div>

      {profiles.length === 0 ? (
        <Empty className="py-12 border border-dashed border-border/60 rounded-xl bg-card/40">
          <EmptyHeader>
            <EmptyMedia />
            <EmptyTitle>No profiles found</EmptyTitle>
            <EmptyDescription className="max-w-md">
              No profiles detected in default game folders. If your game is on another drive (e.g.
              D: drive) or custom folder, use the directory selector above to specify your game or
              profiles location.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={onLoadProfiles} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Reload Profiles
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((p) => (
            <ProfileCard
              key={p.path}
              profile={p}
              isSelected={selectedProfile === p.path}
              onSelect={() => onSelectProfile(p.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileCard({
  profile,
  onSelect,
}: {
  profile: ProfileInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="group cursor-pointer rounded-xl bg-card/80 backdrop-blur-lg text-card-foreground shadow-sm border-none text-left w-full"
    >
      <CardHeader className="flex-row justify-between">
        <CardTitle>{profile.display_name}</CardTitle>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </CardHeader>
      <CardFooter className="justify-between">
        {profile.cached_distance != null && (
          <CardDescription className="text-muted-foreground">
            Distance of {profile.cached_distance.toLocaleString()} km and{" "}
            {(profile.cached_experience ?? 0).toLocaleString()} XP
          </CardDescription>
        )}
        {profile.active_mods.length > 0 && (
          <CardDescription className="text-muted-foreground">
            {profile.active_mods.length} mod{profile.active_mods.length !== 1 ? "s" : ""}
          </CardDescription>
        )}
      </CardFooter>
    </button>
  );
}
