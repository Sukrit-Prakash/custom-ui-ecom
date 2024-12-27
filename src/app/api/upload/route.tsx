import { NextApiHandler,NextApiRequest,NextApiResponse } from 'next';
import fs from'fs'
import formidable,{Fields,Files} from 'formidable'
// import {File as FormidableFile} from 'formidable'
import path from 'path';
import { Recursive } from 'next/font/google';

const uploadDir = path.join(process.cwd(),'/public/uploads')


if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true})
}
const handler = (req:NextApiRequest,res:NextApiResponse)=>{
    const form = formidable({
        uploadDir:uploadDir,
        multiples:false,
        keepExtensions:true
    });
    try {
        form.parse(req,async(err:any,feilds:Fields,files:Files)=>{
            if(err){
                console.error('Error',err)
                return res.status(500).json({message:'File upload error'})
            }
            const file = files.file
            if(!file)
                return res.status(400).json({message:'file is not present'})
    
            const filepath = file.filepath
            // suppose if you get the fucking filepath
    
            return res.status(200).json({
                message:'File uploaded successfully',
                filepath:'/uploads/'+path.basename(filepath)
            })
        })
    } catch (error) {
        return res.status(200).json({message:'server error'})
    }
}

export default handler

// options.filename {function} - default undefined 
// Use it to control newFilename.
//  Must return a string. Will be joined with options.
//  uploadDir.
// options.maxFiles {number} - default Infinity;
//  limit the amount of uploaded files,
//   set Infinity for unlimited


// When TypeScript says it “could not find a declaration file for module 
// 'formidable',” it means there are no built-in type definitions for that
//  library in your current setup
// npm install --save-dev @types/formidable