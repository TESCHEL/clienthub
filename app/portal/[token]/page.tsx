import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalUpdate } from "@/components/portal/PortalUpdate";
import { PortalFile } from "@/components/portal/PortalFile";
import { ApprovalButtons } from "@/components/portal/ApprovalButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default async function PortalPage({ params }: { params: { token: string } }) {
  const project = await prisma.project.findUnique({
    where: { portalToken: params.token },
    include: {
      client: true,
      organization: true,
      updates: { where: { isPublic: true }, include: { author: true, files: true }, orderBy: { createdAt: "desc" } },
      files: { orderBy: { createdAt: "desc" } },
      approvals: { include: { requestedBy: true }, orderBy: { createdAt: "desc" } },
      checklistItems: { orderBy: { order: "asc" } },
    },
  });

  if (!project || !project.portalEnabled) notFound();

  const totalItems = project.checklistItems.length;
  const completedItems = project.checklistItems.filter((item) => item.isCompleted).length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const pendingApprovals = project.approvals.filter((a) => a.status === "PENDING");

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader project={project} organization={project.organization} client={project.client} />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {totalItems > 0 && (
          <div className="mb-8 rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Project Progress</h2>
            <Progress value={progressPercent} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">{completedItems} of {totalItems} tasks completed</p>
          </div>
        )}
        {pendingApprovals.length > 0 && (
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <h2 className="mb-4 text-lg font-semibold">Action Required</h2>
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="rounded-lg border bg-white p-4">
                  <h3 className="font-medium">{approval.title}</h3>
                  {approval.description && <p className="mt-1 text-sm text-muted-foreground">{approval.description}</p>}
                  <ApprovalButtons approvalId={approval.id} />
                </div>
              ))}
            </div>
          </div>
        )}
        <Tabs defaultValue="updates">
          <TabsList>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
          <TabsContent value="updates" className="mt-6">
            {project.updates.length === 0 ? (
              <p className="text-center text-muted-foreground">No updates yet</p>
            ) : (
              <div className="space-y-6">{project.updates.map((update) => <PortalUpdate key={update.id} update={update} />)}</div>
            )}
          </TabsContent>
          <TabsContent value="files" className="mt-6">
            {project.files.length === 0 ? (
              <p className="text-center text-muted-foreground">No files shared yet</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{project.files.map((file) => <PortalFile key={file.id} file={file} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
