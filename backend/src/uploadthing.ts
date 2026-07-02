// backend/src/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter: FileRouter = {
  receiptUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  })
  .onUploadComplete(async ({ metadata, file }) => {
    console.log("Receipt upload completed:", file.name, file.url);
    return {
      fileUrl: file.url,
      fileName: file.name,
      fileSize: file.size
    };
  }),
  priceListUploader: f({
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", maxFileCount: 1 }
  })
  .onUploadComplete(async ({ metadata, file }) => {
    console.log("Price list upload completed:", file.name, file.url);
    return {
      fileUrl: file.url,
      fileName: file.name,
      fileSize: file.size
    };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
