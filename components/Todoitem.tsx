import { Todo } from "@prisma/client";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, Trash2, XCircle } from "lucide-react";

interface TodoitemProps{
    todo:Todo,
    isAdmin?:boolean
    onupdate:(id:string,completed:boolean)=>void
    ondelete:(id:string)=>void
}
export default function Todoitem({todo,isAdmin=false,
    onupdate,
    ondelete,
  }:TodoitemProps){
    const [iscompleted,setIscompleted]=useState(todo.completed)
    const toggleComplete=async()=>{
        const newcompletedstate=!iscompleted
        setIscompleted(newcompletedstate)
        onupdate(todo.id,newcompletedstate)
    }
    return (
        <Card>
            <CardContent className="flex items-center justify-between">
                <span>{todo.title}</span>
                <div className="space-x-2 flex items-center">
                <Button onClick={toggleComplete}>
                    {iscompleted ? (
                  <XCircle className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
               )}
               {iscompleted?"Undo":"complete"}
                </Button>
                <Button
                variant="destructive"
                 onClick={()=>{
                    ondelete(todo.id)
                }}>
                <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>
                {isAdmin && (
            <span className="ml-2 text-sm text-muted-foreground">
              User ID: {todo.userId}
            </span>
          )}
                </div>

            </CardContent>
        </Card>
    )
}