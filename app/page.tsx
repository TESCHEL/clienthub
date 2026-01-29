import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, FileText, Bell } from "lucide-react";

export default async function HomePage() {
  const { userId } = auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            ClientHub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-1 flex-col items-center justify-center gap-8 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Professional Client Management
          <br />
          <span className="text-muted-foreground">Made Simple</span>
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground">
          Streamline your client relationships with progress updates, file
          sharing, and approval workflows. Keep clients in the loop without the
          endless email chains.
        </p>
        <div className="flex gap-4">
          <Link href="/sign-up">
            <Button size="lg">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/50 py-24">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need to manage clients
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Users}
              title="Client Portal"
              description="Give clients their own branded portal to track progress and approve deliverables."
            />
            <FeatureCard
              icon={Bell}
              title="Progress Updates"
              description="Keep clients informed with rich updates, images, and attachments."
            />
            <FeatureCard
              icon={FileText}
              title="File Sharing"
              description="Securely share files and collect feedback in one place."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Approvals"
              description="Streamline approval workflows with one-click approvals and change requests."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ClientHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Icon className="mb-4 h-10 w-10 text-primary" />
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
