import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { FileText, MessageSquare, Clock } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    status: string;
    updatedAt: Date;
    client: { name: string };
    _count: { updates: number; files: number; approvals: number };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    ACTIVE: "default",
    ON_HOLD: "secondary",
    COMPLETED: "outline",
    ARCHIVED: "secondary",
  } as const;

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge variant={statusColors[project.status as keyof typeof statusColors] || "default"}>
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{project.client.name}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {project._count.updates} updates
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {project._count.files} files
            </div>
            {project._count.approvals > 0 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Clock className="h-4 w-4" />
                {project._count.approvals} pending
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Updated {formatDate(project.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
