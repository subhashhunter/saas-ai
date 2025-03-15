import { useState } from "react";
import { Button } from "./ui/button";

interface TodoformProps{
    onsubmit:(title:string)=>void
}
export function Todoform({onsubmit}:TodoformProps){
  const [title,setTitle]=useState("")
  const handlesubmit=(e:React.FormEvent)=>{
    e.preventDefault()
    if(title.trim())
    {
        onsubmit(title.trim())
        setTitle("")
    }
  }
  return(
    <form onSubmit={handlesubmit}>
         <input type="text"
        value={title} 
        onChange={(e)=>{
            setTitle(e.target.value)
        }}
        placeholder="enter a new todo"
        className="flex-grow"
        required
        />
        <Button type="submit">
            Add Todo
        </Button>
    </form>
  )

}