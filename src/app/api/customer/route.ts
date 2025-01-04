// app/api/customer/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    const customers = await prisma.customer.findMany()
    return NextResponse.json(customers)
}


export async function POST(req:Request){
    const body  = await req.json()
    const {name,email} = body
    const newcustomer =  await prisma.customer.create({
        data: {
            name,
            email
        }
    })
    return NextResponse.json(newcustomer)
}



