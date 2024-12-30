// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'node:stream'
import formidable, { Fields, Files } from 'formidable'
import fs from 'node:fs/promises'
import path from 'node:path'
// import { useuploadThing } from '@/lib/uploadthing'
import prisma from '@/lib/prisma'
// 1. Node runtime
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // const {} = useuploadThing("ImageUploader")
  try {
    // (A) Convert Web ReadableStream -> Node Readable
    const webStream = req.body
    if (!webStream) {
      return NextResponse.json({ error: 'No request body found' }, { status: 400 })
    }
    const nodeStream = Readable.fromWeb(webStream)

    // (B) Attach the headers that Formidable expects
    const contentType = req.headers.get('content-type') || ''
    const contentLength = req.headers.get('content-length') || '0'
    ;(nodeStream as any).headers = {
      'content-type': contentType,
      'content-length': contentLength,
    }

    // (C) Optional: create an upload dir if you want to store files locally
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    // (D) Initialize formidable
    const form = formidable({
      // multiples: false,       
      multiples:true, //changed for the sake of null object recieved error
      uploadDir,              // directory where files will be saved
      keepExtensions: true,   // keep file extension
      maxFileSize: 10_000_000 // e.g. 10MB
    })

    // (E) Parse the Node stream with Formidable
    const { fields, files } = await new Promise<{ fields: Fields; files: Files }>(
      (resolve, reject) => {
        form.parse(nodeStream as any, (err, fields, files) => {
          if (err) reject(err)
          else resolve({ fields, files })
        })
      }
    )

    // (F) Access the uploaded file
    const fileData = files.file
    if (!fileData) {
      return NextResponse.json({ error: 'No file field found' }, { status: 400 })
    }

    const uploadedFile = Array.isArray(fileData) ? fileData[0] : fileData
const { filepath } = uploadedFile

    // If multiples is false, fileData should be a single File object
    // const {filepath} = fileData[0]
    // console.log(filepath)
    console.log('Fields:', fields)
    console.log('Files:', fileData)
//  const customerId = 420
const [customerIdString] = fields.customerId as string[]
const customerId = parseInt(customerIdString, 10)
// mostly the error was coming as we did not create cutomer before creating the file record
// await prisma.customer.create({
//   data: {
//     email: 'some@example2.com',
//     name: 'SomeXName',
//     // If your model is `id Int @id @default(autoincrement())`, 
//     // Prisma will assign an ID automatically (1,2,3...) 
//     // so it might not be exactly 123.
//   },
// })

// const customerId = parseInt(fields.customerId as string, 10)
  const filerecord =await prisma.file.create({
    data:{
      filePath:'/uploads/'+path.basename(filepath),
      customerId:customerId
    }
  })
    // Return success response
    return NextResponse.json({ message: 'File uploaded successfully',file:filerecord })
  } catch (err: unknown) {
    console.error('Upload error:', err)
  
    // Make sure NextResponse.json() only receives a string or simple object
    let errorMessage = 'Unknown error'
    if (err instanceof Error) {
      errorMessage = err.message || 'Unknown error'
    } else if (typeof err === 'string') {
      errorMessage = err
    }
  
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
