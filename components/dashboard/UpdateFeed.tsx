"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Update {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string;
  };
}

interface UpdateFeedProps {
  projectId: string;
  updates: Update[];
  canPost?: boolean;
}

export function UpdateFeed({ projectId, updates, canPost = true }: UpdateFeedProps) {
  const [newUpdate, setNewUpdate] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [localUpdates, setLocalUpdates] = useState(updates);

  const handlePost = async () => {
    if (!newUpdate.trim()) return;
    
    setIsPosting(true);
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          content: newUpdate,
        }),
      });
      
      if (res.ok) {
        const update = await res.json();
        setLocalUpdates([update, ...localUpdates]);
        setNewUpdate("");
      }
    } catch (error) {
      console.error("Failed to post update:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {canPost && (
        <div className="space-y-3">
          <Textarea
            placeholder="Share an update with your client..."
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            rows={3}
          />
          <Button onClick={handlePost} disabled={isPosting || !newUpdate.trim()}>
            {isPosting ? "Posting..." : "Post Update"}
          </Button>
        </div>
      )}
      
      <div className="space-y-4">
        {localUpdates.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No updates yet. Post your first update to keep your client informed.
          </p>
        ) : (
          localUpdates.map((update) => (
            <div key={update.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{update.author.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{update.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
