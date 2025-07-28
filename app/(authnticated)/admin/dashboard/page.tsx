'use client';

import Todoitem from "@/components/Todoitem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Todo, User } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

interface UserWithTodo extends User{
    Todos:Todo[]
}
export default function AdminDashboard(){

    const {toast}=useToast();
    const[loading,setLoading]=useState(false)
    const[email,setEmail]=useState("");
    const [debouncedEmail, setDebouncedEmail] = useDebounceValue("",3000);
    const[user,setUser]=useState<UserWithTodo | null>(null);
    const[totalPages,setTotalPages]=useState(1);
    const[currentPage,setCurrentPage]=useState(1);

    const fetchUserData=useCallback(async(page:Number)=>{
        setLoading(false);
        try {
            const response=await fetch(`/api/admin/email=${debouncedEmail} & page=${page}`)
        if(!response.ok)
        {
            throw new Error("error while fetching user details")
        }
        const data=await response.json();
        setUser(data.user);
        setTotalPages(data.totalPages)
        setCurrentPage(data.currentPage)
        toast({
            title: "Success",
            description: "User data fetched successfully.",
          });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch user data. Please try again.",
                variant: "destructive",
              }); 
        }
        finally {
            setLoading(false);
          }
    },[debouncedEmail,toast])

    useEffect(()=>{
        if(debouncedEmail)
        {
            fetchUserData(1);
        }
    },[debouncedEmail,fetchUserData])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setDebouncedEmail(email);
      };

    const updateSubscription=async()=>{
      try {
        const res=  await fetch('/api/admin',{
            method:"PUT",
            headers:{ "Content-Type": "application/json" },
            body:JSON.stringify({
                email:debouncedEmail,
                isSubscribed: !user?.isSubscribed,
            })
        })
        if(!res.ok){
            throw new Error("error while updation of subscription")
        }
        fetchUserData(currentPage);
        toast({
            title: "Success",
            description: "Subscription updated successfully.",
          });
      } catch (error) {
        toast({
            title: "Error",
            description: "Failed to update subscription. Please try again.",
            variant: "destructive",
          });
      }
    }
    const handleUpdateTodo=async(id:string,completed:boolean)=>{
        toast({
            title: "Updating Todo",
            description: "Please wait...",
          });

        try {
        const response=await fetch("api/admin",{
                method:"PUT",
                headers:{ "Content-Type": "application/json" },
                body:JSON.stringify({
                    todoId:id,
                    todoCompleted:completed
                })
            })
            if(!response.ok)
            {
                throw new Error("failed toupdate todo")
            }
            fetchUserData(currentPage)
            toast({ title: "Success", description: "Todo updated successfully." });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update todo. Please try again.",
                variant: "destructive",
              });
        }
    }

    const handleDeleteTodo=async(id:string)=>{
        try {
            const response=await fetch("/api/admin",{
                method:"DELETE",
                headers:{ "Content-Type": "application/json" },
                body:JSON.stringify({
                    todoId:id
                })
            })
            if (!response.ok) throw new Error("Failed to delete todo");
            fetchUserData(currentPage);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete todo. Please try again.",
                variant: "destructive",
              });
        }
    }

    return(
        <div className="container mx-auto p-4 max-w-3xl mb-8">
            <h1 className="text-center text-3xl font-bold mb-8">
                Admin Dashboard
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>
                        search user
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex space-x-2">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter user email"
                        required
                    />
                    <Button type="submit">Search</Button>
                    </form>
                </CardContent>
            </Card>
            {loading?(
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">loading user data...</p>
                    </CardContent>
                </Card>
            ):user?(
                <>
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>user details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Email:{user?.email}</p>
                        <p>
                            Subscription status
                            {user?.isSubscribed?"subscribed":"not subscribed"}
                        </p>
                        {user.subscriptionEnds &&(
                            <p>
                                Subscription Ends{""}
                                {new Date(user.subscriptionEnds).toLocaleDateString()}
                            </p>
                        )}
                        <Button onClick={updateSubscription}>
                            {user.isSubscribed?"cancel subscription":"subscribe"}
                        </Button>
                    </CardContent>
                </Card>
                {user.Todos.length>0 ?(
                    <Card>
                        <CardHeader>
                            <CardTitle>User todo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.Todos.map((todo)=>(
                                <ul className="space-y-4">
                                    <Todoitem
                                key={todo.id}
                                todo={todo}
                                ondelete={handleDeleteTodo}
                                onupdate={handleUpdateTodo}/>
                                </ul>
                            ))}
                        </CardContent>
                    </Card>
                ):(
                    <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">This user has no todos.</p>
                    </CardContent>
                  </Card>
                )}
                </>
            ):debouncedEmail?(
                <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No user found with this email.
            </p>
          </CardContent>
        </Card> 
            ):null}
        </div>
    )
}