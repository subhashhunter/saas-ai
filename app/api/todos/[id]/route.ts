import prisma from "@/lib/primsa";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req:NextRequest,{params}:{params:{id:string}}){
    const {userId}=await auth();
    const todoId=params.id
    if(!userId){
        return NextResponse.json({
            message:"userId not found"
        },{status:401})
    }
    try {
        
        const todo=await prisma.todo.findUnique({
            where:{
                id:todoId
            }
        })
        if(!todo)
        {
            return NextResponse.json({
                message:"todo not found"
            },{status:401})
        }
        if(todo.userId!==userId)
        {
            return NextResponse.json({
                message:"userId has not this todo"
            },{status:401})
        }
        await prisma.todo.delete({
            where:{
                id:todoId
            }
        })
        return NextResponse.json({
            message:"todo deleted successfully"
        },{status:200})

    } catch (error) {
        console.error(error)
        return NextResponse.json({
            error:"internal server error while deleting the todo"
        },{status:500})
    }
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }){
    const {userId}=await auth();
    if(!userId){
        return NextResponse.json({
            message:"userId not found"
        },{status:401})
    }
    try {
        const {completed}=await req.json()
        const todoId= params.id
        const todo=await prisma.todo.findUnique({
            where:{
                id:todoId
            }
        })
        if(!todo)
        {
            return NextResponse.json({
                message:"todo not found"
            },{status:401})
        }
        if(todo.userId!==userId)
        {
            return NextResponse.json({
                message:"userId has not this todo"
            },{status:401})
        }
      const updatedTodo=await prisma.todo.update({
            where:{id:todoId},
            data:{completed:completed}
        })
        return NextResponse.json(updatedTodo)
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
    }
}