import prisma from "@/lib/primsa";
import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { headers } from "next/headers";
import { Webhook } from "svix";
export async function POST(req:Request){
    const WEBHOOK_SECRET=process.env.WEBHOOK_SECRET
    if(!WEBHOOK_SECRET)
    {
        throw new Error("enter webhooksecret")

    }
    const headerPayload=await headers()
    const svix_id= headerPayload.get("svix-id")
    const svix_timestamp=headerPayload.get("svix-timestamp")
    const svix_signature=headerPayload.get("svix-signature")
    if(!svix_id || !svix_signature || !svix_timestamp)
    {
        return Response.json("error occured no svix header")
    }
    const payload=await req.json()
    const body=JSON.stringify(payload)
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt:WebhookEvent
    try {
       evt= wh.verify(body,{
          "svix-id":svix_id,
            "svix-timestamp":svix_timestamp,
            "svix-signature":svix_signature
        }) as WebhookEvent
        console.log(evt);
    }  catch (error) {
        console.error(error,"error verifying webhook")
        return new Response("Error occured",{status:400})
    }

    const {id}=evt.data
    const eventType=evt.type

    if(eventType==="user.created")
    {
        try {
            const { email_addresses,primary_email_address_id}=evt.data
            const primaryEmail = email_addresses.find(email => email.id === primary_email_address_id);
            if (!primaryEmail) {
                console.error("No primary email found");
                return new Response("No primary email found", { status: 400 });
              }
           const newuser=await prisma.user.create({
                data:{
                   id: evt.data.id!,
                   email:primaryEmail?.email_address!,
                   isSubscribed:false, 
                }
            })
            console.log("new user created")
        } catch (error) {
            console.error("Error creating user in database:", error);
            return new Response("Error creating user", { status: 500 });
        }
    }
    return new Response("Webhook received successfully", { status: 200 });

}