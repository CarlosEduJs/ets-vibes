import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "ui";

interface BreadcrumbNavProps {
  profileName?: string;
  saveName?: string;
  onNavigateProfiles: () => void;
  onNavigateSaves: () => void;
}

export function BreadcrumbNav({
  profileName,
  saveName,
  onNavigateProfiles,
  onNavigateSaves,
}: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={onNavigateProfiles}>Profiles</BreadcrumbLink>
        </BreadcrumbItem>
        {profileName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onNavigateSaves}>{profileName}</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        {saveName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{saveName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
