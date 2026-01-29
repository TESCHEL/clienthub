import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs";

const f = createUploadthing();

export const uploadRouter = {
  projectFile: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    "application/zip": { maxFileSize: "64MB", maxFileCount: 5 },
    "application/x-zip-compressed": { maxFileSize: "64MB", maxFileCount: 5 },
    video: { maxFileSize: "256MB", maxFileCount: 2 },
  })
    .middleware(async () => {
      const { userId } = auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
