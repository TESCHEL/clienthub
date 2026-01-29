import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: {
        include: {
          organization: {
            include: {
              projects: {
                include: {
                  client: true,
                  _count: {
                    select: {
                      updates: true,
                      files: true,
                      approvals: { where: { status: "PENDING" } },
                    },
                  },
                },
                orderBy: { updatedAt: "desc" },
                take: 10,
              },
            },
          },
        },
      },
    },
  });

  if (!dbUser) redirect("/sign-in");

  const projects = dbUser.organizations.flatMap(
    (m) => m.organization.projects
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here are your recent projects.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first project to get started
          </p>
          <Link href="/dashboard/projects/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
