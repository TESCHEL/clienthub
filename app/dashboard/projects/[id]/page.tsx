import { auth } from "@clerk/nextjs";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UpdateFeed } from "@/components/dashboard/UpdateFeed";
import { FileList } from "@/components/dashboard/FileList";
import { ApprovalList } from "@/components/dashboard/ApprovalList";
import { Checklist } from "@/components/dashboard/Checklist";
import { ProjectHeader } from "@/components/dashboard/ProjectHeader";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      organization: true,
      updates: {
        include: {
          author: true,
          files: true,
        },
        orderBy: { createdAt: "desc" },
      },
      files: {
        include: {
          uploader: true,
        },
        orderBy: { createdAt: "desc" },
      },
      approvals: {
        include: {
          requestedBy: true,
        },
        orderBy: { createdAt: "desc" },
      },
      checklistItems: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) notFound();

  // Verify user has access
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: true,
    },
  });

  const hasAccess = dbUser?.organizations.some(
    (m) => m.organizationId === project.organizationId
  );

  if (!hasAccess) notFound();

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${project.portalToken}`;

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Client Portal:</span>
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {portalUrl}
        </code>
        <Link href={portalUrl} target="_blank">
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="updates">
        <TabsList>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="mt-6">
          <UpdateFeed
            projectId={project.id}
            updates={project.updates}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FileList projectId={project.id} files={project.files} />
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <ApprovalList
            projectId={project.id}
            approvals={project.approvals}
          />
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <Checklist
            projectId={project.id}
            items={project.checklistItems}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
