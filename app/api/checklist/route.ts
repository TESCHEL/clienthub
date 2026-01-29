import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, text, order } = await req.json();

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        client: {
          organization: {
            users: {
              some: { clerkId: userId },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const item = await prisma.checklistItem.create({
      data: {
        text,
        order: order ?? 0,
        projectId,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const { completed, text, order } = await req.json();

    // Verify user owns the item through project
    const existingItem = await prisma.checklistItem.findFirst({
      where: {
        id: itemId,
        project: {
          client: {
            organization: {
              users: {
                some: { clerkId: userId },
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(completed !== undefined && { completed }),
        ...(text !== undefined && { text }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    // Verify user owns the item through project
    const existingItem = await prisma.checklistItem.findFirst({
      where: {
        id: itemId,
        project: {
          client: {
            organization: {
              users: {
                some: { clerkId: userId },
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await prisma.checklistItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 }
    );
  }
}
