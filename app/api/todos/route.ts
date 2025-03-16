import prisma from "@/lib/primsa";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
const ITEM_PER_PAGE=10
export async function GET(req:NextRequest){
   const { userId } = await auth();
      if(!userId){
          return NextResponse.json({error:"unauthorisied"},{status:401})
      }
      const {searchParams}=new URL(req.url)
      const page=parseInt(searchParams.get("page") || "1")
      const search=searchParams.get("search") || ""
      try {
       const todos= await prisma.todo.findMany({
            where:{
                userId,
                title:{
                    contains:search,
                    mode:"insensitive"
                }
            },
            orderBy:{createdAT:"desc"},
            take:ITEM_PER_PAGE,
            skip:(page-1)*ITEM_PER_PAGE
        })
        const totalItems=await prisma.todo.count({
            where:{
                userId,
                title:{
                    contains:"search",
                    mode:"insensitive"
                }
            }
        })
        
        const totalPages=Math.ceil(totalItems/ITEM_PER_PAGE)
        return NextResponse.json({
            todos,
            currentPage:page,
            totalPages
        })
      } catch (error) {
        console.error("error while finding todos",error)
        return NextResponse.json({
            error:"error fetching todos"
        },{status:500})
      }

}
export async function POST(req:Request){
    const {userId}=await auth()
    if(!userId){
        return Response.json({
            message:"unauthorisied"
        },{status:400})
    }
  const user=await prisma.user.findUnique({
        where:{
            id:userId
        },
        include:{
            todos:true
        }
    })
    console.log("User",user)
    if(!user)
    {
        return NextResponse.json({message:"user not found"},{status:404})
    }
    try {
        if(!user.isSubscribed && user.todos.length>=3)
        {
            return NextResponse.json({mesaage:"subscribire to create more todos"},{status:403})
        }
        const {title}=await req.json();
        const newtodos=await prisma.todo.create({
            data:{
                title:title,
                userId:userId
            }
        })
        return NextResponse.json(newtodos,{status:200})
    } catch (error) {
        console.error("error while creating todos",error)
        return NextResponse.json({
            error:"internal server error"
        },{status:500})
      }
}