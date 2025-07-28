import prisma from "@/lib/primsa";
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay";
var razorpay=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID!,
    key_secret:process.env.RAZORPAY_KEY_SECRET!
})

export async function POST(req:NextRequest){
    try {
        const {userId}=await auth();
    if(!userId)
    {
        return NextResponse.json({error:"user is not authorised"},{status:401})
    }
    const order=await razorpay.orders.create({
        amount:100,
        currency:"INR",
        receipt:`receipt_${Date.now()}`,
        notes:{
            userId
        }
    })
    await prisma.order.create({
        data:{
            id:order.id,
            amount:100,
            userId,
            status:"created"
        }
    })
    return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
    })
    } catch (error) {
       console.log(error)
       return NextResponse.json({error:"error while creating order"},{status:404}) 
    }

}