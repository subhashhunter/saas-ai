import { clerkClient } from "@clerk/clerk-sdk-node";

async function Isadmin(userId:string){
    const user=await clerkClient.users.getUser(userId)
    return user.privateMetadata.role==="admin"
}