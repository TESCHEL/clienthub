import { auth } from "@clerk/nextjs";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlusIcon, ExternalLinkIcon, MailIcon, PhoneIcon, BuildingIcon } from "lucide-react";
import { ProjectCard } from "@/components/dashboard/ProjectCard";

export default async function ClientDetailPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const client = await prisma.client.findFirst({
    where: {
      id: params.clientId,
      organization: {
        users: {
          some: { clerkId: userId },
        },
      },
    },
    include: {
      projects: {
        include: {
          _count: {
            select: {
              updates: true,
              files: true,
              approvals: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${client.portalToken}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MailIcon className="h-4 w-4" />
              {client.email}
            </span>
            {client.phone && (
              <span className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4" />
                {client.phone}
              </span>
            )}
            {client.company && (
              <span className="flex items-center gap-1">
                <BuildingIcon className="h-4 w-4" />
                {client.company}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              View Portal
            </a>
          </Button>
          <Link href={`/dashboard/projects/new?clientId=${client.id}`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Portal Link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            Share this link with your client so they can view project updates:
          </p>
          <code className="text-sm bg-muted px-2 py-1 rounded break-all">
            {portalUrl}
          </code>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Projects ({client.projects.length})</h2>
        
        {client.projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <Link href={`/dashboard/projects/new?clientId=${client.id}`}>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {client.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
