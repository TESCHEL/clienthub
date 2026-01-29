import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateTime, getInitials } from "@/lib/utils";

interface PortalUpdateProps {
  update: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    author: { firstName: string | null; lastName: string | null; imageUrl: string | null };
  };
}

export function PortalUpdate({ update }: PortalUpdateProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={update.author.imageUrl || undefined} />
            <AvatarFallback>
              {getInitials((update.author.firstName || "") + " " + (update.author.lastName || ""))}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{update.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {update.author.firstName} {update.author.lastName} - {formatDateTime(update.createdAt)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{update.content}</p>
      </CardContent>
    </Card>
  );
}
