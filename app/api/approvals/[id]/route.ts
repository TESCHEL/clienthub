import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateApprovalSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CHANGES_REQUESTED"]),
  feedback: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const data = updateApprovalSchema.parse(body);

    const approval = await prisma.approval.findUnique({
      where: { id: params.id },
    });

    if (!approval) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    if (approval.status !== "PENDING") {
      return NextResponse.json(
        { error: "Approval already responded to" },
        { status: 400 }
      );
    }

    const updated = await prisma.approval.update({
      where: { id: params.id },
      data: {
        ...data,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating approval:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
