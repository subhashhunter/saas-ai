'use client'
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SubscribePage(){
    const {toast}=useToast();
    const router=useRouter();
    const[isLoading,setIsLoading]=useState(false)
    const[isSubscribed,setIsSubscribed]=useState(false)
    const[subscriptionEnds,setSubscriptionEnds]=useState<string | null>(null)
    const fetchSubscriptionStatus = async () => {
       try {
        setIsLoading(true)
        const response = await fetch("/api/subscription");
        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.isSubscribed);
          setSubscriptionEnds(data.subscriptionEnds)
        }
        else
        {
            throw new Error("failed to fetch subscription details")
        }
       } catch (error) {
        toast({
            title: "Error",
            description: "Failed to fetch subscription status. Please try again.",
            variant: "destructive",
          });
       }
       finally{
        setIsLoading(false)
       }
       fetchSubscriptionStatus();
      };
      const handleSubscribe=async()=>{
        try {
            const response=await fetch('/api/subscription',{
                method:"POST"
            })
            if(response.ok)
            {
                const data=await response.json()
                setIsSubscribed(true)
                setSubscriptionEnds(data.subscriptionEnds)
                router.refresh();

                toast({
                    title: "Success",
                    description: "You have successfully subscribed!",
                  });
            }
            else
            {
                throw new Error("error while subscribing")
            }
            
        } catch (error) {
            toast({
                title: "Error",
                description:
                  error instanceof Error
                    ? error.message
                    : "An error occurred while subscribing. Please try again.",
                variant: "destructive",
              });
        }
      }
      if (isLoading) {
        return <div className="flex justify-center items-center">Loading...</div>;
      }
      return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1>Subscription</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Your subscription status</CardTitle>
                </CardHeader>
                <CardContent>
                    {isSubscribed ?(
                        <Alert>
                             <CheckCircle className="h-4 w-4" />
                             <AlertDescription>
                                you are a subscribed user.subscription ends on{" "}
                                {new Date(subscriptionEnds!).toLocaleDateString()}
                             </AlertDescription>
                        </Alert>
                    ):(
                        <div>
                             <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                            You are not currently subscribed. Subscribe now to unlock all
                            features!
                            </AlertDescription>
                        </Alert>
                        <Button onClick={handleSubscribe}>
                            Subscribe now
                        </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      )
}