import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); 
import { z } from 'zod';
const{getUser}=getKindeServerSession();


export const ourFileRouter = {

  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({configId: z.string().optional()}))
    .middleware(async ({input}) => {
      return {input}

    })
    .onUploadComplete(async ({ metadata, file }) => {
    const {configId}=metadata.input
      return { configId};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
