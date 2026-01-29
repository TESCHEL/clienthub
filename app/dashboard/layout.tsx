import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Settings, FolderKanban, Users, Home } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  // Get or create user in database
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    });
  }

  // Get user's organizations
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: dbUser.id },
    include: { organization: true },
  });

  // If no organization, create a default one
  if (memberships.length === 0) {
    const org = await prisma.organization.create({
      data: {
        name: `${user.firstName || "My"}'s Organization`,
        slug: `org-${userId.slice(-8)}`,
        members: {
          create: {
            userId: dbUser.id,
            role: "OWNER",
          },
        },
      },
    });
    memberships.push({
      id: "",
      role: "OWNER",
      userId: dbUser.id,
      organizationId: org.id,
      organization: org,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="text-xl font-bold">
            ClientHub
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <NavItem href="/dashboard" icon={Home}>
            Dashboard
          </NavItem>
          <NavItem href="/dashboard/projects" icon={FolderKanban}>
            Projects
          </NavItem>
          <NavItem href="/dashboard/clients" icon={Users}>
            Clients
          </NavItem>
          <NavItem href="/dashboard/settings" icon={Settings}>
            Settings
          </NavItem>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div />
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
