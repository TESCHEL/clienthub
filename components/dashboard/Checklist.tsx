"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, TrashIcon } from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

interface ChecklistProps {
  projectId: string;
  items: ChecklistItem[];
  editable?: boolean;
}

export function Checklist({ projectId, items, editable = true }: ChecklistProps) {
  const [localItems, setLocalItems] = useState(items.sort((a, b) => a.order - b.order));
  const [newItemText, setNewItemText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;
    
    setIsAdding(true);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          text: newItemText,
          order: localItems.length,
        }),
      });
      
      if (res.ok) {
        const item = await res.json();
        setLocalItems([...localItems, item]);
        setNewItemText("");
      }
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (itemId: string, completed: boolean) => {
    // Optimistic update
    setLocalItems(
      localItems.map((item) =>
        item.id === itemId ? { ...item, completed } : item
      )
    );
    
    try {
      await fetch(`/api/checklist?id=${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
    } catch (error) {
      console.error("Failed to toggle item:", error);
      // Revert on error
      setLocalItems(
        localItems.map((item) =>
          item.id === itemId ? { ...item, completed: !completed } : item
        )
      );
    }
  };

  const handleDelete = async (itemId: string) => {
    const itemToDelete = localItems.find((i) => i.id === itemId);
    setLocalItems(localItems.filter((item) => item.id !== itemId));
    
    try {
      await fetch(`/api/checklist?id=${itemId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete item:", error);
      if (itemToDelete) {
        setLocalItems([...localItems, itemToDelete].sort((a, b) => a.order - b.order));
      }
    }
  };

  const completedCount = localItems.filter((i) => i.completed).length;
  const progress = localItems.length > 0 ? (completedCount / localItems.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {completedCount} of {localItems.length} completed
        </span>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="space-y-2">
        {localItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={(checked) => handleToggle(item.id, checked as boolean)}
            />
            <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
              {item.text}
            </span>
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                <TrashIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      {editable && (
        <div className="flex gap-2">
          <Input
            placeholder="Add a checklist item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddItem();
            }}
          />
          <Button onClick={handleAddItem} disabled={isAdding || !newItemText.trim()}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
