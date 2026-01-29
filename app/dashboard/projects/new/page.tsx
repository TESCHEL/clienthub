import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewProjectForm } from "@/components/dashboard/NewProjectForm";

export default async function NewProjectPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: {
        include: {
          organization: {
            include: {
              clients: true,
            },
          },
        },
      },
    },
  });

  if (!dbUser) redirect("/sign-in");

  const organization = dbUser.organizations[0]?.organization;
  if (!organization) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Project</h1>
        <p className="text-muted-foreground">
          Create a new project to track work for a client
        </p>
      </div>

      <NewProjectForm
        organizationId={organization.id}
        clients={organization.clients}
      />
    </div>
  );
}
