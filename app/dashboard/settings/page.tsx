import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { BillingSection } from "@/components/dashboard/BillingSection";

export default async function SettingsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: {
        include: {
          organization: {
            include: {
              subscription: true,
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
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings and billing
        </p>
      </div>

      <SettingsForm organization={organization} />

      <BillingSection
        organization={organization}
        subscription={organization.subscription}
      />
    </div>
  );
}
