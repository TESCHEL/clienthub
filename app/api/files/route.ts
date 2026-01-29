import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createFileSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  key: z.string(),
  size: z.number(),
  mimeType: z.string(),
  projectId: z.string(),
  updateId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createFileSchema.parse(body);

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

    const file = await prisma.file.create({
      data: {
        ...data,
        uploaderId: dbUser.id,
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
