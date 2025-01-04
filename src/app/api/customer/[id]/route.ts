import { NextResponse,NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req:NextRequest){
    const {searchParams} = new URL(req.url)
    const id = searchParams.get('id')
    const customer = await prisma.customer.findFirst({
        where: {
            id: Number(id)
        }
    })
    if(!customer){
        return NextResponse.json({message:"could not Find user"},{status:404})
    }
    return NextResponse.json(customer)
}



export async function DELETE(req:NextRequest,{params}:{params:{id:string}}){
    const {id} = params
    const customer = await prisma.customer.delete({
        where: {
            id: Number(id)
        }
    })
    return NextResponse.json(customer)

}