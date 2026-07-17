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
import { ChevronRight, Loader2 } from "lucide-react";

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
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading profiles...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={onLoadProfiles}>
          Reload
        </Button>
      </div>
      {profiles.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia />
            <EmptyTitle>No profiles found</EmptyTitle>
            <EmptyDescription>Click the button below to reload the profiles.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={onLoadProfiles}>
              Reload
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
