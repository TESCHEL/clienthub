import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createApprovalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string(),
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createApprovalSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organizations: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const hasAccess = dbUser.organizations.some(
      (m) => m.organizationId === project.organizationId
    );

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const approval = await prisma.approval.create({
      data: {
        ...data,
        requestedById: dbUser.id,
      },
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating approval:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
