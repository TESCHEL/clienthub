"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadButton } from "@uploadthing/react";
import { formatDistanceToNow } from "date-fns";
import { FileIcon, DownloadIcon, TrashIcon } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  createdAt: Date;
}

interface FileListProps {
  projectId: string;
  files: FileItem[];
  canUpload?: boolean;
  canDelete?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function FileList({ projectId, files, canUpload = true, canDelete = true }: FileListProps) {
  const [localFiles, setLocalFiles] = useState(files);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (fileId: string) => {
    setIsDeleting(fileId);
    try {
      const res = await fetch(`/api/files?id=${fileId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setLocalFiles(localFiles.filter((f) => f.id !== fileId));
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {canUpload && (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <UploadButton
            endpoint="projectFile"
            input={{ projectId }}
            onClientUploadComplete={(res) => {
              if (res) {
                const newFiles = res.map((file) => ({
                  id: file.key,
                  name: file.name,
                  url: file.url,
                  size: file.size,
                  createdAt: new Date(),
                }));
                setLocalFiles([...newFiles, ...localFiles]);
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
            }}
          />
        </div>
      )}
      
      <div className="space-y-2">
        {localFiles.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No files uploaded yet.
          </p>
        ) : (
          localFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href={file.url} download>
                    <DownloadIcon className="h-4 w-4" />
                  </a>
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    disabled={isDeleting === file.id}
                  >
                    <TrashIcon className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
