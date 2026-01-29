import Image from "next/image";

interface PortalHeaderProps {
  project: { name: string };
  organization: { name: string; logoUrl: string | null; primaryColor: string | null };
  client: { name: string };
}

export function PortalHeader({ project, organization, client }: PortalHeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {organization.logoUrl ? (
            <Image src={organization.logoUrl} alt={organization.name} width={32} height={32} className="rounded" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-semibold">
              {organization.name[0]}
            </div>
          )}
          <div>
            <h1 className="font-semibold">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{organization.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{client.name}</p>
          <p className="text-xs text-muted-foreground">Client Portal</p>
        </div>
      </div>
    </header>
  );
}
