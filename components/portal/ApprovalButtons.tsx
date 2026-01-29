"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, MessageSquare } from "lucide-react";

interface ApprovalButtonsProps {
  approvalId: string;
}

export function ApprovalButtons({ approvalId }: ApprovalButtonsProps) {
  const router = useRouter();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function respond(status: string) {
    setLoading(true);
    await fetch("/api/approvals/" + approvalId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, feedback: feedback || undefined }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3">
      {showFeedback && (
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Add feedback (optional)..."
          className="text-sm"
        />
      )}
      <div className="flex gap-2">
        <Button onClick={() => respond("APPROVED")} disabled={loading} className="flex-1">
          <Check className="mr-2 h-4 w-4" /> Approve
        </Button>
        <Button onClick={() => respond("REJECTED")} variant="destructive" disabled={loading} className="flex-1">
          <X className="mr-2 h-4 w-4" /> Reject
        </Button>
        <Button onClick={() => setShowFeedback(!showFeedback)} variant="outline" size="icon">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
