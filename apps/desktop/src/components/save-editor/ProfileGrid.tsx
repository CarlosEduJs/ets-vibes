import type { ProfileInfo } from "../../types";
import {
  Button,
  Card,
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
import { ChevronRight } from "lucide-react";

interface ProfileGridProps {
  profiles: ProfileInfo[];
  selectedProfile: string | null;
  onSelectProfile: (path: string) => void;
  onLoadProfiles: () => void;
}

export function ProfileGrid({
  profiles,
  selectedProfile,
  onSelectProfile,
  onLoadProfiles,
}: ProfileGridProps) {
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
        <div className="flex flex-wrap gap-3">
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
    <Card onClick={onSelect} className="group border-none w-80">
      <CardHeader className="flex-row justify-between">
        <CardTitle className="text-xl">{profile.display_name}</CardTitle>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </CardHeader>
      <CardFooter className="justify-between">
        {profile.cached_distance != null && (
          <CardDescription className="text-sm text-muted-foreground">
            {profile.cached_distance.toLocaleString()} km
          </CardDescription>
        )}
        {profile.active_mods.length > 0 && (
          <CardDescription className="text-sm text-muted-foreground">
            {profile.active_mods.length} mod{profile.active_mods.length !== 1 ? "s" : ""}
          </CardDescription>
        )}
      </CardFooter>
    </Card>
  );
}
