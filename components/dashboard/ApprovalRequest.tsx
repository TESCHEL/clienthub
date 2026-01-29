"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Approval {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  respondedAt: Date | null;
}

interface ApprovalRequestProps {
  projectId: string;
  approvals: Approval[];
}

export function ApprovalRequest({ projectId, approvals }: ApprovalRequestProps) {
  const [localApprovals, setLocalApprovals] = useState(approvals);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    setIsCreating(true);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title,
          description: description || null,
        }),
      });
      
      if (res.ok) {
        const approval = await res.json();
        setLocalApprovals([approval, ...localApprovals]);
        setTitle("");
        setDescription("");
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to create approval request:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: Approval["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          Request Approval
        </Button>
      ) : (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Homepage Design V2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what you need approved..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={isCreating || !title.trim()}>
              {isCreating ? "Creating..." : "Create Request"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {localApprovals.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No approval requests yet.
          </p>
        ) : (
          localApprovals.map((approval) => (
            <div key={approval.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{approval.title}</h4>
                {getStatusBadge(approval.status)}
              </div>
              {approval.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {approval.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Created {formatDistanceToNow(new Date(approval.createdAt), { addSuffix: true })}
                {approval.respondedAt && (
                  <> • Responded {formatDistanceToNow(new Date(approval.respondedAt), { addSuffix: true })}</>
                )}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
