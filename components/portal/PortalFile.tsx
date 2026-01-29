import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatFileSize } from "@/lib/utils";
import { FileText, Image, Video, File, Download } from "lucide-react";

interface PortalFileProps {
  file: {
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
    createdAt: Date;
  };
}

export function PortalFile({ file }: PortalFileProps) {
  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return Image;
    if (mimeType.startsWith("video/")) return Video;
    if (mimeType.includes("pdf")) return FileText;
    return File;
  };

  const Icon = getIcon(file.mimeType);

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)} - {formatDate(file.createdAt)}
          </p>
        </div>
        <Button variant="ghost" size="icon" asChild>
          <a href={file.url} download>
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
